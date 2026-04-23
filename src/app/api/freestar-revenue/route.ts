import { NextResponse } from 'next/server'

const CUBEJS_BASE = 'https://analytics.pub.network/cubejs-api/v1'
const SITE_DOMAIN = 'sportsmockery.com'

/** Primary cube with all dashboard metrics */
const PRIMARY_CUBE = 'NdrWebCombinedWithPageviews'

/** Fallback cubes if primary is missing measures */
const FALLBACK_REVENUE_CUBE = 'NdrWebCombinedWithNetworks'
const FALLBACK_PAGEVIEWS_CUBE = 'NdrPagehits'
const VIEWABILITY_CUBE = 'NdrViewability'

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
  error?: string
  debug?: { cubesQueried: string[]; meta_checked: boolean }
}

const NULL_METRICS: MetricsResponse = {
  revenue: null, impressions: null, netCpm: null,
  viewability: null, fillRate: null, pageRpm: null,
  prevRevenue: null, prevImpressions: null, prevNetCpm: null,
  prevViewability: null, prevFillRate: null, prevPageRpm: null,
  source: 'no-token',
}

type CubeMetaInfo = {
  cubes: Array<{
    name: string
    measures: Array<{ name: string }>
    dimensions: Array<{ name: string }>
  }>
}

type PeriodMetrics = {
  revenue: number | null
  impressions: number | null
  netCpm: number | null
  viewability: number | null
  fillRate: number | null
  pageRpm: number | null
}

/** Compute previous period: same day-of-month in prior month (mirrors Freestar "This Month" logic) */
function computePreviousPeriod(startStr: string, endStr: string) {
  const start = new Date(startStr + 'T00:00:00Z')
  const end = new Date(endStr + 'T00:00:00Z')
  const days = Math.round((end.getTime() - start.getTime()) / 86400000)
  const prevStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 1, start.getUTCDate()))
  const prevEnd = new Date(Date.UTC(prevStart.getUTCFullYear(), prevStart.getUTCMonth(), prevStart.getUTCDate() + days))
  return {
    prevStartStr: prevStart.toISOString().slice(0, 10),
    prevEndStr: prevEnd.toISOString().slice(0, 10),
  }
}

/** POST a Cube.js query with "Continue wait" polling (up to 15 retries, 2s apart) */
async function cubeLoad(token: string, query: Record<string, unknown>): Promise<{ data: Record<string, number | string>[] }> {
  const url = `${CUBEJS_BASE}/load`
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  const body = JSON.stringify({ query })

  for (let attempt = 0; attempt < 15; attempt++) {
    const res = await fetch(url, { method: 'POST', headers, body })

    if (res.status === 401 || res.status === 403) {
      throw new Error('Invalid or expired token. Tokens expire every 30 days — regenerate at publisher.freestar.io')
    }

    if (res.status === 200) {
      const json = await res.json()
      // Cube.js returns { error: "Continue wait" } when the query is still processing
      if (json.error === 'Continue wait') {
        await new Promise(r => setTimeout(r, 2000))
        continue
      }
      return json
    }

    // Non-200, non-auth error
    const text = await res.text().catch(() => '')
    throw new Error(`Cube.js responded ${res.status}: ${text.slice(0, 200)}`)
  }

  throw new Error('Cube.js query timed out after 30s of polling')
}

/** Fetch meta endpoint to discover available cubes and measures */
async function fetchMeta(token: string): Promise<CubeMetaInfo> {
  const res = await fetch(`${CUBEJS_BASE}/meta`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Meta endpoint returned ${res.status}: ${text.slice(0, 200)}`)
  }
  return res.json()
}

/** Check if a cube exists and which measures it has */
function findCubeMeasures(meta: CubeMetaInfo, cubeName: string): Set<string> {
  const cube = meta.cubes.find(c => c.name === cubeName)
  if (!cube) return new Set()
  return new Set(cube.measures.map(m => m.name))
}

/** Build a Cube.js query for core revenue metrics */
function buildRevenueQuery(cube: string, measures: string[], dateRange: [string, string]) {
  return {
    measures,
    timeDimensions: [{
      dimension: `${cube}.record_date`,
      dateRange,
    }],
    filters: [{
      member: `${cube}.site_domain`,
      operator: 'equals',
      values: [SITE_DOMAIN],
    }],
    timezone: 'UTC',
  }
}

/** Build a Cube.js query for viewability */
function buildViewabilityQuery(cube: string, measures: string[], dateRange: [string, string]) {
  return {
    measures,
    timeDimensions: [{
      dimension: `${cube}.record_date`,
      dateRange,
    }],
    filters: [{
      member: `${cube}.site_domain`,
      operator: 'equals',
      values: [SITE_DOMAIN],
    }],
    timezone: 'UTC',
  }
}

/** Fetch all metrics for a single period, with cube fallback logic */
async function fetchPeriodMetrics(
  token: string,
  dateRange: [string, string],
  meta: CubeMetaInfo,
  cubesQueried: string[],
): Promise<PeriodMetrics> {
  const result: PeriodMetrics = {
    revenue: null, impressions: null, netCpm: null,
    viewability: null, fillRate: null, pageRpm: null,
  }

  // --- Revenue, Impressions, CPM, Pageviews, Page RPM ---
  const primaryMeasures = findCubeMeasures(meta, PRIMARY_CUBE)
  const hasPrimary = primaryMeasures.size > 0

  if (hasPrimary) {
    // Use primary cube — build measures list from what's actually available
    const wanted = ['net_revenue', 'impressions', 'net_cpm', 'page_views', 'page_rpm']
    const measures = wanted
      .map(m => `${PRIMARY_CUBE}.${m}`)
      .filter(m => primaryMeasures.has(m))

    if (measures.length > 0) {
      try {
        const res = await cubeLoad(token, buildRevenueQuery(PRIMARY_CUBE, measures, dateRange))
        cubesQueried.push(PRIMARY_CUBE)
        const row = res.data?.[0] ?? {}
        result.revenue = parseFloat(String(row[`${PRIMARY_CUBE}.net_revenue`])) || null
        result.impressions = parseFloat(String(row[`${PRIMARY_CUBE}.impressions`])) || null
        result.netCpm = parseFloat(String(row[`${PRIMARY_CUBE}.net_cpm`])) || null
        result.pageRpm = parseFloat(String(row[`${PRIMARY_CUBE}.page_rpm`])) || null

        const pageviews = parseFloat(String(row[`${PRIMARY_CUBE}.page_views`]))
        // If netCpm wasn't a direct measure, derive it
        if (result.netCpm === null && result.revenue !== null && result.impressions !== null && result.impressions > 0) {
          result.netCpm = (result.revenue / result.impressions) * 1000
        }
        // If page_rpm wasn't available, derive from revenue / pageviews
        if (result.pageRpm === null && result.revenue !== null && pageviews > 0) {
          result.pageRpm = (result.revenue / pageviews) * 1000
        }
      } catch (e) {
        console.error(`[freestar] Primary cube query failed:`, e)
      }
    }
  }

  // Fallback: if primary didn't yield revenue, try fallback cubes
  if (result.revenue === null) {
    const fallbackMeasures = findCubeMeasures(meta, FALLBACK_REVENUE_CUBE)
    if (fallbackMeasures.size > 0) {
      const wanted = ['net_revenue', 'impressions', 'net_cpm']
      const measures = wanted
        .map(m => `${FALLBACK_REVENUE_CUBE}.${m}`)
        .filter(m => fallbackMeasures.has(m))

      if (measures.length > 0) {
        try {
          const res = await cubeLoad(token, buildRevenueQuery(FALLBACK_REVENUE_CUBE, measures, dateRange))
          cubesQueried.push(FALLBACK_REVENUE_CUBE)
          const row = res.data?.[0] ?? {}
          result.revenue = parseFloat(String(row[`${FALLBACK_REVENUE_CUBE}.net_revenue`])) || null
          result.impressions = parseFloat(String(row[`${FALLBACK_REVENUE_CUBE}.impressions`])) || null
          result.netCpm = parseFloat(String(row[`${FALLBACK_REVENUE_CUBE}.net_cpm`])) || null
          if (result.netCpm === null && result.revenue !== null && result.impressions !== null && result.impressions > 0) {
            result.netCpm = (result.revenue / result.impressions) * 1000
          }
        } catch (e) {
          console.error(`[freestar] Fallback revenue cube query failed:`, e)
        }
      }
    }
  }

  // Fallback for pageviews/page_rpm if primary didn't have them
  if (result.pageRpm === null) {
    const pageviewMeasures = findCubeMeasures(meta, FALLBACK_PAGEVIEWS_CUBE)
    if (pageviewMeasures.size > 0) {
      const wanted = ['page_views', 'page_rpm']
      const measures = wanted
        .map(m => `${FALLBACK_PAGEVIEWS_CUBE}.${m}`)
        .filter(m => pageviewMeasures.has(m))

      if (measures.length > 0) {
        try {
          const res = await cubeLoad(token, buildRevenueQuery(FALLBACK_PAGEVIEWS_CUBE, measures, dateRange))
          cubesQueried.push(FALLBACK_PAGEVIEWS_CUBE)
          const row = res.data?.[0] ?? {}
          const pageviews = parseFloat(String(row[`${FALLBACK_PAGEVIEWS_CUBE}.page_views`]))
          result.pageRpm = parseFloat(String(row[`${FALLBACK_PAGEVIEWS_CUBE}.page_rpm`])) || null
          if (result.pageRpm === null && result.revenue !== null && pageviews > 0) {
            result.pageRpm = (result.revenue / pageviews) * 1000
          }
        } catch (e) {
          console.error(`[freestar] Pageviews cube query failed:`, e)
        }
      }
    }
  }

  // --- Viewability ---
  const viewabilityMeasures = findCubeMeasures(meta, VIEWABILITY_CUBE)
  if (viewabilityMeasures.size > 0) {
    // Look for a viewability rate measure or derive from viewable_impressions / impressions
    const rateNames = ['viewability_rate', 'viewability', 'avg_viewability']
    const rateMeasure = rateNames
      .map(m => `${VIEWABILITY_CUBE}.${m}`)
      .find(m => viewabilityMeasures.has(m))

    if (rateMeasure) {
      try {
        const res = await cubeLoad(token, buildViewabilityQuery(VIEWABILITY_CUBE, [rateMeasure], dateRange))
        cubesQueried.push(VIEWABILITY_CUBE)
        const row = res.data?.[0] ?? {}
        result.viewability = parseFloat(String(row[rateMeasure])) || null
      } catch (e) {
        console.error(`[freestar] Viewability cube query failed:`, e)
      }
    } else {
      // Try deriving from viewable_impressions / impressions
      const viewableImps = `${VIEWABILITY_CUBE}.viewable_impressions`
      const totalImps = `${VIEWABILITY_CUBE}.impressions`
      if (viewabilityMeasures.has(viewableImps) && viewabilityMeasures.has(totalImps)) {
        try {
          const res = await cubeLoad(token, buildViewabilityQuery(VIEWABILITY_CUBE, [viewableImps, totalImps], dateRange))
          cubesQueried.push(VIEWABILITY_CUBE)
          const row = res.data?.[0] ?? {}
          const vi = parseFloat(String(row[viewableImps]))
          const ti = parseFloat(String(row[totalImps]))
          if (vi > 0 && ti > 0) {
            result.viewability = (vi / ti) * 100
          }
        } catch (e) {
          console.error(`[freestar] Viewability derived query failed:`, e)
        }
      }
    }
  }

  // --- Fill Rate ---
  // fill_rate might be on the primary cube, fallback revenue cube, or derived
  if (result.fillRate === null) {
    // Check primary cube first
    if (primaryMeasures.has(`${PRIMARY_CUBE}.fill_rate`)) {
      try {
        const res = await cubeLoad(token, buildRevenueQuery(PRIMARY_CUBE, [`${PRIMARY_CUBE}.fill_rate`], dateRange))
        const row = res.data?.[0] ?? {}
        result.fillRate = parseFloat(String(row[`${PRIMARY_CUBE}.fill_rate`])) || null
      } catch (e) {
        console.error(`[freestar] Fill rate from primary cube failed:`, e)
      }
    }
    // Try fallback revenue cube
    if (result.fillRate === null) {
      const fallbackMeasures = findCubeMeasures(meta, FALLBACK_REVENUE_CUBE)
      if (fallbackMeasures.has(`${FALLBACK_REVENUE_CUBE}.fill_rate`)) {
        try {
          const res = await cubeLoad(token, buildRevenueQuery(FALLBACK_REVENUE_CUBE, [`${FALLBACK_REVENUE_CUBE}.fill_rate`], dateRange))
          const row = res.data?.[0] ?? {}
          result.fillRate = parseFloat(String(row[`${FALLBACK_REVENUE_CUBE}.fill_rate`])) || null
        } catch (e) {
          console.error(`[freestar] Fill rate from fallback cube failed:`, e)
        }
      }
    }
  }

  return result
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json({ error: 'start and end date params required' }, { status: 400 })
  }

  const token = process.env.FREESTAR_API_TOKEN
  if (!token) {
    return NextResponse.json({ ...NULL_METRICS, source: 'no-token', error: 'FREESTAR_API_TOKEN not set' })
  }

  const cubesQueried: string[] = []

  try {
    // Step 1: Discover available cubes and measures
    let meta: CubeMetaInfo
    try {
      meta = await fetchMeta(token)
      console.log('[freestar] Meta discovery — available cubes:', meta.cubes.map(c => c.name).join(', '))
    } catch (e) {
      console.error('[freestar] Meta endpoint failed:', e)
      return NextResponse.json({
        ...NULL_METRICS,
        source: 'error',
        error: `Meta discovery failed: ${e instanceof Error ? e.message : String(e)}`,
        debug: { cubesQueried: [], meta_checked: false },
      })
    }

    // Step 2: Fetch current and previous period in parallel
    const { prevStartStr, prevEndStr } = computePreviousPeriod(start, end)
    const currentCubes: string[] = []
    const prevCubes: string[] = []

    const [current, previous] = await Promise.all([
      fetchPeriodMetrics(token, [start, end], meta, currentCubes),
      fetchPeriodMetrics(token, [prevStartStr, prevEndStr], meta, prevCubes),
    ])

    cubesQueried.push(...Array.from(new Set([...currentCubes, ...prevCubes])))

    // If we got absolutely nothing, report error
    const hasAnyData = current.revenue !== null || current.impressions !== null ||
      current.viewability !== null || current.fillRate !== null || current.pageRpm !== null
    if (!hasAnyData) {
      return NextResponse.json({
        ...NULL_METRICS,
        source: 'error',
        error: 'No data returned from any Cube.js query',
        debug: { cubesQueried, meta_checked: true },
      })
    }

    // Step 3: Build response matching frontend contract
    const response: MetricsResponse = {
      revenue: current.revenue,
      impressions: current.impressions,
      netCpm: current.netCpm,
      viewability: current.viewability,
      fillRate: current.fillRate,
      pageRpm: current.pageRpm,
      prevRevenue: previous.revenue,
      prevImpressions: previous.impressions,
      prevNetCpm: previous.netCpm,
      prevViewability: previous.viewability,
      prevFillRate: previous.fillRate,
      prevPageRpm: previous.pageRpm,
      source: 'freestar',
      debug: { cubesQueried, meta_checked: true },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[freestar] Unhandled error:', error)
    return NextResponse.json({
      ...NULL_METRICS,
      source: 'error',
      error: error instanceof Error ? error.message : String(error),
      debug: { cubesQueried, meta_checked: true },
    })
  }
}
