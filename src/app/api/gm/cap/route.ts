import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'


const SPORT_CAP_TABLE: Record<string, string> = {
  nfl: 'gm_nfl_salary_cap',
  nba: 'gm_nba_salary_cap',
  nhl: 'gm_nhl_salary_cap',
  mlb: 'gm_mlb_salary_cap',
}

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const teamKey = request.nextUrl.searchParams.get('team_key')
    const sport = request.nextUrl.searchParams.get('sport')

    if (!teamKey || !sport || !SPORT_CAP_TABLE[sport]) {
      return NextResponse.json({ error: 'team_key and valid sport required' }, { status: 400 })
    }

    const table = SPORT_CAP_TABLE[sport]

    const { data, error } = await datalabAdmin
      .from(table)
      .select('total_cap, cap_used, cap_available, dead_money')
      .eq('team_key', teamKey)
      .order('season', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // Table may not exist yet — return null gracefully
      return NextResponse.json({ cap: null })
    }

    return NextResponse.json({ cap: data })
  } catch (error) {
    console.error('GM cap error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/gm/cap' }) } catch {}
    return NextResponse.json({ error: 'Failed to fetch cap data' }, { status: 500 })
  }
}
