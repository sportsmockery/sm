import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const DATALAB_URL = process.env.DATALAB_URL || 'https://datalab.sportsmockery.com'

export async function POST(request: NextRequest) {
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
      // Return cached audit
      return NextResponse.json({
        audit_id: existingAudit.id,
        audit_grade: existingAudit.audit_grade,
        audit_score: existingAudit.audit_score,
        confidence: existingAudit.confidence,
        validation_summary: existingAudit.validation_summary,
        discrepancies: existingAudit.discrepancies || [],
        recommendations: existingAudit.recommendations || {},
        overall_assessment: existingAudit.overall_assessment,
        cached: true,
      })
    }

    // Call Datalab audit endpoint
    const startTime = Date.now()
    const auditResponse = await fetch(`${DATALAB_URL}/api/gm/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trade_id }),
    })

    if (!auditResponse.ok) {
      const errorText = await auditResponse.text()
      console.error('[GM Audit] Datalab error:', errorText)
      return NextResponse.json(
        { error: 'Audit service unavailable' },
        { status: 502 }
      )
    }

    const auditResult = await auditResponse.json()
    const responseTime = Date.now() - startTime

    // Log the audit request
    try {
      await datalabAdmin.from('gm_audit_logs').insert({
        trade_id,
        user_id: user.id,
        audit_grade: auditResult.audit_grade,
        audit_score: auditResult.audit_score,
        response_time_ms: responseTime,
        created_at: new Date().toISOString(),
      })
    } catch (logError) {
      console.error('[GM Audit] Failed to log audit:', logError)
    }

    return NextResponse.json({
      ...auditResult,
      response_time_ms: responseTime,
    })

  } catch (error) {
    console.error('[GM Audit] Error:', error)

    // Log error
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
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
