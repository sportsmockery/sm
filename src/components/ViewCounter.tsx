'use client'

import { useEffect, useState } from 'react'
import { formatNumber } from '@/lib/analytics'

interface ViewCounterProps {
  postId: number
  initialViews?: number
  showIcon?: boolean
  className?: string
  incrementOnMount?: boolean
}

export default function ViewCounter({
  postId,
  initialViews = 0,
  showIcon = true,
  className = '',
  incrementOnMount = false,
}: ViewCounterProps) {
  const [views, setViews] = useState(initialViews)
  const [hasTracked, setHasTracked] = useState(false)

  useEffect(() => {
    if (incrementOnMount && !hasTracked) {
      // Track the view
      fetch(`/api/views/${postId}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.views) {
            setViews(data.views)
          }
        })
        .catch(console.error)

      setHasTracked(true)
    }
  }, [postId, incrementOnMount, hasTracked])

  return (
    <div className={`flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 ${className}`}>
      {showIcon && (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      )}
      <span className="text-sm font-medium">{formatNumber(views)} views</span>
    </div>
  )
}

// Compact version for cards
export function ViewCounterCompact({
  views,
  className = '',
}: {
  views: number
  className?: string
}) {
  return (
    <span className={`flex items-center gap-1 text-xs text-zinc-500 ${className}`}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
      {formatNumber(views)}
    </span>
  )
}
