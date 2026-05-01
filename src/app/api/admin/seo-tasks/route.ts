import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const PHASE_ORDER: Record<string, number> = {
  'NOW': 0,
  'AT LAUNCH': 1,
  'POST-LAUNCH': 2,
}

type SeoTaskRow = {
  id: string
  tip_number: string | null
  pr_number: string | null
  phase: string
  title: string
  description: string | null
  acceptance: string | null
  evidence_url: string | null
  evidence_kind: string | null
  evidence_match: string | null
  status: string
  auto_check: boolean
  completed_at: string | null
  completed_by: string | null
  last_checked_at: string | null
  last_check_result: Record<string, unknown> | null
  position: number | null
  auto_marked_done: boolean | null
  created_at: string
  updated_at: string
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { data, error } = await supabaseAdmin
    .from('sm_seo_tasks')
    .select('*')
    .order('phase', { ascending: true })
    .order('position', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data || []) as SeoTaskRow[]

  // Group by phase, sorted in canonical order
  const byPhase: Record<string, SeoTaskRow[]> = {}
  for (const row of rows) {
    const phase = row.phase || 'OTHER'
    if (!byPhase[phase]) byPhase[phase] = []
    byPhase[phase].push(row)
  }

  // Sort each phase by position then tip_number
  for (const phase of Object.keys(byPhase)) {
    byPhase[phase].sort((a, b) => {
      const ap = a.position ?? 9999
      const bp = b.position ?? 9999
      if (ap !== bp) return ap - bp
      const at = parseInt(a.tip_number ?? '9999', 10) || 9999
      const bt = parseInt(b.tip_number ?? '9999', 10) || 9999
      return at - bt
    })
  }

  // Build phases array in canonical order
  const phases = Object.keys(byPhase)
    .sort((a, b) => (PHASE_ORDER[a] ?? 99) - (PHASE_ORDER[b] ?? 99))
    .map(phase => ({
      phase,
      tasks: byPhase[phase],
      total: byPhase[phase].length,
      done: byPhase[phase].filter(t => t.status === 'done').length,
    }))

  const totals = {
    total: rows.length,
    done: rows.filter(r => r.status === 'done').length,
    in_progress: rows.filter(r => r.status === 'in_progress').length,
    pending: rows.filter(r => r.status === 'pending').length,
    blocked: rows.filter(r => r.status === 'blocked').length,
  }

  return NextResponse.json({ phases, totals })
}

const ALLOWED_STATUSES = new Set(['pending', 'in_progress', 'done', 'blocked'])

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: { id?: string; status?: string; notes?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { id, status } = body
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }
  if (!status || !ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({
      error: `status must be one of: ${Array.from(ALLOWED_STATUSES).join(', ')}`,
    }, { status: 400 })
  }

  const update: Record<string, unknown> = { status }
  if (status === 'done') {
    update.completed_at = new Date().toISOString()
    update.completed_by = auth.user!.id
    // Manual completion by an admin overrides any prior auto-mark
    update.auto_marked_done = false
  } else {
    // Re-opening a task clears completion
    update.completed_at = null
    update.completed_by = null
    update.auto_marked_done = false
  }

  const { data, error } = await supabaseAdmin
    .from('sm_seo_tasks')
    .update(update)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ task: data })
}
