import { datalabAdmin } from '@/lib/supabase-datalab'
import { supabaseAdmin } from '@/lib/supabase-server'

// ═══════════════════════════════════════════════════════════════════
// Data Broker — Supabase-First → Fallback → Verify → UPSERT → Return
// ═══════════════════════════════════════════════════════════════════

export interface BrokerEnvelope<T> {
  data: T | null
  source: 'cache' | 'broker' | 'unavailable'
  fetchedAt: string
}

export interface EnrichedHeadline {
  postId: string
  title: string
  excerpt: string | null
  category: string | null
  teamKey: string | null
  keyStats: { label: string; value: string; type: string }[]
  reliabilityScore: number
  engagementVelocity: number
  featuredImage: string | null
  publishedAt: string | null
  source: string
}

export interface PulseData {
  engagementScore: number
  viewsLastHour: number
  viewsDelta: number
  activeReaders: number
  trendingTopic: string | null
  computedAt: string
}

export interface BriefingItem {
  team: string
  headline: string
  stat: string | null
  trend: 'up' | 'down' | 'neutral'
}

export interface GMTeaser {
  chicagoTeam: string
  tradePartner: string
  grade: number
  status: string
  summary: string
  createdAt: string
}

export interface SentimentData {
  score: number          // 0-100
  activityLevel: string  // 'low' | 'moderate' | 'high' | 'surge'
  messageCount: number
  topKeyword: string | null
}

export interface TeasersData {
  gm: GMTeaser | null
  sentiment: SentimentData | null
}

// ─── Stat extraction from headlines ─────────────────────────────
const STAT_PATTERNS = [
  { regex: /(\d+)-(\d+)\s*(win|loss|victory|defeat)/i, type: 'score' },
  { regex: /(\d+(?:\.\d+)?)\s*(yards?|points?|goals?|assists?|rebounds?|home runs?|strikeouts?|touchdowns?|TDs?|RBIs?|saves?|hits?|sacks?)/i, type: 'stat' },
  { regex: /\$(\d+(?:\.\d+)?)\s*(million|M|billion|B)/i, type: 'money' },
  { regex: /\b(\d{1,3}-\d{1,3}(?:-\d{1,3})?)\b/, type: 'record' },
  { regex: /(1st|2nd|3rd|\d+th)\s*(overall|pick|round)/i, type: 'draft' },
  { regex: /(\d+(?:\.\d+)?)\s*%/i, type: 'percentage' },
]

function extractStats(title: string, excerpt: string | null): { label: string; value: string; type: string }[] {
  const text = `${title} ${excerpt || ''}`
  const stats: { label: string; value: string; type: string }[] = []
  for (const pattern of STAT_PATTERNS) {
    const match = text.match(pattern.regex)
    if (match) {
      stats.push({ label: pattern.type, value: match[0], type: pattern.type })
    }
  }
  return stats.slice(0, 3)
}

// ─── Team key detection ─────────────────────────────────────────
const TEAM_KEYWORDS: Record<string, string[]> = {
  bears: ['bears', 'nfl', 'caleb williams', 'soldier field'],
  bulls: ['bulls', 'nba', 'united center'],
  blackhawks: ['blackhawks', 'hawks', 'nhl', 'bedard'],
  cubs: ['cubs', 'wrigley', 'mlb'],
  'white-sox': ['white sox', 'whitesox', 'sox', 'guaranteed rate'],
}

function detectTeamKey(title: string, categorySlug: string | null): string | null {
  if (categorySlug) {
    const slug = categorySlug.toLowerCase()
    if (slug.includes('bears')) return 'bears'
    if (slug.includes('bulls')) return 'bulls'
    if (slug.includes('blackhawks')) return 'blackhawks'
    if (slug.includes('cubs')) return 'cubs'
    if (slug.includes('white-sox') || slug.includes('whitesox')) return 'white-sox'
  }
  const lower = title.toLowerCase()
  for (const [team, keywords] of Object.entries(TEAM_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return team
  }
  return null
}

// ─── Freshness check ────────────────────────────────────────────
const STALE_THRESHOLD_MS = 15 * 60 * 1000

function isFresh(fetchedAt: string | null): boolean {
  if (!fetchedAt) return false
  return Date.now() - new Date(fetchedAt).getTime() < STALE_THRESHOLD_MS
}

// ═══════════════════════════════════════════════════════════════════
// Headlines broker
// ═══════════════════════════════════════════════════════════════════

export async function brokerHeadlines(limit = 12): Promise<BrokerEnvelope<EnrichedHeadline[]>> {
  const now = new Date().toISOString()
  try {
    const { data: cached } = await datalabAdmin
      .from('headlines_metadata')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (cached && cached.length > 0 && isFresh(cached[0].fetched_at)) {
      return { data: cached.map(mapHeadline), source: 'cache', fetchedAt: now }
    }

    const { data: posts } = await supabaseAdmin
      .from('sm_posts')
      .select('id, title, excerpt, slug, featured_image, published_at, status, category_id')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (!posts || posts.length === 0) {
      if (cached && cached.length > 0) {
        return { data: cached.map(mapHeadline), source: 'cache', fetchedAt: now }
      }
      return { data: null, source: 'unavailable', fetchedAt: now }
    }

    const categoryIds = [...new Set(posts.map((p) => p.category_id).filter(Boolean))]
    const { data: categories } = await supabaseAdmin
      .from('sm_categories')
      .select('id, slug')
      .in('id', categoryIds)

    const categoryMap = new Map(categories?.map((c) => [c.id, c.slug]) || [])

    const enriched: EnrichedHeadline[] = posts.map((post) => {
      const categorySlug = categoryMap.get(post.category_id) || null
      const teamKey = detectTeamKey(post.title, categorySlug)
      const keyStats = extractStats(post.title, post.excerpt)
      return {
        postId: String(post.id),
        title: post.title,
        excerpt: post.excerpt,
        category: categorySlug,
        teamKey,
        keyStats,
        reliabilityScore: 100,
        engagementVelocity: 0,
        featuredImage: post.featured_image,
        publishedAt: post.published_at,
        source: 'cms',
      }
    })

    const upsertRows = enriched.map((h) => ({
      post_id: h.postId,
      title: h.title,
      excerpt: h.excerpt,
      category: h.category,
      team_key: h.teamKey,
      key_stats: h.keyStats,
      reliability_score: h.reliabilityScore,
      engagement_velocity: h.engagementVelocity,
      source: h.source,
      featured_image: h.featuredImage,
      published_at: h.publishedAt,
      fetched_at: now,
      updated_at: now,
    }))

    ;(async () => {
      try {
        await datalabAdmin.from('headlines_metadata').upsert(upsertRows, { onConflict: 'post_id' })
      } catch (err) {
        console.error('[Broker] UPSERT headlines failed:', err)
      }
    })()

    return { data: enriched, source: 'broker', fetchedAt: now }
  } catch (error) {
    console.error('[Broker] Headlines error:', error)
    return { data: null, source: 'unavailable', fetchedAt: new Date().toISOString() }
  }
}

function mapHeadline(row: Record<string, unknown>): EnrichedHeadline {
  return {
    postId: String(row.post_id),
    title: String(row.title || ''),
    excerpt: row.excerpt as string | null,
    category: row.category as string | null,
    teamKey: row.team_key as string | null,
    keyStats: (row.key_stats as EnrichedHeadline['keyStats']) || [],
    reliabilityScore: Number(row.reliability_score) || 100,
    engagementVelocity: Number(row.engagement_velocity) || 0,
    featuredImage: row.featured_image as string | null,
    publishedAt: row.published_at as string | null,
    source: String(row.source || 'cache'),
  }
}

// ═══════════════════════════════════════════════════════════════════
// Engagement Pulse broker
// ═══════════════════════════════════════════════════════════════════

export async function brokerPulse(metricKey = 'global'): Promise<BrokerEnvelope<PulseData>> {
  const now = new Date().toISOString()
  try {
    const { data: cached } = await datalabAdmin
      .from('engagement_pulse')
      .select('*')
      .eq('metric_key', metricKey)
      .single()

    if (cached && isFresh(cached.computed_at)) {
      return {
        data: {
          engagementScore: Number(cached.engagement_score) || 50,
          viewsLastHour: cached.views_last_hour || 0,
          viewsDelta: cached.views_delta || 0,
          activeReaders: cached.active_readers || 0,
          trendingTopic: cached.trending_topic,
          computedAt: cached.computed_at,
        },
        source: 'cache',
        fetchedAt: now,
      }
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: recentPosts } = await supabaseAdmin
      .from('sm_posts')
      .select('views, title')
      .eq('status', 'published')
      .gte('published_at', oneHourAgo)
      .order('views', { ascending: false })
      .limit(5)

    const totalRecentViews = recentPosts?.reduce((sum, p) => sum + (p.views || 0), 0) || 0
    const engagementScore = Math.min(100, Math.round((totalRecentViews / 100) * 80) || cached?.engagement_score || 50)

    const pulseData: PulseData = {
      engagementScore,
      viewsLastHour: totalRecentViews,
      viewsDelta: totalRecentViews - (cached?.views_last_hour || 0),
      activeReaders: recentPosts?.length || 0,
      trendingTopic: recentPosts?.[0]?.title?.slice(0, 60) || cached?.trending_topic || null,
      computedAt: now,
    }

    ;(async () => {
      try {
        await datalabAdmin.from('engagement_pulse').upsert(
          {
            metric_key: metricKey,
            engagement_score: pulseData.engagementScore,
            views_last_hour: pulseData.viewsLastHour,
            views_delta: pulseData.viewsDelta,
            active_readers: pulseData.activeReaders,
            trending_topic: pulseData.trendingTopic,
            computed_at: now,
          },
          { onConflict: 'metric_key' }
        )
      } catch (err) {
        console.error('[Broker] UPSERT pulse failed:', err)
      }
    })()

    return { data: pulseData, source: 'broker', fetchedAt: now }
  } catch (error) {
    console.error('[Broker] Pulse error:', error)
    return { data: null, source: 'unavailable', fetchedAt: new Date().toISOString() }
  }
}

// ═══════════════════════════════════════════════════════════════════
// Briefing broker (GM Audit quick-look)
// ═══════════════════════════════════════════════════════════════════

export async function brokerBriefing(): Promise<BrokerEnvelope<BriefingItem[]>> {
  const now = new Date().toISOString()
  try {
    const { data: headlines } = await datalabAdmin
      .from('headlines_metadata')
      .select('title, team_key, key_stats, engagement_velocity')
      .order('published_at', { ascending: false })
      .limit(20)

    if (!headlines || headlines.length === 0) {
      return { data: null, source: 'unavailable', fetchedAt: now }
    }

    const teamMap = new Map<string, BriefingItem>()
    for (const h of headlines) {
      const team = h.team_key || 'general'
      if (!teamMap.has(team)) {
        const stats = (h.key_stats as { label: string; value: string }[]) || []
        teamMap.set(team, {
          team,
          headline: h.title,
          stat: stats[0]?.value || null,
          trend: Number(h.engagement_velocity) > 0 ? 'up' : Number(h.engagement_velocity) < 0 ? 'down' : 'neutral',
        })
      }
    }

    return { data: Array.from(teamMap.values()), source: 'broker', fetchedAt: now }
  } catch (error) {
    console.error('[Broker] Briefing error:', error)
    return { data: null, source: 'unavailable', fetchedAt: new Date().toISOString() }
  }
}

// ═══════════════════════════════════════════════════════════════════
// Feature Teasers broker (GM trade + Fan Chat sentiment)
// ═══════════════════════════════════════════════════════════════════

const POSITIVE_WORDS = ['win', 'won', 'lets go', 'goat', 'fire', 'amazing', 'clutch', 'beast', 'hype', 'love', 'great', 'lfg', 'dub', 'w ', 'elite', 'dominant', 'huge', 'yes', 'nice', 'sick']
const NEGATIVE_WORDS = ['loss', 'lost', 'trash', 'terrible', 'awful', 'worst', 'tank', 'fire him', 'disappointing', 'choke', 'embarrassing', 'pathetic', 'bust', 'l ', 'suck', 'bad', 'hate', 'ugh', 'smh']

export async function brokerTeasers(): Promise<BrokerEnvelope<TeasersData>> {
  const now = new Date().toISOString()

  // Fetch GM teaser + fan chat sentiment in parallel
  const [gmResult, sentimentResult] = await Promise.allSettled([
    fetchGMTeaser(),
    fetchSentiment(),
  ])

  const gm = gmResult.status === 'fulfilled' ? gmResult.value : null
  const sentiment = sentimentResult.status === 'fulfilled' ? sentimentResult.value : null

  return {
    data: { gm, sentiment },
    source: gm || sentiment ? 'broker' : 'unavailable',
    fetchedAt: now,
  }
}

async function fetchGMTeaser(): Promise<GMTeaser | null> {
  try {
    const { data } = await datalabAdmin
      .from('gm_trades')
      .select('chicago_team, trade_partner, grade, status, trade_summary, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!data) return null

    return {
      chicagoTeam: data.chicago_team,
      tradePartner: data.trade_partner,
      grade: data.grade,
      status: data.status,
      summary: data.trade_summary || `${data.chicago_team} ↔ ${data.trade_partner}`,
      createdAt: data.created_at,
    }
  } catch {
    return null
  }
}

async function fetchSentiment(): Promise<SentimentData | null> {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    const { data: messages } = await supabaseAdmin
      .from('chat_messages')
      .select('content')
      .gte('created_at', twoHoursAgo)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(100)

    if (!messages || messages.length === 0) {
      return { score: 50, activityLevel: 'low', messageCount: 0, topKeyword: null }
    }

    // Light keyword-based sentiment analysis
    let positiveCount = 0
    let negativeCount = 0
    const keywordCounts = new Map<string, number>()

    for (const msg of messages) {
      const content = (msg.content || '').toLowerCase()
      for (const word of POSITIVE_WORDS) {
        if (content.includes(word)) { positiveCount++; break }
      }
      for (const word of NEGATIVE_WORDS) {
        if (content.includes(word)) { negativeCount++; break }
      }
      // Count team mentions for top keyword
      for (const team of ['bears', 'bulls', 'blackhawks', 'cubs', 'white sox']) {
        if (content.includes(team)) {
          keywordCounts.set(team, (keywordCounts.get(team) || 0) + 1)
        }
      }
    }

    const total = positiveCount + negativeCount
    const score = total > 0
      ? Math.round((positiveCount / total) * 100)
      : 50

    const count = messages.length
    const activityLevel = count > 80 ? 'surge' : count > 40 ? 'high' : count > 15 ? 'moderate' : 'low'

    let topKeyword: string | null = null
    let maxCount = 0
    for (const [kw, cnt] of keywordCounts) {
      if (cnt > maxCount) { topKeyword = kw; maxCount = cnt }
    }

    return { score, activityLevel, messageCount: count, topKeyword }
  } catch {
    return null
  }
}
