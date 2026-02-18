'use client'

import { useState, useEffect } from 'react'
import { formatNumber } from '@/lib/analytics'
import { useScrollDepth, useReadingProgress } from '@/hooks/useScrollDepth'
import { useTimeOnPage } from '@/hooks/usePageView'

interface EngagementStatsProps {
  views: number
  readingTime: number
  className?: string
}

export default function EngagementStats({
  views,
  readingTime,
  className = '',
}: EngagementStatsProps) {
  const { depth, maxDepth } = useScrollDepth({ trackAnalytics: true })
  const { getTimeSpent } = useTimeOnPage()
  const [timeSpent, setTimeSpent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(getTimeSpent())
    }, 1000)

    return () => clearInterval(interval)
  }, [getTimeSpent])

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`
  }

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {/* Views */}
      <div className="flex items-center gap-2 text-sm text-[var(--sm-text-muted)]">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>{formatNumber(views)} views</span>
      </div>

      {/* Reading Time */}
      <div className="flex items-center gap-2 text-sm text-[var(--sm-text-muted)]">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{readingTime} min read</span>
      </div>

      {/* Time Spent */}
      <div className="flex items-center gap-2 text-sm text-[var(--sm-text-muted)]">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{formatTime(timeSpent)} on page</span>
      </div>

      {/* Scroll Progress */}
      <div className="flex items-center gap-2 text-sm text-[var(--sm-text-muted)]">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        <span>{maxDepth}% read</span>
      </div>
    </div>
  )
}

// Reading progress bar that sticks to top
export function ReadingProgressBar() {
  const progress = useReadingProgress()

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1" style={{ backgroundColor: 'var(--sm-surface)' }}>
      <div
        className="h-full bg-gradient-to-r from-[#FF0000] to-[#8B0000] transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// Compact engagement display for article cards
export function EngagementBadge({
  views,
  readingTime,
}: {
  views: number
  readingTime?: number
}) {
  return (
    <div className="flex items-center gap-3 text-xs text-[var(--sm-text-muted)]">
      <span className="flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        {formatNumber(views)}
      </span>
      {readingTime && (
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {readingTime}m
        </span>
      )}
    </div>
  )
}

// Article engagement summary (for article footer)
export function ArticleEngagementSummary({
  views,
  readingTime,
  publishedAt,
}: {
  views: number
  readingTime: number
  publishedAt: string
}) {
  const { maxDepth } = useScrollDepth()

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--sm-surface)', borderColor: 'var(--sm-border)' }}>
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--sm-text)]">
            {formatNumber(views)}
          </div>
          <div className="text-xs text-[var(--sm-text-muted)] uppercase tracking-wider">Views</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--sm-text)]">
            {readingTime}
          </div>
          <div className="text-xs text-[var(--sm-text-muted)] uppercase tracking-wider">Min Read</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--sm-text)]">
            {maxDepth}%
          </div>
          <div className="text-xs text-[var(--sm-text-muted)] uppercase tracking-wider">Read</div>
        </div>
      </div>

      <div className="text-sm text-[var(--sm-text-muted)]">
        Published {new Date(publishedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </div>
    </div>
  )
}
