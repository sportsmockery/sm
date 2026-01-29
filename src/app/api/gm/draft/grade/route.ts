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

    // Get user's picks
    const { data: userPicks } = await datalabAdmin
      .from('gm_mock_draft_picks')
      .select('*')
      .eq('mock_draft_id', mock_id)
      .eq('is_user_pick', true)
      .order('pick_number')

    if (!userPicks || userPicks.length === 0) {
      return NextResponse.json({ error: 'No picks to grade' }, { status: 400 })
    }

    // Get prospect details for grading context
    const prospectIds = userPicks.map((p: any) => p.prospect_id).filter(Boolean)
    let prospectsMap: Record<string, any> = {}

    if (prospectIds.length > 0) {
      const { data: prospects } = await datalabAdmin
        .from('gm_draft_prospects')
        .select('*')
        .in('prospect_id', prospectIds)

      if (prospects) {
        for (const p of prospects) {
          prospectsMap[p.prospect_id] = p
        }
      }
    }

    // Build grading prompt
    const picksDescription = userPicks.map((p: any) => {
      const prospect = prospectsMap[p.prospect_id] || {}
      return `Pick #${p.pick_number} (Round ${p.round}): ${p.prospect_name} (${p.prospect_position}) - ${prospect.school || 'Unknown'} - Rank: ${prospect.rank || 'N/A'} - Grade: ${prospect.grade || 'N/A'}`
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
      // Try to extract grade from text
      const gradeMatch = rawText.match(/(\d{1,3})/)
      if (gradeMatch) {
        gradeResult.overall_grade = Math.min(100, parseInt(gradeMatch[1]))
      }
      gradeResult.analysis = rawText.slice(0, 500)
    }

    // Update mock draft with grade
    await datalabAdmin
      .from('gm_mock_drafts')
      .update({
        status: 'graded',
        overall_grade: gradeResult.overall_grade,
        letter_grade: gradeResult.letter_grade,
        analysis: gradeResult.analysis,
        strengths: gradeResult.strengths,
        weaknesses: gradeResult.weaknesses,
        updated_at: new Date().toISOString(),
      })
      .eq('id', mock_id)

    // Update individual pick grades
    if (gradeResult.pick_grades && Array.isArray(gradeResult.pick_grades)) {
      for (const pg of gradeResult.pick_grades) {
        await datalabAdmin
          .from('gm_mock_draft_picks')
          .update({
            pick_grade: pg.grade,
            pick_analysis: pg.analysis,
          })
          .eq('mock_draft_id', mock_id)
          .eq('pick_number', pg.pick_number)
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
