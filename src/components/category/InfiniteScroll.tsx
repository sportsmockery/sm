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
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-[#8B0000] dark:border-zinc-600 dark:border-t-[#FF6666]" />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Loading more articles...
            </span>
          </div>
        )}

        {!loading && !isLoading && hasMore && (
          <button
            onClick={handleLoadMore}
            className="rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition-all hover:border-[#8B0000]/30 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-[#FF6666]/30 dark:hover:bg-zinc-800"
          >
            Load More Articles
          </button>
        )}

        {!hasMore && (
          <div className="flex flex-col items-center gap-2 text-center">
            <svg
              className="h-8 w-8 text-zinc-300 dark:text-zinc-600"
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
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              You&apos;ve reached the end
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
