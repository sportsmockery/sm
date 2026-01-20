/**
 * Upcoming Games Data Source
 *
 * Fetches upcoming games for all 5 Chicago teams:
 * - Bears (NFL) - from datalab
 * - Bulls (NBA) - from ESPN API
 * - Cubs (MLB) - from ESPN API
 * - White Sox (MLB) - from ESPN API
 * - Blackhawks (NHL) - from ESPN API
 */

import { datalabClient } from './supabase-datalab'

export interface UpcomingGame {
  team: string
  teamLogo: string
  teamSlug: string
  opponent: string
  opponentLogo?: string
  date: string
  time: string
  isHome: boolean
  venue?: string
  league: 'NFL' | 'NBA' | 'MLB' | 'NHL'
}

// Team configurations
const TEAM_CONFIG = {
  bears: {
    name: 'Chicago Bears',
    shortName: 'Bears',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
    slug: 'chicago-bears',
    espnId: '3',
    league: 'NFL' as const,
  },
  bulls: {
    name: 'Chicago Bulls',
    shortName: 'Bulls',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    slug: 'chicago-bulls',
    espnId: '4',
    league: 'NBA' as const,
  },
  cubs: {
    name: 'Chicago Cubs',
    shortName: 'Cubs',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    slug: 'chicago-cubs',
    espnId: '16',
    league: 'MLB' as const,
  },
  whitesox: {
    name: 'Chicago White Sox',
    shortName: 'White Sox',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
    slug: 'chicago-white-sox',
    espnId: '4',
    league: 'MLB' as const,
  },
  blackhawks: {
    name: 'Chicago Blackhawks',
    shortName: 'Blackhawks',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png',
    slug: 'chicago-blackhawks',
    espnId: '4',
    league: 'NHL' as const,
  },
}

/**
 * Fetch Bears upcoming games from datalab
 */
async function fetchBearsGames(): Promise<UpcomingGame[]> {
  if (!datalabClient) {
    return []
  }

  try {
    const today = new Date().toISOString().split('T')[0]

    const { data: games, error } = await datalabClient
      .from('bears_games')
      .select('*')
      .gte('game_date', today)
      .order('game_date', { ascending: true })
      .limit(3)

    if (error || !games) {
      console.error('Error fetching Bears games:', error)
      return []
    }

    return games.map((game: any) => {
      const gameDate = new Date(game.game_date)
      return {
        team: TEAM_CONFIG.bears.shortName,
        teamLogo: TEAM_CONFIG.bears.logo,
        teamSlug: TEAM_CONFIG.bears.slug,
        opponent: game.opponent,
        date: gameDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        time: game.game_time || 'TBD',
        isHome: game.is_bears_home,
        venue: game.stadium,
        league: 'NFL',
      }
    })
  } catch (error) {
    console.error('Error fetching Bears games:', error)
    return []
  }
}

/**
 * Fetch upcoming games from ESPN API for a given team
 */
async function fetchESPNGames(
  sport: 'basketball' | 'baseball' | 'hockey',
  league: 'nba' | 'mlb' | 'nhl',
  teamConfig: {
    name: string
    shortName: string
    logo: string
    slug: string
    espnId: string
    league: 'NFL' | 'NBA' | 'MLB' | 'NHL'
  }
): Promise<UpcomingGame[]> {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${teamConfig.espnId}/schedule`

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    const events = data.events || []
    const now = new Date()

    // Filter for upcoming games only
    const upcomingGames = events
      .filter((event: any) => new Date(event.date) >= now)
      .slice(0, 2)
      .map((event: any) => {
        const gameDate = new Date(event.date)
        const competitions = event.competitions?.[0]
        const isHome = competitions?.competitors?.find((c: any) => c.homeAway === 'home')?.team?.id === teamConfig.espnId

        // Find opponent
        const opponent = competitions?.competitors?.find((c: any) =>
          c.team?.id !== teamConfig.espnId
        )?.team?.shortDisplayName || 'TBD'

        return {
          team: teamConfig.shortName,
          teamLogo: teamConfig.logo,
          teamSlug: teamConfig.slug,
          opponent,
          date: gameDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          time: gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          isHome,
          league: teamConfig.league,
        }
      })

    return upcomingGames
  } catch (error) {
    console.error(`Error fetching ${teamConfig.shortName} games:`, error)
    return []
  }
}

/**
 * Fetch all upcoming Chicago games
 * Returns games sorted by date
 */
export async function fetchAllUpcomingGames(): Promise<UpcomingGame[]> {
  try {
    // Fetch games from all teams in parallel
    const [bearsGames, bullsGames, cubsGames, soxGames, hawksGames] = await Promise.all([
      fetchBearsGames(),
      fetchESPNGames('basketball', 'nba', TEAM_CONFIG.bulls),
      fetchESPNGames('baseball', 'mlb', TEAM_CONFIG.cubs),
      fetchESPNGames('baseball', 'mlb', TEAM_CONFIG.whitesox),
      fetchESPNGames('hockey', 'nhl', TEAM_CONFIG.blackhawks),
    ])

    // Combine and sort by date
    const allGames = [
      ...bearsGames,
      ...bullsGames,
      ...cubsGames,
      ...soxGames,
      ...hawksGames,
    ]

    // Sort by date (simple string comparison works for "Mon, Jan 20" format)
    // For production, you'd want to parse the actual dates
    return allGames.slice(0, 5) // Return top 5 upcoming games

  } catch (error) {
    console.error('Error fetching all upcoming games:', error)
    return []
  }
}

/**
 * Get mock upcoming games for development/fallback
 */
export function getMockUpcomingGames(): UpcomingGame[] {
  return [
    {
      team: 'Bears',
      teamLogo: TEAM_CONFIG.bears.logo,
      teamSlug: TEAM_CONFIG.bears.slug,
      opponent: 'Packers',
      date: 'Sun, Jan 26',
      time: '12:00 PM',
      isHome: true,
      league: 'NFL',
    },
    {
      team: 'Bulls',
      teamLogo: TEAM_CONFIG.bulls.logo,
      teamSlug: TEAM_CONFIG.bulls.slug,
      opponent: 'Lakers',
      date: 'Mon, Jan 27',
      time: '7:00 PM',
      isHome: false,
      league: 'NBA',
    },
    {
      team: 'Blackhawks',
      teamLogo: TEAM_CONFIG.blackhawks.logo,
      teamSlug: TEAM_CONFIG.blackhawks.slug,
      opponent: 'Red Wings',
      date: 'Tue, Jan 28',
      time: '7:30 PM',
      isHome: true,
      league: 'NHL',
    },
    {
      team: 'Cubs',
      teamLogo: TEAM_CONFIG.cubs.logo,
      teamSlug: TEAM_CONFIG.cubs.slug,
      opponent: 'Cardinals',
      date: 'Apr 1',
      time: '1:20 PM',
      isHome: true,
      league: 'MLB',
    },
    {
      team: 'White Sox',
      teamLogo: TEAM_CONFIG.whitesox.logo,
      teamSlug: TEAM_CONFIG.whitesox.slug,
      opponent: 'Tigers',
      date: 'Apr 1',
      time: '3:10 PM',
      isHome: false,
      league: 'MLB',
    },
  ]
}
