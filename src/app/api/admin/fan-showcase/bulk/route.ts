import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'
import { SUBMISSION_STATUSES } from '@/types/fan-showcase'
import type { SubmissionStatus } from '@/types/fan-showcase'

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth && auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { ids, action } = (await request.json()) as {
      ids: string[]
      action: 'approve' | 'reject' | 'feature' | 'unfeature'
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No submissions selected.' }, { status: 400 })
    }

    const statusMap: Record<string, SubmissionStatus> = {
      approve: 'approved',
      reject: 'rejected',
      feature: 'featured',
      unfeature: 'approved',
    }

    const newStatus = statusMap[action]
    if (!newStatus || !SUBMISSION_STATUSES.includes(newStatus)) {
      return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 })
    }

    const updates: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    if (action === 'feature') {
      updates.featured_at = new Date().toISOString()
    }
    if (action === 'unfeature') {
      updates.featured_at = null
    }

    // Get current statuses for moderation log
    const { data: currentSubs } = await datalabAdmin
      .from('fan_submissions')
      .select('id, status')
      .in('id', ids)

    const { error } = await datalabAdmin
      .from('fan_submissions')
      .update(updates)
      .in('id', ids)

    if (error) {
      console.error('Bulk update error:', error)
      return NextResponse.json({ error: 'Failed to update submissions.' }, { status: 500 })
    }

    // Log moderation events
    const events = (currentSubs || []).map(sub => ({
      submission_id: sub.id,
      action: `bulk_${action}`,
      previous_status: sub.status,
      new_status: newStatus,
      note: `Bulk action: ${action}`,
      acted_by: auth.user?.email || auth.user?.id || null,
    }))

    if (events.length > 0) {
      await datalabAdmin.from('fan_moderation_events').insert(events)
    }

    // Deactivate featured slots on unfeature
    if (action === 'unfeature') {
      await datalabAdmin
        .from('fan_featured_slots')
        .update({ active: false })
        .in('submission_id', ids)
        .eq('active', true)
    }

    return NextResponse.json({ success: true, updated: ids.length })
  } catch (err) {
    console.error('Bulk action error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
