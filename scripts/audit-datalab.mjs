#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const DATALAB_URL = 'https://siwoqfzzcxmngnseyzpv.supabase.co'
const DATALAB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd29xZnp6Y3htbmduc2V5enB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NDk0ODAsImV4cCI6MjA4MzIyNTQ4MH0.PzeJ6OG2ofjLWSpJ2UmI-1aXVrHnh3ar6eTgph4uJgc'

const supabase = createClient(DATALAB_URL, DATALAB_ANON_KEY)

async function runAudit() {
  console.log('='.repeat(80))
  console.log('DATALAB AUDIT QUERIES')
  console.log('='.repeat(80))
  console.log('')

  // ============================================================================
  // CUBS GAMES
  // ============================================================================
  console.log('--- CUBS GAMES (cubs_games_master) ---')

  const { data: cubsGames2025, error: cubsGamesErr } = await supabase
    .from('cubs_games_master')
    .select('id, game_date, season, game_type')
    .eq('season', 2025)

  if (cubsGamesErr) {
    console.log('ERROR:', cubsGamesErr.message)
  } else {
    console.log(`Total Cubs games for season 2025: ${cubsGames2025?.length || 0}`)

    // Group by game_type
    const byType = {}
    cubsGames2025?.forEach(g => {
      byType[g.game_type] = (byType[g.game_type] || 0) + 1
    })
    console.log('By game_type:', byType)
  }
  console.log('')

  // Check for any Cubs games at all
  const { data: cubsAllGames, error: cubsAllErr } = await supabase
    .from('cubs_games_master')
    .select('season')
    .limit(1000)

  if (!cubsAllErr && cubsAllGames) {
    const seasons = [...new Set(cubsAllGames.map(g => g.season))].sort()
    console.log(`Cubs games - Available seasons: ${seasons.join(', ')}`)
    const countBySeason = {}
    cubsAllGames.forEach(g => {
      countBySeason[g.season] = (countBySeason[g.season] || 0) + 1
    })
    console.log('Games per season:', countBySeason)
  }
  console.log('')

  // ============================================================================
  // WHITE SOX GAMES
  // ============================================================================
  console.log('--- WHITE SOX GAMES (whitesox_games_master) ---')

  const { data: soxGames2025, error: soxGamesErr } = await supabase
    .from('whitesox_games_master')
    .select('id, game_date, season, game_type')
    .eq('season', 2025)

  if (soxGamesErr) {
    console.log('ERROR:', soxGamesErr.message)
  } else {
    console.log(`Total White Sox games for season 2025: ${soxGames2025?.length || 0}`)

    const byType = {}
    soxGames2025?.forEach(g => {
      byType[g.game_type] = (byType[g.game_type] || 0) + 1
    })
    console.log('By game_type:', byType)
  }
  console.log('')

  // Check all seasons
  const { data: soxAllGames } = await supabase
    .from('whitesox_games_master')
    .select('season')
    .limit(1000)

  if (soxAllGames) {
    const seasons = [...new Set(soxAllGames.map(g => g.season))].sort()
    console.log(`White Sox games - Available seasons: ${seasons.join(', ')}`)
  }
  console.log('')

  // ============================================================================
  // CUBS PLAYER STATS
  // ============================================================================
  console.log('--- CUBS PLAYER STATS (cubs_player_game_stats) ---')

  const { data: cubsStats2025, error: cubsStatsErr } = await supabase
    .from('cubs_player_game_stats')
    .select('player_id')
    .limit(1000)

  if (cubsStatsErr) {
    console.log('ERROR:', cubsStatsErr.message)
  } else {
    const uniquePlayers = new Set(cubsStats2025?.map(s => s.player_id))
    console.log(`Total Cubs player stat rows: ${cubsStats2025?.length || 0}`)
    console.log(`Unique players with stats: ${uniquePlayers.size}`)
  }
  console.log('')

  // ============================================================================
  // WHITE SOX PLAYER STATS
  // ============================================================================
  console.log('--- WHITE SOX PLAYER STATS (whitesox_player_game_stats) ---')

  const { data: soxStats2025, error: soxStatsErr } = await supabase
    .from('whitesox_player_game_stats')
    .select('player_id')
    .limit(1000)

  if (soxStatsErr) {
    console.log('ERROR:', soxStatsErr.message)
  } else {
    const uniquePlayers = new Set(soxStats2025?.map(s => s.player_id))
    console.log(`Total White Sox player stat rows: ${soxStats2025?.length || 0}`)
    console.log(`Unique players with stats: ${uniquePlayers.size}`)
  }
  console.log('')

  // ============================================================================
  // BLACKHAWKS PLAYER STATS
  // ============================================================================
  console.log('--- BLACKHAWKS PLAYER STATS (blackhawks_player_game_stats) ---')

  const { data: hawksStats, error: hawksStatsErr } = await supabase
    .from('blackhawks_player_game_stats')
    .select('player_id, goals, assists, points')
    .limit(1000)

  if (hawksStatsErr) {
    console.log('ERROR:', hawksStatsErr.message)
  } else {
    const uniquePlayers = new Set(hawksStats?.map(s => s.player_id))
    console.log(`Total Blackhawks player stat rows: ${hawksStats?.length || 0}`)
    console.log(`Unique players with stats: ${uniquePlayers.size}`)

    // Sum stats by player
    if (hawksStats && hawksStats.length > 0) {
      const playerTotals = {}
      hawksStats.forEach(s => {
        if (!playerTotals[s.player_id]) {
          playerTotals[s.player_id] = { goals: 0, assists: 0, points: 0 }
        }
        playerTotals[s.player_id].goals += s.goals || 0
        playerTotals[s.player_id].assists += s.assists || 0
        playerTotals[s.player_id].points += s.points || 0
      })

      // Top 5 by points
      const sorted = Object.entries(playerTotals)
        .sort((a, b) => b[1].points - a[1].points)
        .slice(0, 5)
      console.log('Top 5 by points:', sorted)
    }
  }
  console.log('')

  // ============================================================================
  // BLACKHAWKS RECORD
  // ============================================================================
  console.log('--- BLACKHAWKS SEASON RECORD (blackhawks_seasons) ---')

  const { data: hawksSeason, error: hawksSeasonErr } = await supabase
    .from('blackhawks_seasons')
    .select('*')
    .eq('season', 2026)
    .single()

  if (hawksSeasonErr) {
    console.log('ERROR:', hawksSeasonErr.message)
  } else {
    console.log('Blackhawks 2025-26 record:', hawksSeason)
  }
  console.log('')

  // ============================================================================
  // BULLS RECORD
  // ============================================================================
  console.log('--- BULLS SEASON RECORD (bulls_seasons) ---')

  const { data: bullsSeason, error: bullsSeasonErr } = await supabase
    .from('bulls_seasons')
    .select('*')
    .eq('season', 2026)
    .single()

  if (bullsSeasonErr) {
    console.log('ERROR:', bullsSeasonErr.message)
  } else {
    console.log('Bulls 2025-26 record:', bullsSeason)
  }
  console.log('')

  // ============================================================================
  // BEARS CALEB WILLIAMS STATS
  // ============================================================================
  console.log('--- BEARS CALEB WILLIAMS PASSING YARDS ---')

  // First find Williams player_id
  const { data: williamsPlayer } = await supabase
    .from('bears_players')
    .select('id, espn_id, name')
    .ilike('name', '%Williams%')
    .eq('position', 'QB')

  console.log('Williams player record:', williamsPlayer)

  if (williamsPlayer && williamsPlayer.length > 0) {
    const playerId = williamsPlayer[0].id

    const { data: williamsStats, error: williamsErr } = await supabase
      .from('bears_player_game_stats')
      .select('passing_yds')
      .eq('player_id', playerId)

    if (williamsErr) {
      console.log('ERROR:', williamsErr.message)
    } else {
      const totalYards = williamsStats?.reduce((sum, g) => sum + (g.passing_yds || 0), 0)
      console.log(`Total passing yards for Williams (player_id=${playerId}): ${totalYards}`)
      console.log(`Games with stats: ${williamsStats?.length || 0}`)
    }
  }
  console.log('')

  // ============================================================================
  // CUBS SEASON RECORD
  // ============================================================================
  console.log('--- CUBS SEASON RECORD (cubs_seasons) ---')

  const { data: cubsSeason, error: cubsSeasonErr } = await supabase
    .from('cubs_seasons')
    .select('*')
    .eq('season', 2025)
    .single()

  if (cubsSeasonErr) {
    console.log('ERROR:', cubsSeasonErr.message)
  } else {
    console.log('Cubs 2025 record:', cubsSeason)
  }
  console.log('')

  // ============================================================================
  // WHITE SOX SEASON RECORD
  // ============================================================================
  console.log('--- WHITE SOX SEASON RECORD (whitesox_seasons) ---')

  const { data: soxSeason, error: soxSeasonErr } = await supabase
    .from('whitesox_seasons')
    .select('*')
    .eq('season', 2025)
    .single()

  if (soxSeasonErr) {
    console.log('ERROR:', soxSeasonErr.message)
  } else {
    console.log('White Sox 2025 record:', soxSeason)
  }
  console.log('')

  // ============================================================================
  // BEARS GAMES
  // ============================================================================
  console.log('--- BEARS GAMES (bears_games_master) ---')

  const { data: bearsGames2025, error: bearsGamesErr } = await supabase
    .from('bears_games_master')
    .select('id, game_date, season, game_type, week')
    .eq('season', 2025)
    .order('game_date', { ascending: false })

  if (bearsGamesErr) {
    console.log('ERROR:', bearsGamesErr.message)
  } else {
    console.log(`Total Bears games for season 2025: ${bearsGames2025?.length || 0}`)

    const byType = {}
    bearsGames2025?.forEach(g => {
      byType[g.game_type] = (byType[g.game_type] || 0) + 1
    })
    console.log('By game_type:', byType)
  }
  console.log('')

  // ============================================================================
  // CHECK DUPLICATE GAMES
  // ============================================================================
  console.log('--- CHECKING FOR DUPLICATE GAMES ---')

  // Cubs
  const { data: cubsGameIds } = await supabase
    .from('cubs_games_master')
    .select('game_id')
    .eq('season', 2025)

  if (cubsGameIds) {
    const idCounts = {}
    cubsGameIds.forEach(g => {
      idCounts[g.game_id] = (idCounts[g.game_id] || 0) + 1
    })
    const duplicates = Object.entries(idCounts).filter(([_, count]) => count > 1)
    console.log(`Cubs duplicate game_ids: ${duplicates.length > 0 ? JSON.stringify(duplicates) : 'None'}`)
  }

  // White Sox
  const { data: soxGameIds } = await supabase
    .from('whitesox_games_master')
    .select('game_id')
    .eq('season', 2025)

  if (soxGameIds) {
    const idCounts = {}
    soxGameIds.forEach(g => {
      idCounts[g.game_id] = (idCounts[g.game_id] || 0) + 1
    })
    const duplicates = Object.entries(idCounts).filter(([_, count]) => count > 1)
    console.log(`White Sox duplicate game_ids: ${duplicates.length > 0 ? JSON.stringify(duplicates) : 'None'}`)
  }

  console.log('')
  console.log('='.repeat(80))
  console.log('AUDIT COMPLETE')
  console.log('='.repeat(80))
}

runAudit().catch(console.error)
