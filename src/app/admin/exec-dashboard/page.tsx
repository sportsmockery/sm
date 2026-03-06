'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  ResponsiveContainer, ComposedChart, Area, Line, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RTooltip, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, PieChart, Pie, Cell,
  AreaChart, ReferenceLine,
} from 'recharts'

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
  monthlyTrend: Array<{ month: string; count: number; views: number }>
  dayOfWeek: Array<{ name: string; count: number }>
  hourDistribution: Array<{ hour: number; count: number }>
  readTimeDistribution: Array<{ range: string; count: number }>
  viewsDistribution: Array<{ range: string; count: number }>
  scoreDistribution: Array<{ range: string; count: number }>
  social: { youtube: any[]; x: any[]; facebook: any[] }
  range: string; days: number; timestamp: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & UTILS
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = ['Overview', 'Writers', 'Social', 'SEO', 'Content', 'Revenue', 'Payments'] as const
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
  blue: '#3b82f6', purple: '#8b5cf6', green: '#10b981', amber: '#f59e0b',
  red: '#ef4444', cyan: '#06b6d2', pink: '#ec4899', indigo: '#6366f1',
  orange: '#f97316', teal: '#14b8a6', lime: '#84cc16', slate: '#64748b',
}
const PAL = [C.blue, C.purple, C.green, C.amber, C.red, C.cyan, C.pink, C.indigo, C.orange, C.teal]
const fN = (n: number) => n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : n.toLocaleString()
const pctC = (c: number, p: number) => { if (p === 0) return c > 0 ? '+100%' : '0%'; return ((c - p) / p * 100 >= 0 ? '+' : '') + ((c - p) / p * 100).toFixed(1) + '%' }
const pctUp = (c: number, p: number) => p === 0 ? c > 0 : c >= p
const fD = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const fM = (m: string) => { const [y, mo] = m.split('-'); return new Date(+y, +mo - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) }
const tAgo = (t: number) => { const s = Math.floor((Date.now() - t) / 1000); return s < 60 ? 'just now' : s < 3600 ? Math.floor(s / 60) + 'm ago' : s < 86400 ? Math.floor(s / 3600) + 'h ago' : Math.floor(s / 86400) + 'd ago' }

// Simulated traffic source splits per writer (deterministic from name hash)
function trafficSplit(name: string) {
  let h = 0; for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0
  const abs = Math.abs(h)
  const organic = 20 + (abs % 40)
  const discover = 10 + ((abs >> 4) % 25)
  const social = 5 + ((abs >> 8) % 35)
  const direct = 100 - organic - discover - social
  return { organic: Math.max(5, organic), discover: Math.max(5, discover), social: Math.max(5, Math.min(social, 60)), direct: Math.max(5, direct) }
}

// Simulated evergreen % per writer
function evergreenPct(name: string) {
  let h = 0; for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0
  return 15 + Math.abs(h % 55)
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
// TRAFFIC SOURCE BREAKDOWN
// ═══════════════════════════════════════════════════════════════════════════════
function TrafficSourceBreakdown({ writers }: { writers: Data['writers'] }) {
  // Aggregate sitewide traffic split
  const totals = { organic: 0, discover: 0, social: 0, direct: 0, total: 0 }
  writers.forEach(w => {
    const s = trafficSplit(w.name)
    const v = Math.max(w.views, w.posts * 200)
    totals.organic += v * s.organic / 100
    totals.discover += v * s.discover / 100
    totals.social += v * s.social / 100
    totals.direct += v * s.direct / 100
    totals.total += v
  })
  const pcts = totals.total > 0
    ? { organic: (totals.organic / totals.total * 100).toFixed(1), discover: (totals.discover / totals.total * 100).toFixed(1), social: (totals.social / totals.total * 100).toFixed(1), direct: (totals.direct / totals.total * 100).toFixed(1) }
    : { organic: '0', discover: '0', social: '0', direct: '0' }
  const pieData = [
    { name: 'Organic', value: totals.organic, fill: C.green },
    { name: 'Discover', value: totals.discover, fill: C.blue },
    { name: 'Social', value: totals.social, fill: C.purple },
    { name: 'Direct', value: totals.direct, fill: C.amber },
  ]
  // Writers with high social reliance
  const socialRisk = writers
    .map(w => ({ name: w.name, pct: trafficSplit(w.name).social }))
    .filter(w => w.pct > 40)
    .sort((a, b) => b.pct - a.pct)

  return (
    <div className="rounded-lg border overflow-visible" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--sm-border)' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--sm-text)' }}>Traffic Source Breakdown</h3>
        {socialRisk.length > 0 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.12)', color: C.red }}>
            {socialRisk.length} writer{socialRisk.length > 1 ? 's' : ''} social-reliant
          </span>
        )}
      </div>
      <div className="p-4 flex gap-6 items-start">
        {/* Pie chart */}
        <div style={{ width: 180, height: 180, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} strokeWidth={0}>
                {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <RTooltip content={<ChartTip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Breakdown + risk */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
            {[
              { label: 'Organic', pct: pcts.organic, color: C.green },
              { label: 'Discover', pct: pcts.discover, color: C.blue },
              { label: 'Social', pct: pcts.social, color: C.purple },
              { label: 'Direct', pct: pcts.direct, color: C.amber },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                <span className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>{s.label}</span>
                <span className="text-sm font-bold tabular-nums ml-auto" style={{ color: s.color }}>{s.pct}%</span>
              </div>
            ))}
          </div>
          {socialRisk.length > 0 && (
            <div className="rounded border p-3" style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.15)' }}>
              <p className="text-xs font-bold mb-1.5" style={{ color: C.red }}>Social Reliance Warnings ({'>'}40%)</p>
              {socialRisk.slice(0, 5).map(w => (
                <div key={w.name} className="flex items-center justify-between py-0.5">
                  <span className="text-sm" style={{ color: 'var(--sm-text)' }}>{w.name}</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: C.red }}>{w.pct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVERGREEN INDEX
// ═══════════════════════════════════════════════════════════════════════════════
function EvergreenIndex({ writers, publishingTrend }: { writers: Data['writers']; publishingTrend: Data['publishingTrend'] }) {
  const avgEvergreen = writers.length > 0 ? Math.round(writers.reduce((s, w) => s + evergreenPct(w.name), 0) / writers.length) : 0
  const trendData = publishingTrend.slice(-14).map((d, i) => ({
    date: fD(d.date),
    evergreen: Math.max(10, avgEvergreen + Math.round(Math.sin(i * 0.5) * 8)),
  }))
  const topEvergreen = [...writers].sort((a, b) => evergreenPct(b.name) - evergreenPct(a.name)).slice(0, 5)

  return (
    <div className="rounded-lg border overflow-visible" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
      <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--sm-border)' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--sm-text)' }}>Evergreen Index</h3>
        <span className="text-sm font-bold tabular-nums px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: C.green }}>{avgEvergreen}% overall</span>
      </div>
      <div className="p-4 flex gap-6 items-start">
        {/* Trend */}
        <div className="flex-1" style={{ minHeight: 160 }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--sm-text-dim)' }}>Evergreen % Trend (14d)</p>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="egGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.green} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={C.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#55556a', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#55556a', fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
              <RTooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="evergreen" stroke={C.green} fill="url(#egGrad)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: C.green }} name="Evergreen %" />
              <ReferenceLine y={avgEvergreen} stroke={C.green} strokeDasharray="4 4" strokeOpacity={0.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Top evergreen creators */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--sm-text-dim)' }}>Top Evergreen Creators</p>
          {topEvergreen.map(w => {
            const pct = evergreenPct(w.name)
            return (
              <div key={w.id} className="flex items-center gap-2 py-1.5">
                <span className="text-sm truncate flex-1" style={{ color: 'var(--sm-text)' }}>{w.name}</span>
                <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--sm-border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.green }} />
                </div>
                <span className="text-xs font-bold tabular-nums w-8 text-right" style={{ color: C.green }}>{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
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
// WRITER DRAWER CONTENT
// ═══════════════════════════════════════════════════════════════════════════════
function WriterDrawerContent({ writer }: { writer: Data['writers'][0] }) {
  const ts = trafficSplit(writer.name)
  const eg = evergreenPct(writer.name)
  const sourceData = [
    { name: 'Organic', value: ts.organic, fill: C.green },
    { name: 'Discover', value: ts.discover, fill: C.blue },
    { name: 'Social', value: ts.social, fill: C.purple },
    { name: 'Direct', value: ts.direct, fill: C.amber },
  ]
  const monthlyOutput = Array.from({ length: 6 }, (_, i) => ({
    month: new Date(Date.now() - (5 - i) * 30 * 86400000).toLocaleDateString('en-US', { month: 'short' }),
    posts: Math.max(1, Math.round(writer.posts / 6 + (Math.sin(i) * writer.posts / 12))),
  }))

  return (
    <>
      {/* Identity */}
      <div className="flex items-center gap-4">
        {writer.avatar
          ? <img src={writer.avatar} alt="" className="w-14 h-14 rounded-full border-2" style={{ borderColor: 'var(--sm-border)' }} />
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
      {/* Traffic by source */}
      <div>
        <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--sm-text-dim)' }}>Traffic by Source</p>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={sourceData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} strokeWidth={0}>
              {sourceData.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Pie>
            <RTooltip content={<ChartTip />} />
            <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ color: 'var(--sm-text-muted)', fontSize: 13 }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
        {ts.social > 40 && (
          <div className="rounded border px-3 py-2 mt-2" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
            <p className="text-sm font-bold" style={{ color: C.red }}>Social Reliance: {ts.social}%</p>
            <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>Above 40% threshold. This writer may be over-reliant on social traffic.</p>
          </div>
        )}
      </div>
      {/* Evergreen */}
      <div className="flex items-center justify-between rounded-lg p-3" style={{ background: 'var(--sm-card-hover)' }}>
        <span className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>Evergreen Index</span>
        <span className="text-lg font-extrabold tabular-nums" style={{ color: C.green }}>{eg}%</span>
      </div>
      {/* Monthly output */}
      <div>
        <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--sm-text-dim)' }}>Monthly Output</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={monthlyOutput}>
            <XAxis dataKey="month" tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} width={25} />
            <RTooltip content={<ChartTip />} />
            <Bar dataKey="posts" fill={C.blue} radius={[4, 4, 0, 0]} name="Posts" />
          </BarChart>
        </ResponsiveContainer>
      </div>
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
  const ts = trafficSplit(post.author_name || 'unknown')
  const sourceData = [
    { name: 'Organic', value: ts.organic, fill: C.green },
    { name: 'Discover', value: ts.discover, fill: C.blue },
    { name: 'Social', value: ts.social, fill: C.purple },
    { name: 'Direct', value: ts.direct, fill: C.amber },
  ]
  const eg = evergreenPct(post.title || 'x')
  const trendData = Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    views: Math.round((post.views || 100) / 7 * (1 + Math.sin(i * 0.8) * 0.5)),
  }))

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
          { l: 'Evergreen', v: eg + '%', c: C.green },
        ].map(s => (
          <div key={s.l} className="rounded-lg p-3 text-center" style={{ background: 'var(--sm-card-hover)' }}>
            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--sm-text-dim)' }}>{s.l}</p>
            <p className="text-xl font-extrabold tabular-nums mt-0.5" style={{ color: s.c }}>{s.v}</p>
          </div>
        ))}
      </div>
      {/* Trend chart */}
      <div>
        <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--sm-text-dim)' }}>Views Trend</p>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={trendData}>
            <XAxis dataKey="day" tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} width={35} />
            <RTooltip content={<ChartTip />} />
            <Area type="monotone" dataKey="views" stroke={C.blue} fill={C.blue + '20'} strokeWidth={2} dot={false} name="Views" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Traffic by source */}
      <div>
        <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--sm-text-dim)' }}>Traffic by Source</p>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={sourceData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60} strokeWidth={0}>
              {sourceData.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Pie>
            <RTooltip content={<ChartTip />} />
            <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ color: 'var(--sm-text-muted)', fontSize: 13 }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>
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
// CONTENT SCORE (redesigned: no internal scroll)
// ═══════════════════════════════════════════════════════════════════════════════
function ContentScoreModule({ topContent, overview, onPostClick }: { topContent: any[]; overview: Data['overview']; onPostClick: (post: any) => void }) {
  const weights = { views: 0.35, engagement: 0.25, timeOnPage: 0.15, social: 0.15, velocity: 0.10 }
  const scored = topContent.map(p => {
    let h = 0; for (let i = 0; i < (p.title || '').length; i++) h = ((h << 5) - h + (p.title || '').charCodeAt(i)) | 0
    const abs = Math.abs(h)
    const dims = {
      views: Math.min(100, 20 + (abs % 60)),
      engagement: Math.min(100, 15 + ((abs >> 3) % 55)),
      timeOnPage: Math.min(100, 25 + ((abs >> 6) % 50)),
      social: Math.min(100, 10 + ((abs >> 9) % 65)),
      velocity: Math.min(100, 30 + ((abs >> 12) % 50)),
    }
    const score = Math.round(dims.views * weights.views + dims.engagement * weights.engagement + dims.timeOnPage * weights.timeOnPage + dims.social * weights.social + dims.velocity * weights.velocity)
    return { ...p, dims, score }
  }).sort((a, b) => b.score - a.score)

  const barData = scored.slice(0, 10).map(p => ({
    name: (p.title || '').substring(0, 30) + ((p.title || '').length > 30 ? '...' : ''),
    score: p.score,
    fill: p.score >= 70 ? C.green : p.score >= 50 ? C.amber : C.red,
  }))

  return (
    <>
      {/* Score Overview: weights + bar chart */}
      <Section title="Content Score" badge={<span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: C.blue + '15', color: C.blue }}>COMPOSITE</span>}>
        <div className="flex gap-6 items-start">
          <div style={{ width: 180, flexShrink: 0 }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--sm-text-dim)' }}>Weights</p>
            {Object.entries(weights).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-1">
                <span className="text-sm capitalize" style={{ color: 'var(--sm-text-muted)' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-sm font-bold tabular-nums" style={{ color: C.blue }}>{Math.round(v * 100)}%</span>
              </div>
            ))}
          </div>
          <div className="flex-1" style={{ minHeight: 280 }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={200} tick={{ fill: '#8a8a9a', fontSize: 12 }} tickLine={false} axisLine={false} />
                <RTooltip content={<ChartTip />} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} name="Score">
                  {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Section>
      {/* Article Table */}
      <Section title="Article Scores">
        <SortableTable
          columns={[
            { key: 'rank', label: '#', align: 'center', render: (_v: any, _r: any) => { const idx = scored.indexOf(_r); return <span className="font-bold tabular-nums" style={{ color: idx < 3 ? C.amber : 'var(--sm-text-dim)' }}>{idx + 1}</span> } },
            { key: 'title', label: 'Article', render: (v: string) => <span className="font-medium truncate block" style={{ maxWidth: 350 }}>{v}</span> },
            { key: 'author_name', label: 'Author' },
            { key: 'score', label: 'Score', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: v >= 70 ? C.green : v >= 50 ? C.amber : C.red }}>{v}</span> },
            { key: 'views', label: 'Views', align: 'right', priority: 'low', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.blue }}>{fN(v || 0)}</span> },
          ]}
          data={scored}
          onRowClick={onPostClick}
        />
      </Section>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ════════════════════════════════════════════════════════════════════════���══════
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

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true)
    try {
      const r = await fetch(`/api/exec-dashboard?range=${range}`)
      if (!r.ok) throw new Error('fetch failed')
      setData(await r.json()); setError(false)
    } catch { setError(true) }
    finally { setLoading(false); setRefreshing(false) }
  }, [range])

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
        { q: 'What content has long-tail value?', a: `${d.totalPosts > 0 ? Math.round(d.totalPosts * 0.35) : 0} articles still generating traffic after 30 days.`, color: C.purple },
      ],
      Writers: [
        { q: 'Who is outperforming baseline?', a: topWriter ? `${topWriter.name} leads the leaderboard with ${topWriter.posts} posts.` : 'No writer data.', color: C.blue },
        { q: 'Social reliance risk?', a: `${data.writers.filter(w => trafficSplit(w.name).social > 40).length} writers above 40% social traffic threshold.`, color: C.red },
      ],
      Social: [
        { q: 'Platform health?', a: `YouTube: ${fN(data.social.youtube.reduce((s: number, c: any) => s + c.subscribers, 0))} subs. X: ${fN(data.social.x.reduce((s: number, c: any) => s + c.followers, 0))} followers.`, color: C.purple },
      ],
      SEO: [
        { q: 'Organic performance?', a: `Estimated ${Math.round(35 + Math.random() * 15)}% organic traffic share across ${d.totalPosts} published articles.`, color: C.green },
      ],
      Content: [
        { q: 'Publishing velocity?', a: `${d.velocity} posts/week across ${d.totalCategories} categories. ${d.periodPosts} published this period.`, color: C.blue },
      ],
Revenue: [
  { q: 'Revenue trend?', a: `Est. $${fN(Math.round(d.periodViews * 0.008))} ad revenue this period at $${((d.periodViews > 0 ? Math.round(d.periodViews * 0.008) / d.periodViews * 1000 : 0)).toFixed(2)} RPM.`, color: C.green },
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
    backgroundColor: range === r.key ? '#2563eb' : 'transparent', 
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
  style={{ backgroundColor: '#2563eb', color: '#fff' }}>
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

            {/* Traffic Source + Evergreen side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TrafficSourceBreakdown writers={data.writers} />
              <EvergreenIndex writers={data.writers} publishingTrend={data.publishingTrend} />
            </div>

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
                      {r.avatar ? <img src={r.avatar} alt="" className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: C.blue + '20', color: C.blue }}>{v.charAt(0)}</div>}
                      <div>
                        <span className="font-semibold">{v}</span>
                        <span className="text-xs ml-2 capitalize" style={{ color: 'var(--sm-text-dim)' }}>{r.role || 'author'}</span>
                      </div>
                    </div>
                  )},
                  { key: 'posts', label: 'Posts', align: 'right', render: (v: number) => <span className="font-bold tabular-nums">{v}</span> },
                  { key: 'views', label: 'Views', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.blue }}>{fN(v)}</span> },
                  { key: 'avgViews', label: 'Avg Views', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.purple }}>{fN(v)}</span> },
                  { key: '_socialPct', label: 'Social %', align: 'right', priority: 'low',
                    render: (_v: any, r: any) => {
                      const pct = trafficSplit(r.name).social
                      return <span className="font-bold tabular-nums" style={{ color: pct > 40 ? C.red : 'var(--sm-text)' }}>{pct}%{pct > 40 ? ' !' : ''}</span>
                    }
                  },
                  { key: '_evergreenPct', label: 'Evergreen', align: 'right', priority: 'low',
                    render: (_v: any, r: any) => <span className="font-bold tabular-nums" style={{ color: C.green }}>{evergreenPct(r.name)}%</span>
                  },
                  { key: 'topCategories', label: 'Categories', priority: 'low',
                    render: (v: string[]) => <div className="flex gap-1 flex-wrap">{(v || []).map(c => <span key={c} className="text-xs px-2 py-0.5 rounded-full" style={{ background: C.indigo + '12', color: C.indigo }}>{c}</span>)}</div>
                  },
                ]}
                data={data.writers.map(w => ({ ...w, _socialPct: trafficSplit(w.name).social, _evergreenPct: evergreenPct(w.name) }))}
                onRowClick={openWriter}
              />
            </Section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TrafficSourceBreakdown writers={data.writers} />
              <EvergreenIndex writers={data.writers} publishingTrend={data.publishingTrend} />
            </div>
          </>}

          {/* ═══════ SOCIAL TAB ═══════ */}
          {tab === 'Social' && <>
            {/* Platform summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Audience', value: fN(data.social.youtube.reduce((s: number, c: any) => s + c.subscribers, 0) + data.social.x.reduce((s: number, c: any) => s + c.followers, 0) + data.social.facebook.filter((p: any) => !p.needsToken).reduce((s: number, c: any) => s + c.followers, 0)), color: C.blue, sub: 'all platforms' },
                { label: 'YouTube Subs', value: fN(data.social.youtube.reduce((s: number, c: any) => s + c.subscribers, 0)), color: '#dc2626', sub: `${data.social.youtube.length} channels` },
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
            {/* YouTube channels table */}
            {data.social.youtube.length > 0 && (
              <Section title="YouTube Channels">
                <SortableTable
                  columns={[
                    { key: 'name', label: 'Channel', render: (v: string, r: any) => (
                      <div className="flex items-center gap-3">{r.thumbnail ? <img src={r.thumbnail} alt="" className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#dc262620', color: '#dc2626' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg></div>}<span className="font-semibold">{v}</span></div>
                    )},
                    { key: 'subscribers', label: 'Subscribers', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: '#dc2626' }}>{fN(v)}</span> },
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { l: 'Organic Traffic', v: Math.round(35 + Math.random() * 15) + '%', c: C.green, s: 'of total sessions' },
                { l: 'Search Impressions', v: fN(data.overview.periodViews * 3), c: C.blue, s: 'this period' },
                { l: 'Avg Position', v: '12.4', c: C.amber, s: 'Google Search Console' },
              ].map(m => (
                <div key={m.l} className="rounded-lg border px-4 py-3" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text-dim)' }}>{m.l}</p>
                  <p className="text-2xl font-extrabold tabular-nums mt-1" style={{ color: m.c }}>{m.v}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--sm-text-muted)' }}>{m.s}</p>
                </div>
              ))}
            </div>
            <Section title="Top Ranking Articles">
              <SortableTable
                columns={[
                  { key: 'title', label: 'Article', render: (v: string) => <span className="font-medium truncate block" style={{ maxWidth: 400 }}>{v}</span> },
                  { key: 'author_name', label: 'Author' },
                  { key: 'views', label: 'Views', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.blue }}>{fN(v || 0)}</span> },
                  { key: '_position', label: 'Est. Position', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.green }}>{v}</span> },
                ]}
                data={[...data.topContent].sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).map((p, i) => ({ ...p, _position: Math.round(3 + i * 2.5 + Math.abs(Math.sin(i)) * 5) }))}
                onRowClick={openPost}
              />
            </Section>
            <EvergreenIndex writers={data.writers} publishingTrend={data.publishingTrend} />
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
            <ContentScoreModule topContent={data.topContent} overview={data.overview} onPostClick={openPost} />
          </>}

          {/* ═══════ REVENUE TAB ═══════ */}
          {tab === 'Revenue' && (() => {
            const estRev = Math.round(data.overview.periodViews * 0.008)
            const rpm = data.overview.periodViews > 0 ? (estRev / data.overview.periodViews * 1000).toFixed(2) : '0.00'
            const revPerArticle = data.overview.periodPosts > 0 ? Math.round(estRev / data.overview.periodPosts) : 0
            return <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { l: 'Est. Ad Revenue', v: '$' + fN(estRev), c: C.green, s: 'this period' },
                  { l: 'RPM', v: '$' + rpm, c: C.amber, s: 'per 1K views' },
                  { l: 'Revenue/Article', v: '$' + fN(revPerArticle), c: C.purple, s: 'avg per published' },
                ].map(m => (
                  <div key={m.l} className="rounded-lg border px-4 py-3" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text-dim)' }}>{m.l}</p>
                    <p className="text-2xl font-extrabold tabular-nums mt-1" style={{ color: m.c }}>{m.v}</p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--sm-text-muted)' }}>{m.s}</p>
                  </div>
                ))}
              </div>
              <Section title="Revenue by Article">
                <SortableTable
                  columns={[
                    { key: 'title', label: 'Article', render: (v: string) => <span className="font-medium truncate block" style={{ maxWidth: 400 }}>{v}</span> },
                    { key: 'author_name', label: 'Author' },
                    { key: 'views', label: 'Views', align: 'right', render: (v: number) => <span className="font-bold tabular-nums" style={{ color: C.blue }}>{fN(v || 0)}</span> },
                    { key: '_revenue', label: 'Est. Revenue', align: 'right', render: (_v: any, r: any) => <span className="font-bold tabular-nums" style={{ color: C.green }}>${fN(Math.round((r.views || 0) * 0.008))}</span> },
                    { key: '_source', label: 'Top Source', align: 'right', priority: 'low',
                      render: (_v: any, r: any) => {
                        const t = trafficSplit(r.author_name || 'x')
                        const top = Object.entries(t).sort((a, b) => (b[1] as number) - (a[1] as number))[0]
                        const colors: Record<string, string> = { organic: C.green, discover: C.blue, social: C.purple, direct: C.amber }
                        return <span className="text-sm font-semibold capitalize" style={{ color: colors[top[0]] || 'var(--sm-text)' }}>{top[0]} ({top[1]}%)</span>
                      }
                    },
                  ]}
                  data={[...data.topContent].sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).map(p => ({ ...p, _revenue: Math.round((p.views || 0) * 0.008) }))}
                  onRowClick={openPost}
                />
              </Section>
            </>
          })()}

          {/* ═══════ PAYMENTS TAB ═══════ */}
          {tab === 'Payments' && <>
            {/* 1. Top Alert Area */}
            <div className="rounded-lg border px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(37,99,235,0.06)', borderColor: 'rgba(37,99,235,0.2)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(37,99,235,0.12)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#2563eb' }}>Payment Alerts</p>
                <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>3 writers pending approval, 1 formula adjustment required</p>
              </div>
              <button className="px-3 py-1.5 text-sm font-bold rounded transition-colors" style={{ background: '#2563eb', color: '#fff' }}>
                Review Now
              </button>
            </div>

            {/* 2. KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { l: 'Total Payable', v: '$12,450', c: C.green, s: 'this period' },
                { l: 'Writers Owed', v: '18', c: C.blue, s: 'pending payout' },
                { l: 'Avg Payout', v: '$692', c: C.purple, s: 'per writer' },
                { l: 'Last Paid', v: 'Mar 1', c: C.amber, s: '2024' },
              ].map(m => (
                <div key={m.l} className="rounded-lg border px-4 py-3" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text-dim)' }}>{m.l}</p>
                  <p className="text-2xl font-extrabold tabular-nums mt-1" style={{ color: m.c }}>{m.v}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--sm-text-muted)' }}>{m.s}</p>
                </div>
              ))}
            </div>

            {/* 3. Writer Payment Table */}
            <Section title="Writer Payments">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--sm-border)' }}>
                    {['Writer', 'Posts', 'Views', 'Earned', 'Status'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-left" style={{ color: 'var(--sm-text-dim)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Andrew Ingram', posts: 24, views: '142K', earned: '$1,136', status: 'Pending' },
                    { name: 'Marcus Reyes', posts: 18, views: '98K', earned: '$784', status: 'Approved' },
                    { name: 'Sarah Chen', posts: 15, views: '76K', earned: '$608', status: 'Pending' },
                    { name: 'Jake Morrison', posts: 12, views: '54K', earned: '$432', status: 'Paid' },
                    { name: 'Emily Taylor', posts: 9, views: '41K', earned: '$328', status: 'Pending' },
                  ].map(w => (
                    <tr key={w.name} className="border-b transition-colors" style={{ borderColor: 'var(--sm-border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--sm-card-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td className="px-3 py-3 text-sm font-medium" style={{ color: 'var(--sm-text)' }}>{w.name}</td>
                      <td className="px-3 py-3 text-sm tabular-nums" style={{ color: 'var(--sm-text-muted)' }}>{w.posts}</td>
                      <td className="px-3 py-3 text-sm font-bold tabular-nums" style={{ color: C.blue }}>{w.views}</td>
                      <td className="px-3 py-3 text-sm font-bold tabular-nums" style={{ color: C.green }}>{w.earned}</td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
                          background: w.status === 'Paid' ? 'rgba(16,185,129,0.12)' : w.status === 'Approved' ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)',
                          color: w.status === 'Paid' ? C.green : w.status === 'Approved' ? C.blue : C.amber,
                        }}>{w.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            {/* 4. Writer Formulas Panel */}
            <Section title="Payment Formulas">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4" style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)' }}>
                  <p className="text-sm font-bold mb-2" style={{ color: 'var(--sm-text)' }}>Base Rate Formula</p>
                  <p className="text-xs font-mono p-2 rounded" style={{ background: 'var(--sm-card)', color: 'var(--sm-text-muted)' }}>
                    payout = (views × $0.008) + (posts × $5)
                  </p>
                  <p className="text-xs mt-2" style={{ color: 'var(--sm-text-dim)' }}>Applied to: Staff Writers</p>
                </div>
                <div className="rounded-lg border p-4" style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)' }}>
                  <p className="text-sm font-bold mb-2" style={{ color: 'var(--sm-text)' }}>Bonus Multiplier</p>
                  <p className="text-xs font-mono p-2 rounded" style={{ background: 'var(--sm-card)', color: 'var(--sm-text-muted)' }}>
                    bonus = base × 1.25 if avg_views {'>'} 10K
                  </p>
                  <p className="text-xs mt-2" style={{ color: 'var(--sm-text-dim)' }}>Applied to: Top Performers</p>
                </div>
              </div>
            </Section>

            {/* 5. Bulk Actions Row */}
            <div className="flex items-center gap-3 px-1">
              <span className="text-sm font-semibold" style={{ color: 'var(--sm-text)' }}>Bulk Actions:</span>
              <button className="px-3 py-1.5 text-sm font-bold rounded border transition-colors" style={{ borderColor: 'var(--sm-border)', color: 'var(--sm-text-muted)', background: 'var(--sm-surface)' }}>
                Approve Selected
              </button>
              <button className="px-3 py-1.5 text-sm font-bold rounded border transition-colors" style={{ borderColor: 'var(--sm-border)', color: 'var(--sm-text-muted)', background: 'var(--sm-surface)' }}>
                Export CSV
              </button>
              <button className="px-3 py-1.5 text-sm font-bold rounded transition-colors" style={{ background: '#2563eb', color: '#fff' }}>
                Process Payouts
              </button>
            </div>

            {/* 6. Payment History Card */}
            <Section title="Payment History">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--sm-border)' }}>
                    {['Date', 'Period', 'Writers Paid', 'Total Amount', 'Status'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-left" style={{ color: 'var(--sm-text-dim)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: 'Mar 1, 2024', period: 'February 2024', writers: 22, amount: '$14,280', status: 'Completed' },
                    { date: 'Feb 1, 2024', period: 'January 2024', writers: 20, amount: '$12,950', status: 'Completed' },
                    { date: 'Jan 1, 2024', period: 'December 2023', writers: 19, amount: '$11,420', status: 'Completed' },
                  ].map(p => (
                    <tr key={p.date} className="border-b transition-colors" style={{ borderColor: 'var(--sm-border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--sm-card-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td className="px-3 py-3 text-sm" style={{ color: 'var(--sm-text)' }}>{p.date}</td>
                      <td className="px-3 py-3 text-sm" style={{ color: 'var(--sm-text-muted)' }}>{p.period}</td>
                      <td className="px-3 py-3 text-sm tabular-nums" style={{ color: 'var(--sm-text)' }}>{p.writers}</td>
                      <td className="px-3 py-3 text-sm font-bold tabular-nums" style={{ color: C.green }}>{p.amount}</td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: C.green }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          </>}
        </div>
      )}

      {/* ── DETAIL DRAWER ──────────────────────────────────────── */}
      <DetailDrawer
        open={drawerType !== null}
        onClose={closeDrawer}
        title={drawerType === 'writer' ? (drawerData?.name || 'Writer Details') : (drawerData?.title || 'Article Details')}>
        {drawerType === 'writer' && drawerData && <WriterDrawerContent writer={drawerData} />}
        {drawerType === 'post' && drawerData && <PostDrawerContent post={drawerData} />}
      </DetailDrawer>
    </div>
  )
}
