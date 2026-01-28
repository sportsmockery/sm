/**
 * GM Trade Simulator Types
 */

export interface PlayerData {
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
  stats: Record<string, any>
  status?: string
  base_salary?: number | null
  cap_hit?: number | null
  contract_years?: number | null
  contract_signed_year?: number | null
  is_rookie_deal?: boolean | null
}

export interface OpponentTeam {
  team_key: string
  team_name: string
  abbreviation: string
  city: string
  logo_url: string
  primary_color: string
  secondary_color: string
  conference: string
  division: string
  sport: 'nfl' | 'nba' | 'nhl' | 'mlb'
}

export interface DraftPick {
  year: number
  round: number
  condition?: string
}

export interface GradeResult {
  grade: number
  reasoning: string
  status: 'accepted' | 'rejected'
  is_dangerous: boolean
  trade_id: string
  shared_code: string
  trade_summary?: string
  improvement_score?: number
  breakdown?: {
    talent_balance: number
    contract_value: number
    team_fit: number
    future_assets: number
  }
  cap_analysis?: string
}

export interface Trade {
  id: string
  chicago_team: string
  sport: string
  trade_partner: string
  players_sent: any[]
  players_received: any[]
  draft_picks_sent: DraftPick[]
  draft_picks_received: DraftPick[]
  grade: number
  grade_reasoning: string
  status: 'accepted' | 'rejected'
  is_dangerous: boolean
  improvement_score: number
  trade_summary: string
  shared_code: string
  partner_team_key: string | null
  partner_team_logo: string | null
  chicago_team_logo: string | null
  talent_balance: number
  contract_value: number
  team_fit: number
  future_assets: number
  created_at: string
}

export interface LeaderboardEntry {
  user_id: string
  user_email: string
  total_score: number
  trades_count: number
  avg_grade: number
  best_grade: number
  worst_grade: number
  accepted_count: number
  rejected_count: number
  dangerous_count: number
  favorite_team: string
  streak: number
  updated_at: string
}

export interface GMSession {
  id: string
  session_name: string
  chicago_team: string
  sport: string
  is_active: boolean
  num_trades: number
  num_approved: number
  num_dangerous: number
  num_failed: number
  total_improvement: number
  created_at: string
  updated_at: string
}

export interface CapData {
  total_cap: number
  cap_used: number
  cap_available: number
  dead_money: number
}

export type ChicagoTeam = 'bears' | 'bulls' | 'blackhawks' | 'cubs' | 'whitesox'
export type Sport = 'nfl' | 'nba' | 'nhl' | 'mlb'

export const CHICAGO_TEAM_SPORT: Record<ChicagoTeam, Sport> = {
  bears: 'nfl',
  bulls: 'nba',
  blackhawks: 'nhl',
  cubs: 'mlb',
  whitesox: 'mlb',
}
