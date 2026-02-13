import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

// Map sport to league format for Datalab
const SPORT_TO_LEAGUE: Record<string, string> = {
  nfl: 'NFL',
  nba: 'NBA',
  nhl: 'NHL',
  mlb: 'MLB',
}

export async function POST(request: NextRequest) {
  const debugLog: string[] = []
  const log = (msg: string) => {
    console.log(`[AutoAdvance] ${msg}`)
    debugLog.push(msg)
  }

  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to use Mock Draft', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    const body = await request.json()
    const { mock_id } = body

    if (!mock_id) {
      return NextResponse.json({ error: 'mock_id is required' }, { status: 400 })
    }

    log(`Starting auto-advance for mock_id: ${mock_id}`)

    // Get the mock draft using RPC
    const { data: mockDraftData, error: mockError } = await datalabAdmin.rpc('get_mock_draft', {
      p_mock_id: mock_id,
    })

    if (mockError) {
      log(`get_mock_draft RPC error: ${JSON.stringify(mockError)}`)
      return NextResponse.json({ error: 'Mock draft not found', debug: debugLog }, { status: 404 })
    }

    // RPC can return array or single object depending on function definition
    const mockDraft = Array.isArray(mockDraftData) ? mockDraftData[0] : mockDraftData

    if (!mockDraft) {
      log(`Mock draft not found for id: ${mock_id}, data was: ${JSON.stringify(mockDraftData)}`)
      return NextResponse.json({ error: 'Mock draft not found', debug: debugLog }, { status: 404 })
    }

    log(`Mock draft found: sport=${mockDraft.sport}, year=${mockDraft.draft_year}, current_pick=${mockDraft.current_pick}`)

    // Verify ownership
    if (mockDraft.user_id !== user.id) {
      log(`Ownership mismatch: stored=${mockDraft.user_id}, current=${user.id}`)
      return NextResponse.json({ error: 'Unauthorized', debug: debugLog }, { status: 403 })
    }

    const allPicks = mockDraft.picks || []
    let currentPick = mockDraft.current_pick

    log(`Total picks in draft: ${allPicks.length}, current_pick: ${currentPick}`)

    // Find next user pick
    const userPickNumbers = allPicks.filter((p: any) => p.is_user_pick).map((p: any) => p.pick_number)
    const nextUserPick = userPickNumbers.find((pn: number) => pn >= currentPick) || mockDraft.total_picks + 1

    log(`User pick numbers: ${userPickNumbers.join(', ')}, nextUserPick: ${nextUserPick}`)

    // Check if we're already at a user pick
    const currentPickData = allPicks.find((p: any) => p.pick_number === currentPick)
    if (currentPickData?.is_user_pick) {
      log(`Already at user pick ${currentPick}, nothing to advance`)
      // Return current state - no advancing needed
      const picks = allPicks.map((p: any) => ({
        pick_number: p.pick_number,
        round: p.round,
        team_key: p.team_key,
        team_name: p.team_name,
        team_logo: p.team_logo,
        team_color: p.team_color,
        is_user_pick: p.is_user_pick,
        is_current: p.pick_number === currentPick,
        selected_prospect: p.prospect_id ? {
          id: p.prospect_id,
          name: p.prospect_name,
          position: p.position,
        } : null,
      }))

      return NextResponse.json({
        draft: {
          id: mock_id,
          chicago_team: mockDraft.chicago_team,
          sport: mockDraft.sport,
          draft_year: mockDraft.draft_year,
          status: 'in_progress',
          current_pick: currentPick,
          total_picks: mockDraft.total_picks,
          picks,
          user_picks: userPickNumbers,
        },
        debug: debugLog,
      })
    }

    // Get available prospects (not yet picked)
    const pickedProspectIds = allPicks
      .filter((p: any) => p.prospect_id)
      .map((p: any) => String(p.prospect_id))

    log(`Already picked prospect IDs: ${pickedProspectIds.length} picks made`)

    // Use draft_prospects table with league column (uppercase: NFL, NBA, etc.)
    const league = SPORT_TO_LEAGUE[mockDraft.sport?.toLowerCase()] || mockDraft.sport?.toUpperCase()

    log(`Fetching prospects for league=${league}, year=${mockDraft.draft_year}`)

    const { data: availableProspects, error: prospectError } = await datalabAdmin
      .from('draft_prospects')
      .select('*')
      .eq('league', league)
      .eq('draft_year', mockDraft.draft_year)
      .order('big_board_rank', { ascending: true })
      .limit(150)

    if (prospectError) {
      log(`Prospects fetch error: ${JSON.stringify(prospectError)}`)
      return NextResponse.json({
        error: `Failed to fetch prospects: ${prospectError.message}`,
        debug: debugLog
      }, { status: 500 })
    }

    log(`Fetched ${availableProspects?.length || 0} prospects from database`)

    if (!availableProspects || availableProspects.length === 0) {
      log(`No prospects found for ${league} ${mockDraft.draft_year}`)
      return NextResponse.json({
        error: `No prospects available for ${league} ${mockDraft.draft_year}. Database may not have prospect data.`,
        debug: debugLog
      }, { status: 400 })
    }

    // Log first few prospects for debugging
    log(`First 3 prospects: ${availableProspects.slice(0, 3).map((p: any) => `${p.name} (${p.position})`).join(', ')}`)

    // Map to consistent format and filter out picked prospects
    const mappedProspects = availableProspects.map((p: any) => ({
      ...p,
      prospect_id: String(p.id || p.name), // Use id as prospect_id, ensure it's a string
      school: p.school_team,
      grade: p.projected_value,
      rank: p.big_board_rank,
    }))

    const filteredProspects = mappedProspects.filter(
      (p: any) => !pickedProspectIds.includes(p.prospect_id)
    )

    log(`After filtering picked: ${filteredProspects.length} prospects available`)

    if (filteredProspects.length === 0) {
      return NextResponse.json({
        error: 'No prospects available - all have been picked',
        debug: debugLog
      }, { status: 400 })
    }

    // Simulate picks until we reach the user's pick or end of draft
    const maxIterations = Math.min(nextUserPick - currentPick, 50)
    let iterations = 0
    let picksAdvanced = 0

    log(`Starting simulation loop: maxIterations=${maxIterations}, from pick ${currentPick} to ${nextUserPick}`)

    while (currentPick < nextUserPick && currentPick <= mockDraft.total_picks && iterations < maxIterations) {
      const pickData = allPicks.find((p: any) => p.pick_number === currentPick)

      if (!pickData) {
        log(`ERROR: No pick data found for pick ${currentPick}`)
        break
      }

      if (pickData.is_user_pick) {
        log(`Reached user pick at ${currentPick}, stopping`)
        break
      }

      log(`Processing pick ${currentPick}: ${pickData.team_name}`)

      // Get top available prospects (that haven't been picked yet in this session)
      const topProspects = filteredProspects
        .filter((p: any) => !pickedProspectIds.includes(p.prospect_id))
        .slice(0, 10)

      if (topProspects.length === 0) {
        log(`No more prospects available at pick ${currentPick}`)
        break
      }

      // Use BPA (Best Player Available) - AI picks disabled for speed
      // AI calls were causing timeouts (24 picks * 5-10 sec each = 2-4 min)
      const selectedProspect = topProspects[0]
      log(`BPA pick ${currentPick}: ${selectedProspect.name} (${selectedProspect.position})`)

      // Update the pick using RPC
      const { error: updateError } = await datalabAdmin.rpc('update_mock_draft_pick', {
        p_mock_id: mock_id,
        p_pick_number: currentPick,
        p_prospect_id: selectedProspect.prospect_id,
        p_prospect_name: selectedProspect.name,
        p_position: selectedProspect.position,
      })

      if (updateError) {
        log(`ERROR updating pick ${currentPick}: ${JSON.stringify(updateError)}`)
        // Continue anyway to try to advance
      } else {
        log(`Updated pick ${currentPick} with ${selectedProspect.name}`)
      }

      // Track picked prospect
      pickedProspectIds.push(selectedProspect.prospect_id)

      // Advance pick
      const { error: advanceError } = await datalabAdmin.rpc('advance_mock_draft_pick', {
        p_mock_id: mock_id,
      })

      if (advanceError) {
        log(`ERROR advancing from pick ${currentPick}: ${JSON.stringify(advanceError)}`)
      } else {
        log(`Advanced from pick ${currentPick} to ${currentPick + 1}`)
      }

      currentPick++
      iterations++
      picksAdvanced++
    }

    log(`Simulation complete: advanced ${picksAdvanced} picks, now at pick ${currentPick}`)

    // Get updated draft state
    const { data: updatedDraftData, error: updateFetchError } = await datalabAdmin.rpc('get_mock_draft', {
      p_mock_id: mock_id,
    })

    if (updateFetchError) {
      log(`ERROR fetching updated draft: ${JSON.stringify(updateFetchError)}`)
    }

    // Handle array response
    const updatedDraft = Array.isArray(updatedDraftData) ? updatedDraftData[0] : updatedDraftData

    if (!updatedDraft) {
      log(`ERROR: Could not fetch updated draft state`)
      // Return what we have
      return NextResponse.json({
        error: 'Draft advanced but failed to fetch updated state',
        debug: debugLog,
      }, { status: 500 })
    }

    const isComplete = updatedDraft.current_pick > updatedDraft.total_picks || updatedDraft.status === 'completed'

    log(`Final state: current_pick=${updatedDraft.current_pick}, total_picks=${updatedDraft.total_picks}, isComplete=${isComplete}`)

    // Debug: Log first few picks from RPC to see data structure
    const rawPicks = updatedDraft.picks || []
    log(`Raw picks count: ${rawPicks.length}`)
    if (rawPicks.length > 0) {
      log(`First raw pick keys: ${Object.keys(rawPicks[0]).join(', ')}`)
      log(`First 3 raw picks: ${JSON.stringify(rawPicks.slice(0, 3).map((p: any) => ({
        pick: p.pick_number,
        prospect_id: p.prospect_id,
        prospect_name: p.prospect_name,
        position: p.position,
        selected_prospect: p.selected_prospect,
      })))}`)
    }

    // Build response
    const picks = (updatedDraft.picks || []).map((p: any) => ({
      pick_number: p.pick_number,
      round: p.round,
      team_key: p.team_key,
      team_name: p.team_name,
      team_logo: p.team_logo,
      team_color: p.team_color,
      is_user_pick: p.is_user_pick,
      is_current: p.pick_number === updatedDraft.current_pick,
      selected_prospect: p.prospect_id ? {
        id: p.prospect_id,
        name: p.prospect_name,
        position: p.position,
      } : null,
    }))

    return NextResponse.json({
      draft: {
        id: mock_id,
        chicago_team: updatedDraft.chicago_team,
        sport: updatedDraft.sport,
        draft_year: updatedDraft.draft_year,
        status: isComplete ? 'completed' : 'in_progress',
        current_pick: updatedDraft.current_pick,
        total_picks: updatedDraft.total_picks,
        picks,
        user_picks: userPickNumbers,
      },
      picksAdvanced,
      debug: debugLog,
    })

  } catch (error) {
    console.error('Draft auto error:', error)
    debugLog.push(`EXCEPTION: ${String(error)}`)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/draft/auto',
        metadata: { debug: debugLog },
      })
    } catch {}
    return NextResponse.json({
      error: 'Failed to auto-advance draft',
      message: String(error),
      debug: debugLog
    }, { status: 500 })
  }
}
