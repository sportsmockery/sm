import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import {
  aggregateTotals,
  loadStoredTokens,
  querySearchAnalytics,
} from '@/lib/google-search-console'

export const dynamic = 'force-dynamic'

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const stored = await loadStoredTokens()
  if (!stored) {
    return NextResponse.json({ connected: false }, { status: 200 })
  }

  const sp = request.nextUrl.searchParams
  const start = sp.get('start')
  const end = sp.get('end')
  if (!start || !end) {
    return NextResponse.json({ error: 'start and end (YYYY-MM-DD) required' }, { status: 400 })
  }

  // Compute previous-period bounds for delta cards
  const startMs = new Date(start + 'T00:00:00Z').getTime()
  const endMs = new Date(end + 'T00:00:00Z').getTime()
  const days = Math.max(1, Math.round((endMs - startMs) / 86_400_000) + 1)
  const prevEnd = isoDate(new Date(startMs - 86_400_000))
  const prevStart = isoDate(new Date(startMs - days * 86_400_000))

  try {
    const [
      currentTotals,
      previousTotals,
      byDate,
      byQuery,
      byPage,
    ] = await Promise.all([
      querySearchAnalytics({ startDate: start, endDate: end, dimensions: [], rowLimit: 1 }),
      querySearchAnalytics({ startDate: prevStart, endDate: prevEnd, dimensions: [], rowLimit: 1 }),
      querySearchAnalytics({ startDate: start, endDate: end, dimensions: ['date'], rowLimit: 5000 }),
      querySearchAnalytics({ startDate: start, endDate: end, dimensions: ['query'], rowLimit: 50 }),
      querySearchAnalytics({ startDate: start, endDate: end, dimensions: ['page'], rowLimit: 50 }),
    ])

    const totals = aggregateTotals(currentTotals)
    const prev = aggregateTotals(previousTotals)

    return NextResponse.json({
      connected: true,
      property: stored.property_id,
      email: stored.google_account_email,
      range: { start, end, prevStart, prevEnd },
      totals,
      previous: prev,
      timeseries: byDate.map(r => ({
        date: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
      })),
      topQueries: byQuery.map(r => ({
        query: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
      })),
      topPages: byPage.map(r => ({
        page: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
      })),
    })
  } catch (e: any) {
    console.error('[GSC] data error:', e)
    return NextResponse.json(
      { connected: true, error: e?.message || 'GSC fetch failed' },
      { status: 502 }
    )
  }
}
