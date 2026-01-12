'use client'

import { useState } from 'react'
import ViewsChart from '@/components/admin/ViewsChart'
import TopPostsChart from '@/components/admin/TopPostsChart'
import CategoryBreakdown from '@/components/admin/CategoryBreakdown'

type DateRange = '7d' | '30d' | '90d' | '1y'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('7d')

  // Mock stats
  const stats = {
    totalViews: 127843,
    uniqueVisitors: 45219,
    avgTimeOnSite: '2:34',
    bounceRate: 42.3,
    viewsChange: 12.5,
    visitorsChange: 8.3,
    timeChange: -2.1,
    bounceChange: -5.2,
  }

  const trafficSources = [
    { name: 'Direct', value: 35, color: 'bg-blue-500' },
    { name: 'Search', value: 28, color: 'bg-emerald-500' },
    { name: 'Social', value: 22, color: 'bg-purple-500' },
    { name: 'Referral', value: 15, color: 'bg-amber-500' },
  ]

  const deviceBreakdown = [
    { name: 'Mobile', value: 58, color: 'bg-[var(--accent-red)]' },
    { name: 'Desktop', value: 35, color: 'bg-blue-500' },
    { name: 'Tablet', value: 7, color: 'bg-emerald-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
          <p className="mt-1 text-[var(--text-muted)]">
            Track your site performance and user engagement
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as DateRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'bg-[var(--accent-red)] text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          change={stats.viewsChange}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          title="Unique Visitors"
          value={stats.uniqueVisitors.toLocaleString()}
          change={stats.visitorsChange}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <StatCard
          title="Avg. Time on Site"
          value={stats.avgTimeOnSite}
          change={stats.timeChange}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Bounce Rate"
          value={`${stats.bounceRate}%`}
          change={stats.bounceChange}
          invertChange
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Views Over Time */}
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-6">Views Over Time</h2>
          <ViewsChart />
        </div>

        {/* Top Posts */}
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-6">Top Posts</h2>
          <TopPostsChart />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Traffic Sources */}
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-6">Traffic Sources</h2>
          <div className="space-y-4">
            {trafficSources.map((source) => (
              <div key={source.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[var(--text-secondary)]">{source.name}</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{source.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-tertiary)]">
                  <div
                    className={`h-full rounded-full ${source.color}`}
                    style={{ width: `${source.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-6">Category Breakdown</h2>
          <CategoryBreakdown />
        </div>

        {/* Device Breakdown */}
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-6">Device Breakdown</h2>
          <div className="space-y-4">
            {deviceBreakdown.map((device) => (
              <div key={device.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[var(--text-secondary)]">{device.name}</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{device.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-tertiary)]">
                  <div
                    className={`h-full rounded-full ${device.color}`}
                    style={{ width: `${device.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border-default)] px-6 py-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Top Pages</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Page
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Views
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Unique
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Avg. Time
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Bounce
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {[
                { page: '/bears/caleb-williams-debut', views: 12847, unique: 8234, time: '3:45', bounce: '28%' },
                { page: '/bulls/trade-rumors-2024', views: 9823, unique: 6547, time: '2:58', bounce: '35%' },
                { page: '/cubs/offseason-moves', views: 8456, unique: 5892, time: '3:12', bounce: '31%' },
                { page: '/whitesox/rebuild-analysis', views: 6234, unique: 4123, time: '4:02', bounce: '25%' },
                { page: '/blackhawks/bedard-update', views: 5891, unique: 3987, time: '2:45', bounce: '38%' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-[var(--bg-hover)]">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{row.page}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-[var(--text-secondary)]">
                    {row.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-[var(--text-secondary)]">
                    {row.unique.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-[var(--text-secondary)]">
                    {row.time}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-[var(--text-secondary)]">
                    {row.bounce}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Helper component for stat cards
function StatCard({
  title,
  value,
  change,
  icon,
  invertChange = false,
}: {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  invertChange?: boolean
}) {
  const isPositive = invertChange ? change < 0 : change > 0

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
          {icon}
        </div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium ${
            isPositive ? 'text-emerald-500' : 'text-red-500'
          }`}
        >
          {isPositive ? (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          ) : (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          )}
          {Math.abs(change)}%
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      <p className="text-sm text-[var(--text-muted)]">{title}</p>
    </div>
  )
}
