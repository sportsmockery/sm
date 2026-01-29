import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { datalabAdmin as datalabClient } from '@/lib/supabase-datalab'
import {
  getCurrentSeason,
  getAllTeamSeasonStatus,
  getSeasonStatusSummary,
  getInSeasonTeams,
} from '@/lib/season-status'

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

// Use shared utility for season calculation
function getCurrentSeasonForLeague(league: string): number {
  return getCurrentSeason(league)
}

// Team configuration for data verification
const TEAM_CONFIG: Record<string, { table: string; league: string; scoreCol: string; winCol: string; teamStatsTable: string; teamStatsColumns: string[] }> = {
  bears: { table: 'bears_games_master', league: 'NFL', scoreCol: 'bears_score', winCol: 'bears_win', teamStatsTable: 'bears_team_season_stats', teamStatsColumns: ['points_per_game', 'total_points'] },
  bulls: { table: 'bulls_games_master', league: 'NBA', scoreCol: 'bulls_score', winCol: 'bulls_win', teamStatsTable: 'bulls_team_season_stats', teamStatsColumns: ['field_goal_pct', 'three_point_pct', 'free_throw_pct', 'rebounds_per_game', 'assists_per_game'] },
  blackhawks: { table: 'blackhawks_games_master', league: 'NHL', scoreCol: 'blackhawks_score', winCol: 'blackhawks_win', teamStatsTable: 'blackhawks_team_season_stats', teamStatsColumns: ['power_play_pct', 'penalty_kill_pct', 'goals_per_game'] },
  cubs: { table: 'cubs_games_master', league: 'MLB', scoreCol: 'cubs_score', winCol: 'cubs_win', teamStatsTable: 'cubs_team_season_stats', teamStatsColumns: ['batting_average', 'era', 'ops'] },
  whitesox: { table: 'whitesox_games_master', league: 'MLB', scoreCol: 'whitesox_score', winCol: 'whitesox_win', teamStatsTable: 'whitesox_team_season_stats', teamStatsColumns: ['batting_average', 'era', 'ops'] },
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
  teamStatsPopulated: boolean
  teamStatsNullColumns: string[]
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
      const season = getCurrentSeasonForLeague(config.league)
      const verification = await verifyTeamData(teamKey, { ...config, season })
      verificationResults.push(verification)

      if (verification.dataQuality === 'error') {
        console.error(`[Sync Teams Cron] Data quality error for ${teamKey}:`, verification.issues)
      } else if (verification.dataQuality === 'warning') {
        console.warn(`[Sync Teams Cron] Data quality warning for ${teamKey}:`, verification.issues)
      } else {
        console.log(`[Sync Teams Cron] ${teamKey}: ${verification.wins}-${verification.losses} (${verification.completedGames} games)`)
      }
    }

    // Verify GM league roster & salary cap tables
    const gmDataResults: Record<string, any> = {}
    const GM_SPORTS = ['nfl', 'nba', 'nhl', 'mlb']
    for (const sport of GM_SPORTS) {
      // League roster table
      try {
        const { count, error } = await datalabClient!
          .from(`gm_${sport}_rosters`)
          .select('*', { count: 'exact', head: true })
        if (error) {
          errors.push(`gm_${sport}_rosters: ${error.message}`)
          gmDataResults[`gm_${sport}_rosters`] = { status: 'error', error: error.message }
        } else {
          const ok = (count || 0) > 0
          if (!ok) errors.push(`gm_${sport}_rosters: 0 rows`)
          gmDataResults[`gm_${sport}_rosters`] = { status: ok ? 'ok' : 'warning', rowCount: count || 0 }
        }
      } catch (e) {
        gmDataResults[`gm_${sport}_rosters`] = { status: 'error', error: String(e) }
      }

      // Salary cap table
      try {
        const { count, error } = await datalabClient!
          .from(`gm_${sport}_salary_cap`)
          .select('*', { count: 'exact', head: true })
        if (error) {
          errors.push(`gm_${sport}_salary_cap: ${error.message}`)
          gmDataResults[`gm_${sport}_salary_cap`] = { status: 'error', error: error.message }
        } else {
          const ok = (count || 0) > 0
          if (!ok) errors.push(`gm_${sport}_salary_cap: 0 rows`)
          gmDataResults[`gm_${sport}_salary_cap`] = { status: ok ? 'ok' : 'warning', rowCount: count || 0 }
        }
      } catch (e) {
        gmDataResults[`gm_${sport}_salary_cap`] = { status: 'error', error: String(e) }
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

    // Revalidate boxscore API routes for in-season teams (dynamically determined)
    const inSeasonTeams = getInSeasonTeams()
    const inSeasonBoxscorePaths = inSeasonTeams.map(t => `/api/${t.key}/boxscore`)
    for (const apiPath of inSeasonBoxscorePaths) {
      try {
        revalidatePath(apiPath, 'layout')
        revalidated.push(apiPath)
      } catch (e) {
        console.error(`[Sync Teams Cron] Failed to revalidate ${apiPath}:`, e)
        errors.push(apiPath)
      }
    }

    const duration = Date.now() - startTime
    const seasonSummary = getSeasonStatusSummary()
    const allSeasonStatuses = getAllTeamSeasonStatus()

    console.log(`[Sync Teams Cron] Hourly sync complete in ${duration}ms:`, {
      revalidatedCount: revalidated.length,
      errorsCount: errors.length,
      teamsVerified: verificationResults.length,
      inSeason: seasonSummary.inSeason,
      offseason: seasonSummary.offseason,
    })

    return NextResponse.json({
      success: true,
      type: 'hourly-sync',
      revalidatedPaths: revalidated.length,
      errors: errors.length > 0 ? errors : undefined,
      teamData: verificationResults,
      gmData: gmDataResults,
      seasonStatus: {
        inSeason: seasonSummary.inSeason,
        offseason: seasonSummary.offseason,
        draftAvailable: seasonSummary.draftAvailable,
        details: allSeasonStatuses.map(s => ({
          team: s.team,
          phase: s.seasonPhase,
          season: s.currentSeason,
          draft: s.draftAvailable,
        })),
      },
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
  config: { table: string; league: string; season: number; scoreCol: string; winCol: string; teamStatsTable: string; teamStatsColumns: string[] }
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
        teamStatsPopulated: false,
        teamStatsNullColumns: [],
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
        teamStatsPopulated: false,
        teamStatsNullColumns: [],
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

    // Check team stats table
    let teamStatsPopulated = false
    let teamStatsNullColumns: string[] = []
    try {
      const { data: teamStats, error: tsError } = await datalabClient!
        .from(config.teamStatsTable)
        .select('*')
        .eq('season', config.season)
        .limit(1)
        .single()

      if (tsError) {
        issues.push(`Team stats table error: ${tsError.message}`)
      } else if (teamStats) {
        teamStatsPopulated = true
        // Check each expected column for null values
        for (const col of config.teamStatsColumns) {
          if (teamStats[col] === null || teamStats[col] === undefined) {
            teamStatsNullColumns.push(col)
          }
        }
        if (teamStatsNullColumns.length > 0) {
          issues.push(`Team stats null columns: ${teamStatsNullColumns.join(', ')}`)
        }
      } else {
        issues.push('No team stats row for current season')
      }
    } catch {
      issues.push(`Team stats table ${config.teamStatsTable} not accessible`)
    }

    return {
      team: teamKey,
      league: config.league,
      gamesFound: games.length,
      completedGames: completedGames.length,
      wins,
      losses,
      otLosses: config.league === 'NHL' ? otLosses : undefined,
      lastGameDate,
      teamStatsPopulated,
      teamStatsNullColumns,
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
      teamStatsPopulated: false,
      teamStatsNullColumns: [],
      dataQuality: 'error',
      issues: [`Exception: ${error instanceof Error ? error.message : 'Unknown error'}`],
    }
  }
}
