import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

const CHICAGO_TEAMS: Record<string, string> = {
  bears: 'nfl',
  bulls: 'nba',
  blackhawks: 'nhl',
  cubs: 'mlb',
  whitesox: 'mlb',
}

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Please sign in to use the GM Trade Simulator', code: 'AUTH_REQUIRED' }, { status: 401 })

    const params = request.nextUrl.searchParams
    const search = params.get('search')
    const posFilter = params.get('position')

    // Build DataLab query params
    const dlParams = new URLSearchParams()

    // Opponent roster path: team_key + sport params
    const teamKey = params.get('team_key')
    const sportParam = params.get('sport')
    if (teamKey && sportParam) {
      dlParams.set('team_key', teamKey)
      dlParams.set('sport', sportParam)
    } else {
      // Chicago roster path: team param
      const team = params.get('team')
      if (!team || !CHICAGO_TEAMS[team]) {
        return NextResponse.json({ error: 'Invalid team' }, { status: 400 })
      }
      dlParams.set('team', team)
    }

    if (search) dlParams.set('search', search)
    if (posFilter) dlParams.set('position', posFilter)

    const res = await fetch(`${DATALAB_URL}/api/gm/roster?${dlParams.toString()}`, {
      headers: {
        'X-API-Key': process.env.GM_API_KEY || '',
      },
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error')
      console.error(`[GM Roster] DataLab returned ${res.status}:`, errorText)
      return NextResponse.json(
        { error: `Failed to fetch roster (${res.status})` },
        { status: res.status >= 500 ? 502 : res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('GM roster error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/gm/roster' }) } catch {}
    return NextResponse.json({ error: 'Failed to fetch roster' }, { status: 500 })
  }
}
