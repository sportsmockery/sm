/**
 * GM Trade Simulator - Centralized Type Definitions
 */

// Asset types for unified handling
export type AssetType = 'PLAYER' | 'DRAFT_PICK' | 'PROSPECT'

// Draft pick with extended metadata
export interface DraftPick {
  year: number
  round: number
  condition?: string
  pickNumber?: number     // If known (e.g., "Pick 12")
  originalTeam?: string   // "Own" or team abbreviation
}

// MLB farm system prospect (matches Datalab gm_mlb_prospects table)
export interface MLBProspect {
  // Core fields from gm_mlb_prospects table
  id?: string                 // UUID
  prospect_id?: string        // Alias for id
  name: string
  position: string
  team_key: string            // 'chw', 'chc', etc.
  team_name?: string          // 'Chicago White Sox'
  org_rank: number            // Organization ranking (1-30)
  age?: number
  prospect_grade: string      // Letter grade: A+, A, A-, B+, B, B-, C+, C
  prospect_grade_numeric?: number  // Numeric grade: 80, 75, 70, 65, 60, 55, 50, 45
  trade_value: number         // Trade value (1-100)
  source?: string             // 'Prospects1500'

  // Optional extended fields (may be added later)
  current_level?: string      // 'R' | 'A' | 'A+' | 'AA' | 'AAA'
  eta?: string                // "Late 2025", "2026", etc.
  scouting_summary?: string
  headshot_url?: string

  // Valuation fields (if available)
  prospect_fv_bucket?: number
  prospect_tier?: 'elite' | 'plus' | 'average' | 'organizational'
  risk_level?: 'low' | 'medium' | 'high'
  position_group?: 'pitcher' | 'catcher' | 'up_the_middle' | 'corner'
  prospect_surplus_value_millions?: number

  // Backwards compatibility aliases
  team_rank?: number          // Alias for org_rank
  rank?: number               // Alias for org_rank
  level?: string              // Alias for current_level
}

// Player data (mirrors PlayerData from PlayerCard.tsx)
export interface GMPlayerData {
  player_id: string
  full_name: string
  position: string
  jersey_number: number | null
  headshot_url: string | null
  age: number | null
  weight_lbs: number | null
  college: string | null
  years_exp: number | null
  draft_info: string | null
  espn_id: string | null
  stat_line: string
  stats: Record<string, number | string | null>
  status?: string
  base_salary?: number | null
  cap_hit?: number | null
  contract_years?: number | null
  contract_expires_year?: number | null
  contract_signed_year?: number | null
  is_rookie_deal?: boolean | null
  trend?: 'hot' | 'rising' | 'stable' | 'declining' | 'cold' | null
  performance_vs_projection?: number | null
  market_sentiment?: 'buy' | 'hold' | 'sell' | null
}

// Trade mode for 2-team vs 3-team trades
export type TradeMode = '2-team' | '3-team'

// Opponent team metadata
export interface OpponentTeam {
  team_key: string
  team_name: string
  abbreviation: string
  logo_url: string
  primary_color: string
  secondary_color?: string
  sport: string
  conference?: string
  division?: string
}

// Asset row configuration for unified rendering
export interface AssetRowConfig {
  type: AssetType
  accentColor: string     // Left border color
  icon: 'player' | 'pick' | 'prospect'
  primaryText: string
  secondaryText: string
  rightText?: string
  rightBadge?: string
  tooltip?: string
}

// Accent colors for each asset type
export const ASSET_ACCENT_COLORS = {
  PLAYER: null,           // Uses team color
  DRAFT_PICK: '#8b5cf6',  // Purple
  PROSPECT: '#22c55e',    // Green
} as const

// Format a draft pick for display
export function formatDraftPick(pick: DraftPick): { primary: string; secondary: string } {
  const pickNum = pick.pickNumber ? ` Pick ${pick.pickNumber}` : ''
  const primary = `${pick.year} Round ${pick.round}${pickNum}`
  const secondary = pick.originalTeam && pick.originalTeam !== 'Own'
    ? `Original: ${pick.originalTeam}`
    : pick.condition || ''
  return { primary, secondary }
}

// Format salary for display
export function formatSalary(amount: number | null | undefined): string {
  if (!amount) return ''
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  }
  return `$${amount}`
}

// Format prospect for display
export function formatProspect(prospect: MLBProspect): { primary: string; secondary: string } {
  const rank = prospect.team_rank || prospect.rank
  const rankPrefix = rank ? `#${rank} ` : ''
  const primary = `${rankPrefix}${prospect.name}`
  const level = prospect.current_level || prospect.level || ''
  const secondary = `${level} - ${prospect.position} - Age ${prospect.age}`
  return { primary, secondary }
}

// =====================
// Season Simulation Types
// =====================

export interface SeasonRecord {
  wins: number
  losses: number
  otLosses?: number // NHL only
  madePlayoffs: boolean
  playoffSeed?: number
  divisionRank?: number
  conferenceRank?: number
}

export interface SimulationScoreBreakdown {
  tradeQualityScore: number
  winImprovementScore: number
  playoffBonusScore: number
  championshipBonus: number
  winImprovement: number
}

// Team standing in league standings
export interface TeamStanding {
  teamKey: string
  teamName: string
  abbreviation: string
  logoUrl: string
  primaryColor: string
  wins: number
  losses: number
  otLosses?: number // NHL
  winPct: number
  division: string
  conference: string
  divisionRank: number
  conferenceRank: number
  playoffSeed: number | null
  gamesBack: number
  isUserTeam: boolean
  isTradePartner: boolean
  tradeImpact?: number // +/- wins from trade
}

// Playoff matchup
export interface PlayoffMatchup {
  round: number // 1 = Wild Card/First Round, 2 = Divisional/Semis, 3 = Conference/Finals, 4 = Championship
  roundName: string
  homeTeam: {
    teamKey: string
    teamName: string
    abbreviation: string
    logoUrl: string
    primaryColor: string
    seed: number
    wins: number
  }
  awayTeam: {
    teamKey: string
    teamName: string
    abbreviation: string
    logoUrl: string
    primaryColor: string
    seed: number
    wins: number
  }
  seriesWins: [number, number] // [home, away]
  winner: 'home' | 'away' | null
  isComplete: boolean
  gamesPlayed: number
  userTeamInvolved: boolean
}

// Championship result
export interface ChampionshipResult {
  winner: {
    teamKey: string
    teamName: string
    abbreviation: string
    logoUrl: string
    primaryColor: string
  }
  runnerUp: {
    teamKey: string
    teamName: string
    abbreviation: string
    logoUrl: string
    primaryColor: string
  }
  seriesScore: string // "4-2", "4-3", etc.
  mvp?: string
  userTeamWon: boolean
  userTeamInFinals: boolean
}

// Season summary narrative
export interface SeasonSummary {
  headline: string // "Bears Make Playoff Push After Strategic Trade"
  narrative: string // Full paragraph explaining the season
  tradeImpactSummary: string // How the trade affected the team
  keyMoments: string[] // "Week 12: Clinched playoff berth", etc.
  affectedTeams: {
    teamName: string
    impact: string // "Lost their starting QB, dropped from 10-7 to 7-10"
  }[]
}

export interface SimulationResult {
  success: boolean
  baseline: SeasonRecord
  modified: SeasonRecord
  gmScore: number
  scoreBreakdown: SimulationScoreBreakdown
  // Extended data for full simulation
  standings?: {
    conference1: TeamStanding[] // AFC/Eastern/etc.
    conference2: TeamStanding[] // NFC/Western/etc.
    conference1Name: string
    conference2Name: string
  }
  playoffs?: {
    bracket: PlayoffMatchup[]
    userTeamResult?: {
      madePlayoffs: boolean
      eliminatedRound?: number
      eliminatedBy?: string
      wonChampionship: boolean
    }
  }
  championship?: ChampionshipResult
  seasonSummary?: SeasonSummary
}

export interface SimulationRequest {
  sessionId: string
  sport: string
  teamKey: string
  seasonYear: number
}
