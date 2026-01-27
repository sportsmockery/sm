import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

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

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sport = request.nextUrl.searchParams.get('sport')
    const search = request.nextUrl.searchParams.get('search')?.toLowerCase()

    let query = datalabAdmin
      .from('gm_league_teams')
      .select('team_key, team_name, abbreviation, city, logo_url, primary_color, secondary_color, conference, division, sport')
      .order('conference')
      .order('division')
      .order('team_name')

    if (sport) {
      query = query.eq('sport', sport)
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
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}
