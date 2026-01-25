import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

/**
 * GET /api/admin/polls
 * List all polls with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabaseAdmin
      .from('sm_polls')
      .select(`
        *,
        options:sm_poll_options(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.ilike('question', `%${search}%`)
    }

    const { data: polls, error, count } = await query

    if (error) {
      console.error('Error fetching polls:', error)
      return NextResponse.json(
        { error: 'Failed to fetch polls' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      polls,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching polls:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/polls
 * Create a new poll
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.question || !body.options || body.options.length < 2) {
      return NextResponse.json(
        { error: 'Question and at least 2 options are required' },
        { status: 400 }
      )
    }

    // Create poll
    const { data: poll, error: pollError } = await supabaseAdmin
      .from('sm_polls')
      .insert({
        post_id: body.postId || null,
        author_id: body.authorId || null,
        question: body.question,
        poll_type: body.pollType || 'single',
        status: body.status || 'active',
        show_results: body.showResults !== false,
        starts_at: body.startsAt || new Date().toISOString(),
        ends_at: body.endsAt || null,
      })
      .select()
      .single()

    if (pollError) {
      console.error('Error creating poll:', pollError)
      return NextResponse.json(
        { error: 'Failed to create poll' },
        { status: 500 }
      )
    }

    // Create poll options
    const options = body.options.map((opt: { text: string; color?: string }, index: number) => ({
      poll_id: poll.id,
      option_text: opt.text,
      display_order: index,
      color: opt.color || null,
    }))

    const { error: optionsError } = await supabaseAdmin
      .from('sm_poll_options')
      .insert(options)

    if (optionsError) {
      // Rollback poll creation
      await supabaseAdmin.from('sm_polls').delete().eq('id', poll.id)
      console.error('Error creating poll options:', optionsError)
      return NextResponse.json(
        { error: 'Failed to create poll options' },
        { status: 500 }
      )
    }

    // Fetch complete poll with options
    const { data: completePoll } = await supabaseAdmin
      .from('sm_polls')
      .select(`
        *,
        options:sm_poll_options(*)
      `)
      .eq('id', poll.id)
      .single()

    return NextResponse.json({
      ...completePoll,
      shortcode: `[poll:${poll.id}]`,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating poll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
