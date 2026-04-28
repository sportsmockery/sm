'use client'

import React from 'react'
import type { OperationsSnapshot } from '@/lib/google/types'

const C = { cyan: '#00D4FF', red: '#BC0000', gold: '#D6B05E', green: '#00D4FF' }

export function GoogleOperationsProofPanel({ ops }: { ops: OperationsSnapshot }) {
  const tiles: Array<{ label: string; value: string; tone?: string }> = [
    { label: 'Last article imported',  value: relTime(ops.lastArticleImportedAt) },
    { label: 'Last article scored',    value: relTime(ops.lastArticleScoredAt) },
    { label: 'Scored last 24h',        value: `${ops.scoredLast24h}` },
    { label: 'Rescans last 24h',       value: `${ops.rescansLast24h}` },
    { label: 'Pending queue depth',    value: `${ops.pendingQueueDepth}`,    tone: ops.pendingQueueDepth > 25 ? C.gold : undefined },
    { label: 'Failed jobs',            value: `${ops.failedJobsCount}`,      tone: ops.failedJobsCount > 0 ? C.red : C.green },
    { label: 'Last successful job',    value: relTime(ops.lastSuccessfulJobAt) },
    { label: 'Active ruleset',         value: ops.activeRulesetVersion },
    { label: 'Awaiting (content)',     value: `${ops.awaitingRescoreContent}` },
    { label: 'Awaiting (author)',      value: `${ops.awaitingRescoreAuthor}` },
    { label: 'Suppressions/overrides', value: `${ops.suppressionsCount}` },
    // ── Transparency tiles ────────────────────────────────────────────────
    { label: 'Last transparency scan', value: relTime(ops.lastTransparencyScanAt) },
    { label: 'Pending TP rescans',     value: `${ops.pendingTransparencyRescans}`,    tone: ops.pendingTransparencyRescans > 5 ? C.gold : undefined },
    { label: 'TP failures (24h)',      value: `${ops.transparencyFailuresLast24h}`,   tone: ops.transparencyFailuresLast24h > 0 ? C.red : C.green },
    { label: 'TP assets under review', value: `${ops.transparencyAssetsUnderReview}`, tone: ops.transparencyAssetsUnderReview > 0 ? C.gold : undefined },
  ]

  return (
    <div className="rounded-lg border" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--sm-border)' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--sm-text)' }}>Operations Proof</h3>
        <span className="text-xs tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>continuous scoring system</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 p-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-lg border p-3" style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--sm-text-dim)' }}>{t.label}</p>
            <p className="mt-1 text-base font-extrabold tabular-nums" style={{ color: t.tone ?? 'var(--sm-text)' }}>{t.value}</p>
          </div>
        ))}
      </div>
      <div className="px-4 pb-4">
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--sm-text-dim)' }}>Recent audit log</p>
        <div className="rounded-md border overflow-hidden" style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--sm-border)' }}>
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--sm-text-dim)' }}>When</th>
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--sm-text-dim)' }}>Actor</th>
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--sm-text-dim)' }}>Action</th>
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--sm-text-dim)' }}>Target</th>
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--sm-text-dim)' }}>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {ops.recentAudit.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-sm" style={{ color: 'var(--sm-text-dim)' }}>No recent audit events.</td></tr>
              )}
              {ops.recentAudit.map((e) => (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--sm-border)' }}>
                  <td className="px-3 py-2 text-[12px] tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>{relTime(e.occurredAt)}</td>
                  <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--sm-text-muted)' }}>{e.actor}</td>
                  <td className="px-3 py-2 text-[12px] font-mono" style={{ color: C.cyan }}>{e.action}</td>
                  <td className="px-3 py-2 text-[12px]" style={{ color: 'var(--sm-text)' }}>{e.target}</td>
                  <td className="px-3 py-2 text-[11px] font-mono truncate" style={{ color: 'var(--sm-text-dim)', maxWidth: 320 }}>{JSON.stringify(e.metadata)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function relTime(iso: string | null): string {
  if (!iso) return '—'
  const s = Math.floor((Date.now() - Date.parse(iso)) / 1000)
  if (Number.isNaN(s)) return '—'
  if (s < 60)    return 'just now'
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
