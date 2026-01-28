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
} from './gm-types'

const BASE = API_BASE_URL

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

  async getTeams(sport?: string, search?: string) {
    const params = new URLSearchParams()
    if (sport) params.set('sport', sport)
    if (search) params.set('search', search)
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
}
