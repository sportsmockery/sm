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
    const { mock_id, prospect_id, pick_number } = body

    if (!mock_id || !prospect_id) {
      return NextResponse.json({ error: 'mock_id and prospect_id are required' }, { status: 400 })
    }

    // Get the mock draft
    const { data: mockDraft, error: mockError } = await datalabAdmin
      .from('gm_mock_drafts')
      .select('*')
      .eq('id', mock_id)
      .single()

    if (mockError || !mockDraft) {
      return NextResponse.json({ error: 'Mock draft not found' }, { status: 404 })
    }

    // Verify ownership
    if (mockDraft.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get the prospect details
    const { data: prospect, error: prospectError } = await datalabAdmin
      .from('gm_draft_prospects')
      .select('*')
      .eq('prospect_id', prospect_id)
      .single()

    if (prospectError || !prospect) {
      // Try by id if prospect_id doesn't work
      const { data: prospectById } = await datalabAdmin
        .from('gm_draft_prospects')
        .select('*')
        .eq('id', prospect_id)
        .single()

      if (!prospectById) {
        return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })
      }
      Object.assign(prospect || {}, prospectById)
    }

    const actualPickNumber = pick_number || mockDraft.current_pick

    // Update the pick with selected prospect
    const { error: updateError } = await datalabAdmin
      .from('gm_mock_draft_picks')
      .update({
        prospect_id,
        prospect_name: prospect?.name,
        prospect_position: prospect?.position,
      })
      .eq('mock_draft_id', mock_id)
      .eq('pick_number', actualPickNumber)

    if (updateError) {
      console.error('Pick update error:', updateError)
      throw new Error('Failed to update pick')
    }

    // Find the next pick number
    const nextPick = actualPickNumber + 1

    // Check if draft is complete
    const isComplete = nextPick > mockDraft.total_picks

    // Update mock draft status and current pick
    await datalabAdmin
      .from('gm_mock_drafts')
      .update({
        current_pick: isComplete ? mockDraft.total_picks : nextPick,
        status: isComplete ? 'completed' : 'in_progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', mock_id)

    // Get updated picks
    const { data: picks } = await datalabAdmin
      .from('gm_mock_draft_picks')
      .select('*')
      .eq('mock_draft_id', mock_id)
      .order('pick_number')

    // Get prospect details for picked players
    const pickedProspectIds = (picks || [])
      .filter((p: any) => p.prospect_id)
      .map((p: any) => p.prospect_id)

    let prospectsMap: Record<string, any> = {}
    if (pickedProspectIds.length > 0) {
      const { data: pickedProspects } = await datalabAdmin
        .from('gm_draft_prospects')
        .select('*')
        .in('prospect_id', pickedProspectIds)

      if (pickedProspects) {
        for (const p of pickedProspects) {
          prospectsMap[p.prospect_id] = p
        }
      }
    }

    // Build response
    const picksWithDetails = (picks || []).map((p: any) => ({
      pick_number: p.pick_number,
      round: p.round,
      team_key: p.team_key,
      team_name: p.team_name,
      team_logo: p.team_logo,
      team_color: p.team_color,
      is_user_pick: p.is_user_pick,
      is_current: p.pick_number === (isComplete ? mockDraft.total_picks : nextPick),
      selected_prospect: p.prospect_id ? {
        id: p.prospect_id,
        name: p.prospect_name || prospectsMap[p.prospect_id]?.name,
        position: p.prospect_position || prospectsMap[p.prospect_id]?.position,
        school: prospectsMap[p.prospect_id]?.school,
      } : null,
    }))

    return NextResponse.json({
      draft: {
        id: mock_id,
        chicago_team: mockDraft.chicago_team,
        sport: mockDraft.sport,
        draft_year: mockDraft.draft_year,
        status: isComplete ? 'completed' : 'in_progress',
        current_pick: isComplete ? mockDraft.total_picks : nextPick,
        total_picks: mockDraft.total_picks,
        picks: picksWithDetails,
        user_picks: picksWithDetails.filter((p: any) => p.is_user_pick).map((p: any) => p.pick_number),
      },
    })

  } catch (error) {
    console.error('Draft pick error:', error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/draft/pick'
      })
    } catch {}
    return NextResponse.json({ error: 'Failed to submit pick' }, { status: 500 })
  }
}
