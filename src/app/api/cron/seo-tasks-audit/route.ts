import { NextRequest, NextResponse } from 'next/server'
import { verifyCronSecret } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

function deriveBaseUrl(request: NextRequest): string {
  const explicit = process.env.SEO_TASKS_AUDIT_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/+$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  const host = request.headers.get('host')
  if (host) return `https://${host}`
  return 'https://test.sportsmockery.com'
}

// Vercel cron entry point for nightly SEO Tasks audit.
// Vercel hits this endpoint with x-vercel-cron-secret = CRON_SECRET, which
// verifyCronSecret() accepts. We then invoke the existing audit endpoint
// using the same secret on Authorization Bearer, which is verified server-side.
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  const baseUrl = deriveBaseUrl(request)
  const target = `${baseUrl}/api/admin/seo-tasks/audit`

  try {
    const res = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cronSecret}`,
      },
      body: JSON.stringify({}),
    })
    const json = await res.json().catch(() => ({}))
    return NextResponse.json({ ok: res.ok, status: res.status, audit: json })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    )
  }
}
