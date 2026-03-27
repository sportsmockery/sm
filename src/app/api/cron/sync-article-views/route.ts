import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const WP_BASE_URL = 'https://www.sportsmockery.com/wp-json/sm-export/v1'

interface WPViewData {
  id: number
  views: number
}

interface WPViewsResponse {
  views: WPViewData[]
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
      console.log(`[Views Sync] Retry ${i + 1}/${retries} for ${url}`)
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

  console.log('[Views Sync] Starting article views sync from WordPress...')
  const startTime = Date.now()

  try {
    const year = new Date().getFullYear()

    // 1. Fetch ALL post views from WP for this year (paginated)
    const allViews: WPViewData[] = []
    let page = 1
    const perPage = 500

    while (true) {
      const response = await fetchWithRetry<WPViewsResponse>(
        `${WP_BASE_URL}/post-views?year=${year}&page=${page}&per_page=${perPage}`
      )
      allViews.push(...response.views)

      if (page >= response.total_pages) break
      page++
    }

    console.log(`[Views Sync] Fetched ${allViews.length} post view records from WordPress (${year})`)

    if (allViews.length === 0) {
      return NextResponse.json({
        success: true,
        updated: 0,
        year,
        duration: `${Date.now() - startTime}ms`,
        message: 'No posts found for this year',
      })
    }

    // 2. Build a map of wp_id -> views
    const viewsMap = new Map<number, number>()
    for (const item of allViews) {
      viewsMap.set(item.id, item.views)
    }

    // 3. Load sm_posts wp_id + current views for matching
    const wpIds = [...viewsMap.keys()]

    // Fetch in batches of 500 (Supabase .in() limit)
    const existingPosts: Array<{ id: number; wp_id: number; views: number }> = []
    for (let i = 0; i < wpIds.length; i += 500) {
      const batch = wpIds.slice(i, i + 500)
      const { data, error } = await supabaseAdmin
        .from('sm_posts')
        .select('id, wp_id, views')
        .in('wp_id', batch)

      if (error) {
        console.error(`[Views Sync] Error fetching batch:`, error.message)
        continue
      }
      if (data) existingPosts.push(...data)
    }

    console.log(`[Views Sync] Found ${existingPosts.length} matching posts in Supabase`)

    // 4. Update views for each post (only if views changed)
    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const post of existingPosts) {
      const wpViews = viewsMap.get(post.wp_id) || 0

      // Skip if views haven't changed
      if (post.views === wpViews) {
        skippedCount++
        continue
      }

      const { error } = await supabaseAdmin
        .from('sm_posts')
        .update({ views: wpViews, updated_at: new Date().toISOString() })
        .eq('id', post.id)

      if (error) {
        console.error(`[Views Sync] Failed to update post ${post.id}:`, error.message)
        errorCount++
      } else {
        updatedCount++
      }
    }

    const duration = Date.now() - startTime
    console.log(`[Views Sync] Done in ${duration}ms — ${updatedCount} updated, ${skippedCount} unchanged, ${errorCount} errors`)

    return NextResponse.json({
      success: true,
      year,
      wp_posts_fetched: allViews.length,
      matched_in_supabase: existingPosts.length,
      updated: updatedCount,
      unchanged: skippedCount,
      errors: errorCount,
      duration: `${duration}ms`,
    })

  } catch (error) {
    console.error('[Views Sync] Failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
