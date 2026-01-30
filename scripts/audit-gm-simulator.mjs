#!/usr/bin/env node
/**
 * GM Trade Simulator & Mock Draft — Full Audit Script
 *
 * Tests: league rosters, salary cap tables, Chicago rosters, cap API,
 * opponent roster API, trade grading data integrity, GM page health,
 * mock draft eligibility, draft prospects, draft order, and draft sessions.
 *
 * Usage: node scripts/audit-gm-simulator.mjs
 */

import { createClient } from '@supabase/supabase-js'

const DATALAB_URL = process.env.DATALAB_SUPABASE_URL
const DATALAB_KEY = process.env.DATALAB_SUPABASE_SERVICE_ROLE_KEY
const BASE_URL = process.env.BASE_URL || 'https://test.sportsmockery.com'

const supabase = createClient(DATALAB_URL, DATALAB_KEY)

const SPORTS = ['nfl', 'nba', 'nhl', 'mlb']
const CHICAGO_TEAMS = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox']

const results = []

function log(name, status, detail) {
  const icon = status === 'pass' ? '\x1b[32m PASS \x1b[0m' : status === 'warn' ? '\x1b[33m WARN \x1b[0m' : '\x1b[31m FAIL \x1b[0m'
  console.log(`  [${icon}] ${name}: ${detail}`)
  results.push({ name, status, detail })
}

async function run() {
  console.log()
  console.log('='.repeat(72))
  console.log('  GM TRADE SIMULATOR & MOCK DRAFT — FULL AUDIT')
  console.log('  ' + new Date().toISOString())
  console.log('='.repeat(72))
  console.log()

  // ── 1. League Roster Tables ──────────────────────────────
  console.log('  1. LEAGUE ROSTER TABLES')
  console.log('  ' + '-'.repeat(40))
  for (const sport of SPORTS) {
    const table = `gm_${sport}_rosters`
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (error) {
        log(table, 'fail', error.message)
      } else {
        const c = count || 0
        const min = sport === 'nfl' ? 1500 : sport === 'nba' ? 400 : sport === 'nhl' ? 600 : 800
        log(table, c >= min ? 'pass' : c > 0 ? 'warn' : 'fail', `${c} active players (min ${min})`)
      }
    } catch (e) {
      log(table, 'fail', e.message)
    }
  }
  console.log()

  // ── 2. Salary Cap Tables ─────────────────────────────────
  console.log('  2. SALARY CAP TABLES')
  console.log('  ' + '-'.repeat(40))
  for (const sport of SPORTS) {
    const table = `gm_${sport}_salary_cap`
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        log(table, 'fail', error.message)
      } else {
        const c = count || 0
        log(table, c > 0 ? 'pass' : 'fail', `${c} teams with cap data`)
      }
    } catch (e) {
      log(table, 'fail', e.message)
    }
  }
  console.log()

  // ── 3. Cap Data Spot Check ───────────────────────────────
  console.log('  3. CAP DATA SPOT CHECK (Bears NFL)')
  console.log('  ' + '-'.repeat(40))
  try {
    const { data, error } = await supabase
      .from('gm_nfl_salary_cap')
      .select('total_cap, cap_used, cap_available, dead_money')
      .eq('team_key', 'bears')
      .order('season', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      log('bears_cap_data', 'fail', error.message)
    } else if (data) {
      const valid = data.total_cap > 0 && data.cap_used >= 0
      log('bears_cap_data', valid ? 'pass' : 'warn',
        `Total: $${(data.total_cap / 1e6).toFixed(1)}M | Used: $${(data.cap_used / 1e6).toFixed(1)}M | Avail: $${(data.cap_available / 1e6).toFixed(1)}M`)
    } else {
      log('bears_cap_data', 'fail', 'No data returned')
    }
  } catch (e) {
    log('bears_cap_data', 'fail', e.message)
  }
  console.log()

  // ── 4. Chicago Roster Data ───────────────────────────────
  console.log('  4. CHICAGO ROSTER DATA (Direct DB)')
  console.log('  ' + '-'.repeat(40))
  const rosterConfig = {
    bears: { table: 'bears_players', col: 'is_active', min: 53, max: 90 },
    bulls: { table: 'bulls_players', col: 'is_current_bulls', min: 15, max: 20 },
    blackhawks: { table: 'blackhawks_players', col: 'is_active', min: 20, max: 25 },
    cubs: { table: 'cubs_players', col: 'is_active', min: 26, max: 45 },
    whitesox: { table: 'whitesox_players', col: 'is_active', min: 26, max: 45 },
  }
  for (const [team, cfg] of Object.entries(rosterConfig)) {
    try {
      const { count, error } = await supabase
        .from(cfg.table)
        .select('*', { count: 'exact', head: true })
        .eq(cfg.col, true)

      if (error) {
        log(`${team}_roster`, 'fail', error.message)
      } else {
        const c = count || 0
        const ok = c >= cfg.min && c <= cfg.max
        log(`${team}_roster`, ok ? 'pass' : 'warn', `${c} players (expected ${cfg.min}-${cfg.max})`)
      }
    } catch (e) {
      log(`${team}_roster`, 'fail', e.message)
    }
  }
  console.log()

  // ── 5. League Teams Table ────────────────────────────────
  console.log('  5. LEAGUE TEAMS TABLE')
  console.log('  ' + '-'.repeat(40))
  try {
    const { count, error } = await supabase
      .from('gm_league_teams')
      .select('*', { count: 'exact', head: true })

    if (error) {
      log('league_teams', 'fail', error.message)
    } else {
      const c = count || 0
      log('league_teams', c >= 120 ? 'pass' : c > 0 ? 'warn' : 'fail', `${c} teams (expected 124)`)
    }
  } catch (e) {
    log('league_teams', 'fail', e.message)
  }

  // Verify each sport has teams
  for (const sport of SPORTS) {
    try {
      const { count } = await supabase
        .from('gm_league_teams')
        .select('*', { count: 'exact', head: true })
        .eq('sport', sport)
      log(`league_teams_${sport}`, (count || 0) > 0 ? 'pass' : 'fail', `${count || 0} teams`)
    } catch (e) {
      log(`league_teams_${sport}`, 'fail', e.message)
    }
  }
  console.log()

  // ── 6. Opponent Roster Spot Check ────────────────────────
  console.log('  6. OPPONENT ROSTER SPOT CHECK')
  console.log('  ' + '-'.repeat(40))
  const spotChecks = [
    { team: 'packers', sport: 'nfl', name: 'Green Bay Packers' },
    { team: 'lakers', sport: 'nba', name: 'Los Angeles Lakers' },
    { team: 'mapleleafs', sport: 'nhl', name: 'Toronto Maple Leafs' },
    { team: 'yankees', sport: 'mlb', name: 'New York Yankees' },
  ]
  for (const check of spotChecks) {
    try {
      const { count, error } = await supabase
        .from(`gm_${check.sport}_rosters`)
        .select('*', { count: 'exact', head: true })
        .eq('team_key', check.team)
        .eq('is_active', true)

      if (error) {
        log(`opponent_${check.team}`, 'fail', error.message)
      } else {
        log(`opponent_${check.team}`, (count || 0) > 10 ? 'pass' : 'warn', `${count || 0} active players for ${check.name}`)
      }
    } catch (e) {
      log(`opponent_${check.team}`, 'fail', e.message)
    }
  }
  console.log()

  // ── 7. Trade History & Grading Integrity ─────────────────
  console.log('  7. TRADE HISTORY & GRADING INTEGRITY')
  console.log('  ' + '-'.repeat(40))
  try {
    const { count: totalTrades } = await supabase
      .from('gm_trades')
      .select('*', { count: 'exact', head: true })
    log('total_trades', 'pass', `${totalTrades || 0} total trades`)

    // Last 24h
    const { count: recentTrades } = await supabase
      .from('gm_trades')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    log('recent_trades_24h', 'pass', `${recentTrades || 0} trades in last 24h`)

    // Check for invalid grades (outside 0-100)
    const { data: badGrades } = await supabase
      .from('gm_trades')
      .select('id, grade')
      .or('grade.lt.0,grade.gt.100')
      .limit(5)
    log('grade_range_check', (!badGrades || badGrades.length === 0) ? 'pass' : 'fail',
      badGrades && badGrades.length > 0 ? `${badGrades.length} trades with invalid grades` : 'All grades 0-100')

    // Check for trades missing reasoning
    const { count: noReasoning } = await supabase
      .from('gm_trades')
      .select('*', { count: 'exact', head: true })
      .is('grade_reasoning', null)
    log('reasoning_check', (noReasoning || 0) === 0 ? 'pass' : 'warn', `${noReasoning || 0} trades missing reasoning`)
  } catch (e) {
    log('trade_integrity', 'fail', e.message)
  }
  console.log()

  // ── 8. HTTP Endpoint Checks ──────────────────────────────
  console.log('  8. HTTP ENDPOINT CHECKS')
  console.log('  ' + '-'.repeat(40))
  const endpoints = [
    { url: `${BASE_URL}/gm`, name: 'gm_page' },
    { url: `${BASE_URL}/mock-draft`, name: 'mock_draft_page' },
    { url: `${BASE_URL}/api/gm/teams`, name: 'teams_api' },
    { url: `${BASE_URL}/api/gm/leaderboard`, name: 'leaderboard_api' },
    { url: `${BASE_URL}/api/gm/draft/eligibility`, name: 'draft_eligibility_api' },
    { url: `${BASE_URL}/api/gm/draft/prospects?sport=nfl`, name: 'draft_prospects_api' },
  ]
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url)
      log(ep.name, res.status === 200 ? 'pass' : 'warn', `HTTP ${res.status}`)
    } catch (e) {
      log(ep.name, 'fail', e.message)
    }
  }
  console.log()

  // ── 9. MOCK DRAFT SYSTEM ───────────────────────────────
  console.log('  9. MOCK DRAFT SYSTEM')
  console.log('  ' + '-'.repeat(40))

  // Draft eligibility view
  try {
    const { data: eligibility, error } = await supabase
      .from('gm_draft_eligibility')
      .select('*')
      .in('team_key', ['chi', 'chc', 'chw'])
      .eq('draft_year', 2026)

    if (error) {
      log('draft_eligibility_view', 'fail', error.message)
    } else {
      const c = eligibility?.length || 0
      const eligibleCount = eligibility?.filter(e => e.eligible).length || 0
      log('draft_eligibility_view', c >= 5 ? 'pass' : 'warn', `${c} teams, ${eligibleCount} eligible`)

      // Show each team's status
      for (const e of eligibility || []) {
        const status = e.eligible ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'
        console.log(`      ${status} ${e.team_name || e.team_key}: ${e.reason || 'N/A'} | ${e.days_until_draft || '?'} days to draft`)
      }
    }
  } catch (e) {
    log('draft_eligibility_view', 'fail', e.message)
  }

  // Draft prospects
  for (const sport of SPORTS) {
    try {
      const { count, error } = await supabase
        .from('gm_draft_prospects')
        .select('*', { count: 'exact', head: true })
        .eq('sport', sport)
        .eq('draft_year', 2026)

      if (error) {
        log(`draft_prospects_${sport}`, 'warn', error.message)
      } else {
        const c = count || 0
        const min = sport === 'nfl' ? 100 : sport === 'mlb' ? 50 : 30
        log(`draft_prospects_${sport}`, c >= min ? 'pass' : c > 0 ? 'warn' : 'warn', `${c} prospects (target ${min}+)`)
      }
    } catch (e) {
      log(`draft_prospects_${sport}`, 'warn', e.message)
    }
  }

  // Draft order
  for (const sport of ['nfl', 'mlb']) {  // Only check sports that are in offseason
    try {
      const { count, error } = await supabase
        .from('gm_draft_order')
        .select('*', { count: 'exact', head: true })
        .eq('sport', sport)
        .eq('draft_year', 2026)

      if (error) {
        log(`draft_order_${sport}`, 'warn', error.message)
      } else {
        const c = count || 0
        const min = sport === 'nfl' ? 200 : 500
        log(`draft_order_${sport}`, c >= min ? 'pass' : c > 0 ? 'warn' : 'warn', `${c} picks (target ${min}+)`)
      }
    } catch (e) {
      log(`draft_order_${sport}`, 'warn', e.message)
    }
  }

  // Mock draft sessions
  try {
    const { count: totalMocks } = await supabase
      .from('gm_mock_drafts')
      .select('*', { count: 'exact', head: true })

    const { count: recentMocks } = await supabase
      .from('gm_mock_drafts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const { count: completedMocks } = await supabase
      .from('gm_mock_drafts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    log('mock_draft_sessions', 'pass', `${totalMocks || 0} total | ${recentMocks || 0} last 7d | ${completedMocks || 0} completed`)
  } catch (e) {
    log('mock_draft_sessions', 'warn', e.message)
  }

  // Mock draft picks
  try {
    const { count: totalPicks } = await supabase
      .from('gm_mock_draft_picks')
      .select('*', { count: 'exact', head: true })

    const { count: madePicks } = await supabase
      .from('gm_mock_draft_picks')
      .select('*', { count: 'exact', head: true })
      .not('prospect_id', 'is', null)

    log('mock_draft_picks', 'pass', `${totalPicks || 0} total | ${madePicks || 0} with prospects`)
  } catch (e) {
    log('mock_draft_picks', 'warn', e.message)
  }
  console.log()

  // ── 10. Error Log Health ─────────────────────────────────
  console.log('  10. ERROR LOG HEALTH')
  console.log('  ' + '-'.repeat(40))
  try {
    const { count: totalErrors } = await supabase
      .from('gm_errors')
      .select('*', { count: 'exact', head: true })
    log('total_error_logs', 'pass', `${totalErrors || 0} total log entries`)

    // Errors in last hour
    const { count: recentErrors } = await supabase
      .from('gm_errors')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .not('error_type', 'in', '("sync_result","audit_result")')
    log('recent_errors_1h', (recentErrors || 0) < 10 ? 'pass' : 'warn', `${recentErrors || 0} errors in last hour`)
  } catch (e) {
    log('error_log_health', 'fail', e.message)
  }
  console.log()

  // ── SUMMARY ──────────────────────────────────────────────
  const pass = results.filter(r => r.status === 'pass').length
  const warn = results.filter(r => r.status === 'warn').length
  const fail = results.filter(r => r.status === 'fail').length

  console.log('='.repeat(72))
  console.log(`  SUMMARY: \x1b[32m${pass} PASS\x1b[0m | \x1b[33m${warn} WARN\x1b[0m | \x1b[31m${fail} FAIL\x1b[0m`)
  console.log('='.repeat(72))
  console.log()

  if (fail > 0) {
    console.log('  FAILURES:')
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`    - ${r.name}: ${r.detail}`)
    })
    console.log()
  }

  process.exit(fail > 0 ? 1 : 0)
}

run().catch(e => {
  console.error('Audit script crashed:', e)
  process.exit(1)
})
