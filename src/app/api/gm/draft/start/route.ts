import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

// Chicago team keys by sport
const CHICAGO_TEAMS: Record<string, { key: string; name: string; sport: string }> = {
  bears: { key: 'chi', name: 'Chicago Bears', sport: 'nfl' },
  bulls: { key: 'chi', name: 'Chicago Bulls', sport: 'nba' },
  blackhawks: { key: 'chi', name: 'Chicago Blackhawks', sport: 'nhl' },
  cubs: { key: 'chc', name: 'Chicago Cubs', sport: 'mlb' },
  whitesox: { key: 'chw', name: 'Chicago White Sox', sport: 'mlb' },
}

export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to use Mock Draft', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    const body = await request.json()
    const { chicago_team, draft_year } = body

    if (!chicago_team || !CHICAGO_TEAMS[chicago_team]) {
      return NextResponse.json({ error: 'Invalid Chicago team' }, { status: 400 })
    }

    const teamInfo = CHICAGO_TEAMS[chicago_team]
    let year = draft_year || 2026

    // Get draft order from Supabase view
    let { data: draftOrder, error: orderError } = await datalabAdmin
      .from('gm_draft_order')
      .select('*')
      .eq('sport', teamInfo.sport)
      .eq('draft_year', year)
      .order('pick_number')

    if (orderError) {
      console.error('Draft order error:', orderError)
      throw new Error(`Failed to fetch draft order: ${orderError.message}`)
    }

    // If no data for requested year, check what years are available
    if (!draftOrder || draftOrder.length === 0) {
      const { data: availableYears, error: yearsError } = await datalabAdmin
        .from('gm_draft_order')
        .select('draft_year')
        .eq('sport', teamInfo.sport)
        .order('draft_year', { ascending: false })
        .limit(10)

      if (yearsError) {
        console.error('Available years query error:', yearsError)
      }

      // Get unique years
      const uniqueYears = [...new Set((availableYears || []).map((r: any) => r.draft_year))].sort((a, b) => b - a)

      if (uniqueYears.length === 0) {
        return NextResponse.json({
          error: `No draft order data available for ${teamInfo.sport.toUpperCase()}. Please contact support.`,
          code: 'NO_DRAFT_ORDER',
        }, { status: 400 })
      }

      // Use the most recent available year
      const fallbackYear = uniqueYears[0]
      console.log(`No draft order for ${teamInfo.sport} ${year}, falling back to ${fallbackYear}. Available years: ${uniqueYears.join(', ')}`)

      const { data: fallbackOrder, error: fallbackError } = await datalabAdmin
        .from('gm_draft_order')
        .select('*')
        .eq('sport', teamInfo.sport)
        .eq('draft_year', fallbackYear)
        .order('pick_number')

      if (fallbackError || !fallbackOrder || fallbackOrder.length === 0) {
        return NextResponse.json({
          error: `No draft order available for ${teamInfo.sport.toUpperCase()}. Available years: ${uniqueYears.join(', ')}`,
          code: 'NO_DRAFT_ORDER',
        }, { status: 400 })
      }

      draftOrder = fallbackOrder
      year = fallbackYear
    }

    // 1. Create mock draft session using RPC
    const { data: mockId, error: mockError } = await datalabAdmin.rpc('create_mock_draft', {
      p_user_id: user.id,
      p_user_email: user.email,
      p_chicago_team: chicago_team,
      p_sport: teamInfo.sport,
      p_draft_year: year,
      p_total_picks: draftOrder.length,
      p_mode: 'user_only',
    })

    if (mockError) {
      console.error('Create mock draft RPC error:', mockError)
      // Check if it's an eligibility error from Datalab
      const errorMsg = mockError.message || String(mockError)
      if (errorMsg.includes('Mock draft not available') || errorMsg.includes('Season in progress') || errorMsg.includes('not eligible')) {
        return NextResponse.json({
          error: errorMsg,
          code: 'NOT_ELIGIBLE',
        }, { status: 400 })
      }
      throw new Error(`Failed to create mock draft: ${errorMsg}`)
    }

    if (!mockId) {
      throw new Error('Failed to create mock draft: No ID returned')
    }

    // 2. Create all picks using RPC
    const chicagoTeamKey = teamInfo.key
    const picks = draftOrder.map((p: any) => ({
      mock_draft_id: mockId,
      sport: teamInfo.sport,
      draft_year: year,
      pick_number: p.pick_number,
      round: p.round,
      team_key: p.team_key,
      team_name: p.team_name,
      team_logo: p.team_logo,
      team_color: p.team_color || null,
      is_user_pick: p.team_key === chicagoTeamKey,
      is_chicago_team: p.team_key === chicagoTeamKey,
    }))

    const { error: picksError } = await datalabAdmin.rpc('create_mock_draft_picks', {
      p_picks: picks,
    })

    if (picksError) {
      console.error('Create picks RPC error:', picksError)
      throw new Error(`Failed to create draft picks: ${picksError.message}`)
    }

    // Get the user's pick numbers
    const userPicks = picks
      .filter((p: any) => p.is_user_pick)
      .map((p: any) => p.pick_number)

    // Build response with picks
    const picksWithCurrent = picks.map((p: any, index: number) => ({
      pick_number: p.pick_number,
      round: p.round,
      team_key: p.team_key,
      team_name: p.team_name,
      team_logo: p.team_logo,
      team_color: p.team_color,
      is_user_pick: p.is_user_pick,
      is_current: index === 0,
      selected_prospect: null,
    }))

    return NextResponse.json({
      draft: {
        id: mockId,
        chicago_team,
        sport: teamInfo.sport,
        draft_year: year,
        status: 'in_progress',
        current_pick: 1,
        total_picks: draftOrder.length,
        picks: picksWithCurrent,
        user_picks: userPicks,
        created_at: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('Draft start error:', error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/draft/start'
      })
    } catch {}
    return NextResponse.json({ error: String(error) || 'Failed to start draft' }, { status: 500 })
  }
}
