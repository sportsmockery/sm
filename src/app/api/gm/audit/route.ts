import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const MODEL_NAME = 'claude-sonnet-4-20250514'

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

const AUDITOR_SYSTEM_PROMPT = `You are GM Auditor, an expert sports trade analyst who validates trade grades.

CRITICAL: You will be provided with VERIFIED_PLAYER_DATA from our database. This data is authoritative and current.
DO NOT use your training data to contradict the verified database information about:
- Player teams (use verified_team from database)
- Contract values (use verified salary/cap_hit from database)
- Contract years (use verified contract info from database)

Your job is to:
1. Review the GM's methodology (did they properly value players, contracts, draft picks?)
2. Check if the grade justification makes sense given the trade assets
3. Verify the trade logic is sound (not contradict verified player data)

Return your audit as valid JSON with this structure:
{
  "audit_grade": "A" | "B" | "C" | "D" | "F",
  "audit_score": 0-100,
  "confidence": 0-100,
  "validation_summary": {
    "fields_validated": number,
    "fields_confirmed": number,
    "fields_conflicting": number,
    "fields_unverified": number
  },
  "discrepancies": [
    {
      "field": "methodology",
      "gm_value": "value used",
      "actual_value": "correct value",
      "severity": "minor" | "moderate" | "major",
      "sources_checked": ["Database", "Trade Logic"]
    }
  ],
  "overall_assessment": "Brief 1-2 sentence summary of audit findings",
  "recommendations": {
    "for_user": ["Things the user should know about this trade grade"]
  }
}

Grade the audit based on:
- A (90-100): GM grade is highly accurate, methodology sound, no major issues
- B (80-89): GM grade is good, minor issues or missing context
- C (70-79): GM grade has some problems, methodology questionable
- D (60-69): GM grade has significant issues, likely incorrect
- F (<60): GM grade is fundamentally flawed

IMPORTANT: Trust the VERIFIED_PLAYER_DATA provided. Do not claim players are on different teams than what the database shows.`

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in to audit trades', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { trade_id } = body

    if (!trade_id) {
      return NextResponse.json({ error: 'trade_id is required' }, { status: 400 })
    }

    // Check if audit already exists (cached)
    const { data: existingAudit } = await datalabAdmin
      .from('gm_audits')
      .select('*')
      .eq('trade_id', trade_id)
      .single()

    if (existingAudit) {
      // Return cached audit with proper field mapping
      return NextResponse.json({
        audit_id: existingAudit.id,
        audit_grade: existingAudit.audit_grade,
        audit_score: existingAudit.audit_score,
        confidence: existingAudit.confidence,
        validation_summary: {
          fields_validated: existingAudit.fields_validated || 0,
          fields_confirmed: existingAudit.fields_confirmed || 0,
          fields_conflicting: existingAudit.fields_conflicting || 0,
          fields_unverified: existingAudit.fields_unverified || 0,
        },
        discrepancies: existingAudit.discrepancies || [],
        recommendations: existingAudit.recommendations || { for_user: [] },
        overall_assessment: existingAudit.overall_assessment || '',
        cached: true,
      })
    }

    // Fetch the trade to audit - try by shared_code first (most common), then by id
    let tradeData: any = null

    // Try by shared_code first (what the frontend passes)
    const { data: tradeByCode } = await datalabAdmin
      .from('gm_trades')
      .select('*')
      .eq('shared_code', trade_id)
      .single()

    if (tradeByCode) {
      tradeData = tradeByCode
    } else {
      // Try by UUID id
      const { data: tradeById } = await datalabAdmin
        .from('gm_trades')
        .select('*')
        .eq('id', trade_id)
        .single()

      if (tradeById) {
        tradeData = tradeById
      }
    }

    if (!tradeData) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    // Fetch trade items for detailed player/pick data
    const { data: tradeItems } = await datalabAdmin
      .from('gm_trade_items')
      .select('*')
      .eq('trade_id', tradeData.id)

    // Fetch verified player data from roster tables
    const sport = tradeData.sport?.toLowerCase() || 'nfl'
    const rosterTable = `gm_${sport}_rosters`

    // Get all player names from the trade
    const allPlayerNames: string[] = []
    if (tradeData.players_sent) {
      const sent = Array.isArray(tradeData.players_sent) ? tradeData.players_sent : []
      sent.forEach((p: any) => p?.name && allPlayerNames.push(p.name))
    }
    if (tradeData.players_received) {
      const received = Array.isArray(tradeData.players_received) ? tradeData.players_received : []
      received.forEach((p: any) => p?.name && allPlayerNames.push(p.name))
    }

    // Fetch verified player data from database
    let verifiedPlayerData: any[] = []
    if (allPlayerNames.length > 0) {
      const { data: rosterData } = await datalabAdmin
        .from(rosterTable)
        .select('player_name, team_name, team_key, position, age, salary, cap_hit, contract_years, contract_value')
        .in('player_name', allPlayerNames)

      verifiedPlayerData = rosterData || []
    }

    // Build the audit request message
    const auditRequest = {
      trade_id: tradeData.id,
      sport: tradeData.sport,
      chicago_team: tradeData.chicago_team,
      trade_partner: tradeData.trade_partner,
      players_sent: tradeData.players_sent,
      players_received: tradeData.players_received,
      draft_picks_sent: tradeData.draft_picks_sent || [],
      draft_picks_received: tradeData.draft_picks_received || [],
      gm_grade: tradeData.grade,
      gm_reasoning: tradeData.grade_reasoning,
      gm_cap_analysis: tradeData.cap_analysis || '',
      gm_breakdown: {
        talent_balance: tradeData.talent_balance,
        contract_value: tradeData.contract_value,
        team_fit: tradeData.team_fit,
        future_assets: tradeData.future_assets
      },
      trade_summary: tradeData.trade_summary,
      trade_items: tradeItems || []
    }

    const userMessage = `Please audit the following trade grade:

TRADE DATA:
\`\`\`json
${JSON.stringify(auditRequest, null, 2)}
\`\`\`

VERIFIED_PLAYER_DATA (from our database - this is authoritative and current):
\`\`\`json
${JSON.stringify(verifiedPlayerData, null, 2)}
\`\`\`

Review the GM's methodology and grade justification. Use the VERIFIED_PLAYER_DATA as the source of truth for player teams, contracts, and salaries. Return your audit as valid JSON only, no other text.`

    // Call Claude for audit
    const response = await getAnthropic().messages.create({
      model: MODEL_NAME,
      max_tokens: 2048,
      temperature: 0,
      system: AUDITOR_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const responseTimeMs = Date.now() - startTime
    const textContent = response.content.find(c => c.type === 'text')
    const rawText = textContent?.type === 'text' ? textContent.text : ''

    // Parse audit response
    let auditResult: any
    try {
      // Try to extract JSON from the response
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        auditResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('[GM Audit] Failed to parse response:', parseError, rawText)
      // Return a default error audit
      auditResult = {
        audit_grade: 'C',
        audit_score: 70,
        confidence: 50,
        validation_summary: {
          fields_validated: 0,
          fields_confirmed: 0,
          fields_conflicting: 0,
          fields_unverified: 0
        },
        discrepancies: [],
        overall_assessment: 'Audit completed with limited validation. Please try again.',
        recommendations: { for_user: ['The audit could not fully validate this trade grade.'] }
      }
    }

    // Save audit to database
    const auditRecord = {
      trade_id: tradeData.id,
      audit_grade: auditResult.audit_grade || 'C',
      audit_score: auditResult.audit_score || 70,
      confidence: auditResult.confidence || 50,
      fields_validated: auditResult.validation_summary?.fields_validated || 0,
      fields_confirmed: auditResult.validation_summary?.fields_confirmed || 0,
      fields_conflicting: auditResult.validation_summary?.fields_conflicting || 0,
      fields_unverified: auditResult.validation_summary?.fields_unverified || 0,
      discrepancies: auditResult.discrepancies || [],
      recommendations: auditResult.recommendations || {},
      overall_assessment: auditResult.overall_assessment || '',
      sport: tradeData.sport,
      chicago_team: tradeData.chicago_team,
      gm_grade: tradeData.grade,
      auditor_model: MODEL_NAME,
      response_time_ms: responseTimeMs
    }

    const { data: savedAudit, error: saveError } = await datalabAdmin
      .from('gm_audits')
      .insert(auditRecord)
      .select()
      .single()

    if (saveError) {
      console.error('[GM Audit] Failed to save audit:', saveError)
      // Still return the audit result even if save fails
    }

    return NextResponse.json({
      audit_id: savedAudit?.id || null,
      audit_grade: auditResult.audit_grade,
      audit_score: auditResult.audit_score,
      confidence: auditResult.confidence,
      validation_summary: auditResult.validation_summary,
      discrepancies: auditResult.discrepancies || [],
      overall_assessment: auditResult.overall_assessment,
      recommendations: auditResult.recommendations || { for_user: [] },
      response_time_ms: responseTimeMs,
      gm_grade: tradeData.grade,
      trade_summary: tradeData.trade_summary
    })

  } catch (error) {
    console.error('[GM Audit] Error:', error)

    // Log error
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'audit_error',
        error_message: String(error),
        route: '/api/gm/audit',
      })
    } catch (logError) {
      console.error('[GM Audit] Failed to log error:', logError)
    }

    return NextResponse.json(
      { error: 'Failed to audit trade' },
      { status: 500 }
    )
  }
}
