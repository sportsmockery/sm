import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const TEAM_SPORT_MAP: Record<string, string> = {
  bears: 'nfl', bulls: 'nba', blackhawks: 'nhl', cubs: 'mlb', whitesox: 'mlb',
}


export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: sessions, error } = await datalabAdmin
      .from('gm_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('GM sessions error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/gm/sessions GET' }) } catch {}
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { chicago_team, session_name } = body

    if (!chicago_team || !TEAM_SPORT_MAP[chicago_team]) {
      return NextResponse.json({ error: 'Invalid chicago_team' }, { status: 400 })
    }

    await datalabAdmin
      .from('gm_sessions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('chicago_team', chicago_team)
      .eq('is_active', true)

    const { data: session, error } = await datalabAdmin
      .from('gm_sessions')
      .insert({
        user_id: user.id,
        user_email: user.email || 'unknown',
        chicago_team,
        sport: TEAM_SPORT_MAP[chicago_team],
        session_name: session_name || `${chicago_team.charAt(0).toUpperCase() + chicago_team.slice(1)} Trade Session`,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    await datalabAdmin
      .from('gm_leaderboard')
      .update({ active_session_id: session.id })
      .eq('user_id', user.id)

    return NextResponse.json({ session })
  } catch (error) {
    console.error('GM session create error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/gm/sessions POST' }) } catch {}
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
