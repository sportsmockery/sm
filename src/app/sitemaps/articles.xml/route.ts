import { NextRequest, NextResponse } from 'next/server'
import { buildArticleEntries, buildUrlsetXml } from '@/lib/seo/sitemap-builders'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 1800

/**
 * Paginated articles sitemap. `?page=N` (1-indexed) returns the Nth
 * chunk of up to ARTICLE_CHUNK_SIZE published-article URLs ordered by
 * published_at desc. Page 1 is the default. Chunks are enumerated by
 * `/sitemap_index.xml` based on the published-article count, so search
 * engines discover every chunk.
 */
export async function GET(req: NextRequest) {
  const pageParam = req.nextUrl.searchParams.get('page')
  const page = pageParam ? parseInt(pageParam, 10) : 1
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const entries = await buildArticleEntries(safePage)
  const xml = buildUrlsetXml(entries)
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=1800',
    },
  })
}
