// Google ingestion service.
// The single entry point any other system uses to enqueue work into the
// Google scoring pipeline. Article CRUD, importers, ruleset activations,
// nightly rescans, and hourly reconciliation all funnel through here so we
// have one place to enforce de-duplication, ruleset versioning, and audit.

import { createHash } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ScoringTrigger, ScoringJob, RulesetVersion } from './types'
import { GoogleAuditService } from './google-audit-service'

export interface EnqueueRequest {
  articleId: string
  trigger: ScoringTrigger
  payload?: Record<string, unknown>
  actor?: string                  // user id or 'system'
}

export interface EnqueueResult {
  jobId: string
  deduplicated: boolean
}

export class GoogleIngestionService {
  private readonly audit: GoogleAuditService
  constructor(private readonly db: SupabaseClient) {
    this.audit = new GoogleAuditService(db)
  }

  async getActiveRuleset(): Promise<RulesetVersion> {
    const { data, error } = await this.db
      .from('google_ruleset_versions')
      .select('version,description,published_at,is_active,weighting,rule_count')
      .eq('is_active', true)
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error || !data) {
      // First-run fallback. The migration seeds an active ruleset, but be defensive.
      return DEFAULT_RULESET
    }
    return {
      version: data.version,
      description: data.description,
      publishedAt: data.published_at,
      isActive: data.is_active,
      weighting: data.weighting,
      ruleCount: data.rule_count,
    }
  }

  async enqueue(req: EnqueueRequest): Promise<EnqueueResult> {
    const ruleset = await this.getActiveRuleset()
    const jobId = createHash('sha256')
      .update(`${req.articleId}:${req.trigger}:${ruleset.version}:${Date.now()}`)
      .digest('hex')
      .slice(0, 24)

    // Dedup: if there is already a queued/running job for this article on this
    // ruleset version with the same trigger, reuse it.
    const { data: existing } = await this.db
      .from('google_scoring_jobs')
      .select('id,status')
      .eq('article_id', req.articleId)
      .eq('ruleset_version', ruleset.version)
      .eq('trigger', req.trigger)
      .in('status', ['queued', 'running'])
      .limit(1)

    if (existing && existing.length > 0) {
      await this.audit.log({
        actor: req.actor ?? 'system',
        action: 'job.deduplicated',
        target: req.articleId,
        metadata: { trigger: req.trigger, existingJobId: existing[0].id },
      })
      return { jobId: existing[0].id as string, deduplicated: true }
    }

    const { error } = await this.db.from('google_scoring_jobs').insert({
      id: jobId,
      article_id: req.articleId,
      trigger: req.trigger,
      ruleset_version: ruleset.version,
      status: 'queued',
      attempts: 0,
      enqueued_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
      error_message: null,
      payload: req.payload ?? {},
    })
    if (error) throw new Error(`google_scoring_jobs insert failed: ${error.message}`)

    await this.audit.log({
      actor: req.actor ?? 'system',
      action: 'job.enqueued',
      target: req.articleId,
      metadata: { jobId, trigger: req.trigger, rulesetVersion: ruleset.version },
    })
    await this.audit.recordSystemEvent({
      type: req.trigger,
      articleId: req.articleId,
      authorId: null,
      payload: req.payload ?? {},
    })

    return { jobId, deduplicated: false }
  }

  // Convenience handlers for each event the spec calls out.
  onArticleCreated(articleId: string, actor?: string)        { return this.enqueue({ articleId, trigger: 'article.created', actor }) }
  onArticleImported(articleId: string, actor?: string)       { return this.enqueue({ articleId, trigger: 'article.imported', actor }) }
  onArticlePublished(articleId: string, actor?: string)      { return this.enqueue({ articleId, trigger: 'article.published', actor }) }
  onArticleUpdated(articleId: string, actor?: string)        { return this.enqueue({ articleId, trigger: 'article.updated', actor }) }
  onArticleRepublished(articleId: string, actor?: string)    { return this.enqueue({ articleId, trigger: 'article.republished', actor }) }
  onTitleChanged(articleId: string, actor?: string)          { return this.enqueue({ articleId, trigger: 'article.title_changed', actor }) }
  onBodyChanged(articleId: string, actor?: string)           { return this.enqueue({ articleId, trigger: 'article.body_changed', actor }) }
  onCategoryChanged(articleId: string, actor?: string)       { return this.enqueue({ articleId, trigger: 'article.category_changed', actor }) }
  onTagsChanged(articleId: string, actor?: string)           { return this.enqueue({ articleId, trigger: 'article.tags_changed', actor }) }
  onBylineChanged(articleId: string, actor?: string)         { return this.enqueue({ articleId, trigger: 'article.byline_changed', actor }) }
  onAuthorChanged(articleId: string, actor?: string)         { return this.enqueue({ articleId, trigger: 'article.author_changed', actor }) }
  onAuthorBioChanged(articleId: string, actor?: string)      { return this.enqueue({ articleId, trigger: 'author.bio_changed', actor }) }
  onAuthorTransparencyChanged(articleId: string, actor?: string) { return this.enqueue({ articleId, trigger: 'author.transparency_changed', actor }) }
  onMetaTitleChanged(articleId: string, actor?: string)      { return this.enqueue({ articleId, trigger: 'article.meta_title_changed', actor }) }
  onMetaDescriptionChanged(articleId: string, actor?: string){ return this.enqueue({ articleId, trigger: 'article.meta_description_changed', actor }) }
  onCanonicalChanged(articleId: string, actor?: string)      { return this.enqueue({ articleId, trigger: 'article.canonical_changed', actor }) }
  onRobotsChanged(articleId: string, actor?: string)         { return this.enqueue({ articleId, trigger: 'article.robots_changed', actor }) }
  onImageAltChanged(articleId: string, actor?: string)       { return this.enqueue({ articleId, trigger: 'article.image_alt_changed', actor }) }
  onSchemaChanged(articleId: string, actor?: string)         { return this.enqueue({ articleId, trigger: 'article.schema_changed', actor }) }
  onRulesetVersionChanged(articleId: string, actor?: string) { return this.enqueue({ articleId, trigger: 'ruleset.version_changed', actor }) }
  onWeightingModelChanged(articleId: string, actor?: string) { return this.enqueue({ articleId, trigger: 'weighting.model_changed', actor }) }
  onNightlyRescan(articleId: string)                         { return this.enqueue({ articleId, trigger: 'rescan.nightly', actor: 'system' }) }
  onHourlyReconcile(articleId: string)                       { return this.enqueue({ articleId, trigger: 'rescan.hourly_reconcile', actor: 'system' }) }
  onManualRequeue(articleId: string, actor: string)          { return this.enqueue({ articleId, trigger: 'manual.requeue', actor }) }

  // ── Transparency-asset triggers ─────────────────────────────────────────
  // Asset jobs reuse google_scoring_jobs but encode the asset_id in
  // payload.assetId, with article_id mirroring it so the existing FIFO
  // dispatcher keeps working unchanged.
  onAboutUpdated(actor?: string)                             { return this.enqueueTransparency('asset:about',     'transparency.about_updated', actor) }
  onContactUpdated(actor?: string)                           { return this.enqueueTransparency('asset:contact',   'transparency.contact_updated', actor) }
  onAuthorPageUpdated(authorSlug: string, actor?: string)    { return this.enqueueTransparency(`asset:author:${authorSlug}`, 'transparency.author_page_updated', actor) }
  onPublisherUpdated(actor?: string)                         { return this.enqueueTransparency('asset:publisher', 'transparency.publisher_updated', actor) }
  onEditorialPolicyUpdated(actor?: string)                   { return this.enqueueTransparency('asset:editorial-policy', 'transparency.editorial_policy_updated', actor) }

  private async enqueueTransparency(assetId: string, trigger: ScoringTrigger, actor?: string): Promise<EnqueueResult> {
    return this.enqueue({ articleId: assetId, trigger, actor, payload: { kind: 'transparency_asset', assetId } })
  }
}

const DEFAULT_RULESET: RulesetVersion = {
  version: '2026.04.28-1',
  description: 'Initial Google intelligence ruleset.',
  publishedAt: new Date().toISOString(),
  isActive: true,
  weighting: { searchEssentials: 25, googleNews: 20, trust: 15, spamSafety: 15, technical: 15, opportunity: 10 },
  ruleCount: 19,
}
