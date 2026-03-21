import { NextRequest } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

const DATALAB_BASE_URL = process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'
const VALID_TEAMS = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox']

export async function GET(req: NextRequest) {
  const team = req.nextUrl.searchParams.get('team')
  const type = req.nextUrl.searchParams.get('type') || 'timeline'

  try {
    let query = datalabAdmin
      .from('ownership_grade_history')
      .select('team_slug, recorded_at, season_label, spend_grade, results_grade, sentiment_grade, loyalty_tax, overall_grade, trigger_event, notes')
      .order('recorded_at', { ascending: true })

    if (type === 'timeline') {
      query = query.eq('trigger_event', 'quarterly')
    } else {
      query = query.eq('trigger_event', 'initial_seed')
    }

    if (team && VALID_TEAMS.includes(team)) {
      query = query.eq('team_slug', team)
    }

    const { data, error } = await query
    if (error) throw error

    return Response.json({
      success: true,
      source: 'supabase',
      count: data?.length || 0,
      grades: data || [],
    })
  } catch (err) {
    console.error('[ownership-grades] Supabase failed, falling back to API:', err)
    try {
      const params = new URLSearchParams()
      if (team) params.set('team', team)
      if (type) params.set('type', type)

      const res = await fetch(
        `${DATALAB_BASE_URL}/api/dashboard/ownership-grades?${params}`,
        { next: { revalidate: 300 } }
      )

      if (!res.ok) throw new Error(`API returned ${res.status}`)
      const apiData = await res.json()

      return Response.json({ ...apiData, source: 'api_fallback' })
    } catch {
      return Response.json(
        { success: false, error: 'Both Supabase and API fallback failed' },
        { status: 502 }
      )
    }
  }
}
