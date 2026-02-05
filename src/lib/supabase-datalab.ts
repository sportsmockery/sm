import { createClient } from '@supabase/supabase-js'

// Datalab Supabase instance (separate from main sm database)
// Contains {team}_* tables with game data, player stats, schedules, etc.
// Teams: bears, bulls, blackhawks, cubs, whitesox

const DATALAB_URL = 'https://siwoqfzzcxmngnseyzpv.supabase.co'
const DATALAB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd29xZnp6Y3htbmduc2V5enB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NDk0ODAsImV4cCI6MjA4MzIyNTQ4MH0.PzeJ6OG2ofjLWSpJ2UmI-1aXVrHnh3ar6eTgph4uJgc'

// Connection pooling configuration for high-traffic scenarios
// Supabase's Supavisor pooler handles connection management automatically
// Set DATALAB_POOLER_URL in env to use dedicated pooler endpoint if needed
const DATALAB_POOLER_URL = process.env.DATALAB_POOLER_URL || DATALAB_URL

// Client options optimized for scalability
const scalableClientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-connection-pool': 'true',
    },
  },
}

// Public client for read-only operations (used by all team data layers)
// Uses pooler URL for better connection management at scale
export const datalabClient = createClient(DATALAB_POOLER_URL, DATALAB_ANON_KEY, scalableClientOptions)

// Admin client - uses service key from env if available, falls back to anon key
const DATALAB_SERVICE_KEY = process.env.DATALAB_SUPABASE_SERVICE_ROLE_KEY || DATALAB_ANON_KEY
export const datalabAdmin = createClient(DATALAB_POOLER_URL, DATALAB_SERVICE_KEY, {
  ...scalableClientOptions,
})

// Type definitions for Bears data tables

export interface BearsGame {
  id: number
  game_id: string
  external_id: string
  game_date: string
  game_time: string | null
  season: number
  week: number
  game_type: 'REG' | 'POST' | 'PRE'
  opponent: string
  is_bears_home: boolean
  bears_score: number | null
  opponent_score: number | null
  bears_win: boolean | null
  stadium: string | null
  roof: string | null
  temp_f: number | null
  wind_mph: number | null
  is_playoff: boolean
  verified: boolean
}

export interface BearsPlayer {
  id: number
  espn_id: string | null
  name: string
  first_name: string | null
  last_name: string | null
  position: string
  jersey_number: number | null
  height_inches: number | null
  weight_lbs: number | null
  birth_date: string | null
  college: string | null
  is_active: boolean
  headshot_url: string | null
  validation: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface BearsPlayerGameStats {
  id: number
  game_id: string
  player_id: number
  team_key: string
  opp_key: string
  pass_att: number | null
  pass_cmp: number | null
  pass_yds: number | null
  pass_td: number | null
  pass_int: number | null
  sacks: number | null
  rush_att: number | null
  rush_yds: number | null
  rush_td: number | null
  rec_tgt: number | null
  rec: number | null
  rec_yds: number | null
  rec_td: number | null
  fumbles: number | null
  created_at: string
}

export interface BearsPlayerSeasonStats {
  id: number
  player_id: number
  season: number
  games_played: number
  pass_att: number | null
  pass_cmp: number | null
  pass_yds: number | null
  pass_td: number | null
  pass_int: number | null
  rush_att: number | null
  rush_yds: number | null
  rush_td: number | null
  rec: number | null
  rec_yds: number | null
  rec_td: number | null
  fumbles: number | null
}

export interface BearsTeamSeasonStats {
  id: number
  season: number
  wins: number
  losses: number
  ties: number
  points_for: number
  points_against: number
  yards_for: number
  yards_against: number
  turnovers_committed: number
  turnovers_forced: number
}

export interface BearsWeather {
  game_id: string
  game_date: string
  temp_f: number | null
  wind_mph: number | null
  humidity_pct: number | null
  weather_summary: string | null
  surface: string | null
}

// =============================================================================
// BULLS (NBA) Type Definitions
// =============================================================================

export interface BullsGame {
  id: number
  game_id: string
  game_date: string
  game_time: string | null
  season: number
  opponent: string
  opponent_full_name: string | null
  is_bulls_home: boolean
  bulls_score: number | null
  opponent_score: number | null
  bulls_win: boolean | null
  arena: string | null
  broadcast: string | null
  game_type: 'REG' | 'POST' | 'PRE'
}

export interface BullsPlayer {
  id: number
  espn_id: string | null
  name: string
  first_name: string | null
  last_name: string | null
  position: string
  jersey_number: number | null
  height_inches: number | null
  weight_lbs: number | null
  birth_date: string | null
  college: string | null
  is_active: boolean
  headshot_url: string | null
}

export interface BullsPlayerGameStats {
  id: number
  game_id: string
  player_id: number
  minutes: number | null
  points: number | null
  rebounds: number | null
  assists: number | null
  steals: number | null
  blocks: number | null
  turnovers: number | null
  fg_made: number | null
  fg_attempted: number | null
  three_made: number | null
  three_attempted: number | null
  ft_made: number | null
  ft_attempted: number | null
}

// =============================================================================
// BLACKHAWKS (NHL) Type Definitions
// =============================================================================

export interface BlackhawksGame {
  id: number
  game_id: string
  game_date: string
  game_time: string | null
  season: number
  opponent: string
  opponent_full_name: string | null
  is_blackhawks_home: boolean
  blackhawks_score: number | null
  opponent_score: number | null
  blackhawks_win: boolean | null
  arena: string | null
  broadcast: string | null
  game_type: 'REG' | 'POST' | 'PRE'
  overtime: boolean | null
  shootout: boolean | null
}

export interface BlackhawksPlayer {
  id: number
  espn_id: string | null
  name: string
  first_name: string | null
  last_name: string | null
  position: string
  jersey_number: number | null
  height_inches: number | null
  weight_lbs: number | null
  birth_date: string | null
  birth_country: string | null
  is_active: boolean
  headshot_url: string | null
}

export interface BlackhawksPlayerGameStats {
  id: number
  game_id: string
  player_id: number
  goals: number | null
  assists: number | null
  points: number | null
  plus_minus: number | null
  pim: number | null
  shots: number | null
  hits: number | null
  blocked_shots: number | null
  toi: string | null
  // Goalie stats
  saves: number | null
  goals_against: number | null
  shots_against: number | null
}

// =============================================================================
// CUBS (MLB) Type Definitions
// =============================================================================

export interface CubsGame {
  id: number
  game_id: string
  game_date: string
  game_time: string | null
  season: number
  opponent: string
  opponent_full_name: string | null
  is_cubs_home: boolean
  cubs_score: number | null
  opponent_score: number | null
  cubs_win: boolean | null
  stadium: string | null
  broadcast: string | null
  game_type: 'REG' | 'POST' | 'PRE'
  innings: number | null
}

export interface CubsPlayer {
  id: number
  espn_id: string | null
  name: string
  first_name: string | null
  last_name: string | null
  position: string
  jersey_number: number | null
  height_inches: number | null
  weight_lbs: number | null
  birth_date: string | null
  bats: string | null
  throws: string | null
  is_active: boolean
  headshot_url: string | null
}

export interface CubsPlayerGameStats {
  id: number
  game_id: string
  player_id: number
  // Batting
  at_bats: number | null
  runs: number | null
  hits: number | null
  doubles: number | null
  triples: number | null
  home_runs: number | null
  rbi: number | null
  walks: number | null
  strikeouts: number | null
  stolen_bases: number | null
  // Pitching
  innings_pitched: number | null
  hits_allowed: number | null
  runs_allowed: number | null
  earned_runs: number | null
  walks_allowed: number | null
  strikeouts_pitched: number | null
  pitches: number | null
  win: boolean | null
  loss: boolean | null
  save: boolean | null
}

// =============================================================================
// WHITE SOX (MLB) Type Definitions
// =============================================================================

export interface WhiteSoxGame {
  id: number
  game_id: string
  game_date: string
  game_time: string | null
  season: number
  opponent: string
  opponent_full_name: string | null
  is_whitesox_home: boolean
  whitesox_score: number | null
  opponent_score: number | null
  whitesox_win: boolean | null
  stadium: string | null
  broadcast: string | null
  game_type: 'REG' | 'POST' | 'PRE'
  innings: number | null
}

export interface WhiteSoxPlayer {
  id: number
  espn_id: string | null
  name: string
  first_name: string | null
  last_name: string | null
  position: string
  jersey_number: number | null
  height_inches: number | null
  weight_lbs: number | null
  birth_date: string | null
  bats: string | null
  throws: string | null
  is_active: boolean
  headshot_url: string | null
}

export interface WhiteSoxPlayerGameStats {
  id: number
  game_id: string
  player_id: number
  // Batting
  at_bats: number | null
  runs: number | null
  hits: number | null
  doubles: number | null
  triples: number | null
  home_runs: number | null
  rbi: number | null
  walks: number | null
  strikeouts: number | null
  stolen_bases: number | null
  // Pitching
  innings_pitched: number | null
  hits_allowed: number | null
  runs_allowed: number | null
  earned_runs: number | null
  walks_allowed: number | null
  strikeouts_pitched: number | null
  pitches: number | null
  win: boolean | null
  loss: boolean | null
  save: boolean | null
}
