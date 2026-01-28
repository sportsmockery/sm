import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    const sport = request.nextUrl.searchParams.get('sport')
    const search = request.nextUrl.searchParams.get('search')?.toLowerCase()

    const excludeTeam = request.nextUrl.searchParams.get('exclude')

    let query = datalabAdmin
      .from('gm_league_teams')
      .select('team_key, team_name, abbreviation, city, logo_url, primary_color, secondary_color, conference, division, sport')
      .order('conference')
      .order('division')
      .order('team_name')
      .limit(150) // Ensure we get all teams (max ~32 per sport)

    if (sport) {
      query = query.eq('sport', sport)
    }

    // Exclude the Chicago team from opponent list
    if (excludeTeam) {
      query = query.neq('team_key', excludeTeam)
    }

    const { data: teams, error } = await query
    if (error) throw error

    let filtered = teams || []
    if (search) {
      filtered = filtered.filter((t: any) =>
        t.team_name.toLowerCase().includes(search) ||
        t.abbreviation.toLowerCase().includes(search) ||
        t.city.toLowerCase().includes(search)
      )
    }

    return NextResponse.json({ teams: filtered })
  } catch (error) {
    console.error('GM teams error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/gm/teams' }) } catch {}
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}
