import { NextRequest, NextResponse } from 'next/server'
import { verifyCronSecret } from '@/lib/admin-auth'
import { generateExecIqInsights } from '@/lib/exec-iq'

export const maxDuration = 120
export const dynamic = 'force-dynamic'

function deriveBaseUrl(request: NextRequest): string {
  const explicit = process.env.EXEC_IQ_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/+$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  const host = request.headers.get('host')
  if (host) return `https://${host}`
  return 'https://test.sportsmockery.com'
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const baseUrl = deriveBaseUrl(request)
  const range = request.nextUrl.searchParams.get('range') || 'this-week'
  const result = await generateExecIqInsights({ baseUrl, range })
  if (!result.ok) {
    console.error('[exec-iq cron] failed:', result.error)
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }
  return NextResponse.json({
    ok: true,
    insightId: result.insightId,
    range,
    summary: result.insights.summary,
    count: result.insights.insights.length,
  })
}
