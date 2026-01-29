import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to use Mock Draft', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    const sport = request.nextUrl.searchParams.get('sport')
    const year = request.nextUrl.searchParams.get('year') || '2025'
    const search = request.nextUrl.searchParams.get('search')
    const position = request.nextUrl.searchParams.get('position')

    if (!sport) {
      return NextResponse.json({ error: 'sport is required' }, { status: 400 })
    }

    // Build query
    let query = datalabAdmin
      .from('gm_draft_prospects')
      .select('*')
      .eq('sport', sport.toLowerCase())
      .eq('draft_year', parseInt(year))

    // Apply filters
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    if (position) {
      query = query.eq('position', position)
    }

    // Order by rank/grade
    query = query.order('rank', { ascending: true, nullsFirst: false })

    const { data: prospects, error } = await query.limit(200)

    if (error) {
      console.error('Prospects fetch error:', error)
      throw new Error('Failed to fetch prospects')
    }

    // Map to expected format
    const mappedProspects = (prospects || []).map((p: any) => ({
      id: p.prospect_id || p.id,
      name: p.name,
      position: p.position,
      school: p.school,
      height: p.height,
      weight: p.weight,
      age: p.age,
      headshot_url: p.headshot_url,
      projected_round: p.projected_round,
      projected_pick: p.rank, // Use rank as projected pick
      grade: p.grade,
      tier: p.tier,
      strengths: p.strengths || [],
      weaknesses: p.weaknesses || [],
      comparison: p.comparison,
      summary: p.summary,
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
