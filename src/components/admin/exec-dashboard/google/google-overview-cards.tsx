'use client'

import React from 'react'
import type { GoogleTabPayload } from '@/lib/google/types'

const C = { cyan: '#00D4FF', red: '#BC0000', gold: '#D6B05E' }

export function GoogleOverviewCards({ data }: { data: GoogleTabPayload }) {
  const o = data.overview
  const cards: Array<{ label: string; value: string; hint?: string; tone?: string; sourceType?: string }> = [
    { label: 'Google Score',          value: `${o.googleScore}`, hint: `Δ ${fmtDelta(o.deltaVsPriorPeriod)} vs prior`, tone: scoreTone(o.googleScore) },
    { label: 'Search Essentials',     value: `${o.sub.searchEssentials} / 25`, sourceType: 'official-policy', tone: ratioTone(o.sub.searchEssentials, 25) },
    { label: 'Google News',           value: `${o.sub.googleNews} / 20`,       sourceType: 'official-policy', tone: ratioTone(o.sub.googleNews, 20) },
    { label: 'Trust',                 value: `${o.sub.trust} / 15`,            sourceType: 'internal-heuristic', tone: ratioTone(o.sub.trust, 15) },
    { label: 'Spam Risk',             value: `${o.sub.spamSafety} / 15`, hint: 'higher = safer', sourceType: 'official-policy', tone: ratioTone(o.sub.spamSafety, 15) },
    { label: 'Technical',             value: `${o.sub.technical} / 15`,        sourceType: 'official-policy', tone: ratioTone(o.sub.technical, 15) },
    { label: 'Opportunity',           value: `${o.sub.opportunity} / 10`,      sourceType: 'sportsmockery-opportunity', tone: ratioTone(o.sub.opportunity, 10) },
    { label: 'Avg Writer Score',      value: `${o.avgWriterScore}`,            tone: scoreTone(o.avgWriterScore) },
    { label: 'High-Risk Articles',    value: `${o.highRiskArticleCount}`,      tone: o.highRiskArticleCount === 0 ? '#00D4FF' : C.red },
    { label: 'News-Ready %',          value: `${o.newsReadyArticlePct}%`,      tone: ratioTone(o.newsReadyArticlePct, 100) },
    { label: 'Last Scoring Run',      value: relTime(o.lastScoringRunAt) },
    { label: 'Active Ruleset',        value: data.rulesetVersion },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border p-3" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text-dim)' }}>{c.label}</p>
            {c.sourceType && <SourceTypeBadge sourceType={c.sourceType} />}
          </div>
          <p className="mt-1 text-2xl font-extrabold tabular-nums" style={{ color: c.tone ?? 'var(--sm-text)' }}>{c.value}</p>
          {c.hint && <p className="text-[11px] mt-0.5" style={{ color: 'var(--sm-text-dim)' }}>{c.hint}</p>}
        </div>
      ))}
    </div>
  )
}

export function SourceTypeBadge({ sourceType }: { sourceType: string }) {
  const map: Record<string, { label: string; bg: string; fg: string }> = {
    'official-policy':         { label: 'Policy',      bg: 'rgba(0,212,255,0.12)', fg: C.cyan },
    'internal-heuristic':      { label: 'Heuristic',   bg: 'rgba(214,176,94,0.12)', fg: C.gold },
    'sportsmockery-opportunity': { label: 'SM',         bg: 'rgba(188,0,0,0.12)', fg: C.red },
  }
  const m = map[sourceType] ?? { label: sourceType, bg: 'rgba(255,255,255,0.06)', fg: 'var(--sm-text-dim)' }
  return (
    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: m.bg, color: m.fg }}>
      {m.label}
    </span>
  )
}

function ratioTone(v: number, max: number): string {
  const r = v / max
  if (r >= 0.85) return '#00D4FF'
  if (r >= 0.65) return C.cyan
  if (r >= 0.45) return C.gold
  return C.red
}
function scoreTone(v: number): string {
  if (v >= 80) return '#00D4FF'
  if (v >= 60) return C.gold
  return C.red
}
function fmtDelta(n: number): string {
  if (n === 0) return '0.0'
  return (n > 0 ? '+' : '') + n.toFixed(1)
}
function relTime(iso: string): string {
  const s = Math.floor((Date.now() - Date.parse(iso)) / 1000)
  if (Number.isNaN(s)) return '—'
  if (s < 60)    return 'just now'
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
