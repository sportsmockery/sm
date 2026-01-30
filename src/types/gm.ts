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

// MLB farm system prospect
export interface MLBProspect {
  prospect_id: string
  name: string
  position: string
  level: 'R' | 'A' | 'A+' | 'AA' | 'AAA'
  age: number
  rank: number            // Organization rank
  isTop100?: boolean      // MLB Top 100 prospect
  eta?: string            // Expected arrival year, e.g., "2026"
  headshot_url?: string
  team_key?: string       // Team abbreviation
  team_name?: string
  stats?: Record<string, number | string | null>
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
  const rankPrefix = prospect.rank ? `#${prospect.rank} ` : ''
  const primary = `${rankPrefix}${prospect.name}`
  const secondary = `${prospect.level} - ${prospect.position} - Age ${prospect.age}`
  return { primary, secondary }
}
