/**
 * MySportsFeeds API Client (Backup)
 *
 * Secondary/backup data source for Bears game schedules and scores.
 * Only used when ESPN API fails or returns unusable data.
 *
 * API Documentation: https://www.mysportsfeeds.com/data-feeds/
 *
 * Requires API key stored in MYSPORTSFEEDS_API_KEY env variable.
 * Free tier available for personal/non-commercial use.
 */

// MySportsFeeds API base URL
const MSF_BASE = 'https://api.mysportsfeeds.com/v2.1/pull/nfl'

// Bears team identifier in MySportsFeeds
const BEARS_TEAM = 'CHI'

export interface MSFGame {
  gameId: string
  date: string
  time: string
  season: number
  week: number
  gameType: 'preseason' | 'regular' | 'postseason'
  opponent: string
  opponentFullName: string
  isHome: boolean
  bearsScore: number | null
  opponentScore: number | null
  bearsWin: boolean | null
  status: string
  stadium: string | null
  isPlayoff: boolean
}

export interface MSFScheduleResponse {
  games: MSFGame[]
  season: number
  error?: string
}

/**
 * Get authorization header for MySportsFeeds
 */
function getAuthHeader(): string {
  const apiKey = process.env.MYSPORTSFEEDS_API_KEY
  if (!apiKey) {
    throw new Error('MYSPORTSFEEDS_API_KEY not configured')
  }
  // MySportsFeeds uses basic auth with apikey:MYSPORTSFEEDS
  const credentials = Buffer.from(`${apiKey}:MYSPORTSFEEDS`).toString('base64')
  return `Basic ${credentials}`
}

/**
 * Fetch Bears schedule from MySportsFeeds
 * Used as backup when ESPN fails
 */
export async function fetchMSFBearsSchedule(season?: number): Promise<MSFScheduleResponse> {
  try {
    const targetSeason = season || getCurrentMSFSeason()
    const url = `${MSF_BASE}/${targetSeason}-regular/games.json?team=${BEARS_TEAM}`

    const response = await fetch(url, {
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('MySportsFeeds authentication failed')
      }
      throw new Error(`MySportsFeeds API error: ${response.status}`)
    }

    const data = await response.json()
    const games: MSFGame[] = []

    for (const game of data.games || []) {
      const schedule = game.schedule
      const score = game.score

      // Determine if Bears are home or away
      const isHome = schedule.homeTeam?.abbreviation === BEARS_TEAM
      const bearsTeam = isHome ? schedule.homeTeam : schedule.awayTeam
      const opponentTeam = isHome ? schedule.awayTeam : schedule.homeTeam

      // Get scores
      let bearsScore: number | null = null
      let opponentScore: number | null = null

      if (score) {
        bearsScore = isHome ? score.homeScoreTotal : score.awayScoreTotal
        opponentScore = isHome ? score.awayScoreTotal : score.homeScoreTotal
      }

      // Determine win/loss
      let bearsWin: boolean | null = null
      if (schedule.playedStatus === 'COMPLETED' && bearsScore !== null && opponentScore !== null) {
        bearsWin = bearsScore > opponentScore
      }

      // Parse date
      const gameDate = new Date(schedule.startTime)

      // Map status
      let status = 'scheduled'
      if (schedule.playedStatus === 'COMPLETED') status = 'finished'
      else if (schedule.playedStatus === 'LIVE') status = 'live'
      else if (schedule.playedStatus === 'UNPLAYED') status = 'scheduled'

      games.push({
        gameId: String(schedule.id),
        date: gameDate.toISOString().split('T')[0],
        time: gameDate.toTimeString().split(' ')[0],
        season: targetSeason,
        week: schedule.week || 1,
        gameType: 'regular',
        opponent: opponentTeam?.abbreviation || 'UNK',
        opponentFullName: opponentTeam?.name || 'Unknown',
        isHome,
        bearsScore,
        opponentScore,
        bearsWin,
        status,
        stadium: schedule.venue?.name || null,
        isPlayoff: false,
      })
    }

    return {
      games,
      season: targetSeason,
    }
  } catch (error) {
    console.error('MySportsFeeds schedule fetch error:', error)
    return {
      games: [],
      season: season || getCurrentMSFSeason(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Fetch live Bears game from MySportsFeeds
 * Used as backup for live score updates
 */
export async function fetchMSFLiveGame(): Promise<MSFGame | null> {
  try {
    const season = getCurrentMSFSeason()
    const url = `${MSF_BASE}/${season}-regular/games.json?team=${BEARS_TEAM}&status=in-progress`

    const response = await fetch(url, {
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json',
      },
      next: { revalidate: 30 }, // Cache for 30 seconds during live
    })

    if (!response.ok) {
      throw new Error(`MySportsFeeds API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.games || data.games.length === 0) {
      return null
    }

    // Return the first (should be only) live game
    const game = data.games[0]
    const schedule = game.schedule
    const score = game.score

    const isHome = schedule.homeTeam?.abbreviation === BEARS_TEAM
    const opponentTeam = isHome ? schedule.awayTeam : schedule.homeTeam

    let bearsScore: number | null = null
    let opponentScore: number | null = null

    if (score) {
      bearsScore = isHome ? score.homeScoreTotal : score.awayScoreTotal
      opponentScore = isHome ? score.awayScoreTotal : score.homeScoreTotal
    }

    const gameDate = new Date(schedule.startTime)

    return {
      gameId: String(schedule.id),
      date: gameDate.toISOString().split('T')[0],
      time: gameDate.toTimeString().split(' ')[0],
      season,
      week: schedule.week || 1,
      gameType: 'regular',
      opponent: opponentTeam?.abbreviation || 'UNK',
      opponentFullName: opponentTeam?.name || 'Unknown',
      isHome,
      bearsScore,
      opponentScore,
      bearsWin: null, // Game in progress
      status: 'live',
      stadium: schedule.venue?.name || null,
      isPlayoff: false,
    }
  } catch (error) {
    console.error('MySportsFeeds live game fetch error:', error)
    return null
  }
}

/**
 * Fetch specific game score from MySportsFeeds
 * Used as backup when ESPN summary fails
 */
export async function fetchMSFGameScore(gameId: string): Promise<{
  bearsScore: number | null
  opponentScore: number | null
  status: string
  error?: string
}> {
  try {
    const season = getCurrentMSFSeason()
    const url = `${MSF_BASE}/${season}-regular/games/${gameId}/boxscore.json`

    const response = await fetch(url, {
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json',
      },
      next: { revalidate: 30 },
    })

    if (!response.ok) {
      throw new Error(`MySportsFeeds API error: ${response.status}`)
    }

    const data = await response.json()
    const game = data.game
    const score = data.scoring

    if (!game) {
      return {
        bearsScore: null,
        opponentScore: null,
        status: 'unknown',
        error: 'Game not found',
      }
    }

    const isHome = game.schedule?.homeTeam?.abbreviation === BEARS_TEAM

    let bearsScore: number | null = null
    let opponentScore: number | null = null

    if (score) {
      bearsScore = isHome ? score.homeScoreTotal : score.awayScoreTotal
      opponentScore = isHome ? score.awayScoreTotal : score.homeScoreTotal
    }

    let status = 'scheduled'
    if (game.schedule?.playedStatus === 'COMPLETED') status = 'finished'
    else if (game.schedule?.playedStatus === 'LIVE') status = 'live'

    return {
      bearsScore,
      opponentScore,
      status,
    }
  } catch (error) {
    console.error('MySportsFeeds game score fetch error:', error)
    return {
      bearsScore: null,
      opponentScore: null,
      status: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Helper functions

function getCurrentMSFSeason(): number {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  // NFL season runs Sep-Feb, MySportsFeeds uses start year
  return month >= 8 ? year : year - 1
}

export { getCurrentMSFSeason }
