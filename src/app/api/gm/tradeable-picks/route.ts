import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')
    const team = searchParams.get('team')

    if (!sport || !team) {
      return NextResponse.json({ error: 'sport and team are required' }, { status: 400 })
    }

    const res = await fetch(
      `${DATALAB_URL}/api/gm/tradeable-picks?sport=${encodeURIComponent(sport)}&team=${encodeURIComponent(team)}`,
      {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      console.error('DataLab tradeable-picks error:', res.status)
      return NextResponse.json({ error: 'Failed to fetch tradeable picks' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Tradeable picks proxy error:', error)
    return NextResponse.json({ error: 'Failed to fetch tradeable picks' }, { status: 500 })
  }
}
