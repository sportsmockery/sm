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

// ─── Stat extraction from headlines ─────────────────────────────
const STAT_PATTERNS = [
  // Score patterns: "Bears 24, Lions 17" or "beat Lions 24-17"
  { regex: /(\d+)-(\d+)\s*(win|loss|victory|defeat)/i, type: 'score' },
  // Numeric stats: "rushed for 142 yards", "hit 3 home runs"
  { regex: /(\d+(?:\.\d+)?)\s*(yards?|points?|goals?|assists?|rebounds?|home runs?|strikeouts?|touchdowns?|TDs?|RBIs?|saves?|hits?|sacks?)/i, type: 'stat' },
  // Contract/money: "$24.5 million", "$140M"
  { regex: /\$(\d+(?:\.\d+)?)\s*(million|M|billion|B)/i, type: 'money' },
  // Record: "11-6", "23-22-8"
  { regex: /\b(\d{1,3}-\d{1,3}(?:-\d{1,3})?)\b/, type: 'record' },
  // Draft pick: "1st overall", "pick #4"
  { regex: /(1st|2nd|3rd|\d+th)\s*(overall|pick|round)/i, type: 'draft' },
  // Percentage: "shooting 48.5%"
  { regex: /(\d+(?:\.\d+)?)\s*%/i, type: 'percentage' },
]

function extractStats(title: string, excerpt: string | null): { label: string; value: string; type: string }[] {
  const text = `${title} ${excerpt || ''}`
  const stats: { label: string; value: string; type: string }[] = []

  for (const pattern of STAT_PATTERNS) {
    const match = text.match(pattern.regex)
    if (match) {
      stats.push({
        label: pattern.type,
        value: match[0],
        type: pattern.type,
      })
    }
  }

  return stats.slice(0, 3) // max 3 stats per headline
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
  // First check category slug
  if (categorySlug) {
    const slug = categorySlug.toLowerCase()
    if (slug.includes('bears')) return 'bears'
    if (slug.includes('bulls')) return 'bulls'
    if (slug.includes('blackhawks')) return 'blackhawks'
    if (slug.includes('cubs')) return 'cubs'
    if (slug.includes('white-sox') || slug.includes('whitesox')) return 'white-sox'
  }

  // Then check title keywords
  const lower = title.toLowerCase()
  for (const [team, keywords] of Object.entries(TEAM_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return team
  }

  return null
}

// ─── Freshness check ────────────────────────────────────────────
const STALE_THRESHOLD_MS = 15 * 60 * 1000 // 15 minutes

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
    // 1. Check DataLab cache
    const { data: cached } = await datalabAdmin
      .from('headlines_metadata')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (cached && cached.length > 0 && isFresh(cached[0].fetched_at)) {
      return {
        data: cached.map(mapHeadline),
        source: 'cache',
        fetchedAt: now,
      }
    }

    // 2. Fetch fresh posts from SM Supabase
    const { data: posts } = await supabaseAdmin
      .from('sm_posts')
      .select('id, title, excerpt, slug, featured_image, published_at, status, category_id')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (!posts || posts.length === 0) {
      // Return cached data even if stale
      if (cached && cached.length > 0) {
        return { data: cached.map(mapHeadline), source: 'cache', fetchedAt: now }
      }
      return { data: null, source: 'unavailable', fetchedAt: now }
    }

    // 3. Get category slugs
    const categoryIds = [...new Set(posts.map((p) => p.category_id).filter(Boolean))]
    const { data: categories } = await supabaseAdmin
      .from('sm_categories')
      .select('id, slug')
      .in('id', categoryIds)

    const categoryMap = new Map(categories?.map((c) => [c.id, c.slug]) || [])

    // 4. Enrich and UPSERT
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
        reliabilityScore: 100, // CMS content = fully reliable
        engagementVelocity: 0,
        featuredImage: post.featured_image,
        publishedAt: post.published_at,
        source: 'cms',
      }
    })

    // 5. UPSERT to DataLab (non-blocking)
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

    // Non-blocking upsert
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
    // 1. Check DataLab cache
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

    // 2. Compute from SM posts (views delta proxy)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: recentPosts } = await supabaseAdmin
      .from('sm_posts')
      .select('views, title')
      .eq('status', 'published')
      .gte('published_at', oneHourAgo)
      .order('views', { ascending: false })
      .limit(5)

    const totalRecentViews = recentPosts?.reduce((sum, p) => sum + (p.views || 0), 0) || 0
    // Normalize to 0-100 scale (100 views/hr = score of 80)
    const engagementScore = Math.min(100, Math.round((totalRecentViews / 100) * 80) || cached?.engagement_score || 50)

    const pulseData: PulseData = {
      engagementScore,
      viewsLastHour: totalRecentViews,
      viewsDelta: totalRecentViews - (cached?.views_last_hour || 0),
      activeReaders: recentPosts?.length || 0,
      trendingTopic: recentPosts?.[0]?.title?.slice(0, 60) || cached?.trending_topic || null,
      computedAt: now,
    }

    // 3. UPSERT to DataLab
    // Non-blocking upsert
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
    // Get latest headlines per team
    const { data: headlines } = await datalabAdmin
      .from('headlines_metadata')
      .select('title, team_key, key_stats, engagement_velocity')
      .order('published_at', { ascending: false })
      .limit(20)

    if (!headlines || headlines.length === 0) {
      return { data: null, source: 'unavailable', fetchedAt: now }
    }

    // Group by team, take top headline per team
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

    return {
      data: Array.from(teamMap.values()),
      source: 'broker',
      fetchedAt: now,
    }
  } catch (error) {
    console.error('[Broker] Briefing error:', error)
    return { data: null, source: 'unavailable', fetchedAt: new Date().toISOString() }
  }
}
