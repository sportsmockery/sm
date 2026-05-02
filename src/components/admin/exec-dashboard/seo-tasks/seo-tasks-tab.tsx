'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

type SeoTask = {
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
  status: 'pending' | 'in_progress' | 'done' | 'blocked'
  auto_check: boolean
  auto_marked_done: boolean | null
  completed_at: string | null
  last_checked_at: string | null
  last_check_result: { ok?: boolean; notes?: string; status_code?: number | null } | null
}

type PhaseGroup = { phase: string; tasks: SeoTask[]; total: number; done: number }

type SeoTasksResponse = {
  phases: PhaseGroup[]
  totals: { total: number; done: number; in_progress: number; pending: number; blocked: number }
}

const STATUSES: SeoTask['status'][] = ['pending', 'in_progress', 'done', 'blocked']

const STATUS_LABEL: Record<SeoTask['status'], string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  done: 'Done',
  blocked: 'Blocked',
}

const STATUS_COLORS: Record<SeoTask['status'], { bg: string; fg: string }> = {
  pending:     { bg: 'rgba(214,176,94,0.15)', fg: '#D6B05E' },
  in_progress: { bg: 'rgba(0,212,255,0.15)',  fg: '#00D4FF' },
  done:        { bg: 'rgba(36,191,108,0.18)', fg: '#24BF6C' },
  blocked:     { bg: 'rgba(188,0,0,0.18)',    fg: '#FF6B6B' },
}

const PHASE_BADGE: Record<string, { bg: string; fg: string; label: string }> = {
  'NOW':         { bg: 'rgba(188,0,0,0.18)',    fg: '#FF6B6B', label: 'NOW' },
  'AT LAUNCH':   { bg: 'rgba(214,176,94,0.18)', fg: '#D6B05E', label: 'AT LAUNCH' },
  'POST-LAUNCH': { bg: 'rgba(0,212,255,0.15)',  fg: '#00D4FF', label: 'POST-LAUNCH' },
}

function relativeTime(iso: string | null): string {
  if (!iso) return 'never'
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 0) return 'just now'
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.floor(hr / 24)
  return `${d}d ago`
}

export function SeoTasksTab({ active }: { active: boolean }) {
  const [data, setData] = useState<SeoTasksResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<Record<string, boolean>>({})
  const [auditing, setAuditing] = useState(false)
  const [auditMessage, setAuditMessage] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/admin/seo-tasks', { cache: 'no-store' })
      const text = await res.text()
      let json: SeoTasksResponse | { error: string }
      try { json = JSON.parse(text) } catch { throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`) }
      if (!res.ok) throw new Error((json as { error: string }).error || `HTTP ${res.status}`)
      setData(json as SeoTasksResponse)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (active && !data && !loading) {
      void load()
    }
  }, [active, data, loading, load])

  const updateStatus = useCallback(async (id: string, status: SeoTask['status']) => {
    setUpdating(prev => ({ ...prev, [id]: true }))
    // Optimistic update
    setData(prev => prev ? optimisticPatch(prev, id, status) : prev)
    try {
      const res = await fetch('/api/admin/seo-tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text.slice(0, 200))
      }
      // Reload to get authoritative state
      await load()
    } catch (e) {
      setError(`Failed to update: ${e instanceof Error ? e.message : String(e)}`)
      // Reload to revert optimistic
      await load()
    } finally {
      setUpdating(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }, [load])

  const runAudit = useCallback(async () => {
    setAuditing(true); setAuditMessage(null)
    try {
      const res = await fetch('/api/admin/seo-tasks/audit', { method: 'POST' })
      const text = await res.text()
      let json: { summary?: { total: number; passed: number; failed: number; auto_marked_done: number }; error?: string }
      try { json = JSON.parse(text) } catch { throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`) }
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
      const s = json.summary
      if (s) setAuditMessage(`Audited ${s.total} • ${s.passed} pass • ${s.failed} fail • ${s.auto_marked_done} auto-marked done`)
      await load()
    } catch (e) {
      setAuditMessage(`Audit failed: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setAuditing(false)
    }
  }, [load])

  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const totals = useMemo(() => data?.totals, [data])

  if (!active) return null

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-3 animate-pulse">
        <div className="h-20 rounded-lg" style={{ background: 'var(--sm-card)' }} />
        <div className="h-64 rounded-lg" style={{ background: 'var(--sm-card)' }} />
        <div className="h-96 rounded-lg" style={{ background: 'var(--sm-card)' }} />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border p-12 text-center" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--sm-text-muted)' }}>
          Failed to load SEO tasks: {error ?? 'unknown error'}
        </p>
        <button onClick={load} className="mt-3 px-5 py-2 rounded-lg text-sm font-bold" style={{ background: 'var(--sm-red)', color: '#FAFAFB' }}>
          Retry
        </button>
      </div>
    )
  }

  const nowPhase = data.phases.find(p => p.phase === 'NOW') ?? { total: 0, done: 0 }
  const launchPhase = data.phases.find(p => p.phase === 'AT LAUNCH') ?? { total: 0, done: 0 }

  return (
    <div className="flex flex-col gap-4">
      {/* Phase progress bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PhaseProgressBar label="For Now" done={nowPhase.done} total={nowPhase.total} />
        <PhaseProgressBar label="Launch Day" done={launchPhase.done} total={launchPhase.total} />
      </div>

      {/* Header / scorecard */}
      <div className="rounded-xl border p-4 flex flex-wrap items-center gap-4 justify-between"
           style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
        <div className="flex flex-wrap items-center gap-5">
          <Score label="Total" value={`${totals?.done ?? 0}/${totals?.total ?? 0}`} fg="#FAFAFB" />
          <Score label="Pending" value={String(totals?.pending ?? 0)} fg={STATUS_COLORS.pending.fg} />
          <Score label="In progress" value={String(totals?.in_progress ?? 0)} fg={STATUS_COLORS.in_progress.fg} />
          <Score label="Done" value={String(totals?.done ?? 0)} fg={STATUS_COLORS.done.fg} />
          <Score label="Blocked" value={String(totals?.blocked ?? 0)} fg={STATUS_COLORS.blocked.fg} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {auditMessage && (
            <span className="text-[11px]" style={{ color: 'var(--sm-text-dim)' }}>{auditMessage}</span>
          )}
          <button
            onClick={runAudit}
            disabled={auditing}
            className="px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wide disabled:opacity-40"
            style={{ background: '#00D4FF', color: '#0B0F14' }}
          >
            {auditing ? 'Auditing…' : 'Run audit now'}
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wide disabled:opacity-40"
            style={{ background: '#BC0000', color: '#FAFAFB' }}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Phase groups */}
      {data.phases.map(group => {
        const badge = PHASE_BADGE[group.phase] ?? { bg: 'rgba(255,255,255,0.08)', fg: '#FAFAFB', label: group.phase }
        return (
          <div key={group.phase} className="rounded-xl border overflow-hidden"
               style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b"
                 style={{ borderColor: 'var(--sm-border)' }}>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider"
                      style={{ background: badge.bg, color: badge.fg }}>
                  {badge.label}
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--sm-text-muted)' }}>
                  {group.done}/{group.total} complete
                </span>
              </div>
              <ProgressBar pct={group.total === 0 ? 0 : Math.round((group.done / group.total) * 100)} />
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--sm-border)' }}>
              {group.tasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  expanded={!!expanded[task.id]}
                  onToggleExpand={() => toggleExpand(task.id)}
                  onStatusChange={s => updateStatus(task.id, s)}
                  busy={!!updating[task.id]}
                />
              ))}
            </div>
          </div>
        )
      })}

      <div className="text-[11px] px-1" style={{ color: 'var(--sm-text-dim)' }}>
        Auto-review runs every night at midnight CT. Tasks with green probes auto-mark <em>done</em>;
        the badge shows tasks completed by the auditor (vs. manually).
      </div>
    </div>
  )
}

function optimisticPatch(prev: SeoTasksResponse, id: string, status: SeoTask['status']): SeoTasksResponse {
  return {
    ...prev,
    phases: prev.phases.map(g => ({
      ...g,
      tasks: g.tasks.map(t => t.id === id ? { ...t, status } : t),
      done: g.tasks.reduce((acc, t) => acc + (t.id === id ? (status === 'done' ? 1 : 0) : (t.status === 'done' ? 1 : 0)), 0),
    })),
  }
}

function Score({ label, value, fg }: { label: string; value: string; fg: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--sm-text-dim)' }}>{label}</span>
      <span className="text-xl font-bold tabular-nums" style={{ color: fg }}>{value}</span>
    </div>
  )
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#24BF6C', transition: 'width 200ms' }} />
      </div>
      <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--sm-text-muted)' }}>{pct}%</span>
    </div>
  )
}

function PhaseProgressBar({ label, done, total }: { label: string; done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  const complete = total > 0 && done >= total
  const barColor = complete ? '#10b981' : 'var(--sm-red, #BC0000)'

  return (
    <div className="rounded-xl border p-4" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-bold" style={{ color: 'var(--sm-text)' }}>
          {label} {complete && <span style={{ color: '#10b981' }}>&#10003;</span>}
        </span>
        <span className="text-xs tabular-nums" style={{ color: 'var(--sm-text-muted)' }}>
          {done} of {total} tasks complete ({pct}%)
        </span>
      </div>
      <div className="w-full h-[10px] rounded-full overflow-hidden" style={{ background: 'var(--sm-border, rgba(255,255,255,0.08))' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: '9999px', transition: 'width 300ms ease' }} />
      </div>
    </div>
  )
}

function TaskRow({
  task,
  expanded,
  onToggleExpand,
  onStatusChange,
  busy,
}: {
  task: SeoTask
  expanded: boolean
  onToggleExpand: () => void
  onStatusChange: (s: SeoTask['status']) => void
  busy: boolean
}) {
  const statusStyle = STATUS_COLORS[task.status]
  const checked = task.status === 'done'
  const lastResult = task.last_check_result
  const lastOk = lastResult?.ok === true

  return (
    <div className="px-4 py-3" style={{ borderColor: 'var(--sm-border)' }}>
      <div className="flex items-start gap-3">
        {/* Checkbox toggles done <-> pending */}
        <button
          onClick={() => onStatusChange(checked ? 'pending' : 'done')}
          disabled={busy}
          aria-label={checked ? 'Mark not done' : 'Mark done'}
          className="mt-0.5 shrink-0 h-5 w-5 rounded border flex items-center justify-center transition-colors disabled:opacity-40"
          style={{
            background: checked ? '#24BF6C' : 'transparent',
            borderColor: checked ? '#24BF6C' : 'var(--sm-border)',
          }}
        >
          {checked && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6.5L4.5 9L10 3.5" stroke="#0B0F14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {task.tip_number && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--sm-text-muted)' }}>
                Tip #{task.tip_number}
              </span>
            )}
            {task.pr_number && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                    style={{ background: 'rgba(0,212,255,0.10)', color: '#00D4FF' }}>
                PR-{task.pr_number}
              </span>
            )}
            <span className="text-sm font-semibold" style={{ color: 'var(--sm-text)' }}>
              {task.title}
            </span>
            {task.auto_marked_done && (
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                    style={{ background: 'rgba(36,191,108,0.15)', color: '#24BF6C' }}>
                Auto-marked
              </span>
            )}
            {task.auto_check && (
              <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--sm-text-dim)' }}>
                Auto-check
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {task.evidence_url && (
              <a href={task.evidence_url} target="_blank" rel="noreferrer"
                 className="text-[11px] underline truncate max-w-[400px]"
                 style={{ color: 'var(--sm-text-muted)' }}>
                {task.evidence_url}
              </a>
            )}
            {task.last_checked_at && (
              <span className="text-[11px]" style={{ color: lastOk ? '#24BF6C' : (lastResult ? '#FF6B6B' : 'var(--sm-text-dim)') }}>
                {lastOk ? '✅' : '🔴'} checked {relativeTime(task.last_checked_at)}
              </span>
            )}
            {(task.description || task.acceptance) && (
              <button onClick={onToggleExpand} className="text-[11px] underline"
                      style={{ color: 'var(--sm-text-dim)' }}>
                {expanded ? 'Hide details' : 'Show details'}
              </button>
            )}
          </div>

          {expanded && (
            <div className="mt-2 rounded-md p-3 text-[12px] flex flex-col gap-2"
                 style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--sm-text-muted)' }}>
              {task.description && <div><strong style={{ color: 'var(--sm-text)' }}>What:</strong> {task.description}</div>}
              {task.acceptance && <div><strong style={{ color: 'var(--sm-text)' }}>Acceptance:</strong> {task.acceptance}</div>}
              {task.last_check_result?.notes && (
                <div><strong style={{ color: 'var(--sm-text)' }}>Last probe:</strong> {task.last_check_result.notes}</div>
              )}
            </div>
          )}
        </div>

        <select
          value={task.status}
          onChange={e => onStatusChange(e.target.value as SeoTask['status'])}
          disabled={busy}
          className="text-[11px] font-bold uppercase tracking-wider rounded px-2 py-1 disabled:opacity-40"
          style={{ background: statusStyle.bg, color: statusStyle.fg, border: 'none' }}
        >
          {STATUSES.map(s => <option key={s} value={s} style={{ background: '#0B0F14', color: '#FAFAFB' }}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>
    </div>
  )
}
