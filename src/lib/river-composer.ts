/**
 * River Composer — Adaptive Feed Composition Engine
 *
 * Transforms raw article data into a diverse, scored, and properly spaced
 * River feed. Extracts block-level cards from articles and composes them
 * into an editorially-guided adaptive feed.
 *
 * Pipeline: articles → candidate extraction → scoring → composition → River
 */

import type { ContentBlock } from '@/components/admin/BlockEditor/types'
import { extractFeedCards, type FeedItem, type ArticleMeta } from '@/lib/article-feed-extractor'
import { getTeamFromCategory } from '@/lib/transform-post'
import type { HomepageRiverItem } from '@/lib/homepage-river-data'

// ─── Configuration ───

export const RIVER_CONFIG = {
  /** Scoring weights (tunable) */
  weights: {
    freshness: 0.35,
    articlePriority: 0.25,
    cardType: 0.15,
    engagement: 0.15,
    editorial: 0.10,
  },

  /** Card type base scores (1.0 = neutral) */
  cardTypeScores: {
    article: 1.0,
    analytics: 1.15,
    rumor: 1.10,
    debate: 1.05,
    poll: 1.0,
    video: 1.05,
  } as Record<string, number>,

  /** Freshness decay curve */
  freshness: {
    peakHours: 6,       // Full freshness boost for first 6 hours
    halfLifeHours: 24,  // Score halves every 24 hours after peak
    minScore: 0.15,     // Floor — even old content gets some score
  },

  /** Composition spacing rules */
  spacing: {
    maxSameArticleInWindow: 2,   // Max cards from same article in 5-card window
    windowSize: 5,
    maxSameTypeInRow: 2,         // No more than 2 of same type consecutively
    minArticleCardEvery: 3,      // At least 1 article card every N positions
    minGapSameArticle: 2,        // Minimum positions between same-article cards
    maxSameTeamInTopN: 4,        // Max cards from same team in top 10
    topNForTeamBalance: 10,
  },

  /** Max feed cards extracted per article */
  maxCardsPerArticle: 4,

  /** River output length */
  maxRiverLength: 30,
}

// ─── Types ───

export interface RiverCandidate {
  id: string
  type: 'article' | 'analytics' | 'rumor' | 'debate' | 'poll' | 'video'
  articleId: string | number
  slug: string
  categorySlug: string
  team: string
  teamColor: string
  teamSlug: string
  publishedAt: string
  sourceBlockIndex: number | null  // null for article card, index for block cards
  accent: string
  label: string
  payload: Record<string, unknown>

  // Scoring inputs
  importanceScore: number
  views: number
  commentsCount: number
  forceHeroFeatured: boolean

  // Computed scores (filled during scoring)
  freshnessScore: number
  articlePriorityScore: number
  cardTypeScore: number
  engagementScore: number
  editorialBoost: number
  rawScore: number
  finalScore: number
}

export interface RiverOutput {
  hero: HomepageRiverItem | null
  items: HomepageRiverItem[]
  teamItems: Record<string, HomepageRiverItem[]>
  debug?: RiverDebugInfo[]
}

export interface RiverDebugInfo {
  id: string
  position: number
  rawScore: number
  finalScore: number
  freshnessScore: number
  articlePriorityScore: number
  cardTypeScore: number
  type: string
  articleId: string | number
  team: string
  insertReason: string
}

// ─── Step 1: Extract Candidates ───

function parseBlockContent(content: string): ContentBlock[] | null {
  try {
    let str = String(content)
    if (str.includes('<!-- SM_BLOCKS -->')) {
      str = str.replace('<!-- SM_BLOCKS -->', '').replace('<!-- /SM_BLOCKS -->', '').trim()
    }
    if (!str.startsWith('{')) return null
    const doc = JSON.parse(str)
    return doc.blocks || null
  } catch {
    return null
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim()
}

function getExcerpt(post: any, blocks: ContentBlock[] | null): string {
  if (post.excerpt) return post.excerpt
  if (blocks) {
    const firstP = blocks.find(b => b.type === 'paragraph' && (b as any).data?.html)
    if (firstP) {
      const plain = stripHtml((firstP as any).data.html)
      return plain.length > 200 ? plain.slice(0, 200) + '...' : plain
    }
  }
  const plain = String(post.content || '').replace(/<[^>]+>/g, '').replace(/<!--[^>]*-->/g, '').trim()
  return plain.length > 200 ? plain.slice(0, 200) + '...' : plain
}

function getKeyTakeaway(blocks: ContentBlock[]): string {
  const takeawayIdx = blocks.findIndex(b =>
    b.type === 'heading' && (b as any).data?.text === 'Key Takeaways'
  )
  if (takeawayIdx >= 0) {
    const listBlock = blocks[takeawayIdx + 1]
    if (listBlock?.type === 'paragraph' && (listBlock as any).data?.html?.includes('<li>')) {
      const match = (listBlock as any).data.html.match(/<li>([\s\S]*?)<\/li>/)
      if (match) return stripHtml(match[1])
    }
  }
  return ''
}

function getAllTakeaways(blocks: ContentBlock[]): string[] {
  const takeawayIdx = blocks.findIndex(b =>
    b.type === 'heading' && (b as any).data?.text === 'Key Takeaways'
  )
  if (takeawayIdx < 0) return []
  const listBlock = blocks[takeawayIdx + 1]
  if (!listBlock || listBlock.type !== 'paragraph') return []
  const html = (listBlock as any).data?.html || ''
  const items: string[] = []
  const regex = /<li>([\s\S]*?)<\/li>/g
  let m
  while ((m = regex.exec(html)) !== null) {
    items.push(stripHtml(m[1]))
  }
  return items
}

export function extractCandidates(posts: any[]): RiverCandidate[] {
  const candidates: RiverCandidate[] = []

  for (const post of posts) {
    const teamInfo = getTeamFromCategory(post.category_id)
    const authorName = Array.isArray(post.author)
      ? post.author[0]?.display_name
      : post.author?.display_name
    const categorySlug = (Array.isArray(post.category)
      ? post.category[0]?.slug
      : post.category?.slug) || ''
    const blocks = parseBlockContent(post.content)
    const excerpt = getExcerpt(post, blocks)
    const keyTakeaway = blocks ? getKeyTakeaway(blocks) : ''
    const allTakeaways = blocks ? getAllTakeaways(blocks) : []

    const baseMeta = {
      articleId: post.id,
      slug: post.slug,
      categorySlug,
      team: teamInfo?.name || 'Chicago Sports',
      teamColor: teamInfo?.color || '#0B0F14',
      teamSlug: teamInfo?.id || '',
      publishedAt: post.published_at || '',
      importanceScore: post.importance_score || 50,
      views: post.views || 0,
      commentsCount: post.comments_count || 0,
      forceHeroFeatured: post.force_hero_featured || false,
      // Scores filled later
      freshnessScore: 0,
      articlePriorityScore: 0,
      cardTypeScore: 0,
      engagementScore: 0,
      editorialBoost: 0,
      rawScore: 0,
      finalScore: 0,
    }

    // 1. Always produce article card
    candidates.push({
      ...baseMeta,
      id: `river-article-${post.id}`,
      type: 'article',
      sourceBlockIndex: null,
      accent: '#BC0000',
      label: 'SM Edge',
      payload: {
        headline: post.title,
        summary: excerpt,
        insight: keyTakeaway,
        author_name: authorName || 'Sports Mockery',
        author: { name: authorName || 'Sports Mockery', handle: 'SportsMockery', avatar: 'SM', verified: true },
        breakingIndicator: post.importance_score >= 80 ? 'BREAKING' : 'REPORT',
        featuredImage: post.featured_image || '',
        stats: { comments: post.comments_count || 0, retweets: 0, likes: 0, views: post.views ? formatViewCount(post.views) : '0' },
      },
    })

    // 2. Extract block-derived cards (if article has rich blocks)
    if (blocks && blocks.length > 0) {
      const meta: ArticleMeta = {
        title: post.title,
        slug: post.slug,
        author: authorName || 'Sports Mockery',
        image: post.featured_image,
        team: teamInfo?.name,
        publishedAt: post.published_at,
      }

      const feedItems = extractFeedCards(blocks, meta, RIVER_CONFIG.maxCardsPerArticle)

      // Skip the first item (article card — we already created one)
      for (let i = 1; i < feedItems.length; i++) {
        const fi = feedItems[i]
        candidates.push({
          ...baseMeta,
          id: fi.id,
          type: fi.kind as RiverCandidate['type'],
          sourceBlockIndex: i,
          accent: fi.accent,
          label: fi.label,
          payload: fi.block ? { ...(fi.block as any).data, blockType: fi.block.type } : {},
        })
      }
    }

    // 3. If article has key takeaways but no rich blocks, generate a scout_summary-style card
    if (allTakeaways.length >= 2 && (!blocks || !blocks.some(b =>
      ['scout-insight', 'stats-chart', 'player-comparison', 'debate', 'trade-scenario', 'interaction', 'poll', 'mock-draft'].includes(b.type)
    ))) {
      candidates.push({
        ...baseMeta,
        id: `river-summary-${post.id}`,
        type: 'analytics',
        sourceBlockIndex: -1,
        accent: '#00D4FF',
        label: 'Key Analysis',
        payload: {
          topic: post.title,
          summary: excerpt,
          bullets: allTakeaways,
        },
      })
    }
  }

  return candidates
}

// ─── Step 2: Score Candidates ───

function computeFreshnessScore(publishedAt: string): number {
  if (!publishedAt) return RIVER_CONFIG.freshness.minScore
  const ageMs = Date.now() - new Date(publishedAt).getTime()
  const ageHours = ageMs / 3600000

  if (ageHours <= RIVER_CONFIG.freshness.peakHours) return 1.0

  const decayHours = ageHours - RIVER_CONFIG.freshness.peakHours
  const halfLife = RIVER_CONFIG.freshness.halfLifeHours
  const decayed = Math.pow(0.5, decayHours / halfLife)

  return Math.max(RIVER_CONFIG.freshness.minScore, decayed)
}

function computeArticlePriorityScore(candidate: RiverCandidate): number {
  let score = 0
  // Normalize importance_score (0-100) to 0-1
  score += (candidate.importanceScore / 100) * 0.7
  // Hero-featured boost
  if (candidate.forceHeroFeatured) score += 0.3
  return Math.min(1.0, score)
}

function computeCardTypeScore(type: string): number {
  return RIVER_CONFIG.cardTypeScores[type] || 1.0
}

function computeEngagementScore(views: number): number {
  // Log scale — 0 views = 0, 1000 views = ~0.5, 10000 = ~0.67, 100000 = ~0.83
  if (views <= 0) return 0
  return Math.min(1.0, Math.log10(views) / 6) // 1M views = 1.0
}

export function scoreCandidates(candidates: RiverCandidate[]): RiverCandidate[] {
  const w = RIVER_CONFIG.weights

  return candidates.map(c => {
    const freshnessScore = computeFreshnessScore(c.publishedAt)
    const articlePriorityScore = computeArticlePriorityScore(c)
    const cardTypeScore = computeCardTypeScore(c.type)
    const engagementScore = computeEngagementScore(c.views)
    const editorialBoost = c.forceHeroFeatured ? 0.2 : 0

    const rawScore =
      freshnessScore * w.freshness +
      articlePriorityScore * w.articlePriority +
      cardTypeScore * w.cardType +
      engagementScore * w.engagement +
      editorialBoost * w.editorial

    // Block-derived cards get a slight penalty to ensure article cards surface first
    const blockPenalty = c.sourceBlockIndex !== null && c.sourceBlockIndex > 0 ? 0.05 : 0

    const finalScore = Math.max(0, rawScore - blockPenalty)

    return {
      ...c,
      freshnessScore,
      articlePriorityScore,
      cardTypeScore,
      engagementScore,
      editorialBoost,
      rawScore,
      finalScore,
    }
  })
}

// ─── Step 3: Compose River ───

interface CompositionState {
  river: RiverCandidate[]
  lastTypes: string[]           // Track last N types for consecutive check
  articlePositions: Map<string | number, number[]>  // articleId → positions
  teamCounts: Map<string, number>  // team → count in top N
}

function canInsert(candidate: RiverCandidate, state: CompositionState, position: number): { ok: boolean; reason: string } {
  const rules = RIVER_CONFIG.spacing

  // Rule 1: Max same-article cards in sliding window
  const articlePositions = state.articlePositions.get(candidate.articleId) || []
  const windowStart = Math.max(0, position - rules.windowSize)
  const inWindow = articlePositions.filter(p => p >= windowStart).length
  if (inWindow >= rules.maxSameArticleInWindow) {
    return { ok: false, reason: `article ${candidate.articleId} already has ${inWindow} cards in window` }
  }

  // Rule 2: No more than N of same type in a row
  if (state.lastTypes.length >= rules.maxSameTypeInRow) {
    const recentTypes = state.lastTypes.slice(-rules.maxSameTypeInRow)
    if (recentTypes.every(t => t === candidate.type)) {
      return { ok: false, reason: `${rules.maxSameTypeInRow} ${candidate.type} cards in a row` }
    }
  }

  // Rule 3: Minimum gap between same-article cards
  if (articlePositions.length > 0) {
    const lastPos = articlePositions[articlePositions.length - 1]
    if (position - lastPos < rules.minGapSameArticle) {
      return { ok: false, reason: `same-article gap too small (${position - lastPos} < ${rules.minGapSameArticle})` }
    }
  }

  // Rule 4: Team balance in top N
  if (position < rules.topNForTeamBalance && candidate.teamSlug) {
    const teamCount = state.teamCounts.get(candidate.teamSlug) || 0
    if (teamCount >= rules.maxSameTeamInTopN) {
      // Only block if there are other teams available (soft rule)
      return { ok: false, reason: `team ${candidate.teamSlug} already has ${teamCount} in top ${rules.topNForTeamBalance}` }
    }
  }

  return { ok: true, reason: 'passed' }
}

function needsArticleCard(state: CompositionState, position: number): boolean {
  const rules = RIVER_CONFIG.spacing
  // Check if we haven't had an article card in the last N positions
  const lastArticlePos = state.river.reduce((max, c, idx) =>
    c.type === 'article' ? idx : max, -rules.minArticleCardEvery)
  return (position - lastArticlePos) >= rules.minArticleCardEvery
}

export function composeRiver(scoredCandidates: RiverCandidate[]): RiverCandidate[] {
  // Sort by score descending
  const sorted = [...scoredCandidates].sort((a, b) => b.finalScore - a.finalScore)

  const state: CompositionState = {
    river: [],
    lastTypes: [],
    articlePositions: new Map(),
    teamCounts: new Map(),
  }

  const maxLen = RIVER_CONFIG.maxRiverLength
  const used = new Set<string>()
  let retryBudget = sorted.length * 2 // Prevent infinite loops

  // Greedy insertion with constraint checking
  let candidateIdx = 0
  const deferred: RiverCandidate[] = []

  while (state.river.length < maxLen && retryBudget > 0) {
    retryBudget--

    // If we need an article card, prioritize one
    let candidate: RiverCandidate | null = null
    const position = state.river.length

    if (needsArticleCard(state, position)) {
      // Find highest-scoring unused article card
      candidate = sorted.find(c => c.type === 'article' && !used.has(c.id) && canInsert(c, state, position).ok) || null
    }

    // Try deferred cards first (they were skipped earlier due to spacing)
    if (!candidate && deferred.length > 0) {
      for (let i = 0; i < deferred.length; i++) {
        const check = canInsert(deferred[i], state, position)
        if (check.ok) {
          candidate = deferred.splice(i, 1)[0]
          break
        }
      }
    }

    // Normal: take next highest-scoring unused candidate
    if (!candidate) {
      while (candidateIdx < sorted.length) {
        const c = sorted[candidateIdx]
        candidateIdx++
        if (used.has(c.id)) continue

        const check = canInsert(c, state, position)
        if (check.ok) {
          candidate = c
          break
        } else {
          // Defer for later insertion
          deferred.push(c)
        }
      }
    }

    // If still no candidate, try relaxing rules on deferred
    if (!candidate && deferred.length > 0) {
      candidate = deferred.shift() || null
    }

    // If nothing left, we're done
    if (!candidate) break

    // Insert
    used.add(candidate.id)
    state.river.push(candidate)
    state.lastTypes.push(candidate.type)
    if (state.lastTypes.length > 5) state.lastTypes.shift()

    const artPositions = state.articlePositions.get(candidate.articleId) || []
    artPositions.push(position)
    state.articlePositions.set(candidate.articleId, artPositions)

    if (position < RIVER_CONFIG.spacing.topNForTeamBalance && candidate.teamSlug) {
      state.teamCounts.set(candidate.teamSlug, (state.teamCounts.get(candidate.teamSlug) || 0) + 1)
    }
  }

  return state.river
}

// ─── Step 4: Map to HomepageRiverItem ───

function candidateToRiverItem(candidate: RiverCandidate): HomepageRiverItem {
  const timestamp = formatRelativeTime(candidate.publishedAt)

  switch (candidate.type) {
    case 'article':
      return {
        id: candidate.id,
        type: 'editorial',
        team: candidate.team,
        teamColor: candidate.teamColor,
        timestamp,
        data: {
          ...candidate.payload,
          slug: candidate.slug,
          categorySlug: candidate.categorySlug,
          postId: candidate.articleId,
          commentsCount: candidate.commentsCount,
        },
      }

    case 'analytics': {
      // If it has bullets (key takeaways), render as scout_summary
      if (candidate.payload.bullets && Array.isArray(candidate.payload.bullets)) {
        return {
          id: candidate.id,
          type: 'scout_summary',
          team: candidate.team,
          teamColor: candidate.teamColor,
          timestamp,
          data: {
            topic: candidate.payload.topic || candidate.label,
            summary: candidate.payload.summary || '',
            bullets: candidate.payload.bullets,
            slug: candidate.slug,
            categorySlug: candidate.categorySlug,
            commentsCount: candidate.commentsCount,
            stats: { views: candidate.views ? formatViewCount(candidate.views) : '0' },
          },
        }
      }
      // If it has chart data, render as chart
      if (candidate.payload.blockType === 'stats-chart') {
        return {
          id: candidate.id,
          type: 'chart',
          team: candidate.team,
          teamColor: candidate.teamColor,
          timestamp,
          data: {
            headline: candidate.payload.title || candidate.label,
            takeaway: '',
            chartData: candidate.payload.dataPoints || [],
            statSource: 'SM Edge Analytics',
            commentsCount: candidate.commentsCount,
            stats: { comments: candidate.commentsCount, retweets: 0, likes: 0, views: candidate.views ? formatViewCount(candidate.views) : '0' },
            slug: candidate.slug,
            categorySlug: candidate.categorySlug,
          },
        }
      }
      // Scout insight → scout_summary with single bullet
      if (candidate.payload.blockType === 'scout-insight') {
        return {
          id: candidate.id,
          type: 'scout_summary',
          team: candidate.team,
          teamColor: candidate.teamColor,
          timestamp,
          data: {
            topic: 'Scout Insight',
            summary: candidate.payload.insight || '',
            bullets: [candidate.payload.insight as string].filter(Boolean),
            slug: candidate.slug,
            categorySlug: candidate.categorySlug,
            commentsCount: candidate.commentsCount,
            stats: { views: candidate.views ? formatViewCount(candidate.views) : '0' },
          },
        }
      }
      // Fallback: trending_article style
      return {
        id: candidate.id,
        type: 'trending_article',
        team: candidate.team,
        teamColor: candidate.teamColor,
        timestamp,
        data: {
          headline: candidate.payload.topic || candidate.label,
          summary: candidate.payload.summary || '',
          trendMetric: 'Analysis',
          commentsCount: candidate.commentsCount,
          stats: { comments: candidate.commentsCount, retweets: 0, likes: 0, views: candidate.views ? formatViewCount(candidate.views) : '0' },
          slug: candidate.slug,
          categorySlug: candidate.categorySlug,
        },
      }
    }

    case 'rumor':
      return {
        id: candidate.id,
        type: 'hub_update',
        team: candidate.team,
        teamColor: candidate.teamColor,
        timestamp,
        data: {
          updateText: candidate.payload.text || candidate.label,
          takeaway: '',
          status: 'NEW',
          commentsCount: candidate.commentsCount,
          slug: candidate.slug,
          categorySlug: candidate.categorySlug,
        },
      }

    case 'debate':
      return {
        id: candidate.id,
        type: 'debate',
        team: candidate.team,
        teamColor: candidate.teamColor,
        timestamp,
        data: {
          prompt: candidate.payload.proArgument
            ? `${candidate.payload.proArgument}`
            : (candidate.payload.text || candidate.label),
          sideA: (candidate.payload.proArgument as string) || 'For',
          sideB: (candidate.payload.conArgument as string) || 'Against',
          participantCount: 0,
          commentsCount: candidate.commentsCount,
          slug: candidate.slug,
          categorySlug: candidate.categorySlug,
        },
      }

    case 'poll':
      return {
        id: candidate.id,
        type: 'poll',
        team: candidate.team,
        teamColor: candidate.teamColor,
        timestamp,
        data: {
          question: candidate.payload.question || candidate.label,
          context: '',
          options: (candidate.payload.options as string[]) || ['Yes', 'No'],
          totalVotes: 0,
          status: 'LIVE',
          commentsCount: candidate.commentsCount,
          slug: candidate.slug,
          categorySlug: candidate.categorySlug,
        },
      }

    case 'video':
      return {
        id: candidate.id,
        type: 'video',
        team: candidate.team,
        teamColor: candidate.teamColor,
        timestamp,
        data: candidate.payload,
      }

    default:
      return {
        id: candidate.id,
        type: 'editorial',
        team: candidate.team,
        teamColor: candidate.teamColor,
        timestamp,
        data: candidate.payload,
      }
  }
}

// ─── Main Pipeline ───

export function composeAdaptiveRiver(posts: any[], options?: {
  teamFilter?: string
  debug?: boolean
}): RiverOutput {
  const { teamFilter, debug = false } = options || {}

  // Step 1: Extract all candidates
  let candidates = extractCandidates(posts)

  // Step 2: Score all candidates
  candidates = scoreCandidates(candidates)

  // Step 3: Filter by team if needed
  if (teamFilter) {
    candidates = candidates.filter(c => c.teamSlug === teamFilter)
  }

  // Step 4: Compose river with spacing rules
  const composedCandidates = composeRiver(candidates)

  // Step 5: Extract hero (first article card)
  const heroCandidate = composedCandidates.find(c => c.type === 'article')
  const hero = heroCandidate ? candidateToRiverItem(heroCandidate) : null

  // Step 6: Map remaining to HomepageRiverItems (skip hero)
  const items = composedCandidates
    .filter(c => c !== heroCandidate)
    .map(candidateToRiverItem)

  // Step 7: Build team-specific feeds
  const teamItems: Record<string, HomepageRiverItem[]> = {}
  if (!teamFilter) {
    const teamSlugs = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox']
    for (const ts of teamSlugs) {
      const teamCandidates = scoreCandidates(extractCandidates(
        posts.filter(p => {
          const catMap: Record<number, string> = { 1: 'bears', 2: 'blackhawks', 3: 'bulls', 4: 'cubs', 6: 'whitesox' }
          return catMap[p.category_id] === ts
        })
      ))
      const composed = composeRiver(teamCandidates)
      teamItems[ts] = composed.map(candidateToRiverItem)
    }
  }

  // Step 8: Debug info
  const debugInfo = debug ? composedCandidates.map((c, i) => ({
    id: c.id,
    position: i,
    rawScore: Math.round(c.rawScore * 1000) / 1000,
    finalScore: Math.round(c.finalScore * 1000) / 1000,
    freshnessScore: Math.round(c.freshnessScore * 1000) / 1000,
    articlePriorityScore: Math.round(c.articlePriorityScore * 1000) / 1000,
    cardTypeScore: Math.round(c.cardTypeScore * 1000) / 1000,
    type: c.type,
    articleId: c.articleId,
    team: c.team,
    insertReason: c.sourceBlockIndex !== null ? `block-${c.sourceBlockIndex}` : 'article-card',
  })) : undefined

  return { hero, items, teamItems, debug: debugInfo }
}

// ─── Helpers ───

function formatRelativeTime(publishedAt: string | null): string {
  if (!publishedAt) return ''
  const diffMs = Date.now() - new Date(publishedAt).getTime()
  const mins = Math.floor(diffMs / 60000)
  const hrs = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)
  if (mins < 60) return `${Math.max(1, mins)}m`
  if (hrs < 24) return `${hrs}h`
  if (days < 7) return `${days}d`
  return `${Math.floor(days / 7)}w`
}

function formatViewCount(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return String(views)
}
