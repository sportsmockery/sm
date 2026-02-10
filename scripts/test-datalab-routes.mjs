#!/usr/bin/env node
/**
 * Comprehensive DataLab Route & Connection Tester
 * Uses curl via Supabase REST API for compatibility
 *
 * Run: node scripts/test-datalab-routes.mjs
 */

import { execSync } from 'child_process'

const DATALAB_URL = 'https://siwoqfzzcxmngnseyzpv.supabase.co'
const DATALAB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd29xZnp6Y3htbmduc2V5enB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NDk0ODAsImV4cCI6MjA4MzIyNTQ4MH0.PzeJ6OG2ofjLWSpJ2UmI-1aXVrHnh3ar6eTgph4uJgc'
const REST_URL = `${DATALAB_URL}/rest/v1`

const SEASONS = { NFL: 2025, NBA: 2026, NHL: 2026, MLB: 2025 }

const results = []
function addResult(category, test, status, details) {
  results.push({ category, test, status, details })
}

/**
 * Query Supabase REST API via curl
 */
function supabaseQuery(table, params = '') {
  const url = `${REST_URL}/${table}?${params}`
  try {
    const out = execSync(
      `curl -s --connect-timeout 10 --max-time 20 "${url}" -H "apikey: ${DATALAB_KEY}" -H "Authorization: Bearer ${DATALAB_KEY}" -H "Accept: application/json"`,
      { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    )
    const data = JSON.parse(out)
    if (data.message || data.error) {
      return { data: null, error: data.message || data.error || JSON.stringify(data) }
    }
    return { data, error: null }
  } catch (e) {
    return { data: null, error: e.message?.substring(0, 200) }
  }
}

/**
 * Query with count header
 */
function supabaseCount(table, params = '') {
  const url = `${REST_URL}/${table}?${params}`
  try {
    const out = execSync(
      `curl -s --connect-timeout 10 --max-time 20 -D- "${url}" -H "apikey: ${DATALAB_KEY}" -H "Authorization: Bearer ${DATALAB_KEY}" -H "Accept: application/json" -H "Prefer: count=exact" -H "Range: 0-0"`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    )
    const countMatch = out.match(/content-range:\s*\d+-\d+\/(\d+)/i)
    const count = countMatch ? parseInt(countMatch[1]) : null
    return { count, error: null }
  } catch (e) {
    return { count: null, error: e.message?.substring(0, 200) }
  }
}

/**
 * HTTP fetch for non-Supabase endpoints
 */
function httpFetch(url, method = 'GET', body = null) {
  try {
    let cmd = `curl -s --connect-timeout 10 --max-time 20 -w "\\n%{http_code}" "${url}"`
    if (method === 'POST') {
      cmd = `curl -s --connect-timeout 10 --max-time 20 -w "\\n%{http_code}" -X POST -H "Content-Type: application/json" -d '${JSON.stringify(body)}' "${url}"`
    }
    const out = execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 })
    const lines = out.trim().split('\n')
    const statusCode = parseInt(lines[lines.length - 1])
    const responseBody = lines.slice(0, -1).join('\n')
    return { status: statusCode, body: responseBody, error: null }
  } catch (e) {
    return { status: 0, body: '', error: e.message?.substring(0, 200) }
  }
}

// ============================================================================
// TEAM CONFIGS
// ============================================================================

const TEAM_CONFIGS = {
  bears: { league: 'NFL', gamesTable: 'bears_games_master', playersTable: 'bears_players', statsTable: 'bears_player_game_stats', seasonStatsTable: 'bears_team_season_stats', seasonTable: 'bears_season_record', activeCol: 'is_active', espnIdCol: 'espn_id', scoreCol: 'bears_score', oppScoreCol: 'opponent_score', winCol: 'bears_win', homeCol: 'is_bears_home', rosterMin: 53, rosterMax: 90 },
  bulls: { league: 'NBA', gamesTable: 'bulls_games_master', playersTable: 'bulls_players', statsTable: 'bulls_player_game_stats', seasonStatsTable: 'bulls_team_season_stats', seasonTable: 'bulls_seasons', activeCol: 'is_current_bulls', espnIdCol: 'espn_player_id', scoreCol: 'bulls_score', oppScoreCol: 'opponent_score', winCol: 'bulls_win', homeCol: 'is_bulls_home', rosterMin: 15, rosterMax: 20 },
  blackhawks: { league: 'NHL', gamesTable: 'blackhawks_games_master', playersTable: 'blackhawks_players', statsTable: 'blackhawks_player_game_stats', seasonStatsTable: 'blackhawks_team_season_stats', seasonTable: 'blackhawks_seasons', activeCol: 'is_active', espnIdCol: 'espn_id', scoreCol: 'blackhawks_score', oppScoreCol: 'opponent_score', winCol: 'blackhawks_win', homeCol: 'is_blackhawks_home', rosterMin: 20, rosterMax: 25 },
  cubs: { league: 'MLB', gamesTable: 'cubs_games_master', playersTable: 'cubs_players', statsTable: 'cubs_player_game_stats', seasonStatsTable: 'cubs_team_season_stats', seasonTable: 'cubs_seasons', activeCol: 'is_active', espnIdCol: 'espn_id', scoreCol: 'cubs_score', oppScoreCol: 'opponent_score', winCol: 'cubs_win', homeCol: 'is_cubs_home', rosterMin: 26, rosterMax: 45 },
  whitesox: { league: 'MLB', gamesTable: 'whitesox_games_master', playersTable: 'whitesox_players', statsTable: 'whitesox_player_game_stats', seasonStatsTable: 'whitesox_team_season_stats', seasonTable: 'whitesox_seasons', activeCol: 'is_active', espnIdCol: 'espn_id', scoreCol: 'whitesox_score', oppScoreCol: 'opponent_score', winCol: 'whitesox_win', homeCol: 'is_whitesox_home', rosterMin: 26, rosterMax: 45 },
}

const EXPECTED_RECORDS = {
  bears: { wins: 11, losses: 6, winsCol: 'regular_season_wins', lossesCol: 'regular_season_losses' },
  bulls: { wins: 23, losses: 22, winsCol: 'wins', lossesCol: 'losses' },
  blackhawks: { wins: 21, losses: 22, winsCol: 'wins', lossesCol: 'losses', otlCol: 'otl', otl: 8 },
  cubs: { wins: 92, losses: 70, winsCol: 'wins', lossesCol: 'losses' },
  whitesox: { wins: 60, losses: 102, winsCol: 'wins', lossesCol: 'losses' },
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

function testBaseConnection() {
  console.log('\n=== 1. BASE SUPABASE CONNECTION ===')
  const { data, error } = supabaseQuery('bears_players', 'select=id&limit=1')
  if (error) {
    addResult('Connection', 'Supabase DataLab Connection', 'FAIL', `Error: ${error}`)
  } else if (data && data.length > 0) {
    addResult('Connection', 'Supabase DataLab Connection', 'PASS', 'Connected successfully')
  } else {
    addResult('Connection', 'Supabase DataLab Connection', 'WARN', 'Connected but no data returned')
  }
}

function testPlayersTable(teamKey) {
  const config = TEAM_CONFIGS[teamKey]
  console.log(`  Testing ${teamKey} players...`)

  // Get active players
  const { data, error } = supabaseQuery(config.playersTable, `${config.activeCol}=eq.true&select=*&limit=200`)
  if (error) {
    addResult(`${teamKey} Players`, `${config.playersTable} - Table Access`, 'FAIL', `Error: ${error}`)
    return
  }

  const count = data.length
  const inRange = count >= config.rosterMin && count <= config.rosterMax
  addResult(`${teamKey} Players`, `Active Roster Count (${config.activeCol}=true)`,
    inRange ? 'PASS' : 'WARN',
    `${count} players (expected ${config.rosterMin}-${config.rosterMax})`)

  // Check field completeness
  const fields = {
    'name/full_name': (p) => !p.name && !p.full_name,
    'position': (p) => !p.position,
    [config.espnIdCol]: (p) => !p[config.espnIdCol] && !p.espn_id && !p.player_id,
    'headshot_url': (p) => !p.headshot_url,
    'jersey_number': (p) => p.jersey_number === null || p.jersey_number === undefined,
    'height/height_inches': (p) => !p.height && !p.height_inches,
    'weight/weight_lbs': (p) => !p.weight && !p.weight_lbs,
    'age': (p) => !p.age,
    'college': (p) => !p.college,
  }

  for (const [field, check] of Object.entries(fields)) {
    const missing = data.filter(check).length
    if (missing > 0) {
      addResult(`${teamKey} Players`, `Field: ${field}`,
        missing > count * 0.5 ? 'FAIL' : 'WARN',
        `${missing}/${count} active players missing`)
    } else {
      addResult(`${teamKey} Players`, `Field: ${field}`, 'PASS', `All ${count} players have data`)
    }
  }

  // Report all available columns from first player
  if (data[0]) {
    addResult(`${teamKey} Players`, 'Available Columns', 'INFO', Object.keys(data[0]).join(', '))
  }
}

function testGamesTable(teamKey) {
  const config = TEAM_CONFIGS[teamKey]
  const season = SEASONS[config.league]
  console.log(`  Testing ${teamKey} games...`)

  const { data, error } = supabaseQuery(config.gamesTable, `season=eq.${season}&select=*&order=game_date.asc&limit=300`)
  if (error) {
    addResult(`${teamKey} Games`, `${config.gamesTable} (season=${season})`, 'FAIL', `Error: ${error}`)
    return
  }

  addResult(`${teamKey} Games`, `Total Games (season=${season})`,
    data.length > 0 ? 'PASS' : 'FAIL', `${data.length} games`)

  // Count completed vs scheduled
  const completed = data.filter(g => g[config.scoreCol] !== null && g[config.scoreCol] !== undefined)
  const scheduled = data.filter(g => g[config.scoreCol] === null || g[config.scoreCol] === undefined)

  addResult(`${teamKey} Games`, 'Completed Games',
    completed.length > 0 ? 'PASS' : 'WARN', `${completed.length} completed`)
  addResult(`${teamKey} Games`, 'Scheduled Games', 'INFO', `${scheduled.length} scheduled/future`)

  // Check required fields
  const missingDate = data.filter(g => !g.game_date).length
  const missingOpp = data.filter(g => !g.opponent).length
  const missingHome = data.filter(g => g[config.homeCol] === null || g[config.homeCol] === undefined).length

  if (missingDate > 0) addResult(`${teamKey} Games`, 'Field: game_date', 'WARN', `${missingDate}/${data.length} missing`)
  if (missingOpp > 0) addResult(`${teamKey} Games`, 'Field: opponent', 'WARN', `${missingOpp}/${data.length} missing`)
  if (missingHome > 0) addResult(`${teamKey} Games`, `Field: ${config.homeCol}`, 'WARN', `${missingHome}/${data.length} missing`)

  // Check for 0-0 score games in completed
  const zeroZero = completed.filter(g => g[config.scoreCol] === 0 && g[config.oppScoreCol] === 0)
  if (zeroZero.length > 0) {
    addResult(`${teamKey} Games`, '0-0 Score Games', 'WARN', `${zeroZero.length} completed games have 0-0 score`)
  }

  // Check game_time availability
  const missingTime = data.filter(g => !g.game_time).length
  if (missingTime > 0) {
    addResult(`${teamKey} Games`, 'Field: game_time', 'WARN', `${missingTime}/${data.length} missing`)
  }

  // Check opponent_full_name
  const missingFullName = data.filter(g => !g.opponent_full_name).length
  if (missingFullName > 0) {
    addResult(`${teamKey} Games`, 'Field: opponent_full_name',
      missingFullName === data.length ? 'WARN' : 'INFO',
      `${missingFullName}/${data.length} missing`)
  }

  if (data[0]) {
    addResult(`${teamKey} Games`, 'Available Columns', 'INFO', Object.keys(data[0]).join(', '))
  }
}

function testSeasonRecord(teamKey) {
  const config = TEAM_CONFIGS[teamKey]
  const expected = EXPECTED_RECORDS[teamKey]
  const season = SEASONS[config.league]
  console.log(`  Testing ${teamKey} season record...`)

  const { data, error } = supabaseQuery(config.seasonTable, `season=eq.${season}&select=*&limit=1`)
  if (error) {
    addResult(`${teamKey} Season Record`, `${config.seasonTable} (season=${season})`, 'FAIL', `Error: ${error}`)
    return
  }

  if (!data || data.length === 0) {
    addResult(`${teamKey} Season Record`, `${config.seasonTable} (season=${season})`, 'FAIL', 'No record found')
    return
  }

  const record = data[0]
  const wins = record[expected.winsCol]
  const losses = record[expected.lossesCol]

  addResult(`${teamKey} Season Record`, 'Wins',
    wins !== null && wins !== undefined ? 'PASS' : 'FAIL',
    `${wins} (CLAUDE.md expected: ~${expected.wins})`)

  addResult(`${teamKey} Season Record`, 'Losses',
    losses !== null && losses !== undefined ? 'PASS' : 'FAIL',
    `${losses} (CLAUDE.md expected: ~${expected.losses})`)

  // Record match check
  if (wins !== expected.wins || losses !== expected.losses) {
    addResult(`${teamKey} Season Record`, 'Record Match vs CLAUDE.md',
      'WARN', `DB: ${wins}-${losses} vs CLAUDE.md: ${expected.wins}-${expected.losses} (may have been updated since doc was written)`)
  } else {
    addResult(`${teamKey} Season Record`, 'Record Match vs CLAUDE.md', 'PASS', `${wins}-${losses} matches`)
  }

  if (expected.otlCol) {
    const otl = record[expected.otlCol]
    addResult(`${teamKey} Season Record`, 'OT Losses',
      otl !== null && otl !== undefined ? 'PASS' : 'FAIL',
      `${otl} (CLAUDE.md expected: ~${expected.otl})`)
  }

  addResult(`${teamKey} Season Record`, 'Available Columns', 'INFO', Object.keys(record).join(', '))
}

function testTeamSeasonStats(teamKey) {
  const config = TEAM_CONFIGS[teamKey]
  const season = SEASONS[config.league]
  console.log(`  Testing ${teamKey} team season stats...`)

  const { data, error } = supabaseQuery(config.seasonStatsTable, `season=eq.${season}&select=*&limit=1`)
  if (error) {
    addResult(`${teamKey} Team Stats`, `${config.seasonStatsTable} (season=${season})`, 'FAIL', `Error: ${error}`)
    return
  }

  if (!data || data.length === 0) {
    addResult(`${teamKey} Team Stats`, `${config.seasonStatsTable} (season=${season})`, 'FAIL', 'No data found')
    return
  }

  addResult(`${teamKey} Team Stats`, 'Table Access', 'PASS', 'Data found')

  const row = data[0]
  const allCols = Object.keys(row)
  const nullCols = allCols.filter(c => row[c] === null)

  if (nullCols.length > 0) {
    addResult(`${teamKey} Team Stats`, 'Null Columns', 'WARN', `${nullCols.length}/${allCols.length}: ${nullCols.join(', ')}`)
  }

  // Sport-specific column checks per CLAUDE.md
  const sportChecks = {
    NBA: { columns: ['field_goal_pct', 'three_point_pct', 'free_throw_pct'], wrongNames: ['fg_pct', 'three_pct', 'ft_pct'] },
    NHL: { columns: ['power_play_pct', 'penalty_kill_pct'], wrongNames: ['pp_pct', 'pk_pct'] },
    MLB: { columns: ['batting_average', 'era', 'ops'], wrongNames: ['team_avg', 'team_era', 'team_ops'] },
    NFL: { columns: ['total_points', 'points_per_game'], wrongNames: [] },
  }

  const checks = sportChecks[config.league]
  if (checks) {
    for (const col of checks.columns) {
      const val = row[col]
      addResult(`${teamKey} Team Stats`, `Column: ${col}`,
        val !== null && val !== undefined ? 'PASS' : 'MISSING',
        `Value: ${val ?? 'NULL'}`)
    }

    // Check that wrong names don't exist (to validate CLAUDE.md docs)
    for (const wrongCol of checks.wrongNames) {
      if (allCols.includes(wrongCol)) {
        addResult(`${teamKey} Team Stats`, `Wrong column name detected: ${wrongCol}`, 'WARN',
          `Column '${wrongCol}' exists — docs say to NOT use this name`)
      }
    }
  }

  addResult(`${teamKey} Team Stats`, 'All Columns', 'INFO', allCols.join(', '))
}

function testPlayerGameStats(teamKey) {
  const config = TEAM_CONFIGS[teamKey]
  const season = SEASONS[config.league]
  console.log(`  Testing ${teamKey} player game stats...`)

  // Get count of stats rows
  const { count, error: countErr } = supabaseCount(config.statsTable, `season=eq.${season}`)
  if (countErr) {
    addResult(`${teamKey} Player Stats`, `${config.statsTable} - Count`, 'FAIL', `Error: ${countErr}`)
  } else {
    addResult(`${teamKey} Player Stats`, `Total Stat Rows (season=${season})`,
      count > 0 ? 'PASS' : 'FAIL', `${count} rows`)
  }

  // Get unique players with stats
  const { data: statsData, error } = supabaseQuery(config.statsTable, `season=eq.${season}&select=player_id&limit=5000`)
  if (error) {
    addResult(`${teamKey} Player Stats`, 'Unique Players', 'FAIL', `Error: ${error}`)
    return
  }

  const uniquePlayers = new Set(statsData.map(s => String(s.player_id)))
  addResult(`${teamKey} Player Stats`, 'Unique Players with Stats',
    uniquePlayers.size > 0 ? 'PASS' : 'FAIL', `${uniquePlayers.size} players`)

  // ESPN ID mapping check
  const { data: activePlayers } = supabaseQuery(config.playersTable, `${config.activeCol}=eq.true&select=id,${config.espnIdCol},name&limit=200`)
  if (activePlayers && activePlayers.length > 0) {
    const playerEspnIds = activePlayers
      .map(p => p[config.espnIdCol] || p.espn_id)
      .filter(id => id !== null && id !== undefined)

    const matchedIds = playerEspnIds.filter(id => uniquePlayers.has(String(id)))
    const matchPct = playerEspnIds.length > 0 ? Math.round((matchedIds.length / playerEspnIds.length) * 100) : 0

    addResult(`${teamKey} Player Stats`, 'ESPN ID Mapping (active→stats)',
      matchPct >= 50 ? 'PASS' : 'WARN',
      `${matchedIds.length}/${playerEspnIds.length} active players (${matchPct}%) have matching stats`)
  }

  // Sample row for column check
  const { data: sampleData } = supabaseQuery(config.statsTable, `season=eq.${season}&select=*&limit=1`)
  if (sampleData && sampleData[0]) {
    const row = sampleData[0]
    const cols = Object.keys(row)

    // Sport-specific checks
    let expectedCols = []
    if (config.league === 'NFL') {
      expectedCols = ['player_id', 'season', 'bears_game_id', 'game_date', 'opponent']
      // Check for either short or long stat column names
      const statPairs = [
        ['passing_yards', 'passing_yds'],
        ['passing_touchdowns', 'passing_td'],
        ['rushing_yards', 'rushing_yds'],
        ['receiving_yards', 'receiving_yds'],
        ['defensive_total_tackles', 'def_tackles_total'],
      ]
      for (const [long, short] of statPairs) {
        if (cols.includes(long)) {
          addResult(`${teamKey} Stat Columns`, `Stat: ${long}`, 'PASS', `Value: ${row[long]}`)
        } else if (cols.includes(short)) {
          addResult(`${teamKey} Stat Columns`, `Stat: ${short} (short form)`, 'PASS', `Value: ${row[short]}`)
        } else {
          addResult(`${teamKey} Stat Columns`, `Stat: ${long}/${short}`, 'MISSING', 'Neither column found')
        }
      }
    } else if (config.league === 'NBA') {
      expectedCols = ['player_id', 'season', 'game_date', 'points', 'total_rebounds', 'assists', 'steals', 'blocks', 'turnovers', 'field_goals_made', 'field_goals_attempted', 'three_pointers_made', 'three_pointers_attempted', 'free_throws_made', 'free_throws_attempted', 'minutes_played', 'plus_minus']
    } else if (config.league === 'NHL') {
      expectedCols = ['player_id', 'season', 'game_date', 'goals', 'assists', 'points', 'plus_minus', 'shots_on_goal', 'hits', 'blocked_shots', 'saves', 'goals_against']
    } else if (config.league === 'MLB') {
      expectedCols = ['player_id', 'season', 'game_date', 'at_bats', 'hits', 'runs', 'rbi', 'home_runs', 'walks', 'strikeouts', 'innings_pitched', 'hits_allowed', 'earned_runs', 'walks_allowed', 'strikeouts_pitched']
    }

    for (const col of expectedCols) {
      if (cols.includes(col)) {
        addResult(`${teamKey} Stat Columns`, `Column: ${col}`, 'PASS', `Value: ${row[col]}`)
      } else {
        addResult(`${teamKey} Stat Columns`, `Column: ${col}`, 'MISSING', 'Not found')
      }
    }

    addResult(`${teamKey} Stat Columns`, 'All Available Columns', 'INFO', cols.join(', '))
  }
}

function testCrossTableIntegrity(teamKey) {
  const config = TEAM_CONFIGS[teamKey]
  const season = SEASONS[config.league]
  console.log(`  Testing ${teamKey} cross-table integrity...`)

  // Get a completed game
  const { data: games } = supabaseQuery(config.gamesTable,
    `season=eq.${season}&${config.scoreCol}=not.is.null&select=id,game_date&limit=3&order=game_date.desc`)

  if (!games || games.length === 0) {
    addResult(`${teamKey} Integrity`, 'Games → Stats Linking', 'WARN', 'No completed games to check')
    return
  }

  let gamesWithStats = 0
  for (const game of games) {
    let statsResult
    if (teamKey === 'bears') {
      statsResult = supabaseQuery(config.statsTable, `bears_game_id=eq.${game.id}&select=player_id&limit=3`)
    } else {
      statsResult = supabaseQuery(config.statsTable, `game_date=eq.${game.game_date}&season=eq.${season}&select=player_id&limit=3`)
    }
    if (statsResult.data && statsResult.data.length > 0) {
      gamesWithStats++
    }
  }

  addResult(`${teamKey} Integrity`, 'Completed Games → Player Stats',
    gamesWithStats === games.length ? 'PASS' : (gamesWithStats > 0 ? 'WARN' : 'FAIL'),
    `${gamesWithStats}/${games.length} sampled games have corresponding player stats`)
}

// ============================================================================
// GM TABLES
// ============================================================================
function testGMTables() {
  console.log('\n=== GM TRADE SIMULATOR TABLES ===')

  const tables = [
    { table: 'gm_league_teams', desc: 'League Teams', minRows: 100 },
    { table: 'gm_trades', desc: 'Trade History' },
    { table: 'gm_trade_items', desc: 'Trade Items' },
    { table: 'gm_leaderboard', desc: 'Leaderboard' },
    { table: 'gm_sessions', desc: 'Sessions' },
    { table: 'gm_audit_logs', desc: 'Audit Logs' },
    { table: 'gm_errors', desc: 'Error Logs' },
  ]

  for (const { table, desc, minRows } of tables) {
    const { count, error } = supabaseCount(table)
    if (error) {
      addResult('GM Tables', `${table} (${desc})`, 'FAIL', `Error: ${error}`)
      continue
    }

    if (count === null) {
      // Try direct query
      const { data, error: qErr } = supabaseQuery(table, 'select=id&limit=5')
      if (qErr) {
        addResult('GM Tables', `${table} (${desc})`, 'FAIL', `Error: ${qErr}`)
      } else {
        addResult('GM Tables', `${table} (${desc})`,
          data.length > 0 ? 'PASS' : 'WARN',
          `${data.length}+ rows (exact count unavailable)`)
      }
    } else {
      addResult('GM Tables', `${table} (${desc})`,
        (minRows && count < minRows) ? 'WARN' : 'PASS',
        `${count} rows${minRows ? ` (expected ${minRows}+)` : ''}`)
    }

    // Sample row columns for league_teams
    if (table === 'gm_league_teams') {
      const { data } = supabaseQuery(table, 'select=*&limit=1')
      if (data && data[0]) {
        addResult('GM Tables', `${table} - Columns`, 'INFO', Object.keys(data[0]).join(', '))
      }
    }
  }
}

// ============================================================================
// LIVE GAMES, SCOUT, DATALAB API
// ============================================================================
function testLiveGames() {
  console.log('\n=== LIVE GAMES REGISTRY ===')
  const { data, error } = supabaseQuery('live_games_registry', 'select=*&limit=10')
  if (error) {
    addResult('Live Games', 'live_games_registry', 'FAIL', `Error: ${error}`)
  } else {
    addResult('Live Games', 'live_games_registry', 'PASS', `${data.length} entries`)
    if (data[0]) addResult('Live Games', 'Columns', 'INFO', Object.keys(data[0]).join(', '))
  }
}

function testScoutTables() {
  console.log('\n=== SCOUT AI TABLES ===')

  const { data: errors, error: errErr } = supabaseQuery('scout_errors', 'select=id,created_at,source,error_type&order=created_at.desc&limit=5')
  if (errErr) {
    addResult('Scout', 'scout_errors', 'FAIL', `Error: ${errErr}`)
  } else {
    addResult('Scout', 'scout_errors', 'PASS', `${errors.length} recent error entries`)
  }

  const { data: history, error: histErr } = supabaseQuery('scout_query_history', 'select=id,created_at&order=created_at.desc&limit=5')
  if (histErr) {
    addResult('Scout', 'scout_query_history', 'FAIL', `Error: ${histErr}`)
  } else {
    addResult('Scout', 'scout_query_history', 'PASS', `${history.length} recent queries`)
  }
}

function testDatalabAPI() {
  console.log('\n=== DATALAB API ENDPOINT ===')

  // Test base URL
  const base = httpFetch('https://datalab.sportsmockery.com')
  addResult('DataLab API', 'Base URL',
    base.status >= 200 && base.status < 500 ? 'PASS' : 'FAIL',
    `Status: ${base.status}`)

  // Test query endpoint
  const query = httpFetch('https://datalab.sportsmockery.com/api/query', 'POST',
    { query: 'What is the Bears record?', sessionId: 'test-health-check' })
  addResult('DataLab API', '/api/query Endpoint',
    query.status >= 200 && query.status < 500 ? 'PASS' : 'FAIL',
    `Status: ${query.status}, Body: ${(query.body || '').substring(0, 150)}`)

  // Test feature flags
  const flags = httpFetch('https://datalab.sportsmockery.com/api/feature-flags/check')
  addResult('DataLab API', '/api/feature-flags/check',
    flags.status >= 200 && flags.status < 500 ? 'PASS' : 'WARN',
    `Status: ${flags.status}`)
}

// ============================================================================
// TEST SM FRONTEND API ROUTES
// ============================================================================
function testFrontendAPIRoutes() {
  console.log('\n=== SM FRONTEND API ROUTES ===')

  const routes = [
    { path: '/api/team-data', desc: 'Team Data Aggregator', method: 'GET' },
    { path: '/api/bears/roster', desc: 'Bears Roster', method: 'GET' },
    { path: '/api/bears/schedule', desc: 'Bears Schedule', method: 'GET' },
    { path: '/api/bears/stats', desc: 'Bears Stats', method: 'GET' },
    { path: '/api/bears/games', desc: 'Bears Games', method: 'GET' },
    { path: '/api/bears/players', desc: 'Bears Players', method: 'GET' },
    { path: '/api/gm/teams', desc: 'GM Teams', method: 'GET' },
    { path: '/api/gm/leaderboard', desc: 'GM Leaderboard', method: 'GET' },
    { path: '/api/live-games', desc: 'Live Games', method: 'GET' },
  ]

  const BASE = 'https://test.sportsmockery.com'

  for (const { path, desc, method } of routes) {
    const result = httpFetch(`${BASE}${path}`, method)
    let bodyLen = 0
    let hasData = false

    try {
      if (result.body) {
        bodyLen = result.body.length
        const parsed = JSON.parse(result.body)
        hasData = Array.isArray(parsed) ? parsed.length > 0 : !!parsed
      }
    } catch { /* not JSON */ }

    addResult('SM API Routes', `${path} (${desc})`,
      result.status === 200 ? 'PASS' : (result.status > 0 ? 'WARN' : 'FAIL'),
      `Status: ${result.status}, Response: ${bodyLen} bytes${hasData ? ', has data' : ''}`)
  }
}

// ============================================================================
// TEST TEAM PAGE HTTP ROUTES
// ============================================================================
function testTeamPageRoutes() {
  console.log('\n=== TEAM PAGE HTTP ROUTES ===')

  const BASE = 'https://test.sportsmockery.com'
  const teams = ['chicago-bears', 'chicago-bulls', 'chicago-blackhawks', 'chicago-cubs', 'chicago-white-sox']
  const pages = ['', '/schedule', '/scores', '/stats', '/roster', '/players']

  for (const team of teams) {
    for (const page of pages) {
      const url = `${BASE}/${team}${page}`
      const pageName = page || '/hub'
      const result = httpFetch(url)

      addResult('Team Pages', `${team}${pageName}`,
        result.status === 200 ? 'PASS' : (result.status > 0 ? 'WARN' : 'FAIL'),
        `Status: ${result.status}`)
    }
  }
}

// ============================================================================
// MAIN
// ============================================================================
function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║     SPORTSMOCKERY DATALAB COMPREHENSIVE ROUTE TESTER       ║')
  console.log('║     Testing all Supabase connections & data completeness    ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  console.log(`\nTimestamp: ${new Date().toISOString()}`)
  console.log(`DataLab URL: ${DATALAB_URL}`)
  console.log(`Seasons: NFL=${SEASONS.NFL}, NBA=${SEASONS.NBA}, NHL=${SEASONS.NHL}, MLB=${SEASONS.MLB}\n`)

  // 1. Base connection
  testBaseConnection()

  // 2-6. Per-team tests
  const teams = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox']
  for (const team of teams) {
    console.log(`\n=== ${team.toUpperCase()} (${TEAM_CONFIGS[team].league}) ===`)
    testPlayersTable(team)
    testGamesTable(team)
    testSeasonRecord(team)
    testTeamSeasonStats(team)
    testPlayerGameStats(team)
    testCrossTableIntegrity(team)
  }

  // 7. GM Tables
  testGMTables()

  // 8. Live Games
  testLiveGames()

  // 9. Scout Tables
  testScoutTables()

  // 10. DataLab API
  testDatalabAPI()

  // 11. SM Frontend API Routes
  testFrontendAPIRoutes()

  // 12. Team Page HTTP Routes
  testTeamPageRoutes()

  // ========================================================================
  // GENERATE REPORT
  // ========================================================================
  console.log('\n\n')
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║                    COMPREHENSIVE REPORT                     ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')

  const pass = results.filter(r => r.status === 'PASS').length
  const fail = results.filter(r => r.status === 'FAIL').length
  const warn = results.filter(r => r.status === 'WARN').length
  const missing = results.filter(r => r.status === 'MISSING').length
  const info = results.filter(r => r.status === 'INFO').length

  console.log(`\n  PASS: ${pass}  |  FAIL: ${fail}  |  WARN: ${warn}  |  MISSING: ${missing}  |  INFO: ${info}`)
  console.log(`  Total checks: ${results.length}\n`)

  // Group by category
  const categories = [...new Set(results.map(r => r.category))]

  for (const cat of categories) {
    const catResults = results.filter(r => r.category === cat)
    const catFail = catResults.filter(r => r.status === 'FAIL' || r.status === 'MISSING').length
    const catWarn = catResults.filter(r => r.status === 'WARN').length

    const icon = catFail > 0 ? '❌' : catWarn > 0 ? '⚠️' : '✅'
    console.log(`\n${icon} ${cat}`)
    console.log('─'.repeat(60))

    for (const r of catResults) {
      const statusIcon = { PASS: '  ✅', FAIL: '  ❌', WARN: '  ⚠️', MISSING: '  🔍', INFO: '  ℹ️' }[r.status] || '  ❓'
      console.log(`${statusIcon} ${r.test}`)
      console.log(`       ${r.details}`)
    }
  }

  // FAILURES SUMMARY
  const failures = results.filter(r => r.status === 'FAIL' || r.status === 'MISSING')
  if (failures.length > 0) {
    console.log('\n\n╔══════════════════════════════════════════════════════════════╗')
    console.log('║                    FAILURES & MISSING DATA                  ║')
    console.log('╚══════════════════════════════════════════════════════════════╝')
    for (const f of failures) {
      console.log(`  ❌ [${f.category}] ${f.test}`)
      console.log(`     ${f.details}`)
    }
  }

  // WARNINGS SUMMARY
  const warnings = results.filter(r => r.status === 'WARN')
  if (warnings.length > 0) {
    console.log('\n\n╔══════════════════════════════════════════════════════════════╗')
    console.log('║                       WARNINGS                              ║')
    console.log('╚══════════════════════════════════════════════════════════════╝')
    for (const w of warnings) {
      console.log(`  ⚠️  [${w.category}] ${w.test}`)
      console.log(`     ${w.details}`)
    }
  }

  console.log('\n\n═══════════════════════════════════════════════════════════════')
  console.log(`Test completed at ${new Date().toISOString()}`)
  console.log('═══════════════════════════════════════════════════════════════\n')
}

main()
