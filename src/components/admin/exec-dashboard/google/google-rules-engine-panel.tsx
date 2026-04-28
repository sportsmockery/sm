'use client'

import React, { useMemo, useState } from 'react'
import type { RuleEvaluation } from '@/lib/google/types'
import { SourceTypeBadge } from './google-overview-cards'

const C = { cyan: '#00D4FF', red: '#BC0000', gold: '#D6B05E', green: '#00D4FF' }

const FAMILY_LABELS: Record<RuleEvaluation['ruleFamily'], string> = {
  search_essentials:        'Search Essentials',
  google_news:              'Google News',
  trust_eeat:               'Trust / E-E-A-T',
  spam_policy:              'Spam Policy',
  technical_indexability:   'Technical',
  sportsmockery_opportunity: 'SM Opportunity',
  transparency_assets:      'Transparency Assets',
}

export function GoogleRulesEnginePanel({ rules }: { rules: RuleEvaluation[] }) {
  const [familyFilter, setFamilyFilter] = useState<RuleEvaluation['ruleFamily'] | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<RuleEvaluation['status'] | 'all'>('all')

  const families = useMemo(() => Array.from(new Set(rules.map((r) => r.ruleFamily))), [rules])
  const filtered = rules.filter((r) =>
    (familyFilter === 'all' || r.ruleFamily === familyFilter) &&
    (statusFilter === 'all' || r.status === statusFilter)
  )

  return (
    <div className="rounded-lg border" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--sm-border)' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--sm-text)' }}>Rules Engine</h3>
        <div className="flex flex-wrap gap-2">
          <FilterPill active={familyFilter === 'all'} onClick={() => setFamilyFilter('all')} label="All families" />
          {families.map((f) => (
            <FilterPill key={f} active={familyFilter === f} onClick={() => setFamilyFilter(f)} label={FAMILY_LABELS[f]} />
          ))}
          <span className="mx-1" style={{ color: 'var(--sm-text-dim)' }}>·</span>
          {(['all', 'pass', 'warn', 'fail'] as const).map((s) => (
            <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} label={s} />
          ))}
        </div>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--sm-border)' }}>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm" style={{ color: 'var(--sm-text-dim)' }}>No rule evaluations match the current filters.</p>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="px-4 py-3 flex items-start gap-4" style={{ borderBottom: '1px solid var(--sm-border)' }}>
            <StatusBadge status={r.status} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm" style={{ color: 'var(--sm-text)' }}>{r.ruleId}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--sm-text-dim)' }}>
                  {FAMILY_LABELS[r.ruleFamily]}
                </span>
                <SourceTypeBadge sourceType={r.sourceType} />
                {r.impactedField && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,212,255,0.08)', color: C.cyan }}>
                    {r.impactedField}
                  </span>
                )}
                <span className="text-[10px] tabular-nums ml-auto" style={{ color: 'var(--sm-text-dim)' }}>
                  conf {(r.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--sm-text-muted)' }}>{r.explanation}</p>
              {r.remediation && (
                <p className="text-sm mt-1 italic" style={{ color: C.cyan }}>→ {r.remediation}</p>
              )}
              <p className="text-[11px] mt-1 tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>
                article {r.articleId} · ruleset {r.rulesetVersion} · evaluated {relTime(r.evaluatedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
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

function StatusBadge({ status }: { status: RuleEvaluation['status'] }) {
  const m: Record<RuleEvaluation['status'], { label: string; bg: string; fg: string }> = {
    pass:           { label: 'PASS', bg: 'rgba(0,212,255,0.12)', fg: C.green },
    warn:           { label: 'WARN', bg: 'rgba(214,176,94,0.12)', fg: C.gold },
    fail:           { label: 'FAIL', bg: 'rgba(188,0,0,0.12)',   fg: C.red },
    not_applicable: { label: 'N/A',  bg: 'rgba(255,255,255,0.04)', fg: 'var(--sm-text-dim)' },
  }
  const v = m[status]
  return <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded" style={{ background: v.bg, color: v.fg, minWidth: 48, textAlign: 'center' }}>{v.label}</span>
}

function relTime(iso: string): string {
  const s = Math.floor((Date.now() - Date.parse(iso)) / 1000)
  if (Number.isNaN(s)) return '—'
  if (s < 60)    return 'just now'
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
