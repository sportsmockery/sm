'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

// Poll every 30s when checking for live game, 10s during live game
const POLL_INTERVAL_IDLE = 30000
const POLL_INTERVAL_LIVE = 10000

interface LiveGameInfo {
  game_id: string
  sport: string
  status: string
  home_score: number
  away_score: number
  period: number | null
  period_label: string | null
  clock: string | null
  chicago_team: string
  is_chicago_home: boolean
}

interface UseLiveGameForTeamResult {
  liveGameId: string | null
  liveGame: LiveGameInfo | null
  isLoading: boolean
  error: string | null
}

/**
 * Hook to detect if a team has a live game in progress
 *
 * @param teamId - Team identifier (e.g., 'bears', 'bulls')
 * @returns Object with liveGameId (null if no live game), liveGame data, isLoading, and error
 */
export function useLiveGameForTeam(teamId: string): UseLiveGameForTeamResult {
  const [liveGame, setLiveGame] = useState<LiveGameInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchLiveGame = useCallback(async () => {
    if (!teamId) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(`/api/live-games?team=${teamId}&include_upcoming=true`, {
        cache: 'no-store',
        signal: controller.signal,
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`)
      }

      const data = await res.json()

      // Find any in-progress games
      const inProgressGame = data.games?.find(
        (g: LiveGameInfo) => g.status === 'in_progress' || g.status === 'live'
      )

      if (inProgressGame) {
        setLiveGame(inProgressGame)
        setError(null)
      } else {
        setLiveGame(null)
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('[useLiveGameForTeam] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to check live games')
    } finally {
      setIsLoading(false)
    }
  }, [teamId])

  // Setup polling
  useEffect(() => {
    // Initial fetch
    fetchLiveGame()

    // Setup interval - poll more frequently during live games
    const setupInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      const interval = liveGame ? POLL_INTERVAL_LIVE : POLL_INTERVAL_IDLE
      intervalRef.current = setInterval(fetchLiveGame, interval)
    }

    setupInterval()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      abortRef.current?.abort()
    }
  }, [fetchLiveGame, liveGame])

  return {
    liveGameId: liveGame?.game_id || null,
    liveGame,
    isLoading,
    error,
  }
}
