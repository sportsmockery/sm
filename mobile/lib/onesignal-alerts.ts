/**
 * OneSignal Push Notification Sender
 *
 * Sends targeted push notifications via OneSignal REST API.
 * Uses tag-based filtering to respect user preferences.
 */

import { AlertEvent } from './alert-engine'

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID!
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY!

export async function sendPushNotification(alert: AlertEvent): Promise<boolean> {
  try {
    const filters = buildFilters(alert)

    const payload = {
      app_id: ONESIGNAL_APP_ID,
      filters,
      headings: { en: alert.title },
      contents: { en: alert.body },
      data: {
        type: alert.type,
        team: alert.team,
        gameId: alert.gameId,
        ...alert.data,
      },
      ios_sound: 'default',
      ios_badgeType: 'Increase',
      ios_badgeCount: 1,
      android_channel_id: getAndroidChannel(alert.type),
      android_accent_color: 'FFBC0000',
      priority: alert.priority === 'high' ? 10 : 5,
      ttl: 3600,
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (result.errors) {
      console.error('[OneSignal] Error sending notification:', result.errors)
      return false
    }

    console.log(`[OneSignal] Sent to ${result.recipients} users`)
    return true
  } catch (error) {
    console.error('[OneSignal] Failed to send notification:', error)
    return false
  }
}

function buildFilters(alert: AlertEvent): any[] {
  const filters: any[] = []

  // User must have notifications enabled
  filters.push({ field: 'tag', key: 'notifications_enabled', value: 'true' })

  // User must follow this team
  if (alert.team && alert.team !== 'chicago') {
    filters.push({ operator: 'AND' })
    filters.push({ field: 'tag', key: `follows_${alert.team}`, value: 'true' })
  }

  // User must have this alert type enabled
  const alertTypeTag = getAlertTypeTag(alert.type)
  if (alertTypeTag) {
    filters.push({ operator: 'AND' })
    filters.push({ field: 'tag', key: alertTypeTag, value: 'true' })
  }

  return filters
}

function getAlertTypeTag(type: AlertEvent['type']): string | null {
  switch (type) {
    case 'SCORE_CHANGE':
    case 'GAME_START':
    case 'GAME_END':
    case 'CLOSE_GAME':
    case 'OVERTIME':
      return 'alert_scores'
    case 'INJURY':
      return 'alert_injuries'
    case 'TRADE':
    case 'ROSTER_MOVE':
      return 'alert_trades'
    case 'BREAKING_NEWS':
      return 'alert_breaking'
    default:
      return null
  }
}

function getAndroidChannel(type: AlertEvent['type']): string {
  switch (type) {
    case 'SCORE_CHANGE':
    case 'GAME_START':
    case 'GAME_END':
    case 'CLOSE_GAME':
    case 'OVERTIME':
      return 'game_alerts'
    case 'INJURY':
    case 'TRADE':
    case 'ROSTER_MOVE':
    case 'BREAKING_NEWS':
      return 'news_alerts'
    default:
      return 'general'
  }
}

export async function sendBatchNotifications(alerts: AlertEvent[]): Promise<void> {
  // Group alerts by team+game to avoid duplicates
  const grouped = new Map<string, AlertEvent[]>()

  for (const alert of alerts) {
    const key = `${alert.team}-${alert.gameId || 'news'}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(alert)
  }

  for (const [, teamAlerts] of grouped) {
    if (teamAlerts.length === 1) {
      await sendPushNotification(teamAlerts[0])
    } else {
      // Combine: use highest priority alert, append count
      const sorted = teamAlerts.sort((a, b) => {
        const order = { high: 0, normal: 1, low: 2 }
        return order[a.priority] - order[b.priority]
      })
      const combined = { ...sorted[0] }
      combined.body = `${combined.body} (+${teamAlerts.length - 1} more)`
      await sendPushNotification(combined)
    }

    // Small delay between sends
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}
