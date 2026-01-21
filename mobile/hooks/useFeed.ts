import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api, FeedResponse, Post } from '@/lib/api'
import { queryKeys } from '@/lib/queryClient'
import { STALE_TIMES } from '@/lib/config'

const VIEWED_IDS_KEY = 'viewed_article_ids'
const TEAM_PREFS_KEY = 'team_preferences'

/**
 * Hook for fetching the news feed from the website
 *
 * The feed is always fetched from test.sportsmockery.com
 * When content is updated on the website, pull-to-refresh gets the latest
 */
export function useFeed() {
  const queryClient = useQueryClient()
  const [viewedIds, setViewedIds] = useState<number[]>([])
  const [teamPreferences, setTeamPreferences] = useState<string[]>(['bears'])

  // Load viewed IDs and team preferences from storage
  useEffect(() => {
    async function loadPreferences() {
      try {
        const [storedViewedIds, storedTeamPrefs] = await Promise.all([
          AsyncStorage.getItem(VIEWED_IDS_KEY),
          AsyncStorage.getItem(TEAM_PREFS_KEY),
        ])

        if (storedViewedIds) {
          setViewedIds(JSON.parse(storedViewedIds))
        }
        if (storedTeamPrefs) {
          setTeamPreferences(JSON.parse(storedTeamPrefs))
        }
      } catch (error) {
        console.warn('Failed to load feed preferences:', error)
      }
    }
    loadPreferences()
  }, [])

  // Fetch feed from website API
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<FeedResponse>({
    queryKey: queryKeys.feedPersonalized(viewedIds, teamPreferences),
    queryFn: () =>
      api.getFeed({
        viewedIds,
        teamPreferences,
      }),
    staleTime: STALE_TIMES.feed,
    // Refetch when app comes back to foreground
    refetchOnWindowFocus: true,
    // Retry failed requests
    retry: 2,
  })

  // Mark an article as viewed
  const markAsViewed = useCallback(
    async (postId: number) => {
      setViewedIds((prev) => {
        if (prev.includes(postId)) return prev
        const newIds = [...prev, postId]
        // Keep only last 100 viewed IDs
        const trimmed = newIds.slice(-100)
        AsyncStorage.setItem(VIEWED_IDS_KEY, JSON.stringify(trimmed))
        return trimmed
      })
    },
    []
  )

  // Update team preferences
  const updateTeamPreferences = useCallback(async (teams: string[]) => {
    setTeamPreferences(teams)
    await AsyncStorage.setItem(TEAM_PREFS_KEY, JSON.stringify(teams))
    // Invalidate feed to refetch with new preferences
    queryClient.invalidateQueries({ queryKey: ['feed'] })
  }, [queryClient])

  // Pull to refresh
  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    // Data from website
    featured: data?.featured ?? null,
    topHeadlines: data?.topHeadlines ?? [],
    latestNews: data?.latestNews ?? [],
    teamSections: data?.teamSections ?? {},
    trending: data?.trending ?? [],
    meta: data?.meta,

    // Loading states
    isLoading,
    isRefetching,
    isError,
    error,

    // Actions
    refresh,
    markAsViewed,
    updateTeamPreferences,

    // Preferences
    viewedIds,
    teamPreferences,
  }
}

/**
 * Hook for fetching a single article by ID
 */
export function useArticle(articleId: number | null) {
  return useQuery({
    queryKey: queryKeys.article(articleId?.toString() || ''),
    queryFn: () => api.getArticle(articleId!),
    staleTime: STALE_TIMES.article,
    enabled: !!articleId,
  })
}

/**
 * Hook for fetching team-specific articles
 */
export function useTeamArticles(teamSlug: string, page = 1) {
  return useQuery({
    queryKey: queryKeys.articlesByTeam(teamSlug, page),
    queryFn: () => api.getTeamArticles(teamSlug, { page, limit: 20 }),
    staleTime: STALE_TIMES.feed,
    enabled: !!teamSlug,
  })
}
