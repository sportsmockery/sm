import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const TEAM_CONFIG: Record<string, {
  table: string
  activeCol: string
  sport: string
  minRoster: number
  maxRoster: number
  seasonValue: number
  statsTable: string
}> = {
  bears: { table: 'bears_players', activeCol: 'is_active', sport: 'nfl', minRoster: 53, maxRoster: 90, seasonValue: 2025, statsTable: 'bears_player_game_stats' },
  bulls: { table: 'bulls_players', activeCol: 'is_current_bulls', sport: 'nba', minRoster: 15, maxRoster: 20, seasonValue: 2026, statsTable: 'bulls_player_game_stats' },
  blackhawks: { table: 'blackhawks_players', activeCol: 'is_active', sport: 'nhl', minRoster: 20, maxRoster: 25, seasonValue: 2026, statsTable: 'blackhawks_player_game_stats' },
  cubs: { table: 'cubs_players', activeCol: 'is_active', sport: 'mlb', minRoster: 26, maxRoster: 45, seasonValue: 2025, statsTable: 'cubs_player_game_stats' },
  whitesox: { table: 'whitesox_players', activeCol: 'is_active', sport: 'mlb', minRoster: 26, maxRoster: 45, seasonValue: 2025, statsTable: 'whitesox_player_game_stats' },
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[GM Roster Sync] Starting...')
  const startTime = Date.now()
  const results: Record<string, any> = {}
  const issues: string[] = []

  for (const [teamKey, config] of Object.entries(TEAM_CONFIG)) {
    try {
      // Check active roster count
      const { count: rosterCount, error: rosterError } = await datalabAdmin
        .from(config.table)
        .select('*', { count: 'exact', head: true })
        .eq(config.activeCol, true)

      if (rosterError) {
        issues.push(`${teamKey}: roster query failed — ${rosterError.message}`)
        results[teamKey] = { status: 'error', error: rosterError.message }
        continue
      }

      const count = rosterCount || 0
      const inRange = count >= config.minRoster && count <= config.maxRoster

      // Check stats count for current season
      const { count: statsCount, error: statsError } = await datalabAdmin
        .from(config.statsTable)
        .select('*', { count: 'exact', head: true })
        .eq('season', config.seasonValue)

      if (statsError) {
        issues.push(`${teamKey}: stats query failed — ${statsError.message}`)
      }

      if (!inRange) {
        issues.push(`${teamKey}: roster count ${count} outside expected range ${config.minRoster}-${config.maxRoster}`)
      }

      results[teamKey] = {
        status: inRange ? 'ok' : 'warning',
        rosterCount: count,
        expectedRange: `${config.minRoster}-${config.maxRoster}`,
        inRange,
        statsCount: statsCount || 0,
        season: config.seasonValue,
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      issues.push(`${teamKey}: unexpected error — ${msg}`)
      results[teamKey] = { status: 'error', error: msg }
    }
  }

  const duration = Date.now() - startTime
  const hasErrors = issues.length > 0

  // Log results to gm_errors
  try {
    await datalabAdmin.from('gm_errors').insert({
      source: 'cron',
      error_type: hasErrors ? 'sync_error' : 'sync_result',
      error_message: hasErrors
        ? `Sync completed with ${issues.length} issue(s): ${issues.join('; ')}`
        : `All 5 teams synced successfully in ${duration}ms`,
      route: '/api/cron/sync-gm-rosters',
      metadata: { results, issues, duration_ms: duration },
    })
  } catch (e) {
    console.error('[GM Roster Sync] Failed to log results:', e)
  }

  console.log(`[GM Roster Sync] Completed in ${duration}ms — ${issues.length} issues`)

  return NextResponse.json({
    success: !hasErrors,
    duration: `${duration}ms`,
    issues,
    results,
    timestamp: new Date().toISOString(),
  })
}
