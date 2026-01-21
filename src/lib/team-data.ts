/**
 * Team Data Fetching Utilities
 * Fetches live data for all Chicago teams from ESPN API
 */

import { fetchTeamRecord, fetchNextGame, CHICAGO_TEAMS, ESPN_TEAM_IDS } from './team-config'
import type { TeamSeasonData } from '@/components/team/TeamSeasonCard'

export type TeamKey = 'bears' | 'bulls' | 'cubs' | 'whitesox' | 'blackhawks'

// Division/Conference info by team
const TEAM_DIVISIONS: Record<TeamKey, string> = {
  bears: 'NFC North',
  bulls: 'Eastern Conference',
  cubs: 'NL Central',
  whitesox: 'AL Central',
  blackhawks: 'Central Division',
}

// Current seasons by league
function getCurrentSeason(teamKey: TeamKey): number {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const year = now.getFullYear()

  switch (teamKey) {
    case 'bears':
      // NFL season: September-February, use the year the season started
      return month >= 9 ? year : year - 1
    case 'bulls':
    case 'blackhawks':
      // NBA/NHL season: October-June, use the year the season started
      return month >= 10 ? year : year - 1
    case 'cubs':
    case 'whitesox':
      // MLB season: March-October, use current year
      return year
    default:
      return year
  }
}

/**
 * Fetch team season data from ESPN API
 */
export async function getTeamSeasonData(teamKey: TeamKey): Promise<TeamSeasonData> {
  try {
    // Fetch record and next game in parallel
    const [record, nextGame] = await Promise.all([
      fetchTeamRecord(teamKey),
      fetchNextGame(teamKey),
    ])

    const season = getCurrentSeason(teamKey)
    const division = TEAM_DIVISIONS[teamKey]

    // Build standing string
    const wins = record?.wins ?? 0
    const losses = record?.losses ?? 0
    const ties = record?.ties ?? 0
    const otLosses = record?.otLosses

    let standing = `${wins}-${losses}`
    if (otLosses !== undefined) {
      standing += `-${otLosses}`
    } else if (ties > 0) {
      standing += `-${ties}`
    }
    standing += ` in ${division}`

    return {
      season,
      record: {
        wins,
        losses,
        ties: ties || undefined,
        otLosses: otLosses,
      },
      standing,
      nextGame: nextGame ? {
        opponent: nextGame.opponent,
        opponentLogo: nextGame.opponentLogo,
        date: nextGame.date,
        time: nextGame.time,
        isHome: nextGame.isHome,
      } : null,
      lastGame: null, // ESPN API doesn't give last game easily, would need schedule API
    }
  } catch (error) {
    console.error(`Error fetching ${teamKey} season data:`, error)
    return getDefaultSeasonData(teamKey)
  }
}

/**
 * Get default/fallback season data
 */
function getDefaultSeasonData(teamKey: TeamKey): TeamSeasonData {
  const season = getCurrentSeason(teamKey)
  const division = TEAM_DIVISIONS[teamKey]

  return {
    season,
    record: {
      wins: 0,
      losses: 0,
    },
    standing: `${division}`,
    nextGame: null,
    lastGame: null,
  }
}

/**
 * Fetch last game result from ESPN API
 */
export async function fetchLastGame(teamKey: TeamKey): Promise<{
  opponent: string
  result: 'W' | 'L' | 'T'
  score: string
} | null> {
  const config = ESPN_TEAM_IDS[teamKey as keyof typeof ESPN_TEAM_IDS]
  if (!config) return null

  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${config.sport}/${config.league}/teams/${config.teamId}/schedule`
    const response = await fetch(url, { next: { revalidate: 3600 } })

    if (!response.ok) return null

    const data = await response.json()
    const events = data.events || []
    const now = new Date()

    // Find most recent completed game
    const completedGames = events
      .filter((event: any) => {
        const gameDate = new Date(event.date)
        const competition = event.competitions?.[0]
        const isCompleted = competition?.status?.type?.completed === true ||
                           competition?.status?.type?.state === 'post'
        return gameDate < now && isCompleted
      })
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const lastGame = completedGames[0]
    if (!lastGame) return null

    const competition = lastGame.competitions?.[0]
    const competitors = competition?.competitors || []

    // Find our team and opponent
    const ourTeam = competitors.find((c: any) => c.team?.id === config.teamId)
    const opponent = competitors.find((c: any) => c.team?.id !== config.teamId)

    if (!ourTeam || !opponent) return null

    const ourScore = parseInt(ourTeam.score) || 0
    const oppScore = parseInt(opponent.score) || 0

    let result: 'W' | 'L' | 'T' = 'T'
    if (ourScore > oppScore) result = 'W'
    else if (ourScore < oppScore) result = 'L'

    return {
      opponent: opponent.team?.shortDisplayName || opponent.team?.displayName || 'Unknown',
      result,
      score: `${ourScore}-${oppScore}`,
    }
  } catch (error) {
    console.error(`Error fetching last game for ${teamKey}:`, error)
    return null
  }
}

/**
 * Fetch complete team season data including last game
 */
export async function getCompleteTeamSeasonData(teamKey: TeamKey): Promise<TeamSeasonData> {
  const [seasonData, lastGame] = await Promise.all([
    getTeamSeasonData(teamKey),
    fetchLastGame(teamKey),
  ])

  return {
    ...seasonData,
    lastGame,
  }
}

/**
 * Get team info from team key
 */
export function getTeamInfo(teamKey: TeamKey) {
  return CHICAGO_TEAMS[teamKey]
}
