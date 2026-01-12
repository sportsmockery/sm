'use client'

import { useState } from 'react'

interface DataPoint {
  date: string
  views: number
}

// Generate sample data for the last 30 days
const generateSampleData = (): DataPoint[] => {
  const data: DataPoint[] = []
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 5000) + 1000,
    })
  }

  return data
}

interface DashboardChartProps {
  data?: DataPoint[]
  className?: string
}

export default function DashboardChart({ data = generateSampleData(), className = '' }: DashboardChartProps) {
  const [period, setPeriod] = useState<'7' | '14' | '30'>('30')

  const filteredData = data.slice(-parseInt(period))
  const maxViews = Math.max(...filteredData.map((d) => d.views))
  const totalViews = filteredData.reduce((sum, d) => sum + d.views, 0)
  const avgViews = Math.round(totalViews / filteredData.length)

  return (
    <div className={`rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-white">Views Overview</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {totalViews.toLocaleString()} total views · {avgViews.toLocaleString()} avg/day
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          {(['7', '14', '30'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 flex h-full flex-col justify-between text-xs text-zinc-400">
          <span>{maxViews.toLocaleString()}</span>
          <span>{Math.round(maxViews / 2).toLocaleString()}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="ml-12 h-full">
          {/* Grid lines */}
          <div className="absolute inset-y-0 left-12 right-0 flex flex-col justify-between">
            {[0, 1, 2].map((i) => (
              <div key={i} className="border-t border-zinc-100 dark:border-zinc-800" />
            ))}
          </div>

          {/* Bars */}
          <div className="relative flex h-full items-end gap-1">
            {filteredData.map((point, index) => {
              const height = (point.views / maxViews) * 100
              return (
                <div
                  key={point.date}
                  className="group relative flex-1"
                  style={{ height: '100%' }}
                >
                  <div
                    className="absolute bottom-0 w-full rounded-t bg-gradient-to-t from-[#8B0000] to-red-500 opacity-80 transition-opacity hover:opacity-100"
                    style={{ height: `${height}%` }}
                  />
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 scale-0 rounded-lg bg-zinc-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100 dark:bg-zinc-700">
                    <p className="font-medium">{point.views.toLocaleString()} views</p>
                    <p className="text-zinc-400">
                      {new Date(point.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="ml-12 mt-2 flex justify-between text-xs text-zinc-400">
        <span>
          {new Date(filteredData[0]?.date || '').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <span>
          {new Date(filteredData[filteredData.length - 1]?.date || '').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </div>
  )
}
