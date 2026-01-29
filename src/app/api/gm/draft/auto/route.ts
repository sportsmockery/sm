import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const MODEL_NAME = 'claude-sonnet-4-20250514'

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

const DRAFT_AI_SYSTEM = `You are an AI simulating NFL/NBA/NHL/MLB draft picks for teams. Given the current draft state and available prospects, select the most realistic pick for the team on the clock.

Consider:
1. Team needs and roster holes
2. Best player available (BPA) strategy
3. Position value in that sport
4. Prospect grade/ranking

Respond with ONLY valid JSON:
{
  "prospect_id": "<id of selected prospect>",
  "reasoning": "<1 sentence explanation>"
}

Do not wrap in markdown code blocks. Just raw JSON.`

export async function POST(request: NextRequest) {
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

    // Get the mock draft using RPC
    const { data: mockDraft, error: mockError } = await datalabAdmin.rpc('get_mock_draft', {
      p_mock_id: mock_id,
    })

    if (mockError || !mockDraft) {
      return NextResponse.json({ error: 'Mock draft not found' }, { status: 404 })
    }

    // Verify ownership
    if (mockDraft.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const allPicks = mockDraft.picks || []
    let currentPick = mockDraft.current_pick

    // Find next user pick
    const userPickNumbers = allPicks.filter((p: any) => p.is_user_pick).map((p: any) => p.pick_number)
    const nextUserPick = userPickNumbers.find((pn: number) => pn >= currentPick) || mockDraft.total_picks + 1

    // Get available prospects (not yet picked)
    const pickedProspectIds = allPicks
      .filter((p: any) => p.prospect_id)
      .map((p: any) => p.prospect_id)

    const { data: availableProspects } = await datalabAdmin
      .from('gm_draft_prospects')
      .select('*')
      .eq('sport', mockDraft.sport)
      .eq('draft_year', mockDraft.draft_year)
      .order('rank', { ascending: true })
      .limit(100)

    const filteredProspects = (availableProspects || []).filter(
      (p: any) => !pickedProspectIds.includes(p.prospect_id)
    )

    if (filteredProspects.length === 0) {
      return NextResponse.json({ error: 'No prospects available' }, { status: 400 })
    }

    // Simulate picks until we reach the user's pick or end of draft
    const maxIterations = Math.min(nextUserPick - currentPick, 50)
    let iterations = 0

    while (currentPick < nextUserPick && currentPick <= mockDraft.total_picks && iterations < maxIterations) {
      const currentPickData = allPicks.find((p: any) => p.pick_number === currentPick)

      if (!currentPickData || currentPickData.is_user_pick) {
        break
      }

      // Get top available prospects
      const topProspects = filteredProspects
        .filter((p: any) => !pickedProspectIds.includes(p.prospect_id))
        .slice(0, 10)

      if (topProspects.length === 0) break

      let selectedProspect = topProspects[0] // Default to BPA

      // For first round, use AI for more realistic simulation
      if (currentPickData.round === 1 && topProspects.length > 1) {
        try {
          const prompt = `
Draft: ${mockDraft.sport.toUpperCase()} ${mockDraft.draft_year}
Pick #${currentPick} (Round ${currentPickData.round})
Team: ${currentPickData.team_name}

Available prospects (top 10):
${topProspects.map((p: any, i: number) => `${i + 1}. ID: ${p.prospect_id} - ${p.name} (${p.position}) - ${p.school} - Grade: ${p.grade || 'N/A'} - Rank: ${p.rank}`).join('\n')}

Select the most realistic pick for ${currentPickData.team_name}. Return the prospect_id.`

          const response = await getAnthropic().messages.create({
            model: MODEL_NAME,
            max_tokens: 256,
            system: DRAFT_AI_SYSTEM,
            messages: [{ role: 'user', content: prompt }],
          })

          const textContent = response.content.find(c => c.type === 'text')
          const rawText = textContent?.type === 'text' ? textContent.text : ''

          try {
            const parsed = JSON.parse(rawText)
            const aiSelectedProspect = topProspects.find((p: any) =>
              p.prospect_id === parsed.prospect_id
            )
            if (aiSelectedProspect) {
              selectedProspect = aiSelectedProspect
            }
          } catch {
            // Use BPA if AI response is invalid
          }
        } catch (e) {
          console.error('AI pick error:', e)
        }
      }

      // Update the pick using RPC
      await datalabAdmin.rpc('update_mock_draft_pick', {
        p_mock_id: mock_id,
        p_pick_number: currentPick,
        p_prospect_id: selectedProspect.prospect_id,
        p_prospect_name: selectedProspect.name,
        p_position: selectedProspect.position,
      })

      // Track picked prospect
      pickedProspectIds.push(selectedProspect.prospect_id)

      // Advance pick
      await datalabAdmin.rpc('advance_mock_draft_pick', {
        p_mock_id: mock_id,
      })

      currentPick++
      iterations++
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
        current_pick: updatedDraft?.current_pick,
        total_picks: updatedDraft?.total_picks,
        picks,
        user_picks: userPickNumbers,
      },
    })

  } catch (error) {
    console.error('Draft auto error:', error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/draft/auto'
      })
    } catch {}
    return NextResponse.json({ error: 'Failed to auto-advance draft' }, { status: 500 })
  }
}
