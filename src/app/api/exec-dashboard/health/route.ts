import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const base = `${url.protocol}//${url.host}`
  const dashRes = await fetch(`${base}/api/exec-dashboard?range=this-month`)
  const fsRes = await fetch(`${base}/api/freestar-revenue?start=${new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString().slice(0,10)}&end=${new Date().toISOString().slice(0,10)}`)
  const dash = await dashRes.json()
  const fs = await fsRes.json()

  const checks: Record<string, { ok: boolean; detail?: string }> = {}

  // 1. Real data presence
  checks.overview = { ok: !!dash.overview && dash.overview.periodPosts > 0 && dash.overview.periodViews > 0 }
  checks.writers = { ok: Array.isArray(dash.writers) && dash.writers.length > 0 }
  checks.topContent = { ok: Array.isArray(dash.topContent) && dash.topContent.length > 0 }
  checks.publishingTrend = { ok: Array.isArray(dash.publishingTrend) && dash.publishingTrend.length > 0 }
  checks.youtube = { ok: Array.isArray(dash.social?.youtube) && dash.social.youtube.length >= 3 }
  checks.x = { ok: Array.isArray(dash.social?.x) && dash.social.x.length >= 1 }
  checks.seo = { ok: !!dash.seo?.overview }
  checks.paymentSync = { ok: dash.paymentSync?.sync?.status === 'success' }

  // 2. Freestar live (no fabricated fallback)
  checks.freestarSource = {
    ok: fs.source === 'freestar',
    detail: `source=${fs.source}; if 'unavailable' or 'error', the API token is bad`
  }
  checks.freestarRevenue = {
    ok: typeof fs.revenue === 'number' && fs.revenue > 0,
    detail: `revenue=${fs.revenue}`
  }

  // 3. Forensics — flag fabricated patterns in numeric values
  // If revenue is suspiciously close to periodViews * 0.00186, that's the old estimate
  if (fs.revenue && dash.overview?.periodViews) {
    const estimated = Math.round(dash.overview.periodViews * 0.00186)
    const ratio = fs.revenue / estimated
    checks.notSynthetic = {
      ok: ratio < 0.95 || ratio > 1.05,
      detail: `revenue=${fs.revenue} vs old-estimate=${estimated} (ratio=${ratio.toFixed(3)})`
    }
  } else {
    checks.notSynthetic = { ok: true }
  }

  const allOk = Object.values(checks).every(c => c.ok)
  return NextResponse.json({ ok: allOk, checks }, { status: allOk ? 200 : 503 })
}
