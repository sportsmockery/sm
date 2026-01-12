'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface ScrollDepthResult {
  depth: number // 0-100
  maxDepth: number // highest depth reached
  isAtBottom: boolean
  hasReachedQuarter: boolean
  hasReachedHalf: boolean
  hasReachedThreeQuarters: boolean
  hasReachedEnd: boolean
}

interface UseScrollDepthOptions {
  onMilestone?: (milestone: 25 | 50 | 75 | 100) => void
  throttleMs?: number
  trackAnalytics?: boolean
}

export function useScrollDepth(options: UseScrollDepthOptions = {}): ScrollDepthResult {
  const { onMilestone, throttleMs = 100, trackAnalytics = false } = options

  const [depth, setDepth] = useState(0)
  const [maxDepth, setMaxDepth] = useState(0)
  const milestones = useRef({ 25: false, 50: false, 75: false, 100: false })
  const lastUpdateTime = useRef(0)

  const calculateDepth = useCallback(() => {
    const now = Date.now()
    if (now - lastUpdateTime.current < throttleMs) return

    lastUpdateTime.current = now

    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    const scrollTop = window.scrollY

    // Calculate percentage scrolled
    const scrollableHeight = documentHeight - windowHeight
    if (scrollableHeight <= 0) {
      setDepth(100)
      return
    }

    const currentDepth = Math.min(100, Math.round((scrollTop / scrollableHeight) * 100))
    setDepth(currentDepth)

    // Track max depth
    setMaxDepth(prev => Math.max(prev, currentDepth))

    // Check milestones
    const checkMilestone = (milestone: 25 | 50 | 75 | 100) => {
      if (currentDepth >= milestone && !milestones.current[milestone]) {
        milestones.current[milestone] = true
        onMilestone?.(milestone)

        // Track analytics if enabled
        if (trackAnalytics) {
          trackScrollMilestone(milestone)
        }
      }
    }

    checkMilestone(25)
    checkMilestone(50)
    checkMilestone(75)
    checkMilestone(100)
  }, [throttleMs, onMilestone, trackAnalytics])

  useEffect(() => {
    // Calculate initial depth
    calculateDepth()

    window.addEventListener('scroll', calculateDepth, { passive: true })
    window.addEventListener('resize', calculateDepth, { passive: true })

    return () => {
      window.removeEventListener('scroll', calculateDepth)
      window.removeEventListener('resize', calculateDepth)
    }
  }, [calculateDepth])

  return {
    depth,
    maxDepth,
    isAtBottom: depth >= 95,
    hasReachedQuarter: milestones.current[25],
    hasReachedHalf: milestones.current[50],
    hasReachedThreeQuarters: milestones.current[75],
    hasReachedEnd: milestones.current[100],
  }
}

// Track scroll milestone to analytics
function trackScrollMilestone(milestone: number) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'scroll_depth',
      milestone,
      pathname: window.location.pathname,
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => {
    // Silently fail
  })
}

// Hook to track scroll position for specific element
export function useElementScrollProgress(elementRef: React.RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const calculateProgress = () => {
      const rect = element.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Element hasn't entered viewport yet
      if (rect.top >= windowHeight) {
        setProgress(0)
        return
      }

      // Element has completely passed viewport
      if (rect.bottom <= 0) {
        setProgress(100)
        return
      }

      // Calculate progress through element
      const elementHeight = rect.height
      const visibleTop = Math.max(0, -rect.top)
      const progress = Math.min(100, Math.round((visibleTop / elementHeight) * 100))

      setProgress(progress)
    }

    calculateProgress()
    window.addEventListener('scroll', calculateProgress, { passive: true })

    return () => window.removeEventListener('scroll', calculateProgress)
  }, [elementRef])

  return progress
}

// Reading progress bar component helper
export function useReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const calculateProgress = () => {
      const article = document.querySelector('article') || document.body
      const articleRect = article.getBoundingClientRect()
      const articleTop = articleRect.top + window.scrollY
      const articleHeight = articleRect.height
      const windowHeight = window.innerHeight
      const scrollY = window.scrollY

      // Calculate progress through article
      const startReading = articleTop
      const endReading = articleTop + articleHeight - windowHeight

      if (scrollY <= startReading) {
        setProgress(0)
        return
      }

      if (scrollY >= endReading) {
        setProgress(100)
        return
      }

      const progress = ((scrollY - startReading) / (endReading - startReading)) * 100
      setProgress(Math.round(progress))
    }

    calculateProgress()
    window.addEventListener('scroll', calculateProgress, { passive: true })

    return () => window.removeEventListener('scroll', calculateProgress)
  }, [])

  return progress
}
