import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const WP_BASE_URL = 'https://www.sportsmockery.com/wp-json/sm-export/v1'
const MAX_PAGES = 3
const PER_PAGE = 100

interface WPCategory {
  id: number
  name: string
  slug: string
  parent_id: number | null
  count: number
}

interface WPAuthor {
  id: number
  email: string
  display_name: string
  bio: string
  avatar_url: string
  role: string
}

interface WPPost {
  id: number
  slug: string
  title: string
  content: string
  excerpt: string
  featured_image: string
  author_id: number
  category_id: number
  seo_title: string
  seo_description: string
  published_at: string
}

interface WPPostsResponse {
  posts: WPPost[]
  page: number
  per_page: number
  total: number
  total_pages: number
}

async function fetchWithRetry<T>(url: string, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      if (i === retries - 1) throw error
      console.log(`[WP Sync] Retry ${i + 1}/${retries} for ${url}`)
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
  throw new Error('Max retries reached')
}

/**
 * GET /api/cron/sync-wordpress
 *
 * Nightly sync of new WordPress posts into Supabase.
 * Fetches up to 300 recent posts, inserts only new ones,
 * and ensures referenced categories/authors exist.
 *
 * Vercel Cron: runs daily at 4am UTC
 * Schedule: "0 4 * * *"
 */
export async function GET(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[WP Sync] Starting nightly WordPress sync...')
  const startTime = Date.now()

  try {
    // 1. Load existing wp_ids from sm_posts
    const { data: existingRows, error: existingError } = await supabaseAdmin
      .from('sm_posts')
      .select('wp_id')

    if (existingError) {
      throw new Error(`Failed to load existing posts: ${existingError.message}`)
    }

    const existingWpIds = new Set(existingRows?.map(r => r.wp_id) || [])
    console.log(`[WP Sync] ${existingWpIds.size} existing posts in Supabase`)

    // 2. Fetch recent posts from WP (up to MAX_PAGES pages, newest first)
    const allWpPosts: WPPost[] = []

    for (let page = 1; page <= MAX_PAGES; page++) {
      const response = await fetchWithRetry<WPPostsResponse>(
        `${WP_BASE_URL}/posts?page=${page}&per_page=${PER_PAGE}`
      )

      allWpPosts.push(...response.posts)

      // Stop if we've reached the last page
      if (page >= response.total_pages) break
    }

    console.log(`[WP Sync] Fetched ${allWpPosts.length} recent posts from WordPress`)

    // 3. Filter to only new posts
    const newWpPosts = allWpPosts.filter(p => !existingWpIds.has(p.id))

    if (newWpPosts.length === 0) {
      const duration = Date.now() - startTime
      console.log(`[WP Sync] No new posts found. Done in ${duration}ms`)
      return NextResponse.json({
        success: true,
        newPosts: 0,
        newCategories: 0,
        newAuthors: 0,
        skipped: allWpPosts.length,
        duration: `${duration}ms`,
      })
    }

    console.log(`[WP Sync] ${newWpPosts.length} new posts to import`)

    // 4. Ensure categories exist — build wp_id → supabase id map
    const { data: catRows } = await supabaseAdmin
      .from('sm_categories')
      .select('id, wp_id')

    const catMap = new Map<number, string>(
      catRows?.map(c => [c.wp_id, c.id]) || []
    )

    const missingCatWpIds = [
      ...new Set(newWpPosts.map(p => p.category_id).filter(id => !catMap.has(id)))
    ]

    let newCategoriesCount = 0
    if (missingCatWpIds.length > 0) {
      console.log(`[WP Sync] Fetching ${missingCatWpIds.length} missing categories from WP`)
      const wpCategories = await fetchWithRetry<WPCategory[]>(`${WP_BASE_URL}/categories`)

      for (const cat of wpCategories) {
        if (missingCatWpIds.includes(cat.id) && !catMap.has(cat.id)) {
          const { data: inserted, error } = await supabaseAdmin
            .from('sm_categories')
            .insert({
              wp_id: cat.id,
              name: cat.name,
              slug: cat.slug,
              parent_wp_id: cat.parent_id,
            })
            .select('id')
            .single()

          if (error) {
            console.error(`[WP Sync] Error inserting category ${cat.name}:`, error.message)
          } else if (inserted) {
            catMap.set(cat.id, inserted.id)
            newCategoriesCount++
          }
        }
      }
    }

    // 5. Ensure authors exist — build wp_id → supabase id map
    const { data: authorRows } = await supabaseAdmin
      .from('sm_authors')
      .select('id, wp_id')

    const authorMap = new Map<number, string>(
      authorRows?.map(a => [a.wp_id, a.id]) || []
    )

    const missingAuthorWpIds = [
      ...new Set(newWpPosts.map(p => p.author_id).filter(id => !authorMap.has(id)))
    ]

    let newAuthorsCount = 0
    if (missingAuthorWpIds.length > 0) {
      console.log(`[WP Sync] Fetching ${missingAuthorWpIds.length} missing authors from WP`)
      const wpAuthors = await fetchWithRetry<WPAuthor[]>(`${WP_BASE_URL}/authors`)

      for (const author of wpAuthors) {
        if (missingAuthorWpIds.includes(author.id) && !authorMap.has(author.id)) {
          const { data: inserted, error } = await supabaseAdmin
            .from('sm_authors')
            .insert({
              wp_id: author.id,
              email: author.email,
              display_name: author.display_name,
              bio: author.bio || null,
              avatar_url: author.avatar_url || null,
              role: author.role,
            })
            .select('id')
            .single()

          if (error) {
            console.error(`[WP Sync] Error inserting author ${author.display_name}:`, error.message)
          } else if (inserted) {
            authorMap.set(author.id, inserted.id)
            newAuthorsCount++
          }
        }
      }
    }

    // 6. Insert new posts with resolved category_id and author_id
    const postsToInsert = newWpPosts.map(post => ({
      wp_id: post.id,
      slug: post.slug,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || null,
      featured_image: post.featured_image || null,
      category_wp_id: post.category_id,
      author_wp_id: post.author_id,
      category_id: catMap.get(post.category_id) || null,
      author_id: authorMap.get(post.author_id) || null,
      seo_title: post.seo_title || null,
      seo_description: post.seo_description || null,
      published_at: post.published_at,
      status: 'published' as const,
    }))

    let insertedCount = 0
    // Batch insert
    const { error: batchError } = await supabaseAdmin
      .from('sm_posts')
      .insert(postsToInsert)

    if (batchError) {
      console.error(`[WP Sync] Batch insert failed, trying individual:`, batchError.message)
      // Fallback to individual inserts
      for (const post of postsToInsert) {
        const { error } = await supabaseAdmin
          .from('sm_posts')
          .insert(post)

        if (error) {
          console.error(`[WP Sync] Error inserting post ${post.slug}:`, error.message)
        } else {
          insertedCount++
        }
      }
    } else {
      insertedCount = postsToInsert.length
    }

    const duration = Date.now() - startTime
    console.log(`[WP Sync] Done in ${duration}ms — ${insertedCount} posts, ${newCategoriesCount} categories, ${newAuthorsCount} authors`)

    return NextResponse.json({
      success: true,
      newPosts: insertedCount,
      newCategories: newCategoriesCount,
      newAuthors: newAuthorsCount,
      skipped: allWpPosts.length - newWpPosts.length,
      duration: `${duration}ms`,
    })

  } catch (error) {
    console.error('[WP Sync] Failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
