'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface UsePageViewOptions {
  postId?: number
  trackOnMount?: boolean
  delay?: number
}

export function usePageView(options: UsePageViewOptions = {}) {
  const { postId, trackOnMount = true, delay = 1000 } = options
  const pathname = usePathname()
  const hasTracked = useRef(false)
  const previousPathname = useRef(pathname)

  useEffect(() => {
    // Reset tracking when pathname changes
    if (pathname !== previousPathname.current) {
      hasTracked.current = false
      previousPathname.current = pathname
    }

    if (!trackOnMount || hasTracked.current) return

    const timer = setTimeout(() => {
      if (hasTracked.current) return
      hasTracked.current = true

      // Track page view
      if (postId) {
        // Track specific post view
        fetch(`/api/views/${postId}`, { method: 'POST' })
          .catch(console.error)
      }

      // Track general page view (for analytics)
      trackPageView(pathname)
    }, delay)

    return () => clearTimeout(timer)
  }, [pathname, postId, trackOnMount, delay])

  return { hasTracked: hasTracked.current }
}

// Track general page view (can be extended to send to analytics service)
function trackPageView(pathname: string) {
  // Log for development
  if (process.env.NODE_ENV === 'development') {
    console.log('Page view:', pathname)
  }

  // Send to analytics API
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'pageview',
      pathname,
      timestamp: new Date().toISOString(),
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
    }),
  }).catch(() => {
    // Silently fail - analytics shouldn't break the page
  })
}

// Hook to track custom events
export function useTrackEvent() {
  const track = (eventName: string, eventData?: Record<string, unknown>) => {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'event',
        event: eventName,
        data: eventData,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Silently fail
    })
  }

  return { track }
}

// Track time on page
export function useTimeOnPage() {
  const startTime = useRef(Date.now())
  const pathname = usePathname()

  useEffect(() => {
    startTime.current = Date.now()

    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000)

      // Use sendBeacon for reliable tracking on page unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/analytics',
          JSON.stringify({
            type: 'time_on_page',
            pathname,
            duration: timeSpent,
            timestamp: new Date().toISOString(),
          })
        )
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [pathname])

  return {
    getTimeSpent: () => Math.round((Date.now() - startTime.current) / 1000),
  }
}
