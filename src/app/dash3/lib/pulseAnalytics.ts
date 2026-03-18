export function trackPulseEvent(event: string, data?: Record<string, any>): void {
  try {
    // Use sendBeacon for non-blocking tracking
    const payload = JSON.stringify({
      event: `city_pulse_${event}`,
      timestamp: new Date().toISOString(),
      ...data,
    })

    // Try beacon first, fall back to fetch
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/track-scout', payload)
    }
  } catch {
    // Silent fail — analytics should never break UX
  }
}
