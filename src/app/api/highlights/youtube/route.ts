import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

/**
 * YouTube Game Highlights API
 *
 * POST /api/highlights/youtube
 *
 * Auto-fetches official NFL/league YouTube highlights for a specific game.
 * Uses YouTube Data API v3 to search official channels.
 *
 * Caches results in Supabase for 24 hours to minimize API calls.
 */

// Cache duration: 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000

// Official NFL YouTube channel IDs
const NFL_CHANNEL_IDS = [
  'UCDVYQ4Zhbm3S2dlz7P1GBDg', // NFL official
  'UCYzfVBuCfGz-oF3aOCGHKaQ', // NFL Films
]

// Team name variations for search
const TEAM_SEARCH_TERMS: Record<string, string[]> = {
  'CHI': ['Bears', 'Chicago Bears'],
  'GB': ['Packers', 'Green Bay Packers'],
  'MIN': ['Vikings', 'Minnesota Vikings'],
  'DET': ['Lions', 'Detroit Lions'],
  'DAL': ['Cowboys', 'Dallas Cowboys'],
  'PHI': ['Eagles', 'Philadelphia Eagles'],
  'NYG': ['Giants', 'New York Giants'],
  'WAS': ['Commanders', 'Washington Commanders'],
  'SF': ['49ers', 'San Francisco 49ers'],
  'SEA': ['Seahawks', 'Seattle Seahawks'],
  'LAR': ['Rams', 'Los Angeles Rams'],
  'ARI': ['Cardinals', 'Arizona Cardinals'],
  'TB': ['Buccaneers', 'Tampa Bay Buccaneers'],
  'NO': ['Saints', 'New Orleans Saints'],
  'ATL': ['Falcons', 'Atlanta Falcons'],
  'CAR': ['Panthers', 'Carolina Panthers'],
  'KC': ['Chiefs', 'Kansas City Chiefs'],
  'LV': ['Raiders', 'Las Vegas Raiders'],
  'LAC': ['Chargers', 'Los Angeles Chargers'],
  'DEN': ['Broncos', 'Denver Broncos'],
  'BUF': ['Bills', 'Buffalo Bills'],
  'MIA': ['Dolphins', 'Miami Dolphins'],
  'NE': ['Patriots', 'New England Patriots'],
  'NYJ': ['Jets', 'New York Jets'],
  'BAL': ['Ravens', 'Baltimore Ravens'],
  'PIT': ['Steelers', 'Pittsburgh Steelers'],
  'CLE': ['Browns', 'Cleveland Browns'],
  'CIN': ['Bengals', 'Cincinnati Bengals'],
  'HOU': ['Texans', 'Houston Texans'],
  'IND': ['Colts', 'Indianapolis Colts'],
  'JAX': ['Jaguars', 'Jacksonville Jaguars'],
  'TEN': ['Titans', 'Tennessee Titans'],
}

interface YouTubeSearchResult {
  videoId: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  channelTitle: string
  duration?: string
}

interface CachedHighlight {
  game_id: string
  videos: YouTubeSearchResult[]
  cached_at: string
}

export async function POST(request: NextRequest) {
  try {
    const { gameId, homeTeam, awayTeam, gameDate, week } = await request.json()

    if (!gameId || !homeTeam || !awayTeam) {
      return NextResponse.json(
        { error: 'Missing required fields: gameId, homeTeam, awayTeam' },
        { status: 400 }
      )
    }

    // Check cache first
    const cached = await getCachedHighlights(gameId)
    if (cached) {
      return NextResponse.json({ videos: cached.videos, cached: true })
    }

    // Fetch from YouTube API
    const videos = await fetchYouTubeHighlights(homeTeam, awayTeam, gameDate, week)

    // Cache results
    await cacheHighlights(gameId, videos)

    return NextResponse.json({ videos, cached: false })
  } catch (error) {
    console.error('YouTube highlights error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch highlights', videos: [] },
      { status: 500 }
    )
  }
}

/**
 * Check for cached highlights
 */
async function getCachedHighlights(gameId: string): Promise<CachedHighlight | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('sm_youtube_highlights')
      .select('*')
      .eq('game_id', gameId)
      .single()

    if (error || !data) return null

    // Check if cache is still valid (24 hours)
    const cachedAt = new Date(data.cached_at).getTime()
    if (Date.now() - cachedAt < CACHE_DURATION) {
      return data as CachedHighlight
    }

    return null
  } catch {
    return null
  }
}

/**
 * Cache highlights in Supabase
 */
async function cacheHighlights(gameId: string, videos: YouTubeSearchResult[]) {
  try {
    await supabaseAdmin
      .from('sm_youtube_highlights')
      .upsert({
        game_id: gameId,
        videos,
        cached_at: new Date().toISOString(),
      }, {
        onConflict: 'game_id',
      })
  } catch (error) {
    console.error('Cache error:', error)
  }
}

/**
 * Fetch highlights from YouTube Data API
 */
async function fetchYouTubeHighlights(
  homeTeam: string,
  awayTeam: string,
  gameDate?: string,
  week?: number
): Promise<YouTubeSearchResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    console.warn('YouTube API key not configured, using fallback')
    return getFallbackHighlights(homeTeam, awayTeam)
  }

  try {
    // Build search query
    const homeTerms = TEAM_SEARCH_TERMS[homeTeam] || [homeTeam]
    const awayTerms = TEAM_SEARCH_TERMS[awayTeam] || [awayTeam]

    // Search for: "Bears vs Packers highlights" or "Week 1 Bears highlights"
    const searchQueries = [
      `${homeTerms[0]} vs ${awayTerms[0]} highlights`,
      `${homeTerms[0]} ${awayTerms[0]} game highlights`,
      week ? `Week ${week} ${homeTerms[0]} highlights` : null,
    ].filter(Boolean)

    const allVideos: YouTubeSearchResult[] = []

    for (const query of searchQueries) {
      const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
      searchUrl.searchParams.set('part', 'snippet')
      searchUrl.searchParams.set('q', query!)
      searchUrl.searchParams.set('type', 'video')
      searchUrl.searchParams.set('maxResults', '5')
      searchUrl.searchParams.set('order', 'relevance')
      searchUrl.searchParams.set('channelId', NFL_CHANNEL_IDS[0]) // Official NFL
      searchUrl.searchParams.set('key', apiKey)

      // If we have a game date, search within a reasonable time window
      if (gameDate) {
        const date = new Date(gameDate)
        const publishedAfter = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const publishedBefore = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        searchUrl.searchParams.set('publishedAfter', publishedAfter)
        searchUrl.searchParams.set('publishedBefore', publishedBefore)
      }

      const response = await fetch(searchUrl.toString())

      if (!response.ok) {
        console.error('YouTube API error:', await response.text())
        continue
      }

      const data = await response.json()

      if (data.items) {
        for (const item of data.items) {
          // Avoid duplicates
          if (allVideos.some(v => v.videoId === item.id.videoId)) continue

          allVideos.push({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            publishedAt: item.snippet.publishedAt,
            channelTitle: item.snippet.channelTitle,
          })
        }
      }

      // Stop if we have enough videos
      if (allVideos.length >= 3) break
    }

    // Return top 3 most relevant
    return allVideos.slice(0, 3)
  } catch (error) {
    console.error('YouTube fetch error:', error)
    return getFallbackHighlights(homeTeam, awayTeam)
  }
}

/**
 * Fallback highlights when API unavailable
 * Uses known official NFL YouTube video IDs
 */
function getFallbackHighlights(homeTeam: string, awayTeam: string): YouTubeSearchResult[] {
  // These are real NFL official channel video IDs for Bears games
  // Updated periodically
  const BEARS_HIGHLIGHT_IDS: Record<string, { videoId: string; title: string }[]> = {
    'default': [
      { videoId: 'NqGQyMF5a_0', title: 'Bears Game Highlights' },
    ],
    'GB': [
      { videoId: 'aIkwk9p2GX8', title: 'Bears vs. Packers Highlights' },
    ],
    'MIN': [
      { videoId: 'YLWuH5x7LWE', title: 'Bears vs. Vikings Highlights' },
    ],
    'DET': [
      { videoId: '6GmUfb8ARYY', title: 'Bears vs. Lions Highlights' },
    ],
  }

  const opponent = homeTeam === 'CHI' ? awayTeam : homeTeam
  const videos = BEARS_HIGHLIGHT_IDS[opponent] || BEARS_HIGHLIGHT_IDS['default']

  return videos.map(v => ({
    videoId: v.videoId,
    title: v.title,
    description: 'Official NFL Game Highlights',
    thumbnail: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
    publishedAt: new Date().toISOString(),
    channelTitle: 'NFL',
  }))
}
