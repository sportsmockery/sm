import { NextRequest, NextResponse } from 'next/server'
import { refreshLiveGamesCache, liveGamesCache } from '@/lib/live-games-cache'
import { revalidatePath } from 'next/cache'

// Allow sufficient timeout for live sync
export const maxDuration = 30

// Vercel cron requires GET method
export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/live-games
 *
 * Cron job that runs every 10 seconds to fetch live game data from Datalab.
 * This is the ONLY place that talks to Datalab's /live/games endpoint.
 * All UI components consume /api/live-games which reads from the cache.
 *
 * Vercel Cron Schedule: Every 10 seconds is not supported by Vercel cron.
 * For production, you would use:
 *   - A Vercel Edge Function with setInterval
 *   - An external scheduler (e.g., Upstash QStash, AWS EventBridge)
 *   - Vercel cron at "* * * * *" (every minute) with multiple internal fetches
 *
 * For development/testing, this can be called manually or via external trigger.
 */
export async function GET(request: NextRequest) {
  // Verify this is a Vercel cron request or has proper auth
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Allow requests from localhost/internal or with valid auth
  const isInternal = request.headers.get('x-internal-request') === 'true'

  if (cronSecret && !isInternal && authHeader !== `Bearer ${cronSecret}`) {
    console.log('[Live Games Cron] Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()

  try {
    // Fetch from Datalab and update cache
    const result = await refreshLiveGamesCache()

    if (!result.success) {
      console.error('[Live Games Cron] Failed to refresh cache:', result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          duration: `${Date.now() - startTime}ms`,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    // Get the current live games for logging
    const liveGames = liveGamesCache.getChicagoGames()
    const inProgressCount = liveGames.length

    // Revalidate pages if there are live games
    if (inProgressCount > 0) {
      const teams = new Set(liveGames.map(g =>
        g.home_team_id.includes('bear') || g.away_team_id.includes('bear') ? 'bears' :
        g.home_team_id.includes('bull') || g.away_team_id.includes('bull') ? 'bulls' :
        g.home_team_id.includes('cub') || g.away_team_id.includes('cub') ? 'cubs' :
        g.home_team_id.includes('sox') || g.away_team_id.includes('sox') ? 'whitesox' :
        g.home_team_id.includes('hawk') || g.away_team_id.includes('hawk') ? 'blackhawks' :
        null
      ).filter(Boolean))

      // Revalidate relevant team pages
      for (const team of teams) {
        try {
          const prefix = team === 'whitesox' ? '/chicago-white-sox' : `/chicago-${team}`
          revalidatePath(prefix)
          revalidatePath(`${prefix}/scores`)
        } catch (e) {
          // Revalidation might fail in some environments
          console.log(`[Live Games Cron] Revalidation for ${team} skipped`)
        }
      }
    }

    const duration = Date.now() - startTime

    console.log(`[Live Games Cron] Updated cache in ${duration}ms:`, {
      totalGames: result.gamesCount,
      inProgressChicago: inProgressCount,
      teams: liveGames.map(g => `${g.home_team_abbr} vs ${g.away_team_abbr}`),
    })

    return NextResponse.json({
      success: true,
      type: 'live-games-datalab',
      total_games: result.gamesCount,
      chicago_games: inProgressCount,
      games: liveGames.map(g => ({
        game_id: g.game_id,
        sport: g.sport,
        matchup: `${g.home_team_abbr} ${g.home_score} - ${g.away_score} ${g.away_team_abbr}`,
        status: g.status,
        period_label: g.period_label,
        clock: g.clock,
      })),
      cache_age_seconds: liveGamesCache.getCacheAge(),
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[Live Games Cron] Error:', error)

    return NextResponse.json(
      {
        success: false,
        type: 'live-games-datalab',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cron/live-games
 *
 * Manual trigger for the cron job (useful for testing).
 */
export async function POST(request: NextRequest) {
  // Add internal request header and forward to GET
  const url = new URL(request.url)
  const internalRequest = new Request(url, {
    method: 'GET',
    headers: {
      ...Object.fromEntries(request.headers),
      'x-internal-request': 'true',
    },
  })

  return GET(internalRequest as NextRequest)
}
