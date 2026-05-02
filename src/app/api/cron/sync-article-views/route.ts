import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { WP_ORIGIN } from '@/lib/wordpress'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const WP_BASE_URL = `${WP_ORIGIN}/wp-json/sm-export/v1`

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

async function syncYear(year: number) {
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

  if (allViews.length === 0) {
    return { year, fetched: 0, matched: 0, updated: 0, unchanged: 0, errors: 0 }
  }

  const viewsMap = new Map<number, number>()
  for (const item of allViews) viewsMap.set(Number(item.id), Number(item.views))

  const wpIds = [...viewsMap.keys()]
  const existingPosts: Array<{ id: number; wp_id: number; views: number }> = []
  for (let i = 0; i < wpIds.length; i += 500) {
    const batch = wpIds.slice(i, i + 500)
    const { data, error } = await supabaseAdmin
      .from('sm_posts')
      .select('id, wp_id, views')
      .in('wp_id', batch)
    if (error) {
      console.error(`[Views Sync ${year}] batch fetch error:`, error.message)
      continue
    }
    if (data) existingPosts.push(...data)
  }

  let updatedCount = 0
  let skippedCount = 0
  let errorCount = 0
  for (const post of existingPosts) {
    const wpViews = viewsMap.get(post.wp_id) || 0
    if (post.views === wpViews) { skippedCount++; continue }
    const { error } = await supabaseAdmin
      .from('sm_posts')
      .update({ views: wpViews, updated_at: new Date().toISOString() })
      .eq('id', post.id)
    if (error) { console.error(`[Views Sync ${year}] post ${post.id}:`, error.message); errorCount++ }
    else updatedCount++
  }

  return { year, fetched: allViews.length, matched: existingPosts.length, updated: updatedCount, unchanged: skippedCount, errors: errorCount }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const yearParam = url.searchParams.get('year')
  const backfill = url.searchParams.get('backfill')
  const startTime = Date.now()

  try {
    let years: number[]
    if (backfill) {
      const from = Number(url.searchParams.get('from')) || 2014
      const to = Number(url.searchParams.get('to')) || new Date().getFullYear()
      years = []
      for (let y = to; y >= from; y--) years.push(y)
    } else if (yearParam) {
      years = [Number(yearParam)]
    } else {
      years = [new Date().getFullYear()]
    }

    console.log(`[Views Sync] syncing years: ${years.join(', ')}`)

    const results = []
    for (const y of years) {
      const r = await syncYear(y)
      console.log(`[Views Sync ${y}] fetched=${r.fetched} matched=${r.matched} updated=${r.updated} unchanged=${r.unchanged} errors=${r.errors}`)
      results.push(r)
    }

    const totals = results.reduce(
      (acc, r) => ({
        fetched: acc.fetched + r.fetched,
        matched: acc.matched + r.matched,
        updated: acc.updated + r.updated,
        unchanged: acc.unchanged + r.unchanged,
        errors: acc.errors + r.errors,
      }),
      { fetched: 0, matched: 0, updated: 0, unchanged: 0, errors: 0 }
    )

    return NextResponse.json({
      success: true,
      years,
      per_year: results,
      totals,
      duration: `${Date.now() - startTime}ms`,
    })
  } catch (error) {
    console.error('[Views Sync] Failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
