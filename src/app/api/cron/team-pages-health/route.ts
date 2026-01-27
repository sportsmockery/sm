import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

// Allow longer timeout for health checks
export const maxDuration = 60
export const dynamic = 'force-dynamic'

// Base URL for health checks
const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'https://test.sportsmockery.com'

// Team pages to check
const TEAM_PAGES = [
  { team: 'chicago-bears', key: 'bears' },
  { team: 'chicago-bulls', key: 'bulls' },
  { team: 'chicago-blackhawks', key: 'blackhawks' },
  { team: 'chicago-cubs', key: 'cubs' },
  { team: 'chicago-white-sox', key: 'whitesox' },
]

const SUBPAGES = ['', '/schedule', '/scores', '/stats', '/roster', '/players']

// Correct table/column names and ESPN ID mapping documentation
// CRITICAL: Stats tables use ESPN ID in player_id column
// Players tables have ESPN ID in espn_id column (or player_id for some teams)
// JOIN PATTERN: players.espn_id = stats.player_id (NOT players.id = stats.player_id)
const AUDIT_CONFIG = {
  bears: {
    recordTable: 'bears_season_record', // NOT bears_seasons
    gamesTable: 'bears_games_master',
    rosterTable: 'bears_players',
    statsTable: 'bears_player_game_stats',
    rosterActiveColumn: 'is_active',
    espnIdColumn: 'espn_id', // Column in players table that maps to stats.player_id
    season: 2025, // NFL uses starting year
    expectedRosterRange: [53, 90], // roster + practice squad
    teamStatsTable: 'bears_team_season_stats',
    teamStatsColumns: ['points_per_game', 'total_points'],
  },
  bulls: {
    recordTable: 'bulls_seasons',
    gamesTable: 'bulls_games_master',
    rosterTable: 'bulls_players',
    statsTable: 'bulls_player_game_stats',
    rosterActiveColumn: 'is_current_bulls', // NOT is_active
    espnIdColumn: 'espn_id',
    season: 2026, // NBA uses ending year
    expectedRosterRange: [15, 20],
    teamStatsTable: 'bulls_team_season_stats',
    teamStatsColumns: ['field_goal_pct', 'three_point_pct', 'free_throw_pct', 'rebounds_per_game', 'assists_per_game'],
  },
  blackhawks: {
    recordTable: 'blackhawks_seasons',
    gamesTable: 'blackhawks_games_master',
    rosterTable: 'blackhawks_players',
    statsTable: 'blackhawks_player_game_stats',
    rosterActiveColumn: 'is_active',
    otlColumn: 'otl', // NOT ot_losses
    espnIdColumn: 'espn_id',
    season: 2026, // NHL uses ending year
    expectedRosterRange: [20, 25],
    teamStatsTable: 'blackhawks_team_season_stats',
    teamStatsColumns: ['power_play_pct', 'penalty_kill_pct', 'goals_per_game'],
  },
  cubs: {
    recordTable: 'cubs_seasons',
    gamesTable: 'cubs_games_master',
    rosterTable: 'cubs_players',
    statsTable: 'cubs_player_game_stats',
    rosterActiveColumn: 'is_active',
    espnIdColumn: 'espn_id',
    season: 2025, // MLB uses calendar year
    expectedRosterRange: [26, 45],
    teamStatsTable: 'cubs_team_season_stats',
    teamStatsColumns: ['batting_average', 'era', 'ops'],
  },
  whitesox: {
    recordTable: 'whitesox_seasons',
    gamesTable: 'whitesox_games_master',
    rosterTable: 'whitesox_players',
    statsTable: 'whitesox_player_game_stats',
    rosterActiveColumn: 'is_active',
    espnIdColumn: 'espn_id',
    season: 2025, // MLB uses calendar year
    expectedRosterRange: [26, 45],
    teamStatsTable: 'whitesox_team_season_stats',
    teamStatsColumns: ['batting_average', 'era', 'ops'],
  },
}

// Box score API config per team
const BOXSCORE_CONFIG: Record<string, { apiPath: string; gamesTable: string; season: number; scoreCol: string; teamKey: string }> = {
  bears: { apiPath: '/api/bears/boxscore', gamesTable: 'bears_games_master', season: 2025, scoreCol: 'bears_score', teamKey: 'bears' },
  bulls: { apiPath: '/api/bulls/boxscore', gamesTable: 'bulls_games_master', season: 2026, scoreCol: 'bulls_score', teamKey: 'bulls' },
  blackhawks: { apiPath: '/api/blackhawks/boxscore', gamesTable: 'blackhawks_games_master', season: 2026, scoreCol: 'blackhawks_score', teamKey: 'blackhawks' },
  cubs: { apiPath: '/api/cubs/boxscore', gamesTable: 'cubs_games_master', season: 2025, scoreCol: 'cubs_score', teamKey: 'cubs' },
  whitesox: { apiPath: '/api/whitesox/boxscore', gamesTable: 'whitesox_games_master', season: 2025, scoreCol: 'whitesox_score', teamKey: 'whitesox' },
}

interface HealthCheckResult {
  team: string
  timestamp: string
  httpChecks: { page: string; status: number; ok: boolean }[]
  dataChecks: {
    recordTableExists: boolean
    gamesCount: number
    rosterCount: number
    rosterInRange: boolean
    statsCount: number
    playersWithStats: number
    espnIdMappingOk: boolean
    teamStatsPopulated: boolean
    teamStatsNullColumns: string[]
    boxscoreApiOk: boolean
    gamesWithNullStats: number
    issues: string[]
  }
  overallStatus: 'healthy' | 'warning' | 'error'
}

interface HealthCheckLog {
  id?: number
  team: string
  check_type: string
  status: 'healthy' | 'warning' | 'error'
  details: Record<string, unknown>
  created_at?: string
}

/**
 * GET /api/cron/team-pages-health - Hourly team pages health check
 *
 * Vercel Cron: runs every hour at minute 15
 * Schedule: "15 * * * *"
 *
 * This endpoint:
 * 1. HTTP checks all team pages (200 status)
 * 2. Verifies correct table/column usage per TeamPages_Audit.md
 * 3. Checks roster counts are in expected ranges
 * 4. Logs issues to health_check_logs table
 * 5. Returns summary for monitoring
 */
export async function GET(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('[Team Pages Health] Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[Team Pages Health] Starting hourly health check...')
  const startTime = Date.now()
  const results: HealthCheckResult[] = []
  const allIssues: string[] = []

  try {
    // Run health checks for each team
    for (const { team, key } of TEAM_PAGES) {
      const result = await runTeamHealthCheck(team, key)
      results.push(result)

      if (result.overallStatus === 'error') {
        allIssues.push(`${team}: ${result.dataChecks.issues.join(', ')}`)
      }
    }

    // Log results to health_check_logs table (if it exists)
    await logHealthCheckResults(results)

    const duration = Date.now() - startTime
    const overallStatus = results.every(r => r.overallStatus === 'healthy')
      ? 'healthy'
      : results.some(r => r.overallStatus === 'error')
        ? 'error'
        : 'warning'

    console.log(`[Team Pages Health] Check complete in ${duration}ms - Status: ${overallStatus}`)

    if (allIssues.length > 0) {
      console.error('[Team Pages Health] Issues found:', allIssues)
    }

    return NextResponse.json({
      success: true,
      overallStatus,
      teamsChecked: results.length,
      issuesFound: allIssues.length,
      issues: allIssues.length > 0 ? allIssues : undefined,
      results,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[Team Pages Health] Health check failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * Run health check for a single team
 */
async function runTeamHealthCheck(team: string, key: string): Promise<HealthCheckResult> {
  const config = AUDIT_CONFIG[key as keyof typeof AUDIT_CONFIG]
  const httpChecks: { page: string; status: number; ok: boolean }[] = []
  const issues: string[] = []

  // 1. HTTP checks for all pages
  for (const subpage of SUBPAGES) {
    const url = `${BASE_URL}/${team}${subpage}`
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-store',
      })
      httpChecks.push({
        page: `/${team}${subpage}`,
        status: response.status,
        ok: response.ok,
      })
      if (!response.ok) {
        issues.push(`HTTP ${response.status} on ${subpage || '/'}`)
      }
    } catch (e) {
      httpChecks.push({
        page: `/${team}${subpage}`,
        status: 0,
        ok: false,
      })
      issues.push(`Fetch failed for ${subpage || '/'}`)
    }
  }

  // 2. Data checks
  let recordTableExists = false
  let gamesCount = 0
  let rosterCount = 0
  let statsCount = 0
  let playersWithStats = 0
  let espnIdMappingOk = false

  // Check record table exists
  try {
    const { data, error } = await datalabAdmin
      .from(config.recordTable)
      .select('*')
      .eq('season', config.season)
      .limit(1)

    recordTableExists = !error && data !== null
    if (error) {
      issues.push(`Record table error: ${error.message}`)
    }
  } catch {
    issues.push(`Record table ${config.recordTable} not accessible`)
  }

  // Check games count
  try {
    const { count, error } = await datalabAdmin
      .from(config.gamesTable)
      .select('*', { count: 'exact', head: true })
      .eq('season', config.season)

    gamesCount = count || 0
    if (error) {
      issues.push(`Games table error: ${error.message}`)
    }
  } catch {
    issues.push(`Games table ${config.gamesTable} not accessible`)
  }

  // Check roster count with correct column
  try {
    const { count, error } = await datalabAdmin
      .from(config.rosterTable)
      .select('*', { count: 'exact', head: true })
      .eq(config.rosterActiveColumn, true)

    rosterCount = count || 0
    if (error) {
      issues.push(`Roster table error: ${error.message}`)
    }
  } catch {
    issues.push(`Roster table ${config.rosterTable} not accessible`)
  }

  // Check roster count is in expected range
  const [minRoster, maxRoster] = config.expectedRosterRange
  const rosterInRange = rosterCount >= minRoster && rosterCount <= maxRoster
  if (!rosterInRange && rosterCount > 0) {
    issues.push(`Roster count ${rosterCount} outside expected range [${minRoster}-${maxRoster}]`)
  }

  // Check stats count and ESPN ID mapping
  // CRITICAL: Stats tables use ESPN ID in player_id column
  // This verifies the join between players and stats tables works correctly
  try {
    // Get stats count for season
    const { count: rawStatsCount, error: statsError } = await datalabAdmin
      .from(config.statsTable)
      .select('*', { count: 'exact', head: true })
      .eq('season', config.season)

    statsCount = rawStatsCount || 0
    if (statsError) {
      issues.push(`Stats table error: ${statsError.message}`)
    }

    // Verify ESPN ID mapping: count how many players have matching stats
    // This is the critical check that validates our join pattern works
    if (statsCount > 0) {
      // Get unique player_ids from stats table
      const { data: statsPlayerIds } = await datalabAdmin
        .from(config.statsTable)
        .select('player_id')
        .eq('season', config.season)
        .limit(1000)

      // Get ESPN IDs from players table
      const { data: playerEspnIds } = await datalabAdmin
        .from(config.rosterTable)
        .select(`${config.espnIdColumn}`)
        .eq(config.rosterActiveColumn, true)

      if (statsPlayerIds && playerEspnIds) {
        const statsIds = new Set(statsPlayerIds.map((s: any) => String(s.player_id)))
        const espnIds = new Set(playerEspnIds.map((p: any) => String(p[config.espnIdColumn])))

        // Count how many ESPN IDs from players table exist in stats table
        playersWithStats = [...espnIds].filter(id => statsIds.has(id)).length

        // ESPN ID mapping is OK if at least 50% of active players have stats
        espnIdMappingOk = rosterCount > 0 && (playersWithStats / rosterCount) >= 0.5

        if (!espnIdMappingOk && rosterCount > 0) {
          issues.push(`ESPN ID mapping issue: only ${playersWithStats}/${rosterCount} active players have matching stats`)
        }
      }
    }
  } catch (e) {
    issues.push(`Stats/ESPN ID check failed: ${e instanceof Error ? e.message : 'Unknown'}`)
  }

  // 3. Team stats table check
  let teamStatsPopulated = false
  let teamStatsNullColumns: string[] = []
  try {
    const { data: teamStats, error: tsError } = await datalabAdmin
      .from(config.teamStatsTable)
      .select('*')
      .eq('season', config.season)
      .limit(1)
      .single()

    if (tsError) {
      issues.push(`Team stats table error: ${tsError.message}`)
    } else if (teamStats) {
      teamStatsPopulated = true
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

  // 4. Box score API check - verify recent game returns player stats
  let boxscoreApiOk = false
  let gamesWithNullStats = 0
  const bsConfig = BOXSCORE_CONFIG[key]
  if (bsConfig) {
    try {
      // Get most recent completed game
      const { data: recentGame } = await datalabAdmin
        .from(bsConfig.gamesTable)
        .select('id')
        .eq('season', bsConfig.season)
        .not(bsConfig.scoreCol, 'is', null)
        .order('game_date', { ascending: false })
        .limit(1)
        .single()

      if (recentGame) {
        const bsUrl = `${BASE_URL}${bsConfig.apiPath}/${recentGame.id}`
        try {
          const bsResp = await fetch(bsUrl, { cache: 'no-store' })
          if (bsResp.ok) {
            const bsData = await bsResp.json()
            // Check that the response has player stats
            const teamData = bsData[bsConfig.teamKey] || bsData.bears || bsData.bulls || bsData.blackhawks || bsData.cubs || bsData.whitesox
            if (teamData && ((teamData.batters?.length > 0) || (teamData.pitchers?.length > 0) || (teamData.passing?.length > 0) || (teamData.stats?.length > 0) || (teamData.skaters?.length > 0))) {
              boxscoreApiOk = true
            } else {
              issues.push(`Box score API returned no player stats for game ${recentGame.id}`)
            }
          } else {
            issues.push(`Box score API returned ${bsResp.status} for game ${recentGame.id}`)
          }
        } catch {
          issues.push(`Box score API fetch failed for game ${recentGame.id}`)
        }
      }

      // Check for games with all-NULL stats (like the Bears game 432 issue)
      const { data: recentGames } = await datalabAdmin
        .from(bsConfig.gamesTable)
        .select('id')
        .eq('season', bsConfig.season)
        .not(bsConfig.scoreCol, 'is', null)
        .order('game_date', { ascending: false })
        .limit(5)

      if (recentGames) {
        for (const g of recentGames) {
          const { count } = await datalabAdmin
            .from(config.statsTable)
            .select('*', { count: 'exact', head: true })
            .eq(key === 'bears' ? 'bears_game_id' : 'game_id', g.id)

          if (!count || count === 0) {
            gamesWithNullStats++
          }
        }
        if (gamesWithNullStats > 0) {
          issues.push(`${gamesWithNullStats} recent completed games have no player stats`)
        }
      }
    } catch (e) {
      issues.push(`Box score check failed: ${e instanceof Error ? e.message : 'Unknown'}`)
    }
  }

  // Determine overall status
  let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy'
  if (issues.length > 0) {
    overallStatus = issues.some(i =>
      i.includes('HTTP 5') ||
      i.includes('not accessible') ||
      i.includes('Fetch failed')
    ) ? 'error' : 'warning'
  }

  return {
    team,
    timestamp: new Date().toISOString(),
    httpChecks,
    dataChecks: {
      recordTableExists,
      gamesCount,
      rosterCount,
      rosterInRange,
      statsCount,
      playersWithStats,
      espnIdMappingOk,
      teamStatsPopulated,
      teamStatsNullColumns,
      boxscoreApiOk,
      gamesWithNullStats,
      issues,
    },
    overallStatus,
  }
}

/**
 * Log health check results to database
 */
async function logHealthCheckResults(results: HealthCheckResult[]): Promise<void> {
  try {
    const logs: Omit<HealthCheckLog, 'id' | 'created_at'>[] = results.map(r => ({
      team: r.team,
      check_type: 'hourly_health',
      status: r.overallStatus,
      details: {
        httpChecks: r.httpChecks,
        dataChecks: r.dataChecks,
        timestamp: r.timestamp,
      },
    }))

    // Try to insert into health_check_logs table (may not exist yet)
    const { error } = await datalabAdmin
      .from('health_check_logs')
      .insert(logs)

    if (error) {
      // Table might not exist, log but don't fail
      console.log('[Team Pages Health] Could not log to health_check_logs:', error.message)
    }
  } catch (e) {
    console.log('[Team Pages Health] Logging skipped:', e instanceof Error ? e.message : 'Unknown')
  }
}
