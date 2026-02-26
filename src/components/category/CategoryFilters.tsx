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
    { value: 'all', label: 'All' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ]

  return (
    <div className={`bg-[var(--sm-surface)] border-b border-[var(--sm-border)] ${className}`}>
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Category Title */}
          <div className="flex items-baseline gap-3">
            <h1
              className="text-xl font-bold text-[var(--sm-text)]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {categoryName}
            </h1>
            {postCount !== undefined && (
              <span className="text-sm text-[var(--sm-text-muted)]">
                {postCount.toLocaleString()} articles
              </span>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            {/* Sort */}
            <div className="flex items-center gap-1.5">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    sortBy === option.value
                      ? 'bg-[var(--sm-text)] text-[var(--sm-surface)]'
                      : 'text-[var(--sm-text-muted)] hover:text-[var(--sm-text)] hover:bg-[var(--sm-card)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-[var(--sm-border)]" />

            {/* Time */}
            <div className="flex items-center gap-1.5">
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleTimeChange(option.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    timeFilter === option.value
                      ? 'bg-[var(--sm-text)] text-[var(--sm-surface)]'
                      : 'text-[var(--sm-text-muted)] hover:text-[var(--sm-text)] hover:bg-[var(--sm-card)]'
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
  )
}
