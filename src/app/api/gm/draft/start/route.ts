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

// Offseason windows (approximate)
function isInOffseason(sport: string): boolean {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const day = now.getDate()

  switch (sport) {
    case 'nfl':
      // NFL Draft: Late April. Offseason: Mid-Jan through August
      return (month === 1 && day >= 15) || (month >= 2 && month <= 8)
    case 'nba':
      // NBA Draft: June. Offseason: June-October
      return month >= 6 && month <= 10
    case 'nhl':
      // NHL Draft: July. Offseason: June-September
      return month >= 6 && month <= 9
    case 'mlb':
      // MLB Draft: July. Offseason: October-March
      return month >= 10 || month <= 3
    default:
      return false
  }
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
    const year = draft_year || 2025

    // Check if team is in offseason
    if (!isInOffseason(teamInfo.sport)) {
      return NextResponse.json({
        error: `Mock Draft is only available during the ${teamInfo.sport.toUpperCase()} offseason`,
        code: 'NOT_OFFSEASON',
        sport: teamInfo.sport,
      }, { status: 400 })
    }

    // Get draft order from Supabase view
    const { data: draftOrder, error: orderError } = await datalabAdmin
      .from('gm_draft_order')
      .select('*')
      .eq('sport', teamInfo.sport)
      .eq('draft_year', year)
      .order('pick_number')

    if (orderError) {
      console.error('Draft order error:', orderError)
      throw new Error(`Failed to fetch draft order: ${orderError.message}`)
    }

    if (!draftOrder || draftOrder.length === 0) {
      return NextResponse.json({
        error: `No draft order available for ${teamInfo.sport.toUpperCase()} ${year}`,
        code: 'NO_DRAFT_ORDER',
      }, { status: 400 })
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
      throw new Error(`Failed to create mock draft: ${mockError.message}`)
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
