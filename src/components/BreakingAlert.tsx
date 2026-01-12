'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BreakingNews {
  id: string
  title: string
  slug: string
  categorySlug: string
  priority: 'normal' | 'high' | 'critical'
  timestamp: string
}

interface BreakingAlertProps {
  news?: BreakingNews
  autoHide?: boolean
  hideDelay?: number
}

export default function BreakingAlert({
  news,
  autoHide = true,
  hideDelay = 10000,
}: BreakingAlertProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentNews, setCurrentNews] = useState<BreakingNews | null>(null)

  // Demo: Show alert after component mounts
  useEffect(() => {
    if (news) {
      setCurrentNews(news)
      // Small delay for animation
      setTimeout(() => setIsVisible(true), 100)

      if (autoHide) {
        const timer = setTimeout(() => {
          setIsVisible(false)
        }, hideDelay)
        return () => clearTimeout(timer)
      }
    }
  }, [news, autoHide, hideDelay])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => setCurrentNews(null), 300) // Wait for animation
  }

  if (!currentNews) return null

  const priorityStyles = {
    normal: {
      bg: 'from-[#8B0000] to-[#FF0000]',
      border: 'border-[#FF0000]/50',
      icon: 'bg-white/20',
    },
    high: {
      bg: 'from-orange-600 to-orange-500',
      border: 'border-orange-500/50',
      icon: 'bg-white/20',
    },
    critical: {
      bg: 'from-red-700 to-red-500',
      border: 'border-red-500/50',
      icon: 'bg-white/20 animate-pulse',
    },
  }

  const styles = priorityStyles[currentNews.priority]

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-md transition-all duration-300 ${
        isVisible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`overflow-hidden rounded-2xl border ${styles.border} bg-gradient-to-r ${styles.bg} shadow-2xl shadow-black/50`}
      >
        {/* Main alert bar */}
        <div className="flex items-center gap-3 p-4">
          {/* Icon */}
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.icon}`}>
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Breaking
              </span>
              {currentNews.priority === 'critical' && (
                <span className="flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
              )}
            </div>
            <p className="mt-1 line-clamp-2 font-semibold text-white">
              {currentNews.title}
            </p>
          </div>

          {/* Expand/Close buttons */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <svg
                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expanded content */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? 'max-h-40' : 'max-h-0'
          }`}
        >
          <div className="border-t border-white/10 p-4">
            <p className="mb-4 text-sm text-white/80">
              {currentNews.timestamp}
            </p>
            <div className="flex gap-2">
              <Link
                href={`/${currentNews.categorySlug}/${currentNews.slug}`}
                className="flex-1 rounded-lg bg-white py-2 text-center text-sm font-bold text-[#8B0000] transition-colors hover:bg-white/90"
                onClick={handleDismiss}
              >
                Read Full Story
              </Link>
              <button
                onClick={handleDismiss}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar for auto-hide */}
        {autoHide && isVisible && (
          <div className="h-1 bg-white/10">
            <div
              className="h-full bg-white/50"
              style={{
                animation: `shrink ${hideDelay}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>

      {/* Keyframes for progress bar */}
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}

// Demo component for testing
export function BreakingAlertDemo() {
  const [showDemo, setShowDemo] = useState(false)

  const demoNews: BreakingNews = {
    id: 'demo-1',
    title: 'BREAKING: Bears Sign Major Free Agent to Multi-Year Deal',
    slug: 'bears-sign-free-agent',
    categorySlug: 'bears',
    priority: 'critical',
    timestamp: 'Just now',
  }

  return (
    <>
      <button
        onClick={() => setShowDemo(true)}
        className="rounded-lg bg-[#8B0000] px-4 py-2 text-sm font-bold text-white"
      >
        Show Breaking Alert Demo
      </button>

      {showDemo && (
        <BreakingAlert
          news={demoNews}
          autoHide={true}
          hideDelay={8000}
        />
      )}
    </>
  )
}
