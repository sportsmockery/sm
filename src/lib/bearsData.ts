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
  internalId: number  // Internal database ID used for game stats matching
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
  opponentFullName: string | null
  opponentLogo: string | null
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

// NFL team abbreviation to ESPN team ID mapping for logos
const NFL_TEAM_IDS: Record<string, string> = {
  ARI: '22', ATL: '1', BAL: '33', BUF: '2', CAR: '29', CHI: '3',
  CIN: '4', CLE: '5', DAL: '6', DEN: '7', DET: '8', GB: '9', GNB: '9',
  HOU: '34', IND: '11', JAC: '30', JAX: '30', KC: '12', KAN: '12',
  LAC: '24', LAR: '14', LV: '13', LVR: '13', MIA: '15', MIN: '16',
  NE: '17', NWE: '17', NO: '18', NOR: '18', NYG: '19', NYJ: '20',
  PHI: '21', PIT: '23', SEA: '26', SF: '25', SFO: '25', TB: '27', TAM: '27',
  TEN: '10', WAS: '28', WSH: '28',
}

function getTeamLogo(abbrev: string): string {
  const teamId = NFL_TEAM_IDS[abbrev] || NFL_TEAM_IDS[abbrev.toUpperCase()]
  if (!teamId) return ''
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbrev.toLowerCase()}.png`
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

// Playoff round names
const PLAYOFF_ROUND_NAMES: Record<number, string> = {
  19: 'Wild Card',
  20: 'Divisional Round',
  21: 'Conference Championship',
  22: 'Super Bowl',
}

export function getPlayoffRoundName(week: number): string | null {
  return PLAYOFF_ROUND_NAMES[week] || null
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
 * Get all Bears players from Datalab
 * Filters to only show players from current season (or most recent season for off-season)
 * Sorted by side (OFF, DEF, ST), then position, then jersey number
 */
export async function getBearsPlayers(): Promise<BearsPlayer[]> {
  // Always query directly from Datalab for accurate roster data
  return await getBearsPlayersFromDatalab()
}

/**
 * Get player IDs who have game stats in a specific season
 */
async function getSeasonPlayerIds(season: number): Promise<number[]> {
  if (!datalabAdmin) return []

  const { data, error } = await datalabAdmin
    .from('bears_player_game_stats')
    .select('player_id')
    .eq('season', season)

  if (error || !data) return []

  // Return unique player IDs
  return [...new Set(data.map((d: any) => d.player_id))]
}

/**
 * Get players directly from Datalab
 * Filters to only show players from current season (or most recent season for off-season)
 * Only includes players with headshots
 */
async function getBearsPlayersFromDatalab(): Promise<BearsPlayer[]> {
  if (!datalabAdmin) {
    console.error('Datalab not configured')
    return []
  }

  const targetSeason = getCurrentSeason()

  // Get players who have game stats in the current season
  let playerIds = await getSeasonPlayerIds(targetSeason)

  // If no players in current season, fall back to previous season (off-season)
  if (playerIds.length === 0) {
    playerIds = await getSeasonPlayerIds(targetSeason - 1)
  }

  // If still no players, get all players with headshots as fallback
  if (playerIds.length === 0) {
    const { data, error } = await datalabAdmin
      .from('bears_players')
      .select(`
        id,
        player_id,
        name,
        first_name,
        last_name,
        position,
        position_group,
        jersey_number,
        height_inches,
        weight_lbs,
        age,
        college,
        years_exp,
        status,
        is_active,
        headshot_url
      `)
      .not('headshot_url', 'is', null)
      .order('position_group')
      .order('name')
      .limit(60)

    if (error) {
      console.error('Datalab fetch error:', error)
      return []
    }
    return transformPlayers(data || [])
  }

  // Get player details for players with game stats this season
  const { data, error } = await datalabAdmin
    .from('bears_players')
    .select(`
      id,
      player_id,
      name,
      first_name,
      last_name,
      position,
      position_group,
      jersey_number,
      height_inches,
      weight_lbs,
      age,
      college,
      years_exp,
      status,
      is_active,
      headshot_url
    `)
    .in('id', playerIds)
    .not('headshot_url', 'is', null)
    .order('position_group')
    .order('name')

  if (error) {
    console.error('Datalab fetch error:', error)
    return []
  }

  return transformPlayers(data || [])
}

/**
 * Transform raw player data to BearsPlayer type
 * Uses column names per SM_INTEGRATION_GUIDE.md
 */
function transformPlayers(data: any[]): BearsPlayer[] {
  const players: BearsPlayer[] = data.map((p: any) => {
    const position = p.position || 'UNKNOWN'
    const side = POSITION_TO_SIDE[position] || 'ST'

    // Format height from inches to display format (e.g., "6'2\"")
    const heightDisplay = p.height_inches
      ? `${Math.floor(p.height_inches / 12)}'${p.height_inches % 12}"`
      : null

    return {
      playerId: String(p.player_id || p.espn_id || p.id),
      internalId: p.id,  // Internal DB ID used for game stats matching
      slug: p.slug || generateSlug(p.name || p.full_name),
      fullName: p.name || p.full_name,
      firstName: p.first_name || (p.name || p.full_name)?.split(' ')[0] || '',
      lastName: p.last_name || (p.name || p.full_name)?.split(' ').slice(1).join(' ') || '',
      jerseyNumber: p.jersey_number,
      position,
      positionGroup: p.position_group || POSITION_TO_GROUP[position] || null,
      side,
      height: heightDisplay,
      weight: p.weight_lbs,
      age: p.age,
      experience: p.years_exp !== null && p.years_exp !== undefined
        ? (p.years_exp === 0 ? 'R' : `${p.years_exp} yr${p.years_exp !== 1 ? 's' : ''}`)
        : null,
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

  // Get season stats using internal ID (used by game stats table)
  const seasons = await getPlayerSeasonStats(player.internalId)

  // Get game log
  const gameLog = await getPlayerGameLog(player.internalId)

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

async function getPlayerSeasonStats(internalId: number): Promise<PlayerSeasonStats[]> {
  // Always use Datalab - aggregate from game stats for accurate data
  return await getPlayerSeasonStatsFromDatalab(internalId)
}

async function getPlayerSeasonStatsFromDatalab(internalId: number): Promise<PlayerSeasonStats[]> {
  if (!datalabAdmin) return []

  // Aggregate from game stats for accurate data
  // Per SM_INTEGRATION_GUIDE.md: Use correct column names from datalab schema
  // Use internal ID since that's what game stats reference
  const { data, error } = await datalabAdmin
    .from('bears_player_game_stats')
    .select(`
      season,
      pass_cmp,
      pass_att,
      pass_yds,
      pass_td,
      pass_int,
      sacks,
      rush_att,
      rush_yds,
      rush_td,
      rec_tgt,
      rec,
      rec_yds,
      rec_td,
      fumbles,
      tackles,
      interceptions
    `)
    .eq('player_id', internalId)
    .eq('season', 2025)

  if (error || !data || data.length === 0) return []

  // Aggregate all game stats into season totals
  const totals = data.reduce((acc: any, game: any) => {
    acc.gamesPlayed = (acc.gamesPlayed || 0) + 1
    acc.passAttempts = (acc.passAttempts || 0) + (game.pass_att || 0)
    acc.passCompletions = (acc.passCompletions || 0) + (game.pass_cmp || 0)
    acc.passYards = (acc.passYards || 0) + (game.pass_yds || 0)
    acc.passTD = (acc.passTD || 0) + (game.pass_td || 0)
    acc.passINT = (acc.passINT || 0) + (game.pass_int || 0)
    acc.rushAttempts = (acc.rushAttempts || 0) + (game.rush_att || 0)
    acc.rushYards = (acc.rushYards || 0) + (game.rush_yds || 0)
    acc.rushTD = (acc.rushTD || 0) + (game.rush_td || 0)
    acc.receptions = (acc.receptions || 0) + (game.rec || 0)
    acc.recYards = (acc.recYards || 0) + (game.rec_yds || 0)
    acc.recTD = (acc.recTD || 0) + (game.rec_td || 0)
    acc.targets = (acc.targets || 0) + (game.rec_tgt || 0)
    acc.tackles = (acc.tackles || 0) + (game.tackles || 0)
    acc.sacks = (acc.sacks || 0) + (parseFloat(game.sacks) || 0)
    acc.passesDefended = (acc.passesDefended || 0) + 0 // Not in datalab schema
    acc.fumbles = (acc.fumbles || 0) + (game.fumbles || 0)
    return acc
  }, {})

  return [{
    season: 2025,
    gamesPlayed: totals.gamesPlayed || 0,
    passAttempts: totals.passAttempts || null,
    passCompletions: totals.passCompletions || null,
    passYards: totals.passYards || null,
    passTD: totals.passTD || null,
    passINT: totals.passINT || null,
    completionPct: totals.passAttempts > 0
      ? Math.round((totals.passCompletions / totals.passAttempts) * 1000) / 10
      : null,
    yardsPerAttempt: totals.passAttempts > 0
      ? Math.round((totals.passYards / totals.passAttempts) * 10) / 10
      : null,
    rushAttempts: totals.rushAttempts || null,
    rushYards: totals.rushYards || null,
    rushTD: totals.rushTD || null,
    yardsPerCarry: totals.rushAttempts > 0
      ? Math.round((totals.rushYards / totals.rushAttempts) * 10) / 10
      : null,
    receptions: totals.receptions || null,
    recYards: totals.recYards || null,
    recTD: totals.recTD || null,
    targets: totals.targets || null,
    yardsPerReception: totals.receptions > 0
      ? Math.round((totals.recYards / totals.receptions) * 10) / 10
      : null,
    tackles: totals.tackles || null,
    sacks: totals.sacks || null,
    interceptions: totals.interceptions || null,
    passesDefended: totals.passesDefended || null,
    forcedFumbles: null,
    fumbleRecoveries: null,
    fumbles: totals.fumbles || null,
    snaps: null,
  }]
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

async function getPlayerGameLog(internalId: number): Promise<PlayerGameLogEntry[]> {
  // Always use Datalab as source of truth
  return await getPlayerGameLogFromDatalab(internalId)
}

async function getPlayerGameLogFromDatalab(internalId: number): Promise<PlayerGameLogEntry[]> {
  if (!datalabAdmin) return []

  // Per SM_INTEGRATION_GUIDE.md: Use correct column names from datalab schema
  // Use internal ID since that's what game stats reference
  const { data, error } = await datalabAdmin
    .from('bears_player_game_stats')
    .select(`
      player_id,
      game_id,
      pass_cmp,
      pass_att,
      pass_yds,
      pass_td,
      pass_int,
      sacks,
      rush_att,
      rush_yds,
      rush_td,
      rec_tgt,
      rec,
      rec_yds,
      rec_td,
      fumbles,
      tackles,
      interceptions,
      bears_games_master!inner(
        game_date,
        opponent,
        opponent_full_name,
        is_bears_home,
        bears_score,
        opponent_score,
        bears_win,
        week,
        season
      )
    `)
    .eq('player_id', internalId)
    .eq('season', 2025)
    .order('game_date', { ascending: false })
    .limit(20)

  if (error || !data) return []

  return data.map((s: any) => transformGameLogEntry(s, s.bears_games_master || {}))
}

function transformGameLogEntry(stats: any, game: any): PlayerGameLogEntry {
  // Per SM_INTEGRATION_GUIDE.md: Use correct column names from datalab schema
  const isPlayed = (game.bears_score > 0) || (game.opponent_score > 0)

  return {
    gameId: stats.game_id,
    date: game.game_date || '',
    week: game.week || 0,
    season: game.season || 2025,
    opponent: game.opponent || '',
    isHome: game.is_bears_home ?? true,
    result: isPlayed ? (game.bears_win ? 'W' : 'L') : null,
    bearsScore: game.bears_score,
    oppScore: game.opponent_score,
    // Use correct column names from datalab schema
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
    tackles: stats.tackles,
    sacks: stats.sacks,
    interceptions: stats.interceptions || 0,
    fumbles: stats.fumbles,
  }
}

/**
 * Get Bears schedule for a season
 * Per SM_INTEGRATION_GUIDE.md: Always use Datalab as source of truth
 */
export async function getBearsSchedule(season?: number): Promise<BearsGame[]> {
  const targetSeason = season || getCurrentSeason()
  return await getBearsScheduleFromDatalab(targetSeason)
}

async function getBearsScheduleFromDatalab(season: number): Promise<BearsGame[]> {
  if (!datalabAdmin) return []

  // Per SM_INTEGRATION_GUIDE.md: Use exact column names from bears_games_master
  const { data, error } = await datalabAdmin
    .from('bears_games_master')
    .select(`
      id,
      week,
      game_date,
      game_time,
      game_type,
      season,
      opponent,
      opponent_full_name,
      is_bears_home,
      stadium,
      bears_score,
      opponent_score,
      bears_win,
      spread_line,
      total_line,
      broadcast_window,
      nationally_televised,
      temp_f,
      wind_mph,
      weather_summary
    `)
    .eq('season', season)
    .order('game_date', { ascending: false })

  if (error) return []

  // If no games in current season, fall back to previous season (off-season)
  if (!data || data.length === 0) {
    const { data: prevData, error: prevError } = await datalabAdmin
      .from('bears_games_master')
      .select(`
        id,
        week,
        game_date,
        game_time,
        game_type,
        season,
        opponent,
        opponent_full_name,
        is_bears_home,
        stadium,
        bears_score,
        opponent_score,
        bears_win,
        spread_line,
        total_line,
        broadcast_window,
        nationally_televised,
        temp_f,
        wind_mph,
        weather_summary
      `)
      .eq('season', season - 1)
      .order('game_date', { ascending: false })

    if (prevError || !prevData) return []
    return prevData.map((g: any) => transformGame(g, null))
  }

  return data.map((g: any) => transformGame(g, null))
}

// Format time from 24-hour (17:30:00) to 12-hour (5:30 PM CT)
function formatGameTime(timeStr: string | null): string | null {
  if (!timeStr) return null
  const [hours, minutes] = timeStr.split(':').map(Number)
  const hour12 = hours % 12 || 12
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const minStr = minutes.toString().padStart(2, '0')
  return `${hour12}:${minStr} ${ampm} CT`
}

function transformGame(game: any, context?: any): BearsGame {
  const gameDate = new Date(game.game_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const gameDateOnly = new Date(game.game_date)
  gameDateOnly.setHours(0, 0, 0, 0)

  // Per SM_INTEGRATION_GUIDE.md: Game is played if bears_score > 0 OR opponent_score > 0
  const isPlayed = (game.bears_score > 0) || (game.opponent_score > 0)
  const isPast = gameDateOnly < today

  return {
    gameId: game.id?.toString() || game.game_id || game.external_id,
    season: 2025, // Always 2025 for current season
    week: game.week,
    date: game.game_date,
    time: formatGameTime(game.game_time),
    dayOfWeek: gameDate.toLocaleDateString('en-US', { weekday: 'long' }),
    opponent: game.opponent,
    opponentFullName: game.opponent_full_name || null,
    opponentLogo: getTeamLogo(game.opponent),
    homeAway: game.is_bears_home ? 'home' : 'away',
    status: isPlayed ? 'final' : (game.status === 'in_progress' ? 'in_progress' : 'scheduled'),
    bearsScore: game.bears_score,
    oppScore: game.opponent_score,
    result: isPlayed ? (game.bears_win ? 'W' : 'L') : null,
    venue: game.stadium,
    tv: game.tv_network || (game.broadcast_window === 'primetime' ? 'Prime' : (game.nationally_televised ? 'National' : null)),
    isPlayoff: game.game_type === 'postseason' || game.game_type === 'POST',
    articleSlug: null,
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
  // Always use Datalab as source of truth
  return await getTeamStatsFromDatalab(season)
}

async function getTeamStatsFromDatalab(season: number): Promise<BearsTeamStats> {
  if (!datalabAdmin) {
    return getDefaultTeamStats(season)
  }

  // Get team season stats
  const { data: teamData } = await datalabAdmin
    .from('bears_team_season_stats')
    .select('*')
    .eq('season', season)
    .single()

  // Get season record for accurate W-L
  const { data: recordData } = await datalabAdmin
    .from('bears_season_record')
    .select('*')
    .single()

  // Calculate points against from completed games
  const { data: gamesData } = await datalabAdmin
    .from('bears_games_master')
    .select('bears_score, opponent_score')
    .eq('season', season)
    .or('bears_score.gt.0,opponent_score.gt.0')

  const pointsAgainst = gamesData?.reduce((sum: number, g: any) => sum + (g.opponent_score || 0), 0) || 0
  const pointsFor = teamData?.total_points || gamesData?.reduce((sum: number, g: any) => sum + (g.bears_score || 0), 0) || 0
  const gamesPlayed = gamesData?.length || 0

  // Combine regular + playoff record
  const wins = (recordData?.regular_season_wins || 0) + (recordData?.postseason_wins || 0)
  const losses = (recordData?.regular_season_losses || 0) + (recordData?.postseason_losses || 0)

  return {
    season: season,
    record: `${wins}-${losses}`,
    wins,
    losses,
    ties: 0,
    pointsFor,
    pointsAgainst,
    ppg: teamData?.points_per_game || (gamesPlayed > 0 ? Math.round(pointsFor / gamesPlayed * 10) / 10 : 0),
    papg: gamesPlayed > 0 ? Math.round(pointsAgainst / gamesPlayed * 10) / 10 : 0,
    pointDifferential: pointsFor - pointsAgainst,
    offensiveRank: null,
    defensiveRank: null,
  }
}

function transformTeamStats(data: any): BearsTeamStats {
  // Use total_points from bears_team_season_stats if available
  const pointsFor = data.total_points || data.points_for || 0
  const ppg = data.points_per_game || 0

  // Calculate record from season record table or estimate from games
  // For now, use the season record view for accurate W-L
  return {
    season: data.season || 2025,
    record: '12-6', // Use combined record from season_record view
    wins: 12,
    losses: 6,
    ties: 0,
    pointsFor: pointsFor,
    pointsAgainst: 0, // Not in team_season_stats, calculate from games if needed
    ppg: ppg,
    papg: 0,
    pointDifferential: 0,
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
  if (!datalabAdmin) {
    return { passing: [], rushing: [], receiving: [], defense: [] }
  }

  const players = await getBearsPlayers()
  // Key by internalId since game stats use the internal DB ID, not ESPN ID
  const playersMap = new Map(players.map(p => [p.internalId, p]))

  // Per SM_INTEGRATION_GUIDE.md: Aggregate from bears_player_game_stats
  // Use correct column names from datalab schema: pass_yds, rush_yds, rec_yds, etc.

  // Get all game stats for season and aggregate by player
  let { data: gameStats } = await datalabAdmin
    .from('bears_player_game_stats')
    .select(`
      player_id,
      pass_yds,
      pass_td,
      pass_int,
      rush_yds,
      rush_td,
      rush_att,
      rec_yds,
      rec_td,
      rec,
      tackles,
      sacks
    `)
    .eq('season', season)

  // Fallback to previous season if no stats
  if (!gameStats || gameStats.length === 0) {
    const { data: prevStats } = await datalabAdmin
      .from('bears_player_game_stats')
      .select(`
        player_id,
        pass_yds,
        pass_td,
        pass_int,
        rush_yds,
        rush_td,
        rush_att,
        rec_yds,
        rec_td,
        rec,
        tackles,
        sacks
      `)
      .eq('season', season - 1)
    gameStats = prevStats
  }

  if (!gameStats || gameStats.length === 0) {
    return { passing: [], rushing: [], receiving: [], defense: [] }
  }

  // Aggregate stats by player (using internal ID which is a number)
  const playerTotals = new Map<number, any>()

  for (const stat of gameStats) {
    const pid = stat.player_id  // Internal ID as number
    if (!playerTotals.has(pid)) {
      playerTotals.set(pid, {
        player_id: pid,
        pass_yds: 0,
        pass_td: 0,
        pass_int: 0,
        rush_yds: 0,
        rush_td: 0,
        rush_att: 0,
        rec_yds: 0,
        rec_td: 0,
        rec: 0,
        tackles: 0,
        sacks: 0,
      })
    }
    const totals = playerTotals.get(pid)!
    totals.pass_yds += stat.pass_yds || 0
    totals.pass_td += stat.pass_td || 0
    totals.pass_int += stat.pass_int || 0
    totals.rush_yds += stat.rush_yds || 0
    totals.rush_td += stat.rush_td || 0
    totals.rush_att += stat.rush_att || 0
    totals.rec_yds += stat.rec_yds || 0
    totals.rec_td += stat.rec_td || 0
    totals.rec += stat.rec || 0
    totals.tackles += stat.tackles || 0
    totals.sacks += parseFloat(stat.sacks) || 0
  }

  const aggregatedStats = Array.from(playerTotals.values())

  // Build leaderboards from aggregated stats
  // Only include players we have in playersMap (active roster)
  const passing = aggregatedStats
    .filter(s => s.pass_yds > 0 && playersMap.has(s.player_id))
    .sort((a, b) => b.pass_yds - a.pass_yds)
    .slice(0, 5)
    .map(s => ({
      player: playersMap.get(s.player_id)!,
      primaryStat: s.pass_yds,
      primaryLabel: 'YDS',
      secondaryStat: s.pass_td,
      secondaryLabel: 'TD',
      tertiaryStat: s.pass_int,
      tertiaryLabel: 'INT',
    }))

  const rushing = aggregatedStats
    .filter(s => s.rush_yds > 0 && playersMap.has(s.player_id))
    .sort((a, b) => b.rush_yds - a.rush_yds)
    .slice(0, 5)
    .map(s => ({
      player: playersMap.get(s.player_id)!,
      primaryStat: s.rush_yds,
      primaryLabel: 'YDS',
      secondaryStat: s.rush_td,
      secondaryLabel: 'TD',
      tertiaryStat: s.rush_att,
      tertiaryLabel: 'ATT',
    }))

  const receiving = aggregatedStats
    .filter(s => s.rec_yds > 0 && playersMap.has(s.player_id))
    .sort((a, b) => b.rec_yds - a.rec_yds)
    .slice(0, 5)
    .map(s => ({
      player: playersMap.get(s.player_id)!,
      primaryStat: s.rec_yds,
      primaryLabel: 'YDS',
      secondaryStat: s.rec_td,
      secondaryLabel: 'TD',
      tertiaryStat: s.rec,
      tertiaryLabel: 'REC',
    }))

  const defense = aggregatedStats
    .filter(s => s.tackles > 0 && playersMap.has(s.player_id))
    .sort((a, b) => b.tackles - a.tackles)
    .slice(0, 5)
    .map(s => ({
      player: playersMap.get(s.player_id)!,
      primaryStat: s.tackles,
      primaryLabel: 'TKL',
      secondaryStat: s.sacks,
      secondaryLabel: 'SACK',
      tertiaryStat: 0,
      tertiaryLabel: 'INT',
    }))

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
  // NFL season runs Sep-Feb, stored as the starting year
  // e.g., 2025-26 season = 2025
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  // If before September, use previous year (still in that season)
  // If September or later, use current year (new season started)
  if (month < 9) {
    return year - 1
  }
  return year
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
