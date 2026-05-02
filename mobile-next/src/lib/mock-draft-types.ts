/**
 * Mock Draft Types
 */

export interface Prospect {
  id: string
  name: string
  position: string
  school: string
  height?: string
  weight?: number
  age?: number
  headshot_url?: string
  projected_round?: number
  projected_pick?: number
  grade?: number
  tier?: number
  strengths?: string[]
  weaknesses?: string[]
  comparison?: string
  summary?: string
}

export interface DraftPick {
  pick_number: number
  round: number
  team_key: string
  team_name: string
  team_logo?: string
  team_color?: string
  is_user_pick: boolean
  selected_prospect?: {
    id: string
    name: string
    position: string
    school?: string
  } | null
  is_current?: boolean
}

export interface MockDraft {
  id: string
  chicago_team: ChicagoTeam
  sport: Sport
  draft_year: number
  status: 'in_progress' | 'completed' | 'graded'
  current_pick: number
  total_picks: number
  picks: DraftPick[]
  user_picks: number[]
  created_at: string
}

export interface DraftGrade {
  overall_grade: number
  letter_grade: string
  analysis: string
  pick_grades: Array<{
    pick_number: number
    prospect_name: string
    grade: number
    analysis: string
  }>
  strengths: string[]
  weaknesses: string[]
}

export interface DraftHistoryItem {
  id: string
  chicago_team: string
  sport: string
  draft_year: number
  status: string
  grade?: number
  letter_grade?: string
  created_at: string
  picks_made: number
}

export interface TeamEligibility {
  sport: string
  draft_year: number
  team_key: string
  team_name: string
  season_status: 'in_season' | 'eliminated' | 'champion' | 'offseason'
  eligible: boolean
  reason: string
  mock_draft_window_status: 'open' | 'closed' | 'completed' | 'not_yet_open'
  days_until_draft: number | null
  draft_date: string | null
}

export type ChicagoTeam = 'bears' | 'bulls' | 'blackhawks' | 'cubs' | 'whitesox'
export type Sport = 'nfl' | 'nba' | 'nhl' | 'mlb'

export const CHICAGO_TEAM_INFO: Record<ChicagoTeam, {
  name: string
  sport: Sport
  color: string
  logo: string
  teamKey: string
}> = {
  bears: {
    name: 'Chicago Bears',
    sport: 'nfl',
    color: '#0B162A',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
    teamKey: 'chi',
  },
  bulls: {
    name: 'Chicago Bulls',
    sport: 'nba',
    color: '#CE1141',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    teamKey: 'chi',
  },
  blackhawks: {
    name: 'Chicago Blackhawks',
    sport: 'nhl',
    color: '#CF0A2C',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png',
    teamKey: 'chi',
  },
  cubs: {
    name: 'Chicago Cubs',
    sport: 'mlb',
    color: '#0E3386',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    teamKey: 'chc',
  },
  whitesox: {
    name: 'Chicago White Sox',
    sport: 'mlb',
    color: '#27251F',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
    teamKey: 'chw',
  },
}
