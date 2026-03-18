'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { TEAM_LABELS, CONTENT_TYPE_LABELS } from '@/types/fan-showcase'
import type { Team, ContentType } from '@/types/fan-showcase'

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'featured', label: 'Featured' },
  { value: 'most_viewed', label: 'Most Viewed' },
]

export default function ShowcaseFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentTeam = searchParams.get('team') || 'all'
  const currentType = searchParams.get('type') || 'all'
  const currentSort = searchParams.get('sort') || 'latest'

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === 'all' || value === 'latest') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      params.delete('page')
      const qs = params.toString()
      router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Team filter */}
      <select
        value={currentTeam}
        onChange={e => updateFilter('team', e.target.value)}
        className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[#BC0000] focus:outline-none focus:ring-1 focus:ring-[#BC0000]"
        aria-label="Filter by team"
      >
        <option value="all">All Teams</option>
        {Object.entries(TEAM_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {/* Type filter */}
      <select
        value={currentType}
        onChange={e => updateFilter('type', e.target.value)}
        className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[#BC0000] focus:outline-none focus:ring-1 focus:ring-[#BC0000]"
        aria-label="Filter by content type"
      >
        <option value="all">All Types</option>
        {Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={currentSort}
        onChange={e => updateFilter('sort', e.target.value)}
        className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[#BC0000] focus:outline-none focus:ring-1 focus:ring-[#BC0000]"
        aria-label="Sort submissions"
      >
        {SORT_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
