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
import { datalabClient } from './supabase-datalab'

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

// DataLab table configuration for each team
const DATALAB_CONFIG: Record<string, { gamesTable: string; scoreCol: string; oppScoreCol: string; isHomeCol: string }> = {
  bears: { gamesTable: 'bears_games_master', scoreCol: 'bears_score', oppScoreCol: 'opponent_score', isHomeCol: 'is_bears_home' },
  bulls: { gamesTable: 'bulls_games_master', scoreCol: 'bulls_score', oppScoreCol: 'opponent_score', isHomeCol: 'is_bulls_home' },
  blackhawks: { gamesTable: 'blackhawks_games_master', scoreCol: 'blackhawks_score', oppScoreCol: 'opponent_score', isHomeCol: 'is_blackhawks_home' },
  cubs: { gamesTable: 'cubs_games_master', scoreCol: 'cubs_score', oppScoreCol: 'opponent_score', isHomeCol: 'is_cubs_home' },
  whitesox: { gamesTable: 'whitesox_games_master', scoreCol: 'whitesox_score', oppScoreCol: 'opponent_score', isHomeCol: 'is_whitesox_home' },
}

/**
 * Get current season based on team's league
 */
function getCurrentSeason(league: string): number {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-12

  // NFL/NHL: Season starts in fall, use starting year (e.g., 2025-26 season = 2025)
  // NBA: Season starts in October, use starting year
  // MLB: Season is within a calendar year
  if (league === 'NFL' || league === 'NHL' || league === 'NBA') {
    // If before September, we're in the previous year's season
    return month < 9 ? year - 1 : year
  }
  // MLB: just use current year
  return year
}

/**
 * Fetch team record from DataLab Supabase
 */
export async function fetchTeamRecord(teamKey: string): Promise<TeamRecord | null> {
  const config = DATALAB_CONFIG[teamKey]
  const teamInfo = CHICAGO_TEAMS[teamKey]
  if (!config || !teamInfo || !datalabClient) return null

  const currentSeason = getCurrentSeason(teamInfo.league)

  try {
    // Get completed games for the current season
    const { data: games, error } = await datalabClient
      .from(config.gamesTable)
      .select('*')
      .eq('season', currentSeason)
      .not(config.scoreCol, 'is', null)
      .not(config.oppScoreCol, 'is', null)

    if (error || !games) {
      console.error(`Error fetching ${teamKey} record from DataLab:`, error)
      return null
    }

    // Separate regular season and postseason games
    let regWins = 0
    let regLosses = 0
    let regTies = 0
    let regOtLosses = 0
    let postWins = 0
    let postLosses = 0

    games.forEach((game: any) => {
      const teamScore = Number(game[config.scoreCol]) || 0
      const oppScore = Number(game[config.oppScoreCol]) || 0
      const isPlayoff = game.game_type === 'postseason' || game.is_playoff === true

      if (teamScore > oppScore) {
        if (isPlayoff) {
          postWins++
        } else {
          regWins++
        }
      } else if (teamScore < oppScore) {
        if (isPlayoff) {
          postLosses++
        } else {
          // Check for OT/SO loss (NHL) or tie (NFL)
          if (game.result === 'OTL' || game.result === 'SOL') {
            regOtLosses++
          } else {
            regLosses++
          }
        }
      } else {
        // Ties only count in regular season
        if (!isPlayoff) {
          regTies++
        }
      }
    })

    return {
      wins: regWins,
      losses: regLosses,
      ties: regTies > 0 ? regTies : undefined,
      otLosses: regOtLosses > 0 ? regOtLosses : undefined,
      postseason: (postWins > 0 || postLosses > 0) ? { wins: postWins, losses: postLosses } : undefined,
    }
  } catch (error) {
    console.error(`Error fetching ${teamKey} record:`, error)
    return null
  }
}

/**
 * Fetch next game from DataLab Supabase
 */
export async function fetchNextGame(teamKey: string): Promise<NextGameInfo | null> {
  const config = DATALAB_CONFIG[teamKey]
  const teamInfo = CHICAGO_TEAMS[teamKey]
  if (!config || !teamInfo || !datalabClient) return null

  try {
    const today = new Date().toISOString().split('T')[0]

    // Get next upcoming game (game_date >= today with no score yet)
    const { data: games, error } = await datalabClient
      .from(config.gamesTable)
      .select('*')
      .gte('game_date', today)
      .is(config.scoreCol, null)
      .order('game_date', { ascending: true })
      .limit(1)

    if (error || !games || games.length === 0) {
      // Fallback: try to get any future game
      const { data: futureGames } = await datalabClient
        .from(config.gamesTable)
        .select('*')
        .gte('game_date', today)
        .order('game_date', { ascending: true })
        .limit(1)

      if (!futureGames || futureGames.length === 0) return null

      const game = futureGames[0]
      return formatNextGame(game, config)
    }

    const game = games[0]
    return formatNextGame(game, config)
  } catch (error) {
    console.error(`Error fetching ${teamKey} next game:`, error)
    return null
  }
}

function formatNextGame(game: any, config: { isHomeCol: string }): NextGameInfo {
  const isHome = game[config.isHomeCol] || game.home_away === 'home' || game.homeAway === 'home'

  // Parse date and time
  let gameDate: Date
  if (game.game_date) {
    gameDate = new Date(game.game_date)
    if (game.game_time) {
      const [hours, minutes] = game.game_time.split(':').map(Number)
      gameDate.setHours(hours, minutes, 0, 0)
    }
  } else {
    gameDate = new Date()
  }

  return {
    opponent: game.opponent_full_name || game.opponent || 'TBD',
    opponentLogo: game.opponent_logo || null,
    date: gameDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
    time: game.game_time
      ? new Date(`2000-01-01T${game.game_time}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })
      : 'TBD',
    isHome,
    venue: game.venue || undefined,
  }
}
