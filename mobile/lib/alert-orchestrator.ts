/**
 * Alert Orchestrator
 *
 * Ties together alert discovery (ESPN + RSS) with OneSignal sending.
 * Applies anti-spam filtering: per-game limits, hourly limits, minimum gap.
 * Designed to be called by a Vercel cron job on the main SM web app.
 */

import { discoverAlerts, AlertEvent } from './alert-engine'
import { sendBatchNotifications } from './onesignal-alerts'

const CONFIG = {
  MAX_ALERTS_PER_GAME: 15,
  MAX_ALERTS_PER_HOUR: 10,
  MIN_ALERT_GAP_MS: 60000,
  GAME_TIME_INTERVAL_MS: 30000,
  OFF_HOURS_INTERVAL_MS: 300000,
}

const alertsSentThisHour: Map<string, number> = new Map()
const lastAlertTime: Map<string, Date> = new Map()
let isRunning = false

export async function runAlertCycle(): Promise<{
  discovered: number
  sent: number
  filtered: number
}> {
  if (isRunning) {
    return { discovered: 0, sent: 0, filtered: 0 }
  }

  isRunning = true

  try {
    const alerts = await discoverAlerts()
    const filteredAlerts = filterAlerts(alerts)

    if (filteredAlerts.length > 0) {
      await sendBatchNotifications(filteredAlerts)
      for (const alert of filteredAlerts) {
        recordAlertSent(alert)
      }
    }

    return {
      discovered: alerts.length,
      sent: filteredAlerts.length,
      filtered: alerts.length - filteredAlerts.length,
    }
  } catch (error) {
    console.error('[Orchestrator] Error in alert cycle:', error)
    return { discovered: 0, sent: 0, filtered: 0 }
  } finally {
    isRunning = false
  }
}

function filterAlerts(alerts: AlertEvent[]): AlertEvent[] {
  return alerts.filter(alert => {
    const key = `${alert.team}-${alert.gameId || 'news'}`

    const gameCount = alertsSentThisHour.get(key) || 0
    if (gameCount >= CONFIG.MAX_ALERTS_PER_GAME) return false

    const lastTime = lastAlertTime.get(key)
    if (lastTime && Date.now() - lastTime.getTime() < CONFIG.MIN_ALERT_GAP_MS) return false

    const totalThisHour = Array.from(alertsSentThisHour.values()).reduce((s, c) => s + c, 0)
    if (totalThisHour >= CONFIG.MAX_ALERTS_PER_HOUR) return false

    return true
  })
}

function recordAlertSent(alert: AlertEvent): void {
  const key = `${alert.team}-${alert.gameId || 'news'}`
  alertsSentThisHour.set(key, (alertsSentThisHour.get(key) || 0) + 1)
  lastAlertTime.set(key, new Date())
}

// Reset hourly counters
setInterval(() => {
  alertsSentThisHour.clear()
}, 3600000)

export function getCurrentPollingInterval(): number {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()

  const isWeekend = day === 0 || day === 6
  const start = isWeekend ? 11 : 18
  const end = 23

  return (hour >= start && hour <= end) ? CONFIG.GAME_TIME_INTERVAL_MS : CONFIG.OFF_HOURS_INTERVAL_MS
}
