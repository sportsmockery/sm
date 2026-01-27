'use client'

import { useEffect, useState, useCallback } from 'react'

const POLL_INTERVAL = 10000

export interface LiveGameSummary {
  game_id: string
  sport: 'nfl' | 'nba' | 'nhl' | 'mlb'
  status: string
  game_start_time?: string
  home_team_id: string
  away_team_id: string
  home_team_name: string
  away_team_name: string
  home_team_abbr: string
  away_team_abbr: string
  home_logo_url: string
  away_logo_url: string
  home_score: number
  away_score: number
  period: number | null
  period_label: string | null
  clock: string | null
  chicago_team: string
  is_chicago_home: boolean
}

export function useLiveGamesList() {
  const [games, setGames] = useState<LiveGameSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch('/api/live-games?include_upcoming=true', { cache: 'no-store' })
      if (!res.ok) return

      const data = await res.json()
      const now = Date.now()
      const sixtyMin = 60 * 60 * 1000

      // Include in-progress games and upcoming games within 60 minutes
      const relevant = (data.games || []).filter((g: LiveGameSummary) => {
        if (g.status === 'in_progress') return true
        if (g.status === 'upcoming' && g.game_start_time) {
          const start = new Date(g.game_start_time).getTime()
          return start <= now + sixtyMin && start >= now - 60000
        }
        return false
      })
      setGames(relevant)
    } catch {
      // Silently fail - game switcher is non-critical
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGames()
    const interval = setInterval(fetchGames, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchGames])

  return { games, isLoading }
}
