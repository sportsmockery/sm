import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const MODEL_NAME = 'claude-sonnet-4-20250514'

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

const GRADE_SYSTEM_PROMPT = `You are an expert draft analyst grading a user's mock draft performance. Evaluate their picks based on:

1. Value - Did they reach for players or get good value?
2. Team Fit - Do the picks address team needs?
3. Best Player Available - Did they balance BPA vs need?
4. Position Value - Did they prioritize premium positions?

Grade on a 0-100 scale where:
- 90-100: Elite draft, franchise-changing picks
- 80-89: Excellent, multiple high-value picks
- 70-79: Good, solid picks with minor reaches
- 60-69: Average, some good picks but also some questionable ones
- 50-59: Below average, multiple reaches or bad fits
- Below 50: Poor draft

Respond with ONLY valid JSON:
{
  "overall_grade": <number 0-100>,
  "letter_grade": "<A+, A, A-, B+, B, B-, C+, C, C-, D, F>",
  "analysis": "<2-3 sentence overall analysis>",
  "pick_grades": [
    {
      "pick_number": <number>,
      "prospect_name": "<name>",
      "grade": <number 0-100>,
      "analysis": "<1 sentence>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"]
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

    // Get user's picks
    const userPicks = (mockDraft.picks || []).filter((p: any) => p.is_user_pick && p.prospect_id)

    if (userPicks.length === 0) {
      return NextResponse.json({ error: 'No picks to grade' }, { status: 400 })
    }

    // Build grading prompt
    const picksDescription = userPicks.map((p: any) => {
      return `Pick #${p.pick_number} (Round ${p.round}): ${p.prospect_name} (${p.position})`
    }).join('\n')

    const teamDisplayNames: Record<string, string> = {
      bears: 'Chicago Bears', bulls: 'Chicago Bulls', blackhawks: 'Chicago Blackhawks',
      cubs: 'Chicago Cubs', whitesox: 'Chicago White Sox',
    }

    const prompt = `
Mock Draft: ${mockDraft.sport.toUpperCase()} ${mockDraft.draft_year}
Team: ${teamDisplayNames[mockDraft.chicago_team] || mockDraft.chicago_team}

User's Picks:
${picksDescription}

Grade this mock draft performance.`

    const response = await getAnthropic().messages.create({
      model: MODEL_NAME,
      max_tokens: 1024,
      system: GRADE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = response.content.find(c => c.type === 'text')
    const rawText = textContent?.type === 'text' ? textContent.text : ''

    let gradeResult: any = {
      overall_grade: 70,
      letter_grade: 'C+',
      analysis: 'Draft analysis unavailable.',
      pick_grades: [],
      strengths: [],
      weaknesses: [],
    }

    try {
      gradeResult = JSON.parse(rawText)
    } catch {
      const gradeMatch = rawText.match(/(\d{1,3})/)
      if (gradeMatch) {
        gradeResult.overall_grade = Math.min(100, parseInt(gradeMatch[1]))
      }
      gradeResult.analysis = rawText.slice(0, 500)
    }

    // Complete the mock draft using RPC
    const { error: completeError } = await datalabAdmin.rpc('complete_mock_draft', {
      p_mock_id: mock_id,
      p_overall_grade: gradeResult.overall_grade,
      p_chicago_grade: gradeResult.overall_grade, // Use same grade for chicago grade
      p_realism_score: null,
    })

    if (completeError) {
      console.error('Complete mock draft RPC error:', completeError)
      // Non-fatal - grade was calculated, just couldn't save status
    }

    // Update individual pick grades using RPC (if we have them)
    if (gradeResult.pick_grades && Array.isArray(gradeResult.pick_grades)) {
      for (const pg of gradeResult.pick_grades) {
        try {
          await datalabAdmin.rpc('update_mock_draft_pick', {
            p_mock_id: mock_id,
            p_pick_number: pg.pick_number,
            p_prospect_id: null, // Don't update prospect
            p_prospect_name: null,
            p_position: null,
            p_pick_grade: pg.grade,
            p_commentary: pg.analysis,
          })
        } catch {}
      }
    }

    return NextResponse.json({
      grade: {
        overall_grade: gradeResult.overall_grade,
        letter_grade: gradeResult.letter_grade,
        analysis: gradeResult.analysis,
        pick_grades: gradeResult.pick_grades || [],
        strengths: gradeResult.strengths || [],
        weaknesses: gradeResult.weaknesses || [],
      },
    })

  } catch (error) {
    console.error('Draft grade error:', error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/draft/grade'
      })
    } catch {}
    return NextResponse.json({ error: 'Failed to grade draft' }, { status: 500 })
  }
}
