'use client'

import { useState, useEffect } from 'react'

interface ViewCountProps {
  count: number
  animate?: boolean
  className?: string
}

export default function ViewCount({
  count,
  animate = true,
  className = '',
}: ViewCountProps) {
  const [displayCount, setDisplayCount] = useState(animate ? 0 : count)

  // Animated counter on load
  useEffect(() => {
    if (!animate) return

    const duration = 1000 // 1 second
    const steps = 30
    const increment = count / steps
    const interval = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= count) {
        setDisplayCount(count)
        clearInterval(timer)
      } else {
        setDisplayCount(Math.floor(current))
      }
    }, interval)

    return () => clearInterval(timer)
  }, [count, animate])

  const formatCount = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <span className="font-medium tabular-nums">{formatCount(displayCount)}</span>
      <span className="sr-only">views</span>
    </span>
  )
}
