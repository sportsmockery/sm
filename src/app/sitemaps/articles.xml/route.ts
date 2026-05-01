import { NextResponse } from 'next/server'
import { buildArticleEntries, buildUrlsetXml } from '@/lib/seo/sitemap-builders'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 1800

export async function GET() {
  const entries = await buildArticleEntries()
  const xml = buildUrlsetXml(entries)
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=1800',
    },
  })
}
