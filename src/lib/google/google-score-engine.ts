// Google score engine.
// Pure: (rule evaluations, ruleset weights) -> 100-point score with sub-scores.
// The aggregator does not know about Google's ranking model — it produces an
// internal score aligned to documented Google guidance and weighted by the
// active ruleset.

import { createHash } from 'crypto'
import type {
  RuleEvaluation, ArticleScore, RulesetVersion, ScoringTrigger, SubScores, RuleFamily,
  TransparencyAssetEvaluation, TrustComposition,
} from './types'
import { evaluateArticle, type ArticleInput, type AuthorInput } from './google-rules-engine'

// Sub-score caps. Total = 100. These match the spec.
export const SUBSCORE_CAPS: SubScores = {
  searchEssentials: 25,
  googleNews: 20,
  trust: 15,
  spamSafety: 15,
  technical: 15,
  opportunity: 10,
}

// Map rule family -> sub-score key.
// transparency_assets folds into 'trust' — site/author transparency signals
// are part of the trust subscore, blended via composeTrust().
const FAMILY_TO_SUB: Record<RuleFamily, keyof SubScores> = {
  search_essentials: 'searchEssentials',
  google_news: 'googleNews',
  trust_eeat: 'trust',
  spam_policy: 'spamSafety',
  technical_indexability: 'technical',
  sportsmockery_opportunity: 'opportunity',
  transparency_assets: 'trust',
}

const STATUS_WEIGHT: Record<string, number> = {
  pass: 1.0,
  warn: 0.5,
  fail: 0.0,
  not_applicable: 1.0, // does not penalize
}

export function aggregateSubScores(
  evaluations: RuleEvaluation[],
  weights: SubScores = SUBSCORE_CAPS,
): SubScores {
  const buckets: Record<keyof SubScores, { score: number; cap: number }> = {
    searchEssentials: { score: 0, cap: 0 },
    googleNews: { score: 0, cap: 0 },
    trust: { score: 0, cap: 0 },
    spamSafety: { score: 0, cap: 0 },
    technical: { score: 0, cap: 0 },
    opportunity: { score: 0, cap: 0 },
  }

  for (const ev of evaluations) {
    if (ev.status === 'not_applicable') continue
    const key = FAMILY_TO_SUB[ev.ruleFamily]
    const w = STATUS_WEIGHT[ev.status] * ev.confidence
    buckets[key].score += w
    buckets[key].cap += 1
  }

  const out: SubScores = { ...SUBSCORE_CAPS }
  ;(Object.keys(buckets) as Array<keyof SubScores>).forEach((k) => {
    const { score, cap } = buckets[k]
    const ratio = cap === 0 ? 1 : score / cap
    out[k] = Math.round(ratio * weights[k] * 10) / 10
  })
  return out
}

export function computeTotal(sub: SubScores): number {
  return Math.round(
    sub.searchEssentials + sub.googleNews + sub.trust + sub.spamSafety + sub.technical + sub.opportunity,
  )
}

export function statusFromTotal(total: number): 'green' | 'amber' | 'red' {
  if (total >= 80) return 'green'
  if (total >= 60) return 'amber'
  return 'red'
}

export interface ScoreArticleResult {
  score: ArticleScore
  evaluations: RuleEvaluation[]
}

export interface ScoreArticleContext {
  // 0..15 — site transparency score (about + contact + publisher), already on the trust scale.
  siteTransparencyScore?: number
  // 0..100 — author-page transparency score for the article's author. Normalized to 0..15 internally.
  authorPageScore?: number
}

// Trust composition: 50% article rules, 25% author page, 25% site transparency.
// Weights are intentionally soft — when an input is missing, its weight folds
// back into the article-rule weight so trust never collapses.
export function composeTrust(
  articleTrust: number,        // 0..15 raw aggregated from article+author rules
  authorPageScore?: number,    // 0..100
  siteTransparencyScore?: number, // 0..15
): TrustComposition {
  const TRUST_CAP = 15
  const articleW = 0.50
  const authorW  = authorPageScore != null ? 0.25 : 0
  const siteW    = siteTransparencyScore != null ? 0.25 : 0
  const used     = articleW + authorW + siteW
  const articleN = (articleTrust / TRUST_CAP)
  const authorN  = (authorPageScore ?? 0) / 100
  const siteN    = (siteTransparencyScore ?? 0) / TRUST_CAP
  const blended  = (articleN * articleW + authorN * authorW + siteN * siteW) / used
  const finalTrust = Math.round(blended * TRUST_CAP * 10) / 10
  return {
    articleTrust: Math.round(articleTrust * 10) / 10,
    authorPageTrust: authorPageScore != null ? Math.round((authorPageScore / 100) * TRUST_CAP * 10) / 10 : 0,
    siteTransparency: siteTransparencyScore != null ? Math.round(siteTransparencyScore * 10) / 10 : 0,
    finalTrust,
  }
}

export function scoreArticle(
  article: ArticleInput,
  author: AuthorInput,
  ruleset: RulesetVersion,
  trigger: ScoringTrigger,
  ctx?: ScoreArticleContext,
): ScoreArticleResult {
  const evaluations = evaluateArticle(article, author, ruleset)
  const subRaw = aggregateSubScores(evaluations, ruleset.weighting)
  const trustComposition = composeTrust(subRaw.trust, ctx?.authorPageScore, ctx?.siteTransparencyScore)
  const sub: SubScores = { ...subRaw, trust: trustComposition.finalTrust }
  const total = computeTotal(sub)

  const contentHash = createHash('sha256')
    .update(`${article.title}|${article.body}|${article.metaTitle}|${article.metaDescription}|${article.canonical}|${article.robots}|${article.tags.join(',')}`)
    .digest('hex')
  const authorProfileHash = createHash('sha256')
    .update(`${author.name}|${author.bio}|${author.hasAuthorPage}|${author.hasContactInfo}|${author.hasCredentials}`)
    .digest('hex')

  return {
    score: {
      articleId: article.id,
      authorId: author.id,
      rulesetVersion: ruleset.version,
      total,
      sub,
      trustComposition,
      scoredAt: new Date().toISOString(),
      trigger,
      contentHash,
      authorProfileHash,
    },
    evaluations,
  }
}

// Aggregate transparency-asset evaluations into a 0..100 score for one asset
// and (when called over the site-level set) a 0..15 site transparency score
// suitable for feeding into composeTrust.
export function scoreTransparencyAsset(evaluations: TransparencyAssetEvaluation[]): { total: number; status: 'green' | 'amber' | 'red'; findingsCount: number } {
  if (evaluations.length === 0) return { total: 0, status: 'red', findingsCount: 0 }
  const STATUS_W: Record<string, number> = { pass: 1, warn: 0.5, fail: 0, not_applicable: 1 }
  let scored = 0
  let cap = 0
  let findings = 0
  for (const e of evaluations) {
    if (e.status === 'not_applicable') continue
    if (e.status !== 'pass') findings += 1
    scored += STATUS_W[e.status] * e.confidence
    cap += 1
  }
  const ratio = cap === 0 ? 0 : scored / cap
  const total = Math.round(ratio * 100)
  return { total, status: total >= 80 ? 'green' : total >= 60 ? 'amber' : 'red', findingsCount: findings }
}

export function siteTransparencyFromAssetScores(assetScores: number[]): number {
  if (assetScores.length === 0) return 0
  const avg = assetScores.reduce((s, n) => s + n, 0) / assetScores.length
  return Math.round((avg / 100) * 15 * 10) / 10  // → 0..15
}

export function headlineScoreFromEvaluations(evaluations: RuleEvaluation[]): number {
  const titleRules = evaluations.filter((e) => e.impactedField === 'title')
  if (titleRules.length === 0) return 100
  const passes = titleRules.filter((e) => e.status === 'pass').length
  const warns = titleRules.filter((e) => e.status === 'warn').length
  const fails = titleRules.filter((e) => e.status === 'fail').length
  const total = titleRules.length
  return Math.round(((passes + warns * 0.5) / total) * 100 - fails * 5)
}
