// Google transparency service.
// Hydrates and persists transparency assets (/about, author pages, contact,
// publisher identity, editorial policy, disclosure). The worker calls
// `processAssetJob()` for jobs whose payload.kind === 'transparency_asset'.
//
// Hydration is delegated via a TransparencyAssetHydrator interface so the
// concrete crawler/extractor (HTTP fetch + DOM parse, or DB-backed snapshot)
// can be wired in without modifying this module.

import { createHash } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  evaluateTransparencyAsset,
  type TransparencyAssetInput,
} from './google-rules-engine'
import { scoreTransparencyAsset, siteTransparencyFromAssetScores } from './google-score-engine'
import { generateTransparencyRecommendations } from './google-recommendation-engine'
import { GoogleAuditService } from './google-audit-service'
import { GoogleIngestionService } from './google-ingestion-service'
import type {
  Recommendation, RulesetVersion, ScoringTrigger,
  TransparencyAsset, TransparencyAssetType,
} from './types'

export interface TransparencyAssetHydrator {
  hydrate(assetId: string): Promise<{
    assetType: TransparencyAssetType
    url: string
    label: string
    ownerScope: 'site' | 'author'
    ownerId: string | null
    extracted: TransparencyAssetInput
  } | null>
}

export interface ProcessAssetResult {
  assetId: string
  total: number
  status: 'green' | 'amber' | 'red'
  findingsCount: number
  recommendationsCount: number
  unchanged: boolean
}

export class GoogleTransparencyService {
  private readonly audit: GoogleAuditService
  private readonly ingest: GoogleIngestionService

  constructor(
    private readonly db: SupabaseClient,
    private readonly hydrator: TransparencyAssetHydrator,
  ) {
    this.audit = new GoogleAuditService(db)
    this.ingest = new GoogleIngestionService(db)
  }

  async processAssetJob(args: {
    assetId: string
    trigger: ScoringTrigger
    rulesetVersion: string
  }): Promise<ProcessAssetResult> {
    const ruleset = await this.ingest.getActiveRuleset()
    const hydrated = await this.hydrator.hydrate(args.assetId)
    if (!hydrated) throw new Error(`transparency asset ${args.assetId} not found`)

    const contentHash = createHash('sha256')
      .update(JSON.stringify(hydrated.extracted))
      .digest('hex')

    // Idempotency: skip if ruleset + content unchanged (except nightly/manual).
    const { data: existing } = await this.db
      .from('google_transparency_assets')
      .select('content_hash, ruleset_version, total')
      .eq('id', args.assetId)
      .maybeSingle()

    const unchanged = existing
      && existing.content_hash === contentHash
      && existing.ruleset_version === ruleset.version

    if (unchanged && args.trigger !== 'rescan.nightly' && args.trigger !== 'manual.requeue') {
      await this.audit.logTransparencyEvent({
        actor: 'system', assetId: args.assetId, action: 'transparency.noop',
        metadata: { reason: 'unchanged', trigger: args.trigger },
      })
      return { assetId: args.assetId, total: existing.total, status: existing.total >= 80 ? 'green' : existing.total >= 60 ? 'amber' : 'red', findingsCount: 0, recommendationsCount: 0, unchanged: true }
    }

    const evaluations = evaluateTransparencyAsset({ ...hydrated.extracted, id: args.assetId, assetType: hydrated.assetType, url: hydrated.url, label: hydrated.label, ownerId: hydrated.ownerId }, ruleset)
    const { total, status, findingsCount } = scoreTransparencyAsset(evaluations)
    const prevTotal = existing?.total ?? null
    const delta = prevTotal == null ? null : total - prevTotal
    const now = new Date().toISOString()

    // Upsert asset.
    const asset: TransparencyAsset = {
      id: args.assetId,
      assetType: hydrated.assetType,
      url: hydrated.url,
      label: hydrated.label,
      ownerScope: hydrated.ownerScope,
      ownerId: hydrated.ownerId,
      contentHash,
      lastCrawledAt: now,
      lastEvaluatedAt: now,
      status,
      total,
      findingsCount,
      recommendationCount: 0,           // patched below after recs are written
      rulesetVersion: ruleset.version,
    }
    await this.db.from('google_transparency_assets').upsert({
      id: asset.id,
      asset_type: asset.assetType,
      url: asset.url,
      label: asset.label,
      owner_scope: asset.ownerScope,
      owner_id: asset.ownerId,
      content_hash: asset.contentHash,
      last_crawled_at: asset.lastCrawledAt,
      last_evaluated_at: asset.lastEvaluatedAt,
      status: asset.status,
      total: asset.total,
      findings_count: asset.findingsCount,
      recommendation_count: asset.recommendationCount,
      ruleset_version: asset.rulesetVersion,
    }, { onConflict: 'id' })

    // Replace evaluations for (asset, ruleset).
    await this.db.from('google_transparency_asset_evaluations')
      .delete().eq('asset_id', args.assetId).eq('ruleset_version', ruleset.version)
    if (evaluations.length > 0) {
      await this.db.from('google_transparency_asset_evaluations').insert(evaluations.map((e) => ({
        id: e.id,
        asset_id: e.assetId,
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
    }

    // History row.
    await this.db.from('google_transparency_asset_history').insert({
      asset_id: args.assetId,
      ruleset_version: ruleset.version,
      total,
      prev_total: prevTotal,
      delta,
      trigger: args.trigger,
      content_hash: contentHash,
      scored_at: now,
    })

    // Reconcile recommendations (preserve state, append new, expire stale).
    const { data: existingRecsRaw } = await this.db
      .from('google_recommendations')
      .select('*')
      .eq('scope', 'transparency_asset')
      .eq('scope_id', args.assetId)
    const existingMap = new Map<string, Recommendation>(
      (existingRecsRaw ?? []).map((r: Record<string, unknown>) => [String(r.id), mapRec(r)]),
    )
    const next = generateTransparencyRecommendations(asset, evaluations, {
      rulesetVersion: ruleset.version,
      existingRecommendations: existingMap,
    })
    const nextIds = new Set(next.map((r) => r.id))
    const stale = Array.from(existingMap.values()).filter((r) => !nextIds.has(r.id) && r.status !== 'resolved')
    if (stale.length > 0) {
      await this.db.from('google_recommendations')
        .update({ status: 'expired', updated_at: now })
        .in('id', stale.map((s) => s.id))
      for (const s of stale) {
        await this.db.from('google_recommendation_state_history').insert({
          recommendation_id: s.id, from_status: s.status, to_status: 'expired',
          actor: 'system', occurred_at: now,
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
        evidence: r.evidence ?? null,
        suggested_fix: r.suggestedFix ?? null,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
        resolved_at: r.resolvedAt,
        aging_hours: r.agingHours,
      })), { onConflict: 'id' })
    }

    // Patch recommendation_count on the asset row.
    await this.db.from('google_transparency_assets')
      .update({ recommendation_count: next.length })
      .eq('id', args.assetId)

    await this.audit.logTransparencyEvent({
      actor: 'system', assetId: args.assetId,
      action: 'transparency.recompute',
      metadata: { rulesetVersion: ruleset.version, total, prevTotal, delta, trigger: args.trigger, recommendations: next.length },
    })

    return { assetId: args.assetId, total, status, findingsCount, recommendationsCount: next.length, unchanged: false }
  }

  async siteTransparencyScore(): Promise<number> {
    const { data } = await this.db
      .from('google_transparency_assets')
      .select('total, owner_scope')
      .eq('owner_scope', 'site')
    const totals = (data ?? []).map((r: any) => Number(r.total ?? 0))
    return siteTransparencyFromAssetScores(totals)
  }

  async authorPageScore(authorId: string): Promise<number | null> {
    const { data } = await this.db
      .from('google_transparency_assets')
      .select('total')
      .eq('owner_scope', 'author')
      .eq('owner_id', authorId)
      .maybeSingle()
    if (!data) return null
    return Number(data.total ?? 0)
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
    evidence: (r.evidence as string | null) ?? null,
    suggestedFix: (r.suggested_fix as string | null) ?? null,
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
    resolvedAt: (r.resolved_at as string | null) ?? null,
    agingHours: Number(r.aging_hours ?? 0),
  }
}
