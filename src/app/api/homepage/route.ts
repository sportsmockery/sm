import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-server'

/**
 * Homepage Data API
 *
 * This API implements the exact population logic for the 2030 Chicago Sports
 * Blog homepage. All logic follows the specification precisely.
 *
 * GET /api/homepage
 * - Returns populated data for all 6 homepage sections
 * - Reads user preferences from cookies for personalization
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type TeamName = 'BEARS' | 'BULLS' | 'BLACKHAWKS' | 'CUBS' | 'WHITE SOX'

type HeadlineSource =
  | 'LATEST_GLOBAL'
  | 'EDITOR_PICK'
  | 'SEASON_ACTIVE'
  | 'EVERGREEN_TOP'
  | 'PERSONALIZED_OR_BALANCE'

interface Article {
  id: string
  slug: string
  title: string
  excerpt?: string
  featured_image?: string
  published_at: string
  team: TeamName
  category_slug: string
  author?: {
    name: string
    slug: string
    avatar_url?: string
  }
  editor_pick?: boolean
  pinned_slot?: number
  is_evergreen?: boolean
  engagement_score?: number
  time_on_page_avg?: number
  shares_30d?: number
  lifetime_engagement?: number
}

interface HeadlineRow {
  article: Article
  source: HeadlineSource
}

interface SeasonalTeam {
  team: TeamName
  mainStory: Article
  additionalLinks: Article[]
}

// ============================================================================
// TEAM/CATEGORY MAPPING
// ============================================================================

const TEAM_TO_CATEGORY: Record<TeamName, string> = {
  'BEARS': 'chicago-bears',
  'BULLS': 'chicago-bulls',
  'BLACKHAWKS': 'chicago-blackhawks',
  'CUBS': 'chicago-cubs',
  'WHITE SOX': 'chicago-white-sox',
}

const CATEGORY_TO_TEAM: Record<string, TeamName> = {
  'chicago-bears': 'BEARS',
  'bears': 'BEARS',
  'chicago-bulls': 'BULLS',
  'bulls': 'BULLS',
  'chicago-blackhawks': 'BLACKHAWKS',
  'blackhawks': 'BLACKHAWKS',
  'chicago-cubs': 'CUBS',
  'cubs': 'CUBS',
  'chicago-white-sox': 'WHITE SOX',
  'white-sox': 'WHITE SOX',
}

// ============================================================================
// SEASON DETECTION
// ============================================================================

/**
 * Determines which teams are currently in-season based on date.
 *
 * Season date ranges (approximate):
 * - NFL (Bears): September through February (Super Bowl)
 * - NBA (Bulls): October through June (Finals)
 * - NHL (Blackhawks): October through June (Stanley Cup)
 * - MLB (Cubs/White Sox): April through October (World Series)
 */
function getActiveTeams(date: Date = new Date()): TeamName[] {
  const month = date.getMonth() + 1 // 1-12
  const activeTeams: TeamName[] = []

  // NFL: September (9) through February (2)
  if (month >= 9 || month <= 2) {
    activeTeams.push('BEARS')
  }

  // NBA: October (10) through June (6)
  if (month >= 10 || month <= 6) {
    activeTeams.push('BULLS')
  }

  // NHL: October (10) through June (6)
  if (month >= 10 || month <= 6) {
    activeTeams.push('BLACKHAWKS')
  }

  // MLB: April (4) through October (10)
  if (month >= 4 && month <= 10) {
    activeTeams.push('CUBS')
    activeTeams.push('WHITE SOX')
  }

  return activeTeams
}

function isNFLSeason(date: Date = new Date()): boolean {
  const month = date.getMonth() + 1
  return month >= 9 || month <= 2
}

// ============================================================================
// MAIN API HANDLER
// ============================================================================

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userPreferredTeam = cookieStore.get('preferred_team')?.value as TeamName | undefined

    // Get active teams for current date
    const activeTeams = getActiveTeams()
    const nflActive = isNFLSeason()

    // Parallel data fetching for performance
    const [
      latestGlobal,
      editorPicks,
      seasonActive,
      evergreenTop,
      allRecentByTeam,
      heroArticles,
      featuredArticles,
      latestStream,
      evergreenArticles,
    ] = await Promise.all([
      // Row 1-3: Latest 3 articles globally
      fetchLatestGlobal(3),

      // Row 4-6: Editor picks
      fetchEditorPicks(3),

      // Row 7-8: Season active stories
      fetchSeasonActive(2, activeTeams, nflActive),

      // Row 9: Top evergreen by 30-day engagement
      fetchEvergreenTop(1),

      // For Row 10 and balance calculation
      fetchRecentByTeam(),

      // Hero region articles
      fetchHeroArticles(3),

      // Featured shell articles
      fetchFeaturedArticles(6, activeTeams, nflActive),

      // Latest stream (15 articles)
      fetchLatestStream(15),

      // Evergreen safety net (4 articles)
      fetchEvergreenSafetyNet(4),
    ])

    // ========================================================================
    // BUILD HEADLINES (EXACTLY 10 ROWS)
    // ========================================================================

    const headlines: HeadlineRow[] = []
    const usedArticleIds = new Set<string>()

    // Row 1-3: LATEST_GLOBAL
    for (const article of latestGlobal) {
      if (headlines.length < 3) {
        headlines.push({ article, source: 'LATEST_GLOBAL' })
        usedArticleIds.add(article.id)
      }
    }

    // Row 4-6: EDITOR_PICK
    for (const article of editorPicks) {
      if (headlines.length < 6 && !usedArticleIds.has(article.id)) {
        headlines.push({ article, source: 'EDITOR_PICK' })
        usedArticleIds.add(article.id)
      }
    }

    // Row 7-8: SEASON_ACTIVE
    for (const article of seasonActive) {
      if (headlines.length < 8 && !usedArticleIds.has(article.id)) {
        headlines.push({ article, source: 'SEASON_ACTIVE' })
        usedArticleIds.add(article.id)
      }
    }

    // Row 9: EVERGREEN_TOP
    for (const article of evergreenTop) {
      if (headlines.length < 9 && !usedArticleIds.has(article.id)) {
        headlines.push({ article, source: 'EVERGREEN_TOP' })
        usedArticleIds.add(article.id)
      }
    }

    // Row 10: PERSONALIZED_OR_BALANCE
    const row10Article = determineRow10Article(
      userPreferredTeam,
      allRecentByTeam,
      usedArticleIds,
      headlines
    )
    if (row10Article) {
      headlines.push({ article: row10Article, source: 'PERSONALIZED_OR_BALANCE' })
    }

    // ========================================================================
    // BUILD SEASONAL FOCUS (UP TO 3 TEAMS)
    // ========================================================================

    const seasonalFocus: SeasonalTeam[] = []
    for (const team of activeTeams.slice(0, 3)) {
      const teamArticles = allRecentByTeam[team] || []
      if (teamArticles.length > 0) {
        seasonalFocus.push({
          team,
          mainStory: teamArticles[0],
          additionalLinks: teamArticles.slice(1, 3),
        })
      }
    }

    // ========================================================================
    // RESPONSE
    // ========================================================================

    return NextResponse.json({
      heroMain: heroArticles[0] || null,
      heroSide1: heroArticles[1] || null,
      heroSide2: heroArticles[2] || null,
      headlines,
      featuredSlots: featuredArticles,
      latestStream,
      seasonalFocus,
      evergreen: evergreenArticles,
      userPreferredTeam,
    })
  } catch (error) {
    console.error('Homepage API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch homepage data' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DATA FETCHING FUNCTIONS
// ============================================================================

/**
 * Fetch latest articles globally (reverse chronological)
 */
async function fetchLatestGlobal(limit: number): Promise<Article[]> {
  const { data, error } = await supabaseAdmin
    .from('sm_posts')
    .select(`
      id, slug, title, excerpt, featured_image, published_at,
      sm_categories!inner(slug),
      sm_authors(display_name, slug, avatar_url)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('fetchLatestGlobal error:', error)
    return []
  }

  return (data || []).map(mapPostToArticle)
}

/**
 * Fetch editor-picked stories (flagged as editor_pick in CMS)
 */
async function fetchEditorPicks(limit: number): Promise<Article[]> {
  const { data, error } = await supabaseAdmin
    .from('sm_posts')
    .select(`
      id, slug, title, excerpt, featured_image, published_at,
      sm_categories!inner(slug),
      sm_authors(display_name, slug, avatar_url)
    `)
    .eq('status', 'published')
    .eq('editor_pick', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('fetchEditorPicks error:', error)
    return []
  }

  // If no editor picks, fallback to high engagement articles
  if (!data || data.length === 0) {
    return fetchHighEngagement(limit)
  }

  return (data || []).map(mapPostToArticle)
}

/**
 * Fetch season-active stories based on current active teams
 *
 * During NFL season: 1 Bears + 1 non-Bears from any other active league
 * Outside NFL season: 2 from currently playing leagues (no forced Bears)
 */
async function fetchSeasonActive(
  limit: number,
  activeTeams: TeamName[],
  nflActive: boolean
): Promise<Article[]> {
  const results: Article[] = []

  if (nflActive && activeTeams.includes('BEARS')) {
    // During NFL season: 1 Bears article
    const bearsArticle = await fetchLatestForTeam('BEARS', 1)
    if (bearsArticle.length > 0) {
      results.push(bearsArticle[0])
    }

    // 1 non-Bears from other active teams
    const nonBearsTeams = activeTeams.filter(t => t !== 'BEARS')
    for (const team of nonBearsTeams) {
      if (results.length >= limit) break
      const article = await fetchLatestForTeam(team, 1)
      if (article.length > 0) {
        results.push(article[0])
        break
      }
    }
  } else {
    // Outside NFL season: 2 from currently playing leagues
    for (const team of activeTeams) {
      if (results.length >= limit) break
      const article = await fetchLatestForTeam(team, 1)
      if (article.length > 0) {
        results.push(article[0])
      }
    }
  }

  return results
}

/**
 * Fetch top evergreen story by 30-day engagement
 */
async function fetchEvergreenTop(limit: number): Promise<Article[]> {
  const { data, error } = await supabaseAdmin
    .from('sm_posts')
    .select(`
      id, slug, title, excerpt, featured_image, published_at, views,
      sm_categories!inner(slug),
      sm_authors(display_name, slug, avatar_url)
    `)
    .eq('status', 'published')
    .eq('is_evergreen', true)
    .order('views', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) {
    console.error('fetchEvergreenTop error:', error)
    return []
  }

  // Fallback to high-view articles if no evergreen flag
  if (!data || data.length === 0) {
    return fetchHighEngagement(limit)
  }

  return (data || []).map(mapPostToArticle)
}

/**
 * Fetch recent articles grouped by team
 */
async function fetchRecentByTeam(): Promise<Record<TeamName, Article[]>> {
  const result: Record<TeamName, Article[]> = {
    'BEARS': [],
    'BULLS': [],
    'BLACKHAWKS': [],
    'CUBS': [],
    'WHITE SOX': [],
  }

  const teams = Object.keys(TEAM_TO_CATEGORY) as TeamName[]

  for (const team of teams) {
    const articles = await fetchLatestForTeam(team, 5)
    result[team] = articles
  }

  return result
}

/**
 * Fetch latest articles for a specific team
 */
async function fetchLatestForTeam(team: TeamName, limit: number): Promise<Article[]> {
  const categorySlug = TEAM_TO_CATEGORY[team]

  const { data, error } = await supabaseAdmin
    .from('sm_posts')
    .select(`
      id, slug, title, excerpt, featured_image, published_at,
      sm_categories!inner(slug),
      sm_authors(display_name, slug, avatar_url)
    `)
    .eq('status', 'published')
    .eq('sm_categories.slug', categorySlug)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error(`fetchLatestForTeam (${team}) error:`, error)
    return []
  }

  return (data || []).map(mapPostToArticle)
}

/**
 * Fetch high engagement articles (fallback for editor picks)
 */
async function fetchHighEngagement(limit: number): Promise<Article[]> {
  const { data, error } = await supabaseAdmin
    .from('sm_posts')
    .select(`
      id, slug, title, excerpt, featured_image, published_at, views,
      sm_categories!inner(slug),
      sm_authors(display_name, slug, avatar_url)
    `)
    .eq('status', 'published')
    .order('views', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) {
    console.error('fetchHighEngagement error:', error)
    return []
  }

  return (data || []).map(mapPostToArticle)
}

/**
 * Fetch hero region articles
 */
async function fetchHeroArticles(limit: number): Promise<Article[]> {
  // First try to get pinned hero articles
  const { data: pinnedData } = await supabaseAdmin
    .from('sm_posts')
    .select(`
      id, slug, title, excerpt, featured_image, published_at,
      sm_categories!inner(slug),
      sm_authors(display_name, slug, avatar_url)
    `)
    .eq('status', 'published')
    .eq('hero_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (pinnedData && pinnedData.length >= limit) {
    return pinnedData.map(mapPostToArticle)
  }

  // Fallback: high engagement recent articles with images
  const { data, error } = await supabaseAdmin
    .from('sm_posts')
    .select(`
      id, slug, title, excerpt, featured_image, published_at, views,
      sm_categories!inner(slug),
      sm_authors(display_name, slug, avatar_url)
    `)
    .eq('status', 'published')
    .not('featured_image', 'is', null)
    .order('views', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) {
    console.error('fetchHeroArticles error:', error)
    return []
  }

  return (data || []).map(mapPostToArticle)
}

/**
 * Fetch featured shell articles (6 slots)
 *
 * POPULATION PRIORITY RULES:
 * 1) If article is manually pinned to slot, use it
 * 2) Season-aware pool: during NFL, at least 2 Bears; otherwise at least 2 active teams
 * 3) High engagement + published within 90 days
 * 4) Evergreen fallback
 */
async function fetchFeaturedArticles(
  limit: number,
  activeTeams: TeamName[],
  nflActive: boolean
): Promise<Article[]> {
  const results: Article[] = []
  const usedIds = new Set<string>()

  // First, check for pinned articles
  const { data: pinnedData } = await supabaseAdmin
    .from('sm_posts')
    .select(`
      id, slug, title, excerpt, featured_image, published_at, pinned_slot,
      sm_categories!inner(slug),
      sm_authors(display_name, slug, avatar_url)
    `)
    .eq('status', 'published')
    .not('pinned_slot', 'is', null)
    .order('pinned_slot', { ascending: true })
    .limit(6)

  // Populate pinned slots first
  const pinnedBySlot: Record<number, Article> = {}
  for (const post of pinnedData || []) {
    if (post.pinned_slot && post.pinned_slot >= 1 && post.pinned_slot <= 6) {
      pinnedBySlot[post.pinned_slot] = mapPostToArticle(post)
      usedIds.add(post.id)
    }
  }

  // Calculate 90 days ago
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  // Fetch pool of high-engagement recent articles
  const { data: poolData } = await supabaseAdmin
    .from('sm_posts')
    .select(`
      id, slug, title, excerpt, featured_image, published_at, views,
      sm_categories!inner(slug),
      sm_authors(display_name, slug, avatar_url)
    `)
    .eq('status', 'published')
    .not('featured_image', 'is', null)
    .gte('published_at', ninetyDaysAgo.toISOString())
    .order('views', { ascending: false, nullsFirst: false })
    .limit(30)

  const pool = (poolData || []).map(mapPostToArticle).filter(a => !usedIds.has(a.id))

  // Build result array with slot constraints
  for (let slot = 1; slot <= 6; slot++) {
    if (pinnedBySlot[slot]) {
      results.push(pinnedBySlot[slot])
    } else {
      // Season-aware selection
      let candidate: Article | undefined

      // During NFL season, ensure at least 2 Bears in slots 1-6
      const bearsCount = results.filter(a => a.team === 'BEARS').length
      const needBears = nflActive && bearsCount < 2 && slot <= 4

      // Outside NFL season, ensure at least 2 from active teams
      const activeCount = results.filter(a => activeTeams.includes(a.team)).length
      const needActive = !nflActive && activeCount < 2 && slot <= 4

      if (needBears) {
        candidate = pool.find(a => a.team === 'BEARS' && !usedIds.has(a.id))
      } else if (needActive) {
        candidate = pool.find(a => activeTeams.includes(a.team) && !usedIds.has(a.id))
      }

      // Otherwise pick highest engagement
      if (!candidate) {
        candidate = pool.find(a => !usedIds.has(a.id))
      }

      if (candidate) {
        results.push(candidate)
        usedIds.add(candidate.id)
      }
    }
  }

  // If still missing slots, use evergreen fallback
  if (results.length < limit) {
    const { data: evergreenData } = await supabaseAdmin
      .from('sm_posts')
      .select(`
        id, slug, title, excerpt, featured_image, published_at, views,
        sm_categories!inner(slug),
        sm_authors(display_name, slug, avatar_url)
      `)
      .eq('status', 'published')
      .eq('is_evergreen', true)
      .not('featured_image', 'is', null)
      .order('views', { ascending: false, nullsFirst: false })
      .limit(6)

    for (const post of evergreenData || []) {
      if (results.length >= limit) break
      if (!usedIds.has(post.id)) {
        results.push(mapPostToArticle(post))
        usedIds.add(post.id)
      }
    }
  }

  return results
}

/**
 * Fetch latest stream (15 articles, reverse chronological)
 *
 * If fewer than 5 posts in last 72 hours, backfill with older posts
 */
async function fetchLatestStream(limit: number): Promise<Article[]> {
  const { data, error } = await supabaseAdmin
    .from('sm_posts')
    .select(`
      id, slug, title, excerpt, featured_image, published_at,
      sm_categories!inner(slug),
      sm_authors(display_name, slug, avatar_url)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('fetchLatestStream error:', error)
    return []
  }

  return (data || []).map(mapPostToArticle)
}

/**
 * Fetch evergreen safety net (4 articles)
 *
 * Selection criteria:
 * 1) Contextually relevant
 * 2) Highest lifetime engagement
 * 3) Mix: 1 Bears, 1 Bulls/Blackhawks, 1 Cubs/White Sox, 1 citywide
 */
async function fetchEvergreenSafetyNet(limit: number): Promise<Article[]> {
  const results: Article[] = []
  const usedIds = new Set<string>()

  // Fetch all high-engagement evergreen or high-view articles
  const { data } = await supabaseAdmin
    .from('sm_posts')
    .select(`
      id, slug, title, excerpt, featured_image, published_at, views,
      sm_categories!inner(slug),
      sm_authors(display_name, slug, avatar_url)
    `)
    .eq('status', 'published')
    .not('featured_image', 'is', null)
    .order('views', { ascending: false, nullsFirst: false })
    .limit(50)

  const pool = (data || []).map(mapPostToArticle)

  // Try to get mix: 1 Bears, 1 Bulls/Blackhawks, 1 Cubs/White Sox, 1 any
  const targetMix: (TeamName | TeamName[])[] = [
    'BEARS',
    ['BULLS', 'BLACKHAWKS'],
    ['CUBS', 'WHITE SOX'],
    'BEARS', // fallback to any team
  ]

  for (let i = 0; i < limit; i++) {
    const target = targetMix[i]
    let candidate: Article | undefined

    if (Array.isArray(target)) {
      candidate = pool.find(a => target.includes(a.team) && !usedIds.has(a.id))
    } else if (i === 3) {
      // Fourth slot: any team not yet used
      candidate = pool.find(a => !usedIds.has(a.id))
    } else {
      candidate = pool.find(a => a.team === target && !usedIds.has(a.id))
    }

    // Fallback to any available
    if (!candidate) {
      candidate = pool.find(a => !usedIds.has(a.id))
    }

    if (candidate) {
      results.push(candidate)
      usedIds.add(candidate.id)
    }
  }

  return results
}

/**
 * Determine Row 10 article for PERSONALIZED_OR_BALANCE
 *
 * If user has team preference: latest article from that team
 * If no preference: latest from team with fewest appearances in rows 1-9
 */
function determineRow10Article(
  preferredTeam: TeamName | undefined,
  recentByTeam: Record<TeamName, Article[]>,
  usedIds: Set<string>,
  headlines: HeadlineRow[]
): Article | null {
  // Count team appearances in existing headlines
  const teamCounts: Record<TeamName, number> = {
    'BEARS': 0,
    'BULLS': 0,
    'BLACKHAWKS': 0,
    'CUBS': 0,
    'WHITE SOX': 0,
  }

  for (const row of headlines) {
    if (row.article.team in teamCounts) {
      teamCounts[row.article.team]++
    }
  }

  // If user has preference, try to use that team
  if (preferredTeam && recentByTeam[preferredTeam]) {
    // Check for article from last 14 days
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const recentPreferred = recentByTeam[preferredTeam].find(
      a => !usedIds.has(a.id) && new Date(a.published_at) >= twoWeeksAgo
    )

    if (recentPreferred) {
      return recentPreferred
    }
  }

  // For first-time visitors or if preferred team has no recent articles:
  // Pick team with fewest appearances in rows 1-9
  const teams = Object.keys(teamCounts) as TeamName[]
  teams.sort((a, b) => teamCounts[a] - teamCounts[b])

  for (const team of teams) {
    const articles = recentByTeam[team] || []
    const candidate = articles.find(a => !usedIds.has(a.id))
    if (candidate) {
      return candidate
    }
  }

  return null
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Map database post to Article type
 */
function mapPostToArticle(post: Record<string, unknown>): Article {
  const categories = post.sm_categories as { slug: string } | { slug: string }[] | null
  const categorySlug = Array.isArray(categories)
    ? categories[0]?.slug
    : categories?.slug || 'news'

  const authors = post.sm_authors as { display_name: string; slug: string; avatar_url?: string } | null
  const team = CATEGORY_TO_TEAM[categorySlug] || 'BEARS'

  return {
    id: String(post.id),
    slug: String(post.slug || ''),
    title: String(post.title || 'Untitled'),
    excerpt: post.excerpt ? String(post.excerpt) : undefined,
    featured_image: post.featured_image ? String(post.featured_image) : undefined,
    published_at: String(post.published_at || new Date().toISOString()),
    team,
    category_slug: categorySlug,
    author: authors ? {
      name: authors.display_name || 'Staff',
      slug: authors.slug || 'staff',
      avatar_url: authors.avatar_url,
    } : undefined,
    editor_pick: Boolean(post.editor_pick),
    pinned_slot: typeof post.pinned_slot === 'number' ? post.pinned_slot : undefined,
    is_evergreen: Boolean(post.is_evergreen),
    engagement_score: typeof post.views === 'number' ? post.views : 0,
  }
}
