import { NextResponse } from 'next/server'
import {
  ARTICLE_CHUNK_SIZE,
  SITE_BASE,
  buildSitemapIndexXml,
  countPublishedArticles,
} from '@/lib/seo/sitemap-builders'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 3600

/**
 * Sitemap index pointing at the per-section child sitemaps.
 *
 * The articles sitemap is paginated: we count published rows and
 * enumerate `/sitemaps/articles.xml?page=N` for every chunk so search
 * engines discover all ~30k+ articles, not just the first 5k.
 */
export async function GET() {
  const now = new Date().toISOString()
  const total = await countPublishedArticles()
  const pages = Math.max(1, Math.ceil(total / ARTICLE_CHUNK_SIZE))

  const articleSitemaps = Array.from({ length: pages }, (_, i) => ({
    loc: `${SITE_BASE}/sitemaps/articles.xml?page=${i + 1}`,
    lastmod: now,
  }))

  const xml = buildSitemapIndexXml([
    ...articleSitemaps,
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
