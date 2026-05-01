'use client'

import React, { useMemo, useState } from 'react'
import { Info, ChevronRight } from 'lucide-react'
import type { WriterLeaderboardRow, Recommendation, ArticleAnalysisRow } from '@/lib/google/types'
import type { WriterEngagementRow } from './google-tab'

const C = { cyan: '#00D4FF', red: '#BC0000', gold: '#D6B05E', green: '#00D4FF' }

// Per-column explanations of how the score is calculated. Surfaced as
// hover tooltips on the info icon next to each header. Numbers and
// formulas mirror src/lib/google/google-score-engine.ts (subscore caps)
// and src/app/api/exec-dashboard/route.ts (engagement + overall weights).
const SCORE_INFO: Record<string, string> = {
  Articles: [
    'Number of articles by this writer that the Google rules engine has scored within the selected date window.',
    '',
    'Source: google_article_scores rows joined to sm_posts on article_id, filtered to posts whose published_at falls in the window.',
  ].join('\n'),

  Google: [
    'AVERAGE of this writer\'s per-article Google scores (0–100).',
    '',
    'Each article is scored by the rules engine: every applicable rule evaluates to pass (1.0), warn (0.5), or fail (0.0), weighted by the rule\'s confidence. The article\'s subscores are then summed.',
    '',
    'Total = SEO (25) + News (20) + Trust (15) + Spam (15) + Tech (15) + Opp (10) = 100.',
    '',
    'Source: google_article_scores.total averaged across the writer\'s articles in the window.',
  ].join('\n'),

  SEO: [
    'Search Essentials subscore — out of 25.',
    '',
    'Measures compliance with Google\'s Search Essentials guidelines: crawlability, indexability, structured data, mobile-friendliness, page experience signals, etc.',
    '',
    'Per article: (sum of pass/warn/fail × confidence) ÷ (applicable rules) × 25. Writer-level value is the average across the writer\'s articles in the window.',
  ].join('\n'),

  News: [
    'Google News subscore — out of 20.',
    '',
    'Measures eligibility for Google News surfaces: newsworthiness, original reporting, freshness, attribution, dateline accuracy, byline presence, expert voice.',
    '',
    'Same per-rule weighting as SEO: pass=1.0, warn=0.5, fail=0.0, scaled to the 20-point cap.',
  ].join('\n'),

  Trust: [
    'Trust (E-E-A-T) subscore — out of 15.',
    '',
    'Combines two rule families: trust_eeat (Experience, Expertise, Authoritativeness, Trustworthiness signals on the article itself) and transparency_assets (the writer\'s author page + the site\'s About/Contact pages).',
    '',
    'Author page completeness, expertise statement, social/profile links, and the site-level transparency score all flow in via composeTrust().',
  ].join('\n'),

  Spam: [
    'Spam Safety subscore — out of 15. Higher = safer.',
    '',
    'Tracks Google spam policy compliance: scaled content abuse, cloaking, doorway pages, expired-domain abuse, link spam, deceptive practices, sneaky redirects, thin content with affiliate links.',
    '',
    'A low Spam score will pull Overall down hard (see Overall tooltip — spam penalty is weighted at 50%).',
  ].join('\n'),

  Tech: [
    'Technical Indexability subscore — out of 15.',
    '',
    'Covers the technical surface that determines whether Google can crawl + render + index the page: robots.txt, canonical tags, meta robots, redirect chains, sitemap presence, Core Web Vitals signals, JS rendering, image lazy-loading correctness.',
  ].join('\n'),

  Opp: [
    'Opportunity subscore — out of 10. SportsMockery-specific.',
    '',
    'Captures untapped ranking potential: keyword gaps vs competitors, internal linking opportunities, missing FAQ/How-To structured data, headlines that under-target intent, articles ranking on page 2 that could be pushed to page 1.',
  ].join('\n'),

  Comments: [
    'Sum of Disqus comment counts across this writer\'s articles in the window.',
    '',
    'The site uses Disqus (not WP-native comments). The /api/cron/sync-article-comments job pulls thread counts from the Disqus API every cycle and writes them to sm_posts.comments_count keyed by wp_id.',
    '',
    'Note: WP REST /wp/v2/comments returns 0 for almost every post on this site — read sm_posts.comments_count instead.',
  ].join('\n'),

  Engagement: [
    'COMPOSITE Engagement Score (0–100). Weighted blend of REAL signals only — missing inputs contribute 0; nothing is fabricated.',
    '',
    'Weights:',
    '• Comments / post — 20%   (5 comments/post normalizes to 100)',
    '• Time on page — 20%   (120s normalizes to 100, from GA4 userEngagementDuration ÷ pageViews)',
    '• Scroll depth — 15%   (% of sessions firing GA4 enhanced-measurement scroll event at 90%)',
    '• Headline subscore — 15%   (from Google rules engine)',
    '• Trust subscore — 10%',
    '• Spam Safety subscore — 10%',
    '• Engaged sessions ÷ pageviews — 10%   (from GA4)',
    '',
    'Sources: GA4 Data API (pagePath × screenPageViews / userEngagementDuration / engagedSessions / scroll events), sm_posts.comments_count (Disqus), google_article_scores.sub.* (rules engine).',
  ].join('\n'),

  Overall: [
    'COMPOSITE Overall Score = positive − negative.',
    '',
    'POSITIVE side (rewards quality):',
    '   (avg Google × 45%) + (headline subscore × 20%) + (Engagement × 35%)',
    '',
    'NEGATIVE side (penalty for spam risk):',
    '   spam penalty × 50%, where spam penalty = max(0, 100 − spam subscore normalized to 100)',
    '',
    'Why spam matters even with a high Google score:',
    'A writer with avg Google = 85 but a low Spam subscore (say 7/15 = 47%) gets a spam penalty of 53. After the 50% weighting that\'s −26 off the positive — a high Google score does NOT save you if the rules engine flags spam policy issues.',
    '',
    'Final value clamped to [0, 100].',
  ].join('\n'),

  Recs: [
    'Open Google recommendations targeting this writer\'s articles.',
    '',
    'Computation: max(explicit_author_recs, sum_of_article_recs).',
    '   • explicit_author_recs = google_recommendations rows where scope=\'author\' AND scope_id=author_id',
    '   • sum_of_article_recs = total google_recommendations rows where scope=\'article\' AND scope_id ∈ this writer\'s scored articles',
    '',
    'The max() prevents undercounting when Datalab emits article-scoped rather than author-scoped recs (which is the common case).',
    '',
    'Excludes recs with status=\'expired\'.',
  ].join('\n'),

  Trend: [
    'Δ in average Google score: current window − prior window of equal length.',
    '',
    'Computation:',
    '1. Determine prior window: same length as current, ending 1ms before current starts.',
    '2. Fetch sm_posts published in the prior window.',
    '3. Aggregate google_article_scores.total per author_id across those posts.',
    '4. trend = round1(currentAvg − prevAvg).',
    '',
    'Shows 0.0 when there is no prior-window data for the writer OR when no date filter is active (Trend has no meaning without a window).',
    '',
    'Positive = improving, negative = regressing.',
  ].join('\n'),

  'Last rescored': [
    'Most recent timestamp the Google rules engine re-scored any of this writer\'s articles.',
    '',
    'Source: max(google_article_scores.scored_at) across the writer\'s articles. Updated each time the scoring worker (/api/admin/google-intelligence/tick) processes a batch.',
  ].join('\n'),

  Status: [
    'Health indicator based on the writer\'s average Google score:',
    '',
    '🟢 green   ≥ 80',
    '🟡 amber   60–79',
    '🔴 red     < 60',
    '',
    'Same thresholds the rules engine uses at the article level (statusFromTotal in google-score-engine.ts).',
  ].join('\n'),
}

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
  recommendations = [],
  articles = [],
}: {
  writers: WriterLeaderboardRow[]
  writerEngagement?: WriterEngagementRow[]
  recommendations?: Recommendation[]
  articles?: ArticleAnalysisRow[]
}) {
  const [sortKey, setSortKey] = useState<SortKey>('overall_score')
  const [dir, setDir] = useState<'asc' | 'desc'>('desc')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const toggle = (id: string) => setExpandedId(c => (c === id ? null : id))

  // articleId -> author info, and authorId -> [articles] for the expand panel.
  const articleAuthorMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const a of articles) if (a.authorId) m.set(a.articleId, a.authorId)
    return m
  }, [articles])

  const articlesByAuthor = useMemo(() => {
    const m = new Map<string, ArticleAnalysisRow[]>()
    for (const a of articles) {
      if (!a.authorId) continue
      const arr = m.get(a.authorId) || []
      arr.push(a)
      m.set(a.authorId, arr)
    }
    return m
  }, [articles])

  // Group recs by writer: include both author-scoped recs AND article-scoped
  // recs whose article belongs to that writer. Mirrors the "max(explicit,
  // derived)" logic on the Recs column so the panel matches the count.
  const recsByAuthor = useMemo(() => {
    const m = new Map<string, Recommendation[]>()
    for (const r of recommendations) {
      if (r.scope === 'author') {
        const arr = m.get(r.scopeId) || []
        arr.push(r)
        m.set(r.scopeId, arr)
      } else if (r.scope === 'article') {
        const authorId = articleAuthorMap.get(r.scopeId)
        if (!authorId) continue
        const arr = m.get(authorId) || []
        arr.push(r)
        m.set(authorId, arr)
      }
    }
    // Sort each writer's recs: severity (high → low), then aging.
    for (const [k, list] of m) {
      list.sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || b.agingHours - a.agingHours)
      m.set(k, list)
    }
    return m
  }, [recommendations, articleAuthorMap])

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
              <Th align="center"> </Th>
              <Th>Writer</Th>
              <Th onClick={() => onSort('articlesAnalyzed')} active={sortKey === 'articlesAnalyzed'} dir={dir} align="right" infoKey="Articles">Articles</Th>
              <Th onClick={() => onSort('total')}            active={sortKey === 'total'}            dir={dir} align="right" infoKey="Google">Google</Th>
              <Th onClick={() => onSort('searchEssentials')} active={sortKey === 'searchEssentials'} dir={dir} align="right" infoKey="SEO">SEO</Th>
              <Th onClick={() => onSort('googleNews')}       active={sortKey === 'googleNews'}       dir={dir} align="right" infoKey="News">News</Th>
              <Th onClick={() => onSort('trust')}            active={sortKey === 'trust'}            dir={dir} align="right" infoKey="Trust">Trust</Th>
              <Th onClick={() => onSort('spamSafety')}       active={sortKey === 'spamSafety'}       dir={dir} align="right" infoKey="Spam">Spam</Th>
              <Th onClick={() => onSort('technical')}        active={sortKey === 'technical'}        dir={dir} align="right" infoKey="Tech">Tech</Th>
              <Th onClick={() => onSort('opportunity')}      active={sortKey === 'opportunity'}      dir={dir} align="right" infoKey="Opp">Opp</Th>
              <Th onClick={() => onSort('comments')}         active={sortKey === 'comments'}         dir={dir} align="right" infoKey="Comments">Comments</Th>
              <Th onClick={() => onSort('engagement_score')} active={sortKey === 'engagement_score'} dir={dir} align="right" infoKey="Engagement">Engagement</Th>
              <Th onClick={() => onSort('overall_score')}    active={sortKey === 'overall_score'}    dir={dir} align="right" infoKey="Overall">Overall</Th>
              <Th onClick={() => onSort('recommendationCount')} active={sortKey === 'recommendationCount'} dir={dir} align="right" infoKey="Recs">Recs</Th>
              <Th align="right" infoKey="Trend">Trend</Th>
              <Th align="right" infoKey="Last rescored">Last rescored</Th>
              <Th align="center" infoKey="Status">Status</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((w) => {
              const isOpen = expandedId === w.authorId
              const writerRecs = recsByAuthor.get(w.authorId) || []
              const writerArticles = articlesByAuthor.get(w.authorId) || []
              return (
                <React.Fragment key={w.authorId}>
                  <tr
                    className="transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid var(--sm-border)', background: isOpen ? 'var(--sm-card-hover)' : 'transparent' }}
                    onClick={() => toggle(w.authorId)}
                    onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = 'var(--sm-card-hover)' }}
                    onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = 'transparent' }}
                  >
                    <Td align="center">
                      <ChevronRight size={14} style={{ color: 'var(--sm-text-dim)', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 150ms' }} />
                    </Td>
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
                  {isOpen && (
                    <tr style={{ background: 'var(--sm-surface)' }}>
                      <td colSpan={17} style={{ padding: '20px 24px' }}>
                        <WriterRecsPanel writer={w} recs={writerRecs} articleCount={writerArticles.length} />
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

function Th({
  children, onClick, active, dir, align = 'left', infoKey,
}: {
  children: React.ReactNode
  onClick?: () => void
  active?: boolean
  dir?: 'asc' | 'desc'
  align?: 'left' | 'right' | 'center'
  infoKey?: string
}) {
  const tip = infoKey ? SCORE_INFO[infoKey] : null
  return (
    <th className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}
        style={{ color: active ? 'var(--sm-red-light)' : 'var(--sm-text-dim)' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
        {children}
        {active && (dir === 'desc' ? ' ↓' : ' ↑')}
        {tip && <ScoreInfoIcon text={tip} align={align} />}
      </span>
    </th>
  )
}

// Info icon with a hover tooltip. Pure CSS — no portal, no state, no
// click required. Tooltip width is capped so long explanations wrap.
function ScoreInfoIcon({ text, align }: { text: string; align: 'left' | 'right' | 'center' }) {
  const [open, setOpen] = useState(false)
  const placement = align === 'right' ? 'right' : 'left'
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      aria-label="Score calculation details"
    >
      <Info size={14} strokeWidth={2.25} style={{ color: '#00D4FF' }} />
      {open && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            top: '100%',
            [placement]: 0,
            marginTop: 6,
            zIndex: 50,
            width: 320,
            padding: '10px 12px',
            background: 'var(--sm-card)',
            border: '1px solid var(--sm-border)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            fontSize: 11,
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: 0,
            textTransform: 'none',
            color: 'var(--sm-text)',
            whiteSpace: 'pre-line',
            textAlign: 'left',
          }}
        >
          {text}
        </span>
      )}
    </span>
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

function severityRank(s: Recommendation['severity']): number {
  return { critical: 4, high: 3, medium: 2, low: 1, info: 0 }[s] ?? 0
}
function severityTone(s: Recommendation['severity']): string {
  if (s === 'critical' || s === 'high') return C.red
  if (s === 'medium') return C.gold
  return C.cyan
}

function WriterRecsPanel({
  writer,
  recs,
  articleCount,
}: {
  writer: EnrichedRow
  recs: Recommendation[]
  articleCount: number
}) {
  const [showResolved, setShowResolved] = useState(false)
  const visible = useMemo(
    () => showResolved ? recs : recs.filter(r => r.status !== 'resolved' && r.status !== 'expired'),
    [recs, showResolved]
  )
  const grouped = useMemo(() => {
    const m = new Map<Recommendation['severity'], Recommendation[]>()
    for (const r of visible) {
      const arr = m.get(r.severity) || []
      arr.push(r)
      m.set(r.severity, arr)
    }
    return m
  }, [visible])
  const order: Recommendation['severity'][] = ['critical', 'high', 'medium', 'low', 'info']

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <div>
          <p className="text-base font-bold" style={{ color: 'var(--sm-text)' }}>
            {writer.name} — Open Recommendations
          </p>
          <p className="text-[12px]" style={{ color: 'var(--sm-text-dim)' }}>
            {visible.length} {visible.length === 1 ? 'item' : 'items'} · {articleCount} scored {articleCount === 1 ? 'article' : 'articles'} in window
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowResolved(s => !s)}
          className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded"
          style={{ background: 'var(--sm-card)', border: '1px solid var(--sm-border)', color: 'var(--sm-text-dim)' }}
        >
          {showResolved ? 'Hide resolved' : 'Show resolved'}
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm py-4 text-center" style={{ color: 'var(--sm-text-dim)' }}>
          No open recommendations for {writer.name}. Either everything is passing or no rules have flagged this writer\'s articles.
        </p>
      ) : (
        <div className="space-y-4">
          {order.map(sev => {
            const list = grouped.get(sev)
            if (!list || list.length === 0) return null
            const tone = severityTone(sev)
            return (
              <div key={sev}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: `${tone}22`, color: tone }}
                  >
                    {sev}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--sm-text-dim)' }}>
                    {list.length} {list.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {list.map(r => (
                    <div
                      key={r.id}
                      className="rounded-md border p-3"
                      style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-bold" style={{ color: 'var(--sm-text)' }}>
                          {r.title}
                        </p>
                        <span
                          className="text-[10px] tabular-nums font-bold px-1.5 py-0.5 rounded shrink-0"
                          style={{ background: `${tone}22`, color: tone }}
                          title="Projected impact if resolved"
                        >
                          +{r.impactScore}
                        </span>
                      </div>
                      {r.detail && (
                        <p className="text-xs mb-2" style={{ color: 'var(--sm-text-muted)' }}>
                          {r.detail}
                        </p>
                      )}
                      {r.suggestedFix && (
                        <div className="rounded p-2 mb-2" style={{ background: 'var(--sm-surface)' }}>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--sm-text-dim)' }}>Suggested fix</p>
                          <p className="text-xs whitespace-pre-line leading-relaxed" style={{ color: 'var(--sm-text)' }}>{r.suggestedFix}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-3 flex-wrap text-[10px]" style={{ color: 'var(--sm-text-dim)' }}>
                        <span>{r.scope === 'article' ? 'Article-scoped' : 'Author-scoped'}</span>
                        <span>·</span>
                        <span>Owner: {r.owner}</span>
                        <span>·</span>
                        <span>Status: {r.status}</span>
                        <span>·</span>
                        <span>Aging: {Math.round(r.agingHours)}h</span>
                        <span>·</span>
                        <span>Confidence: {Math.round(r.confidence * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
