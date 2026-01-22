import { NextRequest, NextResponse } from 'next/server'
import { datalabClient } from '@/lib/supabase-datalab'
import { revalidatePath } from 'next/cache'

// Allow sufficient timeout for live sync
export const maxDuration = 30

// Vercel cron requires GET method
export const dynamic = 'force-dynamic'

interface LiveGameCheck {
  team: string
  tableName: string
  teamScoreCol: string
  oppScoreCol: string
  isHomeCol: string
  pathPrefix: string
}

const TEAM_CONFIGS: LiveGameCheck[] = [
  {
    team: 'bears',
    tableName: 'bears_games_master',
    teamScoreCol: 'bears_score',
    oppScoreCol: 'opponent_score',
    isHomeCol: 'is_bears_home',
    pathPrefix: '/chicago-bears',
  },
  {
    team: 'bulls',
    tableName: 'bulls_games_master',
    teamScoreCol: 'bulls_score',
    oppScoreCol: 'opponent_score',
    isHomeCol: 'is_bulls_home',
    pathPrefix: '/chicago-bulls',
  },
  {
    team: 'blackhawks',
    tableName: 'blackhawks_games_master',
    teamScoreCol: 'blackhawks_score',
    oppScoreCol: 'opponent_score',
    isHomeCol: 'is_blackhawks_home',
    pathPrefix: '/chicago-blackhawks',
  },
  {
    team: 'cubs',
    tableName: 'cubs_games_master',
    teamScoreCol: 'cubs_score',
    oppScoreCol: 'opponent_score',
    isHomeCol: 'is_cubs_home',
    pathPrefix: '/chicago-cubs',
  },
  {
    team: 'whitesox',
    tableName: 'whitesox_games_master',
    teamScoreCol: 'whitesox_score',
    oppScoreCol: 'opponent_score',
    isHomeCol: 'is_whitesox_home',
    pathPrefix: '/chicago-white-sox',
  },
]

/**
 * GET /api/cron/live-games - Check all Chicago teams for live games
 *
 * Vercel Cron: runs every minute
 * Schedule: "* * * * *"
 *
 * This endpoint checks if any Chicago team has a live game.
 * When a live game is found, it triggers revalidation of the
 * relevant team pages so users see updated scores.
 */
export async function GET(request: NextRequest) {
  // Verify this is a Vercel cron request (optional)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('[Live Games Cron] Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const results: { team: string; hasLiveGame: boolean; revalidated: boolean }[] = []

  try {
    const today = new Date().toISOString().split('T')[0]

    for (const config of TEAM_CONFIGS) {
      const liveCheck = await checkForLiveGame(config, today)
      results.push({
        team: config.team,
        hasLiveGame: liveCheck.isLive,
        revalidated: liveCheck.revalidated,
      })
    }

    const liveGames = results.filter(r => r.hasLiveGame)
    const duration = Date.now() - startTime

    console.log(`[Live Games Cron] Checked all teams in ${duration}ms:`, {
      liveGamesFound: liveGames.length,
      teams: liveGames.map(g => g.team),
    })

    return NextResponse.json({
      success: true,
      type: 'live-games',
      liveGamesFound: liveGames.length,
      results,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[Live Games Cron] Error:', error)

    return NextResponse.json(
      {
        success: false,
        type: 'live-games',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

async function checkForLiveGame(
  config: LiveGameCheck,
  today: string
): Promise<{ isLive: boolean; revalidated: boolean }> {
  if (!datalabClient) {
    return { isLive: false, revalidated: false }
  }

  try {
    // Check for games today
    const { data: todayGames } = await datalabClient
      .from(config.tableName)
      .select('*')
      .eq('game_date', today)
      .limit(1)

    if (!todayGames || todayGames.length === 0) {
      return { isLive: false, revalidated: false }
    }

    const game = todayGames[0]

    // Check if game is in progress (has scores but might not be final)
    const teamScore = Number(game[config.teamScoreCol]) || 0
    const oppScore = Number(game[config.oppScoreCol]) || 0
    const hasScores = teamScore > 0 || oppScore > 0

    // For a live game, check if we're within the game window
    if (!hasScores) {
      const isInWindow = await isWithinGameWindow(config, today)
      if (isInWindow) {
        // Game might be about to start or just started
        return { isLive: true, revalidated: false }
      }
      return { isLive: false, revalidated: false }
    }

    // Game has scores - assume it's live or recently finished
    // Trigger revalidation of team pages
    try {
      revalidatePath(config.pathPrefix)
      revalidatePath(`${config.pathPrefix}/schedule`)
      revalidatePath(`${config.pathPrefix}/scores`)
    } catch (e) {
      // Revalidation might fail in some environments
      console.log(`[Live Games] Revalidation for ${config.team} skipped`)
    }

    return { isLive: true, revalidated: true }
  } catch (error) {
    console.error(`[Live Games] Error checking ${config.team}:`, error)
    return { isLive: false, revalidated: false }
  }
}

async function isWithinGameWindow(config: LiveGameCheck, today: string): Promise<boolean> {
  if (!datalabClient) return false

  try {
    const { data: games } = await datalabClient
      .from(config.tableName)
      .select('game_time')
      .eq('game_date', today)
      .limit(1)

    if (!games || games.length === 0 || !games[0].game_time) {
      // No time specified, assume we should check on game day
      return true
    }

    const now = new Date()
    const [hours, minutes] = games[0].game_time.split(':').map(Number)
    const gameStart = new Date(today)
    gameStart.setHours(hours, minutes, 0, 0)

    // Check if we're within 1 hour before to 4 hours after kickoff
    const windowStart = new Date(gameStart.getTime() - 60 * 60 * 1000)
    const windowEnd = new Date(gameStart.getTime() + 4 * 60 * 60 * 1000)

    return now >= windowStart && now <= windowEnd
  } catch {
    return true // On error, be safe and check
  }
}
