// Google recommendation engine.
// Translates rule evaluations into actionable, scoped recommendations:
//   - article-scope (fix this title, expand this body)
//   - author-scope  (build out author transparency)
//   - sitewide      (systemic patterns across writers)
// Each recommendation carries severity, owner, impact projection, confidence,
// and a stable id so state (open/in_progress/resolved/suppressed) can be
// tracked across rescoring runs.

import { createHash } from 'crypto'
import type {
  Recommendation, RecommendationOwner, Severity, RuleEvaluation, RulesetVersion, SourceType,
  TransparencyAsset, TransparencyAssetEvaluation,
} from './types'

// Map rule family -> default owner.
const FAMILY_OWNER: Record<string, RecommendationOwner> = {
  search_essentials: 'seo',
  google_news: 'editor',
  trust_eeat: 'editor',
  spam_policy: 'editor',
  technical_indexability: 'engineering',
  sportsmockery_opportunity: 'writer',
  transparency_assets: 'admin',
}

// Map rule status -> severity baseline.
function severityFor(ev: RuleEvaluation): Severity {
  if (ev.status === 'fail' && ev.ruleFamily === 'spam_policy') return 'critical'
  if (ev.status === 'fail' && ev.ruleFamily === 'technical_indexability') return 'critical'
  if (ev.status === 'fail') return 'high'
  if (ev.status === 'warn' && ev.ruleFamily === 'google_news') return 'medium'
  if (ev.status === 'warn') return 'low'
  return 'info'
}

function impactFor(ev: RuleEvaluation): number {
  // Projected lift if the recommendation is resolved. Heuristic.
  const familyWeight: Record<string, number> = {
    search_essentials: 25,
    google_news: 20,
    trust_eeat: 15,
    spam_policy: 15,
    technical_indexability: 15,
    sportsmockery_opportunity: 10,
  }
  const statusWeight = ev.status === 'fail' ? 1 : ev.status === 'warn' ? 0.5 : 0
  return Math.round(familyWeight[ev.ruleFamily] * statusWeight * ev.confidence)
}

function recId(scope: string, scopeId: string, ruleId: string): string {
  return createHash('sha256').update(`${scope}:${scopeId}:${ruleId}`).digest('hex').slice(0, 24)
}

export interface RecommendationContext {
  articleId: string
  authorId: string | null
  rulesetVersion: string
  rulesetSourceLookup: (ruleId: string) => SourceType
  existingRecommendations?: Map<string, Recommendation>
  now?: Date
}

export function generateRecommendations(
  evaluations: RuleEvaluation[],
  ctx: RecommendationContext,
): Recommendation[] {
  const now = (ctx.now ?? new Date()).toISOString()
  const out: Recommendation[] = []
  const existing = ctx.existingRecommendations ?? new Map()

  // Article-scoped: one recommendation per non-passing rule.
  for (const ev of evaluations) {
    if (ev.status === 'pass' || ev.status === 'not_applicable') continue
    if (!ev.remediation) continue

    const id = recId('article', ctx.articleId, ev.ruleId)
    const prior = existing.get(id)
    const createdAt = prior?.createdAt ?? now
    const agingHours = (Date.parse(now) - Date.parse(createdAt)) / 36e5

    out.push({
      id,
      scope: 'article',
      scopeId: ctx.articleId,
      title: titleForRule(ev),
      detail: ev.remediation,
      severity: severityFor(ev),
      owner: FAMILY_OWNER[ev.ruleFamily] ?? 'unassigned',
      impactScore: impactFor(ev),
      confidence: ev.confidence,
      status: prior?.status === 'suppressed' ? 'suppressed'
        : prior?.status === 'in_progress' ? 'in_progress'
        : 'open',
      sourceType: ev.sourceType,
      ruleIds: [ev.ruleId],
      rulesetVersion: ctx.rulesetVersion,
      createdAt,
      updatedAt: now,
      resolvedAt: null,
      agingHours: Math.round(agingHours * 10) / 10,
    })
  }

  // Author-scoped: collapse author-related rules into one author recommendation.
  if (ctx.authorId) {
    const authorRules = evaluations.filter((e) => e.impactedField?.startsWith('author_') && e.status !== 'pass')
    if (authorRules.length > 0) {
      const id = recId('author', ctx.authorId, 'author.transparency')
      const prior = existing.get(id)
      const createdAt = prior?.createdAt ?? now
      const agingHours = (Date.parse(now) - Date.parse(createdAt)) / 36e5

      out.push({
        id,
        scope: 'author',
        scopeId: ctx.authorId,
        title: 'Strengthen author transparency surface',
        detail: authorRules.map((r) => `• ${r.remediation}`).join('\n'),
        severity: authorRules.some((r) => r.status === 'fail') ? 'high' : 'medium',
        owner: 'editor',
        impactScore: Math.min(35, authorRules.reduce((s, r) => s + impactFor(r), 0)),
        confidence: avg(authorRules.map((r) => r.confidence)),
        status: prior?.status === 'suppressed' ? 'suppressed' : 'open',
        sourceType: 'official-policy',
        ruleIds: authorRules.map((r) => r.ruleId),
        rulesetVersion: ctx.rulesetVersion,
        createdAt,
        updatedAt: now,
        resolvedAt: null,
        agingHours: Math.round(agingHours * 10) / 10,
      })
    }
  }

  return out
}

export function generateSitewideRecommendations(
  perArticleEvaluations: RuleEvaluation[][],
  ctx: { rulesetVersion: string; existingRecommendations?: Map<string, Recommendation>; now?: Date },
): Recommendation[] {
  const now = (ctx.now ?? new Date()).toISOString()
  const out: Recommendation[] = []
  const existing = ctx.existingRecommendations ?? new Map()

  // Aggregate failure rates per rule.
  const counts = new Map<string, { total: number; fails: number; warns: number; sourceType: SourceType; sample?: RuleEvaluation }>()
  for (const evs of perArticleEvaluations) {
    for (const ev of evs) {
      const c = counts.get(ev.ruleId) ?? { total: 0, fails: 0, warns: 0, sourceType: ev.sourceType, sample: ev }
      c.total += 1
      if (ev.status === 'fail') c.fails += 1
      if (ev.status === 'warn') c.warns += 1
      counts.set(ev.ruleId, c)
    }
  }

  for (const [ruleId, c] of counts) {
    if (c.total < 5) continue
    const failRate = c.fails / c.total
    if (failRate < 0.3) continue
    const id = recId('sitewide', 'site', ruleId)
    const prior = existing.get(id)
    const createdAt = prior?.createdAt ?? now
    const agingHours = (Date.parse(now) - Date.parse(createdAt)) / 36e5

    out.push({
      id,
      scope: 'sitewide',
      scopeId: 'site',
      title: `Systemic failure: ${ruleId}`,
      detail: `${(failRate * 100).toFixed(0)}% of analyzed articles fail "${ruleId}". ${c.sample?.remediation ?? ''}`,
      severity: failRate > 0.6 ? 'critical' : failRate > 0.4 ? 'high' : 'medium',
      owner: 'editor',
      impactScore: Math.round(failRate * 60),
      confidence: 0.9,
      status: prior?.status === 'suppressed' ? 'suppressed' : 'open',
      sourceType: c.sourceType,
      ruleIds: [ruleId],
      rulesetVersion: ctx.rulesetVersion,
      createdAt,
      updatedAt: now,
      resolvedAt: null,
      agingHours: Math.round(agingHours * 10) / 10,
    })
  }

  return out
}

// ── Transparency-asset recommendations ──────────────────────────────────────
// One recommendation per non-passing transparency rule, scoped to the asset.
// Carries `evidence` (what we observed) and `suggestedFix` (concrete remediation)
// so admins/editors can act without re-deriving context.
export function generateTransparencyRecommendations(
  asset: TransparencyAsset,
  evaluations: TransparencyAssetEvaluation[],
  ctx: { rulesetVersion: string; existingRecommendations?: Map<string, Recommendation>; now?: Date },
): Recommendation[] {
  const now = (ctx.now ?? new Date()).toISOString()
  const out: Recommendation[] = []
  const existing = ctx.existingRecommendations ?? new Map()
  for (const ev of evaluations) {
    if (ev.status === 'pass' || ev.status === 'not_applicable') continue
    if (!ev.remediation) continue
    const id = recId('transparency_asset', asset.id, ev.ruleId)
    const prior = existing.get(id)
    const createdAt = prior?.createdAt ?? now
    const agingHours = (Date.parse(now) - Date.parse(createdAt)) / 36e5
    const owner: RecommendationOwner = asset.ownerScope === 'author' ? 'editor' : 'admin'
    const severity: Severity = ev.status === 'fail'
      ? (ev.ruleId.startsWith('tp.about') || ev.ruleId === 'tp.publisher.identity_clear' || ev.ruleId === 'tp.contact.exists' ? 'critical' : 'high')
      : ev.sourceType === 'official-policy' ? 'medium' : 'low'
    out.push({
      id,
      scope: 'transparency_asset',
      scopeId: asset.id,
      title: titleForTransparencyRule(ev.ruleId, asset.label),
      detail: ev.remediation,
      severity,
      owner,
      impactScore: ev.status === 'fail' ? 22 : 10,
      confidence: ev.confidence,
      status: prior?.status === 'suppressed' ? 'suppressed'
        : prior?.status === 'in_progress' ? 'in_progress'
        : 'open',
      sourceType: ev.sourceType,
      ruleIds: [ev.ruleId],
      rulesetVersion: ctx.rulesetVersion,
      evidence: ev.explanation,
      suggestedFix: ev.remediation,
      createdAt,
      updatedAt: now,
      resolvedAt: null,
      agingHours: Math.round(agingHours * 10) / 10,
    })
  }
  return out
}

function titleForTransparencyRule(ruleId: string, label: string): string {
  switch (ruleId) {
    case 'tp.about.exists':                       return `Publish /about page`
    case 'tp.about.publisher_identity':           return `Name publisher on /about`
    case 'tp.about.company_info':                 return `Add company info to /about`
    case 'tp.about.contact_info':                 return `Add contact info to /about`
    case 'tp.about.editorial_context':            return `Add editorial context to /about`
    case 'tp.author.exists':                      return `Publish author page for ${label}`
    case 'tp.author.bio_present':                 return `Add bio for ${label}`
    case 'tp.author.credentials_present':         return `Add credentials for ${label}`
    case 'tp.author.contact_or_social':           return `Add contact / social for ${label}`
    case 'tp.author.article_attribution_consistency': return `Reconcile byline for ${label}`
    case 'tp.contact.exists':                     return `Publish /contact page`
    case 'tp.publisher.identity_clear':           return `Clarify publisher identity`
    case 'tp.publisher.non_generic_contact':      return `Use branded contact email`
    case 'tp.disclosure.present_if_needed':       return `Publish required disclosure`
    case 'tp.editorial_policy.present_if_available': return `Publish editorial policy`
    default:                                      return `Address ${ruleId}`
  }
}

function titleForRule(ev: RuleEvaluation): string {
  switch (ev.ruleId) {
    case 'se.title.descriptive':   return 'Tighten the headline'
    case 'se.meta.description':    return 'Set a meta description'
    case 'se.headings.alt':        return 'Add alt text to images'
    case 'se.links.internal':      return 'Add internal links'
    case 'gn.byline.present':      return 'Set a real-name byline'
    case 'gn.dates.visible':       return 'Surface published & updated dates'
    case 'gn.author.transparency': return 'Build out author page'
    case 'gn.schema.newsarticle':  return 'Emit NewsArticle JSON-LD'
    case 'tr.author.bio':          return 'Strengthen author bio'
    case 'tr.author.tenure':       return 'Build author tenure'
    case 'tr.body.firsthand':      return 'Add first-hand reporting markers'
    case 'sp.thin_content':        return 'Expand thin content'
    case 'sp.keyword_stuffing':    return 'Vary phrasing'
    case 'sp.misleading_headline': return 'Rewrite clickbait headline'
    case 'ti.canonical':           return 'Set canonical URL'
    case 'ti.robots.indexable':    return 'Allow indexing'
    case 'ti.url.descriptive':     return 'Use a descriptive slug'
    case 'op.chicago_entity':      return 'Anchor to a Chicago team'
    case 'op.evergreen_signal':    return 'Lean into evergreen angle'
    default:                       return `Address rule ${ev.ruleId}`
  }
}

function avg(xs: number[]): number {
  if (xs.length === 0) return 0
  return xs.reduce((a, b) => a + b, 0) / xs.length
}
