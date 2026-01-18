/**
 * Homepage Data Fetcher with SSR Fallbacks
 *
 * CRITICAL: This module ALWAYS returns fully populated data.
 * It never throws, never returns empty arrays, and never leaves
 * the homepage blank. Real API data is preferred, but fallbacks
 * guarantee content even when all APIs are down.
 */

import { supabaseAdmin } from './supabase-server'

// Types
export type TeamId = 'BEARS' | 'BULLS' | 'BLACKHAWKS' | 'CUBS' | 'WHITE_SOX' | 'CITYWIDE'

export interface Post {
  id: string | number
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  published_at: string
  category: {
    name: string
    slug: string
  }
  author?: {
    name: string
    avatar_url?: string
  }
  team?: TeamId
  editor_pick?: boolean
  evergreen?: boolean
  engagement_score?: number
  readTime?: number
}

export interface Game {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  status: 'pre' | 'live' | 'final'
  statusText: string
  time?: string
  venue?: string
}

export interface TeamData {
  id: TeamId
  league: string
  name: string
  record: string
  nextGame?: {
    opponent: string
    homeAway: 'vs' | '@'
    dateTimeLocal: string
    venue: string
    shortLabel: string
  }
  weather?: {
    tempF: number
    description: string
  }
  isPlayingNow: boolean
}

export interface HomepageData {
  scorebandTeams: TeamData[]
  seasonActive: string[]
  primaryStory: Post
  supportStories: Post[]
  headlines: Post[]
  tonightGames: Game[]
  featureSlots: Post[]
  latestPosts: Post[]
  seasonalTeams: { team: TeamData; posts: Post[] }[]
  evergreenPosts: Post[]
}

/**
 * Main data fetcher - ALWAYS returns complete data
 */
export async function fetchHomepageData(): Promise<HomepageData> {
  let posts: Post[] = []
  let evergreen: Post[] = []
  let teamsData: TeamData[] = []
  let tonightGames: Game[] = []
  const seasonActive = getActiveSeasons()

  // Try to fetch real data, but NEVER throw - always fall back
  try {
    const [postsResult, tickerResult] = await Promise.allSettled([
      fetchPosts(),
      fetchTickerData(),
    ])

    if (postsResult.status === 'fulfilled' && postsResult.value.length > 0) {
      posts = postsResult.value
    }

    if (tickerResult.status === 'fulfilled') {
      tonightGames = tickerResult.value.games || []
      teamsData = tickerResult.value.teams || []
    }
  } catch {
    // Swallow - fallbacks guarantee full homepage
  }

  // GUARANTEE: Always have posts
  if (posts.length === 0) {
    posts = getFallbackPosts()
  }

  // Split evergreen from regular posts or use fallback
  evergreen = posts.filter(p => p.evergreen)
  if (evergreen.length < 4) {
    evergreen = [...evergreen, ...getFallbackEvergreen()].slice(0, 4)
  }

  // GUARANTEE: Always have teams
  if (teamsData.length === 0) {
    teamsData = getFallbackTeams()
  }

  // GUARANTEE: Always have games
  if (tonightGames.length === 0) {
    tonightGames = getFallbackGames()
  }

  // Derive section data with guaranteed minimums
  const primaryStory = selectPrimaryStory(posts)
  const supportStories = selectSupportStories(posts, primaryStory)
  const headlines = selectHeadlines(posts, evergreen)
  const featureSlots = selectFeatureSlots(posts, evergreen, seasonActive)
  const latestPosts = selectLatestPosts(posts)
  const seasonalTeams = selectSeasonalTeams(teamsData, posts, seasonActive)
  const evergreenPosts = selectEvergreenGrid(evergreen)

  return {
    scorebandTeams: teamsData,
    seasonActive,
    primaryStory,
    supportStories,
    headlines,
    tonightGames,
    featureSlots,
    latestPosts,
    seasonalTeams,
    evergreenPosts,
  }
}

/**
 * Fetch posts from Supabase
 */
async function fetchPosts(): Promise<Post[]> {
  const { data, error } = await supabaseAdmin
    .from('sm_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published_at,
      category_id,
      author_id,
      sm_categories(name, slug),
      sm_authors(display_name, avatar_url)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50)

  if (error || !data) return []

  return data.map((post: any) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    featured_image: post.featured_image,
    published_at: post.published_at,
    category: {
      name: post.sm_categories?.name || 'Chicago',
      slug: post.sm_categories?.slug || 'chicago',
    },
    author: post.sm_authors ? {
      name: post.sm_authors.display_name,
      avatar_url: post.sm_authors.avatar_url,
    } : { name: 'Sports Mockery Staff' },
    team: categoryToTeam(post.sm_categories?.slug),
    readTime: Math.ceil((post.excerpt?.length || 500) / 200),
  }))
}

/**
 * Fetch ticker/game data
 */
async function fetchTickerData(): Promise<{ games: Game[]; teams: TeamData[] }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/bears/ticker`, {
      cache: 'no-store',
      next: { revalidate: 60 }
    })

    if (!res.ok) return { games: [], teams: [] }

    const data = await res.json()

    const games: Game[] = data.nextGame ? [{
      id: 'bears-next',
      homeTeam: data.isHome ? 'BEARS' : data.opponent,
      awayTeam: data.isHome ? data.opponent : 'BEARS',
      homeScore: null,
      awayScore: null,
      status: 'pre' as const,
      statusText: data.gameTime || 'TBD',
      venue: data.stadium,
    }] : []

    const teams: TeamData[] = [{
      id: 'BEARS',
      league: 'NFL',
      name: 'Chicago Bears',
      record: data.record || '0-0',
      isPlayingNow: false,
      nextGame: data.nextGame ? {
        opponent: data.opponent,
        homeAway: data.isHome ? 'vs' : '@',
        dateTimeLocal: data.gameDate,
        venue: data.stadium || 'Soldier Field',
        shortLabel: `${data.isHome ? 'vs' : '@'} ${data.opponent}`,
      } : undefined,
    }]

    return { games, teams }
  } catch {
    return { games: [], teams: [] }
  }
}

/**
 * Map category slug to team ID
 */
function categoryToTeam(slug?: string): TeamId {
  if (!slug) return 'CITYWIDE'
  if (slug.includes('bears')) return 'BEARS'
  if (slug.includes('bulls')) return 'BULLS'
  if (slug.includes('cubs')) return 'CUBS'
  if (slug.includes('white-sox') || slug.includes('sox')) return 'WHITE_SOX'
  if (slug.includes('blackhawks') || slug.includes('hawks')) return 'BLACKHAWKS'
  return 'CITYWIDE'
}

/**
 * Get currently active sports seasons
 */
function getActiveSeasons(): string[] {
  const month = new Date().getMonth() + 1
  const seasons: string[] = []

  // NFL: September - February
  if (month >= 9 || month <= 2) seasons.push('NFL')
  // NBA: October - June
  if (month >= 10 || month <= 6) seasons.push('NBA')
  // NHL: October - June
  if (month >= 10 || month <= 6) seasons.push('NHL')
  // MLB: April - October
  if (month >= 4 && month <= 10) seasons.push('MLB')

  return seasons.length > 0 ? seasons : ['NFL', 'NBA', 'NHL', 'MLB']
}

// ============================================
// SELECTION HELPERS - Always return valid data
// ============================================

function selectPrimaryStory(posts: Post[]): Post {
  // Prefer editor picks, then most recent
  const editorPick = posts.find(p => p.editor_pick)
  return editorPick || posts[0] || getFallbackPosts()[0]
}

function selectSupportStories(posts: Post[], primary: Post): Post[] {
  const filtered = posts.filter(p => p.id !== primary.id)
  const result = filtered.slice(0, 2)

  // GUARANTEE: Always 2 support stories
  while (result.length < 2) {
    result.push(getFallbackPosts()[result.length + 1])
  }
  return result
}

function selectHeadlines(posts: Post[], evergreen: Post[]): Post[] {
  const headlines: Post[] = []
  const used = new Set<string | number>()

  // Rows 1-3: Latest global
  const latest = posts.slice(0, 3)
  latest.forEach(p => { headlines.push(p); used.add(p.id) })

  // Rows 4-6: Editor picks or next available
  const editorPicks = posts.filter(p => p.editor_pick && !used.has(p.id)).slice(0, 3)
  editorPicks.forEach(p => { headlines.push(p); used.add(p.id) })

  // Rows 7-8: Season active (any remaining)
  const remaining = posts.filter(p => !used.has(p.id)).slice(0, 2)
  remaining.forEach(p => { headlines.push(p); used.add(p.id) })

  // Row 9: Evergreen
  if (evergreen.length > 0 && !used.has(evergreen[0].id)) {
    headlines.push(evergreen[0])
    used.add(evergreen[0].id)
  }

  // Row 10: Any remaining
  const final = posts.find(p => !used.has(p.id))
  if (final) headlines.push(final)

  // GUARANTEE: Always exactly 10 headlines
  const fallbacks = getFallbackPosts()
  let fallbackIdx = 0
  while (headlines.length < 10 && fallbackIdx < fallbacks.length) {
    if (!used.has(fallbacks[fallbackIdx].id)) {
      headlines.push(fallbacks[fallbackIdx])
    }
    fallbackIdx++
  }

  return headlines.slice(0, 10)
}

function selectFeatureSlots(posts: Post[], evergreen: Post[], _seasons: string[]): Post[] {
  const slots: Post[] = []
  const used = new Set<string | number>()

  // Mix of recent posts and evergreen
  const candidates = [...posts.slice(0, 10), ...evergreen]

  for (const post of candidates) {
    if (slots.length >= 6) break
    if (!used.has(post.id)) {
      slots.push(post)
      used.add(post.id)
    }
  }

  // GUARANTEE: Always 6 feature slots
  const fallbacks = getFallbackPosts()
  let fallbackIdx = 0
  while (slots.length < 6 && fallbackIdx < fallbacks.length) {
    if (!used.has(fallbacks[fallbackIdx].id)) {
      slots.push(fallbacks[fallbackIdx])
    }
    fallbackIdx++
  }

  return slots.slice(0, 6)
}

function selectLatestPosts(posts: Post[]): Post[] {
  const result = posts.slice(0, 15)

  // GUARANTEE: Always at least 5 posts
  const fallbacks = getFallbackPosts()
  let fallbackIdx = 0
  while (result.length < 5 && fallbackIdx < fallbacks.length) {
    result.push(fallbacks[fallbackIdx])
    fallbackIdx++
  }

  return result
}

function selectSeasonalTeams(
  teams: TeamData[],
  posts: Post[],
  seasons: string[]
): { team: TeamData; posts: Post[] }[] {
  const result: { team: TeamData; posts: Post[] }[] = []

  const teamLeagueMap: Record<TeamId, string> = {
    BEARS: 'NFL',
    BULLS: 'NBA',
    BLACKHAWKS: 'NHL',
    CUBS: 'MLB',
    WHITE_SOX: 'MLB',
    CITYWIDE: 'ALL',
  }

  // Filter to in-season teams
  const inSeasonTeams = teams.filter(t =>
    seasons.includes(teamLeagueMap[t.id] || 'ALL')
  )

  for (const team of inSeasonTeams.slice(0, 3)) {
    const teamPosts = posts.filter(p => p.team === team.id).slice(0, 3)

    // GUARANTEE: At least 1 post per team
    if (teamPosts.length === 0) {
      const fallback = getFallbackPosts().find(p => p.team === team.id)
      if (fallback) teamPosts.push(fallback)
    }

    result.push({ team, posts: teamPosts })
  }

  // GUARANTEE: Always at least 1 seasonal team
  if (result.length === 0) {
    const fallbackTeam = getFallbackTeams()[0]
    const fallbackPosts = getFallbackPosts().filter(p => p.team === 'BEARS').slice(0, 3)
    result.push({ team: fallbackTeam, posts: fallbackPosts })
  }

  return result
}

function selectEvergreenGrid(evergreen: Post[]): Post[] {
  const result = evergreen.slice(0, 4)

  // GUARANTEE: Always 4 evergreen posts
  const fallbacks = getFallbackEvergreen()
  let fallbackIdx = 0
  while (result.length < 4 && fallbackIdx < fallbacks.length) {
    result.push(fallbacks[fallbackIdx])
    fallbackIdx++
  }

  return result.slice(0, 4)
}

// ============================================
// FALLBACK DATA - On-brand, never blank
// ============================================

function getFallbackPosts(): Post[] {
  const now = new Date().toISOString()

  return [
    {
      id: 'fallback-bears-1',
      title: 'Fields vs. The Lakefront Wind: How Chicago Accidentally Built an Offense',
      slug: 'fields-vs-lakefront-wind',
      excerpt: 'The Bears finally called the plays fans have been screaming from couches for a decade — and the city might never calm down.',
      featured_image: null,
      published_at: now,
      category: { name: 'Chicago Bears', slug: 'chicago-bears' },
      author: { name: 'Sports Mockery Staff' },
      team: 'BEARS',
      editor_pick: true,
      readTime: 8,
    },
    {
      id: 'fallback-bulls-1',
      title: 'The Bulls Finally Remembered the Fourth Quarter Exists',
      slug: 'bulls-fourth-quarter',
      excerpt: 'Late-game execution, suspicious competence, and a fanbase trying to trust again.',
      featured_image: null,
      published_at: now,
      category: { name: 'Chicago Bulls', slug: 'chicago-bulls' },
      author: { name: 'Sports Mockery Staff' },
      team: 'BULLS',
      editor_pick: true,
      readTime: 5,
    },
    {
      id: 'fallback-cubs-1',
      title: 'Wrigley in April: Hope, Hoodies, and a Very Stubborn Optimism',
      slug: 'wrigley-april-hope',
      excerpt: 'The ivy is still brown, the beer is still cold, and Cubs fans are still eternal optimists.',
      featured_image: null,
      published_at: now,
      category: { name: 'Chicago Cubs', slug: 'chicago-cubs' },
      author: { name: 'Sports Mockery Staff' },
      team: 'CUBS',
      readTime: 6,
    },
    {
      id: 'fallback-sox-1',
      title: 'The White Sox Season That Turned Into a Therapy Podcast',
      slug: 'white-sox-therapy',
      excerpt: 'Sometimes you just need to talk it out. Preferably with other Sox fans who understand.',
      featured_image: null,
      published_at: now,
      category: { name: 'Chicago White Sox', slug: 'chicago-white-sox' },
      author: { name: 'Sports Mockery Staff' },
      team: 'WHITE_SOX',
      readTime: 4,
    },
    {
      id: 'fallback-hawks-1',
      title: 'Blackhawks Youth Movement: Chaos, Speed, and a Little Hope',
      slug: 'blackhawks-youth-movement',
      excerpt: 'The rebuild is real, the kids are fast, and the Madhouse might be loud again soon.',
      featured_image: null,
      published_at: now,
      category: { name: 'Chicago Blackhawks', slug: 'chicago-blackhawks' },
      author: { name: 'Sports Mockery Staff' },
      team: 'BLACKHAWKS',
      readTime: 5,
    },
    {
      id: 'fallback-bears-2',
      title: 'How Chicago Finally Made Peace with Fourth-and-Short',
      slug: 'bears-fourth-and-short',
      excerpt: 'For years, we punted. Now we convert. The emotional journey continues.',
      featured_image: null,
      published_at: now,
      category: { name: 'Chicago Bears', slug: 'chicago-bears' },
      author: { name: 'Sports Mockery Staff' },
      team: 'BEARS',
      readTime: 7,
    },
    {
      id: 'fallback-bulls-2',
      title: 'Why the Bulls Half-Court Offense Finally Looks Like 2030',
      slug: 'bulls-half-court-2030',
      excerpt: 'Movement, spacing, and actual passing. Is this what modern basketball feels like?',
      featured_image: null,
      published_at: now,
      category: { name: 'Chicago Bulls', slug: 'chicago-bulls' },
      author: { name: 'Sports Mockery Staff' },
      team: 'BULLS',
      readTime: 6,
    },
    {
      id: 'fallback-hawks-2',
      title: 'United Center Volume Report: Loud, Nervous, Extremely Chicago',
      slug: 'united-center-volume',
      excerpt: 'The fans are back, the energy is real, and the goal horn is warming up.',
      featured_image: null,
      published_at: now,
      category: { name: 'Chicago Blackhawks', slug: 'chicago-blackhawks' },
      author: { name: 'Sports Mockery Staff' },
      team: 'BLACKHAWKS',
      readTime: 4,
    },
    {
      id: 'fallback-citywide-1',
      title: 'Chicago Sports Weekend: Who Hurt Us Most and Who Made Us Proud',
      slug: 'chicago-weekend-recap',
      excerpt: 'A comprehensive guide to your Sunday therapy session needs.',
      featured_image: null,
      published_at: now,
      category: { name: 'Chicago Sports', slug: 'chicago' },
      author: { name: 'Sports Mockery Staff' },
      team: 'CITYWIDE',
      readTime: 5,
    },
    {
      id: 'fallback-cubs-2',
      title: '"It\'s Only April" and Other Lies We Tell Ourselves at Wrigley',
      slug: 'cubs-april-lies',
      excerpt: 'The annual tradition of premature hope and eventual acceptance continues.',
      featured_image: null,
      published_at: now,
      category: { name: 'Chicago Cubs', slug: 'chicago-cubs' },
      author: { name: 'Sports Mockery Staff' },
      team: 'CUBS',
      readTime: 5,
    },
  ]
}

function getFallbackEvergreen(): Post[] {
  return [
    {
      id: 'evergreen-heartbreak',
      title: 'The Definitive Ranking of Chicago Sports Heartbreaks',
      slug: 'chicago-heartbreaks-ranking',
      excerpt: 'A museum of pain, but make it cathartic. From 1984 to yesterday.',
      featured_image: null,
      published_at: '2024-01-01T00:00:00Z',
      category: { name: 'Chicago Sports', slug: 'chicago' },
      author: { name: 'Sports Mockery Staff' },
      team: 'CITYWIDE',
      evergreen: true,
      readTime: 12,
    },
    {
      id: 'evergreen-super-bowl',
      title: 'The 1985 Bears: Why We Still Talk About Them Every Single Year',
      slug: '1985-bears-legacy',
      excerpt: 'Because greatness this pure deserves eternal discussion.',
      featured_image: null,
      published_at: '2024-01-01T00:00:00Z',
      category: { name: 'Chicago Bears', slug: 'chicago-bears' },
      author: { name: 'Sports Mockery Staff' },
      team: 'BEARS',
      evergreen: true,
      readTime: 10,
    },
    {
      id: 'evergreen-jordan',
      title: 'MJ Stories That Still Give Chicago Chills',
      slug: 'jordan-chicago-stories',
      excerpt: 'The flu game. The shrug. The last shot. All of it.',
      featured_image: null,
      published_at: '2024-01-01T00:00:00Z',
      category: { name: 'Chicago Bulls', slug: 'chicago-bulls' },
      author: { name: 'Sports Mockery Staff' },
      team: 'BULLS',
      evergreen: true,
      readTime: 15,
    },
    {
      id: 'evergreen-rivalries',
      title: 'Chicago vs. Everyone: Our Greatest Rivalries Explained',
      slug: 'chicago-rivalries',
      excerpt: 'Green Bay. Detroit. St. Louis. The hate is real and it is earned.',
      featured_image: null,
      published_at: '2024-01-01T00:00:00Z',
      category: { name: 'Chicago Sports', slug: 'chicago' },
      author: { name: 'Sports Mockery Staff' },
      team: 'CITYWIDE',
      evergreen: true,
      readTime: 8,
    },
  ]
}

function getFallbackTeams(): TeamData[] {
  return [
    {
      id: 'BEARS',
      league: 'NFL',
      name: 'Chicago Bears',
      record: '0-0',
      isPlayingNow: false,
      nextGame: {
        opponent: 'Green Bay Packers',
        homeAway: 'vs',
        dateTimeLocal: new Date().toISOString(),
        venue: 'Soldier Field',
        shortLabel: 'vs GB • Schedule TBD',
      },
      weather: {
        tempF: 35,
        description: 'Windy at Soldier Field',
      },
    },
    {
      id: 'BULLS',
      league: 'NBA',
      name: 'Chicago Bulls',
      record: '0-0',
      isPlayingNow: false,
      nextGame: {
        opponent: 'Milwaukee Bucks',
        homeAway: 'vs',
        dateTimeLocal: new Date().toISOString(),
        venue: 'United Center',
        shortLabel: 'vs MIL • Schedule TBD',
      },
    },
    {
      id: 'BLACKHAWKS',
      league: 'NHL',
      name: 'Chicago Blackhawks',
      record: '0-0',
      isPlayingNow: false,
      nextGame: {
        opponent: 'Detroit Red Wings',
        homeAway: 'vs',
        dateTimeLocal: new Date().toISOString(),
        venue: 'United Center',
        shortLabel: 'vs DET • Schedule TBD',
      },
    },
    {
      id: 'CUBS',
      league: 'MLB',
      name: 'Chicago Cubs',
      record: '0-0',
      isPlayingNow: false,
      nextGame: {
        opponent: 'St. Louis Cardinals',
        homeAway: 'vs',
        dateTimeLocal: new Date().toISOString(),
        venue: 'Wrigley Field',
        shortLabel: 'vs STL • Schedule TBD',
      },
    },
    {
      id: 'WHITE_SOX',
      league: 'MLB',
      name: 'Chicago White Sox',
      record: '0-0',
      isPlayingNow: false,
      nextGame: {
        opponent: 'Minnesota Twins',
        homeAway: 'vs',
        dateTimeLocal: new Date().toISOString(),
        venue: 'Guaranteed Rate Field',
        shortLabel: 'vs MIN • Schedule TBD',
      },
    },
  ]
}

function getFallbackGames(): Game[] {
  return [
    {
      id: 'fallback-bears',
      homeTeam: 'BEARS',
      awayTeam: 'PACKERS',
      homeScore: null,
      awayScore: null,
      status: 'pre',
      statusText: 'Schedule TBD',
      venue: 'Soldier Field',
    },
    {
      id: 'fallback-bulls',
      homeTeam: 'BULLS',
      awayTeam: 'BUCKS',
      homeScore: null,
      awayScore: null,
      status: 'pre',
      statusText: 'Schedule TBD',
      venue: 'United Center',
    },
    {
      id: 'fallback-cubs',
      homeTeam: 'CUBS',
      awayTeam: 'CARDINALS',
      homeScore: null,
      awayScore: null,
      status: 'pre',
      statusText: 'Schedule TBD',
      venue: 'Wrigley Field',
    },
  ]
}
