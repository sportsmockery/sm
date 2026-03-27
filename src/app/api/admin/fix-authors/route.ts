import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 1000

/**
 * GET /api/admin/fix-authors
 *
 * One-time fix: resolves WP author IDs stored in sm_posts.author_id
 * to the correct Supabase sm_authors.id using the author_wp_id column.
 *
 * Also catches posts where author_id was set to a WP ID directly
 * (posts without author_wp_id but whose author_id matches an sm_authors.wp_id).
 *
 * Protected by CRON_SECRET bearer token.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[Fix Authors] Starting author ID fix...')
  const startTime = Date.now()

  try {
    // 1. Fetch all sm_authors and build wp_id → id map
    const { data: authors, error: authorsError } = await supabaseAdmin
      .from('sm_authors')
      .select('id, wp_id')

    if (authorsError) {
      throw new Error(`Failed to fetch authors: ${authorsError.message}`)
    }

    const wpIdToSupabaseId = new Map<number, number>()
    for (const author of authors || []) {
      if (author.wp_id != null) {
        wpIdToSupabaseId.set(author.wp_id, author.id)
      }
    }

    console.log(`[Fix Authors] Loaded ${wpIdToSupabaseId.size} author wp_id mappings`)

    // 2. Fetch all sm_posts with pagination
    const allPosts: { id: number; author_id: number | null; author_wp_id: number | null }[] = []
    let from = 0
    while (true) {
      const { data: batch, error: batchError } = await supabaseAdmin
        .from('sm_posts')
        .select('id, author_id, author_wp_id')
        .range(from, from + PAGE_SIZE - 1)

      if (batchError) {
        throw new Error(`Failed to fetch posts (offset ${from}): ${batchError.message}`)
      }
      if (!batch || batch.length === 0) break
      allPosts.push(...batch)
      if (batch.length < PAGE_SIZE) break
      from += PAGE_SIZE
    }

    console.log(`[Fix Authors] Loaded ${allPosts.length} posts`)

    // Debug: log a sample of 5 posts with their author mapping
    const samplePosts = allPosts.slice(0, 5)
    for (const post of samplePosts) {
      const resolvedId = post.author_wp_id != null
        ? wpIdToSupabaseId.get(post.author_wp_id)
        : post.author_id != null
          ? wpIdToSupabaseId.get(post.author_id)
          : undefined
      console.log(
        `[Fix Authors] Sample post ${post.id}: author_id=${post.author_id}, author_wp_id=${post.author_wp_id}, resolved_supabase_id=${resolvedId ?? 'none'}`
      )
    }

    // 3. Process posts and collect updates
    let updatedCount = 0
    let skippedCount = 0
    const errors: string[] = []
    const unmappedWpIds = new Set<number>()

    // Split posts into two groups
    const postsWithWpId = allPosts.filter(p => p.author_wp_id != null)
    const postsWithoutWpId = allPosts.filter(p => p.author_wp_id == null)

    // 3a. Posts that have author_wp_id set — resolve to Supabase ID
    for (const post of postsWithWpId) {
      const resolvedId = wpIdToSupabaseId.get(post.author_wp_id!)
      if (!resolvedId) {
        unmappedWpIds.add(post.author_wp_id!)
        skippedCount++
        continue
      }
      if (post.author_id === resolvedId) {
        skippedCount++
        continue
      }

      const { error: updateError } = await supabaseAdmin
        .from('sm_posts')
        .update({ author_id: resolvedId })
        .eq('id', post.id)

      if (updateError) {
        errors.push(`Post ${post.id}: ${updateError.message}`)
      } else {
        updatedCount++
      }
    }

    // 3b. Posts without author_wp_id — check if author_id looks like a WP ID
    let fixedFromAuthorId = 0
    for (const post of postsWithoutWpId) {
      if (post.author_id == null) {
        skippedCount++
        continue
      }

      const resolvedId = wpIdToSupabaseId.get(post.author_id)
      if (!resolvedId) {
        skippedCount++
        continue
      }

      // author_id matches a WP author ID — fix it
      const { error: updateError } = await supabaseAdmin
        .from('sm_posts')
        .update({ author_id: resolvedId, author_wp_id: post.author_id })
        .eq('id', post.id)

      if (updateError) {
        errors.push(`Post ${post.id} (wp-in-author_id): ${updateError.message}`)
      } else {
        updatedCount++
        fixedFromAuthorId++
      }
    }

    const duration = `${Date.now() - startTime}ms`
    console.log(`[Fix Authors] Done in ${duration}. Updated: ${updatedCount}, Errors: ${errors.length}`)

    return NextResponse.json({
      success: true,
      duration,
      timestamp: new Date().toISOString(),
      totalAuthors: wpIdToSupabaseId.size,
      totalPosts: allPosts.length,
      postsWithWpId: postsWithWpId.length,
      postsWithoutWpId: postsWithoutWpId.length,
      updatedCount,
      fixedFromAuthorId,
      skippedCount,
      errorCount: errors.length,
      errors: errors.slice(0, 50),
      unmappedWpIds: Array.from(unmappedWpIds),
    })
  } catch (error) {
    console.error('[Fix Authors] Fatal error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${Date.now() - startTime}ms`,
      },
      { status: 500 }
    )
  }
}
