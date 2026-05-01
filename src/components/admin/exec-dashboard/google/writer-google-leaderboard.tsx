'use client'

import React, { useMemo, useState } from 'react'
import type { WriterLeaderboardRow } from '@/lib/google/types'
import type { WriterEngagementRow } from './google-tab'

const C = { cyan: '#00D4FF', red: '#BC0000', gold: '#D6B05E', green: '#00D4FF' }

type SortKey =
  | 'total' | 'searchEssentials' | 'googleNews' | 'trust' | 'spamSafety' | 'technical' | 'opportunity'
  | 'recommendationCount' | 'articlesAnalyzed' | 'engagement_score' | 'overall_score' | 'comments'

type EnrichedRow = WriterLeaderboardRow & {
  engagement_score?: number
  overall_score?: number
  comments?: number
}

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function WriterGoogleLeaderboard({
  writers,
  writerEngagement,
}: {
  writers: WriterLeaderboardRow[]
  writerEngagement?: WriterEngagementRow[]
}) {
  const [sortKey, setSortKey] = useState<SortKey>('overall_score')
  const [dir, setDir] = useState<'asc' | 'desc'>('desc')

  // Merge by normalized display name. The exec-dashboard writers are keyed by
  // WP author IDs while google-intelligence writers use sm_authors UUIDs, so
  // a name-based join is the only reliable bridge between the two systems.
  const enriched: EnrichedRow[] = useMemo(() => {
    const byName = new Map<string, WriterEngagementRow>()
    for (const e of writerEngagement || []) {
      if (!e.name) continue
      byName.set(normalizeName(e.name), e)
    }
    return writers.map(w => {
      const e = byName.get(normalizeName(w.name))
      return {
        ...w,
        engagement_score: e?.engagement_score,
        overall_score: e?.overall_score,
        comments: e?.comments,
      }
    })
  }, [writers, writerEngagement])

  const sorted = useMemo(() => {
    const arr = [...enriched]
    arr.sort((a, b) => {
      const av = pick(a, sortKey)
      const bv = pick(b, sortKey)
      return dir === 'desc' ? bv - av : av - bv
    })
    return arr
  }, [enriched, sortKey, dir])

  const onSort = (k: SortKey) => {
    if (k === sortKey) setDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(k); setDir('desc') }
  }

  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--sm-border)' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--sm-text)' }}>Writer Leaderboard</h3>
        <span className="text-xs tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>{writers.length} writers</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--sm-border)' }}>
              <Th>Writer</Th>
              <Th onClick={() => onSort('articlesAnalyzed')} active={sortKey === 'articlesAnalyzed'} dir={dir} align="right">Articles</Th>
              <Th onClick={() => onSort('total')}            active={sortKey === 'total'}            dir={dir} align="right">Google</Th>
              <Th onClick={() => onSort('searchEssentials')} active={sortKey === 'searchEssentials'} dir={dir} align="right">SEO</Th>
              <Th onClick={() => onSort('googleNews')}       active={sortKey === 'googleNews'}       dir={dir} align="right">News</Th>
              <Th onClick={() => onSort('trust')}            active={sortKey === 'trust'}            dir={dir} align="right">Trust</Th>
              <Th onClick={() => onSort('spamSafety')}       active={sortKey === 'spamSafety'}       dir={dir} align="right">Spam</Th>
              <Th onClick={() => onSort('technical')}        active={sortKey === 'technical'}        dir={dir} align="right">Tech</Th>
              <Th onClick={() => onSort('opportunity')}      active={sortKey === 'opportunity'}      dir={dir} align="right">Opp</Th>
              <Th onClick={() => onSort('comments')}         active={sortKey === 'comments'}         dir={dir} align="right">Comments</Th>
              <Th onClick={() => onSort('engagement_score')} active={sortKey === 'engagement_score'} dir={dir} align="right">Engagement</Th>
              <Th onClick={() => onSort('overall_score')}    active={sortKey === 'overall_score'}    dir={dir} align="right">Overall</Th>
              <Th onClick={() => onSort('recommendationCount')} active={sortKey === 'recommendationCount'} dir={dir} align="right">Recs</Th>
              <Th align="right">Trend</Th>
              <Th align="right">Last rescored</Th>
              <Th align="center">Status</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((w) => (
              <tr key={w.authorId} className="transition-colors" style={{ borderBottom: '1px solid var(--sm-border)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sm-card-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <Td>
                  <span className="font-medium" style={{ color: 'var(--sm-text)' }}>{w.name}</span>
                </Td>
                <Td align="right" muted>{w.articlesAnalyzed}</Td>
                <Td align="right"><strong style={{ color: scoreTone(w.total) }}>{w.total}</strong></Td>
                <Td align="right" muted>{w.sub.searchEssentials}</Td>
                <Td align="right" muted>{w.sub.googleNews}</Td>
                <Td align="right" muted>{w.sub.trust}</Td>
                <Td align="right" muted>{w.sub.spamSafety}</Td>
                <Td align="right" muted>{w.sub.technical}</Td>
                <Td align="right" muted>{w.sub.opportunity}</Td>
                <Td align="right" muted>{w.comments != null ? w.comments : '—'}</Td>
                <Td align="right">
                  {w.engagement_score != null
                    ? <strong style={{ color: scoreTone(w.engagement_score) }}>{w.engagement_score}</strong>
                    : <span style={{ color: 'var(--sm-text-dim)' }}>—</span>}
                </Td>
                <Td align="right">
                  {w.overall_score != null
                    ? <strong style={{ color: scoreTone(w.overall_score) }}>{w.overall_score}</strong>
                    : <span style={{ color: 'var(--sm-text-dim)' }}>—</span>}
                </Td>
                <Td align="right">
                  <span className="text-sm font-bold tabular-nums" style={{ color: w.recommendationCount > 5 ? C.red : 'var(--sm-text)' }}>
                    {w.recommendationCount}
                  </span>
                </Td>
                <Td align="right">
                  <span className="text-sm tabular-nums" style={{ color: w.trend > 0 ? C.green : w.trend < 0 ? C.red : 'var(--sm-text-dim)' }}>
                    {w.trend > 0 ? '+' : ''}{w.trend.toFixed(1)}
                  </span>
                </Td>
                <Td align="right" muted>{relTime(w.lastRescoredAt)}</Td>
                <Td align="center"><StatusDot status={w.status} /></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ children, onClick, active, dir, align = 'left' }: { children: React.ReactNode; onClick?: () => void; active?: boolean; dir?: 'asc' | 'desc'; align?: 'left' | 'right' | 'center' }) {
  return (
    <th className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}
        style={{ color: active ? 'var(--sm-red-light)' : 'var(--sm-text-dim)', cursor: onClick ? 'pointer' : 'default' }}
        onClick={onClick}>
      {children}{active && (dir === 'desc' ? ' ↓' : ' ↑')}
    </th>
  )
}
function Td({ children, align = 'left', muted }: { children: React.ReactNode; align?: 'left' | 'right' | 'center'; muted?: boolean }) {
  return <td className={`px-3 py-2.5 ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'} tabular-nums`} style={{ color: muted ? 'var(--sm-text-muted)' : 'var(--sm-text)' }}>{children}</td>
}
function StatusDot({ status }: { status: 'green' | 'amber' | 'red' }) {
  const m = { green: C.green, amber: C.gold, red: C.red }
  return <span className="inline-block w-2 h-2 rounded-full" style={{ background: m[status] }} />
}
function pick(w: EnrichedRow, k: SortKey): number {
  if (k === 'total' || k === 'recommendationCount' || k === 'articlesAnalyzed') return (w as any)[k] ?? 0
  if (k === 'engagement_score' || k === 'overall_score' || k === 'comments') return (w as any)[k] ?? -1
  return (w.sub as any)[k] ?? 0
}
function scoreTone(v: number): string {
  if (v >= 80) return '#00D4FF'
  if (v >= 60) return C.gold
  return C.red
}
function relTime(iso: string): string {
  const s = Math.floor((Date.now() - Date.parse(iso)) / 1000)
  if (Number.isNaN(s)) return '—'
  if (s < 3600)  return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}
