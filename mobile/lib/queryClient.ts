/**
 * React Query Client Configuration
 *
 * Handles caching, background refetching, and offline support.
 * Data is always fetched from the website - cache is for performance only.
 */

import { QueryClient } from '@tanstack/react-query'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CACHE_DURATIONS, STALE_TIMES } from './config'

// Create the query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long data is considered fresh
      staleTime: STALE_TIMES.feed,

      // How long to keep unused data in cache
      gcTime: CACHE_DURATIONS.feed,

      // Retry failed requests
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch when app comes to foreground
      refetchOnWindowFocus: true,

      // Don't refetch on mount if data is fresh
      refetchOnMount: true,

      // Refetch when network reconnects
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

// ============================================
// QUERY KEYS - Consistent key structure
// ============================================

export const queryKeys = {
  // Feed
  feed: ['feed'] as const,
  feedPersonalized: (viewedIds: number[], teams: string[]) =>
    ['feed', 'personalized', { viewedIds, teams }] as const,

  // Articles
  articles: ['articles'] as const,
  article: (slug: string) => ['articles', slug] as const,
  articlesByTeam: (team: string, page?: number) =>
    ['articles', 'team', team, { page }] as const,

  // Teams
  teams: ['teams'] as const,
  team: (slug: string) => ['teams', slug] as const,
  teamRoster: (team: string) => ['teams', team, 'roster'] as const,
  teamSchedule: (team: string) => ['teams', team, 'schedule'] as const,
  teamStats: (team: string) => ['teams', team, 'stats'] as const,

  // Chat
  chatMessages: (roomId: string) => ['chat', roomId, 'messages'] as const,
  chatRooms: ['chat', 'rooms'] as const,

  // AI
  askAI: (query: string) => ['askAI', query] as const,

  // Polls
  polls: ['polls'] as const,
  poll: (id: string) => ['polls', id] as const,

  // Config
  mobileConfig: ['config', 'mobile'] as const,

  // User
  user: ['user'] as const,
  userPreferences: ['user', 'preferences'] as const,

  // Search
  search: (query: string, team?: string) => ['search', query, { team }] as const,
}

// ============================================
// OFFLINE PERSISTENCE (Optional)
// ============================================

const CACHE_KEY = 'REACT_QUERY_OFFLINE_CACHE'

/**
 * Save query cache to AsyncStorage for offline access
 * Only saves articles user has viewed
 */
export async function persistQueryCache(): Promise<void> {
  try {
    const cache = queryClient.getQueryCache()
    const queries = cache.getAll()

    // Only persist article data for offline reading
    const articlesToPersist = queries
      .filter((query) => {
        const key = query.queryKey
        return Array.isArray(key) && key[0] === 'articles' && key.length === 2
      })
      .map((query) => ({
        queryKey: query.queryKey,
        state: query.state,
      }))

    if (articlesToPersist.length > 0) {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(articlesToPersist))
    }
  } catch (error) {
    console.warn('Failed to persist query cache:', error)
  }
}

/**
 * Restore query cache from AsyncStorage
 */
export async function restoreQueryCache(): Promise<void> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY)
    if (!cached) return

    const queries = JSON.parse(cached)

    queries.forEach(({ queryKey, state }: { queryKey: string[]; state: any }) => {
      if (state.data) {
        queryClient.setQueryData(queryKey, state.data)
      }
    })
  } catch (error) {
    console.warn('Failed to restore query cache:', error)
  }
}

/**
 * Clear persisted cache
 */
export async function clearPersistedCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY)
  } catch (error) {
    console.warn('Failed to clear persisted cache:', error)
  }
}

// ============================================
// PREFETCH HELPERS
// ============================================

/**
 * Prefetch the feed on app launch
 */
export async function prefetchFeed() {
  const { api } = await import('./api')
  await queryClient.prefetchQuery({
    queryKey: queryKeys.feed,
    queryFn: () => api.getFeed(),
  })
}

/**
 * Prefetch mobile config (ad settings, feature flags)
 */
export async function prefetchMobileConfig() {
  const { api } = await import('./api')
  await queryClient.prefetchQuery({
    queryKey: queryKeys.mobileConfig,
    queryFn: () => api.getMobileConfig(),
    staleTime: STALE_TIMES.teamData,
  })
}
