import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Auth required' }, { status: 401 })

    const sport = request.nextUrl.searchParams.get('sport')
    const team = request.nextUrl.searchParams.get('team')
    if (!sport || !team) return NextResponse.json({ error: 'sport and team required' }, { status: 400 })

    const res = await fetch(
      `${DATALAB_URL}/api/gm/tradeable-picks?sport=${encodeURIComponent(sport)}&team=${encodeURIComponent(team)}`
    )
    if (!res.ok) return NextResponse.json({ error: 'DataLab error' }, { status: res.status })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tradeable picks' }, { status: 500 })
  }
}
