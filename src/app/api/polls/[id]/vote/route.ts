import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

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
    const body = await request.json()
    const { optionId, optionIds, anonymousId, userId } = body

    // Validate input
    if (!optionId && (!optionIds || optionIds.length === 0)) {
      return NextResponse.json(
        { error: 'Option ID is required' },
        { status: 400 }
      )
    }

    if (!anonymousId && !userId) {
      return NextResponse.json(
        { error: 'Anonymous ID or User ID is required' },
        { status: 400 }
      )
    }

    // Fetch poll to check status
    const { data: poll, error: pollError } = await supabase
      .from('sm_polls')
      .select('*')
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

    // Check if poll has ended
    if (poll.ends_at && new Date(poll.ends_at) < new Date()) {
      return NextResponse.json(
        { error: 'Poll has ended' },
        { status: 400 }
      )
    }

    // Check for existing vote
    const voteQuery = supabase
      .from('sm_poll_votes')
      .select('id')
      .eq('poll_id', id)

    if (userId) {
      voteQuery.eq('user_id', userId)
    } else {
      voteQuery.eq('anonymous_id', anonymousId)
    }

    const { data: existingVote } = await voteQuery.single()

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted on this poll' },
        { status: 400 }
      )
    }

    // Handle single or multiple choice
    const selectedOptions = optionIds || [optionId]

    // For single choice, only take first option
    const finalOptions = poll.poll_type === 'single'
      ? [selectedOptions[0]]
      : selectedOptions

    // Create vote records
    const voteRecords = finalOptions.map((optId: number) => ({
      poll_id: parseInt(id),
      option_id: optId,
      user_id: userId || null,
      anonymous_id: userId ? null : anonymousId,
    }))

    const { error: voteError } = await supabase
      .from('sm_poll_votes')
      .insert(voteRecords)

    if (voteError) {
      console.error('Error recording vote:', voteError)
      return NextResponse.json(
        { error: 'Failed to record vote' },
        { status: 500 }
      )
    }

    // Update vote counts
    for (const optId of finalOptions) {
      // Try RPC first, fallback to direct update
      const { error: rpcError } = await supabase.rpc('increment_poll_vote', {
        option_id_param: optId
      })

      if (rpcError) {
        // Fallback: Direct update if RPC doesn't exist
        const { data: currentOption } = await supabase
          .from('sm_poll_options')
          .select('vote_count')
          .eq('id', optId)
          .single()

        if (currentOption) {
          await supabase
            .from('sm_poll_options')
            .update({ vote_count: (currentOption.vote_count || 0) + 1 })
            .eq('id', optId)
        }
      }
    }

    // Update total votes on poll
    await supabase
      .from('sm_polls')
      .update({ total_votes: poll.total_votes + 1 })
      .eq('id', id)

    // Fetch updated poll
    const { data: updatedPoll } = await supabase
      .from('sm_polls')
      .select(`
        id,
        question,
        poll_type,
        status,
        show_results,
        total_votes,
        ends_at,
        options:sm_poll_options(
          id,
          option_text,
          vote_count,
          display_order,
          color
        )
      `)
      .eq('id', id)
      .single()

    // Sort options
    if (updatedPoll?.options) {
      updatedPoll.options.sort((a: any, b: any) => a.display_order - b.display_order)
    }

    return NextResponse.json(updatedPoll)
  } catch (error) {
    console.error('Error voting:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
