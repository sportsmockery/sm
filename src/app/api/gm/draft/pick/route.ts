import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to use Mock Draft', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    const body = await request.json()
    const { mock_id, prospect_id, pick_number, prospect_name, position, pick_grade } = body

    if (!mock_id || !prospect_id) {
      return NextResponse.json({ error: 'mock_id and prospect_id are required' }, { status: 400 })
    }

    // Get the mock draft to verify ownership and get current state
    const { data: mockDraftData, error: mockError } = await datalabAdmin.rpc('get_mock_draft', {
      p_mock_id: mock_id,
    })

    if (mockError) {
      console.error('get_mock_draft RPC error:', mockError)
      return NextResponse.json({ error: 'Mock draft not found' }, { status: 404 })
    }

    // RPC can return array or single object depending on function definition
    const mockDraft = Array.isArray(mockDraftData) ? mockDraftData[0] : mockDraftData

    if (!mockDraft) {
      console.error('Mock draft not found for id:', mock_id)
      return NextResponse.json({ error: 'Mock draft not found' }, { status: 404 })
    }

    // Verify ownership
    if (mockDraft.user_id !== user.id) {
      console.error('Ownership mismatch:', { stored: mockDraft.user_id, current: user.id })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const actualPickNumber = pick_number || mockDraft.current_pick

    // Use prospect details directly from request - no need to join to draft_prospects table
    // The draft_picks table has denormalized data: prospect_name, position, prospect_id
    const prospectName = prospect_name || 'Unknown'
    const prospectPosition = position || 'Unknown'

    // Update the pick directly in the database (bypassing problematic RPC)
    const { error: updateError } = await datalabAdmin
      .from('gm_mock_draft_picks')
      .update({
        prospect_id: String(prospect_id),
        prospect_name: prospectName,
      })
      .eq('mock_draft_id', mock_id)
      .eq('pick_number', actualPickNumber)

    if (updateError) {
      console.error('Update pick error:', updateError)
      throw new Error(`Failed to update pick: ${updateError.message}`)
    }

    // Advance to next pick by updating current_pick in the mock draft
    const nextPick = actualPickNumber + 1
    const isNowComplete = nextPick > mockDraft.total_picks

    const { error: advanceError } = await datalabAdmin
      .from('gm_mock_drafts')
      .update({
        current_pick: nextPick,
        status: isNowComplete ? 'completed' : 'in_progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', mock_id)

    if (advanceError) {
      console.error('Advance pick error:', advanceError)
      // Non-fatal - pick was saved, just couldn't advance
    }

    // Get updated draft state
    const { data: updatedDraft } = await datalabAdmin.rpc('get_mock_draft', {
      p_mock_id: mock_id,
    })

    const isComplete = updatedDraft?.current_pick > updatedDraft?.total_picks || updatedDraft?.status === 'completed'

    // Build response
    const picks = (updatedDraft?.picks || []).map((p: any) => ({
      pick_number: p.pick_number,
      round: p.round,
      team_key: p.team_key,
      team_name: p.team_name,
      team_logo: p.team_logo,
      team_color: p.team_color,
      is_user_pick: p.is_user_pick,
      is_current: p.pick_number === updatedDraft?.current_pick,
      selected_prospect: p.prospect_id ? {
        id: p.prospect_id,
        name: p.prospect_name,
        position: p.position,
      } : null,
    }))

    return NextResponse.json({
      draft: {
        id: mock_id,
        chicago_team: updatedDraft?.chicago_team,
        sport: updatedDraft?.sport,
        draft_year: updatedDraft?.draft_year,
        status: isComplete ? 'completed' : 'in_progress',
        current_pick: updatedDraft?.current_pick || actualPickNumber + 1,
        total_picks: updatedDraft?.total_picks,
        picks,
        user_picks: picks.filter((p: any) => p.is_user_pick).map((p: any) => p.pick_number),
      },
    })

  } catch (error) {
    console.error('Draft pick error:', error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: errorMsg,
        route: '/api/gm/draft/pick'
      })
    } catch {}
    // Return more detailed error to help debug
    return NextResponse.json({ error: `Failed to submit pick: ${errorMsg}` }, { status: 500 })
  }
}
