import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'
import { randomUUID } from 'crypto'

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

    // Try using RPC function first, fall back to direct insert
    let mockDraft: any = null
    let mockDraftId: string | null = null

    // Try RPC function (if Datalab has created it)
    const { data: rpcResult, error: rpcError } = await datalabAdmin.rpc('create_mock_draft', {
      p_user_id: user.id,
      p_user_email: user.email,
      p_chicago_team: chicago_team,
      p_sport: teamInfo.sport,
      p_draft_year: year,
      p_total_picks: draftOrder.length,
    })

    if (!rpcError && rpcResult) {
      mockDraftId = rpcResult
    } else {
      // RPC not available, try direct insert to view (may work if view is updatable)
      console.log('RPC not available, trying direct view insert. RPC error:', rpcError?.message)

      // Try inserting to the view directly
      const { data: viewInsert, error: viewError } = await datalabAdmin
        .from('gm_mock_drafts')
        .insert({
          user_id: user.id,
          user_email: user.email,
          chicago_team,
          sport: teamInfo.sport,
          draft_year: year,
          status: 'in_progress',
          current_pick: 1,
          total_picks: draftOrder.length,
        })
        .select()
        .single()

      if (viewError) {
        console.error('View insert error:', viewError)
        // Log detailed error for debugging
        try {
          await datalabAdmin.from('gm_errors').insert({
            source: 'backend',
            error_type: 'schema',
            error_message: `Mock draft insert failed: ${viewError.message}`,
            route: '/api/gm/draft/start',
            metadata: {
              attempted_table: 'gm_mock_drafts',
              error_code: viewError.code,
              error_details: viewError.details,
              error_hint: viewError.hint,
            }
          })
        } catch {}

        throw new Error(`Failed to create mock draft. The database schema may need RPC functions. Error: ${viewError.message}`)
      }

      mockDraft = viewInsert
      mockDraftId = viewInsert?.id
    }

    if (!mockDraftId) {
      throw new Error('Failed to create mock draft: No ID returned')
    }

    // Fetch the created mock draft if we only have the ID
    if (!mockDraft) {
      const { data: fetchedDraft } = await datalabAdmin
        .from('gm_mock_drafts')
        .select('*')
        .eq('id', mockDraftId)
        .single()
      mockDraft = fetchedDraft
    }

    // Create all picks
    const chicagoTeamKey = teamInfo.key
    const picks = draftOrder.map((p: any) => ({
      mock_draft_id: mockDraftId,
      pick_number: p.pick_number,
      round: p.round,
      team_key: p.team_key,
      team_name: p.team_name,
      team_logo: p.team_logo,
      team_color: p.team_color || null,
      is_user_pick: p.team_key === chicagoTeamKey,
    }))

    // Try RPC for picks first
    const { error: picksRpcError } = await datalabAdmin.rpc('create_mock_draft_picks', {
      p_picks: picks,
    })

    if (picksRpcError) {
      // Try direct insert to view
      const { error: picksError } = await datalabAdmin
        .from('gm_mock_draft_picks')
        .insert(picks)

      if (picksError) {
        console.error('Picks insert error:', picksError)
        // Clean up the mock draft
        try {
          await datalabAdmin.from('gm_mock_drafts').delete().eq('id', mockDraftId)
        } catch {}

        try {
          await datalabAdmin.from('gm_errors').insert({
            source: 'backend',
            error_type: 'schema',
            error_message: `Draft picks insert failed: ${picksError.message}`,
            route: '/api/gm/draft/start',
            metadata: {
              attempted_table: 'gm_mock_draft_picks',
              error_code: picksError.code,
              mock_draft_id: mockDraftId,
            }
          })
        } catch {}

        throw new Error(`Failed to create draft picks: ${picksError.message}`)
      }
    }

    // Get the user's pick numbers
    const userPicks = picks
      .filter((p: any) => p.is_user_pick)
      .map((p: any) => p.pick_number)

    // Build response with picks
    const picksWithCurrent = picks.map((p: any, index: number) => ({
      ...p,
      is_current: index === 0,
      selected_prospect: null,
    }))

    return NextResponse.json({
      draft: {
        id: mockDraftId,
        chicago_team,
        sport: teamInfo.sport,
        draft_year: year,
        status: 'in_progress',
        current_pick: 1,
        total_picks: draftOrder.length,
        picks: picksWithCurrent,
        user_picks: userPicks,
        created_at: mockDraft?.created_at || new Date().toISOString(),
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
