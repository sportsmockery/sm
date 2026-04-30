import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { generateExecIqInsights, loadLatestExecIq } from '@/lib/exec-iq'

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
  const auth = await requireAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const row = await loadLatestExecIq()
  return NextResponse.json({ row })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const baseUrl = deriveBaseUrl(request)
  const body = await request.json().catch(() => ({} as any))
  const range = (body?.range as string) || 'this-week'
  const result = await generateExecIqInsights({ baseUrl, range })
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }
  return NextResponse.json({ ok: true, insightId: result.insightId, insights: result.insights })
}
