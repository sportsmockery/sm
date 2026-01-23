import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { CreatePollInput, Poll, PollsListResponse } from '@/types/polls'

/**
 * GET /api/polls
 * List all polls with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const team = searchParams.get('team')
    const pollType = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const includeArchived = searchParams.get('archived') === 'true'

    let query = supabaseAdmin
      .from('sm_polls')
      .select(`
        *,
        options:sm_poll_options(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status)
    } else if (!includeArchived) {
      query = query.neq('status', 'archived')
    }

    // Filter by team theme
    if (team) {
      query = query.eq('team_theme', team)
    }

    // Filter by poll type
    if (pollType) {
      query = query.eq('poll_type', pollType)
    }

    // Search by question or title
    if (search) {
      query = query.or(`question.ilike.%${search}%,title.ilike.%${search}%`)
    }

    const { data: polls, error, count } = await query

    if (error) {
      console.error('Error fetching polls:', error)
      return NextResponse.json(
        { error: 'Failed to fetch polls' },
        { status: 500 }
      )
    }

    // Sort options by display_order
    const sortedPolls = polls?.map(poll => ({
      ...poll,
      options: poll.options?.sort((a: any, b: any) => a.display_order - b.display_order) || []
    })) || []

    const response: PollsListResponse = {
      polls: sortedPolls as Poll[],
      total: count || 0,
      limit,
      offset,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching polls:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/polls
 * Create a new poll
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreatePollInput = await request.json()

    // Validate required fields
    if (!body.question || !body.title) {
      return NextResponse.json(
        { error: 'Title and question are required' },
        { status: 400 }
      )
    }

    // Validate options based on poll type
    if (body.poll_type === 'scale') {
      // Scale polls don't need predefined options
      if (!body.scale_min || !body.scale_max) {
        return NextResponse.json(
          { error: 'Scale polls require min and max values' },
          { status: 400 }
        )
      }
    } else if (body.poll_type === 'emoji') {
      // Emoji polls need at least 2 emoji options
      if (!body.options || body.options.length < 2) {
        return NextResponse.json(
          { error: 'Emoji polls require at least 2 options' },
          { status: 400 }
        )
      }
    } else {
      // Regular polls need at least 2 options
      if (!body.options || body.options.length < 2) {
        return NextResponse.json(
          { error: 'At least 2 options are required' },
          { status: 400 }
        )
      }
    }

    // Determine initial status
    let initialStatus: string = 'active'
    if (body.starts_at) {
      const startsAt = new Date(body.starts_at)
      if (startsAt > new Date()) {
        initialStatus = 'scheduled'
      }
    }

    // Create poll
    const { data: poll, error: pollError } = await supabaseAdmin
      .from('sm_polls')
      .insert({
        title: body.title,
        question: body.question,
        poll_type: body.poll_type || 'single',
        status: initialStatus,
        team_theme: body.team_theme || null,
        is_anonymous: body.is_anonymous ?? false,
        show_results: body.show_results ?? true,
        show_live_results: body.show_live_results ?? true,
        is_multi_select: body.is_multi_select ?? (body.poll_type === 'multiple'),
        scale_min: body.scale_min || null,
        scale_max: body.scale_max || null,
        scale_labels: body.scale_labels || null,
        total_votes: 0,
        starts_at: body.starts_at || new Date().toISOString(),
        ends_at: body.ends_at || null,
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

    // Create poll options (for non-scale polls)
    if (body.options && body.options.length > 0) {
      const options = body.options.map((opt, index) => ({
        poll_id: poll.id,
        option_text: opt.option_text,
        option_image: opt.option_image || null,
        team_tag: opt.team_tag || null,
        emoji: opt.emoji || null,
        display_order: index,
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
          { error: 'Failed to create poll options' },
          { status: 500 }
        )
      }
    }

    // For scale polls, create numbered options
    if (body.poll_type === 'scale' && body.scale_min && body.scale_max) {
      const scaleOptions = []
      for (let i = body.scale_min; i <= body.scale_max; i++) {
        scaleOptions.push({
          poll_id: poll.id,
          option_text: String(i),
          display_order: i - body.scale_min,
          vote_count: 0,
        })
      }

      const { error: scaleError } = await supabaseAdmin
        .from('sm_poll_options')
        .insert(scaleOptions)

      if (scaleError) {
        await supabaseAdmin.from('sm_polls').delete().eq('id', poll.id)
        console.error('Error creating scale options:', scaleError)
        return NextResponse.json(
          { error: 'Failed to create scale options' },
          { status: 500 }
        )
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

    // Sort options
    if (completePoll?.options) {
      completePoll.options.sort((a: any, b: any) => a.display_order - b.display_order)
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://test.sportsmockery.com'

    return NextResponse.json({
      poll: completePoll,
      shortcode: `[poll:${poll.id}]`,
      embed_url: `${baseUrl}/polls/embed/${poll.id}`,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating poll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
