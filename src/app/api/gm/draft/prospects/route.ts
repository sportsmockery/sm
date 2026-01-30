import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

// Map sport param to league column value
const SPORT_TO_LEAGUE: Record<string, string> = {
  nfl: 'NFL',
  nba: 'NBA',
  nhl: 'NHL',
  mlb: 'MLB',
}

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to use Mock Draft', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    const sport = request.nextUrl.searchParams.get('sport')
    const year = request.nextUrl.searchParams.get('year') || '2026'
    const search = request.nextUrl.searchParams.get('search')
    const position = request.nextUrl.searchParams.get('position')

    if (!sport) {
      return NextResponse.json({ error: 'sport is required' }, { status: 400 })
    }

    const league = SPORT_TO_LEAGUE[sport.toLowerCase()]
    if (!league) {
      return NextResponse.json({ error: 'Invalid sport' }, { status: 400 })
    }

    // Build query - use draft_prospects table with league column
    let query = datalabAdmin
      .from('draft_prospects')
      .select('*')
      .eq('league', league)
      .eq('draft_year', parseInt(year))

    // Apply filters
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    if (position) {
      query = query.eq('position', position)
    }

    // Order by big_board_rank
    query = query.order('big_board_rank', { ascending: true, nullsFirst: false })

    const { data: prospects, error } = await query.limit(200)

    if (error) {
      console.error('Prospects fetch error:', error)
      throw new Error(`Failed to fetch prospects: ${error.message}`)
    }

    // Map to expected format - use Datalab column names
    const mappedProspects = (prospects || []).map((p: any) => ({
      id: p.id?.toString() || p.name, // Use id or name as fallback
      name: p.name,
      position: p.position,
      school: p.school_team, // Datalab uses school_team
      height: p.height,
      weight: p.weight,
      age: p.age,
      headshot_url: p.headshot_url,
      projected_round: p.projected_tier, // Use tier as projected round
      projected_pick: p.big_board_rank, // Use big_board_rank
      grade: p.projected_value, // Use projected_value as grade (0-100)
      tier: p.projected_tier,
      strengths: p.strengths || [],
      weaknesses: p.weaknesses || [],
      comparison: p.comp_player, // Datalab uses comp_player
      summary: p.scouting_summary, // Datalab uses scouting_summary
    }))

    return NextResponse.json({ prospects: mappedProspects })

  } catch (error) {
    console.error('Draft prospects error:', error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/draft/prospects'
      })
    } catch {}
    return NextResponse.json({ error: 'Failed to fetch prospects' }, { status: 500 })
  }
}
