'use client'

import React, { useMemo, useState } from 'react'
import type { ArticleAnalysisRow } from '@/lib/google/types'

const C = { cyan: '#00D4FF', red: '#BC0000', gold: '#D6B05E', green: '#00D4FF' }

type SortKey = 'total' | 'searchEssentials' | 'googleNews' | 'trust' | 'spamSafety' | 'technical' | 'headlineScore' | 'recommendationCount' | 'publishedAt' | 'updatedAt'

export function GoogleArticleAnalysisTable({ articles }: { articles: ArticleAnalysisRow[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'green' | 'amber' | 'red'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('total')
  const [dir, setDir] = useState<'asc' | 'desc'>('asc')

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      if (!search) return true
      const blob = `${a.title} ${a.author} ${a.category} ${a.topic}`.toLowerCase()
      return blob.includes(search.toLowerCase())
    })
  }, [articles, search, statusFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((x, y) => {
      const xv = pick(x, sortKey)
      const yv = pick(y, sortKey)
      return dir === 'desc' ? yv - xv : xv - yv
    })
  }, [filtered, sortKey, dir])

  const onSort = (k: SortKey) => { if (k === sortKey) setDir(d => d === 'desc' ? 'asc' : 'desc'); else { setSortKey(k); setDir('desc') } }

  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--sm-border)' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--sm-text)' }}>Article Analysis</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            placeholder="Search articles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-md border tabular-nums focus:outline-none"
            style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)', color: 'var(--sm-text)', minWidth: 220 }}
          />
          {(['all', 'green', 'amber', 'red'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors"
              style={{
                background: statusFilter === s ? 'rgba(188,0,0,0.12)' : 'transparent',
                color: statusFilter === s ? 'var(--sm-red-light)' : 'var(--sm-text-dim)',
                border: '1px solid var(--sm-border)',
              }}>
              {s}
            </button>
          ))}
          <span className="text-xs tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>{sorted.length} / {articles.length}</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--sm-border)' }}>
              <Th>Article</Th>
              <Th>Author</Th>
              <Th onClick={() => onSort('publishedAt')} active={sortKey === 'publishedAt'} dir={dir} align="right">Published</Th>
              <Th onClick={() => onSort('updatedAt')}   active={sortKey === 'updatedAt'}   dir={dir} align="right">Updated</Th>
              <Th align="right">Rescored</Th>
              <Th>Category</Th>
              <Th>Topic</Th>
              <Th onClick={() => onSort('total')}            active={sortKey === 'total'}            dir={dir} align="right">Google</Th>
              <Th onClick={() => onSort('searchEssentials')} active={sortKey === 'searchEssentials'} dir={dir} align="right">SEO</Th>
              <Th onClick={() => onSort('googleNews')}       active={sortKey === 'googleNews'}       dir={dir} align="right">News</Th>
              <Th onClick={() => onSort('trust')}            active={sortKey === 'trust'}            dir={dir} align="right">Trust</Th>
              <Th onClick={() => onSort('spamSafety')}       active={sortKey === 'spamSafety'}       dir={dir} align="right">Spam</Th>
              <Th onClick={() => onSort('technical')}        active={sortKey === 'technical'}        dir={dir} align="right">Tech</Th>
              <Th onClick={() => onSort('headlineScore')}    active={sortKey === 'headlineScore'}    dir={dir} align="right">Head</Th>
              <Th onClick={() => onSort('recommendationCount')} active={sortKey === 'recommendationCount'} dir={dir} align="right">Recs</Th>
              <Th align="right">Ruleset</Th>
              <Th align="center">Status</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={17} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--sm-text-dim)' }}>No articles match the current filters.</td></tr>
            )}
            {sorted.map((a) => (
              <tr key={a.articleId} className="transition-colors" style={{ borderBottom: '1px solid var(--sm-border)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sm-card-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <Td><span className="font-medium block truncate" style={{ color: 'var(--sm-text)', maxWidth: 280 }}>{a.title}</span></Td>
                <Td muted>{a.author}</Td>
                <Td align="right" muted>{shortDate(a.publishedAt)}</Td>
                <Td align="right" muted>{shortDate(a.updatedAt)}</Td>
                <Td align="right" muted>{relTime(a.lastRescoredAt)}</Td>
                <Td muted>{a.category}</Td>
                <Td muted>{a.topic}</Td>
                <Td align="right"><strong style={{ color: scoreTone(a.total) }}>{a.total}</strong></Td>
                <Td align="right" muted>{a.sub.searchEssentials}</Td>
                <Td align="right" muted>{a.sub.googleNews}</Td>
                <Td align="right" muted>{a.sub.trust}</Td>
                <Td align="right" muted>{a.sub.spamSafety}</Td>
                <Td align="right" muted>{a.sub.technical}</Td>
                <Td align="right" muted>{a.headlineScore}</Td>
                <Td align="right">
                  <span className="text-sm font-bold tabular-nums" style={{ color: a.recommendationCount > 5 ? C.red : a.recommendationCount > 0 ? C.gold : 'var(--sm-text)' }}>
                    {a.recommendationCount}
                  </span>
                </Td>
                <Td align="right" muted>{a.rulesetVersion}</Td>
                <Td align="center"><StatusDot status={a.status} /></Td>
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
function pick(a: ArticleAnalysisRow, k: SortKey): number {
  if (k === 'publishedAt' || k === 'updatedAt') return Date.parse((a as any)[k]) || 0
  if (k === 'total' || k === 'recommendationCount' || k === 'headlineScore') return (a as any)[k]
  return (a.sub as any)[k]
}
function scoreTone(v: number): string {
  if (v >= 80) return '#00D4FF'
  if (v >= 60) return C.gold
  return C.red
}
function shortDate(iso: string): string { try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) } catch { return '—' } }
function relTime(iso: string): string {
  const s = Math.floor((Date.now() - Date.parse(iso)) / 1000)
  if (Number.isNaN(s)) return '—'
  if (s < 3600)  return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}
