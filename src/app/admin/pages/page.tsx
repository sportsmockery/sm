'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  PAGE_REGISTRY,
  CRON_JOBS,
  getAllCategories,
  getAllDataSourceNames,
  type PageCategory,
} from '@/lib/page-registry'

export default function AdminPagesListPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<PageCategory | null>(null)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  const categories = useMemo(() => getAllCategories(), [])
  const allDataSources = useMemo(() => getAllDataSourceNames(), [])

  const filtered = useMemo(() => {
    let pages = PAGE_REGISTRY
    if (selectedCategory) {
      pages = pages.filter(p => p.category === selectedCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      pages = pages.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.route.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.team && p.team.toLowerCase().includes(q)) ||
          (p.sport && p.sport.toLowerCase().includes(q))
      )
    }
    return pages
  }, [search, selectedCategory])

  const grouped = useMemo(() => {
    const map = new Map<PageCategory, typeof filtered>()
    for (const page of filtered) {
      const list = map.get(page.category) || []
      list.push(page)
      map.set(page.category, list)
    }
    return map
  }, [filtered])

  const toggleSection = (cat: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const totalDataSources = allDataSources.length
  const totalCrons = CRON_JOBS.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">All Pages</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Central registry of all site pages, data sources, and cron jobs
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Pages" value={PAGE_REGISTRY.length} />
        <SummaryCard label="Categories" value={categories.length} />
        <SummaryCard label="Cron Jobs" value={totalCrons} />
        <SummaryCard label="Data Sources" value={totalDataSources} />
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Search pages by name, route, or description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-red)] text-sm"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          style={{
            backgroundColor: selectedCategory === null ? 'var(--accent-red)' : 'var(--bg-card)',
            color: selectedCategory === null ? '#fff' : 'var(--text-secondary)',
            border: '1px solid',
            borderColor: selectedCategory === null ? 'var(--accent-red)' : 'var(--border-default)',
          }}
        >
          All ({PAGE_REGISTRY.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat.category}
            onClick={() => setSelectedCategory(selectedCategory === cat.category ? null : cat.category)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              backgroundColor: selectedCategory === cat.category ? cat.color : 'var(--bg-card)',
              color: selectedCategory === cat.category ? '#fff' : 'var(--text-secondary)',
              border: '1px solid',
              borderColor: selectedCategory === cat.category ? cat.color : 'var(--border-default)',
            }}
          >
            {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Results Count */}
      {(search || selectedCategory) && (
        <p className="text-xs text-[var(--text-muted)]">
          Showing {filtered.length} of {PAGE_REGISTRY.length} pages
        </p>
      )}

      {/* Grouped Pages */}
      <div className="space-y-4">
        {Array.from(grouped.entries()).map(([category, pages]) => {
          const catConfig = categories.find(c => c.category === category)
          const isCollapsed = collapsedSections.has(category)

          return (
            <div
              key={category}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(category)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: catConfig?.color || '#666' }}
                  />
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {catConfig?.label || category}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">
                    {pages.length}
                  </span>
                </div>
                <svg
                  className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Page Rows */}
              {!isCollapsed && (
                <div className="border-t border-[var(--border-default)]">
                  {pages.map(page => (
                    <Link
                      key={page.slug}
                      href={`/admin/pages/${page.slug}`}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border-default)] last:border-b-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-[var(--text-primary)]">
                            {page.name}
                          </span>
                          <code className="text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded font-mono">
                            {page.route}
                          </code>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                          {page.description}
                        </p>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 shrink-0">
                        {page.dataSources.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                            {page.dataSources.length} data
                          </span>
                        )}
                        {page.cronJobs.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">
                            {page.cronJobs.length} cron
                          </span>
                        )}
                        {page.requiresAdmin && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                            admin
                          </span>
                        )}
                        {page.requiresAuth && !page.requiresAdmin && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">
                            auth
                          </span>
                        )}
                        {page.isDynamic && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
                            dynamic
                          </span>
                        )}
                        <svg
                          className="h-4 w-4 text-[var(--text-muted)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <p className="text-sm">No pages match your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{value}</p>
    </div>
  )
}
