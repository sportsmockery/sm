import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// YouTube Data API - we'll search for videos from specific channels
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

interface YouTubeVideo {
  videoId: string
  title: string
  description: string
  thumbnail: string
  publishedAt: string
  channelTitle: string
  channelId: string
}

interface RequestBody {
  gameId: string
  homeTeam: string
  awayTeam: string
  gameDate: string
  week: number
  channels: string[]
  sport?: string
}

// Team name mappings for search queries
const TEAM_SEARCH_TERMS: Record<string, string[]> = {
  CHI: ['Bears', 'Chicago Bears'],
  GB: ['Packers', 'Green Bay'],
  DET: ['Lions', 'Detroit Lions'],
  MIN: ['Vikings', 'Minnesota Vikings'],
  // NBA
  bulls: ['Bulls', 'Chicago Bulls'],
  // NHL
  blackhawks: ['Blackhawks', 'Chicago Blackhawks', 'Hawks'],
  // MLB
  cubs: ['Cubs', 'Chicago Cubs'],
  whitesox: ['White Sox', 'Chicago White Sox', 'Sox'],
}

/**
 * POST /api/highlights/chicago-channels
 * Fetches videos from Chicago sports content creators
 */
export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()
    const { homeTeam, awayTeam, gameDate, week, channels, sport } = body

    // If no API key, return empty (component will show channel links)
    if (!YOUTUBE_API_KEY) {
      console.log('[chicago-channels] No YouTube API key configured')
      return NextResponse.json({ videos: [] })
    }

    // Build search query based on teams and date
    const gameDateTime = new Date(gameDate)
    const searchTerms = []

    // Add team names
    if (homeTeam === 'CHI' || awayTeam === 'CHI') {
      searchTerms.push('Bears')
    }
    const oppTeam = homeTeam === 'CHI' ? awayTeam : homeTeam
    const oppTerms = TEAM_SEARCH_TERMS[oppTeam]
    if (oppTerms) {
      searchTerms.push(oppTerms[0])
    }

    // Add week/game context
    if (week) {
      searchTerms.push(`Week ${week}`)
    }

    const searchQuery = searchTerms.join(' ')

    // Search each channel for relevant videos
    const allVideos: YouTubeVideo[] = []

    for (const channelId of channels.slice(0, 4)) { // Limit to 4 channels to save API quota
      try {
        const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
        searchUrl.searchParams.set('part', 'snippet')
        searchUrl.searchParams.set('channelId', channelId)
        searchUrl.searchParams.set('q', searchQuery)
        searchUrl.searchParams.set('type', 'video')
        searchUrl.searchParams.set('maxResults', '3')
        searchUrl.searchParams.set('order', 'date')
        searchUrl.searchParams.set('key', YOUTUBE_API_KEY)

        // Search for videos published around the game date (within 7 days after)
        const publishedAfter = new Date(gameDateTime)
        publishedAfter.setDate(publishedAfter.getDate() - 1)
        const publishedBefore = new Date(gameDateTime)
        publishedBefore.setDate(publishedBefore.getDate() + 7)

        searchUrl.searchParams.set('publishedAfter', publishedAfter.toISOString())
        searchUrl.searchParams.set('publishedBefore', publishedBefore.toISOString())

        const res = await fetch(searchUrl.toString())

        if (!res.ok) {
          console.error(`[chicago-channels] YouTube API error for channel ${channelId}:`, res.status)
          continue
        }

        const data = await res.json()

        if (data.items && data.items.length > 0) {
          for (const item of data.items) {
            allVideos.push({
              videoId: item.id.videoId,
              title: item.snippet.title,
              description: item.snippet.description,
              thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
              publishedAt: item.snippet.publishedAt,
              channelTitle: item.snippet.channelTitle,
              channelId: item.snippet.channelId,
            })
          }
        }
      } catch (err) {
        console.error(`[chicago-channels] Error fetching from channel ${channelId}:`, err)
      }
    }

    // Sort by publish date (newest first) and dedupe
    const uniqueVideos = allVideos
      .filter((v, i, arr) => arr.findIndex(x => x.videoId === v.videoId) === i)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 8) // Limit to 8 videos

    return NextResponse.json({ videos: uniqueVideos })
  } catch (error) {
    console.error('[chicago-channels] Error:', error)
    return NextResponse.json({ videos: [], error: 'Failed to fetch videos' })
  }
}
