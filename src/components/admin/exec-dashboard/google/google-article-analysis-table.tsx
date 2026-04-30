'use client'

import React, { useMemo, useState } from 'react'
import type { ArticleAnalysisRow, RuleEvaluation, Recommendation } from '@/lib/google/types'

const C = { cyan: '#00D4FF', red: '#BC0000', gold: '#D6B05E', green: '#00D4FF' }

type SortKey = 'total' | 'searchEssentials' | 'googleNews' | 'trust' | 'spamSafety' | 'technical' | 'headlineScore' | 'recommendationCount' | 'publishedAt' | 'updatedAt'

interface Props {
  articles: ArticleAnalysisRow[]
  rules?: RuleEvaluation[]
  recommendations?: Recommendation[]
}

const RULE_FAMILY_LABEL: Record<string, string> = {
  search_essentials: 'SEO',
  google_news: 'News',
  trust_eeat: 'Trust',
  spam_policy: 'Spam',
  technical_indexability: 'Tech',
  sportsmockery_opportunity: 'Opp',
  transparency_assets: 'Transparency',
}

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
}

export function GoogleArticleAnalysisTable({ articles, rules = [], recommendations = [] }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'green' | 'amber' | 'red'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('total')
  const [dir, setDir] = useState<'asc' | 'desc'>('asc')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Group rule evaluations + recommendations by article id once.
  const rulesByArticle = useMemo(() => {
    const map = new Map<string, RuleEvaluation[]>()
    for (const r of rules) {
      if (r.status === 'pass' || r.status === 'not_applicable') continue
      const arr = map.get(r.articleId) ?? []
      arr.push(r)
      map.set(r.articleId, arr)
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => {
        const aw = a.status === 'fail' ? 0 : 1
        const bw = b.status === 'fail' ? 0 : 1
        return aw - bw || (b.confidence - a.confidence)
      })
    }
    return map
  }, [rules])

  const recsByArticle = useMemo(() => {
    const map = new Map<string, Recommendation[]>()
    for (const r of recommendations) {
      if (r.scope !== 'article') continue
      if (r.status === 'resolved' || r.status === 'expired') continue
      const arr = map.get(r.scopeId) ?? []
      arr.push(r)
      map.set(r.scopeId, arr)
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || b.impactScore - a.impactScore)
    }
    return map
  }, [recommendations])

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
  const toggle = (id: string) => setExpandedId((curr) => (curr === id ? null : id))

  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--sm-border)' }}>
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--sm-text)' }}>Article Analysis</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--sm-text-dim)' }}>Click any row to see what&apos;s wrong and how to fix it.</p>
        </div>
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
              <Th> </Th>
              <Th>Article</Th>
              <Th>Author</Th>
              <Th onClick={() => onSort('publishedAt')} active={sortKey === 'publishedAt'} dir={dir} align="right">Published</Th>
              <Th onClick={() => onSort('updatedAt')}   active={sortKey === 'updatedAt'}   dir={dir} align="right">Updated</Th>
              <Th align="right">Rescored</Th>
              <Th>Category</Th>
              <Th onClick={() => onSort('total')}            active={sortKey === 'total'}            dir={dir} align="right">Google</Th>
              <Th onClick={() => onSort('searchEssentials')} active={sortKey === 'searchEssentials'} dir={dir} align="right">SEO</Th>
              <Th onClick={() => onSort('googleNews')}       active={sortKey === 'googleNews'}       dir={dir} align="right">News</Th>
              <Th onClick={() => onSort('trust')}            active={sortKey === 'trust'}            dir={dir} align="right">Trust</Th>
              <Th onClick={() => onSort('spamSafety')}       active={sortKey === 'spamSafety'}       dir={dir} align="right">Spam</Th>
              <Th onClick={() => onSort('technical')}        active={sortKey === 'technical'}        dir={dir} align="right">Tech</Th>
              <Th onClick={() => onSort('headlineScore')}    active={sortKey === 'headlineScore'}    dir={dir} align="right">Head</Th>
              <Th onClick={() => onSort('recommendationCount')} active={sortKey === 'recommendationCount'} dir={dir} align="right">Issues</Th>
              <Th align="right">Ruleset</Th>
              <Th align="center">Status</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={17} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--sm-text-dim)' }}>No articles match the current filters.</td></tr>
            )}
            {sorted.map((a) => {
              const isOpen = expandedId === a.articleId
              const articleRules = rulesByArticle.get(a.articleId) ?? []
              const articleRecs = recsByArticle.get(a.articleId) ?? []
              return (
                <React.Fragment key={a.articleId}>
                  <tr
                    className="transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid var(--sm-border)', background: isOpen ? 'var(--sm-card-hover)' : 'transparent' }}
                    onClick={() => toggle(a.articleId)}
                    onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = 'var(--sm-card-hover)' }}
                    onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = 'transparent' }}
                  >
                    <Td align="center" muted>
                      <span style={{ display: 'inline-block', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 150ms', color: 'var(--sm-text-dim)' }}>▶</span>
                    </Td>
                    <Td><span className="font-medium block truncate" style={{ color: 'var(--sm-text)', maxWidth: 280 }}>{a.title}</span></Td>
                    <Td muted>{a.author}</Td>
                    <Td align="right" muted>{shortDate(a.publishedAt)}</Td>
                    <Td align="right" muted>{shortDate(a.updatedAt)}</Td>
                    <Td align="right" muted>{relTime(a.lastRescoredAt)}</Td>
                    <Td muted>{a.category}</Td>
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
                  {isOpen && (
                    <tr style={{ borderBottom: '1px solid var(--sm-border)', background: 'var(--sm-surface)' }}>
                      <td colSpan={17} className="px-6 py-4">
                        <ArticleDetailPanel articleRules={articleRules} articleRecs={articleRecs} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ArticleDetailPanel({ articleRules, articleRecs }: { articleRules: RuleEvaluation[]; articleRecs: Recommendation[] }) {
  if (articleRules.length === 0 && articleRecs.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--sm-text-dim)' }}>
        No issues — every rule passed. Nothing to fix on this article.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Rule failures (what's wrong) */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--sm-text-dim)' }}>
          What&apos;s wrong ({articleRules.length})
        </h4>
        {articleRules.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--sm-text-dim)' }}>No rule failures — only soft recommendations remain.</p>
        )}
        <ul className="flex flex-col gap-2">
          {articleRules.map((r) => (
            <li key={r.id} className="rounded-md border p-3" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Pill tone={r.status === 'fail' ? 'red' : 'gold'}>{r.status === 'fail' ? 'fail' : 'warn'}</Pill>
                <Pill tone="cyan">{RULE_FAMILY_LABEL[r.ruleFamily] ?? r.ruleFamily}</Pill>
                <span className="text-[10px] font-mono" style={{ color: 'var(--sm-text-dim)' }}>{r.ruleId}</span>
                {r.impactedField && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}>{r.impactedField}</span>}
              </div>
              <p className="text-sm" style={{ color: 'var(--sm-text)' }}>{r.explanation}</p>
              {r.remediation && (
                <p className="text-xs mt-1.5 pl-2 border-l-2" style={{ color: 'var(--sm-text-muted)', borderColor: C.cyan }}>
                  <strong style={{ color: C.cyan }}>Fix:</strong> {r.remediation}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations (prioritized actions) */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--sm-text-dim)' }}>
          Recommended actions ({articleRecs.length})
        </h4>
        {articleRecs.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--sm-text-dim)' }}>No open recommendations.</p>
        )}
        <ul className="flex flex-col gap-2">
          {articleRecs.map((r) => (
            <li key={r.id} className="rounded-md border p-3" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Pill tone={severityTone(r.severity)}>{SEVERITY_LABEL[r.severity] ?? r.severity}</Pill>
                <Pill tone="cyan">{r.owner}</Pill>
                <span className="text-[10px] tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>impact {r.impactScore}</span>
                <span className="text-[10px] tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>conf {(r.confidence * 100).toFixed(0)}%</span>
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--sm-text)' }}>{r.title}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--sm-text-muted)' }}>{r.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Pill({ tone, children }: { tone: 'red' | 'gold' | 'cyan' | 'muted'; children: React.ReactNode }) {
  const map = {
    red:   { bg: 'rgba(188,0,0,0.12)',   fg: '#BC0000' },
    gold:  { bg: 'rgba(214,176,94,0.14)', fg: '#D6B05E' },
    cyan:  { bg: 'rgba(0,212,255,0.10)',  fg: '#00D4FF' },
    muted: { bg: 'var(--sm-surface)',     fg: 'var(--sm-text-dim)' },
  }[tone]
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: map.bg, color: map.fg }}>
      {children}
    </span>
  )
}

function severityRank(s: Recommendation['severity']): number {
  return ({ critical: 4, high: 3, medium: 2, low: 1, info: 0 } as Record<string, number>)[s] ?? 0
}
function severityTone(s: Recommendation['severity']): 'red' | 'gold' | 'cyan' | 'muted' {
  if (s === 'critical' || s === 'high') return 'red'
  if (s === 'medium') return 'gold'
  return 'cyan'
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
  if (k === 'publishedAt' || k === 'updatedAt') return Date.parse((a as unknown as Record<string, string>)[k]) || 0
  if (k === 'total' || k === 'recommendationCount' || k === 'headlineScore') return (a as unknown as Record<string, number>)[k]
  return (a.sub as unknown as Record<string, number>)[k]
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
