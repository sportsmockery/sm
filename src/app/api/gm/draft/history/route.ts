import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ drafts: [], total: 0 })
    }

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '20'), 50)
    const offset = (page - 1) * limit

    // Get user's draft history from Supabase
    const { data: drafts, error, count } = await datalabAdmin
      .from('gm_mock_drafts')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Draft history error:', error)
      return NextResponse.json({ drafts: [], total: 0, page, limit })
    }

    // Get pick counts for each draft
    const draftIds = (drafts || []).map((d: any) => d.id)
    let pickCountsMap: Record<string, number> = {}

    if (draftIds.length > 0) {
      const { data: pickCounts } = await datalabAdmin
        .from('gm_mock_draft_picks')
        .select('mock_draft_id')
        .in('mock_draft_id', draftIds)
        .not('prospect_id', 'is', null)

      if (pickCounts) {
        for (const pc of pickCounts) {
          pickCountsMap[pc.mock_draft_id] = (pickCountsMap[pc.mock_draft_id] || 0) + 1
        }
      }
    }

    // Map to expected format
    const mappedDrafts = (drafts || []).map((d: any) => ({
      id: d.id,
      chicago_team: d.chicago_team,
      sport: d.sport,
      draft_year: d.draft_year,
      status: d.status,
      grade: d.overall_grade,
      letter_grade: d.letter_grade,
      created_at: d.created_at,
      picks_made: pickCountsMap[d.id] || 0,
    }))

    return NextResponse.json({
      drafts: mappedDrafts,
      total: count || 0,
      page,
      limit,
    })

  } catch (error) {
    console.error('Draft history error:', error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/draft/history'
      })
    } catch {}
    return NextResponse.json({ drafts: [], total: 0 })
  }
}
