'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

const POLL_INTERVAL = 10000
const MAX_RETRIES = 3

export interface PlayerStats {
  player_id: string
  game_id: string
  team_id: string
  is_home_team: boolean
  full_name: string
  jersey_number: string | null
  position: string | null
  side: string | null
  // NFL
  nfl_pass_attempts?: number
  nfl_pass_completions?: number
  nfl_passing_yards?: number
  nfl_passing_tds?: number
  nfl_interceptions?: number
  nfl_rush_attempts?: number
  nfl_rushing_yards?: number
  nfl_rushing_tds?: number
  nfl_receptions?: number
  nfl_receiving_yards?: number
  nfl_receiving_tds?: number
  nfl_tackles?: number
  nfl_sacks?: number
  // NBA
  nba_minutes?: string
  nba_points?: number
  nba_fg_made?: number
  nba_fg_att?: number
  nba_3p_made?: number
  nba_3p_att?: number
  nba_ft_made?: number
  nba_ft_att?: number
  nba_reb_total?: number
  nba_assists?: number
  nba_steals?: number
  nba_blocks?: number
  nba_turnovers?: number
  nba_plus_minus?: number
  // NHL
  nhl_toi?: string
  nhl_goals?: number
  nhl_assists?: number
  nhl_points?: number
  nhl_shots?: number
  nhl_plus_minus?: number
  nhl_hits?: number
  nhl_blocks?: number
  // MLB
  mlb_ab?: number
  mlb_hits?: number
  mlb_home_runs?: number
  mlb_rbi?: number
  mlb_bb?: number
  mlb_so?: number
  mlb_avg?: number
  mlb_ip?: number
  mlb_h_allowed?: number
  mlb_er?: number
  mlb_k?: number
  mlb_era?: number
}

export interface Play {
  play_id: string
  sequence: number
  game_clock: string
  period: number
  period_label: string
  description: string
  play_type: string
  team_id: string | null
  score_home: number
  score_away: number
}

export interface TeamData {
  team_id: string
  name: string
  abbr: string
  logo_url: string
  score: number
  timeouts: number | null
  is_chicago: boolean
}

export interface GameData {
  game_id: string
  sport: 'nfl' | 'nba' | 'nhl' | 'mlb'
  season: number
  game_date: string
  game_start_time?: string
  status: string
  home_team: TeamData
  away_team: TeamData
  period: number | null
  period_label: string | null
  clock: string | null
  venue: {
    name: string | null
    city: string | null
    state: string | null
  }
  weather: {
    temperature: number | null
    condition: string | null
    wind_speed: number | null
  }
  broadcast: {
    network: string | null
    announcers: string | null
  }
  odds: {
    win_probability_home: number | null
    win_probability_away: number | null
    spread_favorite_team_id: string | null
    spread_points: number | null
    moneyline_home: string | null
    moneyline_away: string | null
    over_under: number | null
  }
  players: PlayerStats[]
  play_by_play: Play[]
  team_stats: { home: Record<string, number | string>; away: Record<string, number | string> } | null
  linescore?: Record<string, { home: number; away: number }>
  cache_age_seconds: number
  timestamp: string
}

export function useLiveGameData(gameId: string | undefined) {
  const [game, setGame] = useState<GameData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const retriesRef = useRef(0)
  const gameRef = useRef<GameData | null>(null)

  const fetchGame = useCallback(async () => {
    if (!gameId) return

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(`/api/live-games/${gameId}`, {
        cache: 'no-store',
        signal: controller.signal,
      })

      if (!res.ok) {
        retriesRef.current++
        if (retriesRef.current > MAX_RETRIES && !gameRef.current) {
          setError(res.status === 404 ? 'Game not found' : `Failed to fetch: ${res.status}`)
          setIsLoading(false)
        }
        return
      }

      const data: GameData = await res.json()
      const prev = gameRef.current

      if (prev) {
        // Merge play-by-play: keep all existing plays + add any new ones
        // This prevents the list from disappearing when the API returns partial data
        const existingPlays = prev.play_by_play || []
        const newPlays = data.play_by_play || []
        const existingIds = new Set(existingPlays.map(p => p.play_id))
        const merged = [...existingPlays]
        for (const play of newPlays) {
          if (!existingIds.has(play.play_id)) {
            merged.push(play)
          } else {
            // Update existing play data (score changes, etc.)
            const idx = merged.findIndex(p => p.play_id === play.play_id)
            if (idx >= 0) merged[idx] = play
          }
        }
        data.play_by_play = merged
      }

      // Compare without volatile fields (cache_age, timestamp) to avoid unnecessary re-renders
      const compareKey = (d: GameData) => {
        const { cache_age_seconds, timestamp, updated_at, ...rest } = d as any
        return JSON.stringify(rest)
      }
      if (!prev || compareKey(data) !== compareKey(prev)) {
        gameRef.current = data
        setGame(data)
      }
      setError(null)
      setIsLoading(false)
      retriesRef.current = 0
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      retriesRef.current++
      if (retriesRef.current > MAX_RETRIES && !gameRef.current) {
        console.error('[useLiveGameData] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load game')
        setIsLoading(false)
      }
    }
  }, [gameId])

  useEffect(() => {
    retriesRef.current = 0
    gameRef.current = null
    setIsLoading(true)
    setError(null)
    fetchGame()
    const interval = setInterval(fetchGame, POLL_INTERVAL)
    return () => {
      clearInterval(interval)
      abortRef.current?.abort()
    }
  }, [fetchGame])

  return { game, isLoading, error }
}
