import { supabaseAdmin } from '@/lib/supabase-server'

const SITE_URL = 'https://sportsmockery.com'
const SITE_NAME = 'Sports Mockery'
const SITE_DESCRIPTION =
  "Your #1 source for Chicago Bears news, analysis, and rumors. Plus complete coverage of Bulls, Cubs, White Sox, and Blackhawks."

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

export async function GET() {
  try {
    // Fetch 50 most recent published articles
    const { data: posts, error } = await supabaseAdmin
      .from('sm_posts')
      .select(`
        id, title, slug, excerpt, content, featured_image,
        published_at, updated_at, author_id,
        category:sm_categories(name, slug),
        author:sm_authors(display_name)
      `)
      .eq('status', 'published')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[RSS] Supabase error:', error)
      return new Response('Error generating RSS feed', { status: 500 })
    }

    const now = new Date().toUTCString()
    const items = (posts || [])
      .map(post => {
        const categorySlug = (post.category as any)?.slug || 'news'
        const categoryName = (post.category as any)?.name || 'News'
        const authorName = (post.author as any)?.display_name || 'Sports Mockery'
        const link = `${SITE_URL}/${categorySlug}/${post.slug}`
        const description = post.excerpt
          ? escapeXml(stripHtml(post.excerpt))
          : ''
        const pubDate = post.published_at
          ? new Date(post.published_at).toUTCString()
          : now

        let enclosure = ''
        if (post.featured_image) {
          enclosure = `<enclosure url="${escapeXml(post.featured_image)}" type="image/jpeg" length="0" />`
        }

        return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(authorName)}</author>
      <category>${escapeXml(categoryName)}</category>
      <guid isPermaLink="true">${link}</guid>
      ${enclosure}
    </item>`
      })
      .join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <copyright>Copyright ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</copyright>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/rss" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('[RSS] Error:', error)
    return new Response('Error generating RSS feed', { status: 500 })
  }
}
