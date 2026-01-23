import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { Poll, PollResults, PollOptionResult } from '@/types/polls'
import { getRandomMicrocopy } from '@/types/polls'
import crypto from 'crypto'

/**
 * GET /api/polls/[id]/results
 * Fetch poll results with percentages
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

    // Fetch poll with options
    const { data: poll, error } = await supabaseAdmin
      .from('sm_polls')
      .select(`
        *,
        options:sm_poll_options(*)
      `)
      .eq('id', id)
      .single()

    if (error || !poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }

    // Sort options by display order
    if (poll.options) {
      poll.options.sort((a: any, b: any) => a.display_order - b.display_order)
    }

    // Check if user has voted (if user/anonymous ID provided)
    let userVoted = false
    let userVotes: string[] = []

    if (userId || anonymousId) {
      // Generate IP hash
      const forwarded = request.headers.get('x-forwarded-for')
      const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
      const ipHash = crypto.createHash('sha256').update(ip + id).digest('hex')

      let voteQuery = supabaseAdmin
        .from('sm_poll_responses')
        .select('option_id')
        .eq('poll_id', id)

      if (userId) {
        voteQuery = voteQuery.eq('user_id', userId)
      } else {
        voteQuery = voteQuery.or(`anonymous_id.eq.${anonymousId},ip_hash.eq.${ipHash}`)
      }

      const { data: votes } = await voteQuery
      if (votes && votes.length > 0) {
        userVoted = true
        userVotes = votes.map(v => v.option_id)
      }
    }

    // Check if results should be shown
    const canShowResults = poll.show_results ||
      poll.status === 'closed' ||
      (poll.show_live_results && userVoted)

    // Calculate percentages
    const totalVotes = poll.total_votes || 0
    const optionResults: PollOptionResult[] = poll.options.map((opt: any) => ({
      id: opt.id,
      option_text: opt.option_text,
      option_image: opt.option_image,
      team_tag: opt.team_tag,
      emoji: opt.emoji,
      vote_count: canShowResults ? (opt.vote_count || 0) : 0,
      percentage: canShowResults && totalVotes > 0
        ? Math.round((opt.vote_count / totalVotes) * 100)
        : 0,
    }))

    const results: PollResults = {
      poll: poll as Poll,
      total_votes: canShowResults ? totalVotes : 0,
      options: optionResults,
      user_voted: userVoted,
      user_votes: userVotes,
    }

    return NextResponse.json({
      results,
      can_show_results: canShowResults,
      header: getRandomMicrocopy('results_header'),
    })
  } catch (error) {
    console.error('Error fetching poll results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
