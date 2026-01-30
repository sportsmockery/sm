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
  rejection_reason?: string
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

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  player_name?: string
}

export interface ValidationResult {
  status: 'valid' | 'warning' | 'invalid'
  issues: ValidationIssue[]
  cap_impact?: {
    chicago_delta: number
    partner_delta: number
    chicago_over_cap: boolean
    partner_over_cap: boolean
  }
  roster_impact?: {
    chicago_roster_size_after: number
    partner_roster_size_after: number
    position_conflicts: string[]
  }
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
  favorite_team: string | null
  team_phase: 'rebuilding' | 'contending' | 'win_now' | 'auto'
  preferred_trade_style: 'balanced' | 'star_hunting' | 'depth_building' | 'draft_focused'
  cap_flexibility_priority: 'low' | 'medium' | 'high'
  age_preference: 'young' | 'prime' | 'veteran' | 'any'
}

export type ScenarioType =
  | 'player_improvement'
  | 'player_decline'
  | 'injury_impact'
  | 'add_pick'
  | 'remove_player'
  | 'age_progression'

export interface ScenarioResult {
  scenario_type: ScenarioType
  description: string
  original_grade: number
  adjusted_grade: number
  grade_delta: number
  reasoning: string
  breakdown_changes?: {
    talent_balance_delta: number
    contract_value_delta: number
    team_fit_delta: number
    future_assets_delta: number
  }
  probability?: number
}

export interface SimulationResult {
  num_simulations: number
  original_grade: number
  mean_grade: number
  median_grade: number
  std_deviation: number
  percentiles: {
    p5: number
    p10: number
    p25: number
    p50: number
    p75: number
    p90: number
    p95: number
  }
  distribution: Array<{
    grade_bucket: number
    count: number
    percentage: number
  }>
  risk_analysis: {
    downside_risk: number
    upside_potential: number
    variance_band: [number, number]
  }
  key_factors: Array<{
    factor: string
    impact: 'positive' | 'negative' | 'neutral'
    magnitude: number
    description: string
  }>
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
