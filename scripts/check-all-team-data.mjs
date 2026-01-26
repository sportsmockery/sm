#!/usr/bin/env node
/**
 * Diagnostic script to check actual data in DataLab database
 * Identifies what's missing or wrong across all teams
 */

import { createClient } from '@supabase/supabase-js'

const DATALAB_URL = 'https://siwoqfzzcxmngnseyzpv.supabase.co'
const DATALAB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd29xZnp6Y3htbmduc2V5enB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzY0OTQ4MCwiZXhwIjoyMDgzMjI1NDgwfQ.5-dQVO_B3F-mnljmLEcvhIS_Ag1C85X-Gl2u44rkR8I'

const supabase = createClient(DATALAB_URL, DATALAB_KEY)

// Current date info
const now = new Date()
const year = now.getFullYear()
const month = now.getMonth() + 1
console.log(`\n=== DATA DIAGNOSTIC - ${now.toISOString()} ===`)
console.log(`Current date: ${year}-${month.toString().padStart(2, '0')}-${now.getDate()}`)

// Season calculations
const nflSeason = month < 9 ? year - 1 : year // NFL: Sep-Feb, stored as starting year
const nbaSeason = month < 10 ? year : year + 1 // NBA: Oct-Jun, stored as ending year
const mlbSeason = month < 4 ? year - 1 : year // MLB: Apr-Oct, calendar year
const nhlSeason = month < 10 ? year : year + 1 // NHL: Oct-Jun, stored as ending year

console.log(`\nExpected Seasons:`)
console.log(`  NFL (Bears): ${nflSeason}`)
console.log(`  NBA (Bulls): ${nbaSeason}`)
console.log(`  MLB (Cubs/WhiteSox): ${mlbSeason}`)
console.log(`  NHL (Blackhawks): ${nhlSeason}`)

// ============================================================================
// BEARS
// ============================================================================
console.log('\n\n========== CHICAGO BEARS (NFL) ==========')

// Check games
const { data: bearsGames, error: bearsGamesErr } = await supabase
  .from('bears_games_master')
  .select('*')
  .eq('season', nflSeason)
  .order('game_date', { ascending: true })

if (bearsGamesErr) {
  console.log(`Games ERROR: ${bearsGamesErr.message}`)
} else {
  const preseason = bearsGames?.filter(g => g.game_type === 'PRE') || []
  const regular = bearsGames?.filter(g => g.game_type === 'REG') || []
  const postseason = bearsGames?.filter(g => g.game_type === 'POST') || []
  const completed = bearsGames?.filter(g => g.bears_score !== null && g.opponent_score !== null) || []

  console.log(`\nGames (season ${nflSeason}):`)
  console.log(`  Total: ${bearsGames?.length || 0}`)
  console.log(`  Preseason: ${preseason.length}`)
  console.log(`  Regular: ${regular.length}`)
  console.log(`  Postseason: ${postseason.length}`)
  console.log(`  Completed: ${completed.length}`)

  // Calculate record from completed games
  const wins = completed.filter(g => g.bears_win === true).length
  const losses = completed.filter(g => g.bears_win === false).length
  const ties = completed.filter(g => g.bears_score === g.opponent_score).length
  console.log(`  Calculated Record: ${wins}-${losses}${ties > 0 ? `-${ties}` : ''}`)
}

// Check season record table
const { data: bearsSeason, error: bearsSeasonErr } = await supabase
  .from('bears_season_record')
  .select('*')
  .eq('season', nflSeason)
  .single()

if (bearsSeasonErr) {
  console.log(`\nSeason Record Table: NOT FOUND or ERROR - ${bearsSeasonErr.message}`)
} else {
  console.log(`\nSeason Record Table (${nflSeason}):`)
  console.log(`  Wins: ${bearsSeason?.wins}`)
  console.log(`  Losses: ${bearsSeason?.losses}`)
  console.log(`  Ties: ${bearsSeason?.ties || 0}`)
}

// Check players
const { data: bearsPlayers, error: bearsPlayersErr } = await supabase
  .from('bears_players')
  .select('id, name, position, is_active')
  .eq('is_active', true)

if (bearsPlayersErr) {
  console.log(`\nPlayers ERROR: ${bearsPlayersErr.message}`)
} else {
  console.log(`\nPlayers (is_active=true): ${bearsPlayers?.length || 0}`)
}

// Check player stats
const { data: bearsStats, error: bearsStatsErr } = await supabase
  .from('bears_player_game_stats')
  .select('game_id, player_id, pass_yds, rush_yds, rec_yds')
  .limit(5)

if (bearsStatsErr) {
  console.log(`\nPlayer Stats ERROR: ${bearsStatsErr.message}`)
} else {
  console.log(`\nPlayer Game Stats sample: ${bearsStats?.length || 0} rows found`)
}

// ============================================================================
// BULLS
// ============================================================================
console.log('\n\n========== CHICAGO BULLS (NBA) ==========')

// Check games
const { data: bullsGames, error: bullsGamesErr } = await supabase
  .from('bulls_games_master')
  .select('*')
  .eq('season', nbaSeason)
  .order('game_date', { ascending: true })

if (bullsGamesErr) {
  console.log(`Games ERROR: ${bullsGamesErr.message}`)
} else {
  const completed = bullsGames?.filter(g => g.bulls_score !== null && g.opponent_score !== null) || []
  const preseason = bullsGames?.filter(g => g.game_type === 'PRE') || []
  const regular = bullsGames?.filter(g => g.game_type === 'REG') || []
  const postseason = bullsGames?.filter(g => g.game_type === 'POST') || []

  console.log(`\nGames (season ${nbaSeason}):`)
  console.log(`  Total: ${bullsGames?.length || 0}`)
  console.log(`  Preseason: ${preseason.length}`)
  console.log(`  Regular: ${regular.length}`)
  console.log(`  Postseason: ${postseason.length}`)
  console.log(`  Completed: ${completed.length}`)

  const wins = completed.filter(g => g.bulls_win === true).length
  const losses = completed.filter(g => g.bulls_win === false).length
  console.log(`  Calculated Record: ${wins}-${losses}`)
}

// Check bulls_seasons table (authoritative source)
const { data: bullsSeason, error: bullsSeasonErr } = await supabase
  .from('bulls_seasons')
  .select('*')
  .eq('season', nbaSeason)
  .single()

if (bullsSeasonErr) {
  console.log(`\nSeasons Table: NOT FOUND - ${bullsSeasonErr.message}`)
} else {
  console.log(`\nSeasons Table (${nbaSeason}):`)
  console.log(`  Wins: ${bullsSeason?.wins}`)
  console.log(`  Losses: ${bullsSeason?.losses}`)
}

// Check previous season too
const { data: bullsSeasonPrev } = await supabase
  .from('bulls_seasons')
  .select('*')
  .eq('season', nbaSeason - 1)
  .single()

if (bullsSeasonPrev) {
  console.log(`\nSeasons Table (${nbaSeason - 1} - previous):`)
  console.log(`  Wins: ${bullsSeasonPrev?.wins}`)
  console.log(`  Losses: ${bullsSeasonPrev?.losses}`)
}

// Check players
const { data: bullsPlayers } = await supabase
  .from('bulls_players')
  .select('id, name, position, is_current_bulls')
  .eq('is_current_bulls', true)

console.log(`\nPlayers (is_current_bulls=true): ${bullsPlayers?.length || 0}`)

// ============================================================================
// CUBS
// ============================================================================
console.log('\n\n========== CHICAGO CUBS (MLB) ==========')

// Check games
const { data: cubsGames, error: cubsGamesErr } = await supabase
  .from('cubs_games_master')
  .select('*')
  .eq('season', mlbSeason)
  .order('game_date', { ascending: true })

if (cubsGamesErr) {
  console.log(`Games ERROR: ${cubsGamesErr.message}`)
} else {
  const completed = cubsGames?.filter(g => g.cubs_score !== null && g.opponent_score !== null) || []
  const regular = cubsGames?.filter(g => g.game_type === 'REG') || []

  console.log(`\nGames (season ${mlbSeason}):`)
  console.log(`  Total: ${cubsGames?.length || 0}`)
  console.log(`  Regular: ${regular.length}`)
  console.log(`  Completed: ${completed.length}`)

  const wins = completed.filter(g => g.cubs_win === true).length
  const losses = completed.filter(g => g.cubs_win === false).length
  console.log(`  Calculated Record: ${wins}-${losses}`)
}

// Check cubs_seasons table
const { data: cubsSeason, error: cubsSeasonErr } = await supabase
  .from('cubs_seasons')
  .select('*')
  .eq('season', mlbSeason)
  .single()

if (cubsSeasonErr) {
  console.log(`\nSeasons Table: NOT FOUND - ${cubsSeasonErr.message}`)
} else {
  console.log(`\nSeasons Table (${mlbSeason}):`)
  console.log(`  Wins: ${cubsSeason?.wins}`)
  console.log(`  Losses: ${cubsSeason?.losses}`)
}

// Check previous season
const { data: cubsSeasonPrev } = await supabase
  .from('cubs_seasons')
  .select('*')
  .eq('season', mlbSeason - 1)
  .single()

if (cubsSeasonPrev) {
  console.log(`\nSeasons Table (${mlbSeason - 1} - previous):`)
  console.log(`  Wins: ${cubsSeasonPrev?.wins}`)
  console.log(`  Losses: ${cubsSeasonPrev?.losses}`)
}

// Check players
const { data: cubsPlayers } = await supabase
  .from('cubs_players')
  .select('id, name, position, is_active')
  .eq('is_active', true)

console.log(`\nPlayers (is_active=true): ${cubsPlayers?.length || 0}`)

// ============================================================================
// WHITE SOX
// ============================================================================
console.log('\n\n========== CHICAGO WHITE SOX (MLB) ==========')

// Check games
const { data: whitesoxGames, error: whitesoxGamesErr } = await supabase
  .from('whitesox_games_master')
  .select('*')
  .eq('season', mlbSeason)
  .order('game_date', { ascending: true })

if (whitesoxGamesErr) {
  console.log(`Games ERROR: ${whitesoxGamesErr.message}`)
} else {
  const completed = whitesoxGames?.filter(g => g.whitesox_score !== null && g.opponent_score !== null) || []
  const regular = whitesoxGames?.filter(g => g.game_type === 'REG') || []

  console.log(`\nGames (season ${mlbSeason}):`)
  console.log(`  Total: ${whitesoxGames?.length || 0}`)
  console.log(`  Regular: ${regular.length}`)
  console.log(`  Completed: ${completed.length}`)

  const wins = completed.filter(g => g.whitesox_win === true).length
  const losses = completed.filter(g => g.whitesox_win === false).length
  console.log(`  Calculated Record: ${wins}-${losses}`)
}

// Check whitesox_seasons table
const { data: whitesoxSeason, error: whitesoxSeasonErr } = await supabase
  .from('whitesox_seasons')
  .select('*')
  .eq('season', mlbSeason)
  .single()

if (whitesoxSeasonErr) {
  console.log(`\nSeasons Table: NOT FOUND - ${whitesoxSeasonErr.message}`)
} else {
  console.log(`\nSeasons Table (${mlbSeason}):`)
  console.log(`  Wins: ${whitesoxSeason?.wins}`)
  console.log(`  Losses: ${whitesoxSeason?.losses}`)
}

// Check previous season
const { data: whitesoxSeasonPrev } = await supabase
  .from('whitesox_seasons')
  .select('*')
  .eq('season', mlbSeason - 1)
  .single()

if (whitesoxSeasonPrev) {
  console.log(`\nSeasons Table (${mlbSeason - 1} - previous):`)
  console.log(`  Wins: ${whitesoxSeasonPrev?.wins}`)
  console.log(`  Losses: ${whitesoxSeasonPrev?.losses}`)
}

// Check players
const { data: whitesoxPlayers } = await supabase
  .from('whitesox_players')
  .select('id, name, position, is_active')
  .eq('is_active', true)

console.log(`\nPlayers (is_active=true): ${whitesoxPlayers?.length || 0}`)

// ============================================================================
// BLACKHAWKS
// ============================================================================
console.log('\n\n========== CHICAGO BLACKHAWKS (NHL) ==========')

// Check games
const { data: blackhawksGames, error: blackhawksGamesErr } = await supabase
  .from('blackhawks_games_master')
  .select('*')
  .eq('season', nhlSeason)
  .order('game_date', { ascending: true })

if (blackhawksGamesErr) {
  console.log(`Games ERROR: ${blackhawksGamesErr.message}`)
} else {
  const completed = blackhawksGames?.filter(g => g.blackhawks_score !== null && g.opponent_score !== null) || []
  const preseason = blackhawksGames?.filter(g => g.game_type === 'PRE') || []
  const regular = blackhawksGames?.filter(g => g.game_type === 'REG') || []

  console.log(`\nGames (season ${nhlSeason}):`)
  console.log(`  Total: ${blackhawksGames?.length || 0}`)
  console.log(`  Preseason: ${preseason.length}`)
  console.log(`  Regular: ${regular.length}`)
  console.log(`  Completed: ${completed.length}`)

  const wins = completed.filter(g => g.blackhawks_win === true).length
  const losses = completed.filter(g => g.blackhawks_win === false).length
  const otLosses = completed.filter(g => g.blackhawks_win === false && g.is_overtime === true).length
  console.log(`  Calculated Record: ${wins}-${losses - otLosses}-${otLosses}`)
}

// Check blackhawks_seasons table
const { data: blackhawksSeason, error: blackhawksSeasonErr } = await supabase
  .from('blackhawks_seasons')
  .select('*')
  .eq('season', nhlSeason)
  .single()

if (blackhawksSeasonErr) {
  console.log(`\nSeasons Table: NOT FOUND - ${blackhawksSeasonErr.message}`)
} else {
  console.log(`\nSeasons Table (${nhlSeason}):`)
  console.log(`  Wins: ${blackhawksSeason?.wins}`)
  console.log(`  Losses: ${blackhawksSeason?.losses}`)
  console.log(`  OT Losses: ${blackhawksSeason?.otl || 0}`)
}

// Check previous season
const { data: blackhawksSeasonPrev } = await supabase
  .from('blackhawks_seasons')
  .select('*')
  .eq('season', nhlSeason - 1)
  .single()

if (blackhawksSeasonPrev) {
  console.log(`\nSeasons Table (${nhlSeason - 1} - previous):`)
  console.log(`  Wins: ${blackhawksSeasonPrev?.wins}`)
  console.log(`  Losses: ${blackhawksSeasonPrev?.losses}`)
  console.log(`  OT Losses: ${blackhawksSeasonPrev?.otl || 0}`)
}

// Check players
const { data: blackhawksPlayers } = await supabase
  .from('blackhawks_players')
  .select('id, name, position, is_active')
  .eq('is_active', true)

console.log(`\nPlayers (is_active=true): ${blackhawksPlayers?.length || 0}`)

console.log('\n\n========== SUMMARY ==========')
console.log(`
This diagnostic shows the actual data in DataLab.
Compare against expected values:
- Bears 2025: Should be 10-7 regular season + playoffs
- Bulls 2026: Should be ~23-22 (current 2025-26 season)
- Cubs 2025: Should be 83-79 (2025 season ended)
- White Sox 2025: Should be 60-102
- Blackhawks 2026: Should be ~21-22-8 (current 2025-26 season)

If season data shows 0 games or wrong records, the issue is:
1. Season number mismatch (code expects different season than data)
2. Data not synced from external APIs
3. Wrong table being queried
`)

process.exit(0)
