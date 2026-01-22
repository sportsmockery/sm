/**
 * Cubs Data Layer
 *
 * This module provides helper functions for Cubs data access.
 * Data is pulled from DataLab Supabase ({cubs}_* tables).
 *
 * All page-level components should use these helpers, never query databases directly.
 */

import { datalabClient } from './supabase-datalab'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type PositionGroup = 'pitchers' | 'catchers' | 'infielders' | 'outfielders'

export interface CubsPlayer {
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
  bats: string | null
  throws: string | null
  headshotUrl: string | null
  status: string | null
}

export interface PlayerSeasonStats {
  season: number
  gamesPlayed: number
  // Batting
  atBats: number | null
  runs: number | null
  hits: number | null
  doubles: number | null
  triples: number | null
  homeRuns: number | null
  rbi: number | null
  walks: number | null
  strikeouts: number | null
  stolenBases: number | null
  avg: number | null
  obp: number | null
  slg: number | null
  ops: number | null
  // Pitching
  wins: number | null
  losses: number | null
  era: number | null
  gamesStarted: number | null
  saves: number | null
  inningsPitched: number | null
  strikeoutsPitched: number | null
  walksAllowed: number | null
  whip: number | null
}

export interface PlayerGameLogEntry {
  gameId: string
  date: string
  season: number
  opponent: string
  isHome: boolean
  result: 'W' | 'L' | null
  cubsScore: number | null
  oppScore: number | null
  // Batting
  atBats: number | null
  runs: number | null
  hits: number | null
  homeRuns: number | null
  rbi: number | null
  walks: number | null
  strikeouts: number | null
  // Pitching
  inningsPitched: number | null
  hitsAllowed: number | null
  earnedRuns: number | null
  strikeoutsPitched: number | null
  walksAllowed: number | null
  pitchingDecision: 'W' | 'L' | 'S' | null
}

export interface PlayerProfile {
  player: CubsPlayer
  seasons: PlayerSeasonStats[]
  currentSeason: PlayerSeasonStats | null
  gameLog: PlayerGameLogEntry[]
}

export interface CubsGame {
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
  cubsScore: number | null
  oppScore: number | null
  result: 'W' | 'L' | null
  stadium: string | null
  tv: string | null
  innings: number | null
}

export interface CubsTeamStats {
  season: number
  record: string
  wins: number
  losses: number
  pct: number
  runsScored: number
  runsAllowed: number
  runDiff: number
  teamAvg: number | null
  teamEra: number | null
  teamOps: number | null
}

export interface CubsLeaderboard {
  batting: LeaderboardEntry[]
  homeRuns: LeaderboardEntry[]
  pitching: LeaderboardEntry[]
  saves: LeaderboardEntry[]
}

export interface LeaderboardEntry {
  player: CubsPlayer
  primaryStat: number
  primaryLabel: string
  secondaryStat: number | null
  secondaryLabel: string | null
  tertiaryStat: number | null
  tertiaryLabel: string | null
}

export interface CubsStats {
  team: CubsTeamStats
  leaderboards: CubsLeaderboard
}

// MLB team abbreviation to logo mapping
const MLB_TEAM_ABBREVS: Record<string, string> = {
  ARI: 'ari', ATL: 'atl', BAL: 'bal', BOS: 'bos', CHC: 'chc',
  CHW: 'chw', CIN: 'cin', CLE: 'cle', COL: 'col', DET: 'det',
  HOU: 'hou', KC: 'kc', LAA: 'laa', LAD: 'lad', MIA: 'mia',
  MIL: 'mil', MIN: 'min', NYM: 'nym', NYY: 'nyy', OAK: 'oak',
  PHI: 'phi', PIT: 'pit', SD: 'sd', SF: 'sf', SEA: 'sea',
  STL: 'stl', TB: 'tb', TEX: 'tex', TOR: 'tor', WSH: 'wsh',
}

function getTeamLogo(abbrev: string): string {
  const code = MLB_TEAM_ABBREVS[abbrev] || abbrev.toLowerCase()
  return `https://a.espncdn.com/i/teamlogos/mlb/500/${code}.png`
}

// Position group mapping for MLB
function getPositionGroup(position: string): PositionGroup {
  const pos = position.toUpperCase()
  if (pos === 'P' || pos === 'SP' || pos === 'RP' || pos === 'CL') return 'pitchers'
  if (pos === 'C') return 'catchers'
  if (['1B', '2B', '3B', 'SS', 'IF'].includes(pos)) return 'infielders'
  return 'outfielders' // LF, CF, RF, OF, DH
}

const POSITION_GROUP_NAMES: Record<PositionGroup, string> = {
  pitchers: 'Pitchers',
  catchers: 'Catchers',
  infielders: 'Infielders',
  outfielders: 'Outfielders',
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
 * Get all Cubs players from DataLab
 * Filters by is_active = true
 */
export async function getCubsPlayers(): Promise<CubsPlayer[]> {
  if (!datalabClient) {
    console.error('DataLab not configured')
    return []
  }

  const { data, error } = await datalabClient
    .from('cubs_players')
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

function transformPlayers(data: any[]): CubsPlayer[] {
  return data.map((p: any) => {
    const position = p.position || 'OF'
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
      bats: p.bats,
      throws: p.throws,
      headshotUrl: p.headshot_url,
      status: p.status,
    }
  }).sort((a, b) => parseInt(a.jerseyNumber?.toString() || '99') - parseInt(b.jerseyNumber?.toString() || '99'))
}

/**
 * Get Cubs roster grouped by position
 */
export async function getCubsRosterGrouped(): Promise<Record<PositionGroup, CubsPlayer[]>> {
  const players = await getCubsPlayers()

  const grouped: Record<PositionGroup, CubsPlayer[]> = {
    pitchers: [],
    catchers: [],
    infielders: [],
    outfielders: [],
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
  const players = await getCubsPlayers()
  const player = players.find(p => p.slug === slug)

  if (!player) return null

  const seasons = await getPlayerSeasonStats(player.internalId, player.positionGroup === 'pitchers')
  const gameLog = await getPlayerGameLog(player.internalId)

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

async function getPlayerSeasonStats(internalId: number, isPitcher: boolean): Promise<PlayerSeasonStats[]> {
  if (!datalabClient) return []

  const { data, error } = await datalabClient
    .from('cubs_player_game_stats')
    .select(`
      season,
      at_bats,
      runs,
      hits,
      doubles,
      triples,
      home_runs,
      rbi,
      walks,
      strikeouts,
      stolen_bases,
      innings_pitched,
      hits_allowed,
      runs_allowed,
      earned_runs,
      walks_allowed,
      strikeouts_pitched,
      win,
      loss,
      save
    `)
    .eq('player_id', internalId)
    .eq('season', getCurrentSeason())

  if (error || !data || data.length === 0) return []

  // Aggregate all game stats into season totals
  const totals = data.reduce((acc: any, game: any) => {
    acc.gamesPlayed = (acc.gamesPlayed || 0) + 1
    // Batting
    acc.atBats = (acc.atBats || 0) + (game.at_bats || 0)
    acc.runs = (acc.runs || 0) + (game.runs || 0)
    acc.hits = (acc.hits || 0) + (game.hits || 0)
    acc.doubles = (acc.doubles || 0) + (game.doubles || 0)
    acc.triples = (acc.triples || 0) + (game.triples || 0)
    acc.homeRuns = (acc.homeRuns || 0) + (game.home_runs || 0)
    acc.rbi = (acc.rbi || 0) + (game.rbi || 0)
    acc.walks = (acc.walks || 0) + (game.walks || 0)
    acc.strikeouts = (acc.strikeouts || 0) + (game.strikeouts || 0)
    acc.stolenBases = (acc.stolenBases || 0) + (game.stolen_bases || 0)
    // Pitching
    acc.inningsPitched = (acc.inningsPitched || 0) + (game.innings_pitched || 0)
    acc.hitsAllowed = (acc.hitsAllowed || 0) + (game.hits_allowed || 0)
    acc.earnedRuns = (acc.earnedRuns || 0) + (game.earned_runs || 0)
    acc.walksAllowed = (acc.walksAllowed || 0) + (game.walks_allowed || 0)
    acc.strikeoutsPitched = (acc.strikeoutsPitched || 0) + (game.strikeouts_pitched || 0)
    acc.wins = (acc.wins || 0) + (game.win ? 1 : 0)
    acc.losses = (acc.losses || 0) + (game.loss ? 1 : 0)
    acc.saves = (acc.saves || 0) + (game.save ? 1 : 0)
    acc.gamesStarted = (acc.gamesStarted || 0) + (game.innings_pitched >= 5 ? 1 : 0)
    return acc
  }, {})

  const avg = totals.atBats > 0 ? Math.round((totals.hits / totals.atBats) * 1000) / 1000 : null
  const obp = (totals.atBats + totals.walks) > 0
    ? Math.round(((totals.hits + totals.walks) / (totals.atBats + totals.walks)) * 1000) / 1000
    : null
  const slg = totals.atBats > 0
    ? Math.round(((totals.hits + totals.doubles + 2 * totals.triples + 3 * totals.homeRuns) / totals.atBats) * 1000) / 1000
    : null
  const era = totals.inningsPitched > 0
    ? Math.round((totals.earnedRuns / totals.inningsPitched) * 9 * 100) / 100
    : null
  const whip = totals.inningsPitched > 0
    ? Math.round(((totals.walksAllowed + totals.hitsAllowed) / totals.inningsPitched) * 100) / 100
    : null

  return [{
    season: getCurrentSeason(),
    gamesPlayed: totals.gamesPlayed || 0,
    atBats: totals.atBats || null,
    runs: totals.runs || null,
    hits: totals.hits || null,
    doubles: totals.doubles || null,
    triples: totals.triples || null,
    homeRuns: totals.homeRuns || null,
    rbi: totals.rbi || null,
    walks: totals.walks || null,
    strikeouts: totals.strikeouts || null,
    stolenBases: totals.stolenBases || null,
    avg,
    obp,
    slg,
    ops: obp && slg ? Math.round((obp + slg) * 1000) / 1000 : null,
    wins: totals.wins || null,
    losses: totals.losses || null,
    era,
    gamesStarted: totals.gamesStarted || null,
    saves: totals.saves || null,
    inningsPitched: totals.inningsPitched || null,
    strikeoutsPitched: totals.strikeoutsPitched || null,
    walksAllowed: totals.walksAllowed || null,
    whip,
  }]
}

async function getPlayerGameLog(internalId: number): Promise<PlayerGameLogEntry[]> {
  if (!datalabClient) return []

  const { data, error } = await datalabClient
    .from('cubs_player_game_stats')
    .select(`
      player_id,
      game_id,
      at_bats,
      runs,
      hits,
      home_runs,
      rbi,
      walks,
      strikeouts,
      innings_pitched,
      hits_allowed,
      earned_runs,
      strikeouts_pitched,
      walks_allowed,
      win,
      loss,
      save,
      cubs_games_master!inner(
        game_date,
        opponent,
        opponent_full_name,
        is_cubs_home,
        cubs_score,
        opponent_score,
        cubs_win,
        season
      )
    `)
    .eq('player_id', internalId)
    .eq('season', getCurrentSeason())
    .order('game_date', { ascending: false })
    .limit(20)

  if (error || !data) return []

  return data.map((s: any) => {
    const game = s.cubs_games_master || {}
    const isPlayed = (game.cubs_score > 0) || (game.opponent_score > 0)

    let pitchingDecision: 'W' | 'L' | 'S' | null = null
    if (s.win) pitchingDecision = 'W'
    else if (s.loss) pitchingDecision = 'L'
    else if (s.save) pitchingDecision = 'S'

    return {
      gameId: s.game_id,
      date: game.game_date || '',
      season: game.season || getCurrentSeason(),
      opponent: game.opponent || '',
      isHome: game.is_cubs_home ?? true,
      result: isPlayed ? (game.cubs_win ? 'W' : 'L') : null,
      cubsScore: game.cubs_score,
      oppScore: game.opponent_score,
      atBats: s.at_bats,
      runs: s.runs,
      hits: s.hits,
      homeRuns: s.home_runs,
      rbi: s.rbi,
      walks: s.walks,
      strikeouts: s.strikeouts,
      inningsPitched: s.innings_pitched,
      hitsAllowed: s.hits_allowed,
      earnedRuns: s.earned_runs,
      strikeoutsPitched: s.strikeouts_pitched,
      walksAllowed: s.walks_allowed,
      pitchingDecision,
    }
  })
}

/**
 * Get Cubs schedule for a season
 */
export async function getCubsSchedule(season?: number): Promise<CubsGame[]> {
  const targetSeason = season || getCurrentSeason()

  if (!datalabClient) return []

  const { data, error } = await datalabClient
    .from('cubs_games_master')
    .select(`
      id,
      game_date,
      game_time,
      opponent,
      opponent_full_name,
      is_cubs_home,
      stadium,
      cubs_score,
      opponent_score,
      cubs_win,
      broadcast,
      game_type,
      innings
    `)
    .eq('season', targetSeason)
    .order('game_date', { ascending: false })

  if (error || !data) return []

  return data.map((g: any) => transformGame(g))
}

function formatGameTime(timeStr: string | null): string | null {
  if (!timeStr) return null
  const [hours, minutes] = timeStr.split(':').map(Number)
  const hour12 = hours % 12 || 12
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const minStr = minutes.toString().padStart(2, '0')
  return `${hour12}:${minStr} ${ampm} CT`
}

function transformGame(game: any): CubsGame {
  const gameDate = new Date(game.game_date)
  const isPlayed = (game.cubs_score > 0) || (game.opponent_score > 0)

  return {
    gameId: game.id?.toString() || game.game_id,
    season: getCurrentSeason(),
    date: game.game_date,
    time: formatGameTime(game.game_time),
    dayOfWeek: gameDate.toLocaleDateString('en-US', { weekday: 'long' }),
    opponent: game.opponent,
    opponentFullName: game.opponent_full_name || null,
    opponentLogo: getTeamLogo(game.opponent),
    homeAway: game.is_cubs_home ? 'home' : 'away',
    status: isPlayed ? 'final' : (game.status === 'in_progress' ? 'in_progress' : 'scheduled'),
    cubsScore: game.cubs_score,
    oppScore: game.opponent_score,
    result: isPlayed ? (game.cubs_win ? 'W' : 'L') : null,
    stadium: game.stadium,
    tv: game.broadcast,
    innings: game.innings,
  }
}

/**
 * Get recent Cubs scores (completed games)
 */
export async function getCubsRecentScores(limit: number = 10): Promise<CubsGame[]> {
  const schedule = await getCubsSchedule()
  return schedule
    .filter(g => g.status === 'final')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

/**
 * Get Cubs stats for a season
 */
export async function getCubsStats(season?: number): Promise<CubsStats> {
  const targetSeason = season || getCurrentSeason()

  const teamStats = await getTeamStats(targetSeason)
  const leaderboards = await getLeaderboards(targetSeason)

  return {
    team: teamStats,
    leaderboards,
  }
}

async function getTeamStats(season: number): Promise<CubsTeamStats> {
  if (!datalabClient) {
    return getDefaultTeamStats(season)
  }

  // Get team season stats
  const { data: teamData } = await datalabClient
    .from('cubs_team_season_stats')
    .select('*')
    .eq('season', season)
    .single()

  // Get season record from games
  const { data: gamesData } = await datalabClient
    .from('cubs_games_master')
    .select('cubs_score, opponent_score, cubs_win')
    .eq('season', season)
    .or('cubs_score.gt.0,opponent_score.gt.0')

  const wins = gamesData?.filter((g: any) => g.cubs_win).length || 0
  const losses = gamesData?.filter((g: any) => g.cubs_win === false).length || 0
  const gamesPlayed = gamesData?.length || 0
  const runsScored = gamesData?.reduce((sum: number, g: any) => sum + (g.cubs_score || 0), 0) || 0
  const runsAllowed = gamesData?.reduce((sum: number, g: any) => sum + (g.opponent_score || 0), 0) || 0

  return {
    season,
    record: `${wins}-${losses}`,
    wins,
    losses,
    pct: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 1000) / 1000 : 0,
    runsScored,
    runsAllowed,
    runDiff: runsScored - runsAllowed,
    teamAvg: teamData?.team_avg || null,
    teamEra: teamData?.team_era || null,
    teamOps: teamData?.team_ops || null,
  }
}

function getDefaultTeamStats(season: number): CubsTeamStats {
  return {
    season,
    record: '0-0',
    wins: 0,
    losses: 0,
    pct: 0,
    runsScored: 0,
    runsAllowed: 0,
    runDiff: 0,
    teamAvg: null,
    teamEra: null,
    teamOps: null,
  }
}

async function getLeaderboards(season: number): Promise<CubsLeaderboard> {
  if (!datalabClient) {
    return { batting: [], homeRuns: [], pitching: [], saves: [] }
  }

  const players = await getCubsPlayers()
  const playersMap = new Map(players.map(p => [p.internalId, p]))

  // Get all game stats for season and aggregate by player
  const { data: gameStats } = await datalabClient
    .from('cubs_player_game_stats')
    .select(`
      player_id,
      at_bats,
      hits,
      home_runs,
      rbi,
      innings_pitched,
      earned_runs,
      strikeouts_pitched,
      win,
      loss,
      save
    `)
    .eq('season', season)

  if (!gameStats || gameStats.length === 0) {
    return { batting: [], homeRuns: [], pitching: [], saves: [] }
  }

  // Aggregate stats by player
  const playerTotals = new Map<number, any>()

  for (const stat of gameStats) {
    const pid = stat.player_id
    if (!playerTotals.has(pid)) {
      playerTotals.set(pid, {
        player_id: pid,
        atBats: 0,
        hits: 0,
        homeRuns: 0,
        rbi: 0,
        inningsPitched: 0,
        earnedRuns: 0,
        strikeouts: 0,
        wins: 0,
        losses: 0,
        saves: 0,
        games: 0,
      })
    }
    const totals = playerTotals.get(pid)!
    totals.atBats += stat.at_bats || 0
    totals.hits += stat.hits || 0
    totals.homeRuns += stat.home_runs || 0
    totals.rbi += stat.rbi || 0
    totals.inningsPitched += stat.innings_pitched || 0
    totals.earnedRuns += stat.earned_runs || 0
    totals.strikeouts += stat.strikeouts_pitched || 0
    totals.wins += stat.win ? 1 : 0
    totals.losses += stat.loss ? 1 : 0
    totals.saves += stat.save ? 1 : 0
    totals.games += 1
  }

  const aggregatedStats = Array.from(playerTotals.values())

  const batting = aggregatedStats
    .filter(s => s.atBats >= 50 && playersMap.has(s.player_id))
    .sort((a, b) => (b.hits / b.atBats) - (a.hits / a.atBats))
    .slice(0, 5)
    .map(s => ({
      player: playersMap.get(s.player_id)!,
      primaryStat: Math.round((s.hits / s.atBats) * 1000) / 1000,
      primaryLabel: 'AVG',
      secondaryStat: s.hits,
      secondaryLabel: 'H',
      tertiaryStat: s.atBats,
      tertiaryLabel: 'AB',
    }))

  const homeRuns = aggregatedStats
    .filter(s => s.homeRuns > 0 && playersMap.has(s.player_id))
    .sort((a, b) => b.homeRuns - a.homeRuns)
    .slice(0, 5)
    .map(s => ({
      player: playersMap.get(s.player_id)!,
      primaryStat: s.homeRuns,
      primaryLabel: 'HR',
      secondaryStat: s.rbi,
      secondaryLabel: 'RBI',
      tertiaryStat: s.games,
      tertiaryLabel: 'G',
    }))

  const pitching = aggregatedStats
    .filter(s => s.inningsPitched >= 20 && playersMap.has(s.player_id))
    .sort((a, b) => {
      const aEra = a.inningsPitched > 0 ? (a.earnedRuns / a.inningsPitched) * 9 : 99
      const bEra = b.inningsPitched > 0 ? (b.earnedRuns / b.inningsPitched) * 9 : 99
      return aEra - bEra
    })
    .slice(0, 5)
    .map(s => {
      const era = s.inningsPitched > 0 ? Math.round((s.earnedRuns / s.inningsPitched) * 9 * 100) / 100 : 0
      return {
        player: playersMap.get(s.player_id)!,
        primaryStat: era,
        primaryLabel: 'ERA',
        secondaryStat: s.wins,
        secondaryLabel: 'W',
        tertiaryStat: s.strikeouts,
        tertiaryLabel: 'K',
      }
    })

  const saves = aggregatedStats
    .filter(s => s.saves > 0 && playersMap.has(s.player_id))
    .sort((a, b) => b.saves - a.saves)
    .slice(0, 5)
    .map(s => ({
      player: playersMap.get(s.player_id)!,
      primaryStat: s.saves,
      primaryLabel: 'SV',
      secondaryStat: s.games,
      secondaryLabel: 'G',
      tertiaryStat: null,
      tertiaryLabel: null,
    }))

  return { batting, homeRuns, pitching, saves }
}

/**
 * Get available seasons
 */
export async function getAvailableSeasons(): Promise<number[]> {
  if (!datalabClient) {
    const current = getCurrentSeason()
    return [current, current - 1, current - 2]
  }

  try {
    const { data } = await datalabClient
      .from('cubs_games_master')
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
  // MLB 2025 season
  return 2025
}

/**
 * Search players by name or number
 */
export async function searchPlayers(query: string): Promise<CubsPlayer[]> {
  const players = await getCubsPlayers()
  const q = query.toLowerCase().trim()

  if (!q) return players

  return players.filter(p => {
    const matchesName = p.fullName.toLowerCase().includes(q)
    const matchesNumber = p.jerseyNumber?.toString() === q
    return matchesName || matchesNumber
  })
}
