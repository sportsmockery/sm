import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { transformPostContent } from '@/lib/transform-post'
import { serializeDocument } from '@/components/admin/BlockEditor/serializer'
import { revalidatePath } from 'next/cache'

import { WP_ORIGIN } from '@/lib/wordpress'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const WP_API = `${WP_ORIGIN}/wp-json/wp/v2/posts`

/**
 * POST /api/admin/retransform
 *
 * Re-fetches original WordPress content and re-transforms all imported articles
 * using the updated transform pipeline (fixes missing embeds: tweets, YouTube, etc.)
 *
 * Query params:
 *   ?limit=50    — max posts to process (default 50)
 *   ?offset=0    — skip N posts (for pagination)
 *   ?slug=xxx    — retransform a single post by slug
 */
export async function POST(request: NextRequest) {
  // Basic auth check
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = request.nextUrl.searchParams
  const limit = Math.min(parseInt(params.get('limit') || '50'), 200)
  const offset = parseInt(params.get('offset') || '0')
  const singleSlug = params.get('slug')

  try {
    // Get posts that have SM_BLOCKS content (already transformed)
    let query = supabaseAdmin
      .from('sm_posts')
      .select('id, slug, title, wp_id, excerpt, featured_image, category_id, published_at, category:sm_categories!category_id(slug)')
      .eq('status', 'published')
      .eq('template_version', 1)
      .not('wp_id', 'is', null)
      .order('published_at', { ascending: false })

    if (singleSlug) {
      query = query.eq('slug', singleSlug)
    } else {
      query = query.range(offset, offset + limit - 1)
    }

    const { data: posts, error: fetchError } = await query
    if (fetchError) throw fetchError
    if (!posts || posts.length === 0) {
      return NextResponse.json({ success: true, message: 'No posts to retransform', processed: 0 })
    }

    let processed = 0
    let skipped = 0
    let failed = 0
    const errors: string[] = []

    for (const post of posts) {
      try {
        // Fetch original WP content via WP REST API
        const wpRes = await fetch(
          `${WP_API}?slug=${encodeURIComponent(post.slug)}&_fields=content`,
          { next: { revalidate: 0 } }
        )

        if (!wpRes.ok) {
          errors.push(`${post.slug}: WP API ${wpRes.status}`)
          failed++
          continue
        }

        const wpData = await wpRes.json()
        if (!wpData || !wpData[0]?.content?.rendered) {
          errors.push(`${post.slug}: No WP content found`)
          skipped++
          continue
        }

        const rawHtml = wpData[0].content.rendered as string

        // Re-transform with updated pipeline
        const result = transformPostContent(rawHtml, post.title)
        const serialized = serializeDocument(result.document)

        // Update the post
        const { error: updateError } = await supabaseAdmin
          .from('sm_posts')
          .update({
            content: serialized,
            updated_at: new Date().toISOString(),
          })
          .eq('id', post.id)

        if (updateError) {
          errors.push(`${post.slug}: DB update failed: ${updateError.message}`)
          failed++
        } else {
          // Revalidate the article page cache
          const cat = Array.isArray((post as any).category) ? (post as any).category[0] : (post as any).category
          const catSlug = cat?.slug || 'news'
          try { revalidatePath(`/${catSlug}/${post.slug}`) } catch {}
          processed++
        }
      } catch (err) {
        errors.push(`${post.slug}: ${err instanceof Error ? err.message : 'Unknown error'}`)
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      total: posts.length,
      processed,
      skipped,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('[Retransform] Failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
