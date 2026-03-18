// =============================================
// Dashboard Intelligence API Contract Types
// Version: 1.0.0
// =============================================

// =============================================
// META
// =============================================
export interface DataFreshness {
  scores: string;
  injuries: string;
  standings: string;
  player_stats: string;
  advanced_metrics: string;
}

export interface Meta {
  timestamp: string;
  timestamp_central: string;
  refresh_interval: number;
  version: string;
  schema_version: string;
  data_freshness: DataFreshness;
  request_id: string;
  cache_hit: boolean;
  live_mode: boolean;
}

// =============================================
// CITY
// =============================================
export type Direction = 'up' | 'down' | 'flat';

export interface CityMood {
  label: string;
  emoji: string;
  score: number;
  direction: Direction;
}

export interface NextEvent {
  team: string;
  team_name: string;
  opponent: string;
  datetime: string;
  datetime_display: string;
  venue: string;
  home: boolean;
  importance_score: number;
}

export interface CityRecord {
  wins: number;
  losses: number;
  win_pct: number;
}

export interface City {
  record: CityRecord;
  teams_active: number;
  teams_above_500: number;
  mood: CityMood;
  summary: string;
  hottest_team: string;
  coldest_team: string;
  biggest_change: string;
  next_event: NextEvent;
}

// =============================================
// TEAMS
// =============================================
export type Sport = 'NFL' | 'NBA' | 'MLB' | 'NHL';
export type SeasonPhase = 'preseason' | 'regular_season' | 'playoffs' | 'offseason';
export type StreakType = 'W' | 'L';
export type TrendDirection = 'up' | 'down' | 'flat';
export type TrendMagnitude = 'strong' | 'moderate' | 'mild';
export type IntelligenceTier = 'green' | 'yellow' | 'red';
export type AvailabilityTier = 'healthy' | 'caution' | 'depleted' | 'crisis';

export interface TeamRecord {
  wins: number;
  losses: number;
  otl: number | null;
  win_pct: number;
  games_played: number;
  games_remaining: number;
  record_display: string;
}

export interface Streak {
  type: StreakType;
  count: number;
  display: string;
}

export interface Recent {
  last_5: string;
  last_10: string;
  streak: Streak;
  trend_direction: TrendDirection;
  trend_magnitude: TrendMagnitude;
}

export interface NextGame {
  game_id: string;
  opponent: string;
  opponent_key: string;
  datetime: string;
  datetime_display: string;
  home: boolean;
  venue: string;
  importance_score: number;
  importance_label: string;
}

export interface TeamStatus {
  phase: SeasonPhase;
  is_live: boolean;
  next_game: NextGame | null;
}

export interface PerformanceUnit {
  rating: number;
  rating_display: string;
  rank: number;
  rank_display: string;
  trend: TrendDirection;
  trend_delta: number;
}

export interface Performance {
  offense: PerformanceUnit;
  defense: PerformanceUnit;
}

export interface Intelligence {
  momentum_score: number;
  pressure_index: number;
  collapse_risk: number;
  availability_score: number;
  consistency_score: number;
  intelligence_tier: IntelligenceTier;
}

export interface Health {
  injuries_total: number;
  key_players_out: string[];
  key_players_questionable: string[];
  availability_tier: AvailabilityTier;
  availability_label: string;
}

export interface Insight {
  headline: string;
  summary: string;
}

export interface UnitDetail {
  label: string;
  rating: number;
  rank: number;
  trend: TrendDirection;
  key_contributors: string[];
}

export interface Units {
  offense: UnitDetail;
  defense: UnitDetail;
  special?: UnitDetail;
}

export interface PlayerEntry {
  player_id: string;
  name: string;
  position: string;
  stat_line: string;
  trend: TrendDirection;
  performance_score: number;
  note?: string;
}

export interface TeamLeaders {
  top_performers: PlayerEntry[];
  struggling_players: PlayerEntry[];
}

// intelligence_extended — backend-computed narrative intelligence
export interface IntelligenceDriver {
  key: string;
  label: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  evidence: string;
}

export interface TrendExplanation {
  summary: string;
  direction: TrendDirection;
  reasons: string[];
}

export interface WhatItMeans {
  short_term: string;
  medium_term: string;
}

export interface Strategy {
  phase_focus: string;
  priorities: string[];
  opportunities: string[];
  risks: string[];
}

export interface WatchItem {
  label: string;
  context: string;
}

export interface EventAnalysis {
  event: string;
  before: string;
  after: string;
  impact: string;
}

export interface IntelligenceExtended {
  drivers: IntelligenceDriver[];
  trend_explanation: TrendExplanation;
  what_it_means: WhatItMeans;
  strategy: Strategy;
  watch_items: WatchItem[];
  event_analysis: EventAnalysis | null;
  sport_context: string;
  snapshot_delta: Record<string, unknown> | null;
}

// Top-level team fields (some may not be populated yet in snapshot)
export interface MetricRef {
  metric: string;
  value: number | string;
  context: string;
}

export interface Team {
  team_key: string;
  team_name: string;
  sport: Sport;
  league: string;
  logo_url: string;
  color_primary: string;
  color_secondary: string;
  season: string;
  in_season: boolean;
  record: TeamRecord;
  recent: Recent;
  status: TeamStatus;
  performance: Performance;
  intelligence: Intelligence;
  health: Health;
  insight: Insight;
  units: Units;
  leaders: TeamLeaders;
  // Extended intelligence fields
  intelligence_extended?: IntelligenceExtended;
  executive_take?: string;
  dashboard_priority?: number;
  confidence?: number;
  metric_refs?: MetricRef[];
}

// =============================================
// LIVE
// =============================================
export type SegmentType = 'quarter' | 'period' | 'inning';
export type MomentumDirection = 'team' | 'opponent' | 'neutral';
export type EventImpact = 'low' | 'medium' | 'high';

export interface GameState {
  segment_type: SegmentType;
  segment_number: number;
  segment_label: string;
  time_remaining: string;
  time_remaining_seconds: number;
  is_halftime: boolean;
  is_overtime: boolean;
}

export interface GameMomentum {
  score: number;
  direction: MomentumDirection;
  swing_event: string;
  last_updated: string;
}

export interface LivePerformer {
  player_id: string;
  name: string;
  stat_line: string;
  is_home_team: boolean;
}

export interface KeyEvent {
  event_id: string;
  time: string;
  description: string;
  impact: EventImpact;
  team: string;
}

export interface LiveGame {
  game_id: string;
  team: string;
  team_name: string;
  opponent: string;
  opponent_key: string;
  venue: string;
  score: {
    team: number;
    opponent: number;
  };
  state: GameState;
  momentum: GameMomentum;
  top_performers: LivePerformer[];
  key_events: KeyEvent[];
}

export interface Live {
  is_active: boolean;
  game_count: number;
  games: LiveGame[];
}

// Response from /api/dashboard/live (reads dashboard_live_snapshot table)
// Extends Live with metadata fields written by ingest-live
export interface LiveSnapshot extends Live {
  updated_at?: string;
  computed_at?: string;
  ttl_seconds?: number;
  source?: string;
}

// =============================================
// TRENDS
// =============================================
export interface TrendItem {
  team: string;
  team_name: string;
  metric: string;
  metric_label: string;
  previous_value: number;
  current_value: number;
  change_value: number;
  change_pct: number;
  period: string;
  summary: string;
}

export interface StreakItem {
  team: string;
  team_name: string;
  metric: string;
  metric_label: string;
  streak_value: number;
  streak_type: StreakType;
  summary: string;
}

export interface InjuryItem {
  team: string;
  team_name: string;
  player: string;
  player_id: string;
  status: 'out' | 'questionable' | 'doubtful' | 'day-to-day';
  impact: 'low' | 'medium' | 'high';
  availability_score_delta: number;
  summary: string;
}

export interface VolatilityItem {
  team: string;
  team_name: string;
  metric: string;
  metric_label: string;
  volatility_score: number;
  summary: string;
}

export interface Trends {
  risers: TrendItem[];
  fallers: TrendItem[];
  streaks: StreakItem[];
  injuries: InjuryItem[];
  volatility: VolatilityItem[];
}

// =============================================
// LEADERS
// =============================================
export interface LeaderPlayer {
  player_id: string;
  name: string;
  team: string;
  team_name: string;
  sport: Sport;
  position: string;
  headshot_url: string;
  primary_stat: string;
  secondary_stats: string[];
  performance_score: number;
  trend: TrendDirection;
  headline: string;
}

export interface UnitLeader {
  team: string;
  team_name: string;
  sport: Sport;
  unit_label: string;
  rating: number;
  rank: number;
  rank_display: string;
  trend: TrendDirection;
  summary: string;
}

export interface Leaders {
  players: {
    top: LeaderPlayer[];
    struggling: LeaderPlayer[];
  };
  units: {
    best: UnitLeader[];
    worst: UnitLeader[];
  };
}

// =============================================
// ROOT RESPONSE
// =============================================
export interface DashboardIntelligenceResponse {
  meta: Meta;
  city: City;
  teams: Team[];
  live: Live;
  trends: Trends;
  leaders: Leaders;
}
