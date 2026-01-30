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
  prospect_id: string
  name: string
  position: string
  team_key: string
  team_name?: string
  team_rank: number           // Organization rank (1-30)
  mlb_top_100_rank?: number   // MLB Top 100 rank (null if not in top 100)
  prospect_grade: string      // A+, A, A-, B+, B, B-, C+, C, C-, D
  prospect_grade_display?: string  // "Grade: A-"
  trade_value: number         // 25-95 based on grade
  age: number
  current_level: string       // 'R' | 'A' | 'A+' | 'AA' | 'AAA'
  eta?: string                // "Late 2025", "2026", etc.
  scouting_summary?: string
  is_prospect: boolean
  player_type: 'prospect'
  headshot_url?: string       // Future: player headshots

  // New valuation fields (Jan 2026)
  prospect_fv_bucket?: number          // Future Value: 40-80
  prospect_tier?: 'elite' | 'plus' | 'average' | 'organizational'
  risk_level?: 'low' | 'medium' | 'high'
  position_group?: 'pitcher' | 'catcher' | 'up_the_middle' | 'corner'
  prospect_surplus_value_millions?: number  // Trade value in $M (1.0-80.0)
  proximity_level?: 'MLB' | 'AAA' | 'AA' | 'A' | 'Rookie'

  // Computed helpers for backwards compatibility
  rank?: number               // Alias for team_rank
  level?: string              // Alias for current_level
  isTop100?: boolean          // true if mlb_top_100_rank exists
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
