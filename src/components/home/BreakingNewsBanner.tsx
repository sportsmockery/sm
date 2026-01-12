'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BreakingNews {
  id: string
  headline: string
  slug: string
  category: string
  timestamp: string
  urgent: boolean
}

interface BreakingNewsBannerProps {
  news?: BreakingNews | null
  onClose?: () => void
  className?: string
}

export default function BreakingNewsBanner({ news, onClose, className = '' }: BreakingNewsBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    if (!news) return

    // Calculate time ago
    const updateTimeAgo = () => {
      const now = new Date()
      const posted = new Date(news.timestamp)
      const diffMs = now.getTime() - posted.getTime()
      const diffMins = Math.floor(diffMs / 60000)

      if (diffMins < 1) {
        setTimeAgo('Just now')
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins}m ago`)
      } else {
        const diffHours = Math.floor(diffMins / 60)
        setTimeAgo(`${diffHours}h ago`)
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [news])

  if (!news || !isVisible) return null

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  return (
    <div
      className={`relative overflow-hidden bg-[#8B0000] ${className}`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#8B0000] via-red-600 to-[#8B0000] opacity-50" />

      {/* Pulsing effect for urgent news */}
      {news.urgent && (
        <div className="absolute inset-0 animate-pulse bg-white/10" style={{ animationDuration: '2s' }} />
      )}

      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <div className="flex flex-1 items-center gap-3 overflow-hidden">
          {/* Breaking badge */}
          <span className="flex shrink-0 items-center gap-1.5 rounded bg-white px-2 py-0.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
            </span>
            <span className="text-xs font-bold uppercase text-[#8B0000]">Breaking</span>
          </span>

          {/* Headline */}
          <Link
            href={`/${news.category}/${news.slug}`}
            className="group flex min-w-0 flex-1 items-center gap-2 overflow-hidden"
          >
            <span className="truncate text-sm font-semibold text-white group-hover:underline">
              {news.headline}
            </span>
            <svg
              className="h-4 w-4 shrink-0 text-white/70 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>

          {/* Timestamp */}
          <span className="hidden shrink-0 text-xs text-white/60 sm:block">
            {timeAgo}
          </span>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="ml-4 shrink-0 rounded p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Dismiss breaking news"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar for auto-dismiss (optional) */}
      {/* <div className="absolute bottom-0 left-0 h-0.5 w-full bg-white/20">
        <div className="h-full bg-white animate-shrink-width" style={{ animationDuration: '10s' }} />
      </div> */}
    </div>
  )
}

// Sample breaking news for development
export const sampleBreakingNews: BreakingNews = {
  id: '1',
  headline: 'Bears quarterback ruled out for Sunday\'s game against Packers',
  slug: 'bears-qb-out-packers-game',
  category: 'bears',
  timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
  urgent: true,
}
