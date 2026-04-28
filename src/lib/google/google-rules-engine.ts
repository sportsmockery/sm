// Google rules engine.
// A pure function: (article, author, ruleset) -> RuleEvaluation[].
// No DB calls, no side effects — the persistence layer wraps this.
// Each rule declares its sourceType so the UI can label official-policy vs
// internal-heuristic vs sportsmockery-opportunity signals separately.

import { createHash } from 'crypto'
import type {
  RuleEvaluation, RuleFamily, RuleStatus, SourceType, RulesetVersion,
  TransparencyAsset, TransparencyAssetEvaluation, TransparencyAssetType,
} from './types'

// ── Inputs ──────────────────────────────────────────────────────────────────
export interface ArticleInput {
  id: string
  title: string
  body: string
  category: string
  tags: string[]
  metaTitle: string | null
  metaDescription: string | null
  canonical: string | null
  robots: string | null         // "index,follow" etc
  publishedAt: string | null
  updatedAt: string | null
  byline: string | null
  bodyImages: Array<{ src: string; alt: string | null }>
  internalLinkCount: number
  externalLinkCount: number
  schemaTypes: string[]         // ["NewsArticle", "Person", ...]
  topicEntities: string[]       // ["Caleb Williams", "Bears", ...]
  team: string | null
}

export interface AuthorInput {
  id: string
  name: string
  bio: string | null
  hasAuthorPage: boolean
  hasContactInfo: boolean
  hasCredentials: boolean
  publishedArticleCount: number
}

// ── Rule definition shape ───────────────────────────────────────────────────
interface RuleDef {
  id: string
  family: RuleFamily
  sourceType: SourceType
  impactedField: string | null
  evaluate: (a: ArticleInput, u: AuthorInput) => {
    status: RuleStatus
    confidence: number
    explanation: string
    remediation: string | null
  }
}

const ok = (explanation: string) => ({ status: 'pass' as RuleStatus, confidence: 1, explanation, remediation: null })
const warn = (explanation: string, remediation: string, confidence = 0.85) =>
  ({ status: 'warn' as RuleStatus, confidence, explanation, remediation })
const fail = (explanation: string, remediation: string, confidence = 0.9) =>
  ({ status: 'fail' as RuleStatus, confidence, explanation, remediation })

// ── Rule catalog ────────────────────────────────────────────────────────────
// Sources cited in rule explanations are paraphrased from publicly documented
// Google Search Essentials, Search spam policies, and Google News transparency
// guidance. This is an *internal* model; it does not claim to reproduce
// Google's ranking algorithm.
const RULES: RuleDef[] = [
  // ── Search Essentials (official-policy) ──────────────────────────────────
  {
    id: 'se.title.descriptive',
    family: 'search_essentials',
    sourceType: 'official-policy',
    impactedField: 'title',
    evaluate: (a) => {
      const len = a.title.trim().length
      if (len === 0) return fail('Article has no title.', 'Add a descriptive title between 30 and 70 characters.')
      if (len < 25) return warn(`Title is ${len} chars — short titles tend to lack descriptive keywords.`, 'Expand the title to ~30–70 characters and include the primary entity.')
      if (len > 75) return warn(`Title is ${len} chars — likely truncated in SERPs.`, 'Trim to ~70 characters; keep the most important keyword first.')
      return ok('Title length is in the descriptive range.')
    },
  },
  {
    id: 'se.meta.description',
    family: 'search_essentials',
    sourceType: 'official-policy',
    impactedField: 'meta_description',
    evaluate: (a) => {
      const m = (a.metaDescription || '').trim()
      if (!m) return fail('Missing meta description.', 'Add a 120–160 character meta description summarizing the article.')
      if (m.length < 70) return warn(`Meta description is ${m.length} chars — likely under-described.`, 'Expand the meta description to 120–160 characters.')
      if (m.length > 170) return warn(`Meta description is ${m.length} chars — likely truncated.`, 'Trim to under 160 characters.')
      return ok('Meta description length is healthy.')
    },
  },
  {
    id: 'se.headings.alt',
    family: 'search_essentials',
    sourceType: 'official-policy',
    impactedField: 'image_alt',
    evaluate: (a) => {
      if (a.bodyImages.length === 0) return ok('No images present; no alt text required.')
      const missing = a.bodyImages.filter((i) => !i.alt || i.alt.trim().length < 4).length
      if (missing === 0) return ok('All images have descriptive alt text.')
      const ratio = missing / a.bodyImages.length
      if (ratio >= 0.5) return fail(`${missing}/${a.bodyImages.length} images missing alt text.`, 'Add descriptive alt text to every image.')
      return warn(`${missing}/${a.bodyImages.length} images missing alt text.`, 'Add alt text to remaining images.', 0.9)
    },
  },
  {
    id: 'se.links.internal',
    family: 'search_essentials',
    sourceType: 'official-policy',
    impactedField: 'internal_links',
    evaluate: (a) => {
      if (a.internalLinkCount === 0) return warn('Article has no internal links.', 'Add internal links to related coverage to improve crawlability.')
      if (a.internalLinkCount === 1) return warn('Article has only one internal link.', 'Add 2–4 internal links to related Chicago sports coverage.', 0.8)
      return ok(`Article has ${a.internalLinkCount} internal links.`)
    },
  },

  // ── Google News (official-policy) ────────────────────────────────────────
  {
    id: 'gn.byline.present',
    family: 'google_news',
    sourceType: 'official-policy',
    impactedField: 'byline',
    evaluate: (a) => a.byline && a.byline.trim().length >= 3
      ? ok('Byline is present.')
      : fail('Article is missing a byline.', 'Set the byline to the author\'s real name (Google News transparency).'),
  },
  {
    id: 'gn.dates.visible',
    family: 'google_news',
    sourceType: 'official-policy',
    impactedField: 'published_at',
    evaluate: (a) => {
      if (!a.publishedAt) return fail('Article has no published timestamp.', 'Set a published date; Google News expects a clear date.')
      if (!a.updatedAt) return warn('Article has no updated timestamp.', 'Surface an updatedAt when the article changes.', 0.7)
      return ok('Both published and updated timestamps are present.')
    },
  },
  {
    id: 'gn.author.transparency',
    family: 'google_news',
    sourceType: 'official-policy',
    impactedField: 'author_profile',
    evaluate: (_a, u) => {
      if (!u.hasAuthorPage) return fail('Author has no public author page.', 'Build an /authors/{slug} page exposing bio, credentials, and contact.')
      if (!u.hasContactInfo) return warn('Author page is missing contact info.', 'Add email or social handle to the author page.', 0.85)
      if (!u.hasCredentials) return warn('Author page lacks credentials.', 'Document Chicago sports coverage history / credentials.', 0.7)
      return ok('Author transparency surface is complete.')
    },
  },
  {
    id: 'gn.schema.newsarticle',
    family: 'google_news',
    sourceType: 'official-policy',
    impactedField: 'schema',
    evaluate: (a) => a.schemaTypes.includes('NewsArticle') || a.schemaTypes.includes('Article')
      ? ok('Article schema is emitted.')
      : warn('No NewsArticle schema detected.', 'Emit NewsArticle JSON-LD with headline, datePublished, author, publisher.', 0.8),
  },

  // ── Trust / E-E-A-T (internal-heuristic) ─────────────────────────────────
  {
    id: 'tr.author.bio',
    family: 'trust_eeat',
    sourceType: 'internal-heuristic',
    impactedField: 'author_bio',
    evaluate: (_a, u) => {
      const len = (u.bio || '').trim().length
      if (len === 0) return fail('Author has no bio.', 'Write a 60–200 word bio describing Chicago sports coverage history.')
      if (len < 80) return warn('Author bio is short.', 'Expand the bio to ≥80 characters with credentials and beat focus.', 0.8)
      return ok('Author bio is present and substantive.')
    },
  },
  {
    id: 'tr.author.tenure',
    family: 'trust_eeat',
    sourceType: 'internal-heuristic',
    impactedField: 'author_history',
    evaluate: (_a, u) => u.publishedArticleCount >= 8
      ? ok(`Author has ${u.publishedArticleCount} published articles.`)
      : warn(`Author has only ${u.publishedArticleCount} articles.`, 'Build author tenure with regular publication.', 0.6),
  },
  {
    id: 'tr.body.firsthand',
    family: 'trust_eeat',
    sourceType: 'internal-heuristic',
    impactedField: 'body',
    evaluate: (a) => {
      const body = a.body.toLowerCase()
      const firsthand = ['watched', 'attended', 'spoke with', 'reported from', 'interviewed', 'press box']
        .some((p) => body.includes(p))
      return firsthand
        ? ok('Body contains first-hand reporting markers.')
        : warn('No first-hand reporting markers detected.', 'Where applicable, surface attendance, interviews, or direct sourcing.', 0.55)
    },
  },

  // ── Spam policy safety (official-policy) ─────────────────────────────────
  {
    id: 'sp.thin_content',
    family: 'spam_policy',
    sourceType: 'official-policy',
    impactedField: 'body',
    evaluate: (a) => {
      const wc = a.body.trim().split(/\s+/).filter(Boolean).length
      if (wc < 120) return fail(`Body is ${wc} words — risk of thin-content classification.`, 'Expand to ≥250 words of substantive coverage.')
      if (wc < 220) return warn(`Body is ${wc} words — borderline thin.`, 'Aim for ≥250 words.', 0.8)
      return ok(`Body is ${wc} words.`)
    },
  },
  {
    id: 'sp.keyword_stuffing',
    family: 'spam_policy',
    sourceType: 'official-policy',
    impactedField: 'body',
    evaluate: (a) => {
      const tokens = a.body.toLowerCase().split(/\s+/).filter((t) => t.length > 4)
      if (tokens.length < 50) return ok('Body too short to assess stuffing.')
      const counts = new Map<string, number>()
      tokens.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1))
      const top = Array.from(counts.values()).sort((a, b) => b - a)[0] || 0
      const ratio = top / tokens.length
      if (ratio > 0.08) return fail(`Top token density is ${(ratio * 100).toFixed(1)}%.`, 'Vary phrasing; reduce repeated keyword usage.')
      if (ratio > 0.05) return warn(`Top token density is ${(ratio * 100).toFixed(1)}%.`, 'Slightly high keyword density; vary phrasing.', 0.75)
      return ok('Keyword density is healthy.')
    },
  },
  {
    id: 'sp.misleading_headline',
    family: 'spam_policy',
    sourceType: 'official-policy',
    impactedField: 'title',
    evaluate: (a) => {
      const t = a.title.toLowerCase()
      const baity = ['you won\'t believe', 'shocking', 'this one trick', '???']
      const hit = baity.find((p) => t.includes(p))
      return hit
        ? warn(`Headline contains clickbait phrase: "${hit}".`, 'Rewrite the headline to describe the article truthfully.', 0.9)
        : ok('Headline does not match clickbait patterns.')
    },
  },

  // ── Technical indexability (official-policy) ─────────────────────────────
  {
    id: 'ti.canonical',
    family: 'technical_indexability',
    sourceType: 'official-policy',
    impactedField: 'canonical',
    evaluate: (a) => a.canonical && a.canonical.startsWith('https://')
      ? ok('Canonical URL is set.')
      : warn('Canonical URL is missing or not absolute.', 'Set an absolute canonical URL.', 0.85),
  },
  {
    id: 'ti.robots.indexable',
    family: 'technical_indexability',
    sourceType: 'official-policy',
    impactedField: 'robots',
    evaluate: (a) => {
      const r = (a.robots || 'index,follow').toLowerCase()
      if (r.includes('noindex')) return fail('Article is marked noindex.', 'Remove noindex unless intentionally hidden.')
      return ok('Article is indexable.')
    },
  },
  {
    id: 'ti.url.descriptive',
    family: 'technical_indexability',
    sourceType: 'official-policy',
    impactedField: 'canonical',
    evaluate: (a) => {
      if (!a.canonical) return warn('No canonical to evaluate URL slug.', 'Set canonical first.', 0.6)
      const slug = a.canonical.split('/').filter(Boolean).pop() || ''
      if (/^\d+$/.test(slug)) return warn('URL slug is numeric only.', 'Use a descriptive, hyphenated slug.', 0.85)
      if (slug.length < 6) return warn('URL slug is very short.', 'Use a 4–8 word descriptive slug.', 0.75)
      return ok('URL slug is descriptive.')
    },
  },

  // ── SportsMockery opportunity (sportsmockery-opportunity) ────────────────
  {
    id: 'op.chicago_entity',
    family: 'sportsmockery_opportunity',
    sourceType: 'sportsmockery-opportunity',
    impactedField: 'topic_entities',
    evaluate: (a) => {
      const chiTeams = ['bears', 'cubs', 'bulls', 'blackhawks', 'white sox', 'sox', 'sky', 'fire']
      const blob = (a.title + ' ' + a.body + ' ' + a.tags.join(' ')).toLowerCase()
      const hit = chiTeams.some((t) => blob.includes(t))
      return hit
        ? ok('Article references a Chicago team or entity.')
        : warn('No Chicago team/entity reference detected.', 'Tie the angle to a Chicago team where editorially honest.', 0.7)
    },
  },
  {
    id: 'op.evergreen_signal',
    family: 'sportsmockery_opportunity',
    sourceType: 'sportsmockery-opportunity',
    impactedField: 'topic_entities',
    evaluate: (a) => {
      const evergreen = ['draft', 'mock', 'history', 'all-time', 'roster', 'cap', 'contract', 'simulator']
      const blob = (a.title + ' ' + a.tags.join(' ')).toLowerCase()
      return evergreen.some((p) => blob.includes(p))
        ? ok('Article carries evergreen signals.')
        : warn('No evergreen signal detected.', 'Where appropriate, lean into draft, cap, history, or simulator angles.', 0.55)
    },
  },
]

export function evaluateArticle(
  article: ArticleInput,
  author: AuthorInput,
  ruleset: RulesetVersion,
): RuleEvaluation[] {
  const evaluatedAt = new Date().toISOString()
  return RULES.map((rule) => {
    const r = rule.evaluate(article, author)
    return {
      id: createHash('sha256')
        .update(`${article.id}:${rule.id}:${ruleset.version}:${evaluatedAt}`)
        .digest('hex')
        .slice(0, 24),
      articleId: article.id,
      ruleId: rule.id,
      ruleFamily: rule.family,
      sourceType: rule.sourceType,
      status: r.status,
      confidence: r.confidence,
      impactedField: rule.impactedField,
      explanation: r.explanation,
      remediation: r.remediation,
      rulesetVersion: ruleset.version,
      evaluatedAt,
    }
  })
}

export function listRuleDefinitions() {
  return [
    ...RULES.map((r) => ({ id: r.id, family: r.family, sourceType: r.sourceType, impactedField: r.impactedField })),
    ...TRANSPARENCY_RULES.map((r) => ({ id: r.id, family: 'transparency_assets' as RuleFamily, sourceType: r.sourceType, impactedField: r.impactedField })),
  ]
}

// ── Transparency asset rules ────────────────────────────────────────────────
// Crawled trust-asset surfaces: /about, /authors/*, /contact, publisher
// identity blocks, editorial policy, disclosures. These rules run on the
// extracted, normalized asset payload — not the article — and feed the site
// transparency score that blends into article trust.

export interface TransparencyAssetInput {
  id: string
  assetType: TransparencyAssetType
  url: string
  label: string
  ownerId: string | null
  exists: boolean                  // crawler reached a 200
  hasPublisherIdentity: boolean    // names "SportsMockery" / publisher entity
  hasCompanyInfo: boolean          // about contains org info
  hasContactInfo: boolean          // email / phone / form / address present
  contactIsNonGeneric: boolean     // not info@gmail.com etc.
  hasEditorialContext: boolean     // about explains editorial mission
  hasBio: boolean                  // author page
  hasCredentials: boolean          // author page
  hasContactOrSocial: boolean      // author page
  consistentByline: boolean        // author page byline matches article bylines
  hasDisclosure: boolean           // affiliate / sponsored disclosure
  hasEditorialPolicy: boolean      // standalone editorial policy page
  needsDisclosure: boolean         // platform serves affiliate / sponsored content
}

interface TransparencyRuleDef {
  id: string
  appliesTo: TransparencyAssetType[]
  sourceType: SourceType
  impactedField: string
  evaluate: (a: TransparencyAssetInput) => {
    status: RuleStatus
    confidence: number
    explanation: string
    remediation: string | null
  }
}

const TRANSPARENCY_RULES: TransparencyRuleDef[] = [
  // ABOUT ──────────────────────────────────────────────────────────────────
  { id: 'tp.about.exists', appliesTo: ['about_page'], sourceType: 'official-policy', impactedField: 'about_page',
    evaluate: (a) => a.exists ? ok('About page is reachable.') : fail('About page is missing.', 'Publish a public /about page describing the publisher.') },
  { id: 'tp.about.publisher_identity', appliesTo: ['about_page'], sourceType: 'official-policy', impactedField: 'publisher_identity',
    evaluate: (a) => a.hasPublisherIdentity ? ok('About page identifies the publisher.') : fail('About page does not identify the publisher.', 'Name the publishing entity (SportsMockery / SM Edge) on /about.') },
  { id: 'tp.about.company_info', appliesTo: ['about_page'], sourceType: 'official-policy', impactedField: 'company_info',
    evaluate: (a) => a.hasCompanyInfo ? ok('About page contains company info.') : warn('About page lacks company info.', 'Add company background (mission, founding, structure) to /about.', 0.85) },
  { id: 'tp.about.contact_info', appliesTo: ['about_page'], sourceType: 'official-policy', impactedField: 'contact_info',
    evaluate: (a) => a.hasContactInfo ? ok('About page surfaces contact info.') : fail('About page is missing contact info.', 'Add an email, address, or contact form link to /about.') },
  { id: 'tp.about.editorial_context', appliesTo: ['about_page'], sourceType: 'internal-heuristic', impactedField: 'editorial_context',
    evaluate: (a) => a.hasEditorialContext ? ok('About page explains editorial context.') : warn('About page lacks editorial context.', 'Describe SM Edge\'s editorial mission and standards on /about.', 0.8) },

  // AUTHOR PAGE ───────────────────────────────────────────────────────────
  { id: 'tp.author.exists', appliesTo: ['author_page'], sourceType: 'official-policy', impactedField: 'author_page',
    evaluate: (a) => a.exists ? ok('Author page is reachable.') : fail('Author page is missing.', 'Publish a public /authors/{slug} page for this writer.') },
  { id: 'tp.author.bio_present', appliesTo: ['author_page'], sourceType: 'official-policy', impactedField: 'author_bio',
    evaluate: (a) => a.hasBio ? ok('Author page includes a bio.') : fail('Author page has no bio.', 'Add a bio describing the writer\'s coverage history.') },
  { id: 'tp.author.credentials_present', appliesTo: ['author_page'], sourceType: 'internal-heuristic', impactedField: 'author_credentials',
    evaluate: (a) => a.hasCredentials ? ok('Author page lists credentials.') : warn('Author page lacks credentials.', 'Document Chicago sports beat, prior outlets, or expertise.', 0.8) },
  { id: 'tp.author.contact_or_social', appliesTo: ['author_page'], sourceType: 'official-policy', impactedField: 'author_contact',
    evaluate: (a) => a.hasContactOrSocial ? ok('Author page exposes contact / social.') : warn('Author page lacks contact or social handles.', 'Add an email or social handle so readers can reach the author.', 0.85) },
  { id: 'tp.author.article_attribution_consistency', appliesTo: ['author_page'], sourceType: 'internal-heuristic', impactedField: 'byline_consistency',
    evaluate: (a) => a.consistentByline ? ok('Author byline matches article attributions.') : warn('Author page byline differs from article attributions.', 'Reconcile the author\'s display name across articles and the author page.', 0.7) },

  // PUBLISHER / CONTACT ───────────────────────────────────────────────────
  { id: 'tp.contact.exists', appliesTo: ['contact_page'], sourceType: 'official-policy', impactedField: 'contact_page',
    evaluate: (a) => a.exists ? ok('Contact page is reachable.') : fail('Contact page is missing.', 'Publish a public /contact page or surface contact info on /about.') },
  { id: 'tp.publisher.identity_clear', appliesTo: ['publisher_identity'], sourceType: 'official-policy', impactedField: 'publisher_identity',
    evaluate: (a) => a.hasPublisherIdentity ? ok('Publisher identity is clearly stated.') : fail('Publisher identity is unclear.', 'State the publisher entity in the footer and on /about.') },
  { id: 'tp.publisher.non_generic_contact', appliesTo: ['contact_page', 'publisher_identity'], sourceType: 'internal-heuristic', impactedField: 'contact_info',
    evaluate: (a) => a.contactIsNonGeneric ? ok('Contact channel is non-generic.') : warn('Contact channel uses a generic address.', 'Use a branded domain email (e.g. editorial@sportsmockery.com).', 0.75) },

  // DISCLOSURE / EDITORIAL POLICY ─────────────────────────────────────────
  { id: 'tp.disclosure.present_if_needed', appliesTo: ['disclosure_page'], sourceType: 'official-policy', impactedField: 'disclosure',
    evaluate: (a) => a.needsDisclosure
      ? (a.hasDisclosure ? ok('Required disclosure is present.') : fail('Affiliate / sponsored disclosure is required but missing.', 'Publish an /affiliate-disclosure page and link from footer.'))
      : ok('Disclosure not required for current content mix.') },
  { id: 'tp.editorial_policy.present_if_available', appliesTo: ['editorial_policy_page'], sourceType: 'internal-heuristic', impactedField: 'editorial_policy',
    evaluate: (a) => a.hasEditorialPolicy ? ok('Editorial policy is published.') : warn('Editorial policy is not published.', 'Publish an /editorial-policy page describing standards and corrections.', 0.7) },
]

export function evaluateTransparencyAsset(
  asset: TransparencyAssetInput,
  ruleset: RulesetVersion,
): TransparencyAssetEvaluation[] {
  const evaluatedAt = new Date().toISOString()
  const applicable = TRANSPARENCY_RULES.filter((r) => r.appliesTo.includes(asset.assetType))
  return applicable.map((rule) => {
    const r = rule.evaluate(asset)
    return {
      id: createHash('sha256')
        .update(`${asset.id}:${rule.id}:${ruleset.version}:${evaluatedAt}`)
        .digest('hex')
        .slice(0, 24),
      assetId: asset.id,
      ruleId: rule.id,
      ruleFamily: 'transparency_assets',
      sourceType: rule.sourceType,
      status: r.status,
      confidence: r.confidence,
      impactedField: rule.impactedField,
      explanation: r.explanation,
      remediation: r.remediation,
      rulesetVersion: ruleset.version,
      evaluatedAt,
    }
  })
}

export function listTransparencyRules(assetType?: TransparencyAssetType) {
  return TRANSPARENCY_RULES
    .filter((r) => !assetType || r.appliesTo.includes(assetType))
    .map((r) => ({ id: r.id, sourceType: r.sourceType, impactedField: r.impactedField, appliesTo: r.appliesTo }))
}
