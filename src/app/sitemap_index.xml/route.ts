import { NextResponse } from 'next/server'
import { SITE_BASE, buildSitemapIndexXml } from '@/lib/seo/sitemap-builders'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 3600

/** Sitemap index pointing at the per-section child sitemaps. */
export async function GET() {
  const now = new Date().toISOString()
  const xml = buildSitemapIndexXml([
    { loc: `${SITE_BASE}/sitemaps/articles.xml`, lastmod: now },
    { loc: `${SITE_BASE}/sitemaps/categories.xml`, lastmod: now },
    { loc: `${SITE_BASE}/sitemaps/authors.xml`, lastmod: now },
    { loc: `${SITE_BASE}/sitemaps/evergreen.xml`, lastmod: now },
    { loc: `${SITE_BASE}/news-sitemap.xml`, lastmod: now },
  ])
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
