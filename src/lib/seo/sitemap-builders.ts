import { supabaseAdmin } from '@/lib/supabase-server'

export const SITE_BASE = 'https://sportsmockery.com'

export interface SitemapEntry {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

/**
 * Cap article rows per sitemap. Google's sitemap protocol allows up to
 * 50,000 URLs and 50MB per file. We stay well under both — large enough
 * to fit our backlog in a single articles.xml without pagination.
 */
const ARTICLE_LIMIT = 5000

/** Wrap a list of entries in valid <urlset> XML. */
export function buildUrlsetXml(entries: SitemapEntry[]): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ]
  for (const e of entries) {
    lines.push('  <url>')
    lines.push(`    <loc>${escape(e.loc)}</loc>`)
    if (e.lastmod) lines.push(`    <lastmod>${escape(e.lastmod)}</lastmod>`)
    if (e.changefreq) lines.push(`    <changefreq>${e.changefreq}</changefreq>`)
    if (typeof e.priority === 'number') lines.push(`    <priority>${e.priority.toFixed(1)}</priority>`)
    lines.push('  </url>')
  }
  lines.push('</urlset>')
  return lines.join('\n')
}

/** Wrap a list of child sitemap URLs in valid <sitemapindex> XML. */
export function buildSitemapIndexXml(
  children: { loc: string; lastmod?: string }[]
): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ]
  for (const c of children) {
    lines.push('  <sitemap>')
    lines.push(`    <loc>${escape(c.loc)}</loc>`)
    if (c.lastmod) lines.push(`    <lastmod>${escape(c.lastmod)}</lastmod>`)
    lines.push('  </sitemap>')
  }
  lines.push('</sitemapindex>')
  return lines.join('\n')
}

/* ---------------- builders ---------------- */

/** Article URLs — published posts only, gated on status='published'. */
export async function buildArticleEntries(): Promise<SitemapEntry[]> {
  const { data, error } = await supabaseAdmin
    .from('sm_posts')
    .select('slug, published_at, updated_at, category:sm_categories(slug)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(ARTICLE_LIMIT)
  if (error || !data) return []
  return data.map((post) => {
    const categorySlug = (post.category as { slug?: string } | null)?.slug || 'news'
    const lastMod = post.updated_at || post.published_at
    return {
      loc: `${SITE_BASE}/${categorySlug}/${post.slug}`,
      lastmod: lastMod ? new Date(lastMod).toISOString() : undefined,
      changefreq: 'weekly',
      priority: 0.7,
    }
  })
}

/** Category hub URLs. */
export async function buildCategoryEntries(): Promise<SitemapEntry[]> {
  const { data, error } = await supabaseAdmin
    .from('sm_categories')
    .select('slug, updated_at')
  if (error || !data) return []
  return data
    .filter((c) => typeof c.slug === 'string' && c.slug.length > 0)
    .map((c) => ({
      loc: `${SITE_BASE}/${c.slug}`,
      lastmod: c.updated_at ? new Date(c.updated_at).toISOString() : undefined,
      changefreq: 'daily',
      priority: 0.8,
    }))
}

/** Author profile URLs. */
export async function buildAuthorEntries(): Promise<SitemapEntry[]> {
  const { data, error } = await supabaseAdmin
    .from('sm_authors')
    .select('id, slug, display_name')
  if (error || !data) return []
  return data
    .filter((a) => a.slug || a.display_name)
    .map((a) => ({
      loc: `${SITE_BASE}/author/${a.slug || a.id}`,
      changefreq: 'weekly',
      priority: 0.5,
    }))
}

/** Static / evergreen pages — homepage, hub feature pages, /about, etc. */
export function buildEvergreenEntries(): SitemapEntry[] {
  const now = new Date().toISOString()
  return [
    { loc: `${SITE_BASE}/`, lastmod: now, changefreq: 'hourly', priority: 1.0 },
    { loc: `${SITE_BASE}/scout-ai`, lastmod: now, changefreq: 'weekly', priority: 0.7 },
    { loc: `${SITE_BASE}/gm`, lastmod: now, changefreq: 'weekly', priority: 0.7 },
    { loc: `${SITE_BASE}/owner`, lastmod: now, changefreq: 'weekly', priority: 0.6 },
    { loc: `${SITE_BASE}/vision-theater`, lastmod: now, changefreq: 'weekly', priority: 0.6 },
    { loc: `${SITE_BASE}/bears-film-room`, lastmod: now, changefreq: 'weekly', priority: 0.6 },
    { loc: `${SITE_BASE}/pinwheels-and-ivy`, lastmod: now, changefreq: 'weekly', priority: 0.6 },
    { loc: `${SITE_BASE}/southside-behavior`, lastmod: now, changefreq: 'weekly', priority: 0.6 },
    { loc: `${SITE_BASE}/about`, lastmod: now, changefreq: 'monthly', priority: 0.5 },
    { loc: `${SITE_BASE}/contact`, lastmod: now, changefreq: 'monthly', priority: 0.4 },
    { loc: `${SITE_BASE}/privacy`, lastmod: now, changefreq: 'yearly', priority: 0.3 },
    { loc: `${SITE_BASE}/terms`, lastmod: now, changefreq: 'yearly', priority: 0.3 },
  ]
}

/**
 * Google News sitemap — last 48h of published articles, with the
 * <news:news>, <news:publication_date>, <news:title> envelope per
 * Google News spec.
 */
export async function buildNewsSitemap(): Promise<string> {
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  const { data } = await supabaseAdmin
    .from('sm_posts')
    .select('slug, title, published_at, category:sm_categories(slug)')
    .eq('status', 'published')
    .gte('published_at', since)
    .order('published_at', { ascending: false })
    .limit(1000)
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">',
  ]
  for (const post of data || []) {
    const categorySlug = (post.category as { slug?: string } | null)?.slug || 'news'
    const loc = `${SITE_BASE}/${categorySlug}/${post.slug}`
    lines.push('  <url>')
    lines.push(`    <loc>${escape(loc)}</loc>`)
    lines.push('    <news:news>')
    lines.push('      <news:publication>')
    lines.push('        <news:name>Sports Mockery</news:name>')
    lines.push('        <news:language>en</news:language>')
    lines.push('      </news:publication>')
    if (post.published_at) {
      lines.push(`      <news:publication_date>${escape(new Date(post.published_at).toISOString())}</news:publication_date>`)
    }
    lines.push(`      <news:title>${escape(post.title || '')}</news:title>`)
    lines.push('    </news:news>')
    lines.push('  </url>')
  }
  lines.push('</urlset>')
  return lines.join('\n')
}

/* ---------------- helpers ---------------- */

function escape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
