'use client'

import { useState } from 'react'

interface AdvancedSearchProps {
  onSearch: (options: {
    exactPhrase?: string
    excludeWords?: string[]
    category?: string
    dateFrom?: string
    dateTo?: string
  }) => void
  categories?: { name: string; slug: string }[]
  className?: string
}

export default function AdvancedSearch({
  onSearch,
  categories = [],
  className = '',
}: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [exactPhrase, setExactPhrase] = useState('')
  const [excludeWords, setExcludeWords] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const handleSearch = () => {
    onSearch({
      exactPhrase: exactPhrase.trim() || undefined,
      excludeWords: excludeWords
        .split(',')
        .map((w) => w.trim())
        .filter(Boolean),
      category: selectedCategory || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })
  }

  const handleReset = () => {
    setExactPhrase('')
    setExcludeWords('')
    setSelectedCategory('')
    setDateFrom('')
    setDateTo('')
  }

  const hasFilters = exactPhrase || excludeWords || selectedCategory || dateFrom || dateTo

  return (
    <div className={className}>
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-[#8B0000] hover:underline dark:text-[#FF6666]"
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
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
          />
        </svg>
        Advanced Search
        {hasFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8B0000] text-xs text-white dark:bg-[#FF6666]">
            !
          </span>
        )}
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

      {/* Expanded panel */}
      {isExpanded && (
        <div className="mt-4 rounded-xl border p-6" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Exact phrase */}
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--sm-text)' }}>
                Exact phrase
              </label>
              <input
                type="text"
                value={exactPhrase}
                onChange={(e) => setExactPhrase(e.target.value)}
                placeholder='e.g., "trade deadline"'
                className="w-full rounded-lg border px-3 py-2 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:focus:border-[#FF6666] dark:focus:ring-[#FF6666]"
                style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)' }}
              />
              <p className="mt-1 text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                Find results with this exact phrase
              </p>
            </div>

            {/* Exclude words */}
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--sm-text)' }}>
                Exclude words
              </label>
              <input
                type="text"
                value={excludeWords}
                onChange={(e) => setExcludeWords(e.target.value)}
                placeholder="e.g., rumors, speculation"
                className="w-full rounded-lg border px-3 py-2 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:focus:border-[#FF6666] dark:focus:ring-[#FF6666]"
                style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)' }}
              />
              <p className="mt-1 text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                Separate words with commas
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--sm-text)' }}>
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--sm-text)' }}>
                  From date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:focus:border-[#FF6666] dark:focus:ring-[#FF6666]"
                  style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)' }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--sm-text)' }}>
                  To date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000] dark:focus:border-[#FF6666] dark:focus:ring-[#FF6666]"
                  style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)' }}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleReset}
              className="rounded-lg px-4 py-2 text-sm font-medium"
              style={{ color: 'var(--sm-text-muted)' }}
            >
              Reset
            </button>
            <button
              onClick={handleSearch}
              className="rounded-lg bg-[#8B0000] px-4 py-2 text-sm font-medium text-white hover:bg-[#a00000] dark:bg-[#FF6666] dark:hover:bg-[#FF8888]"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
