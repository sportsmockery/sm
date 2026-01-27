import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const TEAM_SPORT_MAP: Record<string, string> = {
  bears: 'nfl', bulls: 'nba', blackhawks: 'nhl', cubs: 'mlb', whitesox: 'mlb',
}

async function getAuthUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => { cookieStore.set(name, value, options) }) } catch {}
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  try {
    const user = await getAuthUser()
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
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
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
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
