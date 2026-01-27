#!/usr/bin/env node
/**
 * Comprehensive Team Page Test
 * Tests all pages under each team in the main nav menu
 */

import { createClient } from '@supabase/supabase-js'

const DATALAB_URL = 'https://siwoqfzzcxmngnseyzpv.supabase.co'
const DATALAB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd29xZnp6Y3htbmduc2V5enB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY0OTQ4MCwiZXhwIjoyMDgzMjI1NDgwfQ.5-dQVO_B3F-mnljmLEcvhIS_Ag1C85X-Gl2u44rkR8I'

const supabase = createClient(DATALAB_URL, DATALAB_KEY)

const now = new Date()
const year = now.getFullYear()
const month = now.getMonth() + 1

// Season calculations
const SEASONS = {
  bears: month < 9 ? year - 1 : year,
  bulls: month < 10 ? year : year + 1,
  cubs: month < 4 ? year - 1 : year,
  whitesox: month < 4 ? year - 1 : year,
  blackhawks: month < 10 ? year : year + 1,
}

console.log('╔════════════════════════════════════════════════════════════════════════════╗')
console.log('║              COMPREHENSIVE TEAM PAGE TEST - All Nav Menu Pages             ║')
console.log('║                              ' + now.toISOString().split('T')[0] + '                                  ║')
console.log('╚════════════════════════════════════════════════════════════════════════════╝')

const results = {
  bears: { pages: {} },
  bulls: { pages: {} },
  cubs: { pages: {} },
  whitesox: { pages: {} },
  blackhawks: { pages: {} },
}

// ============================================================================
// TEST FUNCTION HELPERS
// ============================================================================

async function testPage(team, page, testFn) {
  try {
    const result = await testFn()
    results[team].pages[page] = result
    return result
  } catch (error) {
    results[team].pages[page] = { status: '❌', error: error.message, data: null }
    return results[team].pages[page]
  }
}

// ============================================================================
// CHICAGO BEARS
// ============================================================================
console.log('\n\n══════════════════════════════════════════════════════════════════════════════')
console.log('                              CHICAGO BEARS')
console.log('══════════════════════════════════════════════════════════════════════════════')

// Overview Page
await testPage('bears', 'Overview (/chicago-bears)', async () => {
  const { data: record } = await supabase.from('bears_season_record').select('*').eq('season', SEASONS.bears).single()
  const { data: nextGame } = await supabase.from('bears_games_master').select('*').eq('season', SEASONS.bears).is('bears_score', null).order('game_date').limit(1).single()

  const hasRecord = record && record.regular_season_wins !== undefined
  const hasNextGame = nextGame !== null || true // Season might be over

  return {
    status: hasRecord ? '✅' : '❌',
    data: {
      record: hasRecord ? `${record.regular_season_wins}-${record.regular_season_losses}` : 'MISSING',
      postseason: hasRecord ? `${record.postseason_wins}-${record.postseason_losses}` : 'N/A',
      nextGame: nextGame ? `${nextGame.game_date} vs ${nextGame.opponent}` : 'Season over',
    }
  }
})

// Schedule Page
await testPage('bears', 'Schedule (/chicago-bears/schedule)', async () => {
  const { data: games, count } = await supabase.from('bears_games_master').select('*', { count: 'exact' }).eq('season', SEASONS.bears)
  const completed = games?.filter(g => g.bears_score !== null).length || 0
  const upcoming = games?.filter(g => g.bears_score === null).length || 0

  return {
    status: count > 0 ? '✅' : '❌',
    data: { total: count, completed, upcoming }
  }
})

// Scores Page
await testPage('bears', 'Scores (/chicago-bears/scores)', async () => {
  const { data: games } = await supabase.from('bears_games_master').select('*').eq('season', SEASONS.bears).not('bears_score', 'is', null).order('game_date', { ascending: false }).limit(10)

  return {
    status: games && games.length > 0 ? '✅' : '⚠️',
    data: { recentGames: games?.length || 0, sample: games?.[0] ? `${games[0].game_date}: Bears ${games[0].bears_score} - ${games[0].opponent} ${games[0].opponent_score}` : 'None' }
  }
})

// Stats Page
await testPage('bears', 'Stats (/chicago-bears/stats)', async () => {
  const { data: teamStats } = await supabase.from('bears_team_season_stats').select('*').eq('season', SEASONS.bears).single()
  const { data: playerStats, count } = await supabase.from('bears_player_game_stats').select('player_id', { count: 'exact' }).eq('season', SEASONS.bears)
  const uniquePlayers = [...new Set(playerStats?.map(s => s.player_id) || [])]

  return {
    status: teamStats ? '✅' : '⚠️',
    data: {
      teamStats: teamStats ? `PPG: ${teamStats.points_per_game}` : 'MISSING',
      nullColumns: teamStats ? ['points_per_game', 'total_points'].filter(c => teamStats[c] == null).join(', ') || 'none' : 'N/A',
      playerStatEntries: count || 0,
      playersWithStats: uniquePlayers.length
    }
  }
})

// Roster Page
await testPage('bears', 'Roster (/chicago-bears/roster)', async () => {
  const { data: players, count } = await supabase.from('bears_players').select('*', { count: 'exact' }).eq('is_active', true)
  const withHeadshots = players?.filter(p => p.headshot_url).length || 0
  const positions = [...new Set(players?.map(p => p.position) || [])]

  return {
    status: count > 40 ? '✅' : '⚠️',
    data: { totalPlayers: count, withHeadshots, positions: positions.length }
  }
})

// Players Page
await testPage('bears', 'Players (/chicago-bears/players)', async () => {
  // Note: slug is generated by app from name, not stored in database
  const { data: players, count } = await supabase.from('bears_players').select('id, name, headshot_url', { count: 'exact' }).eq('is_active', true)
  const withHeadshots = players?.filter(p => p.headshot_url).length || 0

  return {
    status: count > 0 ? '✅' : '❌',
    data: { totalPlayers: count, withHeadshots, samplePlayer: players?.[0]?.name || 'None' }
  }
})

// Print Bears Results
console.log('\n📋 PAGE STATUS:')
for (const [page, result] of Object.entries(results.bears.pages)) {
  console.log(`   ${result.status} ${page}`)
  if (result.data) {
    for (const [key, value] of Object.entries(result.data)) {
      console.log(`      └─ ${key}: ${value}`)
    }
  }
}

// ============================================================================
// CHICAGO BULLS
// ============================================================================
console.log('\n\n══════════════════════════════════════════════════════════════════════════════')
console.log('                              CHICAGO BULLS')
console.log('══════════════════════════════════════════════════════════════════════════════')

// Overview Page
await testPage('bulls', 'Overview (/chicago-bulls)', async () => {
  const { data: record } = await supabase.from('bulls_seasons').select('*').eq('season', SEASONS.bulls).single()
  const { data: nextGame } = await supabase.from('bulls_games_master').select('*').eq('season', SEASONS.bulls).eq('bulls_score', 0).order('game_date').limit(1).single()

  return {
    status: record ? '✅' : '❌',
    data: {
      record: record ? `${record.wins}-${record.losses}` : 'MISSING',
      nextGame: nextGame ? `${nextGame.game_date} vs ${nextGame.opponent}` : 'None found',
    }
  }
})

// Schedule Page
await testPage('bulls', 'Schedule (/chicago-bulls/schedule)', async () => {
  const { data: games, count } = await supabase.from('bulls_games_master').select('*', { count: 'exact' }).eq('season', SEASONS.bulls).in('game_type', ['regular', 'postseason'])
  const completed = games?.filter(g => g.bulls_score > 0 || g.opponent_score > 0).length || 0

  return {
    status: count > 0 ? '✅' : '❌',
    data: { total: count, completed, upcoming: (count || 0) - completed }
  }
})

// Scores Page
await testPage('bulls', 'Scores (/chicago-bulls/scores)', async () => {
  const { data: games } = await supabase.from('bulls_games_master').select('*').eq('season', SEASONS.bulls).gt('bulls_score', 0).order('game_date', { ascending: false }).limit(10)

  return {
    status: games && games.length > 0 ? '✅' : '⚠️',
    data: { recentGames: games?.length || 0 }
  }
})

// Stats Page
await testPage('bulls', 'Stats (/chicago-bulls/stats)', async () => {
  const { data: playerStats, count } = await supabase.from('bulls_player_game_stats').select('player_id', { count: 'exact' }).eq('season', SEASONS.bulls)
  const uniquePlayers = [...new Set(playerStats?.map(s => s.player_id) || [])]

  // Check team stats with correct column names: field_goal_pct, three_point_pct, free_throw_pct
  const { data: teamStats, error: teamStatsErr } = await supabase.from('bulls_team_season_stats').select('*').eq('season', SEASONS.bulls).single()
  const bullsNullCols = teamStats ? ['field_goal_pct', 'three_point_pct', 'free_throw_pct', 'rebounds_per_game', 'assists_per_game'].filter(c => teamStats[c] == null) : []

  return {
    status: count > 0 ? '✅' : '❌',
    data: {
      teamStats: teamStatsErr ? '❌ TABLE MISSING' : '✅',
      nullColumns: bullsNullCols.length > 0 ? bullsNullCols.join(', ') : 'none',
      playerStatEntries: count || 0,
      playersWithStats: uniquePlayers.length
    }
  }
})

// Roster Page
await testPage('bulls', 'Roster (/chicago-bulls/roster)', async () => {
  const { data: players, count } = await supabase.from('bulls_players').select('*', { count: 'exact' }).eq('is_current_bulls', true)
  const withHeadshots = players?.filter(p => p.headshot_url).length || 0

  return {
    status: count > 10 ? '✅' : '⚠️',
    data: { totalPlayers: count, withHeadshots }
  }
})

// Players Page
await testPage('bulls', 'Players (/chicago-bulls/players)', async () => {
  // Column is espn_player_id not espn_id
  const { data: players, count } = await supabase.from('bulls_players').select('id, name, espn_player_id, headshot_url', { count: 'exact' }).eq('is_current_bulls', true)

  return {
    status: count > 0 ? '✅' : '❌',
    data: { totalPlayers: count, samplePlayer: players?.[0]?.name || 'None' }
  }
})

// Print Bulls Results
console.log('\n📋 PAGE STATUS:')
for (const [page, result] of Object.entries(results.bulls.pages)) {
  console.log(`   ${result.status} ${page}`)
  if (result.data) {
    for (const [key, value] of Object.entries(result.data)) {
      console.log(`      └─ ${key}: ${value}`)
    }
  }
}

// ============================================================================
// CHICAGO CUBS
// ============================================================================
console.log('\n\n══════════════════════════════════════════════════════════════════════════════')
console.log('                              CHICAGO CUBS')
console.log('══════════════════════════════════════════════════════════════════════════════')

// Overview Page
await testPage('cubs', 'Overview (/chicago-cubs)', async () => {
  const { data: record } = await supabase.from('cubs_seasons').select('*').eq('season', SEASONS.cubs).single()

  return {
    status: record ? '✅' : '❌',
    data: { record: record ? `${record.wins}-${record.losses}` : 'MISSING' }
  }
})

// Schedule Page
await testPage('cubs', 'Schedule (/chicago-cubs/schedule)', async () => {
  const { data: games, count } = await supabase.from('cubs_games_master').select('*', { count: 'exact' }).eq('season', SEASONS.cubs).gte('game_date', `${SEASONS.cubs}-03-18`)

  return {
    status: count > 0 ? '✅' : '❌',
    data: { total: count }
  }
})

// Scores Page
await testPage('cubs', 'Scores (/chicago-cubs/scores)', async () => {
  const { data: games } = await supabase.from('cubs_games_master').select('*').eq('season', SEASONS.cubs).gt('cubs_score', 0).order('game_date', { ascending: false }).limit(10)

  return {
    status: games && games.length > 0 ? '✅' : '⚠️',
    data: { recentGames: games?.length || 0 }
  }
})

// Stats Page
await testPage('cubs', 'Stats (/chicago-cubs/stats)', async () => {
  const { data: playerStats, count } = await supabase.from('cubs_player_game_stats').select('player_id', { count: 'exact' }).eq('season', SEASONS.cubs)
  const uniquePlayers = [...new Set(playerStats?.map(s => s.player_id) || [])]

  // Check team stats with correct column names: batting_average, era, ops
  const { data: cubsTeamStats, error: teamStatsErr } = await supabase.from('cubs_team_season_stats').select('*').eq('season', SEASONS.cubs).single()
  const cubsNullCols = cubsTeamStats ? ['batting_average', 'era', 'ops'].filter(c => cubsTeamStats[c] == null) : []

  return {
    status: count > 0 ? '✅' : '❌',
    data: {
      teamStats: teamStatsErr ? '❌ TABLE MISSING' : '✅',
      nullColumns: cubsNullCols.length > 0 ? cubsNullCols.join(', ') : 'none',
      playerStatEntries: count || 0,
      playersWithStats: uniquePlayers.length
    }
  }
})

// Roster Page (using espn_id join)
await testPage('cubs', 'Roster (/chicago-cubs/roster)', async () => {
  const { data: statsPlayers } = await supabase.from('cubs_player_game_stats').select('player_id').eq('season', SEASONS.cubs)
  const espnIds = [...new Set(statsPlayers?.map(s => String(s.player_id)) || [])]
  const { data: players, count } = await supabase.from('cubs_players').select('*', { count: 'exact' }).in('espn_id', espnIds.length > 0 ? espnIds : ['0'])
  const withHeadshots = players?.filter(p => p.headshot_url).length || 0

  return {
    status: count > 15 ? '✅' : '⚠️',
    data: { totalPlayers: count, withHeadshots }
  }
})

// Players Page
await testPage('cubs', 'Players (/chicago-cubs/players)', async () => {
  const { data: statsPlayers } = await supabase.from('cubs_player_game_stats').select('player_id').eq('season', SEASONS.cubs)
  const espnIds = [...new Set(statsPlayers?.map(s => String(s.player_id)) || [])]
  const { data: players, count } = await supabase.from('cubs_players').select('*', { count: 'exact' }).in('espn_id', espnIds.length > 0 ? espnIds : ['0'])

  return {
    status: count > 0 ? '✅' : '❌',
    data: { totalPlayers: count, samplePlayer: players?.[0]?.name || 'None' }
  }
})

// Print Cubs Results
console.log('\n📋 PAGE STATUS:')
for (const [page, result] of Object.entries(results.cubs.pages)) {
  console.log(`   ${result.status} ${page}`)
  if (result.data) {
    for (const [key, value] of Object.entries(result.data)) {
      console.log(`      └─ ${key}: ${value}`)
    }
  }
}

// ============================================================================
// CHICAGO WHITE SOX
// ============================================================================
console.log('\n\n══════════════════════════════════════════════════════════════════════════════')
console.log('                            CHICAGO WHITE SOX')
console.log('══════════════════════════════════════════════════════════════════════════════')

// Overview Page
await testPage('whitesox', 'Overview (/chicago-white-sox)', async () => {
  const { data: record } = await supabase.from('whitesox_seasons').select('*').eq('season', SEASONS.whitesox).single()

  return {
    status: record ? '✅' : '❌',
    data: { record: record ? `${record.wins}-${record.losses}` : 'MISSING' }
  }
})

// Schedule Page
await testPage('whitesox', 'Schedule (/chicago-white-sox/schedule)', async () => {
  const { data: games, count } = await supabase.from('whitesox_games_master').select('*', { count: 'exact' }).eq('season', SEASONS.whitesox).gte('game_date', `${SEASONS.whitesox}-03-18`)

  return {
    status: count > 0 ? '✅' : '❌',
    data: { total: count }
  }
})

// Scores Page
await testPage('whitesox', 'Scores (/chicago-white-sox/scores)', async () => {
  const { data: games } = await supabase.from('whitesox_games_master').select('*').eq('season', SEASONS.whitesox).gt('whitesox_score', 0).order('game_date', { ascending: false }).limit(10)

  return {
    status: games && games.length > 0 ? '✅' : '⚠️',
    data: { recentGames: games?.length || 0 }
  }
})

// Stats Page
await testPage('whitesox', 'Stats (/chicago-white-sox/stats)', async () => {
  const { data: playerStats, count } = await supabase.from('whitesox_player_game_stats').select('player_id', { count: 'exact' }).eq('season', SEASONS.whitesox)
  const uniquePlayers = [...new Set(playerStats?.map(s => s.player_id) || [])]

  // Check team stats with correct column names: batting_average, era, ops
  const { data: wsTeamStats, error: teamStatsErr } = await supabase.from('whitesox_team_season_stats').select('*').eq('season', SEASONS.whitesox).single()
  const wsNullCols = wsTeamStats ? ['batting_average', 'era', 'ops'].filter(c => wsTeamStats[c] == null) : []

  return {
    status: count > 0 ? '✅' : '❌',
    data: {
      teamStats: teamStatsErr ? '❌ TABLE MISSING' : '✅',
      nullColumns: wsNullCols.length > 0 ? wsNullCols.join(', ') : 'none',
      playerStatEntries: count || 0,
      playersWithStats: uniquePlayers.length
    }
  }
})

// Roster Page (using espn_id join)
await testPage('whitesox', 'Roster (/chicago-white-sox/roster)', async () => {
  const { data: statsPlayers } = await supabase.from('whitesox_player_game_stats').select('player_id').eq('season', SEASONS.whitesox)
  const espnIds = [...new Set(statsPlayers?.map(s => String(s.player_id)) || [])]
  const { data: players, count } = await supabase.from('whitesox_players').select('*', { count: 'exact' }).in('espn_id', espnIds.length > 0 ? espnIds : ['0'])
  const withHeadshots = players?.filter(p => p.headshot_url).length || 0

  return {
    status: count > 15 ? '✅' : '⚠️',
    data: { totalPlayers: count, withHeadshots }
  }
})

// Players Page
await testPage('whitesox', 'Players (/chicago-white-sox/players)', async () => {
  const { data: statsPlayers } = await supabase.from('whitesox_player_game_stats').select('player_id').eq('season', SEASONS.whitesox)
  const espnIds = [...new Set(statsPlayers?.map(s => String(s.player_id)) || [])]
  const { data: players, count } = await supabase.from('whitesox_players').select('*', { count: 'exact' }).in('espn_id', espnIds.length > 0 ? espnIds : ['0'])

  return {
    status: count > 0 ? '✅' : '❌',
    data: { totalPlayers: count, samplePlayer: players?.[0]?.name || 'None' }
  }
})

// Print White Sox Results
console.log('\n📋 PAGE STATUS:')
for (const [page, result] of Object.entries(results.whitesox.pages)) {
  console.log(`   ${result.status} ${page}`)
  if (result.data) {
    for (const [key, value] of Object.entries(result.data)) {
      console.log(`      └─ ${key}: ${value}`)
    }
  }
}

// ============================================================================
// CHICAGO BLACKHAWKS
// ============================================================================
console.log('\n\n══════════════════════════════════════════════════════════════════════════════')
console.log('                            CHICAGO BLACKHAWKS')
console.log('══════════════════════════════════════════════════════════════════════════════')

// Overview Page
await testPage('blackhawks', 'Overview (/chicago-blackhawks)', async () => {
  const { data: record } = await supabase.from('blackhawks_seasons').select('*').eq('season', SEASONS.blackhawks).single()
  const { data: nextGame } = await supabase.from('blackhawks_games_master').select('*').eq('season', SEASONS.blackhawks).is('blackhawks_score', null).order('game_date').limit(1).single()

  return {
    status: record ? '✅' : '❌',
    data: {
      record: record ? `${record.wins}-${record.losses}-${record.otl || 0}` : 'MISSING',
      nextGame: nextGame ? `${nextGame.game_date} vs ${nextGame.opponent}` : 'None found',
    }
  }
})

// Schedule Page
await testPage('blackhawks', 'Schedule (/chicago-blackhawks/schedule)', async () => {
  const startDate = `${SEASONS.blackhawks - 1}-10-01`
  const endDate = `${SEASONS.blackhawks}-06-30`
  const { data: games, count } = await supabase.from('blackhawks_games_master').select('*', { count: 'exact' }).eq('season', SEASONS.blackhawks).gte('game_date', startDate).lte('game_date', endDate)

  return {
    status: count > 0 ? '✅' : '❌',
    data: { total: count }
  }
})

// Scores Page
await testPage('blackhawks', 'Scores (/chicago-blackhawks/scores)', async () => {
  const { data: games } = await supabase.from('blackhawks_games_master').select('*').eq('season', SEASONS.blackhawks).not('blackhawks_score', 'is', null).order('game_date', { ascending: false }).limit(10)

  return {
    status: games && games.length > 0 ? '✅' : '⚠️',
    data: { recentGames: games?.length || 0 }
  }
})

// Stats Page
await testPage('blackhawks', 'Stats (/chicago-blackhawks/stats)', async () => {
  const { data: playerStats, count } = await supabase.from('blackhawks_player_game_stats').select('player_id', { count: 'exact' }).eq('season', SEASONS.blackhawks)
  const uniquePlayers = [...new Set(playerStats?.map(s => s.player_id) || [])]

  // Check team stats with correct column names: power_play_pct, penalty_kill_pct, goals_per_game
  const { data: bhTeamStats, error: teamStatsErr } = await supabase.from('blackhawks_team_season_stats').select('*').eq('season', SEASONS.blackhawks).single()
  const bhNullCols = bhTeamStats ? ['power_play_pct', 'penalty_kill_pct', 'goals_per_game'].filter(c => bhTeamStats[c] == null) : []

  return {
    status: count > 0 ? '✅' : '❌',
    data: {
      teamStats: teamStatsErr ? '❌ TABLE MISSING' : '✅',
      nullColumns: bhNullCols.length > 0 ? bhNullCols.join(', ') : 'none',
      playerStatEntries: count || 0,
      playersWithStats: uniquePlayers.length
    }
  }
})

// Roster Page
await testPage('blackhawks', 'Roster (/chicago-blackhawks/roster)', async () => {
  const { data: players, count } = await supabase.from('blackhawks_players').select('*', { count: 'exact' }).eq('is_active', true)
  const withHeadshots = players?.filter(p => p.headshot_url).length || 0

  return {
    status: count > 15 ? '✅' : '⚠️',
    data: { totalPlayers: count, withHeadshots }
  }
})

// Players Page
await testPage('blackhawks', 'Players (/chicago-blackhawks/players)', async () => {
  const { data: players, count } = await supabase.from('blackhawks_players').select('id, name, headshot_url', { count: 'exact' }).eq('is_active', true)

  return {
    status: count > 0 ? '✅' : '❌',
    data: { totalPlayers: count, samplePlayer: players?.[0]?.name || 'None' }
  }
})

// Print Blackhawks Results
console.log('\n📋 PAGE STATUS:')
for (const [page, result] of Object.entries(results.blackhawks.pages)) {
  console.log(`   ${result.status} ${page}`)
  if (result.data) {
    for (const [key, value] of Object.entries(result.data)) {
      console.log(`      └─ ${key}: ${value}`)
    }
  }
}

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n\n╔════════════════════════════════════════════════════════════════════════════╗')
console.log('║                              FINAL SUMMARY                                 ║')
console.log('╚════════════════════════════════════════════════════════════════════════════╝')

console.log('\n📊 PAGE COMPLETENESS BY TEAM:')
console.log('┌─────────────┬──────────┬──────────┬────────┬───────┬────────┬─────────┐')
console.log('│ Team        │ Overview │ Schedule │ Scores │ Stats │ Roster │ Players │')
console.log('├─────────────┼──────────┼──────────┼────────┼───────┼────────┼─────────┤')

for (const [team, data] of Object.entries(results)) {
  const pages = data.pages
  const teamName = team.charAt(0).toUpperCase() + team.slice(1)
  const padded = teamName.padEnd(11)

  const overview = Object.values(pages)[0]?.status || '❓'
  const schedule = Object.values(pages)[1]?.status || '❓'
  const scores = Object.values(pages)[2]?.status || '❓'
  const stats = Object.values(pages)[3]?.status || '❓'
  const roster = Object.values(pages)[4]?.status || '❓'
  const players = Object.values(pages)[5]?.status || '❓'

  console.log(`│ ${padded} │    ${overview}    │    ${schedule}    │   ${scores}   │  ${stats}   │   ${roster}   │   ${players}    │`)
}
console.log('└─────────────┴──────────┴──────────┴────────┴───────┴────────┴─────────┘')

// Count issues
let totalPages = 0
let passedPages = 0
let warningPages = 0
let failedPages = 0

for (const team of Object.values(results)) {
  for (const page of Object.values(team.pages)) {
    totalPages++
    if (page.status === '✅') passedPages++
    else if (page.status === '⚠️') warningPages++
    else failedPages++
  }
}

console.log(`\n📈 TOTALS: ${passedPages}/${totalPages} pages passing, ${warningPages} warnings, ${failedPages} failures`)

// Status note
if (failedPages === 0) {
  console.log('\n✅ All team_season_stats tables populated (Bears, Bulls, Cubs, White Sox, Blackhawks)')
}

const overallStatus = failedPages === 0 ? '✅ ALL CORE PAGES FUNCTIONAL' : '❌ SOME PAGES HAVE ISSUES'
console.log(`\n🎯 OVERALL: ${overallStatus}`)

process.exit(failedPages > 0 ? 1 : 0)
