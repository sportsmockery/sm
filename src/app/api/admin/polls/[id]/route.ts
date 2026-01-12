import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/admin/polls/[id]
 * Fetch a single poll by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: poll, error } = await supabase
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

    return NextResponse.json(poll)
  } catch (error) {
    console.error('Error fetching poll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/polls/[id]
 * Update a poll
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Update poll
    const { data: poll, error: pollError } = await supabase
      .from('sm_polls')
      .update({
        question: body.question,
        poll_type: body.pollType,
        status: body.status,
        show_results: body.showResults,
        ends_at: body.endsAt,
      })
      .eq('id', id)
      .select()
      .single()

    if (pollError) {
      console.error('Error updating poll:', pollError)
      return NextResponse.json(
        { error: 'Failed to update poll' },
        { status: 500 }
      )
    }

    // Update options if provided
    if (body.options) {
      // Delete existing options
      await supabase.from('sm_poll_options').delete().eq('poll_id', id)

      // Create new options
      const options = body.options.map((opt: { text: string; color?: string }, index: number) => ({
        poll_id: parseInt(id),
        option_text: opt.text,
        display_order: index,
        color: opt.color || null,
      }))

      await supabase.from('sm_poll_options').insert(options)
    }

    // Fetch updated poll with options
    const { data: updatedPoll } = await supabase
      .from('sm_polls')
      .select(`
        *,
        options:sm_poll_options(*)
      `)
      .eq('id', id)
      .single()

    return NextResponse.json(updatedPoll)
  } catch (error) {
    console.error('Error updating poll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/polls/[id]
 * Delete a poll
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Delete options first (foreign key constraint)
    await supabase.from('sm_poll_options').delete().eq('poll_id', id)
    await supabase.from('sm_poll_votes').delete().eq('poll_id', id)

    // Delete poll
    const { error } = await supabase
      .from('sm_polls')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting poll:', error)
      return NextResponse.json(
        { error: 'Failed to delete poll' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting poll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
