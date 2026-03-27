import { NextResponse } from 'next/server'

const FREESTAR_BASE = 'https://api.pub.network'
const FREESTAR_ACCOUNT_ID = '1028'
const FREESTAR_SITE_ID = '1764'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json({ error: 'start and end date params required' }, { status: 400 })
  }

  try {
    // Try fetching from Freestar API
    const token = process.env.FREESTAR_API_TOKEN
    if (!token) {
      // No token — return estimated revenue from a fallback
      return NextResponse.json({ revenue: null, source: 'no-token' })
    }

    const res = await fetch(
      `${FREESTAR_BASE}/v1/accounts/${FREESTAR_ACCOUNT_ID}/sites/${FREESTAR_SITE_ID}/reports/revenue?start_date=${start}&end_date=${end}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 1800 }, // cache 30 min
      }
    )

    if (!res.ok) {
      // Freestar API returned error — try alternate endpoint
      const altRes = await fetch(
        `${FREESTAR_BASE}/v1/accounts/${FREESTAR_ACCOUNT_ID}/sites/${FREESTAR_SITE_ID}/analytics?start_date=${start}&end_date=${end}&metrics=net_revenue`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          next: { revalidate: 1800 },
        }
      )

      if (altRes.ok) {
        const altData = await altRes.json()
        const revenue = altData?.data?.reduce?.((sum: number, d: any) => sum + (d.net_revenue || d.revenue || 0), 0)
          ?? altData?.net_revenue
          ?? altData?.revenue
          ?? null
        return NextResponse.json({ revenue, source: 'freestar-alt' })
      }

      return NextResponse.json({ revenue: null, source: 'freestar-error' })
    }

    const data = await res.json()
    // Handle various response shapes from Freestar
    const revenue = data?.data?.reduce?.((sum: number, d: any) => sum + (d.net_revenue || d.revenue || 0), 0)
      ?? data?.total?.net_revenue
      ?? data?.net_revenue
      ?? data?.revenue
      ?? null

    return NextResponse.json({ revenue, source: 'freestar' })
  } catch (error) {
    console.error('Freestar revenue fetch error:', error)
    return NextResponse.json({ revenue: null, source: 'error' })
  }
}
