'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { DashboardIntelligenceResponse, LiveSnapshot } from './types'

// Full dashboard intelligence snapshot — polls every 5 minutes
const DASHBOARD_POLL_MS = 5 * 60 * 1000

// Fallback live poll interval when ttl_seconds is not available
const LIVE_POLL_FALLBACK_MS = 15_000

export function useDashboardData() {
  const [data, setData] = useState<DashboardIntelligenceResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const dashboardIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const liveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isLiveRef = useRef(false)
  const liveTtlRef = useRef<number>(LIVE_POLL_FALLBACK_MS)

  // -------------------------------------------------------
  // Fetch full dashboard intelligence (every 5 minutes)
  // Source: /api/dashboard/intelligence -> dashboard_intelligence_snapshot
  // -------------------------------------------------------
  const fetchDashboard = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true)
      const res = await fetch('/api/dashboard/intelligence')
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const json: DashboardIntelligenceResponse = await res.json()
      setData(json)
      setError(null)
      setLastFetched(new Date())

      isLiveRef.current = json.live.is_active
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      if (isInitial) setLoading(false)
    }
  }, [])

  // -------------------------------------------------------
  // Fetch live-only snapshot (backend-controlled cadence)
  // Source: /api/dashboard/live -> dashboard_live_snapshot
  // -------------------------------------------------------
  const fetchLive = useCallback(async () => {
    if (!isLiveRef.current) return

    try {
      const res = await fetch('/api/dashboard/live')
      if (!res.ok) return
      const snapshot: LiveSnapshot = await res.json()

      // Update the poll interval from backend ttl_seconds
      if (snapshot.ttl_seconds) {
        liveTtlRef.current = snapshot.ttl_seconds * 1000
      }

      setData((prev) => {
        if (!prev) return prev
        // Merge only the live fields into the existing dashboard state
        return {
          ...prev,
          live: {
            is_active: snapshot.is_active,
            game_count: snapshot.game_count,
            games: snapshot.games,
          },
        }
      })

      // Stop polling if no games are active
      isLiveRef.current = snapshot.is_active
    } catch {
      // Non-fatal — full poll will reconcile on next 5-minute cycle
    }
  }, [])

  // -------------------------------------------------------
  // Initial fetch
  // -------------------------------------------------------
  useEffect(() => {
    fetchDashboard(true)
  }, [fetchDashboard])

  // -------------------------------------------------------
  // Dashboard poll — 5-minute interval
  // -------------------------------------------------------
  useEffect(() => {
    dashboardIntervalRef.current = setInterval(() => fetchDashboard(false), DASHBOARD_POLL_MS)
    return () => {
      if (dashboardIntervalRef.current) clearInterval(dashboardIntervalRef.current)
    }
  }, [fetchDashboard])

  // -------------------------------------------------------
  // Live poll — interval driven by ttl_seconds from backend
  // Starts when live.is_active, stops when games end
  // -------------------------------------------------------
  useEffect(() => {
    const isLive = data?.live.is_active ?? false

    if (isLive) {
      fetchLive()
      liveIntervalRef.current = setInterval(fetchLive, liveTtlRef.current)
    } else {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current)
        liveIntervalRef.current = null
      }
    }

    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current)
    }
  }, [data?.live.is_active, fetchLive])

  return {
    data,
    loading,
    error,
    lastFetched,
    isLive: data?.live.is_active ?? false,
    refresh: () => fetchDashboard(false),
  }
}
