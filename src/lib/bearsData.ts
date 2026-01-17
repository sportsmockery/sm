/**
 * Bears Data Layer
 *
 * This module provides helper functions for Bears data access.
 * - Historical/static data: Reads from mirrored SportsMockery tables (hourly sync from Datalab)
 * - Live data: Reads directly from Datalab for in-progress games
 *
 * All page-level components should use these helpers, never query databases directly.
 */

import { supabase } from './supabase'
import { datalabAdmin } from './supabase-datalab'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type Side = 'OFF' | 'DEF' | 'ST'

export interface BearsPlayer {
  playerId: string
  slug: string
  fullName: string
  firstName: string
  lastName: string
  jerseyNumber: number | null
  position: string
  positionGroup: string | null
  side: Side
  height: string | null
  weight: number | null
  age: number | null
  experience: string | null
  college: string | null
  headshotUrl: string | null
  primaryRole: string | null
  status: string | null
}

export interface PlayerSeasonStats {
  season: number
  gamesPlayed: number
  // Passing
  passAttempts: number | null
  passCompletions: number | null
  passYards: number | null
  passTD: number | null
  passINT: number | null
  completionPct: number | null
  yardsPerAttempt: number | null
  // Rushing
  rushAttempts: number | null
  rushYards: number | null
  rushTD: number | null
  yardsPerCarry: number | null
  // Receiving
  receptions: number | null
  recYards: number | null
  recTD: number | null
  targets: number | null
  yardsPerReception: number | null
  // Defense
  tackles: number | null
  sacks: number | null
  interceptions: number | null
  passesDefended: number | null
  forcedFumbles: number | null
  fumbleRecoveries: number | null
  // Misc
  fumbles: number | null
  snaps: number | null
}

export interface PlayerGameLogEntry {
  gameId: string
  date: string
  week: number
  season: number
  opponent: string
  isHome: boolean
  result: 'W' | 'L' | 'T' | null
  bearsScore: number | null
  oppScore: number | null
  // Stats
  passAttempts: number | null
  passCompletions: number | null
  passYards: number | null
  passTD: number | null
  passINT: number | null
  rushAttempts: number | null
  rushYards: number | null
  rushTD: number | null
  targets: number | null
  receptions: number | null
  recYards: number | null
  recTD: number | null
  tackles: number | null
  sacks: number | null
  interceptions: number | null
  fumbles: number | null
}

export interface PlayerProfile {
  player: BearsPlayer
  seasons: PlayerSeasonStats[]
  currentSeason: PlayerSeasonStats | null
  gameLog: PlayerGameLogEntry[]
}

export interface BearsGame {
  gameId: string
  season: number
  week: number
  date: string
  time: string | null
  dayOfWeek: string
  opponent: string
  homeAway: 'home' | 'away'
  status: 'scheduled' | 'in_progress' | 'final'
  bearsScore: number | null
  oppScore: number | null
  result: 'W' | 'L' | 'T' | null
  venue: string | null
  tv: string | null
  isPlayoff: boolean
  articleSlug: string | null
  weather: {
    tempF: number | null
    windMph: number | null
  } | null
}

export interface BearsTeamStats {
  season: number
  record: string
  wins: number
  losses: number
  ties: number
  pointsFor: number
  pointsAgainst: number
  ppg: number
  papg: number
  pointDifferential: number
  offensiveRank: number | null
  defensiveRank: number | null
}

export interface BearsLeaderboard {
  passing: LeaderboardEntry[]
  rushing: LeaderboardEntry[]
  receiving: LeaderboardEntry[]
  defense: LeaderboardEntry[]
}

export interface LeaderboardEntry {
  player: BearsPlayer
  primaryStat: number
  primaryLabel: string
  secondaryStat: number | null
  secondaryLabel: string | null
  tertiaryStat: number | null
  tertiaryLabel: string | null
}

export interface BearsStats {
  team: BearsTeamStats
  leaderboards: BearsLeaderboard
}

// Live game types
export interface LiveGameState {
  gameId: string
  status: 'pre' | 'in_progress' | 'halftime' | 'final'
  quarter: number | null
  clock: string | null
  possession: 'CHI' | string | null
  down: number | null
  distance: number | null
  ballSpot: string | null
  bearsScore: number
  oppScore: number
  opponent: string
  isHome: boolean
}

export interface LiveBoxScore {
  gameId: string
  players: {
    playerId: string
    name: string
    position: string
    stats: Partial<PlayerGameLogEntry>
  }[]
}

// Position group mapping
export type PositionGroup = 'QB' | 'RB' | 'WR' | 'TE' | 'OL' | 'DL' | 'LB' | 'CB' | 'S' | 'ST'

const POSITION_TO_GROUP: Record<string, PositionGroup> = {
  QB: 'QB',
  RB: 'RB', FB: 'RB',
  WR: 'WR',
  TE: 'TE',
  OT: 'OL', OG: 'OL', C: 'OL', T: 'OL', G: 'OL', OL: 'OL',
  DE: 'DL', DT: 'DL', NT: 'DL', DL: 'DL',
  LB: 'LB', ILB: 'LB', OLB: 'LB', MLB: 'LB',
  CB: 'CB',
  S: 'S', FS: 'S', SS: 'S', DB: 'S',
  K: 'ST', P: 'ST', LS: 'ST',
}

const POSITION_TO_SIDE: Record<string, Side> = {
  QB: 'OFF', RB: 'OFF', FB: 'OFF', WR: 'OFF', TE: 'OFF',
  OT: 'OFF', OG: 'OFF', C: 'OFF', T: 'OFF', G: 'OFF', OL: 'OFF',
  DE: 'DEF', DT: 'DEF', NT: 'DEF', DL: 'DEF',
  LB: 'DEF', ILB: 'DEF', OLB: 'DEF', MLB: 'DEF',
  CB: 'DEF', S: 'DEF', FS: 'DEF', SS: 'DEF', DB: 'DEF',
  K: 'ST', P: 'ST', LS: 'ST',
}

const SIDE_ORDER: Record<Side, number> = { OFF: 1, DEF: 2, ST: 3 }

// =============================================================================
// HELPER FUNCTIONS - READ FROM MIRRORED SPORTSMOCKERY TABLES
// =============================================================================

/**
 * Get all Bears players from the mirrored table
 * Sorted by side (OFF, DEF, ST), then position, then jersey number
 */
export async function getBearsPlayers(): Promise<BearsPlayer[]> {
  try {
    // First try the mirrored table in SportsMockery DB
    const { data, error } = await supabase
      .from('bears_players')
      .select('*')
      .order('position', { ascending: true })
      .order('jersey_number', { ascending: true })

    if (error) {
      console.error('Error fetching from mirrored table, falling back to Datalab:', error)
      // Fallback to Datalab if mirrored table doesn't exist yet
      return await getBearsPlayersFromDatalab()
    }

    if (!data || data.length === 0) {
      // Mirrored table empty, fallback to Datalab
      return await getBearsPlayersFromDatalab()
    }

    return transformPlayers(data)
  } catch (err) {
    console.error('getBearsPlayers error:', err)
    return await getBearsPlayersFromDatalab()
  }
}

/**
 * Fallback: Get players directly from Datalab
 */
async function getBearsPlayersFromDatalab(): Promise<BearsPlayer[]> {
  if (!datalabAdmin) {
    console.error('Datalab not configured')
    return []
  }

  const { data, error } = await datalabAdmin
    .from('bears_players')
    .select('*')
    .order('position', { ascending: true })
    .order('jersey_number', { ascending: true })

  if (error) {
    console.error('Datalab fetch error:', error)
    return []
  }

  return transformPlayers(data || [])
}

/**
 * Transform raw player data to BearsPlayer type
 */
function transformPlayers(data: any[]): BearsPlayer[] {
  const players: BearsPlayer[] = data.map((p: any) => {
    const position = p.position || 'UNKNOWN'
    const side = POSITION_TO_SIDE[position] || 'ST'

    return {
      playerId: String(p.player_id || p.id),
      slug: p.slug || generateSlug(p.full_name),
      fullName: p.full_name,
      firstName: p.first_name || p.full_name?.split(' ')[0] || '',
      lastName: p.last_name || p.full_name?.split(' ').slice(1).join(' ') || '',
      jerseyNumber: p.jersey_number,
      position,
      positionGroup: POSITION_TO_GROUP[position] || null,
      side,
      height: p.height,
      weight: p.weight,
      age: p.age,
      experience: p.experience ? `${p.experience} yr${p.experience !== 1 ? 's' : ''}` : null,
      college: p.college,
      headshotUrl: p.headshot_url,
      primaryRole: p.primary_role || p.status || null,
      status: p.status,
    }
  })

  // Sort by side, then position, then jersey number
  return players.sort((a, b) => {
    const sideCompare = SIDE_ORDER[a.side] - SIDE_ORDER[b.side]
    if (sideCompare !== 0) return sideCompare

    const posCompare = a.position.localeCompare(b.position)
    if (posCompare !== 0) return posCompare

    return (a.jerseyNumber || 99) - (b.jerseyNumber || 99)
  })
}

function generateSlug(name: string): string {
  if (!name) return ''
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/**
 * Get Bears roster grouped by position
 */
export async function getBearsRosterGrouped(): Promise<Record<PositionGroup, BearsPlayer[]>> {
  const players = await getBearsPlayers()

  const grouped: Record<PositionGroup, BearsPlayer[]> = {
    QB: [], RB: [], WR: [], TE: [], OL: [],
    DL: [], LB: [], CB: [], S: [], ST: [],
  }

  players.forEach(player => {
    const group = POSITION_TO_GROUP[player.position] || 'ST'
    grouped[group].push(player)
  })

  return grouped
}

/**
 * Get a single player profile with stats and game log
 */
export async function getPlayerProfile(slug: string): Promise<PlayerProfile | null> {
  const players = await getBearsPlayers()
  const player = players.find(p => p.slug === slug)

  if (!player) return null

  // Get season stats
  const seasons = await getPlayerSeasonStats(player.playerId)

  // Get game log
  const gameLog = await getPlayerGameLog(player.playerId)

  // Current season (2024 or most recent)
  const currentYear = new Date().getFullYear()
  const currentSeason = seasons.find(s => s.season === currentYear) ||
                        seasons.find(s => s.season === currentYear - 1) ||
                        seasons[0] || null

  return {
    player,
    seasons,
    currentSeason,
    gameLog,
  }
}

async function getPlayerSeasonStats(playerId: string): Promise<PlayerSeasonStats[]> {
  try {
    // Try mirrored table first
    const { data, error } = await supabase
      .from('bears_player_season_stats')
      .select('*')
      .eq('player_id', parseInt(playerId))
      .order('season', { ascending: false })

    if (error || !data || data.length === 0) {
      // Fallback to Datalab
      return await getPlayerSeasonStatsFromDatalab(playerId)
    }

    return transformSeasonStats(data)
  } catch {
    return await getPlayerSeasonStatsFromDatalab(playerId)
  }
}

async function getPlayerSeasonStatsFromDatalab(playerId: string): Promise<PlayerSeasonStats[]> {
  if (!datalabAdmin) return []

  const { data, error } = await datalabAdmin
    .from('bears_player_season_stats')
    .select('*')
    .eq('player_id', parseInt(playerId))
    .order('season', { ascending: false })

  if (error || !data) return []
  return transformSeasonStats(data)
}

function transformSeasonStats(data: any[]): PlayerSeasonStats[] {
  return data.map((s: any) => ({
    season: s.season,
    gamesPlayed: s.games_played || 0,
    passAttempts: s.pass_att,
    passCompletions: s.pass_cmp,
    passYards: s.pass_yds,
    passTD: s.pass_td,
    passINT: s.pass_int,
    completionPct: s.pass_att > 0 ? Math.round((s.pass_cmp / s.pass_att) * 1000) / 10 : null,
    yardsPerAttempt: s.pass_att > 0 ? Math.round((s.pass_yds / s.pass_att) * 10) / 10 : null,
    rushAttempts: s.rush_att,
    rushYards: s.rush_yds,
    rushTD: s.rush_td,
    yardsPerCarry: s.rush_att > 0 ? Math.round((s.rush_yds / s.rush_att) * 10) / 10 : null,
    receptions: s.rec,
    recYards: s.rec_yds,
    recTD: s.rec_td,
    targets: s.targets || s.rec_tgt,
    yardsPerReception: s.rec > 0 ? Math.round((s.rec_yds / s.rec) * 10) / 10 : null,
    tackles: s.tackles || s.total_tackles,
    sacks: s.sacks,
    interceptions: s.interceptions || s.int,
    passesDefended: s.passes_defended || s.pd,
    forcedFumbles: s.forced_fumbles || s.ff,
    fumbleRecoveries: s.fumble_recoveries || s.fr,
    fumbles: s.fumbles,
    snaps: s.snaps || s.offensive_snaps || s.defensive_snaps,
  }))
}

async function getPlayerGameLog(playerId: string): Promise<PlayerGameLogEntry[]> {
  try {
    // Try mirrored table
    const { data: gameStats, error: statsError } = await supabase
      .from('bears_player_game_stats')
      .select('*')
      .eq('player_id', parseInt(playerId))
      .order('game_id', { ascending: false })
      .limit(20)

    if (statsError || !gameStats || gameStats.length === 0) {
      return await getPlayerGameLogFromDatalab(playerId)
    }

    // Get game info
    const gameIds = gameStats.map((g: any) => g.game_id)
    const { data: games } = await supabase
      .from('bears_games_master')
      .select('*')
      .in('game_id', gameIds)

    const gamesMap = new Map((games || []).map((g: any) => [g.game_id, g]))

    return gameStats.map((s: any) => {
      const game = gamesMap.get(s.game_id) || {}
      return transformGameLogEntry(s, game)
    })
  } catch {
    return await getPlayerGameLogFromDatalab(playerId)
  }
}

async function getPlayerGameLogFromDatalab(playerId: string): Promise<PlayerGameLogEntry[]> {
  if (!datalabAdmin) return []

  const { data, error } = await datalabAdmin
    .from('bears_player_game_stats')
    .select(`
      *,
      bears_games_master(*)
    `)
    .eq('player_id', parseInt(playerId))
    .order('game_id', { ascending: false })
    .limit(20)

  if (error || !data) return []

  return data.map((s: any) => transformGameLogEntry(s, s.bears_games_master || {}))
}

function transformGameLogEntry(stats: any, game: any): PlayerGameLogEntry {
  const bearsWin = game.bears_win === true ||
    (game.bears_score !== null && game.opponent_score !== null && game.bears_score > game.opponent_score)
  const bearsLose = game.bears_win === false ||
    (game.bears_score !== null && game.opponent_score !== null && game.bears_score < game.opponent_score)

  return {
    gameId: stats.game_id,
    date: game.game_date || '',
    week: game.week || 0,
    season: game.season || 0,
    opponent: game.opponent || stats.opp_key || '',
    isHome: game.is_bears_home ?? true,
    result: bearsWin ? 'W' : bearsLose ? 'L' : null,
    bearsScore: game.bears_score,
    oppScore: game.opponent_score,
    passAttempts: stats.pass_att,
    passCompletions: stats.pass_cmp,
    passYards: stats.pass_yds,
    passTD: stats.pass_td,
    passINT: stats.pass_int,
    rushAttempts: stats.rush_att,
    rushYards: stats.rush_yds,
    rushTD: stats.rush_td,
    targets: stats.rec_tgt,
    receptions: stats.rec,
    recYards: stats.rec_yds,
    recTD: stats.rec_td,
    tackles: stats.tackles || stats.total_tackles,
    sacks: stats.sacks,
    interceptions: stats.interceptions || stats.int,
    fumbles: stats.fumbles,
  }
}

/**
 * Get Bears schedule for a season
 */
export async function getBearsSchedule(season?: number): Promise<BearsGame[]> {
  const targetSeason = season || getCurrentSeason()

  try {
    const { data, error } = await supabase
      .from('bears_games_master')
      .select('*')
      .eq('season', targetSeason)
      .order('game_date', { ascending: true })

    if (error || !data || data.length === 0) {
      return await getBearsScheduleFromDatalab(targetSeason)
    }

    // Get game context
    const gameIds = data.map((g: any) => g.game_id)
    const { data: context } = await supabase
      .from('bears_game_context')
      .select('*')
      .in('game_id', gameIds)

    const contextMap = new Map((context || []).map((c: any) => [c.game_id, c]))

    return data.map((g: any) => transformGame(g, contextMap.get(g.game_id)))
  } catch {
    return await getBearsScheduleFromDatalab(targetSeason)
  }
}

async function getBearsScheduleFromDatalab(season: number): Promise<BearsGame[]> {
  if (!datalabAdmin) return []

  const { data, error } = await datalabAdmin
    .from('bears_games_master')
    .select('*')
    .eq('season', season)
    .order('game_date', { ascending: true })

  if (error || !data) return []

  // Try to get context
  const gameIds = data.map((g: any) => g.game_id || g.external_id)
  const { data: context } = await datalabAdmin
    .from('bears_game_context')
    .select('*')
    .in('game_id', gameIds)

  const contextMap = new Map((context || []).map((c: any) => [c.game_id, c]))

  return data.map((g: any) => transformGame(g, contextMap.get(g.game_id || g.external_id)))
}

function transformGame(game: any, context?: any): BearsGame {
  const gameDate = new Date(game.game_date)
  const today = new Date()
  const isPast = gameDate < today
  const bearsWin = game.bears_win === true ||
    (game.bears_score !== null && game.opponent_score !== null && game.bears_score > game.opponent_score)

  return {
    gameId: game.game_id || game.external_id,
    season: game.season,
    week: game.week,
    date: game.game_date,
    time: game.game_time,
    dayOfWeek: gameDate.toLocaleDateString('en-US', { weekday: 'long' }),
    opponent: game.opponent,
    homeAway: game.is_bears_home ? 'home' : 'away',
    status: isPast && game.bears_score !== null ? 'final' :
            (game.status === 'in_progress' ? 'in_progress' : 'scheduled'),
    bearsScore: game.bears_score,
    oppScore: game.opponent_score,
    result: isPast && game.bears_score !== null ? (bearsWin ? 'W' : 'L') : null,
    venue: game.stadium || context?.venue,
    tv: context?.tv || context?.broadcast,
    isPlayoff: game.is_playoff || game.game_type === 'POST',
    articleSlug: game.article_slug || context?.article_slug,
    weather: game.temp_f !== null ? {
      tempF: game.temp_f,
      windMph: game.wind_mph,
    } : null,
  }
}

/**
 * Get recent Bears scores (completed games)
 */
export async function getBearsRecentScores(limit: number = 10): Promise<BearsGame[]> {
  const schedule = await getBearsSchedule()
  return schedule
    .filter(g => g.status === 'final')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

/**
 * Get Bears stats for a season
 */
export async function getBearsStats(
  season?: number,
  split: 'regular' | 'playoffs' = 'regular'
): Promise<BearsStats> {
  const targetSeason = season || getCurrentSeason()

  // Get team stats
  const teamStats = await getTeamStats(targetSeason)

  // Get leaderboards
  const leaderboards = await getLeaderboards(targetSeason)

  return {
    team: teamStats,
    leaderboards,
  }
}

async function getTeamStats(season: number): Promise<BearsTeamStats> {
  try {
    const { data, error } = await supabase
      .from('bears_team_season_stats')
      .select('*')
      .eq('season', season)
      .single()

    if (error || !data) {
      return await getTeamStatsFromDatalab(season)
    }

    return transformTeamStats(data)
  } catch {
    return await getTeamStatsFromDatalab(season)
  }
}

async function getTeamStatsFromDatalab(season: number): Promise<BearsTeamStats> {
  if (!datalabAdmin) {
    return getDefaultTeamStats(season)
  }

  const { data, error } = await datalabAdmin
    .from('bears_team_season_stats')
    .select('*')
    .eq('season', season)
    .single()

  if (error || !data) {
    return getDefaultTeamStats(season)
  }

  return transformTeamStats(data)
}

function transformTeamStats(data: any): BearsTeamStats {
  const gamesPlayed = (data.wins || 0) + (data.losses || 0) + (data.ties || 0)
  return {
    season: data.season,
    record: `${data.wins || 0}-${data.losses || 0}${data.ties > 0 ? `-${data.ties}` : ''}`,
    wins: data.wins || 0,
    losses: data.losses || 0,
    ties: data.ties || 0,
    pointsFor: data.points_for || 0,
    pointsAgainst: data.points_against || 0,
    ppg: gamesPlayed > 0 ? Math.round((data.points_for || 0) / gamesPlayed * 10) / 10 : 0,
    papg: gamesPlayed > 0 ? Math.round((data.points_against || 0) / gamesPlayed * 10) / 10 : 0,
    pointDifferential: (data.points_for || 0) - (data.points_against || 0),
    offensiveRank: data.offensive_rank || null,
    defensiveRank: data.defensive_rank || null,
  }
}

function getDefaultTeamStats(season: number): BearsTeamStats {
  return {
    season,
    record: '0-0',
    wins: 0,
    losses: 0,
    ties: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    ppg: 0,
    papg: 0,
    pointDifferential: 0,
    offensiveRank: null,
    defensiveRank: null,
  }
}

async function getLeaderboards(season: number): Promise<BearsLeaderboard> {
  const players = await getBearsPlayers()

  // Get all season stats for this season
  let seasonStats: any[] = []

  try {
    const { data, error } = await supabase
      .from('bears_player_season_stats')
      .select('*')
      .eq('season', season)

    if (!error && data) {
      seasonStats = data
    }
  } catch {
    // Fallback to Datalab
    if (datalabAdmin) {
      const { data } = await datalabAdmin
        .from('bears_player_season_stats')
        .select('*')
        .eq('season', season)
      seasonStats = data || []
    }
  }

  const statsMap = new Map(seasonStats.map((s: any) => [String(s.player_id), s]))
  const playersMap = new Map(players.map(p => [p.playerId, p]))

  // Build leaderboards
  const passing = seasonStats
    .filter((s: any) => s.pass_yds > 0)
    .sort((a: any, b: any) => (b.pass_yds || 0) - (a.pass_yds || 0))
    .slice(0, 5)
    .map((s: any) => ({
      player: playersMap.get(String(s.player_id))!,
      primaryStat: s.pass_yds || 0,
      primaryLabel: 'YDS',
      secondaryStat: s.pass_td || 0,
      secondaryLabel: 'TD',
      tertiaryStat: s.pass_int || 0,
      tertiaryLabel: 'INT',
    }))
    .filter((e: any) => e.player)

  const rushing = seasonStats
    .filter((s: any) => s.rush_yds > 0)
    .sort((a: any, b: any) => (b.rush_yds || 0) - (a.rush_yds || 0))
    .slice(0, 5)
    .map((s: any) => ({
      player: playersMap.get(String(s.player_id))!,
      primaryStat: s.rush_yds || 0,
      primaryLabel: 'YDS',
      secondaryStat: s.rush_td || 0,
      secondaryLabel: 'TD',
      tertiaryStat: s.rush_att || 0,
      tertiaryLabel: 'ATT',
    }))
    .filter((e: any) => e.player)

  const receiving = seasonStats
    .filter((s: any) => s.rec_yds > 0)
    .sort((a: any, b: any) => (b.rec_yds || 0) - (a.rec_yds || 0))
    .slice(0, 5)
    .map((s: any) => ({
      player: playersMap.get(String(s.player_id))!,
      primaryStat: s.rec_yds || 0,
      primaryLabel: 'YDS',
      secondaryStat: s.rec_td || 0,
      secondaryLabel: 'TD',
      tertiaryStat: s.rec || 0,
      tertiaryLabel: 'REC',
    }))
    .filter((e: any) => e.player)

  const defense = seasonStats
    .filter((s: any) => (s.tackles || s.total_tackles || 0) > 0)
    .sort((a: any, b: any) =>
      (b.tackles || b.total_tackles || 0) - (a.tackles || a.total_tackles || 0)
    )
    .slice(0, 5)
    .map((s: any) => ({
      player: playersMap.get(String(s.player_id))!,
      primaryStat: s.tackles || s.total_tackles || 0,
      primaryLabel: 'TKL',
      secondaryStat: s.sacks || 0,
      secondaryLabel: 'SACK',
      tertiaryStat: s.interceptions || s.int || 0,
      tertiaryLabel: 'INT',
    }))
    .filter((e: any) => e.player)

  return { passing, rushing, receiving, defense }
}

/**
 * Get available seasons
 */
export async function getAvailableSeasons(): Promise<number[]> {
  try {
    const { data } = await supabase
      .from('bears_games_master')
      .select('season')
      .order('season', { ascending: false })

    if (data && data.length > 0) {
      return [...new Set(data.map((d: any) => d.season))]
    }
  } catch {
    // Fallback
  }

  // Default seasons
  const current = getCurrentSeason()
  return [current, current - 1, current - 2]
}

function getCurrentSeason(): number {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  // NFL season starts in September (month 8)
  return month >= 8 ? year : year - 1
}

// =============================================================================
// LIVE DATA HELPERS - READ DIRECTLY FROM DATALAB
// =============================================================================

/**
 * Get live game state (for in-progress games only)
 * Always queries Datalab directly for real-time data
 */
export async function getLiveBearsGameState(): Promise<LiveGameState | null> {
  if (!datalabAdmin) return null

  try {
    // Look for in-progress game
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await datalabAdmin
      .from('bears_games_master')
      .select('*')
      .eq('game_date', today)
      .in('status', ['in_progress', 'live'])
      .single()

    if (error || !data) return null

    // Get live context if available
    const { data: liveData } = await datalabAdmin
      .from('bears_live_game_state')
      .select('*')
      .eq('game_id', data.game_id || data.external_id)
      .single()

    return {
      gameId: data.game_id || data.external_id,
      status: liveData?.status || 'in_progress',
      quarter: liveData?.quarter || null,
      clock: liveData?.clock || null,
      possession: liveData?.possession || null,
      down: liveData?.down || null,
      distance: liveData?.distance || null,
      ballSpot: liveData?.ball_spot || null,
      bearsScore: data.bears_score || 0,
      oppScore: data.opponent_score || 0,
      opponent: data.opponent,
      isHome: data.is_bears_home,
    }
  } catch (err) {
    console.error('getLiveBearsGameState error:', err)
    return null
  }
}

/**
 * Get live box score for current game
 * Always queries Datalab directly
 */
export async function getLiveBearsBoxScore(gameId: string): Promise<LiveBoxScore | null> {
  if (!datalabAdmin) return null

  try {
    const { data, error } = await datalabAdmin
      .from('bears_player_game_stats')
      .select(`
        *,
        bears_players(full_name, position)
      `)
      .eq('game_id', gameId)

    if (error || !data) return null

    return {
      gameId,
      players: data.map((s: any) => ({
        playerId: String(s.player_id),
        name: s.bears_players?.full_name || 'Unknown',
        position: s.bears_players?.position || '',
        stats: {
          passAttempts: s.pass_att,
          passCompletions: s.pass_cmp,
          passYards: s.pass_yds,
          passTD: s.pass_td,
          passINT: s.pass_int,
          rushAttempts: s.rush_att,
          rushYards: s.rush_yds,
          rushTD: s.rush_td,
          targets: s.rec_tgt,
          receptions: s.rec,
          recYards: s.rec_yds,
          recTD: s.rec_td,
          tackles: s.tackles,
          sacks: s.sacks,
          interceptions: s.interceptions,
        },
      })),
    }
  } catch (err) {
    console.error('getLiveBearsBoxScore error:', err)
    return null
  }
}

/**
 * Check if there's a live Bears game right now
 */
export async function hasLiveBearsGame(): Promise<boolean> {
  const liveState = await getLiveBearsGameState()
  return liveState !== null
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get similar players (same position)
 */
export async function getSimilarPlayers(
  currentPlayer: BearsPlayer,
  limit: number = 3
): Promise<BearsPlayer[]> {
  const players = await getBearsPlayers()
  return players
    .filter(p =>
      p.position === currentPlayer.position &&
      p.playerId !== currentPlayer.playerId
    )
    .slice(0, limit)
}

/**
 * Search players by name or number
 */
export async function searchPlayers(query: string): Promise<BearsPlayer[]> {
  const players = await getBearsPlayers()
  const q = query.toLowerCase().trim()

  if (!q) return players

  return players.filter(p => {
    const matchesName = p.fullName.toLowerCase().includes(q)
    const matchesNumber = p.jerseyNumber?.toString() === q
    return matchesName || matchesNumber
  })
}

/**
 * Filter players by side
 */
export function filterPlayersBySide(
  players: BearsPlayer[],
  side: Side | 'ALL'
): BearsPlayer[] {
  if (side === 'ALL') return players
  return players.filter(p => p.side === side)
}
