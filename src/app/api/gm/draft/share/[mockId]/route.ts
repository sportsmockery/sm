import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mockId: string }> }
) {
  try {
    const { mockId } = await params

    if (!mockId) {
      return NextResponse.json({ error: 'Mock draft ID required' }, { status: 400 })
    }

    // Fetch the mock draft with its grade data
    const { data: draft, error: draftError } = await datalabAdmin
      .from('gm_mock_drafts')
      .select(`
        id,
        chicago_team,
        sport,
        draft_year,
        status,
        mock_score,
        mock_grade_letter,
        feedback_json,
        created_at
      `)
      .eq('id', mockId)
      .single()

    if (draftError || !draft) {
      console.error('[MockDraftShare] Error fetching draft:', draftError)
      return NextResponse.json({ error: 'Mock draft not found' }, { status: 404 })
    }

    // Fetch the picks for this draft
    const { data: picks, error: picksError } = await datalabAdmin
      .from('gm_mock_draft_picks')
      .select(`
        pick_number,
        team_key,
        team_name,
        is_user_pick,
        prospect_name,
        prospect_position,
        prospect_school
      `)
      .eq('mock_id', mockId)
      .order('pick_number', { ascending: true })

    if (picksError) {
      console.error('[MockDraftShare] Error fetching picks:', picksError)
    }

    // Parse the feedback_json to get grade details
    let analysis = ''
    let pickGrades: Array<{ pick_number: number; prospect_name: string; grade: number; analysis: string }> = []
    let strengths: string[] = []
    let weaknesses: string[] = []

    if (draft.feedback_json) {
      try {
        const feedback = typeof draft.feedback_json === 'string'
          ? JSON.parse(draft.feedback_json)
          : draft.feedback_json

        analysis = feedback.analysis || feedback.overall_analysis || ''
        pickGrades = feedback.pick_grades || []
        strengths = feedback.strengths || []
        weaknesses = feedback.weaknesses || feedback.areas_to_improve || []
      } catch (e) {
        console.error('[MockDraftShare] Error parsing feedback:', e)
      }
    }

    // Format picks with prospect info
    const formattedPicks = (picks || []).map(pick => ({
      pick_number: pick.pick_number,
      team_name: pick.team_name,
      is_user_pick: pick.is_user_pick,
      selected_prospect: pick.prospect_name ? {
        name: pick.prospect_name,
        position: pick.prospect_position || '',
        school: pick.prospect_school || '',
      } : undefined,
    }))

    return NextResponse.json({
      draft: {
        id: draft.id,
        chicago_team: draft.chicago_team,
        sport: draft.sport,
        draft_year: draft.draft_year,
        status: draft.status,
        overall_grade: draft.mock_score,
        letter_grade: draft.mock_grade_letter,
        analysis,
        pick_grades: pickGrades,
        strengths,
        weaknesses,
        picks: formattedPicks,
        created_at: draft.created_at,
      },
    })
  } catch (error) {
    console.error('[MockDraftShare] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
