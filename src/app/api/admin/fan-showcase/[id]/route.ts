import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'
import { SUBMISSION_STATUSES } from '@/types/fan-showcase'
import type { SubmissionStatus } from '@/types/fan-showcase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if ('error' in auth && auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params

    const { data: submission, error } = await datalabAdmin
      .from('fan_submissions')
      .select('*, creator:fan_creators(*), assets:fan_submission_assets(*), tags:fan_submission_tags(*)')
      .eq('id', id)
      .maybeSingle()

    if (error || !submission) {
      return NextResponse.json({ error: 'Submission not found.' }, { status: 404 })
    }

    // Moderation history
    const { data: events } = await datalabAdmin
      .from('fan_moderation_events')
      .select('*')
      .eq('submission_id', id)
      .order('created_at', { ascending: false })

    // Featured slot info
    const { data: slots } = await datalabAdmin
      .from('fan_featured_slots')
      .select('*')
      .eq('submission_id', id)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      submission,
      events: events || [],
      slots: slots || [],
    })
  } catch (err) {
    console.error('Admin detail error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if ('error' in auth && auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { action, note, slot_type } = body as {
      action: string
      note?: string
      slot_type?: string
    }

    // Get current submission
    const { data: current } = await datalabAdmin
      .from('fan_submissions')
      .select('id, status')
      .eq('id', id)
      .maybeSingle()

    if (!current) {
      return NextResponse.json({ error: 'Submission not found.' }, { status: 404 })
    }

    const previousStatus = current.status as SubmissionStatus
    let newStatus: SubmissionStatus = previousStatus

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    switch (action) {
      case 'approve':
        newStatus = 'approved'
        updates.status = 'approved'
        break
      case 'reject':
        newStatus = 'rejected'
        updates.status = 'rejected'
        break
      case 'request_changes':
        newStatus = 'changes_requested'
        updates.status = 'changes_requested'
        break
      case 'feature':
        newStatus = 'featured'
        updates.status = 'featured'
        updates.featured_at = new Date().toISOString()
        break
      case 'unfeature':
        newStatus = 'approved'
        updates.status = 'approved'
        updates.featured_at = null
        break
      case 'archive':
        newStatus = 'archived'
        updates.status = 'archived'
        break
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }

    if (!SUBMISSION_STATUSES.includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status transition.' }, { status: 400 })
    }

    // Update submission
    const { error: updateErr } = await datalabAdmin
      .from('fan_submissions')
      .update(updates)
      .eq('id', id)

    if (updateErr) {
      console.error('Update error:', updateErr)
      return NextResponse.json({ error: 'Failed to update submission.' }, { status: 500 })
    }

    // Log moderation event
    await datalabAdmin.from('fan_moderation_events').insert({
      submission_id: id,
      action,
      previous_status: previousStatus,
      new_status: newStatus,
      note: note || null,
      acted_by: auth.user?.email || auth.user?.id || null,
    })

    // Handle featured slot
    if (action === 'feature' && slot_type) {
      // Deactivate existing slots of same type
      await datalabAdmin
        .from('fan_featured_slots')
        .update({ active: false })
        .eq('slot_type', slot_type)
        .eq('active', true)

      await datalabAdmin.from('fan_featured_slots').insert({
        submission_id: id,
        slot_type,
        active: true,
      })
    }

    if (action === 'unfeature') {
      await datalabAdmin
        .from('fan_featured_slots')
        .update({ active: false })
        .eq('submission_id', id)
        .eq('active', true)
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (err) {
    console.error('Admin update error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
