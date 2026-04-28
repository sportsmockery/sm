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

export async function GET() {
  try {
    const db = createServerClient()

    const [scoresRes, writersRes, recsRes, rulesRes, queueRes, eventsRes, auditRes, rulesetRes, assetsRes, assetEvalsRes] = await Promise.all([
      db.from('google_article_scores').select('*').order('total', { ascending: true }).limit(50),
      db.from('google_article_scores').select('author_id, total, sub').not('author_id', 'is', null),
      db.from('google_recommendations').select('*').neq('status', 'expired').order('severity', { ascending: false }).limit(100),
      db.from('google_rule_evaluations').select('*').neq('status', 'pass').order('evaluated_at', { ascending: false }).limit(200),
      db.from('google_scoring_jobs').select('id, trigger, status, completed_at, enqueued_at').order('enqueued_at', { ascending: false }).limit(500),
      db.from('google_system_events').select('id, type, occurred_at').order('occurred_at', { ascending: false }).limit(50),
      db.from('google_audit_log').select('id, actor, action, target, metadata, occurred_at').order('occurred_at', { ascending: false }).limit(25),
      db.from('google_ruleset_versions').select('version, weighting, rule_count, published_at').eq('is_active', true).maybeSingle(),
      db.from('google_transparency_assets').select('*').order('asset_type', { ascending: true }),
      db.from('google_transparency_asset_evaluations').select('*').neq('status', 'pass').order('evaluated_at', { ascending: false }).limit(200),
    ])

    const scoreRows = (scoresRes.data ?? []) as Array<Record<string, unknown>>
    if (scoreRows.length === 0) {
      return NextResponse.json({ ...buildMockPayload(), source: 'mock' })
    }

    const articles: ArticleAnalysisRow[] = scoreRows.map((r) => ({
      articleId: String(r.article_id),
      title: String(r.article_id),                       // joined to posts table in production
      author: String(r.author_id ?? '—'),
      authorId: (r.author_id as string | null) ?? null,
      publishedAt: String(r.scored_at),
      updatedAt: String(r.updated_at ?? r.scored_at),
      lastRescoredAt: String(r.scored_at),
      category: '—',
      topic: '—',
      total: Number(r.total ?? 0),
      sub: r.sub as SubScores,
      headlineScore: Number(r.headline_score ?? 0),
      recommendationCount: 0,
      rulesetVersion: String(r.ruleset_version),
      status: (r.status as 'green' | 'amber' | 'red') ?? 'amber',
    }))

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
    const writers: WriterLeaderboardRow[] = Array.from(writerAgg.entries()).map(([id, agg]) => ({
      authorId: id,
      name: id,
      avatar: null,
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
      recommendationCount: 0,
      trend: 0,
      lastRescoredAt: new Date().toISOString(),
      status: agg.total / agg.n >= 80 ? 'green' : agg.total / agg.n >= 60 ? 'amber' : 'red',
    }))

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
      searchEssentials: round1(articles.reduce((s, a) => s + a.sub.searchEssentials, 0) / articles.length),
      googleNews:       round1(articles.reduce((s, a) => s + a.sub.googleNews, 0)       / articles.length),
      trust:            round1(articles.reduce((s, a) => s + a.sub.trust, 0)            / articles.length),
      spamSafety:       round1(articles.reduce((s, a) => s + a.sub.spamSafety, 0)       / articles.length),
      technical:        round1(articles.reduce((s, a) => s + a.sub.technical, 0)        / articles.length),
      opportunity:      round1(articles.reduce((s, a) => s + a.sub.opportunity, 0)      / articles.length),
    }
    const googleScore = Math.round(articles.reduce((s, a) => s + a.total, 0) / articles.length)

    // ── Transparency assets payload ───────────────────────────────────────
    const transparencyAssets: TransparencyAsset[] = (transparencyAssetsRaw ?? []).map((a) => ({
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
    const transparencyEvaluations: TransparencyAssetEvaluation[] = ((assetEvalsRes.data ?? []) as Array<Record<string, unknown>>).map((e) => ({
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
        avgWriterScore: Math.round(writers.reduce((s, w) => s + w.total, 0) / Math.max(1, writers.length)),
        highRiskArticleCount: articles.filter((a) => a.total < 60).length,
        newsReadyArticlePct:  Math.round((articles.filter((a) => a.sub.googleNews >= 15).length / articles.length) * 100),
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
