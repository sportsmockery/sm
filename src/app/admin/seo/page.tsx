'use client'

import { useState, useEffect } from 'react'

interface SEOOverview {
  rank: number
  organicKeywords: number
  organicTraffic: number
  organicCost: number
  adwordsKeywords: number
  adwordsTraffic: number
  adwordsCost: number
}

interface Keyword {
  keyword: string
  position: number
  previousPosition: number
  positionDiff: number
  searchVolume: number
  cpc: number
  url: string
  trafficPct: number
  competition: number
}

interface Competitor {
  domain: string
  relevance: number
  commonKeywords: number
  organicKeywords: number
  organicTraffic: number
  organicCost: number
}

interface AuditData {
  overview: SEOOverview | null
  keywords: Keyword[]
  competitors: Competitor[]
  rankHistory: { date: string; rank: number; organicKeywords: number; organicTraffic: number }[]
  positionChanges: { improved: number; declined: number; unchanged: number }
  fetchedAt: string
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function PositionBadge({ current, previous }: { current: number; previous: number }) {
  const diff = previous - current
  if (diff > 0) {
    return <span className="inline-flex items-center gap-0.5 text-xs text-green-400">▲{diff}</span>
  }
  if (diff < 0) {
    return <span className="inline-flex items-center gap-0.5 text-xs text-red-400">▼{Math.abs(diff)}</span>
  }
  return <span className="text-xs text-[var(--text-muted)]">—</span>
}

export default function SEODashboardPage() {
  const [data, setData] = useState<AuditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/seo/audit')
        if (!res.ok) throw new Error('Failed to fetch SEO data')
        const json = await res.json()
        setData(json)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">SEO Dashboard</h1>
          <p className="mt-1 text-base text-[var(--text-muted)]">Loading SEMrush data...</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse rounded-lg bg-[var(--card-bg)] p-6">
              <div className="h-4 w-20 rounded bg-[var(--text-muted)]/20" />
              <div className="mt-3 h-8 w-28 rounded bg-[var(--text-muted)]/20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">SEO Dashboard</h1>
          <p className="mt-2 text-red-400">{error || 'Failed to load data'}</p>
        </div>
      </div>
    )
  }

  const ov = data.overview

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">SEO Dashboard</h1>
          <p className="mt-1 text-base text-[var(--text-muted)]">
            Organic search performance powered by SEMrush
          </p>
        </div>
        {data.fetchedAt && (
          <span className="text-xs text-[var(--text-muted)]">
            Updated: {new Date(data.fetchedAt).toLocaleString()}
          </span>
        )}
      </div>

      {/* Domain Overview Cards */}
      {ov && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-[var(--card-bg)] p-6">
            <p className="text-sm text-[var(--text-muted)]">SEMrush Rank</p>
            <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">#{formatNumber(ov.rank)}</p>
          </div>
          <div className="rounded-lg bg-[var(--card-bg)] p-6">
            <p className="text-sm text-[var(--text-muted)]">Organic Keywords</p>
            <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{formatNumber(ov.organicKeywords)}</p>
          </div>
          <div className="rounded-lg bg-[var(--card-bg)] p-6">
            <p className="text-sm text-[var(--text-muted)]">Organic Traffic</p>
            <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{formatNumber(ov.organicTraffic)}</p>
          </div>
          <div className="rounded-lg bg-[var(--card-bg)] p-6">
            <p className="text-sm text-[var(--text-muted)]">Traffic Cost</p>
            <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">${formatNumber(ov.organicCost)}</p>
          </div>
        </div>
      )}

      {/* Position Changes Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-[var(--card-bg)] p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{data.positionChanges.improved}</p>
          <p className="text-sm text-[var(--text-muted)]">Improved</p>
        </div>
        <div className="rounded-lg bg-[var(--card-bg)] p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{data.positionChanges.declined}</p>
          <p className="text-sm text-[var(--text-muted)]">Declined</p>
        </div>
        <div className="rounded-lg bg-[var(--card-bg)] p-4 text-center">
          <p className="text-2xl font-bold text-[var(--text-muted)]">{data.positionChanges.unchanged}</p>
          <p className="text-sm text-[var(--text-muted)]">Unchanged</p>
        </div>
      </div>

      {/* Top Organic Keywords Table */}
      <div className="rounded-lg bg-[var(--card-bg)] p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Top 20 Organic Keywords</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-[var(--text-muted)]">
                <th className="pb-3 pr-4">Keyword</th>
                <th className="pb-3 pr-4 text-center">Position</th>
                <th className="pb-3 pr-4 text-center">Change</th>
                <th className="pb-3 pr-4 text-right">Volume</th>
                <th className="pb-3 pr-4 text-right">Traffic %</th>
                <th className="pb-3 text-right">CPC</th>
              </tr>
            </thead>
            <tbody>
              {data.keywords.map((kw, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-2.5 pr-4 text-[var(--text-primary)]">
                    <div className="max-w-[300px] truncate">{kw.keyword}</div>
                    {kw.url && (
                      <div className="max-w-[300px] truncate text-xs text-[var(--text-muted)]">{kw.url}</div>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-center font-mono text-[var(--text-primary)]">{kw.position}</td>
                  <td className="py-2.5 pr-4 text-center">
                    <PositionBadge current={kw.position} previous={kw.previousPosition} />
                  </td>
                  <td className="py-2.5 pr-4 text-right text-[var(--text-primary)]">{formatNumber(kw.searchVolume)}</td>
                  <td className="py-2.5 pr-4 text-right text-[var(--text-primary)]">{kw.trafficPct.toFixed(2)}%</td>
                  <td className="py-2.5 text-right text-[var(--text-primary)]">${kw.cpc.toFixed(2)}</td>
                </tr>
              ))}
              {data.keywords.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                    No keyword data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Competitor Comparison */}
      <div className="rounded-lg bg-[var(--card-bg)] p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Competitor Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-[var(--text-muted)]">
                <th className="pb-3 pr-4">Domain</th>
                <th className="pb-3 pr-4 text-right">Common Keywords</th>
                <th className="pb-3 pr-4 text-right">Organic Keywords</th>
                <th className="pb-3 pr-4 text-right">Organic Traffic</th>
                <th className="pb-3 text-right">Relevance</th>
              </tr>
            </thead>
            <tbody>
              {data.competitors.map((comp, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-2.5 pr-4 text-[var(--text-primary)]">{comp.domain}</td>
                  <td className="py-2.5 pr-4 text-right text-[var(--text-primary)]">{formatNumber(comp.commonKeywords)}</td>
                  <td className="py-2.5 pr-4 text-right text-[var(--text-primary)]">{formatNumber(comp.organicKeywords)}</td>
                  <td className="py-2.5 pr-4 text-right text-[var(--text-primary)]">{formatNumber(comp.organicTraffic)}</td>
                  <td className="py-2.5 text-right text-[var(--text-primary)]">{(comp.relevance * 100).toFixed(1)}%</td>
                </tr>
              ))}
              {data.competitors.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--text-muted)]">
                    No competitor data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rank History */}
      {data.rankHistory.length > 0 && (
        <div className="rounded-lg bg-[var(--card-bg)] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Rank History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-[var(--text-muted)]">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4 text-right">Rank</th>
                  <th className="pb-3 pr-4 text-right">Organic Keywords</th>
                  <th className="pb-3 text-right">Organic Traffic</th>
                </tr>
              </thead>
              <tbody>
                {data.rankHistory.map((row, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-2.5 pr-4 text-[var(--text-primary)]">{row.date}</td>
                    <td className="py-2.5 pr-4 text-right font-mono text-[var(--text-primary)]">#{formatNumber(row.rank)}</td>
                    <td className="py-2.5 pr-4 text-right text-[var(--text-primary)]">{formatNumber(row.organicKeywords)}</td>
                    <td className="py-2.5 text-right text-[var(--text-primary)]">{formatNumber(row.organicTraffic)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
