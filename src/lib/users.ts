/**
 * User preferences functions for personalization
 * Manages favorite teams and notification preferences
 */

import { supabaseAdmin } from './db'
import { TeamSlug, UserPreferences, PostSummary } from './types'

/**
 * Get user preferences by user ID
 */
export async function getUserPreferences(
  userId: string
): Promise<UserPreferences | null> {
  const { data, error } = await supabaseAdmin
    .from('sm_user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    userId: data.user_id,
    favoriteTeams: data.favorite_teams || ['bears'], // Default to Bears
    notificationPrefs: data.notification_prefs || {},
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

/**
 * Create or update user preferences
 */
export async function upsertUserPreferences(
  userId: string,
  favoriteTeams: TeamSlug[],
  notificationPrefs?: Record<string, boolean>
): Promise<UserPreferences | null> {
  // Ensure Bears is first if included (Bears-first design)
  const sortedTeams = sortTeamsWithBearsFirst(favoriteTeams)

  const { data, error } = await supabaseAdmin
    .from('sm_user_preferences')
    .upsert({
      user_id: userId,
      favorite_teams: sortedTeams,
      notification_prefs: notificationPrefs || {},
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting user preferences:', error)
    return null
  }

  return {
    userId: data.user_id,
    favoriteTeams: data.favorite_teams,
    notificationPrefs: data.notification_prefs,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

/**
 * Add a team to user's favorites
 */
export async function addFavoriteTeam(
  userId: string,
  team: TeamSlug
): Promise<UserPreferences | null> {
  const existing = await getUserPreferences(userId)
  const currentFavorites = existing?.favoriteTeams || ['bears']

  if (currentFavorites.includes(team)) {
    return existing
  }

  const newFavorites = [...currentFavorites, team]
  return upsertUserPreferences(userId, newFavorites, existing?.notificationPrefs)
}

/**
 * Remove a team from user's favorites
 */
export async function removeFavoriteTeam(
  userId: string,
  team: TeamSlug
): Promise<UserPreferences | null> {
  const existing = await getUserPreferences(userId)
  const currentFavorites = existing?.favoriteTeams || ['bears']

  // Don't allow removing all teams - must keep at least Bears
  if (currentFavorites.length <= 1 && team === 'bears') {
    return existing
  }

  const newFavorites = currentFavorites.filter(t => t !== team)

  // Ensure at least Bears remains
  if (newFavorites.length === 0) {
    newFavorites.push('bears')
  }

  return upsertUserPreferences(userId, newFavorites, existing?.notificationPrefs)
}

/**
 * Update notification preferences
 */
export async function updateNotificationPrefs(
  userId: string,
  prefs: Record<string, boolean>
): Promise<UserPreferences | null> {
  const existing = await getUserPreferences(userId)
  const currentFavorites = existing?.favoriteTeams || ['bears']

  return upsertUserPreferences(userId, currentFavorites, prefs)
}

/**
 * Sort teams with Bears first (Bears-first design principle)
 */
function sortTeamsWithBearsFirst(teams: TeamSlug[]): TeamSlug[] {
  const hasBears = teams.includes('bears')
  const otherTeams = teams.filter(t => t !== 'bears')

  if (hasBears) {
    return ['bears', ...otherTeams]
  }

  return otherTeams
}

/**
 * Reorder posts by user's favorite teams
 * Posts from favorite teams appear first, maintaining chronological order within groups
 */
export function reorderByFavorites<T extends { team: TeamSlug; publishedAt: string }>(
  posts: T[],
  favoriteTeams: TeamSlug[]
): T[] {
  if (!favoriteTeams.length) {
    return posts
  }

  // Create priority map (Bears is always highest priority)
  const priorityMap = new Map<TeamSlug, number>()
  const bearsFirst = sortTeamsWithBearsFirst(favoriteTeams)
  bearsFirst.forEach((team, index) => {
    priorityMap.set(team, index)
  })

  // Sort posts: favorites first (in order), then others chronologically
  return [...posts].sort((a, b) => {
    const aPriority = priorityMap.has(a.team) ? priorityMap.get(a.team)! : 999
    const bPriority = priorityMap.has(b.team) ? priorityMap.get(b.team)! : 999

    // If same priority, sort by date
    if (aPriority === bPriority) {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    }

    return aPriority - bPriority
  })
}

/**
 * Get default preferences for new users
 */
export function getDefaultPreferences(): Omit<UserPreferences, 'userId' | 'createdAt' | 'updatedAt'> {
  return {
    favoriteTeams: ['bears'], // Bears-first by default
    notificationPrefs: {
      breaking_news: true,
      game_alerts: true,
      weekly_digest: true,
      trade_rumors: false,
    },
  }
}

/**
 * Check if user has preferences set
 */
export async function hasUserPreferences(userId: string): Promise<boolean> {
  const prefs = await getUserPreferences(userId)
  return prefs !== null
}

/**
 * Create initial preferences for new user with default values
 */
export async function createInitialPreferences(
  userId: string
): Promise<UserPreferences | null> {
  const defaults = getDefaultPreferences()
  return upsertUserPreferences(userId, defaults.favoriteTeams, defaults.notificationPrefs)
}
