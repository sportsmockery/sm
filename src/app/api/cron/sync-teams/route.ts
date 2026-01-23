import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { datalabClient } from '@/lib/supabase-datalab'

// Allow longer timeout for sync operations
export const maxDuration = 60

// Vercel cron requires GET method
export const dynamic = 'force-dynamic'

const TEAM_PATHS = [
  '/chicago-bears',
  '/chicago-bulls',
  '/chicago-blackhawks',
  '/chicago-cubs',
  '/chicago-white-sox',
]

const SUBPATHS = ['', '/schedule', '/scores', '/stats', '/roster', '/players']

// Team configuration for data verification
const TEAM_CONFIG: Record<string, { table: string; league: string; season: number; scoreCol: string; winCol: string }> = {
  bears: { table: 'bears_games_master', league: 'NFL', season: 2025, scoreCol: 'bears_score', winCol: 'bears_win' },
  bulls: { table: 'bulls_games_master', league: 'NBA', season: 2025, scoreCol: 'bulls_score', winCol: 'bulls_win' },
  blackhawks: { table: 'blackhawks_games_master', league: 'NHL', season: 2025, scoreCol: 'blackhawks_score', winCol: 'blackhawks_win' },
  cubs: { table: 'cubs_games_master', league: 'MLB', season: 2025, scoreCol: 'cubs_score', winCol: 'cubs_win' },
  whitesox: { table: 'whitesox_games_master', league: 'MLB', season: 2025, scoreCol: 'whitesox_score', winCol: 'whitesox_win' },
}

interface TeamDataVerification {
  team: string
  league: string
  gamesFound: number
  completedGames: number
  wins: number
  losses: number
  otLosses?: number
  lastGameDate: string | null
  dataQuality: 'good' | 'warning' | 'error'
  issues: string[]
}

/**
 * GET /api/cron/sync-teams - Hourly team data sync
 *
 * Vercel Cron: runs every hour at minute 0
 * Schedule: "0 * * * *"
 *
 * This endpoint:
 * 1. Verifies data exists in DataLab for each team
 * 2. Checks data quality (dates, scores, etc.)
 * 3. Logs any discrepancies
 * 4. Revalidates all team page paths
 */
export async function GET(request: NextRequest) {
  // Verify this is a Vercel cron request (optional)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('[Sync Teams Cron] Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[Sync Teams Cron] Starting hourly team data sync...')
  const startTime = Date.now()
  const revalidated: string[] = []
  const errors: string[] = []
  const verificationResults: TeamDataVerification[] = []

  try {
    // Verify DataLab connection is working
    if (!datalabClient) {
      throw new Error('DataLab client not configured')
    }

    // Verify data for each team
    for (const [teamKey, config] of Object.entries(TEAM_CONFIG)) {
      const verification = await verifyTeamData(teamKey, config)
      verificationResults.push(verification)

      if (verification.dataQuality === 'error') {
        console.error(`[Sync Teams Cron] Data quality error for ${teamKey}:`, verification.issues)
      } else if (verification.dataQuality === 'warning') {
        console.warn(`[Sync Teams Cron] Data quality warning for ${teamKey}:`, verification.issues)
      } else {
        console.log(`[Sync Teams Cron] ${teamKey}: ${verification.wins}-${verification.losses} (${verification.completedGames} games)`)
      }
    }

    // Revalidate all team pages
    for (const teamPath of TEAM_PATHS) {
      for (const subpath of SUBPATHS) {
        const fullPath = `${teamPath}${subpath}`
        try {
          revalidatePath(fullPath)
          revalidated.push(fullPath)
        } catch (e) {
          console.error(`[Sync Teams Cron] Failed to revalidate ${fullPath}:`, e)
          errors.push(fullPath)
        }
      }
    }

    const duration = Date.now() - startTime

    console.log(`[Sync Teams Cron] Hourly sync complete in ${duration}ms:`, {
      revalidatedCount: revalidated.length,
      errorsCount: errors.length,
      teamsVerified: verificationResults.length,
    })

    return NextResponse.json({
      success: true,
      type: 'hourly-sync',
      revalidatedPaths: revalidated.length,
      errors: errors.length > 0 ? errors : undefined,
      teamData: verificationResults,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[Sync Teams Cron] Hourly sync failed:', error)

    return NextResponse.json(
      {
        success: false,
        type: 'hourly-sync',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * Verify data exists and is valid for a team
 */
async function verifyTeamData(
  teamKey: string,
  config: { table: string; league: string; season: number; scoreCol: string; winCol: string }
): Promise<TeamDataVerification> {
  const issues: string[] = []

  try {
    // Fetch games for current season - select all columns to avoid template string issues
    const { data: games, error } = await datalabClient!
      .from(config.table)
      .select('*')
      .eq('season', config.season)
      .in('game_type', ['regular', 'postseason'])
      .order('game_date', { ascending: false })

    if (error) {
      return {
        team: teamKey,
        league: config.league,
        gamesFound: 0,
        completedGames: 0,
        wins: 0,
        losses: 0,
        lastGameDate: null,
        dataQuality: 'error',
        issues: [`Failed to fetch data: ${error.message}`],
      }
    }

    if (!games || games.length === 0) {
      return {
        team: teamKey,
        league: config.league,
        gamesFound: 0,
        completedGames: 0,
        wins: 0,
        losses: 0,
        lastGameDate: null,
        dataQuality: 'warning',
        issues: ['No games found for current season'],
      }
    }

    // Separate completed games (have scores)
    const completedGames = (games as Record<string, unknown>[]).filter((g) =>
      g[config.scoreCol] !== null && g.opponent_score !== null
    )

    // Count wins/losses
    let wins = 0
    let losses = 0
    let otLosses = 0

    completedGames.forEach((g) => {
      if (g[config.winCol] === true) {
        wins++
      } else if (g[config.winCol] === false) {
        // NHL: Check for OT/SO loss
        if (config.league === 'NHL' && (g.overtime || g.shootout)) {
          otLosses++
        } else {
          losses++
        }
      }
    })

    // Data quality checks
    if (completedGames.length === 0 && games.length > 0) {
      issues.push('Games scheduled but none completed')
    }

    // Check for missing scores in past games
    const today = new Date().toISOString().split('T')[0]
    const pastGamesWithoutScores = (games as Record<string, unknown>[]).filter((g) =>
      (g.game_date as string) < today && g[config.scoreCol] === null
    )
    if (pastGamesWithoutScores.length > 0) {
      issues.push(`${pastGamesWithoutScores.length} past games missing scores`)
    }

    // Get last game date
    const lastGameDate = completedGames.length > 0 ? completedGames[0].game_date as string : null

    return {
      team: teamKey,
      league: config.league,
      gamesFound: games.length,
      completedGames: completedGames.length,
      wins,
      losses,
      otLosses: config.league === 'NHL' ? otLosses : undefined,
      lastGameDate,
      dataQuality: issues.length > 0 ? 'warning' : 'good',
      issues,
    }
  } catch (error) {
    return {
      team: teamKey,
      league: config.league,
      gamesFound: 0,
      completedGames: 0,
      wins: 0,
      losses: 0,
      lastGameDate: null,
      dataQuality: 'error',
      issues: [`Exception: ${error instanceof Error ? error.message : 'Unknown error'}`],
    }
  }
}
