/**
 * Bears1 Data Layer — Obsidian Intelligence Hub
 *
 * Rumor reliability scoring, radar mapping, and combined data fetcher
 * for the /chicago-bears1 premium hub.
 */

import { getBearsPlayers, getBearsStats, getBearsSeparatedRecord } from './bearsData'
import type { BearsPlayer } from './bearsData'
import { getBearsPostsByType, getBearsPosts } from './bears'
import { brokerHeadlines, type EnrichedHeadline } from './dataBroker'

// =============================================================================
// TYPES
// =============================================================================

export interface RumorPing {
  id: string
  title: string
  excerpt: string | null
  slug: string
  publishedAt: string | null
  reliabilityScore: number
  ring: number
  ringLabel: string
  category: RumorCategory
  angle: number
  auditBadge: string
}

export type RumorCategory =
  | 'TRADE'
  | 'FREE AGENCY'
  | 'DRAFT'
  | 'ROSTER MOVE'
  | 'INJURY'
  | 'INTEL'

export interface Bears1Data {
  players: BearsPlayer[]
  stats: Awaited<ReturnType<typeof getBearsStats>>
  radarData: RumorPing[]
  record: Awaited<ReturnType<typeof getBearsSeparatedRecord>>
  headlines: EnrichedHeadline[]
}

// =============================================================================
// RUMOR RELIABILITY SCORING
// =============================================================================

const TRUSTED_REPORTERS = [
  'schefter', 'rapoport', 'pelissero', 'garafolo', 'mortensen',
  'fowler', 'adam schefter', 'ian rapoport', 'tom pelissero',
  'mike garafolo', 'chris mortensen', 'jeremy fowler',
]

const HEDGE_WORDS = [
  'allegedly', 'unconfirmed', 'whisper', 'rumored', 'speculation',
  'possible', 'potential', 'apparently',
]

export function computeReliabilityScore(post: {
  title: string
  excerpt: string | null
  publishedAt: string | null
}): number {
  const text = `${post.title} ${post.excerpt || ''}`.toLowerCase()
  let score = 50

  // Source attribution: named reporters
  if (TRUSTED_REPORTERS.some(r => text.includes(r))) {
    score += 20
  } else if (text.includes('per source') || text.includes('sources say') || text.includes('according to')) {
    score += 10
  }

  // Negative: rumor/could/might language in title
  const titleLower = post.title.toLowerCase()
  if (/\b(rumor|could|might|may)\b/.test(titleLower)) {
    score -= 15
  }

  // Specificity: dollar amounts, contract terms
  if (/\$\d/.test(text)) score += 10
  if (/\d+-year/.test(text)) score += 5

  // Recency
  if (post.publishedAt) {
    const hoursAgo = (Date.now() - new Date(post.publishedAt).getTime()) / (1000 * 60 * 60)
    if (hoursAgo < 2) score += 10
    else if (hoursAgo < 24) score += 5
    else if (hoursAgo > 72) score -= 10
  }

  // Hedge language
  for (const word of HEDGE_WORDS) {
    if (text.includes(word)) score -= 5
  }

  return Math.max(0, Math.min(100, score))
}

// =============================================================================
// RADAR MAPPING
// =============================================================================

export function scoreToRing(score: number): { ring: number; label: string; badge: string } {
  if (score >= 80) return { ring: 1, label: 'CONFIRMED', badge: 'VERIFIED' }
  if (score >= 60) return { ring: 2, label: 'LIKELY', badge: 'LIKELY' }
  if (score >= 40) return { ring: 3, label: 'PLAUSIBLE', badge: 'PLAUSIBLE' }
  if (score >= 20) return { ring: 4, label: 'SPECULATIVE', badge: 'SPECULATIVE' }
  return { ring: 5, label: 'WILD', badge: 'SPECULATIVE' }
}

// =============================================================================
// RUMOR CLASSIFICATION
// =============================================================================

const CATEGORY_KEYWORDS: Record<RumorCategory, string[]> = {
  'TRADE': ['trade', 'traded', 'deal', 'swap', 'exchange', 'package'],
  'FREE AGENCY': ['free agent', 'free agency', 'signing', 'contract', 'extension', 'restructure'],
  'DRAFT': ['draft', 'pick', 'prospect', 'combine', 'mock'],
  'ROSTER MOVE': ['cut', 'waive', 'release', 'promote', 'activate', 'practice squad', 'ir'],
  'INJURY': ['injury', 'injured', 'out', 'questionable', 'doubtful', 'concussion', 'acl', 'torn'],
  'INTEL': [],
}

export function classifyRumor(title: string): RumorCategory {
  const lower = title.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return category as RumorCategory
    }
  }
  return 'INTEL'
}

// =============================================================================
// RADAR DATA BUILDER
// =============================================================================

export function computeRumorRadarData(
  posts: { id?: string; title: string; excerpt: string | null; slug: string; publishedAt: string | null }[]
): RumorPing[] {
  return posts.map((post, i) => {
    const reliabilityScore = computeReliabilityScore(post)
    const { ring, label, badge } = scoreToRing(reliabilityScore)
    const category = classifyRumor(post.title)
    // Distribute pings around the circle with some randomization based on index
    const angle = (i * 137.5 + (i * 47) % 360) % 360

    return {
      id: post.id || `rumor-${i}`,
      title: post.title,
      excerpt: post.excerpt,
      slug: post.slug,
      publishedAt: post.publishedAt,
      reliabilityScore,
      ring,
      ringLabel: label,
      category,
      angle,
      auditBadge: badge,
    }
  })
}

// =============================================================================
// COMBINED DATA FETCHER
// =============================================================================

export async function fetchBears1Data(): Promise<Bears1Data> {
  const [players, stats, rumorPosts, record, headlinesEnvelope] = await Promise.all([
    getBearsPlayers(),
    getBearsStats(2025),
    getBearsPosts(15),
    getBearsSeparatedRecord(2025),
    brokerHeadlines(8),
  ])

  // Build radar data from posts (use all posts as potential rumors since
  // getBearsPostsByType('rumor') may return few results)
  const radarData = computeRumorRadarData(
    rumorPosts.map(p => ({
      id: String(p.id),
      title: p.title,
      excerpt: p.excerpt || null,
      slug: p.slug,
      publishedAt: p.publishedAt || null,
    }))
  )

  // Filter headlines to Bears only
  const bearsHeadlines = (headlinesEnvelope.data || []).filter(
    h => h.teamKey === 'bears' || !h.teamKey
  )

  return {
    players,
    stats,
    radarData,
    record,
    headlines: bearsHeadlines,
  }
}
