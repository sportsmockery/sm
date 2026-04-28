'use client'

import React, { useMemo, useState } from 'react'
import type { Recommendation } from '@/lib/google/types'
import { SourceTypeBadge } from './google-overview-cards'

const C = { cyan: '#00D4FF', red: '#BC0000', gold: '#D6B05E', green: '#00D4FF' }

const SCOPE_LABEL: Record<Recommendation['scope'], string> = {
  article: 'Article', author: 'Author', sitewide: 'Sitewide', transparency_asset: 'Transparency',
}

export function GoogleRecommendationsPanel({ recommendations }: { recommendations: Recommendation[] }) {
  const [scope, setScope] = useState<Recommendation['scope'] | 'all'>('all')
  const [severity, setSeverity] = useState<Recommendation['severity'] | 'all'>('all')

  const filtered = useMemo(() => recommendations.filter((r) =>
    (scope === 'all' || r.scope === scope) &&
    (severity === 'all' || r.severity === severity)
  ).sort((a, b) => sevWeight(b.severity) - sevWeight(a.severity) || b.impactScore - a.impactScore), [recommendations, scope, severity])

  return (
    <div className="rounded-lg border" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--sm-border)' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--sm-text)' }}>Recommendations</h3>
        <div className="flex flex-wrap gap-2">
          {(['all', 'article', 'author', 'sitewide', 'transparency_asset'] as const).map((s) => (
            <Pill key={s} active={scope === s} onClick={() => setScope(s)} label={s === 'transparency_asset' ? 'transparency' : s} />
          ))}
          <span className="mx-1" style={{ color: 'var(--sm-text-dim)' }}>·</span>
          {(['all', 'critical', 'high', 'medium', 'low', 'info'] as const).map((s) => (
            <Pill key={s} active={severity === s} onClick={() => setSeverity(s)} label={s} />
          ))}
        </div>
      </div>
      <div>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm" style={{ color: 'var(--sm-text-dim)' }}>No recommendations match the current filters.</p>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="px-4 py-3 flex items-start gap-4" style={{ borderBottom: '1px solid var(--sm-border)' }}>
            <SeverityBadge severity={r.severity} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm" style={{ color: 'var(--sm-text)' }}>{r.title}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--sm-text-dim)' }}>
                  {SCOPE_LABEL[r.scope]} · {r.scopeId}
                </span>
                <SourceTypeBadge sourceType={r.sourceType} />
                <StatusBadge status={r.status} />
                <span className="text-[10px] tabular-nums ml-auto" style={{ color: 'var(--sm-text-dim)' }}>
                  owner {r.owner} · impact {r.impactScore} · conf {(r.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-sm mt-1 whitespace-pre-line" style={{ color: 'var(--sm-text-muted)' }}>{r.detail}</p>
              <p className="text-[11px] mt-1 tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>
                aging {r.agingHours.toFixed(1)}h · created {relTime(r.createdAt)} · updated {relTime(r.updatedAt)} · ruleset {r.rulesetVersion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Pill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors"
      style={{
        background: active ? 'rgba(188,0,0,0.12)' : 'transparent',
        color: active ? 'var(--sm-red-light)' : 'var(--sm-text-dim)',
        border: '1px solid var(--sm-border)',
      }}>
      {label}
    </button>
  )
}
function SeverityBadge({ severity }: { severity: Recommendation['severity'] }) {
  const m: Record<Recommendation['severity'], { label: string; bg: string; fg: string }> = {
    critical: { label: 'CRIT',   bg: 'rgba(188,0,0,0.18)',   fg: C.red },
    high:     { label: 'HIGH',   bg: 'rgba(188,0,0,0.10)',   fg: C.red },
    medium:   { label: 'MED',    bg: 'rgba(214,176,94,0.12)', fg: C.gold },
    low:      { label: 'LOW',    bg: 'rgba(0,212,255,0.08)',  fg: C.cyan },
    info:     { label: 'INFO',   bg: 'rgba(255,255,255,0.04)', fg: 'var(--sm-text-dim)' },
  }
  const v = m[severity]
  return <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded" style={{ background: v.bg, color: v.fg, minWidth: 56, textAlign: 'center' }}>{v.label}</span>
}
function StatusBadge({ status }: { status: Recommendation['status'] }) {
  const m: Record<Recommendation['status'], string> = {
    open: 'OPEN', in_progress: 'IN PROG', resolved: 'RESOLVED', suppressed: 'SUPPRESSED', expired: 'EXPIRED',
  }
  return <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--sm-text-muted)' }}>{m[status]}</span>
}
function sevWeight(s: Recommendation['severity']): number {
  return { critical: 5, high: 4, medium: 3, low: 2, info: 1 }[s]
}
function relTime(iso: string): string {
  const s = Math.floor((Date.now() - Date.parse(iso)) / 1000)
  if (Number.isNaN(s)) return '—'
  if (s < 60)    return 'just now'
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
