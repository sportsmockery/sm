/**
 * Season Status Utility
 * Tracks in-season vs offseason status for all 5 Chicago teams
 */

export interface SeasonStatus {
  team: string
  teamName: string
  sport: string
  isInSeason: boolean
  isOffseason: boolean
  seasonPhase: 'preseason' | 'regular' | 'postseason' | 'offseason'
  currentSeason: number
  draftAvailable: boolean
  nextPhaseDate?: string
  nextPhase?: string
}

export interface ChicagoTeamConfig {
  key: string
  name: string
  sport: string
  abbrev: string
}

export const CHICAGO_TEAMS: ChicagoTeamConfig[] = [
  { key: 'bears', name: 'Chicago Bears', sport: 'nfl', abbrev: 'CHI' },
  { key: 'bulls', name: 'Chicago Bulls', sport: 'nba', abbrev: 'CHI' },
  { key: 'blackhawks', name: 'Chicago Blackhawks', sport: 'nhl', abbrev: 'CHI' },
  { key: 'cubs', name: 'Chicago Cubs', sport: 'mlb', abbrev: 'CHC' },
  { key: 'whitesox', name: 'Chicago White Sox', sport: 'mlb', abbrev: 'CHW' },
]

/**
 * Season date ranges (approximate)
 * These are general windows - actual dates vary by year
 */
const SEASON_WINDOWS = {
  nfl: {
    preseason: { start: { month: 8, day: 1 }, end: { month: 9, day: 5 } },
    regular: { start: { month: 9, day: 5 }, end: { month: 1, day: 10 } },
    postseason: { start: { month: 1, day: 10 }, end: { month: 2, day: 15 } },
    offseason: { start: { month: 2, day: 15 }, end: { month: 8, day: 1 } },
    draftMonth: 4, // April
  },
  nba: {
    preseason: { start: { month: 10, day: 1 }, end: { month: 10, day: 22 } },
    regular: { start: { month: 10, day: 22 }, end: { month: 4, day: 15 } },
    postseason: { start: { month: 4, day: 15 }, end: { month: 6, day: 20 } },
    offseason: { start: { month: 6, day: 20 }, end: { month: 10, day: 1 } },
    draftMonth: 6, // June
  },
  nhl: {
    preseason: { start: { month: 9, day: 20 }, end: { month: 10, day: 10 } },
    regular: { start: { month: 10, day: 10 }, end: { month: 4, day: 15 } },
    postseason: { start: { month: 4, day: 15 }, end: { month: 6, day: 25 } },
    offseason: { start: { month: 6, day: 25 }, end: { month: 9, day: 20 } },
    draftMonth: 7, // July
  },
  mlb: {
    preseason: { start: { month: 2, day: 20 }, end: { month: 3, day: 28 } },
    regular: { start: { month: 3, day: 28 }, end: { month: 10, day: 1 } },
    postseason: { start: { month: 10, day: 1 }, end: { month: 11, day: 5 } },
    offseason: { start: { month: 11, day: 5 }, end: { month: 2, day: 20 } },
    draftMonth: 7, // July
  },
}

/**
 * Get current season year based on sport conventions
 */
export function getCurrentSeason(sport: string): number {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  switch (sport.toLowerCase()) {
    case 'nfl':
      // NFL uses starting year: 2025-26 season = 2025
      return month < 9 ? year - 1 : year
    case 'nba':
    case 'nhl':
      // NBA/NHL use ending year: 2025-26 season = 2026
      return month < 10 ? year : year + 1
    case 'mlb':
      // MLB uses calendar year
      return month < 4 ? year - 1 : year
    default:
      return year
  }
}

/**
 * Check if a sport is in offseason (draft available)
 */
export function isInOffseason(sport: string): boolean {
  const now = new Date()
  const month = now.getMonth() + 1

  switch (sport.toLowerCase()) {
    case 'nfl':
      // NFL offseason: Feb - Aug
      return month >= 2 && month <= 8
    case 'nba':
      // NBA offseason: Jun - Oct
      return month >= 6 && month <= 10
    case 'nhl':
      // NHL offseason: Jun - Sep
      return month >= 6 && month <= 9
    case 'mlb':
      // MLB offseason: Oct - Mar
      return month >= 10 || month <= 3
    default:
      return false
  }
}

/**
 * Check if a sport is in regular season
 */
export function isInSeason(sport: string): boolean {
  const phase = getSeasonPhase(sport)
  return phase === 'regular' || phase === 'postseason'
}

/**
 * Get current season phase for a sport
 */
export function getSeasonPhase(sport: string): 'preseason' | 'regular' | 'postseason' | 'offseason' {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  const windows = SEASON_WINDOWS[sport.toLowerCase() as keyof typeof SEASON_WINDOWS]
  if (!windows) return 'offseason'

  const isInRange = (range: { start: { month: number; day: number }; end: { month: number; day: number } }) => {
    const startMonth = range.start.month
    const endMonth = range.end.month

    // Handle ranges that wrap around year end (e.g., NFL regular season Sep-Jan)
    if (startMonth > endMonth) {
      // Wraps around year
      return (month > startMonth || (month === startMonth && day >= range.start.day)) ||
             (month < endMonth || (month === endMonth && day <= range.end.day))
    } else {
      // Normal range within same year
      return (month > startMonth || (month === startMonth && day >= range.start.day)) &&
             (month < endMonth || (month === endMonth && day <= range.end.day))
    }
  }

  if (isInRange(windows.regular)) return 'regular'
  if (isInRange(windows.postseason)) return 'postseason'
  if (isInRange(windows.preseason)) return 'preseason'
  return 'offseason'
}

/**
 * Get full season status for a team
 */
export function getTeamSeasonStatus(teamKey: string): SeasonStatus | null {
  const team = CHICAGO_TEAMS.find(t => t.key === teamKey)
  if (!team) return null

  const phase = getSeasonPhase(team.sport)
  const inSeason = phase === 'regular' || phase === 'postseason'
  const offseason = phase === 'offseason'

  return {
    team: team.key,
    teamName: team.name,
    sport: team.sport,
    isInSeason: inSeason,
    isOffseason: offseason,
    seasonPhase: phase,
    currentSeason: getCurrentSeason(team.sport),
    draftAvailable: offseason,
  }
}

/**
 * Get season status for all Chicago teams
 */
export function getAllTeamSeasonStatus(): SeasonStatus[] {
  return CHICAGO_TEAMS.map(team => getTeamSeasonStatus(team.key)!)
}

/**
 * Get teams currently in season
 */
export function getInSeasonTeams(): ChicagoTeamConfig[] {
  return CHICAGO_TEAMS.filter(team => isInSeason(team.sport))
}

/**
 * Get teams currently in offseason (draft available)
 */
export function getOffseasonTeams(): ChicagoTeamConfig[] {
  return CHICAGO_TEAMS.filter(team => isInOffseason(team.sport))
}

/**
 * Get formatted season status summary
 */
export function getSeasonStatusSummary(): {
  inSeason: string[]
  offseason: string[]
  draftAvailable: string[]
} {
  const statuses = getAllTeamSeasonStatus()

  return {
    inSeason: statuses.filter(s => s.isInSeason).map(s => s.team),
    offseason: statuses.filter(s => s.isOffseason).map(s => s.team),
    draftAvailable: statuses.filter(s => s.draftAvailable).map(s => s.team),
  }
}
