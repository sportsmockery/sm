import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/polls/[id]
 * Public endpoint to fetch a poll by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const { id } = await params

    const { data: poll, error } = await supabase
      .from('sm_polls')
      .select(`
        id,
        question,
        poll_type,
        status,
        show_results,
        total_votes,
        starts_at,
        ends_at,
        created_at,
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

    return NextResponse.json(poll)
  } catch (error) {
    console.error('Error fetching poll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
