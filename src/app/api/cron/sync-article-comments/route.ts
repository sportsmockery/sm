import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const WP_BASE_URL = 'https://www.sportsmockery.com/wp-json/sm-export/v1'

interface WPCommentData {
  id: number
  comments: number
}

interface WPCommentsResponse {
  comments: WPCommentData[]
  total: number
  total_pages: number
  page: number
  year: number
}

async function fetchWithRetry<T>(url: string, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      if (i === retries - 1) throw error
      console.log(`[Comments Sync] Retry ${i + 1}/${retries} for ${url}`)
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw new Error('Max retries reached')
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[Comments Sync] Starting article comments sync from WordPress...')
  const startTime = Date.now()

  try {
    const year = new Date().getFullYear()

    // 1. Fetch ALL post comments from WP for this year (paginated)
    const allComments: WPCommentData[] = []
    let page = 1
    const perPage = 500

    while (true) {
      const response = await fetchWithRetry<WPCommentsResponse>(
        `${WP_BASE_URL}/post-comments?year=${year}&page=${page}&per_page=${perPage}`
      )
      allComments.push(...response.comments)

      if (page >= response.total_pages) break
      page++
    }

    console.log(`[Comments Sync] Fetched ${allComments.length} post comment records from WordPress (${year})`)

    if (allComments.length === 0) {
      return NextResponse.json({
        success: true,
        updated: 0,
        year,
        duration: `${Date.now() - startTime}ms`,
        message: 'No posts found for this year',
      })
    }

    // 2. Build a map of wp_id -> comments
    const commentsMap = new Map<number, number>()
    for (const item of allComments) {
      commentsMap.set(Number(item.id), Number(item.comments))
    }

    // 3. Load sm_posts wp_id + current comments_count for matching
    const wpIds = [...commentsMap.keys()]

    // Fetch in batches of 500 (Supabase .in() limit)
    const existingPosts: Array<{ id: number; wp_id: number; comments_count: number }> = []
    for (let i = 0; i < wpIds.length; i += 500) {
      const batch = wpIds.slice(i, i + 500)
      const { data, error } = await supabaseAdmin
        .from('sm_posts')
        .select('id, wp_id, comments_count')
        .in('wp_id', batch)

      if (error) {
        console.error(`[Comments Sync] Error fetching batch:`, error.message)
        continue
      }
      if (data) existingPosts.push(...data)
    }

    console.log(`[Comments Sync] Found ${existingPosts.length} matching posts in Supabase`)

    // 4. Update comments_count for each post (only if changed)
    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const post of existingPosts) {
      const wpComments = commentsMap.get(post.wp_id) || 0

      // Skip if comments_count hasn't changed
      if (post.comments_count === wpComments) {
        skippedCount++
        continue
      }

      const { error } = await supabaseAdmin
        .from('sm_posts')
        .update({ comments_count: wpComments, updated_at: new Date().toISOString() })
        .eq('id', post.id)

      if (error) {
        console.error(`[Comments Sync] Failed to update post ${post.id}:`, error.message)
        errorCount++
      } else {
        updatedCount++
      }
    }

    const duration = Date.now() - startTime
    console.log(`[Comments Sync] Done in ${duration}ms — ${updatedCount} updated, ${skippedCount} unchanged, ${errorCount} errors`)

    return NextResponse.json({
      success: true,
      year,
      wp_posts_fetched: allComments.length,
      matched_in_supabase: existingPosts.length,
      updated: updatedCount,
      unchanged: skippedCount,
      errors: errorCount,
      duration: `${duration}ms`,
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Comments Sync] Failed:', message)

    // Graceful handling if WP endpoint is not yet deployed
    if (message.includes('404') || message.includes('Not Found')) {
      return NextResponse.json({
        success: false,
        error: 'WordPress /post-comments endpoint not found. The sm-export plugin may not be updated yet.',
        duration: `${Date.now() - startTime}ms`,
      }, { status: 200 })
    }

    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 })
  }
}
