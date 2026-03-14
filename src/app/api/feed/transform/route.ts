import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { transformPosts, type PostToTransform } from '@/lib/transform-post'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

/**
 * POST /api/feed/transform
 *
 * Transforms raw imported WordPress posts into structured block format.
 * Reusable — can be called after each WP sync or manually.
 *
 * Query params:
 *   limit   — max posts to transform (default 10, max 50)
 *   force   — if "true", re-transforms already transformed posts
 *
 * Auth: Requires CRON_SECRET header.
 */
export async function POST(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
  const force = searchParams.get('force') === 'true'

  try {
    // Fetch untransformed published posts (newest first)
    let query = supabaseAdmin
      .from('sm_posts')
      .select('id, slug, title, content, excerpt, featured_image, category_id, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (!force) {
      query = query.is('template_version', null)
    }

    const { data: posts, error } = await query

    if (error) {
      return NextResponse.json({ error: `Query failed: ${error.message}` }, { status: 500 })
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No untransformed posts found',
        transformed: 0,
        errors: 0,
      })
    }

    console.log(`[Transform] Processing ${posts.length} posts...`)

    // Run transformation pipeline
    const { transformed, errors } = transformPosts(posts as PostToTransform[])

    // Batch update transformed posts in Supabase
    let updateCount = 0
    for (const post of transformed) {
      const { error: updateError } = await supabaseAdmin
        .from('sm_posts')
        .update({
          content: post.content,
          excerpt: post.excerpt,
          template_version: post.template_version,
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id)

      if (updateError) {
        console.error(`[Transform] Failed to update post ${post.id}:`, updateError.message)
        errors.push({ id: post.id, error: updateError.message })
      } else {
        updateCount++
        console.log(`[Transform] Updated post ${post.id} (${post.wordCount} words, ${post.keyTakeaways.length} takeaways)`)
      }
    }

    return NextResponse.json({
      success: true,
      transformed: updateCount,
      skipped: errors.filter(e => e.error.includes('Already transformed')).length,
      errors: errors.filter(e => !e.error.includes('Already transformed')).length,
      errorDetails: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error('[Transform] Unexpected error:', err)
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }, { status: 500 })
  }
}
