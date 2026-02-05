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
 * Create a new poll (used by PostIQ)
 * Supports new PostIQ fields: source, source_post_id, ai_confidence
 * Supports linking to posts via sm_post_polls junction table
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

    // Use question as title if not provided (for PostIQ auto-generation)
    const title = body.title || body.question.slice(0, 255)

    // Build poll insert object with optional PostIQ tracking fields
    const pollInsert: Record<string, unknown> = {
      title,
      question: body.question,
      poll_type: body.pollType || 'single',
      status: body.status || 'active',
      team_theme: body.teamTheme || null,
      show_results: body.showResults !== false,
      show_live_results: body.showLiveResults !== false,
      total_votes: 0,
      starts_at: body.startsAt || new Date().toISOString(),
      ends_at: body.endsAt || null,
    }

    // Add PostIQ tracking fields if provided (new columns from DataLab integration)
    if (body.source) {
      pollInsert.source = body.source // 'postiq', 'manual', 'e2e_test'
    }
    if (body.sourcePostId) {
      pollInsert.source_post_id = body.sourcePostId
    }
    if (body.aiConfidence !== undefined) {
      pollInsert.ai_confidence = body.aiConfidence
    }

    // Create poll
    const { data: poll, error: pollError } = await supabaseAdmin
      .from('sm_polls')
      .insert(pollInsert)
      .select()
      .single()

    if (pollError) {
      console.error('Error creating poll:', pollError)
      return NextResponse.json(
        { error: 'Failed to create poll', details: pollError.message },
        { status: 500 }
      )
    }

    // Create poll options
    const options = body.options.map((opt: { text: string; team_tag?: string }, index: number) => ({
      poll_id: poll.id,
      option_text: opt.text,
      display_order: index,
      team_tag: opt.team_tag || null,
      vote_count: 0,
    }))

    const { error: optionsError } = await supabaseAdmin
      .from('sm_poll_options')
      .insert(options)

    if (optionsError) {
      // Rollback poll creation
      await supabaseAdmin.from('sm_polls').delete().eq('id', poll.id)
      console.error('Error creating poll options:', optionsError)
      return NextResponse.json(
        { error: 'Failed to create poll options', details: optionsError.message },
        { status: 500 }
      )
    }

    // Link poll to post via sm_post_polls junction table if post ID provided
    if (body.sourcePostId || body.postId) {
      const postIdToLink = body.sourcePostId || body.postId
      const { error: linkError } = await supabaseAdmin
        .from('sm_post_polls')
        .insert({
          post_id: postIdToLink,
          poll_id: poll.id,
          position: body.position || 'after_content',
          display_order: body.displayOrder || 0,
          is_auto_generated: body.source === 'postiq',
        })

      if (linkError) {
        // Log but don't fail - the poll was created successfully
        console.error('Error linking poll to post:', linkError)
      }
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
