/**
 * Chicago Teams Configuration
 *
 * Centralized configuration for all 5 Chicago sports teams.
 * Used by team hub pages, navigation, and data fetching.
 *
 * Colors sourced from official team style guides:
 * - Bears: https://www.chicagobears.com (Navy #0B162A, Orange #C83200)
 * - Bulls: https://www.nba.com/bulls (Red #CE1141, Black #000000)
 * - Cubs: https://www.mlb.com/cubs (Blue #0E3386, Red #CC3433)
 * - White Sox: https://www.mlb.com/whitesox (Black #27251F, Silver #C4CED4)
 * - Blackhawks: https://www.nhl.com/blackhawks (Red #CF0A2C, Black #000000)
 */

import type { TeamInfo, NextGameInfo, TeamRecord } from '@/components/team/TeamHubLayout'

export const CHICAGO_TEAMS: Record<string, TeamInfo> = {
  bears: {
    name: 'Chicago Bears',
    shortName: 'Bears',
    slug: 'chicago-bears',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
    primaryColor: '#0B162A',
    secondaryColor: '#C83200',
    league: 'NFL',
  },
  bulls: {
    name: 'Chicago Bulls',
    shortName: 'Bulls',
    slug: 'chicago-bulls',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    primaryColor: '#CE1141',
    secondaryColor: '#000000',
    league: 'NBA',
  },
  cubs: {
    name: 'Chicago Cubs',
    shortName: 'Cubs',
    slug: 'chicago-cubs',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    primaryColor: '#0E3386',
    secondaryColor: '#CC3433',
    league: 'MLB',
  },
  whitesox: {
    name: 'Chicago White Sox',
    shortName: 'White Sox',
    slug: 'chicago-white-sox',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
    primaryColor: '#27251F',
    secondaryColor: '#C4CED4',
    league: 'MLB',
  },
  blackhawks: {
    name: 'Chicago Blackhawks',
    shortName: 'Blackhawks',
    slug: 'chicago-blackhawks',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png',
    primaryColor: '#CF0A2C',
    secondaryColor: '#000000',
    league: 'NHL',
  },
}

// ESPN API team IDs for fetching data
export const ESPN_TEAM_IDS = {
  bears: { sport: 'football', league: 'nfl', teamId: '3' },
  bulls: { sport: 'basketball', league: 'nba', teamId: '4' },
  cubs: { sport: 'baseball', league: 'mlb', teamId: '16' },
  whitesox: { sport: 'baseball', league: 'mlb', teamId: '4' },
  blackhawks: { sport: 'hockey', league: 'nhl', teamId: '4' },
}

// Helper to get team by slug
export function getTeamBySlug(slug: string): TeamInfo | null {
  // Handle slugs like "chicago-bears" -> "bears"
  const normalizedSlug = slug.replace('chicago-', '')
  return CHICAGO_TEAMS[normalizedSlug] || null
}

// Helper to get team key from slug
export function getTeamKey(slug: string): string | null {
  const normalizedSlug = slug.replace('chicago-', '')
  if (CHICAGO_TEAMS[normalizedSlug]) {
    return normalizedSlug
  }
  return null
}

/**
 * Fetch team record from ESPN API
 */
export async function fetchTeamRecord(teamKey: string): Promise<TeamRecord | null> {
  const config = ESPN_TEAM_IDS[teamKey as keyof typeof ESPN_TEAM_IDS]
  if (!config) return null

  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${config.sport}/${config.league}/teams/${config.teamId}`
    const response = await fetch(url, { next: { revalidate: 3600 } })

    if (!response.ok) return null

    const data = await response.json()
    const team = data.team
    const record = team?.record?.items?.[0]?.stats

    if (!record) return null

    // Parse record based on league
    const wins = record.find((s: any) => s.name === 'wins')?.value || 0
    const losses = record.find((s: any) => s.name === 'losses')?.value || 0
    const ties = record.find((s: any) => s.name === 'ties')?.value
    const otLosses = record.find((s: any) => s.name === 'OTLosses')?.value

    return {
      wins,
      losses,
      ties: ties || undefined,
      otLosses: otLosses || undefined,
    }
  } catch (error) {
    console.error(`Error fetching ${teamKey} record:`, error)
    return null
  }
}

/**
 * Fetch next game from ESPN API
 */
export async function fetchNextGame(teamKey: string): Promise<NextGameInfo | null> {
  const config = ESPN_TEAM_IDS[teamKey as keyof typeof ESPN_TEAM_IDS]
  const teamInfo = CHICAGO_TEAMS[teamKey]
  if (!config || !teamInfo) return null

  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${config.sport}/${config.league}/teams/${config.teamId}/schedule`
    const response = await fetch(url, { next: { revalidate: 3600 } })

    if (!response.ok) return null

    const data = await response.json()
    const events = data.events || []
    const now = new Date()

    // Find next upcoming game
    const nextGame = events.find((event: any) => new Date(event.date) >= now)
    if (!nextGame) return null

    const gameDate = new Date(nextGame.date)
    const competitions = nextGame.competitions?.[0]

    // Determine if home or away
    const isHome = competitions?.competitors?.find(
      (c: any) => c.homeAway === 'home'
    )?.team?.id === config.teamId

    // Find opponent
    const opponent = competitions?.competitors?.find(
      (c: any) => c.team?.id !== config.teamId
    )?.team

    const opponentLogo = opponent?.logo || null
    const opponentName = opponent?.shortDisplayName || opponent?.displayName || 'TBD'

    return {
      opponent: opponentName,
      opponentLogo,
      date: gameDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      time: gameDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      isHome,
      venue: competitions?.venue?.fullName,
    }
  } catch (error) {
    console.error(`Error fetching ${teamKey} next game:`, error)
    return null
  }
}
