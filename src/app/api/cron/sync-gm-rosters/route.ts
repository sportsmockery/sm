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

  // Check league roster tables
  const LEAGUE_TABLES = [
    { table: 'gm_nfl_rosters', sport: 'nfl' },
    { table: 'gm_nba_rosters', sport: 'nba' },
    { table: 'gm_nhl_rosters', sport: 'nhl' },
    { table: 'gm_mlb_rosters', sport: 'mlb' },
  ]
  for (const lt of LEAGUE_TABLES) {
    try {
      const { count, error } = await datalabAdmin
        .from(lt.table)
        .select('*', { count: 'exact', head: true })
      if (error) {
        issues.push(`${lt.table}: query failed — ${error.message}`)
        results[lt.table] = { status: 'error', error: error.message }
      } else {
        const ok = (count || 0) > 0
        if (!ok) issues.push(`${lt.table}: 0 rows`)
        results[lt.table] = { status: ok ? 'ok' : 'warning', rowCount: count || 0 }
      }
    } catch (e) {
      issues.push(`${lt.table}: ${e instanceof Error ? e.message : String(e)}`)
      results[lt.table] = { status: 'error', error: String(e) }
    }
  }

  // Check player value tiers table
  try {
    const { count, error } = await datalabAdmin
      .from('gm_player_value_tiers')
      .select('*', { count: 'exact', head: true })
    if (error) {
      issues.push(`gm_player_value_tiers: query failed — ${error.message}`)
      results['gm_player_value_tiers'] = { status: 'warn', error: error.message }
    } else {
      const c = count || 0
      if (c === 0) issues.push('gm_player_value_tiers: 0 rows — DataLab needs to populate')
      results['gm_player_value_tiers'] = { status: c > 0 ? 'ok' : 'warning', rowCount: c }
    }

    // Check freshness
    if (!error) {
      const { data: latest } = await datalabAdmin
        .from('gm_player_value_tiers')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()
      if (latest) {
        const ageDays = Math.round((Date.now() - new Date(latest.updated_at).getTime()) / (1000 * 60 * 60 * 24))
        if (ageDays > 7) issues.push(`gm_player_value_tiers: stale — last updated ${ageDays} days ago`)
        results['gm_player_value_tiers_freshness'] = { status: ageDays <= 7 ? 'ok' : 'warning', ageDays }
      }
    }
  } catch (e) {
    // Table may not exist yet — not a hard error
    results['gm_player_value_tiers'] = { status: 'warning', note: 'Table not available yet' }
  }

  // Check grading examples table
  try {
    const { count, error } = await datalabAdmin
      .from('gm_grading_examples')
      .select('*', { count: 'exact', head: true })
    if (error) {
      results['gm_grading_examples'] = { status: 'warn', error: error.message }
    } else {
      results['gm_grading_examples'] = { status: (count || 0) > 0 ? 'ok' : 'warning', rowCount: count || 0 }
    }
  } catch {
    results['gm_grading_examples'] = { status: 'warning', note: 'Table not available yet' }
  }

  // Check salary cap tables
  const CAP_TABLES = [
    { table: 'gm_nfl_salary_cap', sport: 'nfl' },
    { table: 'gm_nba_salary_cap', sport: 'nba' },
    { table: 'gm_nhl_salary_cap', sport: 'nhl' },
    { table: 'gm_mlb_salary_cap', sport: 'mlb' },
  ]
  for (const ct of CAP_TABLES) {
    try {
      const { count, error } = await datalabAdmin
        .from(ct.table)
        .select('*', { count: 'exact', head: true })
      if (error) {
        issues.push(`${ct.table}: query failed — ${error.message}`)
        results[ct.table] = { status: 'error', error: error.message }
      } else {
        const ok = (count || 0) > 0
        if (!ok) issues.push(`${ct.table}: 0 rows`)
        results[ct.table] = { status: ok ? 'ok' : 'warning', rowCount: count || 0 }
      }
    } catch (e) {
      issues.push(`${ct.table}: ${e instanceof Error ? e.message : String(e)}`)
      results[ct.table] = { status: 'error', error: String(e) }
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
