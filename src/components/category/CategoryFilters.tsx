'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface CategoryFiltersProps {
  categorySlug: string
  categoryName?: string
  postCount?: number
  className?: string
}

type SortOption = 'latest' | 'popular' | 'oldest'
type TimeFilter = 'all' | 'week' | 'month' | 'year'

export default function CategoryFilters({
  categorySlug,
  categoryName,
  postCount,
  className = '',
}: CategoryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'latest'
  )
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(
    (searchParams.get('time') as TimeFilter) || 'all'
  )

  const updateFilters = (newSort?: SortOption, newTime?: TimeFilter) => {
    const sort = newSort || sortBy
    const time = newTime || timeFilter

    const params = new URLSearchParams()
    if (sort !== 'latest') params.set('sort', sort)
    if (time !== 'all') params.set('time', time)

    const queryString = params.toString()
    router.push(`/${categorySlug}${queryString ? `?${queryString}` : ''}`)
  }

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    updateFilters(newSort, timeFilter)
  }

  const handleTimeChange = (newTime: TimeFilter) => {
    setTimeFilter(newTime)
    updateFilters(sortBy, newTime)
  }

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Popular' },
    { value: 'oldest', label: 'Oldest' },
  ]

  const timeOptions: { value: TimeFilter; label: string }[] = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ]

  return (
    <div
      className={`border-b bg-white dark:bg-zinc-900 border-[#e0e0e0] dark:border-white/20 ${className}`}
    >
      <div className="mx-auto max-w-[1110px] px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 py-3">
          {/* Category name and count */}
          {categoryName && (
            <div className="flex items-center gap-3">
              <h1
                className="text-lg md:text-xl font-bold text-[var(--text-primary)]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {categoryName}
              </h1>
              {postCount !== undefined && (
                <span className="text-sm text-[var(--text-muted)]">
                  {postCount.toLocaleString()} articles
                </span>
              )}
            </div>
          )}

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Sort by */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--text-muted)]">
                Sort:
              </span>
              <div className="flex gap-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      sortBy === option.value
                        ? 'bg-[#bc0000] text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-[var(--text-secondary)] hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--text-muted)]">
                Time:
              </span>
              <div className="flex gap-1">
                {timeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleTimeChange(option.value)}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      timeFilter === option.value
                        ? 'bg-[#bc0000] text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-[var(--text-secondary)] hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
