// Google Intelligence — shared TypeScript contracts.
// These types are the canonical shape for every UI surface, every engine, and
// every persistence layer in the Google tab. The DB columns in
// supabase/migrations/20260428_google_intelligence.sql mirror them 1:1.

export type SourceType =
  | 'official-policy'         // sourced from Google Search Essentials / Search spam policies / News transparency guidance
  | 'internal-heuristic'      // SportsMockery editorial standard derived from Google guidance
  | 'sportsmockery-opportunity' // SM-specific opportunity signal (Chicago topic relevance, etc.)

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type RuleStatus = 'pass' | 'warn' | 'fail' | 'not_applicable'
export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'
export type RecommendationStatus = 'open' | 'in_progress' | 'resolved' | 'suppressed' | 'expired'
export type RecommendationOwner = 'writer' | 'editor' | 'seo' | 'engineering' | 'admin' | 'unassigned'

export type RuleFamily =
  | 'search_essentials'
  | 'google_news'
  | 'trust_eeat'
  | 'spam_policy'
  | 'technical_indexability'
  | 'sportsmockery_opportunity'
  | 'transparency_assets'

export type TransparencyAssetType =
  | 'about_page'
  | 'author_page'
  | 'contact_page'
  | 'publisher_identity'
  | 'editorial_policy_page'
  | 'disclosure_page'

export type ScoringTrigger =
  | 'article.created'
  | 'article.imported'
  | 'article.published'
  | 'article.updated'
  | 'article.republished'
  | 'article.title_changed'
  | 'article.body_changed'
  | 'article.category_changed'
  | 'article.tags_changed'
  | 'article.byline_changed'
  | 'article.author_changed'
  | 'author.bio_changed'
  | 'author.transparency_changed'
  | 'article.meta_title_changed'
  | 'article.meta_description_changed'
  | 'article.canonical_changed'
  | 'article.robots_changed'
  | 'article.image_alt_changed'
  | 'article.schema_changed'
  | 'ruleset.version_changed'
  | 'weighting.model_changed'
  | 'rescan.nightly'
  | 'rescan.hourly_reconcile'
  | 'manual.requeue'
  | 'transparency.about_updated'
  | 'transparency.contact_updated'
  | 'transparency.author_page_updated'
  | 'transparency.publisher_updated'
  | 'transparency.editorial_policy_updated'

export interface SubScores {
  searchEssentials: number       // 0..25
  googleNews: number             // 0..20
  trust: number                  // 0..15
  spamSafety: number             // 0..15  (higher = safer)
  technical: number              // 0..15
  opportunity: number            // 0..10
}

export interface TrustComposition {
  articleTrust: number           // 0..15 — body/author article-level trust rules
  authorPageTrust: number        // 0..15 — author transparency asset
  siteTransparency: number       // 0..15 — about/contact/publisher/etc.
  finalTrust: number             // 0..15 — blended value used in SubScores.trust
}

export interface ArticleScore {
  articleId: string
  authorId: string | null
  rulesetVersion: string
  total: number                  // 0..100
  sub: SubScores
  trustComposition?: TrustComposition
  scoredAt: string               // ISO
  trigger: ScoringTrigger
  contentHash: string            // sha256 of normalized content
  authorProfileHash: string      // sha256 of byline+bio+transparency fields
}

export interface ArticleScoreHistoryEntry extends ArticleScore {
  id: string
  prevTotal: number | null
  delta: number | null
}

export interface RuleEvaluation {
  id: string
  articleId: string
  ruleId: string
  ruleFamily: RuleFamily
  sourceType: SourceType
  status: RuleStatus
  confidence: number             // 0..1
  impactedField: string | null   // e.g. "meta_description", "byline", "headline"
  explanation: string
  remediation: string | null
  rulesetVersion: string
  evaluatedAt: string
}

export interface Recommendation {
  id: string
  scope: 'article' | 'author' | 'sitewide' | 'transparency_asset'
  scopeId: string                // articleId | authorId | 'site' | asset_id
  title: string
  detail: string
  severity: Severity
  owner: RecommendationOwner
  impactScore: number            // 0..100 — projected lift if resolved
  confidence: number             // 0..1
  status: RecommendationStatus
  sourceType: SourceType
  ruleIds: string[]
  rulesetVersion: string
  evidence?: string | null       // observed condition (e.g. "no <address>")
  suggestedFix?: string | null   // concrete remediation
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  agingHours: number
}

export interface TransparencyAsset {
  id: string                     // stable id (e.g. "asset:about", "asset:author:erik-lambert")
  assetType: TransparencyAssetType
  url: string                    // public URL of the asset
  label: string                  // display name (e.g. "About SM Edge", "Erik Lambert")
  ownerScope: 'site' | 'author'  // who owns the asset
  ownerId: string | null         // authorId when scoped to an author
  contentHash: string            // sha256 of crawled HTML/extracted fields
  lastCrawledAt: string | null
  lastEvaluatedAt: string | null
  status: 'green' | 'amber' | 'red'
  total: number                  // 0..100 transparency score for the asset
  findingsCount: number          // total non-pass evaluations
  recommendationCount: number
  rulesetVersion: string
}

export interface TransparencyAssetEvaluation {
  id: string
  assetId: string
  ruleId: string                 // e.g. "tp.about.contact_info"
  ruleFamily: 'transparency_assets'
  sourceType: SourceType
  status: RuleStatus
  confidence: number
  impactedField: string | null
  explanation: string            // observed evidence
  remediation: string | null
  rulesetVersion: string
  evaluatedAt: string
}

export interface TransparencyAssetHistoryEntry {
  id: string
  assetId: string
  rulesetVersion: string
  total: number
  prevTotal: number | null
  delta: number | null
  trigger: ScoringTrigger
  contentHash: string
  scoredAt: string
}

export interface ScoringJob {
  id: string
  articleId: string
  trigger: ScoringTrigger
  rulesetVersion: string
  status: JobStatus
  attempts: number
  enqueuedAt: string
  startedAt: string | null
  completedAt: string | null
  errorMessage: string | null
  payload: Record<string, unknown>
}

export interface RulesetVersion {
  version: string                // e.g. "2026.04.28-1"
  description: string
  publishedAt: string
  isActive: boolean
  weighting: SubScoreWeights
  ruleCount: number
}

export interface SubScoreWeights {
  searchEssentials: number
  googleNews: number
  trust: number
  spamSafety: number
  technical: number
  opportunity: number
}

export interface Suppression {
  id: string
  scope: 'article' | 'author' | 'rule'
  scopeId: string
  ruleId: string | null
  reason: string
  createdBy: string
  createdAt: string
  expiresAt: string | null
}

export interface SystemEvent {
  id: string
  type: ScoringTrigger | 'system.heartbeat' | 'job.failed' | 'ruleset.activated'
  articleId: string | null
  authorId: string | null
  payload: Record<string, unknown>
  occurredAt: string
}

export interface AuditLogEvent {
  id: string
  actor: string                  // user id or 'system'
  action: string                 // e.g. "score.recompute", "recommendation.resolve"
  target: string                 // entity id
  metadata: Record<string, unknown>
  occurredAt: string
}

// ── UI-shaped aggregates ────────────────────────────────────────────────────
export interface ArticleAnalysisRow {
  articleId: string
  title: string
  author: string
  authorId: string | null
  publishedAt: string
  updatedAt: string
  lastRescoredAt: string
  category: string
  topic: string
  total: number
  sub: SubScores
  headlineScore: number
  recommendationCount: number
  rulesetVersion: string
  status: 'green' | 'amber' | 'red'
}

export interface WriterLeaderboardRow {
  authorId: string
  name: string
  avatar: string | null
  articlesAnalyzed: number
  total: number
  sub: SubScores
  recommendationCount: number
  trend: number                  // delta vs prior period
  lastRescoredAt: string
  status: 'green' | 'amber' | 'red'
}

export interface OperationsSnapshot {
  lastArticleImportedAt: string | null
  lastArticleScoredAt: string | null
  scoredLast24h: number
  rescansLast24h: number
  pendingQueueDepth: number
  failedJobsCount: number
  lastSuccessfulJobAt: string | null
  activeRulesetVersion: string
  awaitingRescoreContent: number
  awaitingRescoreAuthor: number
  suppressionsCount: number
  // ── Transparency observability ─────────────────────────────────────────
  lastTransparencyScanAt: string | null
  pendingTransparencyRescans: number
  transparencyFailuresLast24h: number
  transparencyAssetsUnderReview: number
  recentAudit: AuditLogEvent[]
}

export interface GoogleTabPayload {
  generatedAt: string
  rulesetVersion: string
  weights: SubScoreWeights
  overview: {
    googleScore: number
    sub: SubScores
    avgWriterScore: number
    highRiskArticleCount: number
    newsReadyArticlePct: number
    deltaVsPriorPeriod: number
    lastScoringRunAt: string
  }
  scoreDistribution: Array<{ bucket: string; count: number }>
  writers: WriterLeaderboardRow[]
  articles: ArticleAnalysisRow[]
  rules: RuleEvaluation[]
  recommendations: Recommendation[]
  transparencyAssets: TransparencyAsset[]
  transparencyEvaluations: TransparencyAssetEvaluation[]
  siteTrust: {
    siteTransparencyScore: number   // 0..15 — fed into article trust composition
    aboutScore: number              // 0..100 — /about asset
    avgAuthorPageScore: number      // 0..100 — across active authors
    assetsScored: number
  }
  operations: OperationsSnapshot
}
