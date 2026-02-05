'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Chart {
  id: string
  title: string
  type: string
  createdAt: string
}

const chartTypeLabels: Record<string, string> = {
  bar: 'Bar Chart',
  line: 'Line Chart',
  pie: 'Pie Chart',
  'player-comparison': 'Player Comparison',
  'team-stats': 'Team Stats',
}

export default function StudioChartsPage() {
  const [charts, setCharts] = useState<Chart[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCharts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/charts')
      if (!response.ok) throw new Error('Failed to fetch charts')
      const data = await response.json()
      setCharts(data.charts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load charts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCharts()
  }, [fetchCharts])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Charts</h1>
          <p className="mt-1 text-[var(--text-muted)]">Create data visualizations for articles</p>
        </div>
        <Link
          href="/studio/charts/new"
          className="inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-medium"
          style={{ backgroundColor: '#bc0000', color: '#ffffff' }}
        >
          New Chart
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-red)]"></div>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchCharts} className="mt-4 text-sm text-red-400 underline">
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && charts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
          <svg className="h-16 w-16 text-[var(--text-muted)] mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <p className="text-[var(--text-muted)] text-center mb-4">No charts yet</p>
          <Link
            href="/studio/charts/new"
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium"
            style={{ backgroundColor: '#bc0000', color: '#ffffff' }}
          >
            Create your first chart
          </Link>
        </div>
      )}

      {!loading && !error && charts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {charts.map((chart) => (
            <Link
              key={chart.id}
              href={`/studio/charts/${chart.id}/edit`}
              className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 hover:border-[var(--accent-red)] transition-colors"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-[var(--text-primary)] line-clamp-2">{chart.title}</h3>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">
                  {chartTypeLabels[chart.type] || chart.type}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(chart.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
                <code className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-1 rounded">
                  [chart:{chart.id}]
                </code>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
