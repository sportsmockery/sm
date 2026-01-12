'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface CategoryFiltersProps {
  categorySlug: string
  className?: string
}

type SortOption = 'latest' | 'popular' | 'oldest'
type TimeFilter = 'all' | 'week' | 'month' | 'year'

export default function CategoryFilters({
  categorySlug,
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
      className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {/* Sort by */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Sort by:
        </span>
        <div className="flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                sortBy === option.value
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Time:
        </span>
        <div className="flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleTimeChange(option.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                timeFilter === option.value
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* View toggle (grid/list) - optional enhancement */}
      <div className="hidden items-center gap-2 sm:flex">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8B0000] text-white dark:bg-[#FF6666]"
          title="Grid view"
        >
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
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
          </svg>
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white"
          title="List view"
        >
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
              d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
