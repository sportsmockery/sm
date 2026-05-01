/**
 * Google Analytics 4 — Data API (server-side helpers).
 *
 * Reuses the OAuth refresh token stored by the Search Console connect flow
 * (see google-search-console.ts). The shared scope on that token includes
 * `analytics.readonly`, so one Connect button covers both APIs.
 */
import { getValidAccessToken } from './google-search-console'

const GA_DATA_API = 'https://analyticsdata.googleapis.com/v1beta'

export function getGa4PropertyId(): string | null {
  return process.env.GA4_PROPERTY_ID || null
}

type GaDateRange = { startDate: string; endDate: string }
type GaMetric = { name: string }
type GaDimension = { name: string }

export type GaReportRow = {
  dimensionValues: Array<{ value: string }>
  metricValues: Array<{ value: string }>
}

export type GaReportResult = {
  rows: GaReportRow[]
  rowCount: number
  metricHeaders: Array<{ name: string; type: string }>
  dimensionHeaders: Array<{ name: string }>
}

/** Run a GA4 runReport call. Returns null if GA isn't authorized (403/401). */
export async function runGaReport(opts: {
  propertyId?: string
  dateRanges: GaDateRange[]
  metrics: GaMetric[]
  dimensions?: GaDimension[]
  limit?: number
}): Promise<GaReportResult | { error: string }> {
  const propertyId = opts.propertyId || getGa4PropertyId()
  if (!propertyId) return { error: 'GA4_PROPERTY_ID not set' }

  let accessToken: string
  try {
    const token = await getValidAccessToken()
    accessToken = token.accessToken
  } catch (e: any) {
    return { error: e?.message || 'Failed to acquire access token' }
  }

  const url = `${GA_DATA_API}/properties/${propertyId}:runReport`
  const body = {
    dateRanges: opts.dateRanges,
    metrics: opts.metrics,
    dimensions: opts.dimensions ?? [],
    limit: opts.limit ?? 100,
    keepEmptyRows: false,
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    // 403 typically means the OAuth token doesn't include analytics.readonly
    // scope yet — user needs to re-click Connect after the scope widening.
    return { error: `GA4 runReport ${res.status}: ${text.slice(0, 300)}` }
  }

  const json = await res.json()
  return {
    rows: (json.rows || []) as GaReportRow[],
    rowCount: json.rowCount || 0,
    metricHeaders: json.metricHeaders || [],
    dimensionHeaders: json.dimensionHeaders || [],
  }
}

export type GaTotals = {
  pageViews: number
  sessions: number
  activeUsers: number
  engagedSessions: number
  averageSessionDuration: number
  bounceRate: number
}

/** Sum aggregate totals (no dimensions = single row). */
export function aggregateGaTotals(result: GaReportResult): GaTotals {
  const row = result.rows[0]
  if (!row) {
    return { pageViews: 0, sessions: 0, activeUsers: 0, engagedSessions: 0, averageSessionDuration: 0, bounceRate: 0 }
  }
  const headers = result.metricHeaders.map(h => h.name)
  const get = (name: string) => {
    const idx = headers.indexOf(name)
    if (idx < 0) return 0
    return parseFloat(row.metricValues[idx]?.value || '0')
  }
  return {
    pageViews: get('screenPageViews'),
    sessions: get('sessions'),
    activeUsers: get('activeUsers'),
    engagedSessions: get('engagedSessions'),
    averageSessionDuration: get('averageSessionDuration'),
    bounceRate: get('bounceRate'),
  }
}

/** Group rows by their first dimension value (e.g. channel, country). */
export function rowsByDimension(result: GaReportResult): Array<{
  key: string
  pageViews: number
  sessions: number
  activeUsers: number
}> {
  const headers = result.metricHeaders.map(h => h.name)
  return result.rows.map(r => {
    const get = (name: string) => {
      const idx = headers.indexOf(name)
      if (idx < 0) return 0
      return parseFloat(r.metricValues[idx]?.value || '0')
    }
    return {
      key: r.dimensionValues[0]?.value || '',
      pageViews: get('screenPageViews'),
      sessions: get('sessions'),
      activeUsers: get('activeUsers'),
    }
  })
}
