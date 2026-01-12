'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface CategoryFiltersProps {
  categorySlug: string
  className?: string
}

type SortOption = 'latest' | 'popular' | 'oldest'
type TimeFilter = 'all' | 'week' | 'month' | 'year'

// Per design spec section 8.2:
// - Background: #ffffff
// - Border bottom: 1px solid #e0e0e0
// - Height: 50px
// - Contains: Sort dropdown, filter options
// - Padding: 10px 20px

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
      className={`flex flex-wrap items-center justify-between gap-4 bg-white border-b border-[#e0e0e0] px-5 py-2 min-h-[50px] ${className}`}
    >
      {/* Sort by */}
      <div className="flex items-center gap-3">
        <span
          className="text-[13px] font-medium text-[#666666]"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Sort:
        </span>
        <div className="flex gap-1">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`px-3 py-1.5 text-[13px] font-medium transition-colors ${
                sortBy === option.value
                  ? 'bg-[#bc0000] text-white'
                  : 'bg-[#f5f5f5] text-[#666666] hover:bg-[#e0e0e0]'
              }`}
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time filter */}
      <div className="flex items-center gap-3">
        <span
          className="text-[13px] font-medium text-[#666666]"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Time:
        </span>
        <div className="flex gap-1">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleTimeChange(option.value)}
              className={`px-3 py-1.5 text-[13px] font-medium transition-colors ${
                timeFilter === option.value
                  ? 'bg-[#bc0000] text-white'
                  : 'bg-[#f5f5f5] text-[#666666] hover:bg-[#e0e0e0]'
              }`}
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
