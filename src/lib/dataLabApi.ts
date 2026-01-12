/**
 * SportsMockery Data Lab API Integration
 *
 * This module handles communication with the SM Data Lab service
 * for fetching sports statistics and data for charts.
 */

import { ChartDataEntry } from '@/components/admin/ChartBuilder/DataEntryForm'
import { DataLabQuery } from '@/components/admin/ChartBuilder/DataLabPicker'

// API Configuration
const DATA_LAB_BASE_URL = process.env.NEXT_PUBLIC_DATA_LAB_URL || 'https://datalab.sportsmockery.com/api'
const API_KEY = process.env.DATA_LAB_API_KEY

// Types
export interface DataLabResponse<T> {
  success: boolean
  data: T
  error?: string
  meta?: {
    source: string
    timestamp: string
    cached: boolean
  }
}

export interface PlayerStats {
  playerId: string
  playerName: string
  team: string
  position: string
  stats: Record<string, number>
  games: number
  season: number
}

export interface TeamStats {
  teamId: string
  teamName: string
  sport: string
  stats: Record<string, number>
  record: {
    wins: number
    losses: number
    ties?: number
  }
  season: number
}

export interface GameResult {
  gameId: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  date: string
  venue: string
  stats?: Record<string, number>
}

// Mock data for development (until actual API is available)
const mockTeamData: Record<string, TeamStats> = {
  bears: {
    teamId: 'bears',
    teamName: 'Chicago Bears',
    sport: 'nfl',
    stats: {
      passingYards: 3850,
      rushingYards: 1920,
      totalPoints: 345,
      sacks: 42,
      interceptions: 14,
      turnovers: 18,
    },
    record: { wins: 10, losses: 5, ties: 0 },
    season: 2024,
  },
  bulls: {
    teamId: 'bulls',
    teamName: 'Chicago Bulls',
    sport: 'nba',
    stats: {
      points: 112.4,
      rebounds: 44.2,
      assists: 26.1,
      steals: 8.3,
      blocks: 5.1,
      threePointPct: 36.8,
    },
    record: { wins: 35, losses: 30 },
    season: 2024,
  },
  cubs: {
    teamId: 'cubs',
    teamName: 'Chicago Cubs',
    sport: 'mlb',
    stats: {
      battingAvg: 0.258,
      homeRuns: 189,
      rbis: 720,
      era: 3.85,
      strikeouts: 1420,
      wins: 85,
    },
    record: { wins: 85, losses: 77 },
    season: 2024,
  },
  whitesox: {
    teamId: 'whitesox',
    teamName: 'Chicago White Sox',
    sport: 'mlb',
    stats: {
      battingAvg: 0.241,
      homeRuns: 156,
      rbis: 645,
      era: 4.52,
      strikeouts: 1280,
      wins: 68,
    },
    record: { wins: 68, losses: 94 },
    season: 2024,
  },
  blackhawks: {
    teamId: 'blackhawks',
    teamName: 'Chicago Blackhawks',
    sport: 'nhl',
    stats: {
      goals: 215,
      assists: 380,
      points: 595,
      saves: 0.905,
      powerPlayPct: 21.2,
      penaltyKillPct: 79.8,
    },
    record: { wins: 32, losses: 38, ties: 12 },
    season: 2024,
  },
}

// Generate realistic weekly data
function generateWeeklyData(baseStat: number, weeks: number = 17): number[] {
  const data: number[] = []
  const variance = baseStat * 0.3

  for (let i = 0; i < weeks; i++) {
    const randomVariance = (Math.random() - 0.5) * variance
    data.push(Math.round(baseStat / weeks + randomVariance))
  }

  return data
}

/**
 * Fetch data from the Data Lab API
 */
async function fetchFromDataLab<T>(
  endpoint: string,
  params: Record<string, string | number>
): Promise<DataLabResponse<T>> {
  const url = new URL(`${DATA_LAB_BASE_URL}${endpoint}`)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value))
  })

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Data Lab API error:', error)
    throw error
  }
}

/**
 * Fetch chart data based on query parameters
 */
export async function fetchChartData(query: DataLabQuery): Promise<ChartDataEntry[]> {
  // In development, use mock data
  if (process.env.NODE_ENV === 'development' || !API_KEY) {
    return generateMockChartData(query)
  }

  try {
    const response = await fetchFromDataLab<ChartDataEntry[]>('/stats', {
      team: query.team,
      type: query.dataType,
      category: query.statCategory,
      period: query.timePeriod,
      season: query.season,
      stats: query.selectedStats.join(','),
    })

    return response.data
  } catch {
    // Fallback to mock data on error
    return generateMockChartData(query)
  }
}

/**
 * Generate mock chart data for development
 */
function generateMockChartData(query: DataLabQuery): ChartDataEntry[] {
  const teamData = mockTeamData[query.team]
  if (!teamData) {
    return []
  }

  // Get base values for selected stats
  const statBaseValues: Record<string, number> = {
    'Passing Yards': 3500,
    'Passing TDs': 28,
    'Interceptions': 12,
    'Completion %': 65,
    'Passer Rating': 95,
    'Rushing Yards': 1800,
    'Rushing TDs': 14,
    'Carries': 380,
    'Receptions': 285,
    'Receiving Yards': 3200,
    'Receiving TDs': 22,
    'Tackles': 850,
    'Sacks': 42,
    'Points': 112,
    'Rebounds': 44,
    'Assists': 26,
    'Goals': 215,
    'Batting Average': 0.258,
    'Home Runs': 189,
  }

  switch (query.timePeriod) {
    case 'single-game':
      // Return single game stats
      return query.selectedStats.map((stat) => ({
        label: stat,
        value: Math.round((statBaseValues[stat] || 100) / 17 * (0.8 + Math.random() * 0.4)),
      }))

    case 'last-5':
      // Return last 5 games
      return Array.from({ length: 5 }, (_, i) => ({
        label: `Game ${5 - i}`,
        value: Math.round((statBaseValues[query.selectedStats[0]] || 200) / 17 * (0.7 + Math.random() * 0.6)),
      }))

    case 'season':
    default:
      // Return weekly/game-by-game data
      const weeks = teamData.sport === 'nfl' ? 17 : teamData.sport === 'nba' ? 20 : 30
      const baseStat = statBaseValues[query.selectedStats[0]] || 200
      const weeklyData = generateWeeklyData(baseStat, weeks)

      return weeklyData.slice(0, 10).map((value, i) => ({
        label: teamData.sport === 'nfl' ? `Week ${i + 1}` : `Game ${i + 1}`,
        value,
      }))
  }
}

/**
 * Fetch player comparison data
 */
export async function fetchPlayerComparison(
  player1Id: string,
  player2Id: string,
  stats: string[]
): Promise<{ player1: ChartDataEntry[]; player2: ChartDataEntry[] }> {
  // Mock implementation
  const data: ChartDataEntry[] = stats.map((stat) => ({
    label: stat,
    value: Math.round(Math.random() * 300 + 100),
    secondaryValue: Math.round(Math.random() * 300 + 100),
  }))

  return {
    player1: data,
    player2: data,
  }
}

/**
 * Fetch team standings
 */
export async function fetchStandings(
  sport: string,
  division?: string
): Promise<ChartDataEntry[]> {
  // Mock standings data
  const standings: Record<string, ChartDataEntry[]> = {
    nfl: [
      { label: 'Bears', value: 10 },
      { label: 'Lions', value: 12 },
      { label: 'Vikings', value: 9 },
      { label: 'Packers', value: 8 },
    ],
    nba: [
      { label: 'Bulls', value: 35 },
      { label: 'Bucks', value: 42 },
      { label: 'Cavaliers', value: 40 },
      { label: 'Pacers', value: 38 },
    ],
    mlb: [
      { label: 'Cubs', value: 85 },
      { label: 'Cardinals', value: 82 },
      { label: 'Brewers', value: 88 },
      { label: 'Reds', value: 76 },
    ],
    nhl: [
      { label: 'Blackhawks', value: 76 },
      { label: 'Wild', value: 88 },
      { label: 'Blues', value: 82 },
      { label: 'Avalanche', value: 95 },
    ],
  }

  return standings[sport] || []
}

/**
 * Search for players
 */
export async function searchPlayers(
  query: string,
  team?: string
): Promise<{ id: string; name: string; team: string; position: string }[]> {
  // Mock player search
  const mockPlayers = [
    { id: '1', name: 'Caleb Williams', team: 'Bears', position: 'QB' },
    { id: '2', name: 'DJ Moore', team: 'Bears', position: 'WR' },
    { id: '3', name: 'DeMar DeRozan', team: 'Bulls', position: 'SG' },
    { id: '4', name: 'Coby White', team: 'Bulls', position: 'PG' },
    { id: '5', name: 'Cody Bellinger', team: 'Cubs', position: 'OF' },
    { id: '6', name: 'Connor Bedard', team: 'Blackhawks', position: 'C' },
  ]

  return mockPlayers.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) &&
      (!team || p.team.toLowerCase() === team.toLowerCase())
  )
}

/**
 * Get available stats for a team/sport
 */
export function getAvailableStats(sport: string, category: string): string[] {
  const statOptions: Record<string, Record<string, string[]>> = {
    nfl: {
      Passing: ['Passing Yards', 'Passing TDs', 'Interceptions', 'Completion %', 'Passer Rating', 'Yards/Attempt'],
      Rushing: ['Rushing Yards', 'Rushing TDs', 'Carries', 'Yards/Carry', 'Fumbles'],
      Receiving: ['Receptions', 'Receiving Yards', 'Receiving TDs', 'Targets', 'Yards/Reception'],
      Defense: ['Tackles', 'Sacks', 'Interceptions', 'Forced Fumbles', 'Pass Deflections'],
    },
    nba: {
      Scoring: ['Points', 'Field Goals', '3-Pointers', 'Free Throws', 'Points in Paint'],
      Rebounds: ['Total Rebounds', 'Offensive Rebounds', 'Defensive Rebounds'],
      Assists: ['Assists', 'Turnovers', 'Assist/TO Ratio'],
      Defense: ['Steals', 'Blocks', 'Defensive Rating'],
    },
    mlb: {
      Batting: ['Batting Average', 'Home Runs', 'RBIs', 'Hits', 'OPS', 'Strikeouts'],
      Pitching: ['ERA', 'Strikeouts', 'WHIP', 'Wins', 'Saves', 'Innings'],
      Fielding: ['Errors', 'Fielding %', 'Double Plays', 'Assists'],
    },
    nhl: {
      Offense: ['Goals', 'Assists', 'Points', 'Power Play Goals', 'Shots'],
      Defense: ['Plus/Minus', 'Blocked Shots', 'Hits', 'Takeaways'],
      Goaltending: ['Save %', 'Goals Against Avg', 'Wins', 'Shutouts'],
    },
  }

  return statOptions[sport]?.[category] || []
}
