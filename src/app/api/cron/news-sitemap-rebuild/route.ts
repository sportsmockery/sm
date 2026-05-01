import { NextRequest, NextResponse } from 'next/server'
import { verifyCronSecret } from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Hourly cron — touches /news-sitemap.xml so its ISR cache stays warm and
 * Google News can poll the endpoint without paying the cold rebuild cost.
 *
 * Returns the response status from the rebuild; failures are logged but
 * non-fatal so the cron never page-storms the team.
 */
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url =
    process.env.NEWS_SITEMAP_URL ||
    'https://test.sportsmockery.com/news-sitemap.xml'
  try {
    const res = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'User-Agent': 'sm-news-sitemap-cron/1.0' },
    })
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      url,
      at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[cron/news-sitemap-rebuild] failed:', err)
    return NextResponse.json({ ok: false, error: 'rebuild failed' }, { status: 200 })
  }
}
