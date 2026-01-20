/**
 * ESPN API Client for NFL/Bears Data
 *
 * Primary data source for Bears game schedules, scores, and live updates.
 * Uses ESPN's public "hidden" API endpoints.
 *
 * Endpoints:
 * - Scoreboard: schedules + live scores for all NFL games
 * - Summary: detailed game info, box scores, stats
 */

// ESPN API base URLs
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl'

// Bears team ID in ESPN system
const BEARS_TEAM_ID = '3' // Chicago Bears

// Game status mapping from ESPN to our internal format
const STATUS_MAP: Record<string, string> = {
  STATUS_SCHEDULED: 'scheduled',
  STATUS_IN_PROGRESS: 'live',
  STATUS_HALFTIME: 'halftime',
  STATUS_END_PERIOD: 'live',
  STATUS_FINAL: 'finished',
  STATUS_FINAL_OVERTIME: 'finished',
  STATUS_POSTPONED: 'postponed',
  STATUS_CANCELED: 'canceled',
  STATUS_DELAYED: 'delayed',
}

export interface ESPNGame {
  eventId: string
  date: string // ISO date string
  time: string // HH:MM:SS format (Central Time)
  season: number
  week: number
  gameType: 'preseason' | 'regular' | 'postseason'
  opponent: string // Team abbreviation (e.g., "GB")
  opponentFullName: string
  isHome: boolean
  bearsScore: number | null
  opponentScore: number | null
  bearsWin: boolean | null
  status: string
  stadium: string | null
  isPlayoff: boolean
  quarter: number | null
  clock: string | null
  possession: string | null // Team abbreviation with possession
  broadcast: string | null // TV network (FOX, CBS, NBC, ESPN, etc.)
}

export interface ESPNScoreboardResponse {
  games: ESPNGame[]
  season: number
  week: number
  error?: string
}

/**
 * Fetch NFL scoreboard from ESPN
 * Returns all games, filtered to Bears games
 */
export async function fetchESPNScoreboard(options?: {
  season?: number
  week?: number
  seasonType?: 'preseason' | 'regular' | 'postseason'
}): Promise<ESPNScoreboardResponse> {
  try {
    // Build URL with optional parameters
    let url = `${ESPN_BASE}/scoreboard`
    const params = new URLSearchParams()

    if (options?.season) {
      params.set('dates', String(options.season))
    }
    if (options?.week) {
      params.set('week', String(options.week))
    }
    if (options?.seasonType) {
      const typeMap = { preseason: '1', regular: '2', postseason: '3' }
      params.set('seasontype', typeMap[options.seasonType] || '2')
    }

    if (params.toString()) {
      url += '?' + params.toString()
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SportsMockery/1.0',
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    })

    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`)
    }

    const data = await response.json()

    // Extract Bears games from scoreboard
    const bearsGames: ESPNGame[] = []

    for (const event of data.events || []) {
      const competition = event.competitions?.[0]
      if (!competition) continue

      // Find Bears in this game
      const bearsTeam = competition.competitors?.find(
        (c: any) => c.team?.id === BEARS_TEAM_ID || c.team?.abbreviation === 'CHI'
      )

      if (!bearsTeam) continue

      // Get opponent
      const opponentTeam = competition.competitors?.find(
        (c: any) => c.team?.id !== BEARS_TEAM_ID && c.team?.abbreviation !== 'CHI'
      )

      if (!opponentTeam) continue

      // Parse game data
      const isHome = bearsTeam.homeAway === 'home'
      const bearsScore = bearsTeam.score ? parseInt(bearsTeam.score, 10) : null
      const opponentScore = opponentTeam.score ? parseInt(opponentTeam.score, 10) : null

      // Determine win/loss (only for completed games)
      let bearsWin: boolean | null = null
      const status = event.status?.type?.name || 'STATUS_SCHEDULED'
      if (status === 'STATUS_FINAL' || status === 'STATUS_FINAL_OVERTIME') {
        if (bearsScore !== null && opponentScore !== null) {
          bearsWin = bearsScore > opponentScore
        }
      }

      // Parse date and time - convert UTC to Central Time
      const gameDate = new Date(event.date)
      // Convert to Central Time for display
      const centralTime = new Date(gameDate.toLocaleString('en-US', { timeZone: 'America/Chicago' }))
      const dateStr = gameDate.toISOString().split('T')[0]
      // Format time as HH:MM:SS in Central Time
      const hours = centralTime.getHours().toString().padStart(2, '0')
      const minutes = centralTime.getMinutes().toString().padStart(2, '0')
      const timeStr = `${hours}:${minutes}:00`

      // Get season info
      const seasonInfo = event.season || data.season || {}
      const season = seasonInfo.year || new Date().getFullYear()
      const week = event.week?.number || data.week?.number || 1

      // Determine game type
      let gameType: 'preseason' | 'regular' | 'postseason' = 'regular'
      const seasonType = seasonInfo.type || data.season?.type
      if (seasonType === 1) gameType = 'preseason'
      else if (seasonType === 3) gameType = 'postseason'

      // Get live game info
      const situation = competition.situation

      // Extract TV broadcast network
      let broadcast: string | null = null
      if (competition.broadcasts && competition.broadcasts.length > 0) {
        // Get first broadcast (typically the main network)
        const mainBroadcast = competition.broadcasts[0]
        if (mainBroadcast.names && mainBroadcast.names.length > 0) {
          broadcast = mainBroadcast.names[0]
        } else if (mainBroadcast.market === 'national') {
          // Extract from media if available
          broadcast = mainBroadcast.type?.abbreviation || null
        }
      }
      // Also check geoBroadcasts array (alternative location for broadcast info)
      if (!broadcast && event.geoBroadcasts) {
        const nationalBroadcast = event.geoBroadcasts.find((b: any) => b.type?.type === 'TV')
        if (nationalBroadcast?.media?.shortName) {
          broadcast = nationalBroadcast.media.shortName
        }
      }

      bearsGames.push({
        eventId: event.id,
        date: dateStr,
        time: timeStr,
        season,
        week,
        gameType,
        opponent: opponentTeam.team?.abbreviation || 'UNK',
        opponentFullName: opponentTeam.team?.displayName || 'Unknown',
        isHome,
        bearsScore,
        opponentScore,
        bearsWin,
        status: STATUS_MAP[status] || 'scheduled',
        stadium: competition.venue?.fullName || null,
        isPlayoff: gameType === 'postseason',
        quarter: situation?.period || null,
        clock: situation?.clock ? formatClock(situation.clock) : null,
        possession: situation?.possession ?
          (situation.possession === BEARS_TEAM_ID ? 'CHI' : opponentTeam.team?.abbreviation) : null,
        broadcast,
      })
    }

    return {
      games: bearsGames,
      season: data.season?.year || new Date().getFullYear(),
      week: data.week?.number || 1,
    }
  } catch (error) {
    console.error('ESPN scoreboard fetch error:', error)
    return {
      games: [],
      season: new Date().getFullYear(),
      week: 1,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Fetch detailed game summary from ESPN
 * Use for box scores, player stats, play-by-play
 */
export async function fetchESPNGameSummary(eventId: string): Promise<{
  game: ESPNGame | null
  boxScore: any
  error?: string
}> {
  try {
    const url = `${ESPN_BASE}/summary?event=${eventId}`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SportsMockery/1.0',
      },
      next: { revalidate: 30 }, // Cache for 30 seconds during live games
    })

    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`)
    }

    const data = await response.json()

    // Extract game info
    const header = data.header
    const competition = header?.competitions?.[0]

    if (!competition) {
      return { game: null, boxScore: null, error: 'No competition data' }
    }

    // Find Bears team
    const bearsTeam = competition.competitors?.find(
      (c: any) => c.team?.id === BEARS_TEAM_ID || c.team?.abbreviation === 'CHI'
    )
    const opponentTeam = competition.competitors?.find(
      (c: any) => c.team?.id !== BEARS_TEAM_ID && c.team?.abbreviation !== 'CHI'
    )

    if (!bearsTeam || !opponentTeam) {
      return { game: null, boxScore: null, error: 'Bears not found in game' }
    }

    const isHome = bearsTeam.homeAway === 'home'
    const bearsScore = bearsTeam.score ? parseInt(bearsTeam.score, 10) : null
    const opponentScore = opponentTeam.score ? parseInt(opponentTeam.score, 10) : null

    // Determine win/loss
    let bearsWin: boolean | null = null
    const status = header?.gameInfo?.statusType?.name || 'STATUS_SCHEDULED'
    if (status === 'STATUS_FINAL' || status === 'STATUS_FINAL_OVERTIME') {
      if (bearsScore !== null && opponentScore !== null) {
        bearsWin = bearsScore > opponentScore
      }
    }

    // Parse date and convert to Central Time
    const gameDate = new Date(header?.gameDate || Date.now())
    const centralTime = new Date(gameDate.toLocaleString('en-US', { timeZone: 'America/Chicago' }))
    const hours = centralTime.getHours().toString().padStart(2, '0')
    const minutes = centralTime.getMinutes().toString().padStart(2, '0')
    const timeStr = `${hours}:${minutes}:00`

    // Get situation for live games
    const situation = data.situation

    const game: ESPNGame = {
      eventId,
      date: gameDate.toISOString().split('T')[0],
      time: timeStr,
      season: header?.season?.year || new Date().getFullYear(),
      week: header?.week?.number || 1,
      gameType: header?.season?.type === 3 ? 'postseason' :
                header?.season?.type === 1 ? 'preseason' : 'regular',
      opponent: opponentTeam.team?.abbreviation || 'UNK',
      opponentFullName: opponentTeam.team?.displayName || 'Unknown',
      isHome,
      bearsScore,
      opponentScore,
      bearsWin,
      status: STATUS_MAP[status] || 'scheduled',
      stadium: header?.venue?.fullName || null,
      isPlayoff: header?.season?.type === 3,
      quarter: situation?.period || null,
      clock: situation?.clock ? formatClock(situation.clock) : null,
      possession: situation?.possession ?
        (situation.possession === BEARS_TEAM_ID ? 'CHI' : opponentTeam.team?.abbreviation) : null,
      broadcast: null, // Game summary doesn't include broadcast info
    }

    return {
      game,
      boxScore: data.boxscore || null,
    }
  } catch (error) {
    console.error('ESPN game summary fetch error:', error)
    return {
      game: null,
      boxScore: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Fetch Bears schedule for a season
 */
export async function fetchESPNBearsSchedule(season?: number): Promise<ESPNScoreboardResponse> {
  const targetSeason = season || getCurrentNFLSeason()

  // Fetch all weeks for the season
  const allGames: ESPNGame[] = []

  // Regular season (weeks 1-18)
  for (let week = 1; week <= 18; week++) {
    const result = await fetchESPNScoreboard({
      season: targetSeason,
      week,
      seasonType: 'regular',
    })
    allGames.push(...result.games)

    // Small delay to avoid rate limiting
    await sleep(100)
  }

  // Postseason (weeks 1-5: Wild Card, Divisional, Conference, Pro Bowl, Super Bowl)
  for (let week = 1; week <= 5; week++) {
    const result = await fetchESPNScoreboard({
      season: targetSeason,
      week,
      seasonType: 'postseason',
    })
    allGames.push(...result.games)
    await sleep(100)
  }

  return {
    games: allGames,
    season: targetSeason,
    week: 0, // Multiple weeks
  }
}

/**
 * Check if there's a live Bears game right now
 */
export async function fetchLiveBearsGame(): Promise<ESPNGame | null> {
  const result = await fetchESPNScoreboard()

  const liveGame = result.games.find(
    g => g.status === 'live' || g.status === 'halftime'
  )

  return liveGame || null
}

// Helper functions

function formatClock(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getCurrentNFLSeason(): number {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() // 0-indexed

  // NFL season starts in September (month 8)
  // If before September, use previous year
  return month >= 8 ? year : year - 1
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export { getCurrentNFLSeason, sleep }
