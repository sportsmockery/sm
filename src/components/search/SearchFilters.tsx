'use client'

import { useState } from 'react'

interface SearchFiltersProps {
  categories?: { name: string; slug: string }[]
  authors?: { id: number; name: string }[]
  selectedCategory?: string
  selectedAuthor?: string
  dateRange?: string
  onFilterChange: (filters: {
    category?: string
    author?: string
    dateRange?: string
  }) => void
  className?: string
}

export default function SearchFilters({
  categories = [],
  authors = [],
  selectedCategory,
  selectedAuthor,
  dateRange,
  onFilterChange,
  className = '',
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const dateRanges = [
    { value: '', label: 'All time' },
    { value: 'day', label: 'Past 24 hours' },
    { value: 'week', label: 'Past week' },
    { value: 'month', label: 'Past month' },
    { value: 'year', label: 'Past year' },
  ]

  const hasActiveFilters = selectedCategory || selectedAuthor || dateRange

  return (
    <div className={className}>
      {/* Mobile filter toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-4 flex w-full items-center justify-between rounded-xl border px-4 py-3 font-medium transition-colors md:hidden"
        style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)' }}
      >
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
            />
          </svg>
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8B0000] text-xs text-white dark:bg-[#FF6666]">
              {[selectedCategory, selectedAuthor, dateRange].filter(Boolean).length}
            </span>
          )}
        </div>
        <svg
          className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Filters panel */}
      <div
        className={`space-y-4 rounded-xl border p-4 md:block ${
          isExpanded ? 'block' : 'hidden'
        }`}
        style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold" style={{ color: 'var(--sm-text)' }}>
            Filter Results
          </h3>
          {hasActiveFilters && (
            <button
              onClick={() => onFilterChange({})}
              className="text-sm text-[#8B0000] hover:underline dark:text-[#FF6666]"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--sm-text)' }}>
              Category
            </label>
            <select
              value={selectedCategory || ''}
              onChange={(e) =>
                onFilterChange({
                  category: e.target.value || undefined,
                  author: selectedAuthor,
                  dateRange,
                })
              }
              className="w-full rounded-lg border px-3 py-2 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:focus:border-[#FF6666] dark:focus:ring-[#FF6666]"
              style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)' }}
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Author filter */}
        {authors.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--sm-text)' }}>
              Author
            </label>
            <select
              value={selectedAuthor || ''}
              onChange={(e) =>
                onFilterChange({
                  category: selectedCategory,
                  author: e.target.value || undefined,
                  dateRange,
                })
              }
              className="w-full rounded-lg border px-3 py-2 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:focus:border-[#FF6666] dark:focus:ring-[#FF6666]"
              style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)' }}
            >
              <option value="">All authors</option>
              {authors.map((author) => (
                <option key={author.id} value={String(author.id)}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date range filter */}
        <div>
          <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--sm-text)' }}>
            Date Range
          </label>
          <select
            value={dateRange || ''}
            onChange={(e) =>
              onFilterChange({
                category: selectedCategory,
                author: selectedAuthor,
                dateRange: e.target.value || undefined,
              })
            }
            className="w-full rounded-lg border px-3 py-2 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:focus:border-[#FF6666] dark:focus:ring-[#FF6666]"
            style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)' }}
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
