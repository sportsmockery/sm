import { NextRequest, NextResponse } from 'next/server'
import {
  setDisposableDomains,
  getDisposableDomainCount,
} from '@/lib/security/disposable-email'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

const UPSTREAM_URL =
  'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf'

/**
 * GET /api/cron/refresh-disposable-domains
 *
 * Daily refresh of the in-memory disposable-email blocklist from the
 * upstream maintained list. The bundled list shipped with the build is
 * always available as a fallback — if the upstream fetch fails or
 * returns a suspiciously small list, signups continue to use the
 * bundled list and the cron logs the failure.
 *
 * Vercel Cron schedule: daily.
 */
export async function GET(request: NextRequest) {
  // Vercel cron sends `Authorization: Bearer ${CRON_SECRET}`. Match the
  // pattern used by other crons in this repo (e.g. cleanup-scout-history).
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()
  const previousCount = getDisposableDomainCount()

  try {
    const res = await fetch(UPSTREAM_URL, {
      cache: 'no-store',
      // Fail fast if the upstream is slow — failures fall back to bundled.
      signal: AbortSignal.timeout(15_000),
      headers: { 'User-Agent': 'sportsmockery-disposable-domains-refresh/1.0' },
    })

    if (!res.ok) {
      throw new Error(`Upstream HTTP ${res.status}`)
    }

    const text = await res.text()
    const lines = text.split(/\r?\n/)
    const accepted = setDisposableDomains(lines)

    if (accepted === 0) {
      throw new Error(
        `Upstream payload rejected (size=${lines.length} after parsing too small)`,
      )
    }

    return NextResponse.json({
      ok: true,
      previousCount,
      newCount: accepted,
      durationMs: Date.now() - startedAt,
    })
  } catch (err) {
    // IMPORTANT: failures must NOT break signups. The bundled list is
    // still in effect — we just log and return 200 so Vercel's cron
    // dashboard doesn't keep retrying with an angry error state.
    console.error('[refresh-disposable-domains] failed:', err)
    return NextResponse.json({
      ok: false,
      reason: 'fetch-failed',
      message: err instanceof Error ? err.message : 'unknown',
      previousCount,
      newCount: previousCount,
      durationMs: Date.now() - startedAt,
    })
  }
}
