// Server-rendered mock payload for the Google tab. The hook
// (use-google-tab-data.ts) calls /api/admin/google-intelligence which calls
// `buildMockPayload()` until real DB rows exist. Once rows exist, the route
// reads them; this module is the seed for empty environments.

import type {
  GoogleTabPayload, ArticleAnalysisRow, WriterLeaderboardRow,
  RuleEvaluation, Recommendation, OperationsSnapshot, SubScores,
  TransparencyAsset, TransparencyAssetEvaluation,
} from './types'

const NOW = () => new Date()
const ISO = (offsetMin = 0) => new Date(Date.now() - offsetMin * 60_000).toISOString()

const writers: WriterLeaderboardRow[] = [
  mkWriter('w-001', 'Marcus Halloran', 47, 88, +3.4, 4),
  mkWriter('w-002', 'Renee Park',     38, 82, +1.1, 6),
  mkWriter('w-003', 'Devon Bates',    29, 74, -2.0, 9),
  mkWriter('w-004', 'Sarah Levine',   23, 71, +0.5, 7),
  mkWriter('w-005', 'Tomás Reyes',    18, 67, -4.6, 11),
  mkWriter('w-006', 'AJ Whitman',     14, 59, -1.2, 13),
]

const articles: ArticleAnalysisRow[] = [
  mkArticle('a-1001', 'Caleb Williams\' next-step playbook against Detroit', writers[0],
    91, { searchEssentials: 24, googleNews: 19, trust: 14, spamSafety: 14, technical: 14, opportunity: 6 },
    'Bears', 'Caleb Williams', 1, 92),
  mkArticle('a-1002', 'Why the Bulls\' bench is quietly the best in the East', writers[1],
    84, { searchEssentials: 22, googleNews: 18, trust: 13, spamSafety: 13, technical: 12, opportunity: 6 },
    'Bulls', 'Bench rotation', 2, 85),
  mkArticle('a-1003', 'Connor Bedard sustainability — what the underlying numbers say', writers[2],
    78, { searchEssentials: 20, googleNews: 15, trust: 12, spamSafety: 13, technical: 12, opportunity: 6 },
    'Blackhawks', 'Connor Bedard', 3, 80),
  mkArticle('a-1004', 'Cubs offseason grade: every move ranked', writers[3],
    72, { searchEssentials: 19, googleNews: 13, trust: 11, spamSafety: 13, technical: 11, opportunity: 5 },
    'Cubs', 'Cubs offseason', 4, 75),
  mkArticle('a-1005', 'White Sox rebuild status check', writers[4],
    63, { searchEssentials: 16, googleNews: 11, trust: 9, spamSafety: 12, technical: 10, opportunity: 5 },
    'White Sox', 'White Sox rebuild', 6, 64),
  mkArticle('a-1006', 'Bears mock draft: 3-round simulation', writers[0],
    79, { searchEssentials: 21, googleNews: 16, trust: 12, spamSafety: 13, technical: 12, opportunity: 5 },
    'Bears', 'NFL Draft', 2, 88),
  mkArticle('a-1007', '5 trade targets for the Bulls before the deadline', writers[5],
    51, { searchEssentials: 13, googleNews: 9, trust: 7, spamSafety: 9, technical: 9, opportunity: 4 },
    'Bulls', 'Trade deadline', 8, 47),
  mkArticle('a-1008', 'Blackhawks goaltending depth chart', writers[2],
    74, { searchEssentials: 19, googleNews: 14, trust: 12, spamSafety: 13, technical: 11, opportunity: 5 },
    'Blackhawks', 'Goaltending', 3, 78),
]

const rules: RuleEvaluation[] = [
  mkRule('r-1', 'a-1007', 'sp.thin_content',        'spam_policy',           'official-policy',          'fail',  0.92, 'body',           'Body is 142 words — risk of thin-content classification.', 'Expand to ≥250 words of substantive coverage.'),
  mkRule('r-2', 'a-1007', 'gn.byline.present',      'google_news',           'official-policy',          'pass',  1.00, 'byline',         'Byline is present.', null),
  mkRule('r-3', 'a-1005', 'gn.author.transparency', 'google_news',           'official-policy',          'warn',  0.85, 'author_profile', 'Author page is missing contact info.', 'Add email or social handle to the author page.'),
  mkRule('r-4', 'a-1004', 'se.meta.description',    'search_essentials',     'official-policy',          'warn',  0.85, 'meta_description', 'Meta description is 64 chars — likely under-described.', 'Expand to 120–160 characters.'),
  mkRule('r-5', 'a-1003', 'tr.body.firsthand',      'trust_eeat',            'internal-heuristic',       'warn',  0.55, 'body',           'No first-hand reporting markers detected.', 'Surface attendance, interviews, or direct sourcing.'),
  mkRule('r-6', 'a-1001', 'op.evergreen_signal',    'sportsmockery_opportunity', 'sportsmockery-opportunity', 'pass', 1.00, 'topic_entities', 'Article carries evergreen signals.', null),
  mkRule('r-7', 'a-1006', 'ti.canonical',           'technical_indexability', 'official-policy',          'pass',  1.00, 'canonical',      'Canonical URL is set.', null),
  mkRule('r-8', 'a-1007', 'sp.misleading_headline', 'spam_policy',           'official-policy',          'pass',  1.00, 'title',          'Headline does not match clickbait patterns.', null),
]

const recommendations: Recommendation[] = [
  mkRec('rec-1', 'article', 'a-1007', 'Expand thin content', 'Expand to ≥250 words of substantive coverage.', 'critical', 'editor', 'open',  'official-policy', 18.4),
  mkRec('rec-2', 'article', 'a-1005', 'Build out author page', 'Add email or social handle to the author page.', 'medium', 'editor', 'open', 'official-policy', 41.0),
  mkRec('rec-3', 'article', 'a-1004', 'Set a meta description', 'Expand to 120–160 characters.', 'medium', 'seo', 'in_progress', 'official-policy', 8.2),
  mkRec('rec-4', 'author',  'w-005', 'Strengthen author transparency surface', 'Author page is missing credentials and contact info across articles.', 'high', 'editor', 'open', 'official-policy', 96.0),
  mkRec('rec-5', 'sitewide','site', 'Systemic failure: gn.dates.visible', '34% of analyzed articles fail "gn.dates.visible". Surface updatedAt when the article changes.', 'high', 'engineering', 'open', 'official-policy', 240.0),
  mkRec('rec-6', 'article', 'a-1003', 'Add first-hand reporting markers', 'Surface attendance, interviews, or direct sourcing.', 'low', 'writer', 'open', 'internal-heuristic', 12.5),
  // ── Transparency-asset recommendations ────────────────────────────────
  mkTransparencyRec('rec-tp-1', 'asset:about',                  'Add contact info to /about',           'Add a branded contact email to /about (editorial@sportsmockery.com).', 'medium', 'admin',  'open',     'official-policy',    'Contact info on /about lacks branded email.', 'Add editorial@sportsmockery.com to /about.', 35.0),
  mkTransparencyRec('rec-tp-2', 'asset:about',                  'Add editorial context to /about',      'Describe editorial mission and standards on /about.', 'low',    'admin',  'open',     'internal-heuristic', 'About page lacks editorial-standards copy.', 'Describe editorial mission and standards on /about.', 35.0),
  mkTransparencyRec('rec-tp-3', 'asset:author:erik-lambert',    'Add contact / social for Erik Lambert','Add an email or social handle to the author page.', 'medium', 'editor', 'open',     'official-policy',    'Author page lacks contact / social handle.', 'Add an email or social handle to the author page.', 50.0),
  mkTransparencyRec('rec-tp-4', 'asset:author:aldo-soto',       'Add bio for Aldo Soto',                'Add a bio describing the writer\'s coverage history.', 'critical', 'editor','open',     'official-policy',    'Author page has no bio.', 'Add a bio describing the writer\'s coverage history.', 120.0),
  mkTransparencyRec('rec-tp-5', 'asset:author:aldo-soto',       'Add credentials for Aldo Soto',        'Document Chicago beat, prior outlets, or expertise.', 'high',     'editor','open',     'internal-heuristic', 'Author page lacks credentials.', 'Document Chicago beat, prior outlets, or expertise.', 120.0),
  mkTransparencyRec('rec-tp-6', 'asset:author:aldo-soto',       'Add contact / social for Aldo Soto',   'Add an email or social handle to the author page.', 'high',     'editor','open',     'official-policy',    'Author page lacks contact / social handles.', 'Add an email or social handle to the author page.', 120.0),
  mkTransparencyRec('rec-tp-7', 'asset:publisher',              'Use branded contact email',            'Use a branded domain email instead of a generic provider.', 'low', 'admin',  'open',     'internal-heuristic', 'Contact channel uses a generic gmail address.', 'Use a branded domain email.', 35.0),
]

// ── Transparency assets (mocked from real production surfaces) ────────────
const transparencyAssets: TransparencyAsset[] = [
  {
    id: 'asset:about', assetType: 'about_page',
    url: 'https://test.sportsmockery.com/about', label: 'About SM Edge',
    ownerScope: 'site', ownerId: null,
    contentHash: 'aboutsha256-mock', lastCrawledAt: ISO(35), lastEvaluatedAt: ISO(35),
    status: 'amber', total: 72, findingsCount: 2, recommendationCount: 2,
    rulesetVersion: '2026.04.28-1',
  },
  {
    id: 'asset:author:erik-lambert', assetType: 'author_page',
    url: 'https://test.sportsmockery.com/authors/erik-lambert', label: 'Erik Lambert',
    ownerScope: 'author', ownerId: 'w-erik-lambert',
    contentHash: 'eriksha256-mock', lastCrawledAt: ISO(50), lastEvaluatedAt: ISO(50),
    status: 'green', total: 86, findingsCount: 1, recommendationCount: 1,
    rulesetVersion: '2026.04.28-1',
  },
  {
    id: 'asset:author:aldo-soto', assetType: 'author_page',
    url: 'https://test.sportsmockery.com/authors/aldo-soto', label: 'Aldo Soto',
    ownerScope: 'author', ownerId: 'w-aldo-soto',
    contentHash: 'aldosha256-mock', lastCrawledAt: ISO(120), lastEvaluatedAt: ISO(120),
    status: 'red', total: 48, findingsCount: 4, recommendationCount: 4,
    rulesetVersion: '2026.04.28-1',
  },
  {
    id: 'asset:publisher', assetType: 'publisher_identity',
    url: 'https://test.sportsmockery.com/about#publisher', label: 'Publisher / Contact',
    ownerScope: 'site', ownerId: null,
    contentHash: 'pubsha256-mock', lastCrawledAt: ISO(35), lastEvaluatedAt: ISO(35),
    status: 'amber', total: 65, findingsCount: 2, recommendationCount: 2,
    rulesetVersion: '2026.04.28-1',
  },
]

const transparencyEvaluations: TransparencyAssetEvaluation[] = [
  mkAssetEval('te-1', 'asset:about',                  'tp.about.exists',                      'official-policy',    'pass', 1.00, 'about_page',         '/about returns 200.'),
  mkAssetEval('te-2', 'asset:about',                  'tp.about.publisher_identity',          'official-policy',    'pass', 1.00, 'publisher_identity', 'About page identifies SM Edge as publisher.'),
  mkAssetEval('te-3', 'asset:about',                  'tp.about.contact_info',                'official-policy',    'warn', 0.85, 'contact_info',       'Contact info is on /about but lacks branded email.', 'Add editorial@sportsmockery.com to /about.'),
  mkAssetEval('te-4', 'asset:about',                  'tp.about.editorial_context',           'internal-heuristic', 'warn', 0.80, 'editorial_context',  'About page lacks editorial-standards copy.',          'Describe editorial mission and standards on /about.'),
  mkAssetEval('te-5', 'asset:author:erik-lambert',    'tp.author.exists',                     'official-policy',    'pass', 1.00, 'author_page',        'Erik Lambert author page returns 200.'),
  mkAssetEval('te-6', 'asset:author:erik-lambert',    'tp.author.bio_present',                'official-policy',    'pass', 1.00, 'author_bio',         'Bio present on author page.'),
  mkAssetEval('te-7', 'asset:author:erik-lambert',    'tp.author.contact_or_social',          'official-policy',    'warn', 0.85, 'author_contact',     'Author page lacks contact / social handle.',         'Add an email or social handle to the author page.'),
  mkAssetEval('te-8', 'asset:author:aldo-soto',       'tp.author.exists',                     'official-policy',    'pass', 1.00, 'author_page',        'Aldo Soto author page returns 200.'),
  mkAssetEval('te-9', 'asset:author:aldo-soto',       'tp.author.bio_present',                'official-policy',    'fail', 0.95, 'author_bio',         'Author page has no bio.',                              'Add a bio describing the writer\'s coverage history.'),
  mkAssetEval('te-10','asset:author:aldo-soto',       'tp.author.credentials_present',        'internal-heuristic', 'fail', 0.80, 'author_credentials', 'Author page lacks credentials.',                       'Document Chicago beat, prior outlets, or expertise.'),
  mkAssetEval('te-11','asset:author:aldo-soto',       'tp.author.contact_or_social',          'official-policy',    'fail', 0.90, 'author_contact',     'Author page lacks contact / social handles.',          'Add an email or social handle to the author page.'),
  mkAssetEval('te-12','asset:author:aldo-soto',       'tp.author.article_attribution_consistency', 'internal-heuristic', 'warn', 0.70, 'byline_consistency', 'Byline differs across articles ("Aldo S." vs "Aldo Soto").', 'Reconcile byline display.'),
  mkAssetEval('te-13','asset:publisher',              'tp.publisher.identity_clear',          'official-policy',    'pass', 1.00, 'publisher_identity', 'Publisher entity is named in footer and on /about.'),
  mkAssetEval('te-14','asset:publisher',              'tp.publisher.non_generic_contact',     'internal-heuristic', 'warn', 0.75, 'contact_info',       'Contact channel uses a generic gmail address.',        'Use a branded domain email.'),
  mkAssetEval('te-15','asset:publisher',              'tp.contact.exists',                    'official-policy',    'warn', 0.85, 'contact_page',       'No standalone /contact page; contact info lives on /about only.', 'Publish a /contact page or accept /about as canonical.'),
]

const operations: OperationsSnapshot = {
  lastArticleImportedAt: ISO(7),
  lastArticleScoredAt:   ISO(2),
  scoredLast24h:         184,
  rescansLast24h:        22,
  pendingQueueDepth:     6,
  failedJobsCount:       1,
  lastSuccessfulJobAt:   ISO(2),
  activeRulesetVersion:  '2026.04.28-1',
  awaitingRescoreContent: 4,
  awaitingRescoreAuthor:  2,
  suppressionsCount:      3,
  lastTransparencyScanAt:        ISO(35),
  pendingTransparencyRescans:    1,
  transparencyFailuresLast24h:   0,
  transparencyAssetsUnderReview: transparencyAssets.filter((a) => a.findingsCount > 0).length,
  recentAudit: [
    { id: 'al-1', actor: 'system',      action: 'score.recompute',          target: 'a-1001',                 metadata: { delta: +3, total: 91 }, occurredAt: ISO(2) },
    { id: 'al-2', actor: 'system',      action: 'job.enqueued',             target: 'a-1009',                 metadata: { trigger: 'article.imported' }, occurredAt: ISO(7) },
    { id: 'al-6', actor: 'system',      action: 'transparency.recompute',   target: 'asset:about',            metadata: { kind: 'transparency_asset', total: 72, prevTotal: 65, delta: 7, trigger: 'transparency.about_updated' }, occurredAt: ISO(35) },
    { id: 'al-7', actor: 'admin:cb22',  action: 'job.enqueued',             target: 'asset:author:aldo-soto', metadata: { trigger: 'transparency.author_page_updated' }, occurredAt: ISO(120) },
    { id: 'al-3', actor: 'editor:cb22', action: 'recommendation.resolve',   target: 'rec-9',                  metadata: {}, occurredAt: ISO(45) },
    { id: 'al-4', actor: 'system',      action: 'ruleset.activated',        target: '2026.04.28-1',           metadata: {}, occurredAt: ISO(720) },
    { id: 'al-5', actor: 'system',      action: 'rescan.nightly',           target: 'site',                   metadata: { processed: 184 }, occurredAt: ISO(540) },
  ],
}

export function buildMockPayload(): GoogleTabPayload {
  const subTotals = articles.reduce<SubScores>((acc, a) => ({
    searchEssentials: acc.searchEssentials + a.sub.searchEssentials,
    googleNews:       acc.googleNews       + a.sub.googleNews,
    trust:            acc.trust            + a.sub.trust,
    spamSafety:       acc.spamSafety       + a.sub.spamSafety,
    technical:        acc.technical        + a.sub.technical,
    opportunity:      acc.opportunity      + a.sub.opportunity,
  }), { searchEssentials: 0, googleNews: 0, trust: 0, spamSafety: 0, technical: 0, opportunity: 0 })
  const n = articles.length
  const sub: SubScores = {
    searchEssentials: round1(subTotals.searchEssentials / n),
    googleNews:       round1(subTotals.googleNews / n),
    trust:            round1(subTotals.trust / n),
    spamSafety:       round1(subTotals.spamSafety / n),
    technical:        round1(subTotals.technical / n),
    opportunity:      round1(subTotals.opportunity / n),
  }
  const googleScore = Math.round(articles.reduce((s, a) => s + a.total, 0) / n)
  const avgWriterScore = Math.round(writers.reduce((s, w) => s + w.total, 0) / writers.length)
  const highRisk = articles.filter((a) => a.total < 60).length
  const newsReady = articles.filter((a) => a.sub.googleNews >= 15).length
  const newsReadyPct = Math.round((newsReady / n) * 100)

  return {
    generatedAt: NOW().toISOString(),
    rulesetVersion: '2026.04.28-1',
    weights: { searchEssentials: 25, googleNews: 20, trust: 15, spamSafety: 15, technical: 15, opportunity: 10 },
    overview: {
      googleScore,
      sub,
      avgWriterScore,
      highRiskArticleCount: highRisk,
      newsReadyArticlePct:  newsReadyPct,
      deltaVsPriorPeriod:   +2.1,
      lastScoringRunAt:     operations.lastArticleScoredAt ?? NOW().toISOString(),
    },
    scoreDistribution: [
      { bucket: '0–39',   count: 1 },
      { bucket: '40–59',  count: 1 },
      { bucket: '60–69',  count: 1 },
      { bucket: '70–79',  count: 3 },
      { bucket: '80–89',  count: 1 },
      { bucket: '90–100', count: 1 },
    ],
    writers,
    articles,
    rules,
    recommendations,
    transparencyAssets,
    transparencyEvaluations,
    siteTrust: {
      siteTransparencyScore: round1(((transparencyAssets.filter((a) => a.ownerScope === 'site').reduce((s, a) => s + a.total, 0) / Math.max(1, transparencyAssets.filter((a) => a.ownerScope === 'site').length)) / 100) * 15),
      aboutScore: transparencyAssets.find((a) => a.assetType === 'about_page')?.total ?? 0,
      avgAuthorPageScore: Math.round(
        transparencyAssets.filter((a) => a.assetType === 'author_page').reduce((s, a) => s + a.total, 0) /
        Math.max(1, transparencyAssets.filter((a) => a.assetType === 'author_page').length),
      ),
      assetsScored: transparencyAssets.length,
    },
    operations,
  }
}

// ── helpers ─────────────────────────────────────────────────────────────────
function mkWriter(id: string, name: string, articlesAnalyzed: number, total: number, trend: number, recCount: number): WriterLeaderboardRow {
  const sub: SubScores = scaleSubFromTotal(total)
  return {
    authorId: id, name, avatar: null,
    articlesAnalyzed, total, sub,
    recommendationCount: recCount,
    trend,
    lastRescoredAt: ISO(Math.floor(Math.random() * 240)),
    status: total >= 80 ? 'green' : total >= 60 ? 'amber' : 'red',
  }
}

function scaleSubFromTotal(total: number): SubScores {
  const factor = total / 100
  return {
    searchEssentials: round1(25 * factor),
    googleNews:       round1(20 * factor),
    trust:            round1(15 * factor),
    spamSafety:       round1(15 * factor),
    technical:        round1(15 * factor),
    opportunity:      round1(10 * factor),
  }
}

function mkArticle(
  id: string, title: string, w: WriterLeaderboardRow, total: number, sub: SubScores,
  category: string, topic: string, recs: number, headline: number,
): ArticleAnalysisRow {
  return {
    articleId: id, title, author: w.name, authorId: w.authorId,
    publishedAt: ISO(Math.floor(Math.random() * 60 * 24 * 7)),
    updatedAt:   ISO(Math.floor(Math.random() * 60 * 24)),
    lastRescoredAt: ISO(Math.floor(Math.random() * 240)),
    category, topic, total, sub, headlineScore: headline,
    recommendationCount: recs,
    rulesetVersion: '2026.04.28-1',
    status: total >= 80 ? 'green' : total >= 60 ? 'amber' : 'red',
  }
}

function mkRule(
  id: string, articleId: string, ruleId: string,
  family: RuleEvaluation['ruleFamily'], sourceType: RuleEvaluation['sourceType'],
  status: RuleEvaluation['status'], confidence: number,
  impactedField: string, explanation: string, remediation: string | null,
): RuleEvaluation {
  return {
    id, articleId, ruleId,
    ruleFamily: family, sourceType,
    status, confidence, impactedField, explanation, remediation,
    rulesetVersion: '2026.04.28-1',
    evaluatedAt: ISO(Math.floor(Math.random() * 240)),
  }
}

function mkRec(
  id: string, scope: Recommendation['scope'], scopeId: string,
  title: string, detail: string,
  severity: Recommendation['severity'], owner: Recommendation['owner'],
  status: Recommendation['status'], sourceType: Recommendation['sourceType'],
  agingHours: number,
): Recommendation {
  return {
    id, scope, scopeId, title, detail, severity, owner,
    impactScore: severity === 'critical' ? 28 : severity === 'high' ? 22 : severity === 'medium' ? 14 : 6,
    confidence: 0.9, status, sourceType,
    ruleIds: [], rulesetVersion: '2026.04.28-1',
    createdAt: ISO(agingHours * 60), updatedAt: ISO(0), resolvedAt: null,
    agingHours,
  }
}

function mkAssetEval(
  id: string, assetId: string, ruleId: string,
  sourceType: TransparencyAssetEvaluation['sourceType'],
  status: TransparencyAssetEvaluation['status'], confidence: number,
  impactedField: string, explanation: string, remediation: string | null = null,
): TransparencyAssetEvaluation {
  return {
    id, assetId, ruleId,
    ruleFamily: 'transparency_assets',
    sourceType, status, confidence,
    impactedField, explanation, remediation,
    rulesetVersion: '2026.04.28-1',
    evaluatedAt: ISO(Math.floor(Math.random() * 240)),
  }
}

function mkTransparencyRec(
  id: string, scopeId: string,
  title: string, detail: string,
  severity: Recommendation['severity'], owner: Recommendation['owner'],
  status: Recommendation['status'], sourceType: Recommendation['sourceType'],
  evidence: string, suggestedFix: string,
  agingHours: number,
): Recommendation {
  return {
    id, scope: 'transparency_asset', scopeId,
    title, detail, severity, owner,
    impactScore: severity === 'critical' ? 32 : severity === 'high' ? 24 : severity === 'medium' ? 14 : 6,
    confidence: 0.9, status, sourceType,
    ruleIds: [], rulesetVersion: '2026.04.28-1',
    evidence, suggestedFix,
    createdAt: ISO(agingHours * 60), updatedAt: ISO(0), resolvedAt: null,
    agingHours,
  }
}

function round1(n: number): number { return Math.round(n * 10) / 10 }
