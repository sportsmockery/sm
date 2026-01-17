/**
 * Bears Data Sync Service
 *
 * Orchestrates data synchronization from ESPN (primary) and MySportsFeeds (backup)
 * to the datalabs bears_games_master table.
 *
 * Rules:
 * - DO NOT delete any data from datalabs tables
 * - DO NOT add null information (only update with actual data)
 * - DO NOT change the format of datalabs tables
 * - ESPN is PRIMARY, MySportsFeeds is BACKUP
 */

import { datalabAdmin } from './supabase-datalab'
import {
  fetchESPNScoreboard,
  fetchESPNGameSummary,
  fetchLiveBearsGame,
  getCurrentNFLSeason,
  type ESPNGame,
} from './espn-api'
import {
  fetchMSFBearsSchedule,
  fetchMSFLiveGame,
  type MSFGame,
} from './mysportsfeeds-api'

export interface SyncResult {
  success: boolean
  gamesUpdated: number
  gamesInserted: number
  errors: string[]
  source: 'espn' | 'mysportsfeeds' | 'none'
  timestamp: string
}

export interface LiveSyncResult {
  success: boolean
  gameId: string | null
  updated: boolean
  scoreChanged: boolean
  source: 'espn' | 'mysportsfeeds' | 'none'
  error?: string
}

/**
 * Sync Bears schedule from external APIs to datalab
 * This is the main hourly sync function
 *
 * - Fetches current season games from ESPN
 * - Falls back to MySportsFeeds if ESPN fails
 * - Updates bears_games_master with non-null values only
 * - Does NOT delete any existing data
 */
export async function syncBearsSchedule(options?: {
  season?: number
  forceRefresh?: boolean
}): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    gamesUpdated: 0,
    gamesInserted: 0,
    errors: [],
    source: 'none',
    timestamp: new Date().toISOString(),
  }

  if (!datalabAdmin) {
    result.errors.push('Datalab database not configured')
    return result
  }

  const season = options?.season || getCurrentNFLSeason()

  // Try ESPN first (primary source)
  console.log(`[Bears Sync] Fetching ${season} season from ESPN...`)
  const espnResult = await fetchESPNScoreboard({ season })

  let games: (ESPNGame | MSFGame)[] = espnResult.games
  result.source = 'espn'

  // If ESPN fails or returns no games, try MySportsFeeds
  if (espnResult.error || games.length === 0) {
    console.log('[Bears Sync] ESPN failed, trying MySportsFeeds backup...')
    const msfResult = await fetchMSFBearsSchedule(season)

    if (msfResult.error || msfResult.games.length === 0) {
      result.errors.push(`ESPN: ${espnResult.error || 'No games'}`)
      result.errors.push(`MySportsFeeds: ${msfResult.error || 'No games'}`)
      return result
    }

    games = msfResult.games
    result.source = 'mysportsfeeds'
  }

  console.log(`[Bears Sync] Found ${games.length} games from ${result.source}`)

  // Process each game
  for (const game of games) {
    try {
      const syncedGame = await upsertGame(game, result.source)
      if (syncedGame.inserted) {
        result.gamesInserted++
      } else if (syncedGame.updated) {
        result.gamesUpdated++
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      result.errors.push(`Game ${game.opponent}: ${errorMsg}`)
    }
  }

  result.success = result.errors.length === 0 || (result.gamesUpdated + result.gamesInserted) > 0
  console.log(`[Bears Sync] Complete: ${result.gamesUpdated} updated, ${result.gamesInserted} inserted`)

  return result
}

/**
 * Sync a live Bears game in real-time
 * Called frequently during active games
 *
 * - Checks if there's a live Bears game
 * - Updates scores, status in bears_games_master
 * - Returns info about whether score changed (for triggering UI updates)
 */
export async function syncLiveGame(): Promise<LiveSyncResult> {
  const result: LiveSyncResult = {
    success: false,
    gameId: null,
    updated: false,
    scoreChanged: false,
    source: 'none',
  }

  if (!datalabAdmin) {
    result.error = 'Datalab database not configured'
    return result
  }

  // Try ESPN first
  console.log('[Bears Live Sync] Checking for live game on ESPN...')
  const espnLiveGame = await fetchLiveBearsGame()
  let liveGame: ESPNGame | MSFGame | null = espnLiveGame
  result.source = 'espn'

  // Fallback to MySportsFeeds if ESPN shows no live game
  if (!liveGame) {
    console.log('[Bears Live Sync] No ESPN live game, checking MySportsFeeds...')
    const msfLive = await fetchMSFLiveGame()
    if (msfLive) {
      liveGame = msfLive
      result.source = 'mysportsfeeds'
    }
  }

  if (!liveGame) {
    console.log('[Bears Live Sync] No live game found')
    result.success = true
    result.source = 'none'
    return result
  }

  console.log(`[Bears Live Sync] Found live game: Bears vs ${liveGame.opponent}`)
  // Get game ID based on source type
  const gameId = 'eventId' in liveGame ? liveGame.eventId : liveGame.gameId
  result.gameId = gameId

  // Get current game state from database
  const { data: currentGame } = await datalabAdmin
    .from('bears_games_master')
    .select('id, bears_score, opponent_score')
    .eq('external_id', result.gameId)
    .single()

  // Check if score changed
  const oldBearsScore = currentGame?.bears_score
  const oldOpponentScore = currentGame?.opponent_score
  const newBearsScore = liveGame.bearsScore
  const newOpponentScore = liveGame.opponentScore

  if (
    (oldBearsScore !== newBearsScore && newBearsScore !== null) ||
    (oldOpponentScore !== newOpponentScore && newOpponentScore !== null)
  ) {
    result.scoreChanged = true
  }

  // Update the game
  const syncResult = await upsertGame(liveGame, result.source)
  result.updated = syncResult.updated || syncResult.inserted
  result.success = true

  if (result.scoreChanged) {
    console.log(`[Bears Live Sync] Score changed: Bears ${newBearsScore} - ${newOpponentScore} ${liveGame.opponent}`)
  }

  return result
}

/**
 * Check if there's currently a live Bears game
 */
export async function hasLiveGame(): Promise<boolean> {
  // First check ESPN
  const espnLive = await fetchLiveBearsGame()
  if (espnLive) return true

  // Check MySportsFeeds as backup
  const msfLive = await fetchMSFLiveGame()
  return !!msfLive
}

/**
 * Get the next upcoming Bears game from database
 */
export async function getNextGame(): Promise<any | null> {
  if (!datalabAdmin) return null

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await datalabAdmin
    .from('bears_games_master')
    .select('*')
    .gte('game_date', today)
    .is('bears_score', null)
    .order('game_date', { ascending: true })
    .limit(1)
    .single()

  if (error || !data) return null

  return data
}

/**
 * Upsert a game into bears_games_master
 * Only updates columns with non-null values
 * Does NOT delete any data
 */
async function upsertGame(
  game: ESPNGame | MSFGame,
  source: 'espn' | 'mysportsfeeds'
): Promise<{ inserted: boolean; updated: boolean }> {
  if (!datalabAdmin) {
    throw new Error('Datalab not configured')
  }

  // Extract game ID based on source
  const externalId = 'eventId' in game ? game.eventId : game.gameId

  // Build update object with only non-null values
  const updateData: Record<string, any> = {}

  // Always set these if we have them
  if (game.date) updateData.game_date = game.date
  if (game.time) updateData.game_time = game.time
  if (game.season) updateData.season = game.season
  if (game.week) updateData.week = game.week
  if (game.opponent) updateData.opponent = game.opponent
  if (typeof game.isHome === 'boolean') updateData.is_bears_home = game.isHome
  if (game.stadium) updateData.stadium = game.stadium
  if (typeof game.isPlayoff === 'boolean') updateData.is_playoff = game.isPlayoff

  // Map game type
  if (game.gameType) {
    const typeMap: Record<string, string> = {
      preseason: 'PRE',
      regular: 'REG',
      postseason: 'POST',
    }
    updateData.game_type = typeMap[game.gameType] || 'REG'
  }

  // Only update scores if they have actual values (NOT null)
  if (game.bearsScore !== null && game.bearsScore !== undefined) {
    updateData.bears_score = game.bearsScore
  }
  if (game.opponentScore !== null && game.opponentScore !== undefined) {
    updateData.opponent_score = game.opponentScore
  }
  if (game.bearsWin !== null && game.bearsWin !== undefined) {
    updateData.bears_win = game.bearsWin
  }

  // Check if game already exists
  const { data: existing } = await datalabAdmin
    .from('bears_games_master')
    .select('id')
    .eq('external_id', externalId)
    .single()

  if (existing) {
    // Update existing game (only non-null fields)
    const { error } = await datalabAdmin
      .from('bears_games_master')
      .update(updateData)
      .eq('external_id', externalId)

    if (error) {
      throw new Error(`Failed to update game: ${error.message}`)
    }

    return { inserted: false, updated: true }
  } else {
    // Insert new game
    updateData.external_id = externalId
    updateData.game_id = externalId // Use same as external_id

    const { error } = await datalabAdmin
      .from('bears_games_master')
      .insert(updateData)

    if (error) {
      throw new Error(`Failed to insert game: ${error.message}`)
    }

    return { inserted: true, updated: false }
  }
}

/**
 * Sync recent games only (for faster updates)
 * Updates games from the last 2 weeks and next 4 weeks
 */
export async function syncRecentGames(): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    gamesUpdated: 0,
    gamesInserted: 0,
    errors: [],
    source: 'none',
    timestamp: new Date().toISOString(),
  }

  if (!datalabAdmin) {
    result.errors.push('Datalab database not configured')
    return result
  }

  // Fetch current scoreboard (includes recent and upcoming games)
  console.log('[Bears Sync] Fetching current scoreboard...')
  const espnResult = await fetchESPNScoreboard()
  result.source = 'espn'

  let games: (ESPNGame | MSFGame)[] = espnResult.games

  if (espnResult.error || games.length === 0) {
    console.log('[Bears Sync] ESPN failed, trying MySportsFeeds...')
    const msfResult = await fetchMSFBearsSchedule()

    if (msfResult.error || msfResult.games.length === 0) {
      result.errors.push(`ESPN: ${espnResult.error || 'No games'}`)
      result.errors.push(`MySportsFeeds: ${msfResult.error || 'No games'}`)
      return result
    }

    games = msfResult.games
    result.source = 'mysportsfeeds'
  }

  // Process games
  for (const game of games) {
    try {
      const syncedGame = await upsertGame(game, result.source)
      if (syncedGame.inserted) result.gamesInserted++
      else if (syncedGame.updated) result.gamesUpdated++
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      result.errors.push(`Game: ${errorMsg}`)
    }
  }

  result.success = result.errors.length === 0 || (result.gamesUpdated + result.gamesInserted) > 0
  return result
}
