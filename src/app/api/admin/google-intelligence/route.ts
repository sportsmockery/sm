// GET /api/admin/google-intelligence
// Returns the full payload that powers the Google tab.
//
// Reads from real DB tables when populated; otherwise returns a deterministic
// mock so the UI is fully renderable from the moment the migration ships.

import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { buildMockPayload } from '@/lib/google/mock-data'
import type {
  GoogleTabPayload, ArticleAnalysisRow, WriterLeaderboardRow,
  Recommendation, RuleEvaluation, OperationsSnapshot, SubScores,
  TransparencyAsset, TransparencyAssetEvaluation,
} from '@/lib/google/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// The exec dashboard's date-range selector is the source of truth for "what
// timeframe should the Google tab reflect." We mirror the page-level options
// (today, yesterday, this-week, this-month, last-month, ytd, last-year, custom)
// and translate them to a published_at window over sm_posts. The score and
// leaderboard tables aren't time-keyed themselves, so we resolve eligible
// article ids from sm_posts first and then filter score rows by id.
function resolveDateRange(searchParams: URLSearchParams): { startISO: string; endISO: string } | null {
  const range = searchParams.get('range')
  if (!range || range === 'all-time') return null

  const now = new Date()
  // Range boundaries are computed in Central Time so "this-month" doesn't roll
  // over at 7pm CT (when Vercel's UTC clock crosses midnight). chi has the same
  // wall-clock components as Chicago — use only its component getters, not its
  // underlying UTC value. Mirrors src/app/api/exec-dashboard/route.ts.
  const chi = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }))
  const cy = chi.getFullYear()
  const cm = chi.getMonth()
  const cd = chi.getDate()
  const cw = chi.getDay()
  let start: Date
  let end: Date
  if (range === 'today') {
    start = new Date(cy, cm, cd)
    end = now
  } else if (range === 'yesterday') {
    start = new Date(cy, cm, cd - 1)
    end = new Date(cy, cm, cd)
  } else if (range === 'this-week') {
    start = new Date(cy, cm, cd - cw)
    end = now
  } else if (range === 'this-month') {
    start = new Date(cy, cm, 1)
    end = now
  } else if (range === 'last-month') {
    start = new Date(cy, cm - 1, 1)
    end = new Date(cy, cm, 0, 23, 59, 59)
  } else if (range === 'ytd') {
    start = new Date(cy, 0, 1)
    end = now
  } else if (range === 'last-year') {
    start = new Date(cy - 1, 0, 1)
    end = new Date(cy - 1, 11, 31, 23, 59, 59)
  } else if (range === 'custom') {
    const startStr = searchParams.get('start')
    const endStr = searchParams.get('end')
    if (!startStr || !endStr) return null
    start = new Date(startStr)
    end = new Date(`${endStr}T23:59:59`)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
  } else {
    return null
  }
  return { startISO: start.toISOString(), endISO: end.toISOString() }
}

function safeAvg(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((s, n) => s + n, 0) / values.length
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateWindow = resolveDateRange(searchParams)
    const db = createServerClient()

    // Resolve the article-id filter for the requested window before fetching
    // scores. An empty list is meaningful (window simply has no articles) —
    // we mark it with a sentinel so the IN-clause below returns zero rows.
    let articleIdFilter: string[] | null = null
    if (dateWindow) {
      const postsInWindow = await db
        .from('sm_posts')
        .select('id')
        .gte('published_at', dateWindow.startISO)
        .lte('published_at', dateWindow.endISO)
      articleIdFilter = ((postsInWindow.data ?? []) as Array<Record<string, unknown>>).map((p) => String(p.id))
    }

    let scoresQuery = db.from('google_article_scores').select('*').order('total', { ascending: true }).limit(500)
    let writersQuery = db.from('google_article_scores').select('author_id, total, sub, article_id').not('author_id', 'is', null)
    if (articleIdFilter) {
      if (articleIdFilter.length === 0) {
        // Force empty result without dropping the rest of the payload (we still
        // want transparency + ops to render for the window-empty case).
        scoresQuery = scoresQuery.eq('article_id', '00000000-0000-0000-0000-000000000000')
        writersQuery = writersQuery.eq('article_id', '00000000-0000-0000-0000-000000000000')
      } else {
        scoresQuery = scoresQuery.in('article_id', articleIdFilter)
        writersQuery = writersQuery.in('article_id', articleIdFilter)
      }
    }

    // 1. Pull the score corpus + sitewide context first.
    const [scoresRes, writersRes, queueRes, eventsRes, auditRes, rulesetRes, assetsRes, assetEvalsRes] = await Promise.all([
      scoresQuery,
      writersQuery,
      db.from('google_scoring_jobs').select('id, trigger, status, completed_at, enqueued_at').order('enqueued_at', { ascending: false }).limit(500),
      db.from('google_system_events').select('id, type, occurred_at').order('occurred_at', { ascending: false }).limit(50),
      db.from('google_audit_log').select('id, actor, action, target, metadata, occurred_at').order('occurred_at', { ascending: false }).limit(25),
      db.from('google_ruleset_versions').select('version, weighting, rule_count, published_at').eq('is_active', true).maybeSingle(),
      db.from('google_transparency_assets').select('*').order('asset_type', { ascending: true }),
      db.from('google_transparency_asset_evaluations').select('*').neq('status', 'pass').order('evaluated_at', { ascending: false }).limit(500),
    ])

    const scoreRows = (scoresRes.data ?? []) as Array<Record<string, unknown>>

    // 2. Now fetch rule evaluations + recommendations scoped to the article
    //    ids we actually have scores for, so per-article expansion always
    //    reflects real DB state instead of being capped by a sitewide limit.
    const scoredArticleIds = scoreRows.map((r) => String(r.article_id))
    const [recsRes, rulesRes] = scoredArticleIds.length > 0
      ? await Promise.all([
          db.from('google_recommendations').select('*').neq('status', 'expired').or(`scope_id.in.(${scoredArticleIds.map((id) => `"${id}"`).join(',')}),scope.eq.sitewide,scope.eq.author`).order('severity', { ascending: false }).limit(2000),
          db.from('google_rule_evaluations').select('*').neq('status', 'pass').in('article_id', scoredArticleIds).order('evaluated_at', { ascending: false }).limit(5000),
        ])
      : [{ data: [] as Array<Record<string, unknown>> }, { data: [] as Array<Record<string, unknown>> }]
    const transparencyAssetsRawForGate = (assetsRes.data ?? []) as Array<Record<string, unknown>>

    // Full mock only when *both* article scores and transparency assets are empty.
    // If transparency is seeded but articles aren't scored yet (post-migration,
    // pre-worker-run state), serve mock articles + real transparency so the
    // Transparency Assets panel reflects DB reality.
    // Skip the mock path entirely when a date window is in play — an empty
    // result there means "no articles in the selected window," which the UI
    // should render as zeros, not as fabricated mock data.
    if (!dateWindow && scoreRows.length === 0 && transparencyAssetsRawForGate.length === 0) {
      return NextResponse.json({ ...buildMockPayload(), source: 'mock' })
    }
    if (!dateWindow && scoreRows.length === 0) {
      const base = buildMockPayload()
      const realTransparency = mapTransparencyAssets(transparencyAssetsRawForGate)
      const realEvals = mapTransparencyEvaluations((assetEvalsRes.data ?? []) as Array<Record<string, unknown>>)
      const aboutAsset = realTransparency.find((a) => a.assetType === 'about_page')
      const authorPages = realTransparency.filter((a) => a.assetType === 'author_page')
      const siteAssets  = realTransparency.filter((a) => a.ownerScope === 'site')
      const siteTransparencyScore = siteAssets.length === 0
        ? 0
        : round1(((siteAssets.reduce((s, a) => s + a.total, 0) / siteAssets.length) / 100) * 15)
      return NextResponse.json({
        ...base,
        transparencyAssets: realTransparency,
        transparencyEvaluations: realEvals,
        siteTrust: {
          siteTransparencyScore,
          aboutScore: aboutAsset?.total ?? 0,
          avgAuthorPageScore: authorPages.length === 0 ? 0 : Math.round(authorPages.reduce((s, a) => s + a.total, 0) / authorPages.length),
          assetsScored: realTransparency.length,
        },
        operations: {
          ...base.operations,
          transparencyAssetsUnderReview: realTransparency.filter((a) => a.findingsCount > 0).length,
        },
        source: 'mock-articles+db-transparency',
      })
    }

    // ── Resolve human-readable names for the score rows we're returning.
    //    The score tables only carry article_id + author_id; join sm_posts
    //    and sm_authors so the UI shows titles + names instead of UUIDs.
    const articleIds = Array.from(new Set(scoreRows.map((r) => String(r.article_id))))
    const authorIdsRaw = Array.from(new Set([
      ...scoreRows.map((r) => r.author_id as string | null).filter((v): v is string => Boolean(v)),
      ...((writersRes.data ?? []) as Array<Record<string, unknown>>).map((w) => String(w.author_id)),
    ]))

    const [postsLookupRes, authorsLookupRes] = await Promise.all([
      articleIds.length > 0
        ? db.from('sm_posts').select('id,title,slug,published_at,updated_at,category_id').in('id', articleIds)
        : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
      authorIdsRaw.length > 0
        ? db.from('sm_authors').select('id,display_name,avatar_url').in('id', authorIdsRaw)
        : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
    ])

    const categoryIds = Array.from(new Set(((postsLookupRes.data ?? []) as Array<Record<string, unknown>>).map((p) => p.category_id as string | null).filter((v): v is string => Boolean(v))))
    const categoriesLookupRes = categoryIds.length > 0
      ? await db.from('sm_categories').select('id,name,slug').in('id', categoryIds)
      : { data: [] as Array<Record<string, unknown>> }

    const postById = new Map<string, { title: string; slug: string; publishedAt: string | null; updatedAt: string | null; categoryId: string | null }>()
    for (const p of (postsLookupRes.data ?? []) as Array<Record<string, unknown>>) {
      postById.set(String(p.id), {
        title: String(p.title ?? '(untitled)'),
        slug: String(p.slug ?? ''),
        publishedAt: (p.published_at as string | null) ?? null,
        updatedAt:   (p.updated_at as string | null) ?? null,
        categoryId:  (p.category_id as string | null) ?? null,
      })
    }
    const authorById = new Map<string, { name: string; avatar: string | null }>()
    for (const a of (authorsLookupRes.data ?? []) as Array<Record<string, unknown>>) {
      authorById.set(String(a.id), {
        name:   String(a.display_name ?? '(unknown)'),
        avatar: (a.avatar_url as string | null) ?? null,
      })
    }
    const categoryById = new Map<string, string>()
    for (const c of (categoriesLookupRes.data ?? []) as Array<Record<string, unknown>>) {
      categoryById.set(String(c.id), String(c.name ?? '—'))
    }

    // Count open recommendations per article + per author so the leaderboard
    // and analysis table can show "N issues to fix" accurately.
    const articleRecCount = new Map<string, number>()
    const authorRecCount = new Map<string, number>()
    for (const r of (recsRes.data ?? []) as Array<Record<string, unknown>>) {
      const scope = r.scope as string
      const scopeId = String(r.scope_id)
      if (scope === 'article')      articleRecCount.set(scopeId, (articleRecCount.get(scopeId) ?? 0) + 1)
      else if (scope === 'author')  authorRecCount.set(scopeId,  (authorRecCount.get(scopeId)  ?? 0) + 1)
    }

    const articles: ArticleAnalysisRow[] = scoreRows.map((r) => {
      const articleId = String(r.article_id)
      const authorId = (r.author_id as string | null) ?? null
      const post = postById.get(articleId)
      const author = authorId ? authorById.get(authorId) : null
      return {
        articleId,
        slug: post?.slug ?? '',
        title: post?.title ?? articleId,
        author: author?.name ?? '—',
        authorId,
        publishedAt: post?.publishedAt ?? String(r.scored_at),
        updatedAt:   post?.updatedAt   ?? String(r.updated_at ?? r.scored_at),
        lastRescoredAt: String(r.scored_at),
        category: post?.categoryId ? (categoryById.get(post.categoryId) ?? '—') : '—',
        topic: '—',
        total: Number(r.total ?? 0),
        sub: r.sub as SubScores,
        headlineScore: Number(r.headline_score ?? 0),
        recommendationCount: articleRecCount.get(articleId) ?? 0,
        rulesetVersion: String(r.ruleset_version),
        status: (r.status as 'green' | 'amber' | 'red') ?? 'amber',
      }
    })

    // Aggregate writer leaderboard.
    const writerAgg = new Map<string, { total: number; n: number; sub: SubScores }>()
    for (const w of (writersRes.data ?? []) as Array<Record<string, unknown>>) {
      const id = String(w.author_id)
      const sub = w.sub as SubScores
      const cur = writerAgg.get(id) ?? { total: 0, n: 0, sub: { searchEssentials: 0, googleNews: 0, trust: 0, spamSafety: 0, technical: 0, opportunity: 0 } }
      cur.total += Number(w.total ?? 0)
      cur.n += 1
      cur.sub.searchEssentials += sub.searchEssentials
      cur.sub.googleNews       += sub.googleNews
      cur.sub.trust            += sub.trust
      cur.sub.spamSafety       += sub.spamSafety
      cur.sub.technical        += sub.technical
      cur.sub.opportunity      += sub.opportunity
      writerAgg.set(id, cur)
    }
    const writers: WriterLeaderboardRow[] = Array.from(writerAgg.entries()).map(([id, agg]) => {
      const author = authorById.get(id)
      return {
        authorId: id,
        name: author?.name ?? id,
        avatar: author?.avatar ?? null,
        articlesAnalyzed: agg.n,
        total: Math.round(agg.total / agg.n),
        sub: {
          searchEssentials: round1(agg.sub.searchEssentials / agg.n),
          googleNews:       round1(agg.sub.googleNews / agg.n),
          trust:            round1(agg.sub.trust / agg.n),
          spamSafety:       round1(agg.sub.spamSafety / agg.n),
          technical:        round1(agg.sub.technical / agg.n),
          opportunity:      round1(agg.sub.opportunity / agg.n),
        },
        recommendationCount: authorRecCount.get(id) ?? 0,
        trend: 0,
        lastRescoredAt: new Date().toISOString(),
        status: agg.total / agg.n >= 80 ? 'green' : agg.total / agg.n >= 60 ? 'amber' : 'red',
      }
    })

    const recommendations: Recommendation[] = ((recsRes.data ?? []) as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      scope: r.scope as Recommendation['scope'],
      scopeId: String(r.scope_id),
      title: String(r.title),
      detail: String(r.detail),
      severity: r.severity as Recommendation['severity'],
      owner: r.owner as Recommendation['owner'],
      impactScore: Number(r.impact_score ?? 0),
      confidence: Number(r.confidence ?? 0),
      status: r.status as Recommendation['status'],
      sourceType: r.source_type as Recommendation['sourceType'],
      ruleIds: (r.rule_ids as string[]) ?? [],
      rulesetVersion: String(r.ruleset_version),
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at),
      resolvedAt: (r.resolved_at as string | null) ?? null,
      agingHours: Number(r.aging_hours ?? 0),
    }))

    const rules: RuleEvaluation[] = ((rulesRes.data ?? []) as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      articleId: String(r.article_id),
      ruleId: String(r.rule_id),
      ruleFamily: r.rule_family as RuleEvaluation['ruleFamily'],
      sourceType: r.source_type as RuleEvaluation['sourceType'],
      status: r.status as RuleEvaluation['status'],
      confidence: Number(r.confidence ?? 0),
      impactedField: (r.impacted_field as string | null) ?? null,
      explanation: String(r.explanation),
      remediation: (r.remediation as string | null) ?? null,
      rulesetVersion: String(r.ruleset_version),
      evaluatedAt: String(r.evaluated_at),
    }))

    const queueRows = (queueRes.data ?? []) as Array<Record<string, unknown>>
    const last24 = Date.now() - 24 * 3600 * 1000
    const isTransparency = (t: string | undefined) => !!t && t.startsWith('transparency.')
    const transparencyAssetsRaw = (assetsRes.data ?? []) as Array<Record<string, unknown>>
    const operations: OperationsSnapshot = {
      lastArticleImportedAt: ((eventsRes.data ?? []) as Array<Record<string, unknown>>).find((e) => String(e.type).includes('imported'))?.occurred_at as string ?? null,
      lastArticleScoredAt:   queueRows.find((q) => q.status === 'succeeded' && !isTransparency(q.trigger as string))?.completed_at as string ?? null,
      scoredLast24h:         queueRows.filter((q) => q.status === 'succeeded' && Date.parse(String(q.completed_at)) > last24).length,
      rescansLast24h:        queueRows.filter((q) => Date.parse(String(q.enqueued_at)) > last24).length,
      pendingQueueDepth:     queueRows.filter((q) => q.status === 'queued').length,
      failedJobsCount:       queueRows.filter((q) => q.status === 'failed').length,
      lastSuccessfulJobAt:   queueRows.find((q) => q.status === 'succeeded')?.completed_at as string ?? null,
      activeRulesetVersion:  String(rulesetRes.data?.version ?? '2026.04.28-1'),
      awaitingRescoreContent: 0,
      awaitingRescoreAuthor:  0,
      suppressionsCount:      0,
      lastTransparencyScanAt:       queueRows.find((q) => q.status === 'succeeded' && isTransparency(q.trigger as string))?.completed_at as string ?? null,
      pendingTransparencyRescans:   queueRows.filter((q) => q.status === 'queued' && isTransparency(q.trigger as string)).length,
      transparencyFailuresLast24h:  queueRows.filter((q) => q.status === 'failed' && isTransparency(q.trigger as string) && Date.parse(String(q.enqueued_at)) > last24).length,
      transparencyAssetsUnderReview: transparencyAssetsRaw.filter((a) => Number(a.findings_count ?? 0) > 0).length,
      recentAudit: ((auditRes.data ?? []) as Array<Record<string, unknown>>).map((a) => ({
        id: String(a.id),
        actor: String(a.actor),
        action: String(a.action),
        target: String(a.target),
        metadata: (a.metadata as Record<string, unknown>) ?? {},
        occurredAt: String(a.occurred_at),
      })),
    }

    const overviewSub: SubScores = {
      searchEssentials: round1(safeAvg(articles.map((a) => a.sub.searchEssentials))),
      googleNews:       round1(safeAvg(articles.map((a) => a.sub.googleNews))),
      trust:            round1(safeAvg(articles.map((a) => a.sub.trust))),
      spamSafety:       round1(safeAvg(articles.map((a) => a.sub.spamSafety))),
      technical:        round1(safeAvg(articles.map((a) => a.sub.technical))),
      opportunity:      round1(safeAvg(articles.map((a) => a.sub.opportunity))),
    }
    const googleScore = Math.round(safeAvg(articles.map((a) => a.total)))

    // ── Transparency assets payload (uses shared mappers) ────────────────
    const transparencyAssets: TransparencyAsset[] = mapTransparencyAssets(transparencyAssetsRaw ?? [])
    const transparencyEvaluations: TransparencyAssetEvaluation[] = mapTransparencyEvaluations((assetEvalsRes.data ?? []) as Array<Record<string, unknown>>)
    const aboutAsset = transparencyAssets.find((a) => a.assetType === 'about_page')
    const authorPages = transparencyAssets.filter((a) => a.assetType === 'author_page')
    const siteAssets  = transparencyAssets.filter((a) => a.ownerScope === 'site')
    const siteTransparencyScore = siteAssets.length === 0
      ? 0
      : round1(((siteAssets.reduce((s, a) => s + a.total, 0) / siteAssets.length) / 100) * 15)

    const payload: GoogleTabPayload = {
      generatedAt: new Date().toISOString(),
      rulesetVersion: String(rulesetRes.data?.version ?? '2026.04.28-1'),
      weights: (rulesetRes.data?.weighting as SubScores) ?? { searchEssentials: 25, googleNews: 20, trust: 15, spamSafety: 15, technical: 15, opportunity: 10 },
      overview: {
        googleScore,
        sub: overviewSub,
        avgWriterScore: Math.round(safeAvg(writers.map((w) => w.total))),
        highRiskArticleCount: articles.filter((a) => a.total < 60).length,
        newsReadyArticlePct:  articles.length === 0 ? 0 : Math.round((articles.filter((a) => a.sub.googleNews >= 15).length / articles.length) * 100),
        deltaVsPriorPeriod:   0,
        lastScoringRunAt:     operations.lastArticleScoredAt ?? new Date().toISOString(),
      },
      scoreDistribution: bucketize(articles.map((a) => a.total)),
      writers,
      articles,
      rules,
      recommendations,
      transparencyAssets,
      transparencyEvaluations,
      siteTrust: {
        siteTransparencyScore,
        aboutScore: aboutAsset?.total ?? 0,
        avgAuthorPageScore: authorPages.length === 0 ? 0 : Math.round(authorPages.reduce((s, a) => s + a.total, 0) / authorPages.length),
        assetsScored: transparencyAssets.length,
      },
      operations,
    }

    return NextResponse.json({ ...payload, source: 'db' })
  } catch (err) {
    console.error('[google-intelligence] route error', err)
    return NextResponse.json({ ...buildMockPayload(), source: 'mock-fallback', error: String(err) })
  }
}

function bucketize(scores: number[]): Array<{ bucket: string; count: number }> {
  const buckets = [
    { bucket: '0–39',   min:   0, max:  39 },
    { bucket: '40–59',  min:  40, max:  59 },
    { bucket: '60–69',  min:  60, max:  69 },
    { bucket: '70–79',  min:  70, max:  79 },
    { bucket: '80–89',  min:  80, max:  89 },
    { bucket: '90–100', min:  90, max: 100 },
  ]
  return buckets.map((b) => ({
    bucket: b.bucket,
    count: scores.filter((s) => s >= b.min && s <= b.max).length,
  }))
}

function round1(n: number): number { return Math.round(n * 10) / 10 }

function mapTransparencyAssets(rows: Array<Record<string, unknown>>): TransparencyAsset[] {
  return rows.map((a) => ({
    id: String(a.id),
    assetType: a.asset_type as TransparencyAsset['assetType'],
    url: String(a.url),
    label: String(a.label),
    ownerScope: a.owner_scope as TransparencyAsset['ownerScope'],
    ownerId: (a.owner_id as string | null) ?? null,
    contentHash: String(a.content_hash ?? ''),
    lastCrawledAt: (a.last_crawled_at as string | null) ?? null,
    lastEvaluatedAt: (a.last_evaluated_at as string | null) ?? null,
    status: a.status as TransparencyAsset['status'],
    total: Number(a.total ?? 0),
    findingsCount: Number(a.findings_count ?? 0),
    recommendationCount: Number(a.recommendation_count ?? 0),
    rulesetVersion: String(a.ruleset_version),
  }))
}

function mapTransparencyEvaluations(rows: Array<Record<string, unknown>>): TransparencyAssetEvaluation[] {
  return rows.map((e) => ({
    id: String(e.id),
    assetId: String(e.asset_id),
    ruleId: String(e.rule_id),
    ruleFamily: 'transparency_assets',
    sourceType: e.source_type as TransparencyAssetEvaluation['sourceType'],
    status: e.status as TransparencyAssetEvaluation['status'],
    confidence: Number(e.confidence ?? 0),
    impactedField: (e.impacted_field as string | null) ?? null,
    explanation: String(e.explanation),
    remediation: (e.remediation as string | null) ?? null,
    rulesetVersion: String(e.ruleset_version),
    evaluatedAt: String(e.evaluated_at),
  }))
}
