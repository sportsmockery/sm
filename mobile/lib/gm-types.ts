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

// GM V2 Types

export type PlayerTrend = 'hot' | 'rising' | 'stable' | 'declining' | 'cold'

export interface ValidationResult {
  valid: boolean
  status: 'green' | 'yellow' | 'red'
  issues: Array<{
    type: 'error' | 'warning' | 'info'
    message: string
  }>
  can_proceed: boolean
}

export interface TeamFitResult {
  player_name: string
  player_espn_id?: string
  target_team: string
  overall_fit: number
  breakdown: {
    positional_need: number
    age_fit: number
    cap_fit: number
    scheme_fit: number
  }
  insights: {
    positional_need: string
    age_fit: string
    cap_fit: string
    scheme_fit: string
  }
  recommendation: string
  comparable_acquisitions?: Array<{
    player_name: string
    team: string
    fit_score: number
    outcome: 'success' | 'neutral' | 'failure'
  }>
}

export interface UserPreferences {
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  team_phase: 'rebuilding' | 'competing' | 'contending'
  trade_style: 'balanced' | 'win_now' | 'future_focused'
  favorite_positions: string[]
  avoid_positions: string[]
  max_age_preference: number | null
  min_contract_years: number | null
}

export type ScenarioType =
  | 'player_improvement'
  | 'player_decline'
  | 'injury_impact'
  | 'add_pick'
  | 'remove_player'
  | 'age_progression'

export interface ScenarioResult {
  original_grade: number
  modified_grade: number
  grade_delta: number
  scenario_type: ScenarioType
  description: string
  modified_reasoning: string
  impact_breakdown: {
    talent_balance_delta: number
    contract_value_delta: number
    team_fit_delta: number
    future_assets_delta: number
  }
}

export interface SimulationResult {
  simulations_run: number
  mean_outcome: number
  median_outcome: number
  std_deviation: number
  percentiles: {
    p10: number
    p25: number
    p50: number
    p75: number
    p90: number
  }
  distribution: Array<{
    bucket: string
    count: number
    percentage: number
  }>
  risk_analysis: {
    downside_risk: number
    upside_potential: number
    bust_probability: number
    success_probability: number
  }
}

export interface AnalyticsResult {
  total_trades: number
  accepted_trades: number
  rejected_trades: number
  dangerous_trades: number
  average_grade: number
  highest_grade: number
  lowest_grade: number
  total_gm_score: number
  grade_distribution: Array<{
    bucket: string
    count: number
    percentage: number
  }>
  trading_partners: Array<{
    team_name: string
    team_key: string
    trade_count: number
    avg_grade: number
  }>
  position_analysis: Array<{
    position: string
    sent_count: number
    received_count: number
    net_value: number
  }>
  activity_timeline: Array<{
    date: string
    trade_count: number
    avg_grade: number
  }>
  chicago_teams: Array<{
    team: string
    trade_count: number
    avg_grade: number
    accepted_rate: number
  }>
}
