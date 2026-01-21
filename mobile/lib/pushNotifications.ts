/**
 * Push Notifications Setup with OneSignal
 *
 * Notifications are triggered from the website when:
 * - Breaking news is published
 * - Game alerts (start, score updates, final)
 * - Team-specific news for followed teams
 *
 * The website sends push notifications via OneSignal API,
 * and this file handles receiving them in the app.
 */

import { Platform } from 'react-native'
import { ONESIGNAL_APP_ID } from './config'

// Types for OneSignal
interface NotificationPayload {
  type: 'breaking_news' | 'article' | 'game_alert' | 'chat_mention'
  articleSlug?: string
  categorySlug?: string
  teamId?: string
  title?: string
  body?: string
}

let OneSignal: any = null

/**
 * Initialize OneSignal push notifications
 * Call this early in app startup
 */
export async function initializePushNotifications(): Promise<void> {
  if (!ONESIGNAL_APP_ID) {
    console.warn('OneSignal App ID not configured')
    return
  }

  try {
    // Dynamically import to avoid crashes if not installed
    const module = await import('react-native-onesignal')
    OneSignal = module.default

    // Initialize OneSignal
    OneSignal.setAppId(ONESIGNAL_APP_ID)

    // Request permission on iOS
    if (Platform.OS === 'ios') {
      OneSignal.promptForPushNotificationsWithUserResponse((response: boolean) => {
        console.log('Push notification permission:', response)
      })
    }

    // Handle notification opened (user tapped notification)
    OneSignal.setNotificationOpenedHandler((notification: any) => {
      handleNotificationOpened(notification)
    })

    // Handle notification received while app is open
    OneSignal.setNotificationWillShowInForegroundHandler((event: any) => {
      // Show the notification
      event.complete(event.getNotification())
    })

    console.log('OneSignal initialized')
  } catch (error) {
    console.warn('Failed to initialize OneSignal:', error)
  }
}

/**
 * Handle when user taps on a notification
 */
function handleNotificationOpened(openResult: any): void {
  const data = openResult.notification?.additionalData as NotificationPayload

  if (!data) return

  // Import router dynamically to avoid circular deps
  import('expo-router').then(({ router }) => {
    switch (data.type) {
      case 'article':
      case 'breaking_news':
        if (data.articleSlug) {
          router.push(`/article/${data.articleSlug}?category=${data.categorySlug || 'news'}`)
        }
        break

      case 'game_alert':
        if (data.teamId) {
          router.push(`/team/${data.teamId}`)
        }
        break

      case 'chat_mention':
        if (data.teamId) {
          router.push(`/chat/${data.teamId}`)
        }
        break

      default:
        // Navigate to home
        router.push('/')
    }
  })
}

/**
 * Set user tags for targeted notifications
 * Call this when user preferences change
 */
export async function setUserTags(tags: Record<string, string>): Promise<void> {
  if (!OneSignal) return

  try {
    OneSignal.sendTags(tags)
  } catch (error) {
    console.warn('Failed to set OneSignal tags:', error)
  }
}

/**
 * Set favorite teams for targeted team notifications
 */
export async function setFavoriteTeams(teams: string[]): Promise<void> {
  const tags: Record<string, string> = {
    favorite_bears: teams.includes('bears') ? 'true' : 'false',
    favorite_bulls: teams.includes('bulls') ? 'true' : 'false',
    favorite_cubs: teams.includes('cubs') ? 'true' : 'false',
    favorite_whitesox: teams.includes('whitesox') ? 'true' : 'false',
    favorite_blackhawks: teams.includes('blackhawks') ? 'true' : 'false',
  }

  await setUserTags(tags)
}

/**
 * Set notification preferences
 */
export async function setNotificationPreferences(preferences: {
  breaking_news?: boolean
  team_news?: boolean
  game_alerts?: boolean
  chat_mentions?: boolean
}): Promise<void> {
  const tags: Record<string, string> = {}

  if (preferences.breaking_news !== undefined) {
    tags.notify_breaking = preferences.breaking_news ? 'true' : 'false'
  }
  if (preferences.team_news !== undefined) {
    tags.notify_team = preferences.team_news ? 'true' : 'false'
  }
  if (preferences.game_alerts !== undefined) {
    tags.notify_games = preferences.game_alerts ? 'true' : 'false'
  }
  if (preferences.chat_mentions !== undefined) {
    tags.notify_chat = preferences.chat_mentions ? 'true' : 'false'
  }

  await setUserTags(tags)
}

/**
 * Link OneSignal user to Supabase user
 */
export async function setExternalUserId(userId: string | null): Promise<void> {
  if (!OneSignal) return

  try {
    if (userId) {
      OneSignal.setExternalUserId(userId)
    } else {
      OneSignal.removeExternalUserId()
    }
  } catch (error) {
    console.warn('Failed to set external user ID:', error)
  }
}

/**
 * Get OneSignal player ID (for debugging)
 */
export async function getPlayerId(): Promise<string | null> {
  if (!OneSignal) return null

  try {
    const state = await OneSignal.getDeviceState()
    return state?.userId || null
  } catch (error) {
    console.warn('Failed to get player ID:', error)
    return null
  }
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  if (!OneSignal) return false

  try {
    const state = await OneSignal.getDeviceState()
    return state?.hasNotificationPermission === true
  } catch (error) {
    return false
  }
}

/**
 * Request notification permission (iOS)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!OneSignal) return false

  return new Promise((resolve) => {
    OneSignal.promptForPushNotificationsWithUserResponse((granted: boolean) => {
      resolve(granted)
    })
  })
}
