/**
 * Blackhawks Data Layer
 *
 * This module provides helper functions for Blackhawks data access.
 * Data is pulled from DataLab Supabase ({blackhawks}_* tables).
 *
 * All page-level components should use these helpers, never query databases directly.
 */

import { datalabAdmin } from './supabase-datalab'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type PositionGroup = 'forwards' | 'defensemen' | 'goalies'

export interface BlackhawksPlayer {
  playerId: string
  internalId: number
  slug: string
  fullName: string
  firstName: string
  lastName: string
  jerseyNumber: number | null
  position: string
  positionGroup: PositionGroup
  height: string | null
  weight: number | null
  age: number | null
  experience: string | null
  college: string | null
  birthCountry: string | null
  headshotUrl: string | null
  status: string | null
}

export interface PlayerSeasonStats {
  season: number
  gamesPlayed: number
  // Skater stats
  goals: number | null
  assists: number | null
  points: number | null
  plusMinus: number | null
  pim: number | null
  shots: number | null
  shotPct: number | null
  hits: number | null
  blockedShots: number | null
  toi: string | null
  // Goalie stats
  wins: number | null
  losses: number | null
  otLosses: number | null
  saves: number | null
  goalsAgainst: number | null
  savePct: number | null
  gaa: number | null
  shutouts: number | null
}

export interface PlayerGameLogEntry {
  gameId: string
  date: string
  season: number
  opponent: string
  isHome: boolean
  result: 'W' | 'L' | 'OTL' | null
  blackhawksScore: number | null
  oppScore: number | null
  goals: number | null
  assists: number | null
  points: number | null
  plusMinus: number | null
  pim: number | null
  shots: number | null
  toi: string | null
  // Goalie stats
  saves: number | null
  goalsAgainst: number | null
}

export interface PlayerProfile {
  player: BlackhawksPlayer
  seasons: PlayerSeasonStats[]
  currentSeason: PlayerSeasonStats | null
  gameLog: PlayerGameLogEntry[]
}

export interface BlackhawksGame {
  gameId: string
  season: number
  date: string
  time: string | null
  dayOfWeek: string
  opponent: string
  opponentFullName: string | null
  opponentLogo: string | null
  homeAway: 'home' | 'away'
  status: 'scheduled' | 'in_progress' | 'final'
  blackhawksScore: number | null
  oppScore: number | null
  result: 'W' | 'L' | 'OTL' | null
  arena: string | null
  tv: string | null
  overtime: boolean
  shootout: boolean
}

export interface BlackhawksTeamStats {
  season: number
  record: string
  wins: number
  losses: number
  otLosses: number
  points: number
  goalsFor: number
  goalsAgainst: number
  gfpg: number
  gapg: number
  ppPct: number | null
  pkPct: number | null
}

export interface BlackhawksLeaderboard {
  goals: LeaderboardEntry[]
  assists: LeaderboardEntry[]
  points: LeaderboardEntry[]
  goaltending: LeaderboardEntry[]
}

export interface LeaderboardEntry {
  player: BlackhawksPlayer
  primaryStat: number
  primaryLabel: string
  secondaryStat: number | null
  secondaryLabel: string | null
  tertiaryStat: number | null
  tertiaryLabel: string | null
}

export interface BlackhawksStats {
  team: BlackhawksTeamStats
  leaderboards: BlackhawksLeaderboard
}

// NHL team abbreviation to logo mapping
const NHL_TEAM_ABBREVS: Record<string, string> = {
  ANA: 'ana', ARI: 'ari', BOS: 'bos', BUF: 'buf', CGY: 'cgy',
  CAR: 'car', CHI: 'chi', COL: 'col', CBJ: 'cbj', DAL: 'dal',
  DET: 'det', EDM: 'edm', FLA: 'fla', LAK: 'la', MIN: 'min',
  MTL: 'mtl', NSH: 'nsh', NJD: 'njd', NYI: 'nyi', NYR: 'nyr',
  OTT: 'ott', PHI: 'phi', PIT: 'pit', SJS: 'sj', SEA: 'sea',
  STL: 'stl', TBL: 'tb', TOR: 'tor', UTA: 'utah', VAN: 'van',
  VGK: 'vgk', WSH: 'wsh', WPG: 'wpg',
}

function getTeamLogo(abbrev: string): string {
  const code = NHL_TEAM_ABBREVS[abbrev] || abbrev.toLowerCase()
  return `https://a.espncdn.com/i/teamlogos/nhl/500/${code}.png`
}

// Position group mapping for NHL
function getPositionGroup(position: string): PositionGroup {
  const pos = position.toUpperCase()
  if (pos === 'G') return 'goalies'
  if (pos === 'D') return 'defensemen'
  return 'forwards' // C, LW, RW, F
}

const POSITION_GROUP_NAMES: Record<PositionGroup, string> = {
  forwards: 'Forwards',
  defensemen: 'Defensemen',
  goalies: 'Goaltenders',
}

export { POSITION_GROUP_NAMES }

function generateSlug(name: string): string {
  if (!name) return ''
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// =============================================================================
// HELPER FUNCTIONS - READ FROM DATALAB
// =============================================================================

/**
 * Get all Blackhawks players from DataLab
 * Filters to current roster using is_active = true
 */
export async function getBlackhawksPlayers(): Promise<BlackhawksPlayer[]> {
  if (!datalabAdmin) {
    console.error('DataLab not configured')
    return []
  }

  // Get current roster players (is_active = true)
  const { data, error } = await datalabAdmin
    .from('blackhawks_players')
    .select('*')
    .eq('is_active', true)
    .order('position')
    .order('name')

  if (error) {
    console.error('DataLab fetch error:', error)
    return []
  }

  return transformPlayers(data || [])
}

/**
 * Get player IDs who have game stats in a specific season
 */
async function getSeasonPlayerIds(season: number): Promise<number[]> {
  if (!datalabAdmin) return []

  const { data, error } = await datalabAdmin
    .from('blackhawks_player_game_stats')
    .select('player_id')
    .eq('season', season)

  if (error || !data) return []

  // Return unique player IDs
  return [...new Set(data.map((d: any) => d.player_id))]
}

function transformPlayers(data: any[]): BlackhawksPlayer[] {
  return data.map((p: any) => {
    const position = p.position || 'F'
    const positionGroup = getPositionGroup(position)

    // Handle various height column formats
    let heightDisplay: string | null = null
    if (typeof p.height === 'string' && p.height) {
      heightDisplay = p.height
    } else if (p.height_inches) {
      heightDisplay = `${Math.floor(p.height_inches / 12)}'${p.height_inches % 12}"`
    }

    // Handle various experience column names
    const yearsExp = p.years_pro ?? p.years_exp ?? p.experience

    return {
      playerId: String(p.player_id || p.espn_id || p.id),
      internalId: p.id,
      slug: p.slug || generateSlug(p.name || p.full_name),
      fullName: p.name || p.full_name,
      firstName: p.first_name || (p.name || p.full_name)?.split(' ')[0] || '',
      lastName: p.last_name || (p.name || p.full_name)?.split(' ').slice(1).join(' ') || '',
      jerseyNumber: p.jersey_number,
      position,
      positionGroup,
      height: heightDisplay,
      weight: p.weight_lbs || p.weight,
      age: p.age,
      experience: yearsExp !== null && yearsExp !== undefined
        ? (yearsExp === 0 ? 'R' : `${yearsExp} yr${yearsExp !== 1 ? 's' : ''}`)
        : null,
      college: p.college || null,
      birthCountry: p.birth_country,
      headshotUrl: p.headshot_url,
      status: p.status,
    }
  }).sort((a, b) => parseInt(a.jerseyNumber?.toString() || '99') - parseInt(b.jerseyNumber?.toString() || '99'))
}

/**
 * Get Blackhawks roster grouped by position
 */
export async function getBlackhawksRosterGrouped(): Promise<Record<PositionGroup, BlackhawksPlayer[]>> {
  const players = await getBlackhawksPlayers()

  const grouped: Record<PositionGroup, BlackhawksPlayer[]> = {
    forwards: [],
    defensemen: [],
    goalies: [],
  }

  players.forEach(player => {
    grouped[player.positionGroup].push(player)
  })

  // Sort each group by jersey number
  Object.keys(grouped).forEach(key => {
    grouped[key as PositionGroup].sort((a, b) =>
      parseInt(a.jerseyNumber?.toString() || '99') - parseInt(b.jerseyNumber?.toString() || '99')
    )
  })

  return grouped
}

/**
 * Get a single player profile with stats and game log
 */
export async function getPlayerProfile(slug: string): Promise<PlayerProfile | null> {
  const players = await getBlackhawksPlayers()
  const player = players.find(p => p.slug === slug)

  if (!player) return null

  // Use playerId (ESPN ID) since stats tables use ESPN IDs in player_id column
  const espnId = player.playerId
  const seasons = await getPlayerSeasonStats(espnId, player.positionGroup === 'goalies')
  const gameLog = await getPlayerGameLog(espnId)

  const currentYear = getCurrentSeason()
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

async function getPlayerSeasonStats(espnId: string, isGoalie: boolean): Promise<PlayerSeasonStats[]> {
  if (!datalabAdmin) return []

  const { data, error } = await datalabAdmin
    .from('blackhawks_player_game_stats')
    .select(`
      season,
      goals,
      assists,
      points,
      plus_minus,
      pim,
      shots,
      hits,
      blocked_shots,
      toi,
      saves,
      goals_against,
      shots_against
    `)
    .eq('player_id', espnId)
    .eq('season', getCurrentSeason())

  if (error || !data || data.length === 0) return []

  // Aggregate all game stats into season totals
  const totals = data.reduce((acc: any, game: any) => {
    acc.gamesPlayed = (acc.gamesPlayed || 0) + 1
    acc.goals = (acc.goals || 0) + (game.goals || 0)
    acc.assists = (acc.assists || 0) + (game.assists || 0)
    acc.points = (acc.points || 0) + (game.points || 0)
    acc.plusMinus = (acc.plusMinus || 0) + (game.plus_minus || 0)
    acc.pim = (acc.pim || 0) + (game.pim || 0)
    acc.shots = (acc.shots || 0) + (game.shots || 0)
    acc.hits = (acc.hits || 0) + (game.hits || 0)
    acc.blockedShots = (acc.blockedShots || 0) + (game.blocked_shots || 0)
    // Goalie stats
    acc.saves = (acc.saves || 0) + (game.saves || 0)
    acc.goalsAgainst = (acc.goalsAgainst || 0) + (game.goals_against || 0)
    acc.shotsAgainst = (acc.shotsAgainst || 0) + (game.shots_against || 0)
    return acc
  }, {})

  return [{
    season: getCurrentSeason(),
    gamesPlayed: totals.gamesPlayed || 0,
    goals: totals.goals || null,
    assists: totals.assists || null,
    points: totals.points || null,
    plusMinus: totals.plusMinus || null,
    pim: totals.pim || null,
    shots: totals.shots || null,
    shotPct: totals.shots > 0 ? Math.round((totals.goals / totals.shots) * 1000) / 10 : null,
    hits: totals.hits || null,
    blockedShots: totals.blockedShots || null,
    toi: null,
    // Goalie stats
    wins: null, // Calculate from game results if needed
    losses: null,
    otLosses: null,
    saves: totals.saves || null,
    goalsAgainst: totals.goalsAgainst || null,
    savePct: totals.shotsAgainst > 0 ? Math.round((totals.saves / totals.shotsAgainst) * 1000) / 1000 : null,
    gaa: totals.gamesPlayed > 0 && totals.goalsAgainst ? Math.round((totals.goalsAgainst / totals.gamesPlayed) * 100) / 100 : null,
    shutouts: null,
  }]
}

async function getPlayerGameLog(espnId: string): Promise<PlayerGameLogEntry[]> {
  if (!datalabAdmin) return []

  const { data, error } = await datalabAdmin
    .from('blackhawks_player_game_stats')
    .select(`
      player_id,
      game_id,
      goals,
      assists,
      points,
      plus_minus,
      pim,
      shots,
      toi,
      saves,
      goals_against,
      blackhawks_games_master!inner(
        game_date,
        opponent,
        opponent_full_name,
        is_blackhawks_home,
        blackhawks_score,
        opponent_score,
        blackhawks_win,
        overtime,
        shootout,
        season
      )
    `)
    .eq('player_id', espnId)
    .eq('season', getCurrentSeason())
    .order('game_date', { ascending: false })
    .limit(20)

  if (error || !data) return []

  return data.map((s: any) => {
    const game = s.blackhawks_games_master || {}
    const isPlayed = (game.blackhawks_score > 0) || (game.opponent_score > 0)

    let result: 'W' | 'L' | 'OTL' | null = null
    if (isPlayed) {
      if (game.blackhawks_win) {
        result = 'W'
      } else if (game.overtime || game.shootout) {
        result = 'OTL'
      } else {
        result = 'L'
      }
    }

    return {
      gameId: s.game_id,
      date: game.game_date || '',
      season: game.season || getCurrentSeason(),
      opponent: game.opponent || '',
      isHome: game.is_blackhawks_home ?? true,
      result,
      blackhawksScore: game.blackhawks_score,
      oppScore: game.opponent_score,
      goals: s.goals,
      assists: s.assists,
      points: s.points,
      plusMinus: s.plus_minus,
      pim: s.pim,
      shots: s.shots,
      toi: s.toi,
      saves: s.saves,
      goalsAgainst: s.goals_against,
    }
  })
}

/**
 * Get Blackhawks schedule for a season
 * Falls back to previous season if current season has no games
 * Only includes regular season and postseason games
 */
export async function getBlackhawksSchedule(season?: number): Promise<BlackhawksGame[]> {
  // For NHL, season is the ENDING year (e.g., 2026 for 2025-26 season)
  const targetSeason = season || getCurrentSeason()

  if (!datalabAdmin) {
    console.error('DataLab not configured for Blackhawks schedule')
    return []
  }

  // Try using the canonical view first (blackhawks_schedule_all)
  let data: any[] | null = null
  let error: any = null

  // First attempt: try blackhawks_schedule_all view with season
  const viewResult = await datalabAdmin
    .from('blackhawks_schedule_all')
    .select('*')
    .eq('season', targetSeason)
    .order('game_date', { ascending: true })

  if (!viewResult.error && viewResult.data && viewResult.data.length > 0) {
    data = viewResult.data
  } else {
    // Fallback: try blackhawks_games_master with season
    const masterResult = await datalabAdmin
      .from('blackhawks_games_master')
      .select('*')
      .eq('season', targetSeason)
      .order('game_date', { ascending: true })

    if (!masterResult.error && masterResult.data && masterResult.data.length > 0) {
      data = masterResult.data
    } else {
      // Final fallback: try with 'season' column
      const seasonResult = await datalabAdmin
        .from('blackhawks_games_master')
        .select('*')
        .eq('season', targetSeason)
        .order('game_date', { ascending: true })

      if (!seasonResult.error && seasonResult.data && seasonResult.data.length > 0) {
        data = seasonResult.data
      } else {
        error = seasonResult.error || masterResult.error || viewResult.error
      }
    }
  }

  if (error) {
    console.error('Blackhawks schedule error:', error)
    return []
  }

  if (!data || data.length === 0) {
    return []
  }

  // Filter to current season dates only (Oct to June)
  // Season is stored as ENDING year (e.g., 2026 for 2025-26 season)
  // So dates should be Oct of (targetSeason-1) to June of targetSeason
  const seasonStartDate = `${targetSeason - 1}-10-01`
  const seasonEndDate = `${targetSeason}-06-30`

  const dateFiltered = data.filter((g: any) => {
    const gameDate = g.game_date
    return gameDate >= seasonStartDate && gameDate <= seasonEndDate
  })

  // Filter to regular season and postseason only (exclude preseason)
  const filtered = dateFiltered.filter((g: any) => {
    const gameType = g.game_type?.toUpperCase() || ''
    return gameType !== 'PRE' && gameType !== 'PRESEASON'
  })

  return filtered.map((g: any) => transformGame(g))
}

function formatGameTime(timeStr: string | null): string | null {
  if (!timeStr) return null
  const [hours, minutes] = timeStr.split(':').map(Number)
  const hour12 = hours % 12 || 12
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const minStr = minutes.toString().padStart(2, '0')
  return `${hour12}:${minStr} ${ampm} CT`
}

function transformGame(game: any): BlackhawksGame {
  const gameDate = new Date(game.game_date)
  // Check if game has been played - handle null/undefined scores properly
  const hawksScore = game.blackhawks_score ?? game.home_score ?? game.away_score
  const oppScore = game.opponent_score ?? game.away_score ?? game.home_score
  const isPlayed = hawksScore !== null && hawksScore !== undefined

  let result: 'W' | 'L' | 'OTL' | null = null
  // Determine OT/SO from is_overtime/is_shootout boolean columns
  const isOT = game.is_overtime === true
  const isSO = game.is_shootout === true

  if (isPlayed) {
    // Determine win/loss based on available columns
    const didWin = game.blackhawks_win ?? (hawksScore > oppScore)

    if (didWin) {
      result = 'W'
    } else if (isOT || isSO) {
      result = 'OTL'
    } else {
      result = 'L'
    }
  }

  return {
    gameId: game.id?.toString() || game.game_id,
    season: getCurrentSeason(),
    date: game.game_date,
    time: formatGameTime(game.game_time),
    dayOfWeek: gameDate.toLocaleDateString('en-US', { weekday: 'long' }),
    opponent: game.opponent,
    opponentFullName: game.opponent_full_name || null,
    opponentLogo: getTeamLogo(game.opponent),
    homeAway: game.is_blackhawks_home ? 'home' : 'away',
    status: isPlayed ? 'final' : (game.status === 'in_progress' ? 'in_progress' : 'scheduled'),
    blackhawksScore: game.blackhawks_score,
    oppScore: game.opponent_score,
    result,
    arena: game.arena,
    tv: game.broadcast,
    overtime: isOT,
    shootout: isSO,
  }
}

/**
 * Get recent Blackhawks scores (completed games)
 */
export async function getBlackhawksRecentScores(limit: number = 10): Promise<BlackhawksGame[]> {
  const schedule = await getBlackhawksSchedule()
  return schedule
    .filter(g => g.status === 'final')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

/**
 * Get Blackhawks stats for a season
 */
export async function getBlackhawksStats(season?: number): Promise<BlackhawksStats> {
  const targetSeason = season || getCurrentSeason()

  const teamStats = await getTeamStats(targetSeason)
  const leaderboards = await getLeaderboards(targetSeason)

  return {
    team: teamStats,
    leaderboards,
  }
}

async function getTeamStats(season: number): Promise<BlackhawksTeamStats> {
  if (!datalabAdmin) {
    return getDefaultTeamStats(season)
  }

  // Get team season stats
  const { data: teamData } = await datalabAdmin
    .from('blackhawks_team_season_stats')
    .select('*')
    .eq('season', season)
    .single()

  // CRITICAL: Get authoritative record from blackhawks_seasons table (recommended by Datalab)
  // This avoids issues with calculating record from games_master
  const { data: seasonRecord } = await datalabAdmin
    .from('blackhawks_seasons')
    .select('wins, losses, otl')
    .eq('season', season)
    .single()

  // Get completed games for goals calculation
  const { data: gamesData } = await datalabAdmin
    .from('blackhawks_games_master')
    .select('blackhawks_score, opponent_score')
    .eq('season', season)
    .or('blackhawks_score.gt.0,opponent_score.gt.0')

  const wins = seasonRecord?.wins || 0
  const losses = seasonRecord?.losses || 0
  const otLosses = seasonRecord?.otl || 0
  const gamesPlayed = (gamesData?.length || 0) || (wins + losses + otLosses)
  const totalGoals = gamesData?.reduce((sum: number, g: any) => sum + (g.blackhawks_score || 0), 0) || 0
  const totalOppGoals = gamesData?.reduce((sum: number, g: any) => sum + (g.opponent_score || 0), 0) || 0
  const pts = wins * 2 + otLosses

  return {
    season,
    record: `${wins}-${losses}-${otLosses}`,
    wins,
    losses,
    otLosses,
    points: pts,
    goalsFor: totalGoals,
    goalsAgainst: totalOppGoals,
    gfpg: gamesPlayed > 0 ? Math.round(totalGoals / gamesPlayed * 100) / 100 : 0,
    gapg: gamesPlayed > 0 ? Math.round(totalOppGoals / gamesPlayed * 100) / 100 : 0,
    ppPct: teamData?.pp_pct || null,
    pkPct: teamData?.pk_pct || null,
  }
}

function getDefaultTeamStats(season: number): BlackhawksTeamStats {
  return {
    season,
    record: '0-0-0',
    wins: 0,
    losses: 0,
    otLosses: 0,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    gfpg: 0,
    gapg: 0,
    ppPct: null,
    pkPct: null,
  }
}

async function getLeaderboards(season: number): Promise<BlackhawksLeaderboard> {
  if (!datalabAdmin) {
    return { goals: [], assists: [], points: [], goaltending: [] }
  }

  const players = await getBlackhawksPlayers()
  // Use playerId (ESPN ID) as key since stats tables use ESPN IDs
  const playersMap = new Map(players.map(p => [p.playerId, p]))

  // Get all game stats for season and aggregate by player
  let { data: gameStats } = await datalabAdmin
    .from('blackhawks_player_game_stats')
    .select(`
      player_id,
      goals,
      assists,
      points,
      saves,
      goals_against,
      shots_against
    `)
    .eq('season', season)

  // Fallback to previous season if no stats
  if (!gameStats || gameStats.length === 0) {
    const { data: prevStats } = await datalabAdmin
      .from('blackhawks_player_game_stats')
      .select(`
        player_id,
        goals,
        assists,
        points,
        saves,
        goals_against,
        shots_against
      `)
      .eq('season', season - 1)
    gameStats = prevStats
  }

  if (!gameStats || gameStats.length === 0) {
    return { goals: [], assists: [], points: [], goaltending: [] }
  }

  // Aggregate stats by player (keyed by ESPN ID which is a string)
  const playerTotals = new Map<string, any>()

  for (const stat of gameStats) {
    const pid = stat.player_id
    if (!playerTotals.has(pid)) {
      playerTotals.set(pid, {
        player_id: pid,
        goals: 0,
        assists: 0,
        points: 0,
        saves: 0,
        goalsAgainst: 0,
        shotsAgainst: 0,
        games: 0,
      })
    }
    const totals = playerTotals.get(pid)!
    totals.goals += stat.goals || 0
    totals.assists += stat.assists || 0
    totals.points += stat.points || 0
    totals.saves += stat.saves || 0
    totals.goalsAgainst += stat.goals_against || 0
    totals.shotsAgainst += stat.shots_against || 0
    totals.games += 1
  }

  const aggregatedStats = Array.from(playerTotals.values())

  const goals = aggregatedStats
    .filter(s => s.goals > 0 && playersMap.has(s.player_id))
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5)
    .map(s => ({
      player: playersMap.get(s.player_id)!,
      primaryStat: s.goals,
      primaryLabel: 'G',
      secondaryStat: s.assists,
      secondaryLabel: 'A',
      tertiaryStat: s.games,
      tertiaryLabel: 'GP',
    }))

  const assists = aggregatedStats
    .filter(s => s.assists > 0 && playersMap.has(s.player_id))
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 5)
    .map(s => ({
      player: playersMap.get(s.player_id)!,
      primaryStat: s.assists,
      primaryLabel: 'A',
      secondaryStat: s.goals,
      secondaryLabel: 'G',
      tertiaryStat: s.games,
      tertiaryLabel: 'GP',
    }))

  const points = aggregatedStats
    .filter(s => s.points > 0 && playersMap.has(s.player_id))
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map(s => ({
      player: playersMap.get(s.player_id)!,
      primaryStat: s.points,
      primaryLabel: 'PTS',
      secondaryStat: s.goals,
      secondaryLabel: 'G',
      tertiaryStat: s.assists,
      tertiaryLabel: 'A',
    }))

  const goaltending = aggregatedStats
    .filter(s => s.saves > 0 && playersMap.has(s.player_id))
    .sort((a, b) => {
      const aSvPct = a.shotsAgainst > 0 ? a.saves / a.shotsAgainst : 0
      const bSvPct = b.shotsAgainst > 0 ? b.saves / b.shotsAgainst : 0
      return bSvPct - aSvPct
    })
    .slice(0, 3)
    .map(s => {
      const svPct = s.shotsAgainst > 0 ? Math.round((s.saves / s.shotsAgainst) * 1000) / 1000 : 0
      const gaa = s.games > 0 ? Math.round((s.goalsAgainst / s.games) * 100) / 100 : 0
      return {
        player: playersMap.get(s.player_id)!,
        primaryStat: svPct,
        primaryLabel: 'SV%',
        secondaryStat: gaa,
        secondaryLabel: 'GAA',
        tertiaryStat: s.games,
        tertiaryLabel: 'GP',
      }
    })

  return { goals, assists, points, goaltending }
}

/**
 * Get Blackhawks record (includes OT losses for NHL)
 */
export interface BlackhawksRecord {
  wins: number
  losses: number
  otLosses: number
  streak: string | null
}

export async function getBlackhawksRecord(season?: number): Promise<BlackhawksRecord> {
  const targetSeason = season || getCurrentSeason()

  // CRITICAL: Get authoritative record from blackhawks_seasons table (recommended by Datalab)
  if (datalabAdmin) {
    const { data: seasonRecord } = await datalabAdmin
      .from('blackhawks_seasons')
      .select('wins, losses, otl')
      .eq('season', targetSeason)
      .single()

    if (seasonRecord) {
      // Get streak from schedule
      const schedule = await getBlackhawksSchedule(targetSeason)
      const completedGames = schedule.filter(g => g.status === 'final')

      let streak: string | null = null
      if (completedGames.length > 0) {
        const sortedGames = [...completedGames].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        let streakCount = 1
        const streakType = sortedGames[0].result
        for (let i = 1; i < sortedGames.length && i < 10; i++) {
          if (sortedGames[i].result === streakType) {
            streakCount++
          } else {
            break
          }
        }
        streak = `${streakType}${streakCount}`
      }

      return {
        wins: seasonRecord.wins || 0,
        losses: seasonRecord.losses || 0,
        otLosses: seasonRecord.otl || 0,
        streak,
      }
    }
  }

  // Fallback: Calculate from schedule if seasons table unavailable
  const schedule = await getBlackhawksSchedule(targetSeason)
  const completedGames = schedule.filter(g => g.status === 'final')
  const wins = completedGames.filter(g => g.result === 'W').length
  const losses = completedGames.filter(g => g.result === 'L').length
  const otLosses = completedGames.filter(g => g.result === 'OTL').length

  // Calculate streak
  let streak: string | null = null
  if (completedGames.length > 0) {
    const sortedGames = [...completedGames].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    let streakCount = 1
    const streakType = sortedGames[0].result
    for (let i = 1; i < sortedGames.length && i < 10; i++) {
      if (sortedGames[i].result === streakType) {
        streakCount++
      } else {
        break
      }
    }
    streak = `${streakType}${streakCount}`
  }

  return { wins, losses, otLosses, streak }
}

/**
 * Get available seasons
 */
export async function getAvailableSeasons(): Promise<number[]> {
  if (!datalabAdmin) {
    const current = getCurrentSeason()
    return [current, current - 1, current - 2]
  }

  try {
    const { data } = await datalabAdmin
      .from('blackhawks_games_master')
      .select('season')
      .order('season', { ascending: false })

    if (data && data.length > 0) {
      return [...new Set(data.map((d: any) => d.season))]
    }
  } catch {
    // Fallback
  }

  const current = getCurrentSeason()
  return [current, current - 1, current - 2]
}

function getCurrentSeason(): number {
  // NHL season runs Oct-June, stored as ENDING year in Datalab
  // e.g., 2024-25 season = 2025, 2025-26 season = 2026
  // There is NO season column - use 'season' only
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  // If before October (Jan-Sep): We're in a season ending this year
  // If October or later (Oct-Dec): New season started, ends next year
  if (month < 10) {
    return year  // Season ends this year
  }
  return year + 1  // Season ends next year
}

/**
 * Search players by name or number
 */
export async function searchPlayers(query: string): Promise<BlackhawksPlayer[]> {
  const players = await getBlackhawksPlayers()
  const q = query.toLowerCase().trim()

  if (!q) return players

  return players.filter(p => {
    const matchesName = p.fullName.toLowerCase().includes(q)
    const matchesNumber = p.jerseyNumber?.toString() === q
    return matchesName || matchesNumber
  })
}
