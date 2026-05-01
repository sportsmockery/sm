import { NextResponse } from 'next/server'
import { buildEvergreenEntries, buildUrlsetXml } from '@/lib/seo/sitemap-builders'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 86400

export async function GET() {
  const xml = buildUrlsetXml(buildEvergreenEntries())
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
