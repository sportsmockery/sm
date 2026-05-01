import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, verifyCronSecret } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

type Task = {
  id: string
  status: string
  auto_check: boolean
  evidence_url: string | null
  evidence_kind: string | null
  evidence_match: string | null
  tip_number: string | null
  last_check_result: { ok?: boolean; regression?: boolean; status_code?: number | null; notes?: string; checked_at?: string } | null
  auto_marked_done: boolean | null
}

type ProbeResult = {
  ok: boolean
  status_code: number | null
  notes: string
  raw: Record<string, unknown>
}

const FETCH_TIMEOUT_MS = 12000

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, {
      ...init,
      signal: ctrl.signal,
      // Don't follow redirects automatically — we need to inspect 301s
      redirect: init.redirect ?? 'manual',
      headers: {
        'User-Agent': 'sm-seo-task-auditor/1.0 (+https://sportsmockery.com)',
        ...(init.headers || {}),
      },
    })
  } finally {
    clearTimeout(timer)
  }
}

async function probeHttp200(url: string): Promise<ProbeResult> {
  try {
    const res = await fetchWithTimeout(url, { method: 'GET', redirect: 'follow' })
    return {
      ok: res.status === 200,
      status_code: res.status,
      notes: res.status === 200 ? `200 OK at ${url}` : `Got ${res.status} for ${url}`,
      raw: { url, status: res.status },
    }
  } catch (e) {
    return {
      ok: false,
      status_code: null,
      notes: `Fetch error: ${e instanceof Error ? e.message : String(e)}`,
      raw: { url, error: String(e) },
    }
  }
}

async function probeHttp301(url: string, expectMatch: string | null): Promise<ProbeResult> {
  try {
    const res = await fetchWithTimeout(url, { method: 'HEAD', redirect: 'manual' })
    const location = res.headers.get('location') || ''
    const is301 = res.status === 301 || res.status === 308
    const matches = expectMatch ? location.includes(expectMatch) : true
    return {
      ok: is301 && matches,
      status_code: res.status,
      notes: is301
        ? (matches ? `${res.status} → ${location}` : `${res.status} but Location='${location}' does not contain '${expectMatch}'`)
        : `Expected 301/308, got ${res.status}`,
      raw: { url, status: res.status, location, expectMatch },
    }
  } catch (e) {
    return {
      ok: false,
      status_code: null,
      notes: `Fetch error: ${e instanceof Error ? e.message : String(e)}`,
      raw: { url, error: String(e) },
    }
  }
}

async function probeHtmlContains(url: string, needle: string | null): Promise<ProbeResult> {
  if (!needle) {
    return { ok: false, status_code: null, notes: 'evidence_match required for html_contains', raw: { url } }
  }
  try {
    const res = await fetchWithTimeout(url, { method: 'GET', redirect: 'follow' })
    const body = await res.text()
    const contains = body.includes(needle)
    return {
      ok: res.status === 200 && contains,
      status_code: res.status,
      notes: contains ? `Found '${needle.slice(0, 60)}'` : `Did not find '${needle.slice(0, 60)}'`,
      raw: { url, status: res.status, body_len: body.length, contains },
    }
  } catch (e) {
    return {
      ok: false,
      status_code: null,
      notes: `Fetch error: ${e instanceof Error ? e.message : String(e)}`,
      raw: { url, error: String(e) },
    }
  }
}

async function runProbe(task: Task): Promise<ProbeResult> {
  if (!task.evidence_url || !task.evidence_kind) {
    return { ok: false, status_code: null, notes: 'Missing evidence_url or evidence_kind', raw: {} }
  }
  switch (task.evidence_kind) {
    case 'http_status_200':
      return probeHttp200(task.evidence_url)
    case 'http_status_301':
      return probeHttp301(task.evidence_url, task.evidence_match)
    case 'html_contains':
      return probeHtmlContains(task.evidence_url, task.evidence_match)
    case 'manual':
      return { ok: false, status_code: null, notes: 'Manual task — no probe', raw: {} }
    default:
      return { ok: false, status_code: null, notes: `Unknown evidence_kind: ${task.evidence_kind}`, raw: {} }
  }
}

export async function POST(request: NextRequest) {
  // Allow either an admin user (manual "Run audit now" button) or cron secret
  const isCron = verifyCronSecret(request)
  if (!isCron) {
    const auth = await requireAdmin(request)
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  // Optional: probe a single task by id (for manual one-off rerun)
  let onlyId: string | null = null
  try {
    const body = await request.json()
    if (body && typeof body.id === 'string') onlyId = body.id
  } catch {
    // No body is fine
  }

  let query = supabaseAdmin
    .from('sm_seo_tasks')
    .select('id, status, auto_check, evidence_url, evidence_kind, evidence_match, tip_number, last_check_result, auto_marked_done')
    .eq('auto_check', true)

  if (onlyId) query = query.eq('id', onlyId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const tasks = (data || []) as Task[]
  const checkedAt = new Date().toISOString()

  const results: Array<{
    task_id: string
    ok: boolean
    status_code: number | null
    notes: string
    auto_marked_done: boolean
    regression: boolean
    prev_status: string
    new_status: string
  }> = []

  // Probe in parallel (small N — fine to fan out)
  const probes = await Promise.all(tasks.map(async t => ({ task: t, probe: await runProbe(t) })))

  for (const { task, probe } of probes) {
    const prevOk = task.last_check_result?.ok === true
    const wasAutoMarked = task.auto_marked_done === true

    // Regression: previously passing + currently failing + status was 'done' (auto-marked)
    // Only auto-reopen tasks that were auto-marked done — don't override manual completions.
    const isRegression = prevOk && !probe.ok && task.status === 'done' && wasAutoMarked

    const eligibleForAutoMark = probe.ok && (task.status === 'pending' || task.status === 'in_progress')

    let newStatus = task.status
    if (eligibleForAutoMark) newStatus = 'done'
    if (isRegression) newStatus = 'in_progress'

    // Update the task with last_checked_at + last_check_result, and possibly status
    const update: Record<string, unknown> = {
      last_checked_at: checkedAt,
      last_check_result: {
        ok: probe.ok,
        status_code: probe.status_code,
        notes: probe.notes,
        checked_at: checkedAt,
        regression: isRegression || undefined,
      },
    }
    if (eligibleForAutoMark) {
      update.status = 'done'
      update.completed_at = checkedAt
      update.auto_marked_done = true
      // Don't set completed_by — it's a uuid FK to auth.users; null indicates auto-mark
    } else if (isRegression) {
      update.status = 'in_progress'
      update.completed_at = null
      update.auto_marked_done = false
    }

    const { error: updErr } = await supabaseAdmin
      .from('sm_seo_tasks')
      .update(update)
      .eq('id', task.id)

    if (updErr) {
      results.push({
        task_id: task.id,
        ok: false,
        status_code: probe.status_code,
        notes: `Probe ran but update failed: ${updErr.message}`,
        auto_marked_done: false,
        regression: false,
        prev_status: task.status,
        new_status: task.status,
      })
      continue
    }

    // Insert audit log row
    await supabaseAdmin
      .from('sm_seo_task_audits')
      .insert({
        task_id: task.id,
        checked_at: checkedAt,
        ok: probe.ok,
        status_code: probe.status_code,
        notes: isRegression ? `[REGRESSION] ${probe.notes}` : probe.notes,
        raw: { ...probe.raw, regression: isRegression || undefined },
        auto_marked_done: eligibleForAutoMark,
      })

    results.push({
      task_id: task.id,
      ok: probe.ok,
      status_code: probe.status_code,
      notes: probe.notes,
      auto_marked_done: eligibleForAutoMark,
      regression: isRegression,
      prev_status: task.status,
      new_status: newStatus,
    })
  }

  const summary = {
    checked_at: checkedAt,
    total: results.length,
    passed: results.filter(r => r.ok).length,
    failed: results.filter(r => !r.ok).length,
    auto_marked_done: results.filter(r => r.auto_marked_done).length,
    regressions: results.filter(r => r.regression).length,
  }

  return NextResponse.json({ summary, results, mode: isCron ? 'cron' : 'manual' })
}
