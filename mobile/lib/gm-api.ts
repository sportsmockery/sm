/**
 * GM Trade Simulator API Client
 */

import { API_BASE_URL } from './config'
import { api } from './api'
import type {
  PlayerData,
  OpponentTeam,
  GradeResult,
  Trade,
  LeaderboardEntry,
  GMSession,
  CapData,
  DraftPick,
  ChicagoTeam,
  ValidationResult,
  TeamFitResult,
  UserPreferences,
  ScenarioType,
  ScenarioResult,
  SimulationResult,
  AnalyticsResult,
  MLBProspect,
  SeasonSimulationResult,
  UserScoreResponse,
} from './gm-types'

const BASE = API_BASE_URL

// Custom error class for auth required
export class AuthRequiredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthRequiredError'
  }
}

async function gmFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Get auth token from the shared api client (set by AuthProvider)
  const token = api.getAuthToken()
  if (!token) {
    console.warn('[GM API] No auth token available - user may not be logged in')
  }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Client': 'sportsmockery-mobile',
    ...(options?.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    // Check for auth required error
    if (res.status === 401 || err.code === 'AUTH_REQUIRED') {
      throw new AuthRequiredError(err.error || 'Please sign in to use the GM Trade Simulator')
    }
    throw new Error(err.error || `API error: ${res.status}`)
  }
  return res.json()
}

export const gmApi = {
  async getRoster(team: string, sport?: string, search?: string, position?: string) {
    const params = new URLSearchParams()
    if (sport) {
      params.set('team_key', team)
      params.set('sport', sport)
    } else {
      params.set('team', team)
    }
    if (search) params.set('search', search)
    if (position) params.set('position', position)
    return gmFetch<{ players: PlayerData[]; sport: string }>(`/api/gm/roster?${params}`)
  },

  async getTeams(sport?: string, search?: string, excludeTeam?: string) {
    const params = new URLSearchParams()
    if (sport) params.set('sport', sport)
    if (search) params.set('search', search)
    if (excludeTeam) params.set('exclude', excludeTeam)
    return gmFetch<{ teams: OpponentTeam[] }>(`/api/gm/teams?${params}`)
  },

  async gradeTrade(payload: {
    chicago_team: ChicagoTeam
    trade_partner: string
    partner_team_key: string
    players_sent: PlayerData[]
    players_received: PlayerData[]
    draft_picks_sent?: DraftPick[]
    draft_picks_received?: DraftPick[]
    prospects_sent?: MLBProspect[]
    prospects_received?: MLBProspect[]
    session_id?: string
  }) {
    return gmFetch<GradeResult>('/api/gm/grade', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async getTrades(page = 1, limit = 50, sessionId?: string) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
    if (sessionId) params.set('session_id', sessionId)
    return gmFetch<{ trades: Trade[]; total: number; page: number; total_pages: number }>(
      `/api/gm/trades?${params}`
    )
  },

  async getLeaderboard(team?: string) {
    const params = new URLSearchParams()
    if (team) params.set('team', team)
    return gmFetch<{ leaderboard: LeaderboardEntry[] }>(`/api/gm/leaderboard?${params}`)
  },

  async getSessions() {
    return gmFetch<{ sessions: GMSession[] }>('/api/gm/sessions')
  },

  async createSession(chicagoTeam: string, sessionName?: string) {
    return gmFetch<{ session: GMSession }>('/api/gm/sessions', {
      method: 'POST',
      body: JSON.stringify({ chicago_team: chicagoTeam, session_name: sessionName }),
    })
  },

  async getCap(teamKey: string, sport: string) {
    const params = new URLSearchParams({ team_key: teamKey, sport })
    return gmFetch<{ cap: CapData | null }>(`/api/gm/cap?${params}`)
  },

  async getProspects(teamKey: string, minGrade?: string) {
    const params = new URLSearchParams({ team_key: teamKey })
    if (minGrade) params.set('min_grade', minGrade)
    return gmFetch<{ prospects: MLBProspect[]; team_key: string }>(`/api/gm/prospects?${params}`)
  },

  // GM V2 Endpoints

  async validateTrade(payload: {
    chicago_team: ChicagoTeam
    trade_partner: string
    partner_team_key: string
    players_sent: PlayerData[]
    players_received: PlayerData[]
    draft_picks_sent?: DraftPick[]
    draft_picks_received?: DraftPick[]
  }) {
    return gmFetch<ValidationResult>('/api/gm/validate', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async getTeamFit(params: {
    player_name: string
    player_espn_id?: string
    target_team: string
    sport: string
  }) {
    const queryParams = new URLSearchParams({
      player_name: params.player_name,
      target_team: params.target_team,
      sport: params.sport,
    })
    if (params.player_espn_id) {
      queryParams.set('player_espn_id', params.player_espn_id)
    }
    return gmFetch<TeamFitResult>(`/api/gm/fit?${queryParams}`)
  },

  async getPreferences() {
    return gmFetch<{ preferences: UserPreferences }>('/api/gm/preferences')
  },

  async updatePreferences(preferences: Partial<UserPreferences>) {
    return gmFetch<{ preferences: UserPreferences }>('/api/gm/preferences', {
      method: 'POST',
      body: JSON.stringify(preferences),
    })
  },

  async runScenario(payload: {
    trade_id: string
    scenario_type: ScenarioType
    parameters: Record<string, any>
  }) {
    return gmFetch<ScenarioResult>('/api/gm/scenarios', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async runSimulation(payload: {
    trade_id: string
    simulations?: number
    factors?: {
      player_variance?: number
      market_volatility?: number
      injury_risk?: number
    }
  }) {
    return gmFetch<SimulationResult>('/api/gm/simulate', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async getAnalytics() {
    return gmFetch<AnalyticsResult>('/api/gm/analytics')
  },

  async simulateSeason(params: {
    sessionId: string
    sport: string
    teamKey: string
    seasonYear?: number
  }) {
    return gmFetch<SeasonSimulationResult>('/api/gm/sim/season', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: params.sessionId,
        sport: params.sport,
        teamKey: params.teamKey,
        seasonYear: params.seasonYear || 2026,
      }),
    })
  },

  async exportTrade(params: {
    trade_id?: string
    format: 'json' | 'csv' | 'pdf'
    all?: boolean
  }) {
    const queryParams = new URLSearchParams({ format: params.format })
    if (params.trade_id) queryParams.set('trade_id', params.trade_id)
    if (params.all) queryParams.set('all', 'true')
    return gmFetch<{ url?: string; data?: any }>(`/api/gm/export?${queryParams}`)
  },

  // User Score endpoints
  async getUserScore() {
    return gmFetch<UserScoreResponse>('/api/gm/user-score')
  },

  async setBestMockDraft(mockId: string) {
    return gmFetch<{ success: boolean }>('/api/gm/user-score', {
      method: 'POST',
      body: JSON.stringify({ mock_id: mockId }),
    })
  },
}
