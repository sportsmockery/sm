'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

// ── Types ─────────────────────────────────────────────────────────────────────
interface DashboardData {
  overview: {
    totalPosts: number
    allTimeViews: number
    periodPosts: number
    prevPeriodPosts: number
    periodViews: number
    prevPeriodViews: number
    totalAuthors: number
    totalCategories: number
    avgReadTime: number
  }
  writers: Array<{
    id: number
    name: string
    avatar: string | null
    email: string
    role: string
    posts: number
    views: number
    avgViews: number
  }>
  categories: Array<{ name: string; count: number; views: number }>
  recentPosts: Array<{
    id: number
    title: string
    slug: string
    views: number
    published_at: string
    author_name: string
    category_name: string
    featured_image: string | null
    importance_score: number | null
    read_time_estimate: number | null
  }>
  topContent: Array<{
    id: number
    title: string
    slug: string
    views: number
    published_at: string
    author_name: string
    category_name: string
  }>
  publishingTrend: Array<{ date: string; count: number; views: number }>
  social: {
    youtube: Array<{
      handle: string
      label: string
      name: string
      subscribers: number
      totalViews: number
      videoCount: number
      thumbnail: string
    }>
    x: Array<{
      username: string
      label: string
      name: string
      followers: number
      following: number
      tweets: number
      listed: number
      profileImage: string
    }>
    facebook: Array<{
      id: string
      label: string
      name: string
      followers: number
      likes: number
      picture: string
      needsToken?: boolean
    }>
  }
  range: string
  timestamp: number
}

// ── Constants ─────────────────────────────────────────────────────────────────
const RANGES = [
  { key: '7d', label: '7D' },
  { key: '28d', label: '28D' },
  { key: '90d', label: '90D' },
  { key: '1y', label: '1Y' },
]

const TABS = [
  { key: 'overview', label: 'Overview', icon: '◉' },
  { key: 'writers', label: 'Writers', icon: '✍' },
  { key: 'social', label: 'Social Media', icon: '◈' },
  { key: 'content', label: 'Top Content', icon: '★' },
]

const CHART_COLORS = {
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  cyan: '#06b6d4',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6',
  orange: '#f97316',
}

const CATEGORY_PALETTE = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#6366f1', '#14b8a6', '#f97316',
]

// ── Utilities ─────────────────────────────────────────────────────────────────
function fmtN(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return n.toLocaleString()
}

function fmtPct(current: number, previous: number): { value: string; positive: boolean } {
  if (previous === 0) return { value: current > 0 ? '+∞' : '0%', positive: current > 0 }
  const pct = ((current - previous) / previous) * 100
  return {
    value: (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%',
    positive: pct >= 0,
  }
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fmtDateFull(d: string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ── Chart options factory ─────────────────────────────────────────────────────
function darkLineOptions(title?: string) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        display: true,
        labels: { color: 'rgba(255,255,255,0.5)', font: { size: 11, family: 'Inter' }, boxWidth: 12, padding: 16 },
      },
      title: title ? { display: true, text: title, color: 'rgba(255,255,255,0.7)', font: { size: 13, weight: 'bold' as const, family: 'Inter' }, padding: { bottom: 16 } } : { display: false },
      tooltip: {
        backgroundColor: 'rgba(10,14,26,0.95)',
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.8)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        bodyFont: { family: 'Inter' },
        titleFont: { family: 'Inter', weight: 'bold' as const },
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 10, family: 'Inter' }, maxRotation: 0, maxTicksLimit: 12 },
        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
      },
      y: {
        ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 10, family: 'Inter' } },
        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        beginAtZero: true,
      },
    },
  }
}

function darkBarOptions(title?: string) {
  return {
    ...darkLineOptions(title),
    scales: {
      ...darkLineOptions(title).scales,
      x: { ...darkLineOptions(title).scales.x, stacked: false },
      y: { ...darkLineOptions(title).scales.y, stacked: false },
    },
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────
function GlassCard({ children, className = '', hover = false }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={`glass-card ${hover ? 'glass-card-hover' : ''} ${className}`}>
      {children}
    </div>
  )
}

function KPICard({ title, value, subtitle, change, icon, accentColor }: {
  title: string
  value: string
  subtitle?: string
  change?: { value: string; positive: boolean }
  icon: React.ReactNode
  accentColor: string
}) {
  return (
    <GlassCard className="kpi-card relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{title}</p>
          <p className="text-2xl font-bold mt-1 tabular-nums" style={{ color: '#f0f2f5' }}>{value}</p>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{subtitle}</p>}
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-semibold ${change.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                {change.value}
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>vs prev period</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}15`, color: accentColor }}>
          {icon}
        </div>
      </div>
    </GlassCard>
  )
}

function SocialCard({ platform, name, handle, metric, metricLabel, secondaryMetric, secondaryLabel, image, color, icon }: {
  platform: string
  name: string
  handle: string
  metric: number
  metricLabel: string
  secondaryMetric?: number
  secondaryLabel?: string
  image?: string
  color: string
  icon: React.ReactNode
}) {
  return (
    <GlassCard hover className="relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div className="flex items-center gap-3 mb-3">
        {image ? (
          <img src={image} alt={name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${color}20`, color }}>{icon}</div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate" style={{ color: '#f0f2f5' }}>{name}</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>@{handle}</p>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl font-bold tabular-nums" style={{ color }}>{fmtN(metric)}</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{metricLabel}</p>
        </div>
        {secondaryMetric !== undefined && (
          <div className="text-right">
            <p className="text-sm font-semibold tabular-nums" style={{ color: 'rgba(255,255,255,0.7)' }}>{fmtN(secondaryMetric)}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{secondaryLabel}</p>
          </div>
        )}
      </div>
    </GlassCard>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-card h-72 rounded-2xl" />
        <div className="glass-card h-72 rounded-2xl" />
      </div>
    </div>
  )
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icons = {
  posts: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  views: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  writers: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  categories: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path d="M6 6h.008v.008H6V6z" /></svg>,
  clock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  refresh: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
  youtube: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
  x: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
  facebook: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ExecDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('28d')
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch(`/api/exec-dashboard?range=${range}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [range])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="exec-dash -m-4 md:-m-6 lg:-m-8" style={{ minHeight: '100vh' }}>
      <style>{execStyles}</style>

      <div className="exec-dash-inner" style={{ padding: '24px', maxWidth: 1600, margin: '0 auto' }}>
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#f0f2f5' }}>Exec Dashboard</h1>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>SportsMockery Performance Command Center</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Date range selector */}
            <div className="flex rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {RANGES.map(r => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  className="px-3 py-1.5 text-xs font-semibold transition-all"
                  style={{
                    background: range === r.key ? 'rgba(59,130,246,0.2)' : 'transparent',
                    color: range === r.key ? '#3b82f6' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {/* Refresh */}
            <button
              onClick={() => fetchData(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
              disabled={refreshing}
            >
              <span className={refreshing ? 'animate-spin' : ''}>{Icons.refresh}</span>
              Refresh
            </button>
            {/* Timestamp */}
            {data?.timestamp && (
              <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {timeAgo(data.timestamp)}
              </span>
            )}
          </div>
        </div>

        {loading ? <LoadingSkeleton /> : data ? (
          <>
            {/* ── KPI Row ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <KPICard
                title="Total Posts"
                value={fmtN(data.overview.totalPosts)}
                subtitle={`${data.overview.periodPosts} this period`}
                change={fmtPct(data.overview.periodPosts, data.overview.prevPeriodPosts)}
                icon={Icons.posts}
                accentColor={CHART_COLORS.blue}
              />
              <KPICard
                title="All-Time Views"
                value={fmtN(data.overview.allTimeViews)}
                subtitle={`${fmtN(data.overview.periodViews)} this period`}
                change={fmtPct(data.overview.periodViews, data.overview.prevPeriodViews)}
                icon={Icons.views}
                accentColor={CHART_COLORS.purple}
              />
              <KPICard
                title="Active Writers"
                value={data.overview.totalAuthors.toString()}
                subtitle={`${data.writers.length} active this period`}
                icon={Icons.writers}
                accentColor={CHART_COLORS.green}
              />
              <KPICard
                title="Categories"
                value={data.overview.totalCategories.toString()}
                subtitle={`${data.categories.length} active this period`}
                icon={Icons.categories}
                accentColor={CHART_COLORS.amber}
              />
              <KPICard
                title="Avg Read Time"
                value={`${data.overview.avgReadTime}m`}
                subtitle="minutes per article"
                icon={Icons.clock}
                accentColor={CHART_COLORS.cyan}
              />
            </div>

            {/* ── Tabs ──────────────────────────────────────────────────── */}
            <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: activeTab === tab.key ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: activeTab === tab.key ? '#3b82f6' : 'rgba(255,255,255,0.4)',
                    border: activeTab === tab.key ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                  }}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* ── Tab Content ───────────────────────────────────────────── */}
            {activeTab === 'overview' && <OverviewTab data={data} />}
            {activeTab === 'writers' && <WritersTab data={data} />}
            {activeTab === 'social' && <SocialTab data={data} />}
            {activeTab === 'content' && <ContentTab data={data} />}
          </>
        ) : (
          <div className="text-center py-20" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Failed to load dashboard data. Try refreshing.
          </div>
        )}
      </div>
    </div>
  )
}

// ── OVERVIEW TAB ──────────────────────────────────────────────────────────────
function OverviewTab({ data }: { data: DashboardData }) {
  const trend = data.publishingTrend

  const viewsChartData = {
    labels: trend.map(t => fmtDate(t.date)),
    datasets: [
      {
        label: 'Views',
        data: trend.map(t => t.views),
        borderColor: CHART_COLORS.blue,
        backgroundColor: 'rgba(59,130,246,0.08)',
        fill: true,
        tension: 0.35,
        pointRadius: trend.length > 30 ? 0 : 3,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  }

  const publishingChartData = {
    labels: trend.map(t => fmtDate(t.date)),
    datasets: [
      {
        label: 'Articles Published',
        data: trend.map(t => t.count),
        backgroundColor: 'rgba(139,92,246,0.6)',
        borderColor: CHART_COLORS.purple,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  }

  const catData = {
    labels: data.categories.map(c => c.name),
    datasets: [{
      data: data.categories.map(c => c.count),
      backgroundColor: CATEGORY_PALETTE.slice(0, data.categories.length),
      borderColor: 'rgba(10,14,26,0.8)',
      borderWidth: 2,
      hoverOffset: 6,
    }],
  }

  const catOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { color: 'rgba(255,255,255,0.5)', font: { size: 10, family: 'Inter' }, boxWidth: 10, padding: 8 },
      },
      tooltip: {
        backgroundColor: 'rgba(10,14,26,0.95)',
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.8)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
      },
    },
  }

  // Top writers horizontal bar
  const topWriters = data.writers.slice(0, 8)
  const writerChartData = {
    labels: topWriters.map(w => w.name),
    datasets: [{
      label: 'Views',
      data: topWriters.map(w => w.views),
      backgroundColor: topWriters.map((_, i) => CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] + '80'),
      borderColor: topWriters.map((_, i) => CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]),
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false,
    }],
  }

  const writerBarOpts = {
    ...darkBarOptions(),
    indexAxis: 'y' as const,
    plugins: {
      ...darkBarOptions().plugins,
      legend: { display: false },
    },
  }

  return (
    <div className="space-y-4">
      {/* Row 1: Views Trend + Category Breakdown */}
      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Traffic Trends</h3>
          <div style={{ height: 280 }}>
            <Line data={viewsChartData} options={darkLineOptions()} />
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Category Distribution</h3>
          <div style={{ height: 280 }}>
            <Doughnut data={catData} options={catOptions} />
          </div>
        </GlassCard>
      </div>

      {/* Row 2: Publishing Cadence + Top Writers */}
      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Publishing Cadence</h3>
          <div style={{ height: 260 }}>
            <Bar data={publishingChartData} options={darkBarOptions()} />
          </div>
        </GlassCard>
        <GlassCard>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Top Writers by Views</h3>
          <div style={{ height: 260 }}>
            <Bar data={writerChartData} options={writerBarOpts} />
          </div>
        </GlassCard>
      </div>

      {/* Row 3: Recent Articles */}
      <GlassCard>
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Recent Articles</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Title', 'Author', 'Category', 'Views', 'Published'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentPosts.slice(0, 10).map((post, i) => (
                <tr key={post.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-2.5">
                    <p className="text-sm font-medium truncate max-w-xs" style={{ color: '#e0e2e8' }}>{post.title}</p>
                  </td>
                  <td className="px-3 py-2.5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{post.author_name}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}>
                      {post.category_name}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs font-semibold tabular-nums" style={{ color: 'rgba(255,255,255,0.6)' }}>{fmtN(post.views || 0)}</td>
                  <td className="px-3 py-2.5 text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.35)' }}>{fmtDateFull(post.published_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}

// ── WRITERS TAB ───────────────────────────────────────────────────────────────
function WritersTab({ data }: { data: DashboardData }) {
  const [sortBy, setSortBy] = useState<'views' | 'posts' | 'avgViews'>('views')
  const sorted = [...data.writers].sort((a, b) => b[sortBy] - a[sortBy])

  const cols = [
    { key: 'rank', label: '#', sortable: false },
    { key: 'name', label: 'Writer', sortable: false },
    { key: 'posts', label: 'Posts', sortable: true },
    { key: 'views', label: 'Views', sortable: true },
    { key: 'avgViews', label: 'Avg Views', sortable: true },
    { key: 'role', label: 'Role', sortable: false },
  ]

  // Performance distribution chart
  const writerDistData = {
    labels: sorted.slice(0, 15).map(w => w.name.split(' ')[0]),
    datasets: [
      {
        label: 'Posts',
        data: sorted.slice(0, 15).map(w => w.posts),
        backgroundColor: 'rgba(59,130,246,0.6)',
        borderColor: CHART_COLORS.blue,
        borderWidth: 1,
        borderRadius: 3,
      },
      {
        label: 'Avg Views/Post',
        data: sorted.slice(0, 15).map(w => w.avgViews),
        backgroundColor: 'rgba(139,92,246,0.6)',
        borderColor: CHART_COLORS.purple,
        borderWidth: 1,
        borderRadius: 3,
      },
    ],
  }

  return (
    <div className="space-y-4">
      {/* Writer performance chart */}
      <GlassCard>
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Writer Performance Distribution</h3>
        <div style={{ height: 300 }}>
          <Bar data={writerDistData} options={darkBarOptions()} />
        </div>
      </GlassCard>

      {/* Writer leaderboard table */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>Writer Leaderboard</h3>
          <div className="flex gap-1">
            {(['views', 'posts', 'avgViews'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className="px-2 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: sortBy === s ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: sortBy === s ? '#3b82f6' : 'rgba(255,255,255,0.35)',
                }}
              >
                {s === 'avgViews' ? 'Avg Views' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {cols.map(c => (
                  <th key={c.key} className="text-left px-3 py-2 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((writer, i) => (
                <tr key={writer.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-3">
                    <span className="text-xs font-bold tabular-nums" style={{
                      color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c2f' : 'rgba(255,255,255,0.3)',
                    }}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      {writer.avatar ? (
                        <img src={writer.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] + '20', color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] }}>
                          {writer.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#e0e2e8' }}>{writer.name}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{writer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm font-semibold tabular-nums" style={{ color: 'rgba(255,255,255,0.6)' }}>{writer.posts}</td>
                  <td className="px-3 py-3 text-sm font-semibold tabular-nums" style={{ color: CHART_COLORS.blue }}>{fmtN(writer.views)}</td>
                  <td className="px-3 py-3 text-sm font-semibold tabular-nums" style={{ color: CHART_COLORS.purple }}>{fmtN(writer.avgViews)}</td>
                  <td className="px-3 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                      {writer.role || 'author'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}

// ── SOCIAL TAB ────────────────────────────────────────────────────────────────
function SocialTab({ data }: { data: DashboardData }) {
  const { youtube, x, facebook } = data.social

  // Aggregate totals
  const ytTotal = youtube.reduce((s, c) => s + c.subscribers, 0)
  const xTotal = x.reduce((s, c) => s + c.followers, 0)
  const fbTotal = facebook.reduce((s, c) => s + c.followers, 0)

  return (
    <div className="space-y-6">
      {/* Social summary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,0,0,0.1)', color: '#ff0000' }}>{Icons.youtube}</div>
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>YouTube Total</span>
          </div>
          <p className="text-2xl font-bold tabular-nums" style={{ color: '#ff0000' }}>{fmtN(ytTotal)}</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>subscribers across {youtube.length} channels</p>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }}>{Icons.x}</div>
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>X Total</span>
          </div>
          <p className="text-2xl font-bold tabular-nums" style={{ color: '#e0e2e8' }}>{fmtN(xTotal)}</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>followers across {x.length} accounts</p>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(24,119,242,0.1)', color: '#1877f2' }}>{Icons.facebook}</div>
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Facebook Total</span>
          </div>
          <p className="text-2xl font-bold tabular-nums" style={{ color: '#1877f2' }}>{fmtN(fbTotal)}</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>followers across {facebook.length} pages</p>
        </GlassCard>
      </div>

      {/* YouTube Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span style={{ color: '#ff0000' }}>{Icons.youtube}</span>
          <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>YouTube Channels</h3>
        </div>
        {youtube.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {youtube.map(ch => (
              <SocialCard
                key={ch.handle}
                platform="youtube"
                name={ch.name}
                handle={ch.handle}
                metric={ch.subscribers}
                metricLabel="subscribers"
                secondaryMetric={ch.totalViews}
                secondaryLabel="total views"
                image={ch.thumbnail}
                color="#ff0000"
                icon={Icons.youtube}
              />
            ))}
          </div>
        ) : (
          <GlassCard>
            <p className="text-sm text-center py-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
              YouTube data unavailable. Check YOUTUBE_API_KEY configuration.
            </p>
          </GlassCard>
        )}
      </div>

      {/* X Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span style={{ color: '#fff' }}>{Icons.x}</span>
          <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>X / Twitter Accounts</h3>
        </div>
        {x.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {x.map(acc => (
              <SocialCard
                key={acc.username}
                platform="x"
                name={acc.name}
                handle={acc.username}
                metric={acc.followers}
                metricLabel="followers"
                secondaryMetric={acc.tweets}
                secondaryLabel="posts"
                image={acc.profileImage}
                color="#e0e2e8"
                icon={Icons.x}
              />
            ))}
          </div>
        ) : (
          <GlassCard>
            <p className="text-sm text-center py-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
              X data unavailable. Check X_BEARER_TOKEN configuration.
            </p>
          </GlassCard>
        )}
      </div>

      {/* Facebook Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span style={{ color: '#1877f2' }}>{Icons.facebook}</span>
          <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>Facebook Pages</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {facebook.map(page => (
            <SocialCard
              key={page.id}
              platform="facebook"
              name={page.name}
              handle={page.id}
              metric={page.followers}
              metricLabel={page.needsToken ? 'needs page token' : 'followers'}
              secondaryMetric={page.likes}
              secondaryLabel={page.needsToken ? '' : 'page likes'}
              image={page.picture}
              color="#1877f2"
              icon={Icons.facebook}
            />
          ))}
        </div>
      </div>

      {/* Video Performance - YouTube detailed */}
      {youtube.length > 0 && (
        <GlassCard>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>YouTube Channel Comparison</h3>
          <div style={{ height: 280 }}>
            <Bar
              data={{
                labels: youtube.map(ch => ch.label),
                datasets: [
                  {
                    label: 'Subscribers',
                    data: youtube.map(ch => ch.subscribers),
                    backgroundColor: 'rgba(255,0,0,0.5)',
                    borderColor: '#ff0000',
                    borderWidth: 1,
                    borderRadius: 4,
                  },
                  {
                    label: 'Videos',
                    data: youtube.map(ch => ch.videoCount),
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'rgba(255,255,255,0.3)',
                    borderWidth: 1,
                    borderRadius: 4,
                  },
                ],
              }}
              options={darkBarOptions()}
            />
          </div>
        </GlassCard>
      )}
    </div>
  )
}

// ── CONTENT TAB ───────────────────────────────────────────────────────────────
function ContentTab({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-4">
      {/* Top performing content */}
      <GlassCard>
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Top Performing Content</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['#', 'Title', 'Author', 'Category', 'Views', 'Published'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.topContent.map((post, i) => (
                <tr key={post.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-3">
                    <span className="text-xs font-bold tabular-nums" style={{
                      color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c2f' : 'rgba(255,255,255,0.3)',
                    }}>{i + 1}</span>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-sm font-medium truncate max-w-md" style={{ color: '#e0e2e8' }}>{post.title}</p>
                  </td>
                  <td className="px-3 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{post.author_name}</td>
                  <td className="px-3 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}>
                      {post.category_name}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm font-bold tabular-nums" style={{ color: CHART_COLORS.green }}>{fmtN(post.views || 0)}</td>
                  <td className="px-3 py-3 text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.35)' }}>{fmtDateFull(post.published_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Content views chart */}
      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Views by Top Content</h3>
          <div style={{ height: 300 }}>
            <Bar
              data={{
                labels: data.topContent.slice(0, 8).map(p => p.title.length > 30 ? p.title.substring(0, 30) + '...' : p.title),
                datasets: [{
                  label: 'Views',
                  data: data.topContent.slice(0, 8).map(p => p.views || 0),
                  backgroundColor: data.topContent.slice(0, 8).map((_, i) => CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] + '80'),
                  borderColor: data.topContent.slice(0, 8).map((_, i) => CATEGORY_PALETTE[i % CATEGORY_PALETTE.length]),
                  borderWidth: 1,
                  borderRadius: 4,
                }],
              }}
              options={{
                ...darkBarOptions(),
                indexAxis: 'y' as const,
                plugins: { ...darkBarOptions().plugins, legend: { display: false } },
              }}
            />
          </div>
        </GlassCard>

        {/* Recent posts timeline */}
        <GlassCard>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Recent Activity</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            {data.recentPosts.slice(0, 12).map(post => (
              <div key={post.id} className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: CHART_COLORS.blue }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: '#e0e2e8' }}>{post.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{post.author_name}</span>
                    <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                    <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.3)' }}>{fmtDateFull(post.published_at)}</span>
                    {post.views > 0 && (
                      <>
                        <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                        <span className="text-xs font-semibold tabular-nums" style={{ color: CHART_COLORS.green }}>{fmtN(post.views)} views</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const execStyles = `
  .exec-dash {
    background: #0a0e1a;
    background-image:
      radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.04) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.04) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 80%, rgba(16,185,129,0.03) 0%, transparent 50%);
    position: relative;
  }

  .exec-dash::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.015'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }

  .exec-dash-inner {
    position: relative;
    z-index: 1;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    padding: 20px;
    transition: all 0.2s ease;
  }

  .glass-card-hover:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .kpi-card {
    padding: 16px 20px;
  }

  /* Scrollbar styling */
  .exec-dash ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  .exec-dash ::-webkit-scrollbar-track {
    background: transparent;
  }
  .exec-dash ::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
  }

  /* Table row hover */
  .exec-dash table tbody tr {
    transition: background-color 0.15s ease;
  }

  /* Animate refresh icon */
  @keyframes exec-spin {
    to { transform: rotate(360deg); }
  }
  .exec-dash .animate-spin {
    animation: exec-spin 1s linear infinite;
    display: inline-flex;
  }

  /* Glass shimmer on loading */
  @keyframes exec-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .exec-dash .animate-pulse .glass-card {
    background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
    background-size: 200% 100%;
    animation: exec-shimmer 1.5s ease infinite;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .kpi-card { padding: 12px 14px; }
    .glass-card { padding: 14px; border-radius: 12px; }
  }
`
