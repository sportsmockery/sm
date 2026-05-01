import { NextResponse } from 'next/server'
import { buildNewsSitemap } from '@/lib/seo/sitemap-builders'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Hourly cron pings this endpoint to keep the cached XML warm; the route
// itself revalidates every 5 minutes for any out-of-band callers.
export const revalidate = 300

export async function GET() {
  const xml = await buildNewsSitemap()
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  })
}
