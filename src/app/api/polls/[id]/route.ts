import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { Poll, UpdatePollInput } from '@/types/polls'

/**
 * GET /api/polls/[id]
 * Public endpoint to fetch a poll by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://test.sportsmockery.com'

    return NextResponse.json({
      poll: poll as Poll,
      shortcode: `[poll:${poll.id}]`,
      embed_url: `${baseUrl}/polls/embed/${poll.id}`,
    })
  } catch (error) {
    console.error('Error fetching poll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/polls/[id]
 * Update a poll (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdatePollInput = await request.json()

    // Check if poll exists
    const { data: existingPoll, error: fetchError } = await supabaseAdmin
      .from('sm_polls')
      .select('id, status')
      .eq('id', id)
      .single()

    if (fetchError || !existingPoll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }

    // Build update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    // Only update fields that are provided
    if (body.title !== undefined) updateData.title = body.title
    if (body.question !== undefined) updateData.question = body.question
    if (body.status !== undefined) updateData.status = body.status
    if (body.team_theme !== undefined) updateData.team_theme = body.team_theme
    if (body.is_anonymous !== undefined) updateData.is_anonymous = body.is_anonymous
    if (body.show_results !== undefined) updateData.show_results = body.show_results
    if (body.show_live_results !== undefined) updateData.show_live_results = body.show_live_results
    if (body.starts_at !== undefined) updateData.starts_at = body.starts_at
    if (body.ends_at !== undefined) updateData.ends_at = body.ends_at

    // Update poll
    const { data: updatedPoll, error: updateError } = await supabaseAdmin
      .from('sm_polls')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating poll:', updateError)
      return NextResponse.json(
        { error: 'Failed to update poll' },
        { status: 500 }
      )
    }

    // Update options if provided
    if (body.options && body.options.length > 0) {
      // Delete existing options
      await supabaseAdmin
        .from('sm_poll_options')
        .delete()
        .eq('poll_id', id)

      // Insert new options
      const options = body.options.map((opt, index) => ({
        poll_id: id,
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
        console.error('Error updating poll options:', optionsError)
        return NextResponse.json(
          { error: 'Failed to update poll options' },
          { status: 500 }
        )
      }
    }

    // Fetch complete updated poll
    const { data: completePoll } = await supabaseAdmin
      .from('sm_polls')
      .select(`
        *,
        options:sm_poll_options(*)
      `)
      .eq('id', id)
      .single()

    if (completePoll?.options) {
      completePoll.options.sort((a: any, b: any) => a.display_order - b.display_order)
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://test.sportsmockery.com'

    return NextResponse.json({
      poll: completePoll as Poll,
      shortcode: `[poll:${id}]`,
      embed_url: `${baseUrl}/polls/embed/${id}`,
    })
  } catch (error) {
    console.error('Error updating poll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/polls/[id]
 * Archive or hard delete a poll (admin only)
 * Pass ?hard=true to permanently delete
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const hardDelete = searchParams.get('hard') === 'true'

    // Check if poll exists
    const { data: existingPoll, error: fetchError } = await supabaseAdmin
      .from('sm_polls')
      .select('id, status')
      .eq('id', id)
      .single()

    if (fetchError || !existingPoll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }

    if (hardDelete) {
      // Delete votes first (foreign key constraint)
      await supabaseAdmin
        .from('sm_poll_responses')
        .delete()
        .eq('poll_id', id)

      // Delete options
      await supabaseAdmin
        .from('sm_poll_options')
        .delete()
        .eq('poll_id', id)

      // Delete poll
      const { error: deleteError } = await supabaseAdmin
        .from('sm_polls')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('Error deleting poll:', deleteError)
        return NextResponse.json(
          { error: 'Failed to delete poll' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, message: 'Poll permanently deleted' })
    } else {
      // Soft delete - just archive
      const { error: archiveError } = await supabaseAdmin
        .from('sm_polls')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (archiveError) {
        console.error('Error archiving poll:', archiveError)
        return NextResponse.json(
          { error: 'Failed to archive poll' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, message: 'Poll archived' })
    }
  } catch (error) {
    console.error('Error deleting poll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
