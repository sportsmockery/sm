// CONTRACT: This dashboard returns ONLY real data from live sources
// (WordPress REST, SMED MySQL, Supabase, SEMRush, YouTube/X/Facebook APIs, Freestar Cube.js).
// NO synthetic, simulated, estimated, or hash-based fallbacks are permitted.
// If a data source is unavailable, return null/empty — never fabricate.
'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Image from 'next/image'
import {
  ResponsiveContainer, ComposedChart, Area, Line, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RTooltip, Legend, BarChart, Cell,
  ReferenceLine,
} from 'recharts'
import { GoogleTab } from '@/components/admin/exec-dashboard/google/google-tab'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
interface Data {
  overview: {
    totalPosts: number; allTimeViews: number; periodPosts: number; prevPeriodPosts: number
    periodViews: number; prevPeriodViews: number; totalAuthors: number; totalCategories: number
    avgReadTime: number; avgViews: number; velocity: string; avgScore: number
  }
  writers: Array<{
    id: number; name: string; avatar: string | null; email: string; role: string
    posts: number; views: number; avgViews: number; topCategories: string[]
    avgReadTime: number; avgScore: number
  }>
  writerTrends: Array<{ id: number; name: string; data: Array<{ month: string; count: number }> }>
  writerMonths: string[]
  categories: Array<{ name: string; count: number; views: number; avgViews: number }>
  contentTypes: Array<{ type: string; count: number }>
  topicBreakdown: Array<{ topic: string; count: number }>
  recentPosts: any[]; topContent: any[]
  publishingTrend: Array<{ date: string; count: number; views: number }>
  monthlyTrend: Array<{ month: string; count: number; views: number | null }>
  dayOfWeek: Array<{ name: string; count: number }>
  hourDistribution: Array<{ hour: number; count: number }>
  readTimeDistribution: Array<{ range: string; count: number }>
  viewsDistribution: Array<{ range: string; count: number }>
  scoreDistribution: Array<{ range: string; count: number }>
  social: { youtube: any[]; x: any[]; facebook: any[] }
  seo?: {
    overview: { rank: number; organicKeywords: number; organicTraffic: number; organicCost: number; adwordsKeywords: number; adwordsTraffic: number } | null
    keywords: Array<{ keyword: string; position: number; previousPosition: number; searchVolume: number; cpc: number; url: string; trafficPct: number; competition: number }>
    competitors: Array<{ domain: string; relevance: number; commonKeywords: number; organicKeywords: number; organicTraffic: number }>
    monthLabel?: string
    isHistorical?: boolean
  } | null
  paymentSync?: {
    sync: { status: string; lastSync: string | null; errorMessage?: string; writersSynced?: number; totalViewsSynced?: number }
    payments: any[]
    formulas: Array<{ id: string; name: string; desc: string; formula: string; effectiveDate: string }>
    history: any[]
  }
  range: string; days: number; timestamp: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & UTILS
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = ['Overview', 'Writers', 'Social', 'SEO', 'Content', 'Payments', 'Freestar', 'Google'] as const
const RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'this-week', label: 'This Week' },
  { key: 'this-month', label: 'This Month' },
  { key: 'last-month', label: 'Last Month' },
  { key: 'ytd', label: 'YTD' },
  { key: 'last-year', label: 'Last Year' },
  { key: 'custom', label: 'Custom' },
]
const TEAMS = ['All Teams', 'Bears', 'Cubs', 'Bulls', 'Blackhawks', 'White Sox', 'Fire', 'Sky']
const SOURCES = ['All Sources', 'Organic', 'Discover', 'Social', 'Direct']
const C = {
  blue: '#00D4FF', purple: '#D6B05E', green: '#00D4FF', amber: '#f59e0b',
  red: '#BC0000', cyan: '#06b6d2', pink: '#ec4899', indigo: '#6366f1',
  orange: '#BC0000', teal: '#14b8a6', lime: '#84cc16', slate: '#64748b',
}
const PAL = [C.blue, C.purple, C.green, C.amber, C.red, C.cyan, C.pink, C.indigo, C.orange, C.teal]
const fN = (n: number) => n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : n.toLocaleString()
const pctC = (c: number, p: number) => { if (p === 0) return c > 0 ? '+100%' : '0%'; return ((c - p) / p * 100 >= 0 ? '+' : '') + ((c - p) / p * 100).toFixed(1) + '%' }
const pctUp = (c: number, p: number) => p === 0 ? c > 0 : c >= p
const fD = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const fM = (m: string) => { const [y, mo] = m.split('-'); return new Date(+y, +mo - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) }
const tAgo = (t: number) => { const s = Math.floor((Date.now() - t) / 1000); return s < 60 ? 'just now' : s < 3600 ? Math.floor(s / 60) + 'm ago' : s < 86400 ? Math.floor(s / 3600) + 'h ago' : Math.floor(s / 86400) + 'd ago' }

// Freestar metrics type (mirrors pub.network dashboard)
type FreestarMetrics = {
  revenue: number | null
  impressions: number | null
  netCpm: number | null
  viewability: number | null
  fillRate: number | null
  pageRpm: number | null
  prevRevenue: number | null
  prevImpressions: number | null
  prevNetCpm: number | null
  prevViewability: number | null
  prevFillRate: number | null
  prevPageRpm: number | null
}

// Read Freestar ad report data from localStorage (shared with embedded Freestar app)
// The embedded app at /admin/freestar/ stores reports under key "sm_ad_reports"
// (defined as Pr.adReports in public/admin/freestar/assets/index-DGTApot3.js)
const FREESTAR_STORAGE_KEY = 'sm_ad_reports'

function getFreestarLocalRevenue(startDate: string, endDate: string): number | null {
  try {
    const raw = localStorage.getItem(FREESTAR_STORAGE_KEY)
    if (!raw) return null
    const reports: Array<{ date: string; revenue: number }> = JSON.parse(raw)
    if (!Array.isArray(reports) || reports.length === 0) return null
    const filtered = reports.filter(r => r.date >= startDate && r.date <= endDate)
    if (filtered.length === 0) return null
    return filtered.reduce((sum, r) => sum + (r.revenue || 0), 0)
  } catch {
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHART TOOLTIP
// ═══════════════════════════════════════════════════════════════════════════════
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg px-3 py-2 text-sm shadow-xl border" style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)', color: 'var(--sm-text)' }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--sm-text-muted)' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'var(--sm-text-muted)' }}>{p.name}:</span>
          <span className="font-bold tabular-nums">{typeof p.value === 'number' ? fN(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETAIL DRAWER
// ═══════════════════════════════════════════════════════════════════════════════
function DetailDrawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (open) ref.current?.focus()
  }, [open])
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div ref={ref} tabIndex={-1} className="fixed top-0 right-0 z-50 h-full overflow-y-auto outline-none"
        style={{ width: 480, background: 'var(--sm-surface)', borderLeft: '1px solid var(--sm-border)' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--sm-border)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--sm-text)' }}>{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded flex items-center justify-center transition-colors" style={{ color: 'var(--sm-text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--sm-card-hover)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-4 flex flex-col gap-4">{children}</div>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANSWER CARDS
// ═══════════════════════════════════════════════════════════════════════════════
function AnswerCards({ answers }: { answers: Array<{ q: string; a: string; action?: string; color: string }> }) {
  return (
    <div className="flex gap-3">
      {answers.map((ans, i) => (
        <div key={i} className="flex-1 rounded-lg border px-4 py-3 transition-colors cursor-default"
          style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--sm-card-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--sm-card)')}>
          <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: ans.color }}>{ans.q}</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--sm-text)' }}>{ans.a}</p>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// useSortedRows — small sort hook for inline tables that don't use SortableTable
// ═══════════════════════════════════════════════════════════════════════════════
function useSortedRows<T extends Record<string, any>>(rows: T[], initialKey: keyof T | null = null, initialDir: 'asc' | 'desc' = 'desc') {
  const [sortKey, setSortKey] = useState<keyof T | null>(initialKey)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(initialDir)
  const toggle = (key: keyof T) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }
  const sorted = useMemo(() => {
    if (!sortKey) return rows
    return [...rows].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      const aNum = typeof av === 'number'
      const bNum = typeof bv === 'number'
      let cmp: number
      if (aNum && bNum) cmp = (av as number) - (bv as number)
      else cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rows, sortKey, sortDir])
  return { sorted, sortKey, sortDir, toggle }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SORTABLE TABLE with search + pagination + row click
// ═══════════════════════════════════════════════════════════════════════════════
function SortableTable({ columns, data, onRowClick, pageSize = 25 }: {
  columns: Array<{ key: string; label: string; align?: 'left' | 'right' | 'center'; render?: (val: any, row: any) => React.ReactNode; sortable?: boolean; priority?: 'high' | 'low' }>
  data: any[]
  onRowClick?: (row: any) => void
  pageSize?: number
}) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return q ? data.filter(r => columns.some(c => String(r[c.key] ?? '').toLowerCase().includes(q))) : data
  }, [data, search, columns])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const sliced = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  return (
    <div>
      {/* Search */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-1" style={{ maxWidth: 320 }}>
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--sm-text-dim)' }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none transition-colors"
            style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)', color: 'var(--sm-text)' }} />
        </div>
        <span className="text-sm tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>
      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b" style={{ borderColor: 'var(--sm-border)' }}>
            {columns.map(c => (
              <th key={c.key}
                className={`px-3 py-2.5 text-sm font-semibold uppercase tracking-wide select-none ${c.priority === 'low' ? 'hidden lg:table-cell' : ''} ${c.sortable !== false ? 'cursor-pointer' : ''}`}
                style={{ textAlign: c.align || 'left', color: sortKey === c.key ? C.blue : 'var(--sm-text-dim)' }}
                onClick={() => c.sortable !== false && handleSort(c.key)}>
                {c.label}
                {sortKey === c.key && <span className="ml-1">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sliced.map((row, ri) => (
            <tr key={ri} className={`border-b transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              style={{ borderColor: 'var(--sm-border)', height: 48 }}
              onClick={() => onRowClick?.(row)}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--sm-card-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              {columns.map(c => (
                <td key={c.key} className={`px-3 py-2 text-sm ${c.priority === 'low' ? 'hidden lg:table-cell' : ''}`}
                  style={{ textAlign: c.align || 'left', color: 'var(--sm-text)' }}>
                  {c.render ? c.render(row[c.key], row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-3">
          <span className="text-sm" style={{ color: 'var(--sm-text-dim)' }}>
            Page {page + 1} of {pages}
          </span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded text-sm font-semibold border transition-colors disabled:opacity-30"
              style={{ borderColor: 'var(--sm-border)', color: 'var(--sm-text-muted)', background: 'var(--sm-surface)' }}>Prev</button>
            <button disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded text-sm font-semibold border transition-colors disabled:opacity-30"
              style={{ borderColor: 'var(--sm-border)', color: 'var(--sm-text-muted)', background: 'var(--sm-surface)' }}>Next</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION CARD (no internal scroll)
// ═══════════════════════════════════════════════════════════════════════════════
function Section({ title, badge, children, actions }: { title: string; badge?: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="rounded-lg border overflow-visible" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--sm-border)' }}>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--sm-text)' }}>{title}</h3>
          {badge}
        </div>
        {actions}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// WRITER PAYMENTS TABLE — sortable inline table on Payments tab
// ═══════════════════════════════════════════════════════════════════════════════
function WriterPaymentsTable({
  payments: rawPayments,
  payBreakdownOpen,
  setPayBreakdownOpen,
}: {
  payments: any[]
  payBreakdownOpen: string | null
  setPayBreakdownOpen: (v: string | null) => void
}) {
  const cols: Array<{ key: string; label: string; sortable?: boolean }> = [
    { key: 'writer_name',    label: 'Writer' },
    { key: 'total_posts',    label: 'Posts' },
    { key: 'total_views',    label: 'Views' },
    { key: 'formula_name',   label: 'Formula' },
    { key: 'calculated_pay', label: 'Calculated Pay' },
    { key: 'status',         label: 'Status' },
    { key: 'actions',        label: 'Actions', sortable: false },
  ]
  const { sorted, sortKey, sortDir, toggle } = useSortedRows<any>(rawPayments, 'calculated_pay', 'desc')

  if (rawPayments.length === 0) {
    return <p className="text-sm py-4 text-center" style={{ color: 'var(--sm-text-dim)' }}>No payment data for this period. Run the sync cron to populate.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b" style={{ borderColor: 'var(--sm-border)' }}>
            {cols.map(c => {
              const isSortable = c.sortable !== false
              const isActive = sortKey === c.key
              return (
                <th
                  key={c.key}
                  onClick={() => isSortable && toggle(c.key)}
                  className={`px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-left whitespace-nowrap select-none ${isSortable ? 'cursor-pointer' : ''}`}
                  style={{ color: isActive ? C.blue : 'var(--sm-text-dim)' }}
                >
                  {c.label}
                  {isActive && <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((w: any) => {
            const status = (w.status || 'pending').charAt(0).toUpperCase() + (w.status || 'pending').slice(1)
            return (
              <tr key={w.writer_name} className="border-b transition-colors" style={{ borderColor: 'var(--sm-border)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--sm-card-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}>
                      {w.writer_name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--sm-text)' }}>{w.writer_name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-sm tabular-nums" style={{ color: 'var(--sm-text-muted)' }}>{w.total_posts}</td>
                <td className="px-3 py-3 text-sm font-bold tabular-nums" style={{ color: C.blue }}>{(w.total_views || 0).toLocaleString()}</td>
                <td className="px-3 py-3 text-xs font-mono" style={{ color: 'var(--sm-text-dim)' }}>{w.formula_name || '—'}</td>
                <td className="px-3 py-3">
                  <div className="relative inline-block">
                    <button
                      onMouseEnter={() => setPayBreakdownOpen(w.writer_name)}
                      onMouseLeave={() => setPayBreakdownOpen(null)}
                      onClick={() => setPayBreakdownOpen(payBreakdownOpen === w.writer_name ? null : w.writer_name)}
                      className="text-sm font-bold tabular-nums cursor-pointer underline decoration-dotted underline-offset-2"
                      style={{ color: '#00D4FF' }}
                    >
                      ${(w.calculated_pay || 0).toFixed(2)}
                    </button>
                    {payBreakdownOpen === w.writer_name && (
                      <div
                        className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-lg border shadow-xl"
                        style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}
                      >
                        <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--sm-border)' }}>
                          <p className="text-sm font-bold" style={{ color: 'var(--sm-text)' }}>{w.writer_name}</p>
                          <p className="text-xs" style={{ color: 'var(--sm-text-dim)' }}>{w.period_start} — {w.period_end}</p>
                        </div>
                        <div className="px-3 py-2 space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span style={{ color: 'var(--sm-text-muted)' }}>Posts</span>
                            <span className="font-bold tabular-nums" style={{ color: 'var(--sm-text)' }}>{w.total_posts}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span style={{ color: 'var(--sm-text-muted)' }}>Views</span>
                            <span className="font-bold tabular-nums" style={{ color: 'var(--sm-text)' }}>{(w.total_views || 0).toLocaleString()}</span>
                          </div>
                          {w.formula_name && (
                            <div className="pt-1 border-t" style={{ borderColor: 'var(--sm-border)' }}>
                              <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--sm-text-dim)' }}>Formula</p>
                              <p className="text-xs font-mono p-1.5 rounded" style={{ background: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}>
                                {w.formula_name}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="px-3 py-2 border-t flex justify-between items-center" style={{ borderColor: 'var(--sm-border)', background: 'rgba(5,150,105,0.06)' }}>
                          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text-dim)' }}>Total Pay</span>
                          <span className="text-base font-extrabold tabular-nums" style={{ color: '#00D4FF' }}>${(w.calculated_pay || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
                    background: status === 'Paid' ? 'rgba(16,185,129,0.12)' : status === 'Approved' ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)',
                    color: status === 'Paid' ? C.green : status === 'Approved' ? C.blue : C.amber,
                  }}>{status}</span>
                </td>
                <td className="px-3 py-3">
                  {status === 'Pending' && (
                    <button className="text-xs font-bold px-2.5 py-1 rounded transition-colors" style={{ background: 'var(--sm-red)', color: '#fff' }}>
                      Approve
                    </button>
                  )}
                  {status === 'Approved' && (
                    <div className="flex items-center gap-1.5">
                      <button className="text-xs font-bold px-2.5 py-1 rounded transition-colors" style={{ background: '#00D4FF', color: '#fff' }}>
                        Mark Paid
                      </button>
                      <button className="text-xs font-bold px-2.5 py-1 rounded border transition-colors" style={{ borderColor: 'var(--sm-border)', color: 'var(--sm-text-muted)', background: 'var(--sm-surface)' }}>
                        Revert
                      </button>
                    </div>
                  )}
                  {status === 'Paid' && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded" style={{ background: 'var(--sm-surface)', color: 'var(--sm-text-dim)' }}>
                      Completed
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT HISTORY DETAIL TABLE — sortable per-month writer breakdown
// ═══════════════════════════════════════════════════════════════════════════════
function PaymentHistoryDetailTable({ rows }: { rows: Array<{ name: string; posts: number; views: number; formula: string; calcPay: number; status: string }> }) {
  const cols: Array<{ key: 'name' | 'posts' | 'views' | 'formula' | 'calcPay' | 'status'; label: string }> = [
    { key: 'name',    label: 'Writer' },
    { key: 'posts',   label: 'Posts' },
    { key: 'views',   label: 'Views' },
    { key: 'formula', label: 'Formula' },
    { key: 'calcPay', label: 'Calculated Pay' },
    { key: 'status',  label: 'Status' },
  ]
  const { sorted, sortKey, sortDir, toggle } = useSortedRows(rows, 'calcPay', 'desc')

  return (
    <table className="w-full min-w-[600px]">
      <thead>
        <tr className="border-b" style={{ borderColor: 'var(--sm-border)' }}>
          {cols.map(c => {
            const isActive = sortKey === c.key
            return (
              <th
                key={c.key}
                onClick={() => toggle(c.key)}
                className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-left cursor-pointer select-none"
                style={{ color: isActive ? C.blue : 'var(--sm-text-dim)' }}
              >
                {c.label}
                {isActive && <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>}
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {sorted.map(w => (
          <tr key={w.name} className="border-b last:border-b-0" style={{ borderColor: 'var(--sm-border)' }}>
            <td className="px-2 py-2 text-sm font-medium" style={{ color: 'var(--sm-text)' }}>{w.name}</td>
            <td className="px-2 py-2 text-sm tabular-nums" style={{ color: 'var(--sm-text-muted)' }}>{w.posts}</td>
            <td className="px-2 py-2 text-sm tabular-nums" style={{ color: 'var(--sm-text-muted)' }}>{w.views.toLocaleString()}</td>
            <td className="px-2 py-2 text-[10px] font-mono" style={{ color: 'var(--sm-text-dim)' }}>{w.formula}</td>
            <td className="px-2 py-2 text-sm font-bold tabular-nums" style={{ color: '#00D4FF' }}>${w.calcPay.toFixed(2)}</td>
            <td className="px-2 py-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: '#00D4FF' }}>
                {w.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// WRITER DRAWER CONTENT
// ═══════════════════════════════════════════════════════════════════════════════
function WriterDrawerContent({ writer, trend }: { writer: Data['writers'][0]; trend: Array<{ month: string; count: number }> }) {
  const monthlyOutput = trend.map(d => ({ month: fM(d.month), posts: d.count }))

  return (
    <>
      {/* Identity */}
      <div className="flex items-center gap-4">
        {writer.avatar
          ? <Image src={writer.avatar} alt="" width={56} height={56} className="w-14 h-14 rounded-full border-2" style={{ borderColor: 'var(--sm-border)' }} />
          : <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: C.blue + '20', color: C.blue }}>{writer.name.charAt(0)}</div>}
        <div>
          <p className="text-lg font-bold" style={{ color: 'var(--sm-text)' }}>{writer.name}</p>
          <p className="text-sm capitalize" style={{ color: 'var(--sm-text-muted)' }}>{writer.role || 'author'}</p>
        </div>
      </div>
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: 'Posts', v: writer.posts, c: C.blue },
          { l: 'Views', v: fN(writer.views), c: C.purple },
          { l: 'Avg Views', v: fN(writer.avgViews), c: C.green },
        ].map(s => (
          <div key={s.l} className="rounded-lg p-3 text-center" style={{ background: 'var(--sm-card-hover)' }}>
            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--sm-text-dim)' }}>{s.l}</p>
            <p className="text-xl font-extrabold tabular-nums mt-0.5" style={{ color: s.c }}>{s.v}</p>
          </div>
        ))}
      </div>
      {/* Monthly output (real data) */}
      {monthlyOutput.length > 0 && (
        <div>
          <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--sm-text-dim)' }}>Monthly Output</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={monthlyOutput}>
              <XAxis dataKey="month" tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} width={25} allowDecimals={false} />
              <RTooltip content={<ChartTip />} />
              <Bar dataKey="posts" fill={C.blue} radius={[4, 4, 0, 0]} name="Posts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {/* Categories */}
      {writer.topCategories.length > 0 && (
        <div>
          <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--sm-text-dim)' }}>Categories</p>
          <div className="flex flex-wrap gap-2">
            {writer.topCategories.map(c => (
              <span key={c} className="text-sm px-2.5 py-1 rounded-full" style={{ background: C.blue + '15', color: C.blue }}>{c}</span>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST DRAWER CONTENT
// ═══════════════════════════════════════════════════════════════════════════════
function PostDrawerContent({ post }: { post: any }) {
  return (
    <>
      <div>
        <p className="text-lg font-bold leading-snug" style={{ color: 'var(--sm-text)' }}>{post.title}</p>
        <p className="text-sm mt-1" style={{ color: 'var(--sm-text-muted)' }}>
          by {post.author_name} &middot; {post.category_name} &middot; {fD(post.published_at)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { l: 'Views', v: fN(post.views || 0), c: C.blue },
          { l: 'Published', v: fD(post.published_at), c: C.purple },
        ].map(s => (
          <div key={s.l} className="rounded-lg p-3 text-center" style={{ background: 'var(--sm-card-hover)' }}>
            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--sm-text-dim)' }}>{s.l}</p>
            <p className="text-xl font-extrabold tabular-nums mt-0.5" style={{ color: s.c }}>{s.v}</p>
          </div>
        ))}
      </div>
      {post.featured_image && (
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--sm-border)' }}>
          <Image src={post.featured_image} alt="" width={448} height={252} className="w-full h-auto" />
        </div>
      )}
      {post.slug && (
        <a href={`https://www.sportsmockery.com/${post.slug}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors"
          style={{ background: 'var(--sm-red)', color: '#fff' }}>
          Open Article
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
        </a>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOP ARTICLES BY VIEWS
// ═══════════════════════════════════════════════════════════════════════════════
function TopArticlesModule({ topContent, onPostClick }: { topContent: any[]; onPostClick: (post: any) => void }) {
  const ranked = [...topContent].sort((a, b) => (b.views || 0) - (a.views || 0))
  const barData = ranked.slice(0, 10).map(p => ({
    name: (p.title || '').substring(0, 30) + ((p.title || '').length > 30 ? '...' : ''),
    views: p.views || 0,
  }))

  if (ranked.length === 0) {
    return (
      <Section title="Top Articles">
        <p className="text-sm py-4 text-center" style={{ color: 'var(--sm-text-dim)' }}>No view data available for this period.</p>
      </Section>
    )
  }

  return (
    <>
      <Section title="Top Articles by Views" badge={<span className="text-xs tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>{ranked.length} articles</span>}>
        <ResponsiveContainer width="100%" height={Math.max(280, barData.length * 28)}>
          <BarChart data={barData} layout="vertical">
            <XAxis type="number" tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={fN} />
            <YAxis type="category" dataKey="name" width={220} tick={{ fill: '#8a8a9a', fontSize: 12 }} tickLine={false} axisLine={false} />
            <RTooltip content={<ChartTip />} />
            <Bar dataKey="views" fill={C.blue} radius={[0, 4, 4, 0]} name="Views" />
          </BarChart>
        </ResponsiveContainer>
      </Section>
      <Section title="Article Performance">
        <SortableTable
          columns={[
            { key: 'rank', label: '#', align: 'center', render: (_v: any, _r: any) => { const idx = ranked.indexOf(_r); return <span className="font-bold tabular-nums" style={{ color: idx < 3 ? C.amber : 'var(--sm-text-dim)' }}>{idx + 1}</span> } },
            { key: 'title', label: 'Article', render: (v: string) => <span className="font-medium truncate block" style={{ maxWidth: 350 }}>{v}</span> },
            { key: 'author_name', label: 'Author' },
            { key: 'category_name', label: 'Category', priority: 'low', render: (v: string) => v ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: C.blue + '12', color: C.blue }}>{v}</span> : null },
            { key: 'views', label: 'Views', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.blue }}>{fN(v || 0)}</span> },
            { key: 'published_at', label: 'Date', align: 'right', priority: 'low', render: (v: string) => v ? <span style={{ color: 'var(--sm-text-muted)' }}>{fD(v)}</span> : null },
          ]}
          data={ranked}
          onRowClick={onPostClick}
        />
      </Section>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═════════════════════════════════════════════════════════════════���══���═══���══════
export default function ExecDashboard() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [range, setRange] = useState('this-month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [tab, setTab] = useState<typeof TABS[number]>('Overview')
  const [refreshing, setRefreshing] = useState(false)
  // Filters
  const [search, setSearch] = useState('')
  const [team, setTeam] = useState('All Teams')
  const [author, setAuthor] = useState('All Authors')
  const [source, setSource] = useState('All Sources')
  const [chips, setChips] = useState<string[]>([])
  // Drawer
  const [drawerType, setDrawerType] = useState<'writer' | 'post' | null>(null)
  const [drawerData, setDrawerData] = useState<any>(null)
  // Payments tab state
  const [payBreakdownOpen, setPayBreakdownOpen] = useState<string | null>(null)
  const [editingFormulaId, setEditingFormulaId] = useState<string | null>(null)
  const [editFormulaDesc, setEditFormulaDesc] = useState('')
  const [editFormulaCode, setEditFormulaCode] = useState('')
  const [editFormulaDate, setEditFormulaDate] = useState('')
  const [savingFormulaId, setSavingFormulaId] = useState<string | null>(null)
  const [expandedHistoryMonth, setExpandedHistoryMonth] = useState<string | null>(null)
  // GSC state
  const [gscData, setGscData] = useState<any>(null)
  const [gscLoading, setGscLoading] = useState(false)
  const [gscConnected, setGscConnected] = useState<boolean | null>(null)
  // Freestar P&L state
  const [freestarRevenue, setFreestarRevenue] = useState<number | null>(null)
  const [freestarMetrics, setFreestarMetrics] = useState<FreestarMetrics | null>(null)
  const [freestarLoading, setFreestarLoading] = useState(false)
  const [revenueSource, setRevenueSource] = useState<'local' | 'api' | 'unavailable'>('unavailable')
  const [freehandExpenses, setFreehandExpenses] = useState<Array<{ id: string; desc: string; amount: number; date: string }>>([])
  const [newExpenseDesc, setNewExpenseDesc] = useState('')
  const [newExpenseAmount, setNewExpenseAmount] = useState('')
  const [newExpenseDate, setNewExpenseDate] = useState(new Date().toISOString().slice(0, 10))
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  // Load freehand expenses from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sm-freehand-expenses')
      if (saved) setFreehandExpenses(JSON.parse(saved))
    } catch {}
  }, [])

  // Save freehand expenses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sm-freehand-expenses', JSON.stringify(freehandExpenses))
    } catch {}
  }, [freehandExpenses])

  // Compute date range strings for Freestar revenue queries
  const freestarDateRange = useMemo(() => {
    const now = new Date()
    let start: Date, end: Date
    if (range === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      end = now
    } else if (range === 'yesterday') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (range === 'this-week') {
      const day = now.getDay()
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
      end = now
    } else if (range === 'this-month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = now
    } else if (range === 'last-month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      end = new Date(now.getFullYear(), now.getMonth(), 0)
    } else if (range === 'ytd') {
      start = new Date(now.getFullYear(), 0, 1)
      end = now
    } else if (range === 'last-year') {
      start = new Date(now.getFullYear() - 1, 0, 1)
      end = new Date(now.getFullYear() - 1, 11, 31)
    } else if (range === 'custom' && customStart && customEnd) {
      start = new Date(customStart)
      end = new Date(customEnd)
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = now
    }
    return { startStr: start.toISOString().slice(0, 10), endStr: end.toISOString().slice(0, 10) }
  }, [range, customStart, customEnd])

  // Fetch Freestar revenue + metrics: prefer localStorage for revenue, API for full metrics
  useEffect(() => {
    if (tab !== 'Freestar') return
    const { startStr, endStr } = freestarDateRange

    // First, try reading revenue from localStorage (same source as embedded Freestar dashboard)
    const localRevenue = getFreestarLocalRevenue(startStr, endStr)
    if (localRevenue !== null) {
      setFreestarRevenue(Math.round(localRevenue))
      setRevenueSource('local')
    }

    // Always try the API for the full metrics set (impressions, CPM, viewability, etc.)
    const fetchFreestarMetrics = async () => {
      setFreestarLoading(true)
      try {
        const res = await fetch(`/api/freestar-revenue?start=${startStr}&end=${endStr}`)
        if (res.ok) {
          const json = await res.json()
          // Store full metrics object
          setFreestarMetrics({
            revenue: json.revenue ?? null,
            impressions: json.impressions ?? null,
            netCpm: json.netCpm ?? null,
            viewability: json.viewability ?? null,
            fillRate: json.fillRate ?? null,
            pageRpm: json.pageRpm ?? null,
            prevRevenue: json.prevRevenue ?? null,
            prevImpressions: json.prevImpressions ?? null,
            prevNetCpm: json.prevNetCpm ?? null,
            prevViewability: json.prevViewability ?? null,
            prevFillRate: json.prevFillRate ?? null,
            prevPageRpm: json.prevPageRpm ?? null,
          })
          // If no localStorage revenue, use API revenue
          if (localRevenue === null) {
            if (json.revenue !== null) {
              setFreestarRevenue(json.revenue)
              setRevenueSource('api')
            } else {
              setRevenueSource('unavailable')
            }
          }
        }
      } catch {
        // API failed — mark revenue as unavailable (never fabricate)
        if (localRevenue === null) {
          setRevenueSource('unavailable')
        }
      } finally {
        setFreestarLoading(false)
      }
    }
    fetchFreestarMetrics()
  }, [tab, range, customStart, customEnd, data, freestarDateRange])

  // Fetch Google Search Console data when SEO tab is active
  useEffect(() => {
    if (tab !== 'SEO') return
    const { startStr, endStr } = freestarDateRange
    let cancelled = false
    const run = async () => {
      setGscLoading(true)
      try {
        const r = await fetch(`/api/admin/google-search-console/data?start=${startStr}&end=${endStr}`)
        if (!r.ok) {
          if (!cancelled) {
            setGscConnected(false)
            setGscData(null)
          }
          return
        }
        const json = await r.json()
        if (cancelled) return
        setGscConnected(!!json.connected)
        setGscData(json.connected ? json : null)
      } catch {
        if (!cancelled) setGscConnected(false)
      } finally {
        if (!cancelled) setGscLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [tab, freestarDateRange])

  // Listen for localStorage changes from the embedded Freestar iframe
  // The storage event fires when another window/tab/iframe modifies localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === FREESTAR_STORAGE_KEY && tab === 'Freestar') {
        const { startStr, endStr } = freestarDateRange
        const localRevenue = getFreestarLocalRevenue(startStr, endStr)
        if (localRevenue !== null) {
          setFreestarRevenue(Math.round(localRevenue))
          setRevenueSource('local')
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [tab, freestarDateRange])

  const addFreehandExpense = () => {
    if (!newExpenseDesc.trim() || !newExpenseAmount) return
    const amount = parseFloat(newExpenseAmount)
    if (isNaN(amount) || amount <= 0) return
    setFreehandExpenses(prev => [...prev, {
      id: crypto.randomUUID(),
      desc: newExpenseDesc.trim(),
      amount,
      date: newExpenseDate,
    }])
    setNewExpenseDesc('')
    setNewExpenseAmount('')
    setNewExpenseDate(new Date().toISOString().slice(0, 10))
    setShowExpenseForm(false)
  }

  const removeFreehandExpense = (id: string) => {
    setFreehandExpenses(prev => prev.filter(e => e.id !== id))
  }

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true)
    try {
      const r = await fetch(`/api/exec-dashboard?range=${range}${range === 'custom' && customStart && customEnd ? `&start=${customStart}&end=${customEnd}` : ''}`)
      if (!r.ok) throw new Error('fetch failed')
      setData(await r.json()); setError(false)
    } catch { setError(true) }
    finally { setLoading(false); setRefreshing(false) }
  }, [range, customStart, customEnd])

  useEffect(() => { load() }, [load])

  // Active filter chips
  useEffect(() => {
    const c: string[] = []
    if (team !== 'All Teams') c.push(team)
    if (author !== 'All Authors') c.push(author)
    if (source !== 'All Sources') c.push(source)
    if (search) c.push(`"${search}"`)
    setChips(c)
  }, [team, author, source, search])

  const resetFilters = () => { setSearch(''); setTeam('All Teams'); setAuthor('All Authors'); setSource('All Sources') }
  const removeChip = (chip: string) => {
    if (TEAMS.includes(chip)) setTeam('All Teams')
    else if (SOURCES.includes(chip)) setSource('All Sources')
    else if (chip.startsWith('"')) setSearch('')
    else setAuthor('All Authors')
  }

  const openWriter = (w: any) => { setDrawerType('writer'); setDrawerData(w) }
  const openPost = (p: any) => { setDrawerType('post'); setDrawerData(p) }
  const closeDrawer = () => { setDrawerType(null); setDrawerData(null) }

  // Author list for filter
  const authorList = useMemo(() => data ? ['All Authors', ...data.writers.map(w => w.name)] : ['All Authors'], [data])

  // Generate executive answers
  const answers = useMemo(() => {
    if (!data) return []
    const d = data.overview
    const topWriter = data.writers[0]
    const topCat = data.categories[0]
    return {
      Overview: [
        { q: 'What drove growth this period?', a: topCat ? `${topCat.name} content led with ${topCat.count} posts and ${fN(topCat.views)} views.` : 'No category data available.', color: C.green },
        { q: 'Who is outperforming baseline?', a: topWriter ? `${topWriter.name} leads with ${topWriter.posts} posts, averaging ${fN(topWriter.avgViews)} views each.` : 'No writer data.', color: C.blue },
        { q: 'How many posts this period?', a: `${d.periodPosts} posts (${pctC(d.periodPosts, d.prevPeriodPosts)} vs prior period) totaling ${fN(d.periodViews)} views.`, color: C.purple },
      ],
      Writers: [
        { q: 'Who is outperforming baseline?', a: topWriter ? `${topWriter.name} leads the leaderboard with ${topWriter.posts} posts.` : 'No writer data.', color: C.blue },
        { q: 'How active is the team?', a: `${data.writers.length} writers contributed ${d.periodPosts} posts this period.`, color: C.purple },
      ],
      Social: [
        { q: 'Platform health?', a: `YouTube: ${fN(data.social.youtube.reduce((s: number, c: any) => s + c.subscribers, 0))} subs. X: ${fN(data.social.x.reduce((s: number, c: any) => s + c.followers, 0))} followers.`, color: C.purple },
      ],
      SEO: [
        { q: 'Organic performance?', a: data.seo?.overview ? `Ranking for ${fN(data.seo.overview.organicKeywords)} keywords with ~${fN(data.seo.overview.organicTraffic)} estimated monthly organic visits.` : `SEMRush data unavailable. Check API key.`, color: C.green },
      ],
      Content: [
        { q: 'Publishing velocity?', a: `${d.velocity} posts/week across ${d.totalCategories} categories. ${d.periodPosts} published this period.`, color: C.blue },
      ],
  Payments: [
  { q: 'Payment status?', a: `${d.totalAuthors} writers pending payout review for this period.`, color: C.blue },
  ],
  }
  }, [data])

  return (
    <div className="flex flex-col gap-0 pb-8 max-w-[1920px] mx-auto">
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--sm-text)' }}>Exec Dashboard</h1>
          <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'rgba(188,0,0,0.12)', color: 'var(--sm-red-light)' }}>Command Center</span>
          {data?.timestamp && <span className="text-sm tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>Updated {tAgo(data.timestamp)}</span>}
        </div>
        <button onClick={() => load(true)} disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors"
          style={{ borderColor: 'var(--sm-border)', color: 'var(--sm-text-muted)', background: 'var(--sm-surface)' }}>
          <span className={refreshing ? 'animate-spin inline-flex' : 'inline-flex'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
          </span>
          Refresh
        </button>
      </div>

      {/* ── EXECUTIVE CONTROL BAR ──────────────────────────────── */}
      <div className="rounded-lg border px-4 py-3 mb-1" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Global search */}
          <div className="relative" style={{ minWidth: 220 }}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--sm-text-dim)' }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts, authors, categories..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none"
              style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)', color: 'var(--sm-text)' }} />
          </div>
{/* Date range presets */}
  <div className="flex items-center gap-1">
  {RANGES.map(r => (
  <button key={r.key} onClick={() => setRange(r.key)}
  className="px-2.5 py-1.5 text-[11px] font-bold rounded transition-all"
  style={{ 
    backgroundColor: range === r.key ? '#00D4FF' : 'transparent', 
    color: range === r.key ? '#fff' : '#94a3b8' 
  }}>
  {r.label}
  </button>
  ))}
  </div>
  {/* Custom date range inputs */}
  {range === 'custom' && (
  <div className="flex items-center gap-2 ml-1">
  <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
  className="px-2 py-1.5 text-[11px] font-bold rounded border outline-none"
  style={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#334155' }} />
  <span className="text-[11px]" style={{ color: '#94a3b8' }}>to</span>
  <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
  className="px-2 py-1.5 text-[11px] font-bold rounded border outline-none"
  style={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#334155' }} />
  <button className="px-3 py-1.5 text-[11px] font-bold rounded transition-all"
  style={{ backgroundColor: '#00D4FF', color: '#fff' }}>
  Apply
  </button>
  </div>
  )}
          {/* Team filter */}
          <select value={team} onChange={e => setTeam(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm font-semibold outline-none"
            style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)', color: team === 'All Teams' ? 'var(--sm-text-dim)' : 'var(--sm-text)' }}>
            {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {/* Author filter */}
          <select value={author} onChange={e => setAuthor(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm font-semibold outline-none"
            style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)', color: author === 'All Authors' ? 'var(--sm-text-dim)' : 'var(--sm-text)' }}>
            {authorList.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          {/* Source filter */}
          <select value={source} onChange={e => setSource(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm font-semibold outline-none"
            style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)', color: source === 'All Sources' ? 'var(--sm-text-dim)' : 'var(--sm-text)' }}>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {/* Reset */}
          {chips.length > 0 && (
            <button onClick={resetFilters} className="px-3 py-2 rounded-lg text-sm font-bold transition-colors"
              style={{ color: C.red, background: C.red + '10' }}>
              Reset
            </button>
          )}
        </div>
        {/* Active filter chips */}
        {chips.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {chips.map(c => (
              <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold cursor-pointer"
                style={{ background: C.blue + '15', color: C.blue }}
                onClick={() => removeChip(c)}>
                {c}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── TABS ───────────────────────────────────────────────── */}
      <div className="flex border-b gap-0 mb-3" style={{ borderColor: 'var(--sm-border)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2.5 text-sm font-bold transition-colors"
            style={{
              color: tab === t ? 'var(--sm-red-light)' : 'var(--sm-text-dim)',
              borderBottom: tab === t ? '2px solid var(--sm-red)' : '2px solid transparent',
              marginBottom: -1,
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── CONTENT ────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col gap-3 animate-pulse">
          <div className="h-16 rounded-lg" style={{ background: 'var(--sm-card)' }} />
          <div className="h-[400px] rounded-lg" style={{ background: 'var(--sm-card)' }} />
          <div className="h-64 rounded-lg" style={{ background: 'var(--sm-card)' }} />
        </div>
      ) : error || !data ? (
        <div className="rounded-lg border p-12 text-center" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--sm-text-muted)' }}>Failed to load dashboard data.</p>
          <button onClick={() => load()} className="mt-3 px-5 py-2 rounded-lg text-sm font-bold" style={{ background: 'var(--sm-red)', color: '#fff' }}>Retry</button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Answer cards */}
          {(answers as any)[tab] && <AnswerCards answers={(answers as any)[tab]} />}

          {/* ═══════ OVERVIEW TAB ═══════ */}
          {tab === 'Overview' && <>
            {/* Traffic trends */}
            <Section title="Traffic Trends">
              <ResponsiveContainer width="100%" height={380}>
                <ComposedChart data={data.publishingTrend}>
                  <defs>
                    <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.blue} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={C.blue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tickFormatter={fD} tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <RTooltip content={<ChartTip />} />
                  <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ color: 'var(--sm-text-muted)', fontSize: 13 }}>{v}</span>} />
                  <Area yAxisId="left" type="monotone" dataKey="views" stroke={C.blue} fill="url(#viewsGrad)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: C.blue }} name="Views" />
                  <Bar yAxisId="right" dataKey="count" fill={C.purple + '60'} radius={[3, 3, 0, 0]} name="Posts" />
                </ComposedChart>
              </ResponsiveContainer>
            </Section>

            {/* Monthly Trend */}
            {(() => {
              const monthsWithViews = data.monthlyTrend.filter(m => m.views !== null && m.views > 0)
              const showFiltered = monthsWithViews.length > 0 && monthsWithViews.length < 4
              const trendData = showFiltered ? monthsWithViews : data.monthlyTrend.filter(m => m.count > 0 || (m.views !== null && m.views > 0))
              if (trendData.length === 0) return null
              return (
                <Section title="Monthly Trend" badge={<span className="text-xs tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>last 12 months</span>}>
                  <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" tickFormatter={fM} tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} />
                      <RTooltip content={<ChartTip />} />
                      <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ color: 'var(--sm-text-muted)', fontSize: 13 }}>{v}</span>} />
                      <Bar yAxisId="left" dataKey="count" fill={C.purple + '60'} radius={[3, 3, 0, 0]} name="Posts" />
                      <Line yAxisId="right" type="monotone" dataKey="views" stroke={C.blue} strokeWidth={2} dot={{ r: 3, fill: C.blue }} activeDot={{ r: 5, fill: C.blue }} name="Views" />
                    </ComposedChart>
                  </ResponsiveContainer>
                  {showFiltered && (
                    <p className="text-xs mt-2 text-center" style={{ color: 'var(--sm-text-dim)' }}>
                      View tracking started {fM(monthsWithViews[0].month)}. Showing only months with view data.
                    </p>
                  )}
                </Section>
              )
            })()}

            {/* Top movers table */}
            <Section title="Top Content" badge={<span className="text-xs tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>{data.topContent.length} articles</span>}>
              <SortableTable
                columns={[
                  { key: 'title', label: 'Title', render: (v: string) => <span className="font-medium truncate block" style={{ maxWidth: 400 }}>{v}</span> },
                  { key: 'author_name', label: 'Author' },
                  { key: 'category_name', label: 'Category', render: (v: string) => <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: C.blue + '12', color: C.blue }}>{v}</span> },
                  { key: 'views', label: 'Views', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.blue }}>{fN(v || 0)}</span> },
                  { key: 'published_at', label: 'Date', align: 'right', priority: 'low', render: (v: string) => <span style={{ color: 'var(--sm-text-muted)' }}>{fD(v)}</span> },
                ]}
                data={data.topContent}
                onRowClick={openPost}
                pageSize={10}
              />
            </Section>
          </>}

          {/* ═══════ WRITERS TAB ══��════ */}
          {tab === 'Writers' && <>
            <Section title="Writer Leaderboard" badge={<span className="text-xs tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>{data.writers.length} writers</span>}>
              <SortableTable
                columns={[
                  { key: 'name', label: 'Writer', render: (v: string, r: any) => (
                    <div className="flex items-center gap-3">
                      {r.avatar ? <Image src={r.avatar} alt="" width={32} height={32} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: C.blue + '20', color: C.blue }}>{v.charAt(0)}</div>}
                      <div>
                        <span className="font-semibold">{v}</span>
                        <span className="text-xs ml-2 capitalize" style={{ color: 'var(--sm-text-dim)' }}>{r.role || 'author'}</span>
                      </div>
                    </div>
                  )},
                  { key: 'posts', label: 'Posts', align: 'right', render: (v: number) => <span className="font-bold tabular-nums">{v}</span> },
                  { key: 'views', label: 'Views', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.blue }}>{fN(v)}</span> },
                  { key: 'avgViews', label: 'Avg Views', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.purple }}>{fN(v)}</span> },
                  { key: 'topCategories', label: 'Categories', priority: 'low',
                    render: (v: string[]) => <div className="flex gap-1 flex-wrap">{(v || []).map(c => <span key={c} className="text-xs px-2 py-0.5 rounded-full" style={{ background: C.indigo + '12', color: C.indigo }}>{c}</span>)}</div>
                  },
                ]}
                data={data.writers}
                onRowClick={openWriter}
              />
            </Section>
            {/* Writer publishing trend (real data) */}
            {data.writerTrends && data.writerTrends.length > 0 && (
              <Section title="Top Writers — Monthly Output" badge={<span className="text-xs tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>top 5</span>}>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={data.writerMonths.map(m => {
                    const row: any = { month: m }
                    for (const wt of data.writerTrends) {
                      row[wt.name] = wt.data.find(d => d.month === m)?.count || 0
                    }
                    return row
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tickFormatter={fM} tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <RTooltip content={<ChartTip />} />
                    <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ color: 'var(--sm-text-muted)', fontSize: 13 }}>{v}</span>} />
                    {data.writerTrends.map((wt, i) => (
                      <Line key={wt.id} type="monotone" dataKey={wt.name} stroke={PAL[i % PAL.length]} strokeWidth={2} dot={{ r: 3 }} name={wt.name} />
                    ))}
                  </ComposedChart>
                </ResponsiveContainer>
              </Section>
            )}
          </>}

          {/* ═══════ SOCIAL TAB ═══════ */}
          {tab === 'Social' && <>
            {/* Platform summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Audience', value: fN(data.social.youtube.reduce((s: number, c: any) => s + c.subscribers, 0) + data.social.x.reduce((s: number, c: any) => s + c.followers, 0) + data.social.facebook.filter((p: any) => !p.needsToken).reduce((s: number, c: any) => s + c.followers, 0)), color: C.blue, sub: 'all platforms' },
                { label: 'YouTube Subs', value: fN(data.social.youtube.reduce((s: number, c: any) => s + c.subscribers, 0)), color: '#BC0000', sub: `${data.social.youtube.length} channels` },
                { label: 'X Followers', value: fN(data.social.x.reduce((s: number, c: any) => s + c.followers, 0)), color: '#a1a1aa', sub: `${data.social.x.length} accounts` },
                { label: 'FB Followers', value: fN(data.social.facebook.filter((p: any) => !p.needsToken).reduce((s: number, c: any) => s + c.followers, 0)), color: '#1877f2', sub: `${data.social.facebook.length} pages` },
              ].map(s => (
                <div key={s.label} className="rounded-lg border px-4 py-3" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text-dim)' }}>{s.label}</p>
                  <p className="text-2xl font-extrabold tabular-nums mt-1" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--sm-text-muted)' }}>{s.sub}</p>
                </div>
              ))}
            </div>
            {/* Facebook token warning */}
            {data.social.facebook.some((p: any) => p.needsToken) && (
              <div className="rounded-lg border px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.25)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#f59e0b', flexShrink: 0 }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
                </svg>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#f59e0b' }}>Facebook Token Expired</p>
                  <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>Reconnect by updating <span className="font-mono">FB_PAGE_ACCESS_TOKEN</span> and <span className="font-mono">FB_PAGE_ID</span> in Vercel Env Vars.</p>
                </div>
              </div>
            )}
            {/* YouTube channels table */}
            {data.social.youtube.length > 0 && (
              <Section title="YouTube Channels">
                <SortableTable
                  columns={[
                    { key: 'name', label: 'Channel', render: (v: string, r: any) => (
                      <div className="flex items-center gap-3">{r.thumbnail ? <Image src={r.thumbnail} alt="" width={32} height={32} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#BC000020', color: '#BC0000' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg></div>}<span className="font-semibold">{v}</span></div>
                    )},
                    { key: 'subscribers', label: 'Subscribers', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: '#BC0000' }}>{fN(v)}</span> },
                    { key: 'totalViews', label: 'Views', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.purple }}>{fN(v)}</span> },
                    { key: 'videoCount', label: 'Videos', align: 'right', render: (v: number) => <span className="font-bold tabular-nums">{v}</span> },
                  ]}
                  data={data.social.youtube}
                />
              </Section>
            )}
            {/* X accounts table */}
            {data.social.x.length > 0 && (
              <Section title="X / Twitter Accounts">
                <SortableTable
                  columns={[
                    { key: 'name', label: 'Account', render: (v: string, r: any) => <div className="flex items-center gap-2"><span className="font-semibold">{v}</span><span className="text-xs" style={{ color: 'var(--sm-text-dim)' }}>@{r.username}</span></div> },
                    { key: 'followers', label: 'Followers', align: 'right', render: (v: number) => <span className="font-bold tabular-nums">{fN(v)}</span> },
                    { key: 'tweets', label: 'Posts', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.slate }}>{fN(v)}</span> },
                    { key: 'listed', label: 'Listed', align: 'right', priority: 'low', render: (v: number) => <span className="font-bold tabular-nums">{fN(v)}</span> },
                  ]}
                  data={data.social.x}
                />
              </Section>
            )}
          </>}

          {/* ═══════ SEO TAB ═══════ */}
          {tab === 'SEO' && <>
            {data.seo?.monthLabel && (
              <div
                className="rounded-lg border px-4 py-2 text-xs flex items-center gap-2"
                style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)', color: 'var(--sm-text-muted)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: C.blue }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span>
                  SEMRush data is monthly — showing snapshot for{' '}
                  <span className="font-bold" style={{ color: 'var(--sm-text)' }}>{data.seo.monthLabel}</span>
                  {data.seo.isHistorical && <span className="ml-1 opacity-70">(historical)</span>}
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { l: 'Domain Rank', v: data.seo?.overview ? fN(data.seo.overview.rank) : 'N/A', c: C.green, s: 'SEMRush' },
                { l: 'Organic Keywords', v: data.seo?.overview ? fN(data.seo.overview.organicKeywords) : 'N/A', c: C.blue, s: 'ranking keywords' },
                { l: 'Organic Traffic', v: data.seo?.overview ? fN(data.seo.overview.organicTraffic) : 'N/A', c: C.amber, s: 'estimated monthly visits' },
              ].map(m => (
                <div key={m.l} className="rounded-lg border px-4 py-3" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text-dim)' }}>{m.l}</p>
                  <p className="text-2xl font-extrabold tabular-nums mt-1" style={{ color: m.c }}>{m.v}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--sm-text-muted)' }}>{m.s}</p>
                </div>
              ))}
            </div>
            {/* SEMRush Keywords Table */}
            <Section title="Top Ranking Keywords" badge={data.seo?.keywords?.length ? <span className="text-xs tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>{data.seo.keywords.length} keywords</span> : undefined}>
              {data.seo?.keywords && data.seo.keywords.length > 0 ? (
                <SortableTable
                  columns={[
                    { key: 'keyword', label: 'Keyword', render: (v: string) => <span className="font-medium">{v}</span> },
                    { key: 'position', label: 'Position', align: 'right', render: (v: number, r: any) => {
                      const diff = r.previousPosition - v
                      return (
                        <span className="inline-flex items-center gap-1">
                          <span className="font-bold tabular-nums" style={{ color: C.green }}>{v}</span>
                          {diff !== 0 && <span className="text-xs font-bold tabular-nums" style={{ color: diff > 0 ? '#10b981' : '#bc0000' }}>{diff > 0 ? '+' : ''}{diff}</span>}
                        </span>
                      )
                    }},
                    { key: 'searchVolume', label: 'Volume', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.blue }}>{fN(v)}</span> },
                    { key: 'trafficPct', label: 'Traffic %', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.purple }}>{v.toFixed(2)}%</span> },
                    { key: 'cpc', label: 'CPC', align: 'right', priority: 'low', render: (v: number) => <span className="tabular-nums" style={{ color: 'var(--sm-text-muted)' }}>${v.toFixed(2)}</span> },
                    { key: 'url', label: 'URL', priority: 'low', render: (v: string) => <span className="text-xs truncate block" style={{ maxWidth: 200, color: 'var(--sm-text-dim)' }}>{v.replace(/^https?:\/\/(www\.)?sportsmockery\.com/, '')}</span> },
                  ]}
                  data={data.seo.keywords}
                  pageSize={10}
                />
              ) : (
                <p className="text-sm py-4 text-center" style={{ color: 'var(--sm-text-dim)' }}>No keyword data available. Check SEMRush API key.</p>
              )}
            </Section>
            {/* Google Search Console */}
            <Section
              title="Google Search Console"
              badge={
                gscConnected === false ? (
                  <span className="text-xs" style={{ color: 'var(--sm-text-dim)' }}>Not connected</span>
                ) : gscConnected && gscData?.email ? (
                  <span className="text-xs tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>
                    {gscData.email} · {gscData.property}
                  </span>
                ) : undefined
              }
              actions={
                gscConnected ? (
                  <a
                    href="/api/admin/google-search-console/connect"
                    className="text-xs font-bold px-2.5 py-1 rounded border transition-colors"
                    style={{ borderColor: 'var(--sm-border)', color: 'var(--sm-text-muted)', background: 'var(--sm-surface)' }}
                  >
                    Reconnect
                  </a>
                ) : null
              }
            >
              {gscLoading && gscData == null ? (
                <p className="text-sm py-4 text-center" style={{ color: 'var(--sm-text-dim)' }}>Loading Search Console data…</p>
              ) : gscConnected === false ? (
                <div className="py-6 text-center">
                  <p className="text-sm mb-3" style={{ color: 'var(--sm-text-muted)' }}>
                    Connect a Google account with access to <code style={{ background: 'var(--sm-surface)', padding: '2px 6px', borderRadius: 4 }}>sportsmockery.com</code> to pull clicks, impressions, CTR, and queries directly from Search Console.
                  </p>
                  <a
                    href="/api/admin/google-search-console/connect"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-bold transition-colors"
                    style={{ background: '#00D4FF', color: '#fff' }}
                  >
                    Connect Search Console
                  </a>
                </div>
              ) : gscData ? (
                <div className="space-y-4">
                  {/* KPI cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { l: 'Clicks',      v: fN(gscData.totals?.clicks || 0),      prev: gscData.previous?.clicks      || 0, curr: gscData.totals?.clicks      || 0, c: C.blue },
                      { l: 'Impressions', v: fN(gscData.totals?.impressions || 0), prev: gscData.previous?.impressions || 0, curr: gscData.totals?.impressions || 0, c: C.purple },
                      { l: 'CTR',         v: ((gscData.totals?.ctr || 0) * 100).toFixed(2) + '%', prev: gscData.previous?.ctr || 0, curr: gscData.totals?.ctr || 0, c: C.green },
                      { l: 'Avg Position', v: (gscData.totals?.position || 0).toFixed(1), prev: gscData.previous?.position || 0, curr: gscData.totals?.position || 0, c: C.amber, lowerIsBetter: true },
                    ].map(m => {
                      const delta = m.curr - m.prev
                      const pct = m.prev !== 0 ? (delta / m.prev) * 100 : 0
                      const positive = m.lowerIsBetter ? delta < 0 : delta > 0
                      return (
                        <div key={m.l} className="rounded-lg border px-4 py-3" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
                          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text-dim)' }}>{m.l}</p>
                          <p className="text-2xl font-extrabold tabular-nums mt-1" style={{ color: m.c }}>{m.v}</p>
                          {m.prev !== 0 && (
                            <p className="text-xs tabular-nums mt-0.5" style={{ color: positive ? '#10b981' : '#bc0000' }}>
                              {delta > 0 ? '+' : ''}{pct.toFixed(1)}% vs. prev period
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Top queries */}
                  {Array.isArray(gscData.topQueries) && gscData.topQueries.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--sm-text-dim)' }}>Top Queries</h4>
                      <SortableTable
                        columns={[
                          { key: 'query', label: 'Query', render: (v: string) => <span className="font-medium">{v}</span> },
                          { key: 'clicks',      label: 'Clicks',      align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.blue }}>{fN(v)}</span> },
                          { key: 'impressions', label: 'Impressions', align: 'right', render: (v: number) => <span className="tabular-nums" style={{ color: 'var(--sm-text-muted)' }}>{fN(v)}</span> },
                          { key: 'ctr',         label: 'CTR',         align: 'right', render: (v: number) => <span className="tabular-nums" style={{ color: C.green }}>{(v * 100).toFixed(2)}%</span> },
                          { key: 'position',    label: 'Avg Position', align: 'right', render: (v: number) => <span className="tabular-nums" style={{ color: C.amber }}>{v.toFixed(1)}</span> },
                        ]}
                        data={gscData.topQueries}
                        pageSize={10}
                      />
                    </div>
                  )}

                  {/* Top pages */}
                  {Array.isArray(gscData.topPages) && gscData.topPages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--sm-text-dim)' }}>Top Pages</h4>
                      <SortableTable
                        columns={[
                          { key: 'page', label: 'Page', render: (v: string) => <span className="text-xs font-mono truncate block" style={{ maxWidth: 360 }}>{v.replace(/^https?:\/\/(www\.)?sportsmockery\.com/, '')}</span> },
                          { key: 'clicks',      label: 'Clicks',      align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.blue }}>{fN(v)}</span> },
                          { key: 'impressions', label: 'Impressions', align: 'right', render: (v: number) => <span className="tabular-nums" style={{ color: 'var(--sm-text-muted)' }}>{fN(v)}</span> },
                          { key: 'ctr',         label: 'CTR',         align: 'right', render: (v: number) => <span className="tabular-nums" style={{ color: C.green }}>{(v * 100).toFixed(2)}%</span> },
                          { key: 'position',    label: 'Avg Position', align: 'right', render: (v: number) => <span className="tabular-nums" style={{ color: C.amber }}>{v.toFixed(1)}</span> },
                        ]}
                        data={gscData.topPages}
                        pageSize={10}
                      />
                    </div>
                  )}

                  {gscData.error && (
                    <p className="text-xs" style={{ color: '#bc0000' }}>GSC error: {gscData.error}</p>
                  )}
                </div>
              ) : null}
            </Section>

            {/* Competitors */}
            {data.seo?.competitors && data.seo.competitors.length > 0 && (
              <Section title="Organic Competitors" badge={<span className="text-xs tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>{data.seo.competitors.length} competitors</span>}>
                <SortableTable
                  columns={[
                    { key: 'domain', label: 'Domain', render: (v: string) => <span className="font-medium">{v}</span> },
                    { key: 'relevance', label: 'Relevance', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.purple }}>{(v * 100).toFixed(1)}%</span> },
                    { key: 'commonKeywords', label: 'Common Keywords', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.blue }}>{fN(v)}</span> },
                    { key: 'organicKeywords', label: 'Organic Keywords', align: 'right', priority: 'low', render: (v: number) => <span className="font-bold tabular-nums">{fN(v)}</span> },
                    { key: 'organicTraffic', label: 'Organic Traffic', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.green }}>{fN(v)}</span> },
                  ]}
                  data={data.seo.competitors}
                />
              </Section>
            )}
          </>}

          {/* ═══════ CONTENT TAB ═══════ */}
          {tab === 'Content' && <>
            <Section title="Publishing Velocity">
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={data.publishingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tickFormatter={fD} tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <RTooltip content={<ChartTip />} />
                  <Bar dataKey="count" fill={C.blue + '70'} radius={[3, 3, 0, 0]} name="Posts Published" />
                  <ReferenceLine y={data.publishingTrend.length > 0 ? Math.round(data.publishingTrend.reduce((s, d) => s + d.count, 0) / data.publishingTrend.length) : 0} stroke={C.amber} strokeDasharray="4 4" label={{ value: 'Avg', fill: C.amber, fontSize: 12 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </Section>
            {/* Category breakdown */}
            <Section title="Category Breakdown" badge={<span className="text-xs tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>{data.categories.length} categories</span>}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.categories.slice(0, 10)} layout="vertical">
                      <XAxis type="number" tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#8a8a9a', fontSize: 13 }} tickLine={false} axisLine={false} />
                      <RTooltip content={<ChartTip />} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Posts">
                        {data.categories.slice(0, 10).map((_, i) => <Cell key={i} fill={PAL[i % PAL.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  {data.categories.slice(0, 10).map((c, i) => (
                    <div key={c.name} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: 'var(--sm-border)' }}>
                      <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: PAL[i % PAL.length] }} />
                      <span className="text-sm flex-1" style={{ color: 'var(--sm-text)' }}>{c.name}</span>
                      <span className="text-sm font-bold tabular-nums" style={{ color: PAL[i % PAL.length] }}>{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
            <TopArticlesModule topContent={data.topContent} onPostClick={openPost} />
          </>}

          {/* ═══════ PAYMENTS TAB ═══════ */}
          {tab === 'Payments' && <>
            {/* Payment Sync Status Banner */}
            {(() => {
              const ps = data.paymentSync?.sync
              if (!ps || ps.status === 'success') return null
              const isFailed = ps.status === 'failed'
              const isPartial = ps.status === 'partial'
              const isUnknown = ps.status === 'unknown'
              const lastSyncDate = ps.lastSync ? new Date(ps.lastSync).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) : 'Unknown'
              return (
                <div className="rounded-xl border p-4 flex items-start gap-4" style={{
                  background: isFailed ? 'rgba(188,0,0,0.04)' : 'rgba(245,158,11,0.04)',
                  borderColor: isFailed ? 'rgba(188,0,0,0.25)' : 'rgba(245,158,11,0.25)',
                }}>
                  <div className="relative flex-shrink-0 mt-1">
                    <span className="absolute inline-flex h-4 w-4 rounded-full opacity-75 animate-ping" style={{ backgroundColor: isFailed ? '#bc0000' : '#f59e0b' }} />
                    <span className="relative inline-flex h-4 w-4 rounded-full" style={{ backgroundColor: isFailed ? '#bc0000' : '#f59e0b' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-extrabold uppercase tracking-wide" style={{ color: isFailed ? '#bc0000' : '#f59e0b' }}>
                      {isFailed ? 'PAYMENT SYNC FAILED — DO NOT ISSUE PAYMENTS' : isPartial ? 'PAYMENT SYNC PARTIAL — VERIFY DATA' : 'PAYMENT SYNC STATUS UNKNOWN'}
                    </p>
                    <p className="text-sm mt-1" style={{ color: isFailed ? '#bc0000' : '#f59e0b' }}>
                      Last sync attempt: {lastSyncDate}{ps.errorMessage ? ` — Error: ${ps.errorMessage}` : ''}
                    </p>
                    {isFailed && (
                      <p className="text-sm mt-2" style={{ color: 'var(--sm-text-muted)' }}>
                        The monthly view data has not been verified. Contact engineering before approving any payments.
                      </p>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* 2. KPI Cards Row */}
            {(() => {
              const payments = data.paymentSync?.payments || []
              const totalPayout = payments.reduce((s: number, p: any) => s + (p.calculated_pay || 0), 0)
              const totalViews = payments.reduce((s: number, p: any) => s + (p.total_views || 0), 0)
              const totalPosts = payments.reduce((s: number, p: any) => s + (p.total_posts || 0), 0)
              return (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {[
                    { l: 'Total Payout', v: '$' + totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), c: '#00D4FF' },
                    { l: 'Writers', v: String(payments.length), c: 'var(--sm-text)' },
                    { l: 'Total Views', v: fN(totalViews), c: 'var(--sm-text)' },
                    { l: 'Total Posts', v: String(totalPosts), c: 'var(--sm-text)' },
                  ].map(m => (
                    <div key={m.l} className="rounded-lg border px-4 py-3" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
                      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text-dim)' }}>{m.l}</p>
                      <p className="text-2xl font-extrabold tabular-nums mt-1" style={{ color: m.c }}>{m.v}</p>
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* 3. Writer Payment Table */}
            <Section title="Writer Payments">
              <WriterPaymentsTable
                payments={data.paymentSync?.payments || []}
                payBreakdownOpen={payBreakdownOpen}
                setPayBreakdownOpen={setPayBreakdownOpen}
              />
            </Section>

            {/* 4. Writer Formulas Panel */}
            <Section title="Writer Payment Formulas">
              {(() => {
                const formulas: Array<{ id: string; name: string; desc: string; formula: string; effectiveDate: string }> = data.paymentSync?.formulas || []

                if (formulas.length === 0) {
                  return <p className="text-sm py-4 text-center" style={{ color: 'var(--sm-text-dim)' }}>No payment formulas configured. Add formulas in the writer_payment_formulas table.</p>
                }

                const startEdit = (f: typeof formulas[0]) => {
                  setEditingFormulaId(f.id)
                  setEditFormulaDesc(f.desc)
                  setEditFormulaCode(f.formula)
                  setEditFormulaDate(f.effectiveDate)
                }

                const cancelEdit = () => {
                  setEditingFormulaId(null)
                  setEditFormulaDesc('')
                  setEditFormulaCode('')
                  setEditFormulaDate('')
                }

                const saveFormula = async (id: string) => {
                  setSavingFormulaId(id)
                  try {
                    const r = await fetch('/api/admin/writer-formulas', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id,
                        formula_description: editFormulaDesc,
                        formula_code: editFormulaCode,
                        effective_from: editFormulaDate,
                      }),
                    })
                    if (!r.ok) {
                      const err = await r.json().catch(() => ({}))
                      alert(err.error || `Save failed (${r.status})`)
                      return
                    }
                    cancelEdit()
                    await load(true)
                  } catch (e: any) {
                    alert(e?.message || 'Save failed')
                  } finally {
                    setSavingFormulaId(null)
                  }
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {formulas.map(f => (
                      <div key={f.id} className="rounded-lg border p-3 relative" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
                        {editingFormulaId === f.id ? (
                          /* Edit state */
                          <div className="space-y-2">
                            <p className="text-sm font-bold" style={{ color: 'var(--sm-text)' }}>{f.name}</p>
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wide block mb-0.5" style={{ color: 'var(--sm-text-dim)' }}>Description</label>
                              <input
                                type="text"
                                value={editFormulaDesc}
                                onChange={e => setEditFormulaDesc(e.target.value)}
                                className="w-full text-xs px-2 py-1.5 rounded border outline-none"
                                style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)', color: 'var(--sm-text)' }}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wide block mb-0.5" style={{ color: 'var(--sm-text-dim)' }}>Formula</label>
                              <input
                                type="text"
                                value={editFormulaCode}
                                onChange={e => setEditFormulaCode(e.target.value)}
                                className="w-full text-[10px] font-mono px-2 py-1.5 rounded border outline-none"
                                style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)', color: 'var(--sm-text-muted)' }}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wide block mb-0.5" style={{ color: 'var(--sm-text-dim)' }}>Effective Date</label>
                              <input
                                type="text"
                                value={editFormulaDate}
                                onChange={e => setEditFormulaDate(e.target.value)}
                                className="w-full text-xs px-2 py-1.5 rounded border outline-none"
                                style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)', color: 'var(--sm-text)' }}
                              />
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={cancelEdit}
                                className="text-xs font-bold px-2.5 py-1 rounded border transition-colors"
                                style={{ borderColor: 'var(--sm-border)', color: 'var(--sm-text-muted)', background: 'var(--sm-surface)' }}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveFormula(f.id)}
                                disabled={savingFormulaId === f.id}
                                className="text-xs font-bold px-2.5 py-1 rounded transition-colors disabled:opacity-50"
                                style={{ background: 'var(--sm-red)', color: '#fff' }}
                              >
                                {savingFormulaId === f.id ? 'Saving…' : 'Save'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* View state */
                          <>
                            <button
                              onClick={() => startEdit(f)}
                              className="absolute top-2 right-2 p-1 rounded transition-colors"
                              style={{ color: 'var(--sm-text-dim)' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'var(--sm-surface)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <p className="text-sm font-bold pr-6" style={{ color: 'var(--sm-text)' }}>{f.name}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--sm-text-muted)' }}>{f.desc}</p>
                            <p className="text-[10px] font-mono mt-2 p-1.5 rounded" style={{ background: 'var(--sm-surface)', color: 'var(--sm-text-dim)' }}>
                              {f.formula}
                            </p>
                            <p className="text-[10px] mt-2" style={{ color: 'var(--sm-text-dim)' }}>
                              Effective: {f.effectiveDate}
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })()}
            </Section>

            {/* 5. Bulk Actions Row */}
            <div className="rounded-lg border px-4 py-3 flex items-center justify-between" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-sm font-bold rounded transition-colors" style={{ backgroundColor: '#00D4FF', color: '#fff' }}>
                  Approve All Pending
                </button>
                <button className="px-4 py-2 text-sm font-bold rounded border transition-colors" style={{ borderColor: '#cbd5e1', backgroundColor: '#f8fafc', color: '#475569' }}>
                  Export CSV
                </button>
              </div>
              <p className="text-xs" style={{ color: 'var(--sm-text-dim)' }}>
                Approvals recorded as <span className="font-semibold" style={{ color: 'var(--sm-text-muted)' }}>Admin User</span> at {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>

            {/* 6. Payment History Card */}
            <Section title="Payment History">
              {(() => {
                const historyRaw: any[] = data.paymentSync?.history || []

                // Group history by period_start month
                const monthMap = new Map<string, { total: number; writers: any[] }>()
                for (const h of historyRaw) {
                  const d = new Date(h.period_start)
                  const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  const entry = monthMap.get(key) || { total: 0, writers: [] }
                  entry.total += h.calculated_pay || 0
                  entry.writers.push({
                    name: h.writer_name,
                    posts: h.total_posts,
                    views: h.total_views,
                    formula: h.formula_name || '—',
                    calcPay: h.calculated_pay || 0,
                    status: (h.status || 'pending').charAt(0).toUpperCase() + (h.status || 'pending').slice(1),
                  })
                  monthMap.set(key, entry)
                }
                const months = Array.from(monthMap.entries()).map(([month, data]) => ({ month, ...data }))

                if (months.length === 0) {
                  return <p className="text-sm py-4 text-center" style={{ color: 'var(--sm-text-dim)' }}>No payment history available yet.</p>
                }

                const maxTotal = Math.max(...months.map(m => m.total), 1)

                return (
                  <div className="space-y-4">
                    {/* Bar Chart */}
                    <div className="rounded-lg border p-4" style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)' }}>
                      <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--sm-text-dim)' }}>Monthly Payout (Last 12 Months)</p>
                      <div className="flex items-end gap-1.5 h-32">
                        {months.slice().reverse().map((m, i) => {
                          const heightPct = (m.total / maxTotal) * 100
                          return (
                            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                              <div
                                className="w-full rounded-t transition-all cursor-pointer"
                                style={{
                                  height: `${heightPct}%`,
                                  minHeight: 4,
                                  backgroundColor: '#00D4FF',
                                  opacity: expandedHistoryMonth === m.month ? 1 : 0.7,
                                }}
                                onClick={() => setExpandedHistoryMonth(expandedHistoryMonth === m.month ? null : m.month)}
                                title={`${m.month}: $${m.total.toLocaleString()}`}
                              />
                              <span className="text-[8px] font-bold" style={{ color: 'var(--sm-text-dim)' }}>
                                {m.month.split(' ')[0].slice(0, 3)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Accordion List */}
                    <div className="space-y-1">
                      {months.map(m => (
                        <div key={m.month} className="rounded-lg border overflow-hidden" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
                          {/* Accordion Header */}
                          <button
                            onClick={() => setExpandedHistoryMonth(expandedHistoryMonth === m.month ? null : m.month)}
                            className="w-full px-4 py-3 flex items-center justify-between transition-colors"
                            style={{ background: expandedHistoryMonth === m.month ? 'var(--sm-surface)' : 'transparent' }}
                          >
                            <div className="flex items-center gap-3">
                              <svg
                                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                className="transition-transform"
                                style={{ color: 'var(--sm-text-dim)', transform: expandedHistoryMonth === m.month ? 'rotate(90deg)' : 'rotate(0deg)' }}
                              >
                                <path d="M9 18l6-6-6-6" />
                              </svg>
                              <span className="text-sm font-semibold" style={{ color: 'var(--sm-text)' }}>{m.month}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-bold tabular-nums" style={{ color: '#00D4FF' }}>${m.total.toLocaleString()}</span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: '#00D4FF' }}>
                                Completed
                              </span>
                            </div>
                          </button>

                          {/* Accordion Content */}
                          {expandedHistoryMonth === m.month && (
                            <div className="border-t px-4 py-3" style={{ borderColor: 'var(--sm-border)' }}>
                              {m.writers.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <PaymentHistoryDetailTable rows={m.writers} />
                                </div>
                              ) : (
                                <p className="text-sm py-2" style={{ color: 'var(--sm-text-dim)' }}>Detailed breakdown not available for this period.</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </Section>
          </>}

          {tab === 'Freestar' && (() => {
            // Calculate writer expenses from payment data
            const payments = data.paymentSync?.payments || []
            const writerExpenses = payments.reduce((s: number, p: any) => s + (p.calculated_pay || 0), 0)
            // Freehand expenses total
            const freehandTotal = freehandExpenses.reduce((s, e) => s + e.amount, 0)
            const totalExpenses = writerExpenses + freehandTotal
            // Revenue from Freestar (real data only — null if unavailable)
            const revenue = freestarRevenue
            const profit = revenue != null ? revenue - totalExpenses : null
            const margin = revenue != null && revenue > 0 ? ((profit! / revenue) * 100).toFixed(1) : '0.0'

            // PoP delta helper
            const popDelta = (curr: number | null | undefined, prev: number | null | undefined): { pct: string; up: boolean } | null => {
              if (curr == null || prev == null || prev === 0) return curr != null && prev === 0 && curr > 0 ? { pct: '+100%', up: true } : null
              const d = ((curr - prev) / prev) * 100
              return { pct: (d >= 0 ? '+' : '') + d.toFixed(2) + '%', up: d >= 0 }
            }

            // Format value helpers for the metric cards
            const fmtCurrency = (v: number | null | undefined) => v != null ? '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '\u2014'
            const fmtInt = (v: number | null | undefined) => v != null ? v.toLocaleString('en-US') : '\u2014'
            const fmtPct = (v: number | null | undefined) => v != null ? v.toFixed(2) + '%' : '\u2014'

            // Build the 6-metric card definitions mirroring pub.network
            const metricCards: Array<{ label: string; value: string; prev: number | null | undefined; curr: number | null | undefined }> = [
              { label: 'Net Revenue', value: fmtCurrency(freestarMetrics?.revenue ?? revenue), curr: freestarMetrics?.revenue ?? revenue, prev: freestarMetrics?.prevRevenue },
              { label: 'Impressions', value: fmtInt(freestarMetrics?.impressions), curr: freestarMetrics?.impressions, prev: freestarMetrics?.prevImpressions },
              { label: 'Net CPM', value: fmtCurrency(freestarMetrics?.netCpm), curr: freestarMetrics?.netCpm, prev: freestarMetrics?.prevNetCpm },
              { label: 'Viewability', value: fmtPct(freestarMetrics?.viewability), curr: freestarMetrics?.viewability, prev: freestarMetrics?.prevViewability },
              { label: 'Fill Rate', value: fmtPct(freestarMetrics?.fillRate), curr: freestarMetrics?.fillRate, prev: freestarMetrics?.prevFillRate },
              { label: 'Page RPM', value: fmtCurrency(freestarMetrics?.pageRpm), curr: freestarMetrics?.pageRpm, prev: freestarMetrics?.prevPageRpm },
            ]

            return <>
              {/* ── SOURCE INDICATOR BANNER ── */}
              <div className="rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm font-semibold" style={{
                background: revenueSource === 'api' ? 'rgba(16,185,129,0.08)' : revenueSource === 'local' ? 'rgba(59,130,246,0.08)' : 'rgba(245,158,11,0.08)',
                border: `1px solid ${revenueSource === 'api' ? 'rgba(16,185,129,0.25)' : revenueSource === 'local' ? 'rgba(59,130,246,0.25)' : 'rgba(245,158,11,0.25)'}`,
                color: revenueSource === 'api' ? '#10b981' : revenueSource === 'local' ? '#3b82f6' : '#f59e0b',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  {revenueSource === 'api' ? <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /> : revenueSource === 'local' ? <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /> : <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  {revenueSource === 'api' && <path d="M22 4L12 14.01l-3-3" />}
                  {revenueSource === 'local' && <><path d="M14 2v6h6" /><path d="M16 13H8m8 4H8m2-8H8" /></>}
                </svg>
                {revenueSource === 'api' ? 'Live from Freestar API' : revenueSource === 'local' ? 'From uploaded CSV reports' : 'Freestar data unavailable \u2014 check API token'}
                {freestarLoading && <span className="ml-2 text-xs opacity-70">(refreshing...)</span>}
              </div>

              {/* ── FREESTAR METRICS GRID (mirrors pub.network dashboard) ── */}
              <div className="rounded-xl border" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
                <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--sm-border)' }}>
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#00D4FF' }}>
                      <path d="M18 20V10M12 20V4M6 20v-6" />
                    </svg>
                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--sm-text)' }}>Freestar Metrics</h3>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--sm-text-dim)' }}>
                    {freestarLoading ? 'Fetching...' : `${range.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())} vs. prior period`}
                  </span>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {metricCards.map(mc => {
                      const delta = popDelta(mc.curr, mc.prev)
                      return (
                        <div key={mc.label} className="rounded-lg border px-4 py-3" style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)' }}>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--sm-text-dim)' }}>{mc.label}</p>
                          <p className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--sm-text)' }}>{mc.value}</p>
                          {delta ? (
                            <p className="text-xs font-bold mt-1 tabular-nums" style={{ color: delta.up ? '#10b981' : '#bc0000' }}>
                              {delta.pct} PoP
                            </p>
                          ) : (
                            <p className="text-xs mt-1" style={{ color: 'var(--sm-text-dim)' }}>&mdash;</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* ── P&L SUMMARY ── */}
              <div className="rounded-xl border" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
                <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--sm-border)' }}>
                  <div className="flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#00D4FF' }}>
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--sm-text)' }}>Profit & Loss</h3>
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: profit != null && profit >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(188,0,0,0.12)', color: profit != null && profit >= 0 ? '#10b981' : '#bc0000' }}>
                      {profit == null ? '\u2014' : profit >= 0 ? 'Profitable' : 'Loss'}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--sm-text-dim)' }}>
                    {freestarLoading ? 'Fetching...' : `Filtered: ${range.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}`}
                  </span>
                </div>

                {/* Three summary cards */}
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Revenue */}
                    <div className="rounded-xl border px-5 py-4 relative overflow-hidden" style={{ background: 'var(--sm-card)', borderColor: 'rgba(16,185,129,0.25)' }}>
                      <div className="absolute top-0 left-0 w-1 h-full" style={{ background: '#10b981' }} />
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#10b981' }}>Revenue</p>
                      <p className="text-3xl font-extrabold tabular-nums" style={{ color: '#10b981' }}>
                        {revenue != null ? `$${revenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '\u2014'}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--sm-text-dim)' }}>
                        {revenueSource === 'local' ? 'From uploaded reports' : revenueSource === 'api' ? 'Freestar API' : 'Freestar data unavailable \u2014 check API token'}
                      </p>
                    </div>
                    {/* Expenses */}
                    <div className="rounded-xl border px-5 py-4 relative overflow-hidden" style={{ background: 'var(--sm-card)', borderColor: 'rgba(188,0,0,0.25)' }}>
                      <div className="absolute top-0 left-0 w-1 h-full" style={{ background: '#bc0000' }} />
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#bc0000' }}>Expenses</p>
                      <p className="text-3xl font-extrabold tabular-nums" style={{ color: '#bc0000' }}>
                        ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs" style={{ color: 'var(--sm-text-dim)' }}>Writers: ${writerExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        {freehandTotal > 0 && <span className="text-xs" style={{ color: 'var(--sm-text-dim)' }}>Other: ${freehandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>}
                      </div>
                    </div>
                    {/* Profit */}
                    <div className="rounded-xl border px-5 py-4 relative overflow-hidden" style={{ background: 'var(--sm-card)', borderColor: profit != null && profit >= 0 ? 'rgba(16,185,129,0.25)' : 'rgba(188,0,0,0.25)' }}>
                      <div className="absolute top-0 left-0 w-1 h-full" style={{ background: profit != null && profit >= 0 ? '#10b981' : '#bc0000' }} />
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: profit != null && profit >= 0 ? '#10b981' : '#bc0000' }}>Profit</p>
                      <p className="text-3xl font-extrabold tabular-nums" style={{ color: profit != null && profit >= 0 ? '#10b981' : '#bc0000' }}>
                        {profit != null ? `${profit < 0 ? '-' : ''}$${Math.abs(profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '\u2014'}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--sm-text-dim)' }}>{margin}% margin</p>
                    </div>
                  </div>

                  {/* Expense breakdown */}
                  <div className="mt-5 rounded-lg border" style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)' }}>
                    <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--sm-border)' }}>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold" style={{ color: 'var(--sm-text)' }}>Expense Breakdown</h4>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(188,0,0,0.08)', color: '#bc0000' }}>
                          {payments.length} writer{payments.length !== 1 ? 's' : ''} + {freehandExpenses.length} other
                        </span>
                      </div>
                      <button
                        onClick={() => setShowExpenseForm(!showExpenseForm)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        style={{ background: showExpenseForm ? 'var(--sm-card-hover)' : 'var(--sm-red)', color: showExpenseForm ? 'var(--sm-text-muted)' : '#fff' }}
                      >
                        {showExpenseForm ? (
                          <>Cancel</>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                            Add Expense
                          </>
                        )}
                      </button>
                    </div>

                    {/* Add expense form */}
                    {showExpenseForm && (
                      <div className="px-4 py-3 border-b flex items-end gap-3" style={{ borderColor: 'var(--sm-border)', background: 'rgba(188,0,0,0.02)' }}>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--sm-text-dim)' }}>Description</label>
                          <input
                            value={newExpenseDesc} onChange={e => setNewExpenseDesc(e.target.value)}
                            placeholder="e.g. Hosting, Software, Freelancer"
                            className="w-full text-sm px-3 py-2 rounded-lg border outline-none"
                            style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)', color: 'var(--sm-text)' }}
                            onKeyDown={e => e.key === 'Enter' && addFreehandExpense()}
                          />
                        </div>
                        <div style={{ width: 130 }}>
                          <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--sm-text-dim)' }}>Amount ($)</label>
                          <input
                            value={newExpenseAmount} onChange={e => setNewExpenseAmount(e.target.value)}
                            placeholder="0.00" type="number" min="0" step="0.01"
                            className="w-full text-sm px-3 py-2 rounded-lg border outline-none tabular-nums"
                            style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)', color: 'var(--sm-text)' }}
                            onKeyDown={e => e.key === 'Enter' && addFreehandExpense()}
                          />
                        </div>
                        <div style={{ width: 150 }}>
                          <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--sm-text-dim)' }}>Date</label>
                          <input
                            value={newExpenseDate} onChange={e => setNewExpenseDate(e.target.value)}
                            type="date"
                            className="w-full text-sm px-3 py-2 rounded-lg border outline-none"
                            style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)', color: 'var(--sm-text)' }}
                          />
                        </div>
                        <button
                          onClick={addFreehandExpense}
                          disabled={!newExpenseDesc.trim() || !newExpenseAmount}
                          className="px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-30"
                          style={{ background: '#10b981', color: '#fff' }}
                        >
                          Add
                        </button>
                      </div>
                    )}

                    {/* Expense table */}
                    <div className="px-4 py-2">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b" style={{ borderColor: 'var(--sm-border)' }}>
                            <th className="text-xs font-semibold uppercase tracking-wide text-left px-2 py-2" style={{ color: 'var(--sm-text-dim)' }}>Type</th>
                            <th className="text-xs font-semibold uppercase tracking-wide text-left px-2 py-2" style={{ color: 'var(--sm-text-dim)' }}>Description</th>
                            <th className="text-xs font-semibold uppercase tracking-wide text-right px-2 py-2" style={{ color: 'var(--sm-text-dim)' }}>Amount</th>
                            <th className="text-xs font-semibold uppercase tracking-wide text-right px-2 py-2" style={{ color: 'var(--sm-text-dim)', width: 40 }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Writer expenses row */}
                          <tr className="border-b" style={{ borderColor: 'var(--sm-border)' }}>
                            <td className="px-2 py-2.5">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF' }}>Writers</span>
                            </td>
                            <td className="px-2 py-2.5 text-sm" style={{ color: 'var(--sm-text)' }}>
                              {payments.length} writer payment{payments.length !== 1 ? 's' : ''} (from Payments tab)
                            </td>
                            <td className="px-2 py-2.5 text-sm font-bold tabular-nums text-right" style={{ color: '#bc0000' }}>
                              ${writerExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td></td>
                          </tr>
                          {/* Freehand expenses */}
                          {freehandExpenses.map(exp => (
                            <tr key={exp.id} className="border-b transition-colors" style={{ borderColor: 'var(--sm-border)' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'var(--sm-card-hover)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                              <td className="px-2 py-2.5">
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>Manual</span>
                              </td>
                              <td className="px-2 py-2.5">
                                <div>
                                  <span className="text-sm" style={{ color: 'var(--sm-text)' }}>{exp.desc}</span>
                                  <span className="text-xs ml-2" style={{ color: 'var(--sm-text-dim)' }}>{new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                              </td>
                              <td className="px-2 py-2.5 text-sm font-bold tabular-nums text-right" style={{ color: '#bc0000' }}>
                                ${exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="px-2 py-2.5 text-right">
                                <button onClick={() => removeFreehandExpense(exp.id)} className="p-1 rounded transition-colors" style={{ color: 'var(--sm-text-dim)' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(188,0,0,0.1)'; e.currentTarget.style.color = '#bc0000' }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--sm-text-dim)' }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                          {/* Total row */}
                          <tr>
                            <td colSpan={2} className="px-2 py-3 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text)' }}>Total Expenses</td>
                            <td className="px-2 py-3 text-base font-extrabold tabular-nums text-right" style={{ color: '#bc0000' }}>
                              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── FREESTAR IFRAME ── */}
              <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
                <iframe
                  src="/admin/freestar"
                  className="w-full border-0"
                  style={{ height: 'calc(100vh - 220px)', minHeight: '700px' }}
                  title="Freestar Revenue Intelligence"
                />
              </div>
            </>
          })()}

          {/* ═══════ GOOGLE TAB ═══════ */}
          {tab === 'Google' && (
            <GoogleTab
              active={tab === 'Google'}
              range={range}
              customStart={customStart}
              customEnd={customEnd}
            />
          )}
        </div>
      )}

      {/* ── DETAIL DRAWER ──────────────────────────────────────── */}
      <DetailDrawer
        open={drawerType !== null}
        onClose={closeDrawer}
        title={drawerType === 'writer' ? (drawerData?.name || 'Writer Details') : (drawerData?.title || 'Article Details')}>
        {drawerType === 'writer' && drawerData && <WriterDrawerContent writer={drawerData} trend={data?.writerTrends?.find(wt => wt.id === drawerData.id)?.data || []} />}
        {drawerType === 'post' && drawerData && <PostDrawerContent post={drawerData} />}
      </DetailDrawer>
    </div>
  )
}
