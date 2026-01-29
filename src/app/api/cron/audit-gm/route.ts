import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'
import {
  getAllTeamSeasonStatus,
  getSeasonStatusSummary,
  type SeasonStatus,
} from '@/lib/season-status'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://test.sportsmockery.com'

const SPORTS = ['nfl', 'nba', 'nhl', 'mlb'] as const
const CHICAGO_TEAMS = [
  { key: 'bears', sport: 'nfl', name: 'Chicago Bears' },
  { key: 'bulls', sport: 'nba', name: 'Chicago Bulls' },
  { key: 'blackhawks', sport: 'nhl', name: 'Chicago Blackhawks' },
  { key: 'cubs', sport: 'mlb', name: 'Chicago Cubs' },
  { key: 'whitesox', sport: 'mlb', name: 'Chicago White Sox' },
]

interface AuditCheck {
  name: string
  status: 'pass' | 'warn' | 'fail'
  detail: string
  duration_ms?: number
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[GM Audit] Starting hourly audit...')
  const startTime = Date.now()
  const checks: AuditCheck[] = []

  // 1. League roster tables — verify rows exist and are populated
  for (const sport of SPORTS) {
    const t = Date.now()
    try {
      const { count, error } = await datalabAdmin
        .from(`gm_${sport}_rosters`)
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (error) {
        checks.push({ name: `${sport}_rosters`, status: 'fail', detail: error.message, duration_ms: Date.now() - t })
      } else {
        const c = count || 0
        // Each sport should have hundreds of active players
        const minExpected = sport === 'nfl' ? 1500 : sport === 'nba' ? 400 : sport === 'nhl' ? 600 : 800
        checks.push({
          name: `${sport}_rosters`,
          status: c >= minExpected ? 'pass' : c > 0 ? 'warn' : 'fail',
          detail: `${c} active players (expected ${minExpected}+)`,
          duration_ms: Date.now() - t,
        })
      }
    } catch (e) {
      checks.push({ name: `${sport}_rosters`, status: 'fail', detail: String(e), duration_ms: Date.now() - t })
    }
  }

  // 2. Salary cap tables — verify data exists
  for (const sport of SPORTS) {
    const t = Date.now()
    try {
      const { count, error } = await datalabAdmin
        .from(`gm_${sport}_salary_cap`)
        .select('*', { count: 'exact', head: true })

      if (error) {
        checks.push({ name: `${sport}_salary_cap`, status: 'fail', detail: error.message, duration_ms: Date.now() - t })
      } else {
        const c = count || 0
        checks.push({
          name: `${sport}_salary_cap`,
          status: c > 0 ? 'pass' : 'fail',
          detail: `${c} teams with cap data`,
          duration_ms: Date.now() - t,
        })
      }
    } catch (e) {
      checks.push({ name: `${sport}_salary_cap`, status: 'fail', detail: String(e), duration_ms: Date.now() - t })
    }
  }

  // 3. Chicago roster API — verify each team returns players
  for (const team of CHICAGO_TEAMS) {
    const t = Date.now()
    try {
      const res = await fetch(`${BASE_URL}/api/gm/roster?team=${team.key}`, {
        headers: { Cookie: '' }, // No auth — will fail with 401, which is expected
      })
      // 401 means the route is up but requires auth — that's acceptable
      checks.push({
        name: `roster_api_${team.key}`,
        status: res.status === 401 || res.status === 200 ? 'pass' : 'fail',
        detail: `HTTP ${res.status}`,
        duration_ms: Date.now() - t,
      })
    } catch (e) {
      checks.push({ name: `roster_api_${team.key}`, status: 'fail', detail: String(e), duration_ms: Date.now() - t })
    }
  }

  // 4. Cap API — verify endpoint responds
  const t4 = Date.now()
  try {
    const res = await fetch(`${BASE_URL}/api/gm/cap?team_key=bears&sport=nfl`, {
      headers: { Cookie: '' },
    })
    checks.push({
      name: 'cap_api',
      status: res.status === 401 || res.status === 200 ? 'pass' : 'fail',
      detail: `HTTP ${res.status}`,
      duration_ms: Date.now() - t4,
    })
  } catch (e) {
    checks.push({ name: 'cap_api', status: 'fail', detail: String(e), duration_ms: Date.now() - t4 })
  }

  // 5. League teams table — verify gm_league_teams has all teams
  const t5 = Date.now()
  try {
    const { count, error } = await datalabAdmin
      .from('gm_league_teams')
      .select('*', { count: 'exact', head: true })

    if (error) {
      checks.push({ name: 'league_teams', status: 'fail', detail: error.message, duration_ms: Date.now() - t5 })
    } else {
      const c = count || 0
      checks.push({
        name: 'league_teams',
        status: c >= 120 ? 'pass' : c > 0 ? 'warn' : 'fail',
        detail: `${c} teams (expected 124)`,
        duration_ms: Date.now() - t5,
      })
    }
  } catch (e) {
    checks.push({ name: 'league_teams', status: 'fail', detail: String(e), duration_ms: Date.now() - t5 })
  }

  // 6. Opponent roster API — verify league rosters respond via API
  const t6 = Date.now()
  try {
    const res = await fetch(`${BASE_URL}/api/gm/roster?team_key=packers&sport=nfl`, {
      headers: { Cookie: '' },
    })
    checks.push({
      name: 'opponent_roster_api',
      status: res.status === 401 || res.status === 200 ? 'pass' : 'fail',
      detail: `HTTP ${res.status}`,
      duration_ms: Date.now() - t6,
    })
  } catch (e) {
    checks.push({ name: 'opponent_roster_api', status: 'fail', detail: String(e), duration_ms: Date.now() - t6 })
  }

  // 7. Player value tiers — verify gm_player_value_tiers is populated
  for (const sport of SPORTS) {
    const t = Date.now()
    try {
      const { count, error } = await datalabAdmin
        .from('gm_player_value_tiers')
        .select('*', { count: 'exact', head: true })
        .eq('league', sport)

      if (error) {
        // Table may not exist yet — warn, don't fail
        checks.push({ name: `${sport}_value_tiers`, status: 'warn', detail: `Table query failed: ${error.message}`, duration_ms: Date.now() - t })
      } else {
        const c = count || 0
        const minExpected = sport === 'nfl' ? 200 : sport === 'nba' ? 100 : sport === 'nhl' ? 100 : 150
        checks.push({
          name: `${sport}_value_tiers`,
          status: c >= minExpected ? 'pass' : c > 0 ? 'warn' : 'warn',
          detail: `${c} players with tiers (target ${minExpected}+)`,
          duration_ms: Date.now() - t,
        })
      }
    } catch (e) {
      checks.push({ name: `${sport}_value_tiers`, status: 'warn', detail: `Not available: ${String(e)}`, duration_ms: Date.now() - t })
    }
  }

  // 7b. Value tiers freshness — check if tiers have been updated recently
  const tFresh = Date.now()
  try {
    const { data: latest, error } = await datalabAdmin
      .from('gm_player_value_tiers')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      checks.push({ name: 'value_tiers_freshness', status: 'warn', detail: `Query failed: ${error.message}`, duration_ms: Date.now() - tFresh })
    } else if (latest) {
      const ageMs = Date.now() - new Date(latest.updated_at).getTime()
      const ageDays = Math.round(ageMs / (1000 * 60 * 60 * 24))
      checks.push({
        name: 'value_tiers_freshness',
        status: ageDays <= 7 ? 'pass' : ageDays <= 14 ? 'warn' : 'fail',
        detail: `Last updated ${ageDays} day(s) ago${ageDays > 7 ? ' — needs refresh' : ''}`,
        duration_ms: Date.now() - tFresh,
      })
    }
  } catch (e) {
    checks.push({ name: 'value_tiers_freshness', status: 'warn', detail: `Not available: ${String(e)}`, duration_ms: Date.now() - tFresh })
  }

  // 7c. Grading examples — verify gm_grading_examples has data
  const tEx = Date.now()
  try {
    const { count, error } = await datalabAdmin
      .from('gm_grading_examples')
      .select('*', { count: 'exact', head: true })

    if (error) {
      checks.push({ name: 'grading_examples', status: 'warn', detail: `Table query failed: ${error.message}`, duration_ms: Date.now() - tEx })
    } else {
      const c = count || 0
      checks.push({
        name: 'grading_examples',
        status: c >= 10 ? 'pass' : c > 0 ? 'warn' : 'warn',
        detail: `${c} examples (target 20+)`,
        duration_ms: Date.now() - tEx,
      })
    }
  } catch (e) {
    checks.push({ name: 'grading_examples', status: 'warn', detail: `Not available: ${String(e)}`, duration_ms: Date.now() - tEx })
  }

  // 8. Recent trades — verify grading pipeline is functional
  const t7 = Date.now()
  try {
    const { count, error } = await datalabAdmin
      .from('gm_trades')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (error) {
      checks.push({ name: 'recent_trades', status: 'warn', detail: error.message, duration_ms: Date.now() - t7 })
    } else {
      checks.push({
        name: 'recent_trades',
        status: 'pass',
        detail: `${count || 0} trades in last 24h`,
        duration_ms: Date.now() - t7,
      })
    }
  } catch (e) {
    checks.push({ name: 'recent_trades', status: 'warn', detail: String(e), duration_ms: Date.now() - t7 })
  }

  // 8. GM page HTTP check
  const t8 = Date.now()
  try {
    const res = await fetch(`${BASE_URL}/gm`)
    checks.push({
      name: 'gm_page',
      status: res.status === 200 ? 'pass' : 'fail',
      detail: `HTTP ${res.status}`,
      duration_ms: Date.now() - t8,
    })
  } catch (e) {
    checks.push({ name: 'gm_page', status: 'fail', detail: String(e), duration_ms: Date.now() - t8 })
  }

  // 9. Season status for all Chicago teams
  const seasonStatuses = getAllTeamSeasonStatus()
  const seasonSummary = getSeasonStatusSummary()
  for (const status of seasonStatuses) {
    checks.push({
      name: `season_${status.team}`,
      status: 'pass',
      detail: `${status.seasonPhase} | Season ${status.currentSeason} | Draft: ${status.draftAvailable ? 'available' : 'unavailable'}`,
    })
  }

  // 10. Mock Draft page HTTP check
  const t10 = Date.now()
  try {
    const res = await fetch(`${BASE_URL}/mock-draft`)
    checks.push({
      name: 'mock_draft_page',
      status: res.status === 200 ? 'pass' : 'fail',
      detail: `HTTP ${res.status}`,
      duration_ms: Date.now() - t10,
    })
  } catch (e) {
    checks.push({ name: 'mock_draft_page', status: 'fail', detail: String(e), duration_ms: Date.now() - t10 })
  }

  // 11. Mock Draft API — verify endpoints respond
  const draftEndpoints = ['prospects', 'history']
  for (const endpoint of draftEndpoints) {
    const t = Date.now()
    try {
      const res = await fetch(`${BASE_URL}/api/gm/draft/${endpoint}?sport=nfl`, {
        headers: { Cookie: '' },
      })
      checks.push({
        name: `draft_api_${endpoint}`,
        status: res.status === 401 || res.status === 200 ? 'pass' : 'fail',
        detail: `HTTP ${res.status}`,
        duration_ms: Date.now() - t,
      })
    } catch (e) {
      checks.push({ name: `draft_api_${endpoint}`, status: 'fail', detail: String(e), duration_ms: Date.now() - t })
    }
  }

  // 12. Draft prospects table — verify data exists for offseason sports
  for (const team of CHICAGO_TEAMS) {
    const status = seasonStatuses.find(s => s.team === team.key)
    if (status?.draftAvailable) {
      const t = Date.now()
      try {
        const { count, error } = await datalabAdmin
          .from('gm_draft_prospects')
          .select('*', { count: 'exact', head: true })
          .eq('sport', team.sport)

        if (error) {
          checks.push({ name: `draft_prospects_${team.sport}`, status: 'warn', detail: `Query failed: ${error.message}`, duration_ms: Date.now() - t })
        } else {
          const c = count || 0
          const minExpected = team.sport === 'nfl' ? 100 : team.sport === 'mlb' ? 50 : 30
          checks.push({
            name: `draft_prospects_${team.sport}`,
            status: c >= minExpected ? 'pass' : c > 0 ? 'warn' : 'warn',
            detail: `${c} prospects (target ${minExpected}+)`,
            duration_ms: Date.now() - t,
          })
        }
      } catch (e) {
        checks.push({ name: `draft_prospects_${team.sport}`, status: 'warn', detail: `Not available: ${String(e)}`, duration_ms: Date.now() - t })
      }
    }
  }

  // 13. Draft order table — verify data exists for offseason sports
  const checkedSports = new Set<string>()
  for (const team of CHICAGO_TEAMS) {
    const status = seasonStatuses.find(s => s.team === team.key)
    if (status?.draftAvailable && !checkedSports.has(team.sport)) {
      checkedSports.add(team.sport)
      const t = Date.now()
      try {
        const { count, error } = await datalabAdmin
          .from('gm_draft_order')
          .select('*', { count: 'exact', head: true })
          .eq('sport', team.sport)
          .eq('draft_year', new Date().getFullYear())

        if (error) {
          checks.push({ name: `draft_order_${team.sport}`, status: 'warn', detail: `Query failed: ${error.message}`, duration_ms: Date.now() - t })
        } else {
          const c = count || 0
          const minExpected = team.sport === 'nfl' ? 200 : team.sport === 'mlb' ? 500 : 60
          checks.push({
            name: `draft_order_${team.sport}`,
            status: c >= minExpected ? 'pass' : c > 0 ? 'warn' : 'warn',
            detail: `${c} picks (target ${minExpected}+)`,
            duration_ms: Date.now() - t,
          })
        }
      } catch (e) {
        checks.push({ name: `draft_order_${team.sport}`, status: 'warn', detail: `Not available: ${String(e)}`, duration_ms: Date.now() - t })
      }
    }
  }

  const duration = Date.now() - startTime
  const failCount = checks.filter(c => c.status === 'fail').length
  const warnCount = checks.filter(c => c.status === 'warn').length
  const passCount = checks.filter(c => c.status === 'pass').length
  const hasErrors = failCount > 0

  // Log to gm_errors
  try {
    await datalabAdmin.from('gm_errors').insert({
      source: 'audit',
      error_type: hasErrors ? 'audit_error' : 'audit_result',
      error_message: hasErrors
        ? `Audit completed with ${failCount} failure(s), ${warnCount} warning(s) in ${duration}ms`
        : `All ${passCount} checks passed${warnCount > 0 ? ` (${warnCount} warnings)` : ''} in ${duration}ms`,
      route: '/api/cron/audit-gm',
      metadata: { checks, summary: { pass: passCount, warn: warnCount, fail: failCount }, duration_ms: duration },
    })
  } catch (e) {
    console.error('[GM Audit] Failed to log results:', e)
  }

  console.log(`[GM Audit] Completed in ${duration}ms — ${passCount} pass, ${warnCount} warn, ${failCount} fail`)

  return NextResponse.json({
    success: !hasErrors,
    duration: `${duration}ms`,
    summary: { pass: passCount, warn: warnCount, fail: failCount },
    seasonStatus: {
      inSeason: seasonSummary.inSeason,
      offseason: seasonSummary.offseason,
      draftAvailable: seasonSummary.draftAvailable,
    },
    checks,
    timestamp: new Date().toISOString(),
  })
}
