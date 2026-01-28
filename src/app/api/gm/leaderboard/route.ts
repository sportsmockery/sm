import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    const team = request.nextUrl.searchParams.get('team')

    let query = datalabAdmin
      .from('gm_leaderboard')
      .select('*')
      .order('total_improvement', { ascending: false })
      .limit(50)

    if (team) {
      query = query.eq('favorite_team', team)
    }

    const { data: leaderboard, error } = await query
    if (error) throw error

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('GM leaderboard error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/gm/leaderboard' }) } catch {}
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
