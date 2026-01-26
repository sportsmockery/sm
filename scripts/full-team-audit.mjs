#!/usr/bin/env node
/**
 * Full Team Page Audit Script
 * Checks all data for all Chicago teams to ensure production readiness
 */

import { createClient } from '@supabase/supabase-js'

const DATALAB_URL = 'https://siwoqfzzcxmngnseyzpv.supabase.co'
const DATALAB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd29xZnp6Y3htbmduc2V5enB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY0OTQ4MCwiZXhwIjoyMDgzMjI1NDgwfQ.5-dQVO_B3F-mnljmLEcvhIS_Ag1C85X-Gl2u44rkR8I'

const supabase = createClient(DATALAB_URL, DATALAB_KEY)

// Current date info
const now = new Date()
const year = now.getFullYear()
const month = now.getMonth() + 1

// Season calculations (matching team-config.ts logic)
const SEASONS = {
  bears: month < 9 ? year - 1 : year,  // NFL: 2025
  bulls: month < 10 ? year : year + 1,  // NBA: 2026
  cubs: month < 4 ? year - 1 : year,    // MLB: 2025
  whitesox: month < 4 ? year - 1 : year, // MLB: 2025
  blackhawks: month < 10 ? year : year + 1, // NHL: 2026
}

console.log('╔══════════════════════════════════════════════════════════════════╗')
console.log('║         FULL TEAM PAGE AUDIT - test.sportsmockery.com           ║')
console.log('║                    ' + now.toISOString().split('T')[0] + '                              ║')
console.log('╚══════════════════════════════════════════════════════════════════╝')

let totalIssues = 0
let criticalIssues = []
let warnings = []

// ============================================================================
// CHICAGO BEARS (NFL)
// ============================================================================
console.log('\n\n═══════════════════════════════════════════════════════════════════')
console.log('                      CHICAGO BEARS (NFL)')
console.log('                        Season: ' + SEASONS.bears)
console.log('═══════════════════════════════════════════════════════════════════')

// 1. Check Season Record
console.log('\n📊 RECORD CHECK')
const { data: bearsRecord } = await supabase
  .from('bears_season_record')
  .select('*')
  .eq('season', SEASONS.bears)
  .single()

if (bearsRecord) {
  const regRecord = `${bearsRecord.regular_season_wins}-${bearsRecord.regular_season_losses}`
  const postRecord = `${bearsRecord.postseason_wins}-${bearsRecord.postseason_losses}`
  console.log(`   ✅ Regular Season: ${regRecord}`)
  console.log(`   ✅ Postseason: ${postRecord}`)
  console.log(`   ✅ Division Rank: ${bearsRecord.division_rank || 'N/A'}`)
} else {
  console.log('   ❌ CRITICAL: No season record found!')
  criticalIssues.push('Bears: No season record in bears_season_record')
  totalIssues++
}

// 2. Check Schedule/Games
console.log('\n📅 SCHEDULE CHECK')
const { data: bearsGames, count: bearsGamesCount } = await supabase
  .from('bears_games_master')
  .select('*', { count: 'exact' })
  .eq('season', SEASONS.bears)

const bearsCompleted = bearsGames?.filter(g => g.bears_score !== null && g.opponent_score !== null) || []
const bearsUpcoming = bearsGames?.filter(g => g.bears_score === null) || []
const bearsRegular = bearsGames?.filter(g => g.game_type === 'regular') || []
const bearsPost = bearsGames?.filter(g => g.game_type === 'postseason' || g.is_playoff === true) || []

console.log(`   Total Games: ${bearsGamesCount || 0}`)
console.log(`   Regular Season: ${bearsRegular.length}`)
console.log(`   Postseason: ${bearsPost.length}`)
console.log(`   Completed: ${bearsCompleted.length}`)
console.log(`   Upcoming: ${bearsUpcoming.length}`)

if (bearsGamesCount === 0) {
  console.log('   ❌ CRITICAL: No games found!')
  criticalIssues.push('Bears: No games in schedule')
  totalIssues++
} else if (bearsRegular.length === 0) {
  console.log('   ⚠️  WARNING: No regular season games tagged')
  warnings.push('Bears: game_type not set for regular season games')
} else {
  console.log('   ✅ Schedule looks good')
}

// 3. Check Players/Roster
console.log('\n👥 ROSTER CHECK')
const { data: bearsPlayers, count: bearsPlayersCount } = await supabase
  .from('bears_players')
  .select('id, name, position, is_active, headshot_url', { count: 'exact' })
  .eq('is_active', true)

const bearsWithHeadshots = bearsPlayers?.filter(p => p.headshot_url) || []
console.log(`   Active Players: ${bearsPlayersCount || 0}`)
console.log(`   With Headshots: ${bearsWithHeadshots.length}`)

if (bearsPlayersCount === 0) {
  console.log('   ❌ CRITICAL: No active players!')
  criticalIssues.push('Bears: No active players')
  totalIssues++
} else if (bearsPlayersCount < 40) {
  console.log('   ⚠️  WARNING: Fewer than expected players')
  warnings.push(`Bears: Only ${bearsPlayersCount} active players (expected ~53-81)`)
} else {
  console.log('   ✅ Roster looks good')
}

// 4. Check Player Stats
console.log('\n📈 STATS CHECK')
const { data: bearsStats, count: bearsStatsCount } = await supabase
  .from('bears_player_game_stats')
  .select('player_id', { count: 'exact' })
  .eq('season', SEASONS.bears)

const uniqueBearsStatsPlayers = [...new Set(bearsStats?.map(s => s.player_id) || [])]
console.log(`   Total Stat Entries: ${bearsStatsCount || 0}`)
console.log(`   Players with Stats: ${uniqueBearsStatsPlayers.length}`)

if (bearsStatsCount === 0) {
  console.log('   ❌ CRITICAL: No player stats!')
  criticalIssues.push('Bears: No player game stats')
  totalIssues++
} else {
  console.log('   ✅ Stats available')
}

// 5. Check Team Season Stats
const { data: bearsTeamStats } = await supabase
  .from('bears_team_season_stats')
  .select('*')
  .eq('season', SEASONS.bears)
  .single()

if (bearsTeamStats) {
  console.log(`   Team PPG: ${bearsTeamStats.points_per_game}`)
  console.log(`   ✅ Team stats available`)
} else {
  console.log('   ⚠️  WARNING: No team season stats')
  warnings.push('Bears: No team season stats')
}


// ============================================================================
// CHICAGO BULLS (NBA)
// ============================================================================
console.log('\n\n═══════════════════════════════════════════════════════════════════')
console.log('                      CHICAGO BULLS (NBA)')
console.log('                        Season: ' + SEASONS.bulls)
console.log('═══════════════════════════════════════════════════════════════════')

// 1. Check Season Record
console.log('\n📊 RECORD CHECK')
const { data: bullsRecord } = await supabase
  .from('bulls_seasons')
  .select('*')
  .eq('season', SEASONS.bulls)
  .single()

if (bullsRecord) {
  console.log(`   ✅ Record: ${bullsRecord.wins}-${bullsRecord.losses}`)
} else {
  console.log('   ❌ CRITICAL: No season record found!')
  criticalIssues.push('Bulls: No season record in bulls_seasons')
  totalIssues++
}

// 2. Check Schedule/Games
console.log('\n📅 SCHEDULE CHECK')
const { data: bullsGames, count: bullsGamesCount } = await supabase
  .from('bulls_games_master')
  .select('*', { count: 'exact' })
  .eq('season', SEASONS.bulls)

const bullsCompleted = bullsGames?.filter(g => g.bulls_score > 0 || g.opponent_score > 0) || []
const bullsUpcoming = bullsGames?.filter(g => g.bulls_score === 0 && g.opponent_score === 0) || []
const bullsRegular = bullsGames?.filter(g => g.game_type === 'regular') || []

console.log(`   Total Games: ${bullsGamesCount || 0}`)
console.log(`   Regular Season: ${bullsRegular.length}`)
console.log(`   Completed: ${bullsCompleted.length}`)
console.log(`   Upcoming: ${bullsUpcoming.length}`)

if (bullsGamesCount === 0) {
  console.log('   ❌ CRITICAL: No games found!')
  criticalIssues.push('Bulls: No games in schedule')
  totalIssues++
} else {
  console.log('   ✅ Schedule looks good')
}

// 3. Check Players/Roster
console.log('\n👥 ROSTER CHECK')
const { data: bullsPlayers, count: bullsPlayersCount } = await supabase
  .from('bulls_players')
  .select('id, name, position, is_current_bulls, headshot_url', { count: 'exact' })
  .eq('is_current_bulls', true)

const bullsWithHeadshots = bullsPlayers?.filter(p => p.headshot_url) || []
console.log(`   Current Players: ${bullsPlayersCount || 0}`)
console.log(`   With Headshots: ${bullsWithHeadshots.length}`)

if (bullsPlayersCount === 0) {
  console.log('   ❌ CRITICAL: No current players!')
  criticalIssues.push('Bulls: No current players')
  totalIssues++
} else if (bullsPlayersCount < 12) {
  console.log('   ⚠️  WARNING: Fewer than expected players')
  warnings.push(`Bulls: Only ${bullsPlayersCount} current players (expected ~15-17)`)
} else {
  console.log('   ✅ Roster looks good')
}

// 4. Check Player Stats
console.log('\n📈 STATS CHECK')
const { data: bullsStats, count: bullsStatsCount } = await supabase
  .from('bulls_player_game_stats')
  .select('player_id', { count: 'exact' })
  .eq('season', SEASONS.bulls)

const uniqueBullsStatsPlayers = [...new Set(bullsStats?.map(s => s.player_id) || [])]
console.log(`   Total Stat Entries: ${bullsStatsCount || 0}`)
console.log(`   Players with Stats: ${uniqueBullsStatsPlayers.length}`)

if (bullsStatsCount === 0) {
  console.log('   ❌ CRITICAL: No player stats!')
  criticalIssues.push('Bulls: No player game stats')
  totalIssues++
} else {
  console.log('   ✅ Stats available')
}

// 5. Check Team Season Stats
const { data: bullsTeamStats } = await supabase
  .from('bulls_team_season_stats')
  .select('*')
  .eq('season', SEASONS.bulls)
  .single()

if (bullsTeamStats) {
  console.log(`   ✅ Team stats available`)
} else {
  console.log('   ⚠️  WARNING: No team season stats')
  warnings.push('Bulls: No team season stats')
}


// ============================================================================
// CHICAGO CUBS (MLB)
// ============================================================================
console.log('\n\n═══════════════════════════════════════════════════════════════════')
console.log('                      CHICAGO CUBS (MLB)')
console.log('                        Season: ' + SEASONS.cubs)
console.log('═══════════════════════════════════════════════════════════════════')

// 1. Check Season Record
console.log('\n📊 RECORD CHECK')
const { data: cubsRecord } = await supabase
  .from('cubs_seasons')
  .select('*')
  .eq('season', SEASONS.cubs)
  .single()

if (cubsRecord) {
  console.log(`   ✅ Record: ${cubsRecord.wins}-${cubsRecord.losses}`)
} else {
  console.log('   ❌ CRITICAL: No season record found!')
  criticalIssues.push('Cubs: No season record in cubs_seasons')
  totalIssues++
}

// 2. Check Schedule/Games
console.log('\n📅 SCHEDULE CHECK')
const { data: cubsGames, count: cubsGamesCount } = await supabase
  .from('cubs_games_master')
  .select('*', { count: 'exact' })
  .eq('season', SEASONS.cubs)
  .gte('game_date', `${SEASONS.cubs}-03-18`) // Filter spring training

const cubsCompleted = cubsGames?.filter(g => g.cubs_score > 0 || g.opponent_score > 0) || []
console.log(`   Total Games (reg+post): ${cubsGamesCount || 0}`)
console.log(`   Completed: ${cubsCompleted.length}`)

if (cubsGamesCount === 0) {
  console.log('   ❌ CRITICAL: No games found!')
  criticalIssues.push('Cubs: No games in schedule')
  totalIssues++
} else {
  console.log('   ✅ Schedule looks good')
}

// 3. Check Players/Roster
console.log('\n👥 ROSTER CHECK')
// Cubs: Get players with game stats since is_active is unreliable
// IMPORTANT: stats player_id = players espn_id (NOT id)
const { data: cubsStatsPlayers } = await supabase
  .from('cubs_player_game_stats')
  .select('player_id')
  .eq('season', SEASONS.cubs)

const uniqueCubsEspnIds = [...new Set(cubsStatsPlayers?.map(s => String(s.player_id)) || [])]

const { data: cubsPlayers, count: cubsPlayersCount } = await supabase
  .from('cubs_players')
  .select('id, name, position, headshot_url', { count: 'exact' })
  .in('espn_id', uniqueCubsEspnIds.length > 0 ? uniqueCubsEspnIds : ['0'])

const cubsWithHeadshots = cubsPlayers?.filter(p => p.headshot_url) || []
console.log(`   Players with Stats: ${cubsPlayersCount || 0}`)
console.log(`   With Headshots: ${cubsWithHeadshots.length}`)

if (cubsPlayersCount === 0) {
  console.log('   ❌ CRITICAL: No players with stats!')
  criticalIssues.push('Cubs: No players with game stats')
  totalIssues++
} else if (cubsPlayersCount < 20) {
  console.log('   ⚠️  WARNING: Fewer than expected players')
  warnings.push(`Cubs: Only ${cubsPlayersCount} players with stats (expected ~40+)`)
} else {
  console.log('   ✅ Roster looks good')
}

// 4. Check Player Stats
console.log('\n📈 STATS CHECK')
const { count: cubsStatsCount } = await supabase
  .from('cubs_player_game_stats')
  .select('player_id', { count: 'exact' })
  .eq('season', SEASONS.cubs)

console.log(`   Total Stat Entries: ${cubsStatsCount || 0}`)
console.log(`   Players with Stats: ${uniqueCubsEspnIds.length}`)

if (cubsStatsCount === 0) {
  console.log('   ❌ CRITICAL: No player stats!')
  criticalIssues.push('Cubs: No player game stats')
  totalIssues++
} else {
  console.log('   ✅ Stats available')
}


// ============================================================================
// CHICAGO WHITE SOX (MLB)
// ============================================================================
console.log('\n\n═══════════════════════════════════════════════════════════════════')
console.log('                    CHICAGO WHITE SOX (MLB)')
console.log('                        Season: ' + SEASONS.whitesox)
console.log('═══════════════════════════════════════════════════════════════════')

// 1. Check Season Record
console.log('\n📊 RECORD CHECK')
const { data: wsRecord } = await supabase
  .from('whitesox_seasons')
  .select('*')
  .eq('season', SEASONS.whitesox)
  .single()

if (wsRecord) {
  console.log(`   ✅ Record: ${wsRecord.wins}-${wsRecord.losses}`)
} else {
  console.log('   ❌ CRITICAL: No season record found!')
  criticalIssues.push('White Sox: No season record in whitesox_seasons')
  totalIssues++
}

// 2. Check Schedule/Games
console.log('\n📅 SCHEDULE CHECK')
const { data: wsGames, count: wsGamesCount } = await supabase
  .from('whitesox_games_master')
  .select('*', { count: 'exact' })
  .eq('season', SEASONS.whitesox)
  .gte('game_date', `${SEASONS.whitesox}-03-18`)

const wsCompleted = wsGames?.filter(g => g.whitesox_score > 0 || g.opponent_score > 0) || []
console.log(`   Total Games (reg+post): ${wsGamesCount || 0}`)
console.log(`   Completed: ${wsCompleted.length}`)

if (wsGamesCount === 0) {
  console.log('   ❌ CRITICAL: No games found!')
  criticalIssues.push('White Sox: No games in schedule')
  totalIssues++
} else {
  console.log('   ✅ Schedule looks good')
}

// 3. Check Players/Roster
console.log('\n👥 ROSTER CHECK')
// White Sox: Get players with game stats since is_active is unreliable
// IMPORTANT: stats player_id = players espn_id (NOT id)
const { data: wsStatsPlayers } = await supabase
  .from('whitesox_player_game_stats')
  .select('player_id')
  .eq('season', SEASONS.whitesox)

const uniqueWsEspnIds = [...new Set(wsStatsPlayers?.map(s => String(s.player_id)) || [])]

const { data: wsPlayers, count: wsPlayersCount } = await supabase
  .from('whitesox_players')
  .select('id, name, position, headshot_url', { count: 'exact' })
  .in('espn_id', uniqueWsEspnIds.length > 0 ? uniqueWsEspnIds : ['0'])

const wsWithHeadshots = wsPlayers?.filter(p => p.headshot_url) || []
console.log(`   Players with Stats: ${wsPlayersCount || 0}`)
console.log(`   With Headshots: ${wsWithHeadshots.length}`)

if (wsPlayersCount === 0) {
  console.log('   ❌ CRITICAL: No players with stats!')
  criticalIssues.push('White Sox: No players with game stats')
  totalIssues++
} else if (wsPlayersCount < 20) {
  console.log('   ⚠️  WARNING: Fewer than expected players')
  warnings.push(`White Sox: Only ${wsPlayersCount} players with stats (expected ~40+)`)
} else {
  console.log('   ✅ Roster looks good')
}

// 4. Check Player Stats
console.log('\n📈 STATS CHECK')
const { count: wsStatsCount } = await supabase
  .from('whitesox_player_game_stats')
  .select('player_id', { count: 'exact' })
  .eq('season', SEASONS.whitesox)

console.log(`   Total Stat Entries: ${wsStatsCount || 0}`)
console.log(`   Players with Stats: ${uniqueWsEspnIds.length}`)

if (wsStatsCount === 0) {
  console.log('   ❌ CRITICAL: No player stats!')
  criticalIssues.push('White Sox: No player game stats')
  totalIssues++
} else {
  console.log('   ✅ Stats available')
}


// ============================================================================
// CHICAGO BLACKHAWKS (NHL)
// ============================================================================
console.log('\n\n═══════════════════════════════════════════════════════════════════')
console.log('                   CHICAGO BLACKHAWKS (NHL)')
console.log('                        Season: ' + SEASONS.blackhawks)
console.log('═══════════════════════════════════════════════════════════════════')

// 1. Check Season Record
console.log('\n📊 RECORD CHECK')
const { data: bhRecord } = await supabase
  .from('blackhawks_seasons')
  .select('*')
  .eq('season', SEASONS.blackhawks)
  .single()

if (bhRecord) {
  console.log(`   ✅ Record: ${bhRecord.wins}-${bhRecord.losses}-${bhRecord.otl || 0}`)
} else {
  console.log('   ❌ CRITICAL: No season record found!')
  criticalIssues.push('Blackhawks: No season record in blackhawks_seasons')
  totalIssues++
}

// 2. Check Schedule/Games
console.log('\n📅 SCHEDULE CHECK')
// NHL season dates: Oct of (season-1) to June of season
const bhStartDate = `${SEASONS.blackhawks - 1}-10-01`
const bhEndDate = `${SEASONS.blackhawks}-06-30`

const { data: bhGames, count: bhGamesCount } = await supabase
  .from('blackhawks_games_master')
  .select('*', { count: 'exact' })
  .eq('season', SEASONS.blackhawks)
  .gte('game_date', bhStartDate)
  .lte('game_date', bhEndDate)

const bhCompleted = bhGames?.filter(g => g.blackhawks_score !== null && g.opponent_score !== null) || []
const bhRegular = bhGames?.filter(g => g.game_type === 'regular') || []
const bhPreseason = bhGames?.filter(g => g.game_type === 'preseason') || []

console.log(`   Total Games: ${bhGamesCount || 0}`)
console.log(`   Regular Season: ${bhRegular.length}`)
console.log(`   Preseason: ${bhPreseason.length}`)
console.log(`   Completed: ${bhCompleted.length}`)

if (bhGamesCount === 0) {
  console.log('   ❌ CRITICAL: No games found!')
  criticalIssues.push('Blackhawks: No games in schedule')
  totalIssues++
} else {
  console.log('   ✅ Schedule looks good')
}

// 3. Check Players/Roster
console.log('\n👥 ROSTER CHECK')
const { data: bhPlayers, count: bhPlayersCount } = await supabase
  .from('blackhawks_players')
  .select('id, name, position, is_active, headshot_url', { count: 'exact' })
  .eq('is_active', true)

const bhWithHeadshots = bhPlayers?.filter(p => p.headshot_url) || []
console.log(`   Active Players: ${bhPlayersCount || 0}`)
console.log(`   With Headshots: ${bhWithHeadshots.length}`)

if (bhPlayersCount === 0) {
  console.log('   ❌ CRITICAL: No active players!')
  criticalIssues.push('Blackhawks: No active players')
  totalIssues++
} else if (bhPlayersCount < 15) {
  console.log('   ⚠️  WARNING: Fewer than expected players')
  warnings.push(`Blackhawks: Only ${bhPlayersCount} active players (expected ~23+)`)
} else {
  console.log('   ✅ Roster looks good')
}

// 4. Check Player Stats
console.log('\n📈 STATS CHECK')
const { data: bhStats, count: bhStatsCount } = await supabase
  .from('blackhawks_player_game_stats')
  .select('player_id', { count: 'exact' })
  .eq('season', SEASONS.blackhawks)

const uniqueBhStatsPlayers = [...new Set(bhStats?.map(s => s.player_id) || [])]
console.log(`   Total Stat Entries: ${bhStatsCount || 0}`)
console.log(`   Players with Stats: ${uniqueBhStatsPlayers.length}`)

if (bhStatsCount === 0) {
  console.log('   ❌ CRITICAL: No player stats!')
  criticalIssues.push('Blackhawks: No player game stats')
  totalIssues++
} else {
  console.log('   ✅ Stats available')
}


// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n\n╔══════════════════════════════════════════════════════════════════╗')
console.log('║                        AUDIT SUMMARY                             ║')
console.log('╚══════════════════════════════════════════════════════════════════╝')

console.log('\n📋 EXPECTED vs ACTUAL RECORDS:')
console.log('┌─────────────┬──────────────────┬──────────────────┬────────┐')
console.log('│ Team        │ Expected         │ Actual (DB)      │ Status │')
console.log('├─────────────┼──────────────────┼──────────────────┼────────┤')

const bearsActual = bearsRecord ? `${bearsRecord.regular_season_wins}-${bearsRecord.regular_season_losses}` : 'N/A'
const bearsExpected = '11-6'
console.log(`│ Bears       │ ${bearsExpected.padEnd(16)} │ ${bearsActual.padEnd(16)} │ ${bearsActual === bearsExpected ? '  ✅  ' : '  ❌  '} │`)

const bullsActual = bullsRecord ? `${bullsRecord.wins}-${bullsRecord.losses}` : 'N/A'
const bullsExpected = '23-22'
console.log(`│ Bulls       │ ${bullsExpected.padEnd(16)} │ ${bullsActual.padEnd(16)} │ ${bullsActual === bullsExpected ? '  ✅  ' : '  ⚠️  '} │`)

const cubsActual = cubsRecord ? `${cubsRecord.wins}-${cubsRecord.losses}` : 'N/A'
const cubsExpected = '92-70'
console.log(`│ Cubs        │ ${cubsExpected.padEnd(16)} │ ${cubsActual.padEnd(16)} │ ${cubsActual === cubsExpected ? '  ✅  ' : '  ❌  '} │`)

const wsActual = wsRecord ? `${wsRecord.wins}-${wsRecord.losses}` : 'N/A'
const wsExpected = '60-102'
console.log(`│ White Sox   │ ${wsExpected.padEnd(16)} │ ${wsActual.padEnd(16)} │ ${wsActual === wsExpected ? '  ✅  ' : '  ❌  '} │`)

const bhActual = bhRecord ? `${bhRecord.wins}-${bhRecord.losses}-${bhRecord.otl || 0}` : 'N/A'
const bhExpected = '21-22-8'
console.log(`│ Blackhawks  │ ${bhExpected.padEnd(16)} │ ${bhActual.padEnd(16)} │ ${bhActual === bhExpected ? '  ✅  ' : '  ⚠️  '} │`)

console.log('└─────────────┴──────────────────┴──────────────────┴────────┘')

if (criticalIssues.length > 0) {
  console.log('\n❌ CRITICAL ISSUES (' + criticalIssues.length + '):')
  criticalIssues.forEach(issue => console.log('   • ' + issue))
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS (' + warnings.length + '):')
  warnings.forEach(warning => console.log('   • ' + warning))
}

console.log('\n📊 DATA COMPLETENESS:')
console.log('┌─────────────┬────────┬──────────┬─────────┬───────┐')
console.log('│ Team        │ Record │ Schedule │ Roster  │ Stats │')
console.log('├─────────────┼────────┼──────────┼─────────┼───────┤')
console.log(`│ Bears       │   ${bearsRecord ? '✅' : '❌'}   │    ${(bearsGamesCount || 0) > 0 ? '✅' : '❌'}    │   ${(bearsPlayersCount || 0) > 0 ? '✅' : '❌'}    │  ${(bearsStatsCount || 0) > 0 ? '✅' : '❌'}   │`)
console.log(`│ Bulls       │   ${bullsRecord ? '✅' : '❌'}   │    ${(bullsGamesCount || 0) > 0 ? '✅' : '❌'}    │   ${(bullsPlayersCount || 0) > 0 ? '✅' : '❌'}    │  ${(bullsStatsCount || 0) > 0 ? '✅' : '❌'}   │`)
console.log(`│ Cubs        │   ${cubsRecord ? '✅' : '❌'}   │    ${(cubsGamesCount || 0) > 0 ? '✅' : '❌'}    │   ${(cubsPlayersCount || 0) > 0 ? '✅' : '❌'}    │  ${(cubsStatsCount || 0) > 0 ? '✅' : '❌'}   │`)
console.log(`│ White Sox   │   ${wsRecord ? '✅' : '❌'}   │    ${(wsGamesCount || 0) > 0 ? '✅' : '❌'}    │   ${(wsPlayersCount || 0) > 0 ? '✅' : '❌'}    │  ${(wsStatsCount || 0) > 0 ? '✅' : '❌'}   │`)
console.log(`│ Blackhawks  │   ${bhRecord ? '✅' : '❌'}   │    ${(bhGamesCount || 0) > 0 ? '✅' : '❌'}    │   ${(bhPlayersCount || 0) > 0 ? '✅' : '❌'}    │  ${(bhStatsCount || 0) > 0 ? '✅' : '❌'}   │`)
console.log('└─────────────┴────────┴──────────┴─────────┴───────┘')

const overallStatus = criticalIssues.length === 0 ? 'READY FOR PRODUCTION' : 'ISSUES NEED ATTENTION'
console.log(`\n🎯 OVERALL STATUS: ${overallStatus}`)

if (criticalIssues.length === 0 && warnings.length === 0) {
  console.log('\n✅ All team pages have complete, accurate data!')
} else if (criticalIssues.length === 0) {
  console.log('\n✅ No critical issues. Minor warnings can be addressed later.')
} else {
  console.log('\n❌ Critical issues must be resolved before production.')
}

process.exit(criticalIssues.length > 0 ? 1 : 0)
