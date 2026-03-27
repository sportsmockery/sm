import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const DISQUS_API_URL = 'https://disqus.com/api/3.0/threads/list.json'
const DISQUS_FORUM = 'sportsmockery'
const DISQUS_API_KEY = 'E8Uh5l5fHZ6gD8U3KycjAIAk46f68Zw7C6eW8WSjZvCLXebZ7p0r1yrYDrLilk2F'
const MAX_PAGES = 50

interface DisqusThread {
  posts: number
  identifiers: string[]
}

interface DisqusResponse {
  code: number
  cursor: { hasNext: boolean; next: string }
  response: DisqusThread[]
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

function extractWpId(identifiers: string[]): number | null {
  for (const id of identifiers) {
    const match = id.match(/^(\d+)/)
    if (match) return Number(match[1])
  }
  return null
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[Comments Sync] Starting article comments sync from Disqus...')
  const startTime = Date.now()

  try {
    // 1. Fetch ALL threads from Disqus API, paginating with cursor
    const commentsMap = new Map<number, number>()
    let cursor = ''
    let pageCount = 0

    while (pageCount < MAX_PAGES) {
      const url = `${DISQUS_API_URL}?forum=${DISQUS_FORUM}&limit=100&api_key=${DISQUS_API_KEY}${cursor ? `&cursor=${cursor}` : ''}`
      const data = await fetchWithRetry<DisqusResponse>(url)

      for (const thread of data.response) {
        const wpId = extractWpId(thread.identifiers)
        if (wpId !== null) {
          commentsMap.set(wpId, Number(thread.posts))
        }
      }

      pageCount++

      if (!data.cursor.hasNext) break
      cursor = data.cursor.next
    }

    console.log(`[Comments Sync] Fetched ${commentsMap.size} threads from Disqus (${pageCount} pages)`)

    if (commentsMap.size === 0) {
      return NextResponse.json({
        success: true,
        updated: 0,
        disqus_threads: 0,
        duration: `${Date.now() - startTime}ms`,
        message: 'No threads found in Disqus',
      })
    }

    // 2. Load sm_posts wp_id + current comments_count for matching
    const wpIds = [...commentsMap.keys()]

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

    // 3. Update comments_count for each post (only if changed)
    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const post of existingPosts) {
      const disqusComments = commentsMap.get(post.wp_id) || 0

      if (post.comments_count === disqusComments) {
        skippedCount++
        continue
      }

      const { error } = await supabaseAdmin
        .from('sm_posts')
        .update({ comments_count: disqusComments, updated_at: new Date().toISOString() })
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
      disqus_threads: commentsMap.size,
      disqus_pages: pageCount,
      matched_in_supabase: existingPosts.length,
      updated: updatedCount,
      unchanged: skippedCount,
      errors: errorCount,
      duration: `${duration}ms`,
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Comments Sync] Failed:', message)

    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 })
  }
}
