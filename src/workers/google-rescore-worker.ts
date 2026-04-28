// Google rescore worker.
// Pulls queued jobs, hydrates the article + author, runs the score engine,
// persists score + history + rule evaluations + recommendations, and updates
// job state with attempt counters and error messages.
//
// This is invoked from:
//   - a long-running Node process (`node dist/workers/google-rescore-worker.js`)
//   - the Vercel cron `/api/admin/google-intelligence/tick` (one tick at a time)
//   - the worker entry exported here for tests
//
// Skipped if the article's contentHash + authorProfileHash + rulesetVersion
// already matches the latest score row (idempotent).

import type { SupabaseClient } from '@supabase/supabase-js'
import { GoogleAuditService } from '@/lib/google/google-audit-service'
import { GoogleIngestionService } from '@/lib/google/google-ingestion-service'
import { scoreArticle, headlineScoreFromEvaluations, statusFromTotal } from '@/lib/google/google-score-engine'
import { generateRecommendations } from '@/lib/google/google-recommendation-engine'
import type { ArticleInput, AuthorInput } from '@/lib/google/google-rules-engine'
import type { ScoringJob, Recommendation } from '@/lib/google/types'
import { GoogleTransparencyService, type TransparencyAssetHydrator } from '@/lib/google/google-transparency-service'

const MAX_ATTEMPTS = 3
const BATCH_SIZE = 25

export interface ArticleHydrator {
  hydrate(articleId: string): Promise<{ article: ArticleInput; author: AuthorInput } | null>
}

const TRANSPARENCY_TRIGGERS = new Set([
  'transparency.about_updated',
  'transparency.contact_updated',
  'transparency.author_page_updated',
  'transparency.publisher_updated',
  'transparency.editorial_policy_updated',
])

export class GoogleRescoreWorker {
  private readonly audit: GoogleAuditService
  private readonly ingest: GoogleIngestionService
  private readonly transparency: GoogleTransparencyService | null

  constructor(
    private readonly db: SupabaseClient,
    private readonly hydrator: ArticleHydrator,
    transparencyHydrator?: TransparencyAssetHydrator,
  ) {
    this.audit = new GoogleAuditService(db)
    this.ingest = new GoogleIngestionService(db)
    this.transparency = transparencyHydrator
      ? new GoogleTransparencyService(db, transparencyHydrator)
      : null
  }

  async tick(batchSize = BATCH_SIZE): Promise<{ processed: number; failed: number }> {
    const { data: jobs, error } = await this.db
      .from('google_scoring_jobs')
      .select('*')
      .eq('status', 'queued')
      .order('enqueued_at', { ascending: true })
      .limit(batchSize)

    if (error) throw new Error(`worker.tick fetch failed: ${error.message}`)
    if (!jobs || jobs.length === 0) return { processed: 0, failed: 0 }

    let processed = 0
    let failed = 0
    for (const raw of jobs as Array<Record<string, unknown>>) {
      const job = mapJob(raw)
      try {
        await this.runOne(job)
        processed += 1
      } catch (e) {
        failed += 1
        await this.failJob(job, e instanceof Error ? e.message : String(e))
      }
    }
    return { processed, failed }
  }

  private async runOne(job: ScoringJob): Promise<void> {
    await this.db.from('google_scoring_jobs')
      .update({ status: 'running', started_at: new Date().toISOString(), attempts: job.attempts + 1 })
      .eq('id', job.id)

    // ── Transparency-asset jobs short-circuit to the transparency service ──
    if (TRANSPARENCY_TRIGGERS.has(job.trigger)) {
      if (!this.transparency) throw new Error('transparency hydrator not configured for transparency triggers')
      const ruleset = await this.ingest.getActiveRuleset()
      const result = await this.transparency.processAssetJob({
        assetId: job.articleId,
        trigger: job.trigger,
        rulesetVersion: ruleset.version,
      })
      await this.db.from('google_scoring_jobs')
        .update({ status: 'succeeded', completed_at: new Date().toISOString(), error_message: result.unchanged ? 'noop:unchanged' : null })
        .eq('id', job.id)
      return
    }

    const hydrated = await this.hydrator.hydrate(job.articleId)
    if (!hydrated) throw new Error(`article ${job.articleId} not found`)

    const ruleset = await this.ingest.getActiveRuleset()

    // Idempotency check: skip if content + author + ruleset are unchanged.
    const { data: latestScore } = await this.db
      .from('google_article_scores')
      .select('content_hash,author_profile_hash,ruleset_version,total')
      .eq('article_id', job.articleId)
      .order('scored_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Fold site transparency + author-page transparency into article trust.
    const ctx = this.transparency
      ? {
          siteTransparencyScore: await this.transparency.siteTransparencyScore(),
          authorPageScore: hydrated.author.id ? (await this.transparency.authorPageScore(hydrated.author.id)) ?? undefined : undefined,
        }
      : undefined
    const { score, evaluations } = scoreArticle(hydrated.article, hydrated.author, ruleset, job.trigger, ctx)

    const unchanged = latestScore
      && latestScore.content_hash === score.contentHash
      && latestScore.author_profile_hash === score.authorProfileHash
      && latestScore.ruleset_version === score.rulesetVersion

    if (unchanged && job.trigger !== 'rescan.nightly' && job.trigger !== 'manual.requeue') {
      await this.db.from('google_scoring_jobs')
        .update({ status: 'succeeded', completed_at: new Date().toISOString(), error_message: 'noop:unchanged' })
        .eq('id', job.id)
      await this.audit.log({
        actor: 'system',
        action: 'score.noop',
        target: job.articleId,
        metadata: { jobId: job.id, reason: 'unchanged' },
      })
      return
    }

    const prevTotal = (latestScore as { total?: number } | null)?.total ?? null
    const delta = prevTotal == null ? null : score.total - prevTotal

    // Persist score (upsert) + history.
    await this.db.from('google_article_scores').upsert({
      article_id: score.articleId,
      author_id: score.authorId,
      ruleset_version: score.rulesetVersion,
      total: score.total,
      sub: score.sub,
      headline_score: headlineScoreFromEvaluations(evaluations),
      status: statusFromTotal(score.total),
      content_hash: score.contentHash,
      author_profile_hash: score.authorProfileHash,
      last_trigger: score.trigger,
      scored_at: score.scoredAt,
    }, { onConflict: 'article_id' })

    await this.db.from('google_article_score_history').insert({
      article_id: score.articleId,
      ruleset_version: score.rulesetVersion,
      total: score.total,
      sub: score.sub,
      prev_total: prevTotal,
      delta,
      trigger: score.trigger,
      content_hash: score.contentHash,
      author_profile_hash: score.authorProfileHash,
      scored_at: score.scoredAt,
    })

    // Persist rule evaluations (replace existing for this article+ruleset).
    await this.db.from('google_rule_evaluations')
      .delete()
      .eq('article_id', score.articleId)
      .eq('ruleset_version', score.rulesetVersion)
    await this.db.from('google_rule_evaluations').insert(evaluations.map((e) => ({
      id: e.id,
      article_id: e.articleId,
      rule_id: e.ruleId,
      rule_family: e.ruleFamily,
      source_type: e.sourceType,
      status: e.status,
      confidence: e.confidence,
      impacted_field: e.impactedField,
      explanation: e.explanation,
      remediation: e.remediation,
      ruleset_version: e.rulesetVersion,
      evaluated_at: e.evaluatedAt,
    })))

    // Reconcile recommendations (preserve state, append new, expire stale).
    const { data: existingRecs } = await this.db
      .from('google_recommendations')
      .select('*')
      .eq('scope', 'article')
      .eq('scope_id', score.articleId)
    const existingMap = new Map<string, Recommendation>(
      (existingRecs ?? []).map((r: Record<string, unknown>) => [String(r.id), mapRec(r)]),
    )

    const next = generateRecommendations(evaluations, {
      articleId: score.articleId,
      authorId: score.authorId,
      rulesetVersion: score.rulesetVersion,
      rulesetSourceLookup: () => 'official-policy',
      existingRecommendations: existingMap,
    })

    const nextIds = new Set(next.map((r) => r.id))
    const stale = Array.from(existingMap.values()).filter((r) => !nextIds.has(r.id) && r.status !== 'resolved')
    if (stale.length > 0) {
      await this.db.from('google_recommendations')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .in('id', stale.map((s) => s.id))
      for (const s of stale) {
        await this.db.from('google_recommendation_state_history').insert({
          recommendation_id: s.id, from_status: s.status, to_status: 'expired',
          actor: 'system', occurred_at: new Date().toISOString(),
        })
      }
    }

    if (next.length > 0) {
      await this.db.from('google_recommendations').upsert(next.map((r) => ({
        id: r.id,
        scope: r.scope,
        scope_id: r.scopeId,
        title: r.title,
        detail: r.detail,
        severity: r.severity,
        owner: r.owner,
        impact_score: r.impactScore,
        confidence: r.confidence,
        status: r.status,
        source_type: r.sourceType,
        rule_ids: r.ruleIds,
        ruleset_version: r.rulesetVersion,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
        resolved_at: r.resolvedAt,
        aging_hours: r.agingHours,
      })), { onConflict: 'id' })
    }

    await this.db.from('google_scoring_jobs')
      .update({ status: 'succeeded', completed_at: new Date().toISOString() })
      .eq('id', job.id)

    await this.audit.log({
      actor: 'system',
      action: 'score.recompute',
      target: score.articleId,
      metadata: {
        jobId: job.id,
        rulesetVersion: score.rulesetVersion,
        total: score.total,
        prevTotal,
        delta,
        trigger: score.trigger,
      },
    })
  }

  private async failJob(job: ScoringJob, message: string): Promise<void> {
    const next = job.attempts + 1
    const status = next >= MAX_ATTEMPTS ? 'failed' : 'queued'
    await this.db.from('google_scoring_jobs')
      .update({ status, error_message: message, completed_at: status === 'failed' ? new Date().toISOString() : null })
      .eq('id', job.id)
    await this.audit.log({
      actor: 'system',
      action: status === 'failed' ? 'job.failed' : 'job.retry',
      target: job.articleId,
      metadata: { jobId: job.id, attempts: next, message },
    })
  }
}

function mapJob(row: Record<string, unknown>): ScoringJob {
  return {
    id: String(row.id),
    articleId: String(row.article_id),
    trigger: row.trigger as ScoringJob['trigger'],
    rulesetVersion: String(row.ruleset_version),
    status: row.status as ScoringJob['status'],
    attempts: Number(row.attempts ?? 0),
    enqueuedAt: String(row.enqueued_at),
    startedAt: (row.started_at as string | null) ?? null,
    completedAt: (row.completed_at as string | null) ?? null,
    errorMessage: (row.error_message as string | null) ?? null,
    payload: (row.payload as Record<string, unknown>) ?? {},
  }
}

function mapRec(r: Record<string, unknown>): Recommendation {
  return {
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
  }
}
