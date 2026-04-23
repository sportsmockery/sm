import { NextResponse } from 'next/server'

const FREESTAR_BASE = 'https://api.pub.network'
const FREESTAR_ACCOUNT_ID = '1028'
const FREESTAR_SITE_ID = '1764'

const ALL_METRICS = 'net_revenue,impressions,net_cpm,viewability,fill_rate,page_rpm'

type MetricsResponse = {
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
  source: 'freestar' | 'no-token' | 'error'
}

const NULL_METRICS: MetricsResponse = {
  revenue: null, impressions: null, netCpm: null,
  viewability: null, fillRate: null, pageRpm: null,
  prevRevenue: null, prevImpressions: null, prevNetCpm: null,
  prevViewability: null, prevFillRate: null, prevPageRpm: null,
  source: 'no-token',
}

/** Compute a PoP previous period: same number of days ending at the day before start.
 *  Mirrors Freestar's "This Month" logic: Apr 1–22 → Mar 1–22 */
function computePreviousPeriod(startStr: string, endStr: string) {
  const start = new Date(startStr + 'T00:00:00Z')
  const end = new Date(endStr + 'T00:00:00Z')
  const days = Math.round((end.getTime() - start.getTime()) / 86400000)
  // Go back to the same day-of-month in the previous month
  const prevStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 1, start.getUTCDate()))
  const prevEnd = new Date(Date.UTC(prevStart.getUTCFullYear(), prevStart.getUTCMonth(), prevStart.getUTCDate() + days))
  return {
    prevStartStr: prevStart.toISOString().slice(0, 10),
    prevEndStr: prevEnd.toISOString().slice(0, 10),
  }
}

/** Extract aggregated metrics from various Freestar API response shapes */
function extractMetrics(data: any): Omit<MetricsResponse, 'prevRevenue' | 'prevImpressions' | 'prevNetCpm' | 'prevViewability' | 'prevFillRate' | 'prevPageRpm' | 'source'> {
  // If data has a .data array, aggregate it
  if (Array.isArray(data?.data) && data.data.length > 0) {
    const rows = data.data
    const revenue = rows.reduce((s: number, d: any) => s + (d.net_revenue ?? d.revenue ?? 0), 0)
    const impressions = rows.reduce((s: number, d: any) => s + (d.impressions ?? 0), 0)
    const viewabilityWeighted = rows.reduce((s: number, d: any) => s + (d.viewability ?? 0) * (d.impressions ?? 1), 0)
    const fillRateWeighted = rows.reduce((s: number, d: any) => s + (d.fill_rate ?? 0) * (d.impressions ?? 1), 0)
    const totalImpressions = impressions || 1
    return {
      revenue: revenue || null,
      impressions: impressions || null,
      netCpm: impressions > 0 ? (revenue / impressions) * 1000 : null,
      viewability: viewabilityWeighted / totalImpressions || null,
      fillRate: fillRateWeighted / totalImpressions || null,
      pageRpm: data.data.reduce((s: number, d: any) => s + (d.page_rpm ?? 0), 0) / data.data.length || null,
    }
  }

  // If data has a .total or flat structure
  const src = data?.total ?? data ?? {}
  return {
    revenue: src.net_revenue ?? src.revenue ?? null,
    impressions: src.impressions ?? null,
    netCpm: src.net_cpm ?? null,
    viewability: src.viewability ?? null,
    fillRate: src.fill_rate ?? null,
    pageRpm: src.page_rpm ?? null,
  }
}

/** Try multiple Freestar API endpoint patterns to find one that returns metrics */
async function fetchFreestarMetrics(token: string, start: string, end: string) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  const endpoints = [
    `${FREESTAR_BASE}/v1/accounts/${FREESTAR_ACCOUNT_ID}/sites/${FREESTAR_SITE_ID}/analytics?start_date=${start}&end_date=${end}&metrics=${ALL_METRICS}`,
    `${FREESTAR_BASE}/v1/accounts/${FREESTAR_ACCOUNT_ID}/sites/${FREESTAR_SITE_ID}/reports/overview?start_date=${start}&end_date=${end}`,
    `${FREESTAR_BASE}/v1/accounts/${FREESTAR_ACCOUNT_ID}/sites/${FREESTAR_SITE_ID}/reports/revenue?start_date=${start}&end_date=${end}`,
    `${FREESTAR_BASE}/v1/accounts/${FREESTAR_ACCOUNT_ID}/sites/${FREESTAR_SITE_ID}/dashboard?start_date=${start}&end_date=${end}`,
    `${FREESTAR_BASE}/v1/accounts/${FREESTAR_ACCOUNT_ID}/sites/${FREESTAR_SITE_ID}/metrics?start_date=${start}&end_date=${end}`,
    `${FREESTAR_BASE}/v1/accounts/${FREESTAR_ACCOUNT_ID}/sites/${FREESTAR_SITE_ID}/summary?start_date=${start}&end_date=${end}`,
  ]

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { headers, next: { revalidate: 1800 } })
      if (!res.ok) continue
      const data = await res.json()
      const metrics = extractMetrics(data)
      // If we got at least revenue, consider it a success
      if (metrics.revenue !== null) return metrics
    } catch {
      // Try next endpoint
    }
  }
  return null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json({ error: 'start and end date params required' }, { status: 400 })
  }

  try {
    const token = process.env.FREESTAR_API_TOKEN
    if (!token) {
      return NextResponse.json({ ...NULL_METRICS, source: 'no-token' })
    }

    // Fetch current period metrics
    const current = await fetchFreestarMetrics(token, start, end)
    if (!current) {
      return NextResponse.json({ ...NULL_METRICS, source: 'error' })
    }

    // Fetch previous period metrics for PoP comparison
    const { prevStartStr, prevEndStr } = computePreviousPeriod(start, end)
    const prev = await fetchFreestarMetrics(token, prevStartStr, prevEndStr)

    const response: MetricsResponse = {
      ...current,
      prevRevenue: prev?.revenue ?? null,
      prevImpressions: prev?.impressions ?? null,
      prevNetCpm: prev?.netCpm ?? null,
      prevViewability: prev?.viewability ?? null,
      prevFillRate: prev?.fillRate ?? null,
      prevPageRpm: prev?.pageRpm ?? null,
      source: 'freestar',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Freestar metrics fetch error:', error)
    return NextResponse.json({ ...NULL_METRICS, source: 'error' })
  }
}
