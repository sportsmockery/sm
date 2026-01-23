import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { VoteInput, Poll, PollResults, PollOptionResult } from '@/types/polls'
import { getRandomMicrocopy } from '@/types/polls'
import crypto from 'crypto'

/**
 * POST /api/polls/[id]/vote
 * Submit a vote for a poll
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: VoteInput = await request.json()
    const { option_ids, user_id, anonymous_id } = body

    // Validate input
    if (!option_ids || option_ids.length === 0) {
      return NextResponse.json(
        { error: 'At least one option ID is required' },
        { status: 400 }
      )
    }

    if (!anonymous_id && !user_id) {
      return NextResponse.json(
        { error: 'Anonymous ID or User ID is required' },
        { status: 400 }
      )
    }

    // Fetch poll to check status and settings
    const { data: poll, error: pollError } = await supabaseAdmin
      .from('sm_polls')
      .select(`
        *,
        options:sm_poll_options(*)
      `)
      .eq('id', id)
      .single()

    if (pollError || !poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }

    // Check if poll is active
    if (poll.status !== 'active') {
      return NextResponse.json(
        { error: 'Poll is not active' },
        { status: 400 }
      )
    }

    // Check if poll has started
    if (poll.starts_at && new Date(poll.starts_at) > new Date()) {
      return NextResponse.json(
        { error: 'Poll has not started yet' },
        { status: 400 }
      )
    }

    // Check if poll has ended
    if (poll.ends_at && new Date(poll.ends_at) < new Date()) {
      return NextResponse.json(
        { error: 'Poll has ended' },
        { status: 400 }
      )
    }

    // Generate IP hash for duplicate detection
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    const ipHash = crypto.createHash('sha256').update(ip + id).digest('hex')

    // Check for existing vote (by user_id, anonymous_id, or ip_hash)
    let existingVoteQuery = supabaseAdmin
      .from('sm_poll_responses')
      .select('id')
      .eq('poll_id', id)

    if (user_id) {
      existingVoteQuery = existingVoteQuery.eq('user_id', user_id)
    } else if (anonymous_id) {
      existingVoteQuery = existingVoteQuery.or(`anonymous_id.eq.${anonymous_id},ip_hash.eq.${ipHash}`)
    }

    const { data: existingVote } = await existingVoteQuery.maybeSingle()

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted on this poll' },
        { status: 400 }
      )
    }

    // Validate option IDs belong to this poll
    const validOptionIds = poll.options.map((opt: any) => opt.id)
    const invalidOptions = option_ids.filter(optId => !validOptionIds.includes(optId))
    if (invalidOptions.length > 0) {
      return NextResponse.json(
        { error: 'Invalid option ID(s)' },
        { status: 400 }
      )
    }

    // Handle single vs multiple choice
    let finalOptionIds = option_ids
    if (!poll.is_multi_select && option_ids.length > 1) {
      // For single choice, only take first option
      finalOptionIds = [option_ids[0]]
    }

    // Create vote records
    const voteRecords = finalOptionIds.map(optId => ({
      poll_id: id,
      option_id: optId,
      user_id: user_id || null,
      anonymous_id: user_id ? null : anonymous_id,
      ip_hash: ipHash,
    }))

    const { error: voteError } = await supabaseAdmin
      .from('sm_poll_responses')
      .insert(voteRecords)

    if (voteError) {
      console.error('Error recording vote:', voteError)
      return NextResponse.json(
        { error: 'Failed to record vote' },
        { status: 500 }
      )
    }

    // Update vote counts on options
    for (const optId of finalOptionIds) {
      const { data: currentOption } = await supabaseAdmin
        .from('sm_poll_options')
        .select('vote_count')
        .eq('id', optId)
        .single()

      if (currentOption) {
        await supabaseAdmin
          .from('sm_poll_options')
          .update({ vote_count: (currentOption.vote_count || 0) + 1 })
          .eq('id', optId)
      }
    }

    // Update total votes on poll (count unique voters, not total options selected)
    await supabaseAdmin
      .from('sm_polls')
      .update({ total_votes: (poll.total_votes || 0) + 1 })
      .eq('id', id)

    // Fetch updated poll with results
    const { data: updatedPoll } = await supabaseAdmin
      .from('sm_polls')
      .select(`
        *,
        options:sm_poll_options(*)
      `)
      .eq('id', id)
      .single()

    // Sort options
    if (updatedPoll?.options) {
      updatedPoll.options.sort((a: any, b: any) => a.display_order - b.display_order)
    }

    // Calculate percentages
    const totalVotes = updatedPoll?.total_votes || 0
    const optionResults: PollOptionResult[] = (updatedPoll?.options || []).map((opt: any) => ({
      id: opt.id,
      option_text: opt.option_text,
      option_image: opt.option_image,
      team_tag: opt.team_tag,
      emoji: opt.emoji,
      vote_count: opt.vote_count || 0,
      percentage: totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0,
    }))

    const results: PollResults = {
      poll: updatedPoll as Poll,
      total_votes: totalVotes,
      options: optionResults,
      user_voted: true,
      user_votes: finalOptionIds,
    }

    return NextResponse.json({
      success: true,
      message: getRandomMicrocopy('voted'),
      results,
    })
  } catch (error) {
    console.error('Error voting:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/polls/[id]/vote
 * Check if user has voted on this poll
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const anonymousId = searchParams.get('anonymous_id')

    if (!userId && !anonymousId) {
      return NextResponse.json(
        { error: 'User ID or Anonymous ID is required' },
        { status: 400 }
      )
    }

    // Generate IP hash
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    const ipHash = crypto.createHash('sha256').update(ip + id).digest('hex')

    let query = supabaseAdmin
      .from('sm_poll_responses')
      .select('option_id')
      .eq('poll_id', id)

    if (userId) {
      query = query.eq('user_id', userId)
    } else {
      query = query.or(`anonymous_id.eq.${anonymousId},ip_hash.eq.${ipHash}`)
    }

    const { data: votes } = await query

    return NextResponse.json({
      has_voted: votes && votes.length > 0,
      voted_options: votes?.map(v => v.option_id) || [],
    })
  } catch (error) {
    console.error('Error checking vote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
