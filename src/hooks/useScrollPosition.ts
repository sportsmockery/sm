'use client'

import { useEffect, useState } from 'react'

interface ScrollPosition {
  x: number
  y: number
  direction: 'up' | 'down' | null
  isAtTop: boolean
  isAtBottom: boolean
}

export function useScrollPosition(): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
    direction: null,
    isAtTop: true,
    isAtBottom: false,
  })

  useEffect(() => {
    let lastY = window.scrollY

    const handleScroll = () => {
      const currentY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight

      setPosition({
        x: window.scrollX,
        y: currentY,
        direction: currentY > lastY ? 'down' : currentY < lastY ? 'up' : null,
        isAtTop: currentY <= 0,
        isAtBottom: currentY >= maxScroll - 10,
      })

      lastY = currentY
    }

    // Set initial position
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return position
}

// Hook to check if scrolled past a certain point
export function useScrolledPast(threshold: number): boolean {
  const [isPast, setIsPast] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsPast(window.scrollY > threshold)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return isPast
}

// Hook for scroll percentage
export function useScrollPercentage(): number {
  const [percentage, setPercentage] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setPercentage(Math.min(100, Math.max(0, scrollPercent)))
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return percentage
}

export default useScrollPosition
