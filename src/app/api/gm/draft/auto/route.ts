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
      return NextResponse.json({ error: 'Mock draft not found' }, { status: 404 })
    }

    // RPC can return array or single object depending on function definition
    const mockDraft = Array.isArray(mockDraftData) ? mockDraftData[0] : mockDraftData

    if (!mockDraft) {
      log(`Mock draft not found for id: ${mock_id}, data was: ${JSON.stringify(mockDraftData)}`)
      return NextResponse.json({ error: 'Mock draft not found' }, { status: 404 })
    }

    log(`Mock draft found: sport=${mockDraft.sport}, year=${mockDraft.draft_year}, current_pick=${mockDraft.current_pick}`)

    // Verify ownership
    if (mockDraft.user_id !== user.id) {
      log(`Ownership mismatch: stored=${mockDraft.user_id}, current=${user.id}`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const allPicks = mockDraft.picks || []
    let currentPick = mockDraft.current_pick

    // Sorted list of real pick numbers — used to advance across gaps
    // (e.g. NBA round 1 ends at 30, round 2 picks are 42/50/55/58).
    const sortedPickNumbers: number[] = allPicks
      .map((p: any) => p.pick_number)
      .sort((a: number, b: number) => a - b)
    const lastPickNumber = sortedPickNumbers[sortedPickNumbers.length - 1] ?? mockDraft.total_picks
    const getNextPickNumber = (current: number): number | null => {
      const next = sortedPickNumbers.find((pn: number) => pn > current)
      return next ?? null
    }

    log(`Total picks in draft: ${allPicks.length}, current_pick: ${currentPick}`)

    // Find next user pick
    const userPickNumbers = allPicks.filter((p: any) => p.is_user_pick).map((p: any) => p.pick_number)
    const nextUserPick = userPickNumbers.find((pn: number) => pn >= currentPick) || (lastPickNumber + 1)

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
        selected_prospect: (p.prospect_id && p.prospect_id !== 'pending' && p.prospect_name) ? {
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
      })
    }

    // Get available prospects (not yet picked)
    // Check for BOTH prospect_id AND prospect_name to determine if actually picked
    // The get_mock_draft RPC may return default/placeholder values for prospect_id
    const pickedProspectIds = allPicks
      .filter((p: any) => p.prospect_id && p.prospect_id !== 'pending' && p.prospect_name && p.prospect_name !== 'null' && p.prospect_name !== '')
      .map((p: any) => String(p.prospect_id))

    log(`Already picked prospect IDs: ${pickedProspectIds.length} picks made`)
    // Debug: show first pick's prospect data to understand the structure
    if (allPicks.length > 0) {
      const firstPick = allPicks[0]
      log(`First pick prospect data: prospect_id=${firstPick.prospect_id} (type: ${typeof firstPick.prospect_id}), prospect_name=${firstPick.prospect_name}`)
    }

    // Use draft_prospects table with league column (uppercase: NFL, NBA, etc.)
    const league = SPORT_TO_LEAGUE[mockDraft.sport?.toLowerCase()] || mockDraft.sport?.toUpperCase()

    log(`Fetching prospects for league=${league}, year=${mockDraft.draft_year}`)

    const { data: availableProspects, error: prospectError } = await datalabAdmin
      .from('draft_prospects')
      .select('*')
      .eq('league', league)
      .eq('draft_year', mockDraft.draft_year)
      .order('big_board_rank', { ascending: true })
      .limit(Math.min(mockDraft.total_picks, 1000))

    if (prospectError) {
      log(`Prospects fetch error: ${JSON.stringify(prospectError)}`)
      return NextResponse.json({
        error: `Failed to fetch prospects: ${prospectError.message}`,
      }, { status: 500 })
    }

    log(`Fetched ${availableProspects?.length || 0} prospects from database`)

    if (!availableProspects || availableProspects.length === 0) {
      log(`No prospects found for ${league} ${mockDraft.draft_year}`)
      return NextResponse.json({
        error: `No prospects available for ${league} ${mockDraft.draft_year}. Database may not have prospect data.`,
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
      log('All prospects already picked, will advance without selections')
    }

    // Simulate picks until we reach the user's pick or end of draft
    const maxIterations = Math.min(sortedPickNumbers.length, 100)
    let iterations = 0
    let picksAdvanced = 0

    // Track picks locally since get_mock_draft RPC may not return updated prospect data
    const localPicksMap: Record<number, { prospect_id: string; prospect_name: string; position: string }> = {}

    log(`Starting simulation loop: maxIterations=${maxIterations}, from pick ${currentPick} to ${nextUserPick}`)

    while (currentPick < nextUserPick && iterations < maxIterations) {
      const pickData = allPicks.find((p: any) => p.pick_number === currentPick)

      if (!pickData) {
        // current_pick references a slot that doesn't exist (e.g. left at 31 in NBA where
        // picks jump from 30 to 42). Skip forward to the next real pick number.
        const fallbackNext = getNextPickNumber(currentPick - 1) ?? getNextPickNumber(currentPick)
        if (fallbackNext === null || fallbackNext >= nextUserPick) {
          log(`No more picks before user pick ${nextUserPick} (current=${currentPick}), stopping`)
          await datalabAdmin
            .from('gm_mock_drafts')
            .update({
              current_pick: fallbackNext ?? currentPick,
              status: fallbackNext === null ? 'completed' : 'in_progress',
              updated_at: new Date().toISOString(),
            })
            .eq('id', mock_id)
          if (fallbackNext !== null) currentPick = fallbackNext
          break
        }
        log(`Skipping non-existent pick ${currentPick} → ${fallbackNext}`)
        currentPick = fallbackNext
        continue
      }

      if (pickData.is_user_pick) {
        log(`Reached user pick at ${currentPick}, stopping`)
        // Make sure DB current_pick matches
        if (mockDraft.current_pick !== currentPick) {
          await datalabAdmin
            .from('gm_mock_drafts')
            .update({ current_pick: currentPick, updated_at: new Date().toISOString() })
            .eq('id', mock_id)
        }
        break
      }

      log(`Processing pick ${currentPick}: ${pickData.team_name}`)

      // Get top available prospects (that haven't been picked yet in this session)
      const topProspects = filteredProspects
        .filter((p: any) => !pickedProspectIds.includes(p.prospect_id))
        .slice(0, 10)

      if (topProspects.length > 0) {
        // Use BPA (Best Player Available) - AI picks disabled for speed
        const selectedProspect = topProspects[0]
        log(`BPA pick ${currentPick}: ${selectedProspect.name} (${selectedProspect.position})`)

        // Update the pick directly in the database
        const { error: updateError } = await datalabAdmin
          .from('gm_mock_draft_picks')
          .update({
            prospect_id: String(selectedProspect.prospect_id),
            prospect_name: selectedProspect.name,
          })
          .eq('mock_id', mock_id)
          .eq('pick_number', currentPick)

        if (updateError) {
          log(`ERROR updating pick ${currentPick}: ${JSON.stringify(updateError)}`)
        } else {
          log(`Updated pick ${currentPick} with ${selectedProspect.name}`)
        }

        // Store locally for response
        localPicksMap[currentPick] = {
          prospect_id: selectedProspect.prospect_id,
          prospect_name: selectedProspect.name,
          position: selectedProspect.position,
        }

        // Track picked prospect
        pickedProspectIds.push(selectedProspect.prospect_id)
      } else {
        log(`No more prospects at pick ${currentPick}, advancing without selection`)
      }

      // Advance to the next real pick number (handles gaps in pick_number sequence)
      const nextPickNumber = getNextPickNumber(currentPick)
      const isNowComplete = nextPickNumber === null
      const newCurrentPick = nextPickNumber ?? currentPick
      const { error: advanceError } = await datalabAdmin
        .from('gm_mock_drafts')
        .update({
          current_pick: newCurrentPick,
          status: isNowComplete ? 'completed' : 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', mock_id)

      if (advanceError) {
        log(`ERROR advancing from pick ${currentPick}: ${JSON.stringify(advanceError)}`)
      } else {
        log(`Advanced from pick ${currentPick} to ${newCurrentPick}${isNowComplete ? ' (complete)' : ''}`)
      }

      iterations++
      picksAdvanced++

      if (isNowComplete) break
      currentPick = newCurrentPick
    }

    log(`Local picks tracked: ${Object.keys(localPicksMap).length}`)

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
      }, { status: 500 })
    }

    // Completion: status flag set during loop OR current_pick has no successor in the
    // pick list (so e.g. current_pick=58 in NBA with last pick=58 means done after a pick).
    const isComplete = updatedDraft.status === 'completed' || getNextPickNumber(updatedDraft.current_pick - 1) === null

    log(`Final state: current_pick=${updatedDraft.current_pick}, total_picks=${updatedDraft.total_picks}, isComplete=${isComplete}`)

    // Debug: Log first few picks from RPC to see data structure
    const rawPicks = updatedDraft.picks || []
    log(`Raw picks count: ${rawPicks.length}`)
    if (rawPicks.length > 0) {
      const firstPick = rawPicks[0]
      log(`First raw pick keys: ${Object.keys(firstPick).join(', ')}`)
      // Log complete first pick to see full structure
      log(`First pick FULL: ${JSON.stringify(firstPick)}`)
      // Check if prospect_id is being set
      const picksWithProspectId = rawPicks.filter((p: any) => p.prospect_id).length
      log(`Picks with prospect_id: ${picksWithProspectId}`)
      // Show picks 1-5 prospect data specifically
      log(`Picks 1-5 prospect data: ${JSON.stringify(rawPicks.slice(0, 5).map((p: any) => ({
        pick: p.pick_number,
        has_prospect_id: !!p.prospect_id,
        prospect_id: p.prospect_id,
        prospect_name: p.prospect_name,
      })))}`)
    }

    // Build response - merge locally tracked picks with RPC data
    // This is a workaround for get_mock_draft RPC not returning updated prospect data
    const picks = (updatedDraft.picks || []).map((p: any) => {
      const localPick = localPicksMap[p.pick_number]

      // Use local data if available, otherwise try RPC data
      const prospectId = localPick?.prospect_id || p.prospect_id
      const prospectName = localPick?.prospect_name || p.prospect_name
      const position = localPick?.position || p.position

      const hasProspect = prospectId && prospectId !== 'pending' && prospectName

      return {
        pick_number: p.pick_number,
        round: p.round,
        team_key: p.team_key,
        team_name: p.team_name,
        team_logo: p.team_logo,
        team_color: p.team_color,
        is_user_pick: p.is_user_pick,
        is_current: p.pick_number === updatedDraft.current_pick,
        selected_prospect: hasProspect ? {
          id: prospectId,
          name: prospectName,
          position: position,
        } : null,
      }
    })

    // Debug: verify the final picks have selected_prospect
    const picksWithSelectedProspect = picks.filter((p: any) => p.selected_prospect !== null).length
    log(`Final picks with selected_prospect: ${picksWithSelectedProspect} (using local data: ${Object.keys(localPicksMap).length})`)
    log(`First 5 final picks: ${JSON.stringify(picks.slice(0, 5).map((p: any) => ({
      pick: p.pick_number,
      hasProspect: p.selected_prospect !== null,
      prospectName: p.selected_prospect?.name,
    })))}`)

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
        metadata: {},
      })
    } catch {}
    return NextResponse.json({
      error: 'Failed to auto-advance draft',
      message: String(error),
    }, { status: 500 })
  }
}
