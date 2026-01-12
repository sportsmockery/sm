'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'sm_recent_searches'
const MAX_RECENT_SEARCHES = 10

interface RecentSearchesProps {
  onSearchClick?: (query: string) => void
  className?: string
}

export function saveRecentSearch(query: string) {
  if (typeof window === 'undefined') return

  const trimmed = query.trim()
  if (!trimmed) return

  const stored = localStorage.getItem(STORAGE_KEY)
  const searches: string[] = stored ? JSON.parse(stored) : []

  // Remove if already exists and add to front
  const filtered = searches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())
  filtered.unshift(trimmed)

  // Keep only max items
  const limited = filtered.slice(0, MAX_RECENT_SEARCHES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limited))
}

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []

  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function clearRecentSearches() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export default function RecentSearches({
  onSearchClick,
  className = '',
}: RecentSearchesProps) {
  const [searches, setSearches] = useState<string[]>([])

  useEffect(() => {
    setSearches(getRecentSearches())
  }, [])

  const handleClear = () => {
    clearRecentSearches()
    setSearches([])
  }

  const handleRemove = (query: string) => {
    const filtered = searches.filter((s) => s !== query)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    setSearches(filtered)
  }

  if (searches.length === 0) return null

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
          <svg
            className="h-4 w-4 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Recent Searches
        </h3>
        <button
          onClick={handleClear}
          className="text-sm text-zinc-500 hover:text-[#8B0000] dark:hover:text-[#FF6666]"
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {searches.map((query) => (
          <div
            key={query}
            className="group flex items-center gap-1 rounded-full border border-zinc-200 bg-white pl-3 pr-1 py-1.5 transition-colors hover:border-[#8B0000]/30 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-[#FF6666]/30"
          >
            {onSearchClick ? (
              <button
                onClick={() => onSearchClick(query)}
                className="text-sm text-zinc-700 hover:text-[#8B0000] dark:text-zinc-300 dark:hover:text-[#FF6666]"
              >
                {query}
              </button>
            ) : (
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                className="text-sm text-zinc-700 hover:text-[#8B0000] dark:text-zinc-300 dark:hover:text-[#FF6666]"
              >
                {query}
              </Link>
            )}
            <button
              onClick={() => handleRemove(query)}
              className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-zinc-400 opacity-0 transition-all hover:bg-zinc-100 hover:text-zinc-600 group-hover:opacity-100 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
