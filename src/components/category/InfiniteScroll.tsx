'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface InfiniteScrollProps {
  loadMore: () => Promise<void>
  hasMore: boolean
  isLoading?: boolean
  children: React.ReactNode
  className?: string
}

export default function InfiniteScroll({
  loadMore,
  hasMore,
  isLoading = false,
  children,
  className = '',
}: InfiniteScrollProps) {
  const [loading, setLoading] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  const handleLoadMore = useCallback(async () => {
    if (loading || isLoading || !hasMore) return
    setLoading(true)
    await loadMore()
    setLoading(false)
  }, [loading, isLoading, hasMore, loadMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !isLoading) {
          handleLoadMore()
        }
      },
      { rootMargin: '100px' }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, isLoading, handleLoadMore])

  return (
    <div className={className}>
      {children}

      {/* Loading/Load More trigger */}
      <div ref={observerRef} className="mt-8 flex flex-col items-center justify-center">
        {(loading || isLoading) && hasMore && (
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full" style={{ border: '2px solid var(--sm-border)', borderTopColor: 'var(--sm-accent)' }} />
            <span className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
              Loading more articles...
            </span>
          </div>
        )}

        {!loading && !isLoading && hasMore && (
          <button
            onClick={handleLoadMore}
            className="rounded-xl px-6 py-3 text-sm font-semibold transition-all"
            style={{ backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)', border: '1px solid var(--sm-border)' }}
          >
            Load More Articles
          </button>
        )}

        {!hasMore && (
          <div className="flex flex-col items-center gap-2 text-center">
            <svg
              className="h-8 w-8"
              style={{ color: 'var(--sm-text-dim)' }}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
              You&apos;ve reached the end
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
