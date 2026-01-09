'use client'

import { useState, useEffect, useCallback } from 'react'

interface Article {
  id: number
  title: string
  slug: string
  excerpt: string
  featured_image: string
  category_id: string
  team: string
  author_id: string
  importance_score: number
  publish_date: string
  view_count: number
  final_score?: number
  sm_authors?: { name: string }
}

interface FeedData {
  featured: Article | null
  topHeadlines: Article[]
  latestNews: Article[]
  teamSections: Record<string, Article[]>
  trending: Article[]
  meta: {
    total: number
    viewedCount: number
    isAuthenticated: boolean
  }
}

interface UseOracleFeedOptions {
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
}

const STORAGE_KEY = 'sm_viewed'
const PREFS_KEY = 'sm_team_prefs'
const EXPIRY_HOURS = 48

// Get viewed article IDs from localStorage
function getViewedIds(): number[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const { ids, expiry } = JSON.parse(stored)

    // Check if expired
    if (expiry && Date.now() > expiry) {
      localStorage.removeItem(STORAGE_KEY)
      return []
    }

    return ids || []
  } catch {
    return []
  }
}

// Save viewed article ID to localStorage
function saveViewedId(id: number): void {
  if (typeof window === 'undefined') return

  try {
    const currentIds = getViewedIds()
    if (currentIds.includes(id)) return

    const newIds = [...currentIds, id]
    const expiry = Date.now() + (EXPIRY_HOURS * 60 * 60 * 1000)

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids: newIds, expiry }))
  } catch (e) {
    console.warn('Failed to save viewed ID:', e)
  }
}

// Get team preferences from localStorage
function getTeamPreferences(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(PREFS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Infer team preferences from viewed articles
function updateTeamPreferences(team: string): void {
  if (typeof window === 'undefined') return

  try {
    const current = getTeamPreferences()

    // Count occurrences (stored as array with repeats for weighting)
    const updated = [...current, team].slice(-50) // Keep last 50 views

    localStorage.setItem(PREFS_KEY, JSON.stringify(updated))
  } catch (e) {
    console.warn('Failed to update team preferences:', e)
  }
}

// Get top preferred teams (most viewed)
function getTopTeamPreferences(): string[] {
  const prefs = getTeamPreferences()
  if (prefs.length === 0) return []

  // Count occurrences
  const counts: Record<string, number> = {}
  prefs.forEach(team => {
    counts[team] = (counts[team] || 0) + 1
  })

  // Sort by count and return top 3
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([team]) => team)
}

export function useOracleFeed(options: UseOracleFeedOptions = {}) {
  const { autoRefresh = false, refreshInterval = 5 * 60 * 1000 } = options

  const [feed, setFeed] = useState<FeedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const viewedIds = getViewedIds()
      const teamPreferences = getTopTeamPreferences()

      const response = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewed_ids: viewedIds,
          team_preferences: teamPreferences,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch feed')
      }

      const data = await response.json()
      setFeed(data)
    } catch (e) {
      console.error('Feed fetch error:', e)
      setError(e instanceof Error ? e.message : 'Failed to load feed')

      // Fallback to GET endpoint for first-timers
      try {
        const fallbackResponse = await fetch('/api/feed')
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          setFeed(fallbackData)
          setError(null)
        }
      } catch {
        // Keep original error
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchFeed, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchFeed])

  // Track article view
  const trackView = useCallback((article: Article) => {
    saveViewedId(article.id)
    if (article.team) {
      updateTeamPreferences(article.team)
    }
  }, [])

  // Check if article is unseen
  const isUnseen = useCallback((articleId: number) => {
    const viewedIds = getViewedIds()
    return !viewedIds.includes(articleId)
  }, [])

  // Refresh feed
  const refresh = useCallback(() => {
    fetchFeed()
  }, [fetchFeed])

  // Clear viewed history (for testing)
  const clearHistory = useCallback(() => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(PREFS_KEY)
    fetchFeed()
  }, [fetchFeed])

  return {
    feed,
    loading,
    error,
    trackView,
    isUnseen,
    refresh,
    clearHistory,
  }
}

// Hook for tracking individual article views
export function useArticleTracking(articleId: number, team?: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Track view on mount
    saveViewedId(articleId)

    if (team) {
      updateTeamPreferences(team)
    }
  }, [articleId, team])
}

export { getViewedIds, saveViewedId, getTeamPreferences, getTopTeamPreferences }
