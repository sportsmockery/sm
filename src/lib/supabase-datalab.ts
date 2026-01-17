import { createClient } from '@supabase/supabase-js'

// Datalab Supabase instance (separate from main sm database)
// Contains bears_* tables with game data, player stats, schedules, etc.
const DATALAB_URL = process.env.DATALAB_SUPABASE_URL || ''
const DATALAB_ANON_KEY = process.env.DATALAB_SUPABASE_ANON_KEY || ''
const DATALAB_SERVICE_KEY = process.env.DATALAB_SUPABASE_SERVICE_ROLE_KEY || ''

// Public client for read-only operations
export const datalabClient = DATALAB_URL && DATALAB_ANON_KEY
  ? createClient(DATALAB_URL, DATALAB_ANON_KEY)
  : null

// Admin client for service-level operations
export const datalabAdmin = DATALAB_URL && DATALAB_SERVICE_KEY
  ? createClient(DATALAB_URL, DATALAB_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

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
  player_id: number
  full_name: string
  first_name: string
  last_name: string
  position: string
  position_group: string | null
  jersey_number: number | null
  height: string | null
  weight: number | null
  age: number | null
  college: string | null
  experience: number | null
  status: string | null
  headshot_url: string | null
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
