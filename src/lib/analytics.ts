import { supabaseAdmin } from './supabase-server'

// Types for analytics data
export interface ViewData {
  postId: number
  views: number
  viewedAt: string
}

export interface AnalyticsData {
  totalViews: number
  uniqueVisitors: number
  avgTimeOnPage: number
  bounceRate: number
}

export interface TopPost {
  id: number
  title: string
  slug: string
  views: number
  categorySlug: string
}

export interface ViewsByDate {
  date: string
  views: number
}

export interface CategoryStats {
  category: string
  count: number
  percentage: number
}

// Increment view count for a post
export async function incrementPostViews(postId: number): Promise<{ success: boolean; views?: number; error?: string }> {
  if (!supabaseAdmin) {
    return { success: false, error: 'Database not configured' }
  }

  try {
    // First, get current view count
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('sm_posts')
      .select('views')
      .eq('id', postId)
      .single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    const currentViews = post?.views || 0
    const newViews = currentViews + 1

    // Update the view count
    const { error: updateError } = await supabaseAdmin
      .from('sm_posts')
      .update({ views: newViews })
      .eq('id', postId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    return { success: true, views: newViews }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get view count for a post
export async function getPostViews(postId: number): Promise<number> {
  if (!supabaseAdmin) return 0

  const { data } = await supabaseAdmin
    .from('sm_posts')
    .select('views')
    .eq('id', postId)
    .single()

  return data?.views || 0
}

// Get top posts by views
export async function getTopPosts(limit: number = 10): Promise<TopPost[]> {
  if (!supabaseAdmin) return []

  const { data: posts } = await supabaseAdmin
    .from('sm_posts')
    .select('id, title, slug, views, category_id')
    .eq('status', 'published')
    .order('views', { ascending: false })
    .limit(limit)

  if (!posts) return []

  // Get categories for posts
  const categoryIds = [...new Set(posts.map(p => p.category_id))]
  const { data: categories } = await supabaseAdmin
    .from('sm_categories')
    .select('id, slug')
    .in('id', categoryIds)

  const categoryMap = new Map(categories?.map(c => [c.id, c.slug]) || [])

  return posts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    views: post.views || 0,
    categorySlug: categoryMap.get(post.category_id) || 'uncategorized',
  }))
}

// Get trending posts (most views in last 24 hours)
// Note: This assumes we track view timestamps separately or use a heuristic
export async function getTrendingPosts(limit: number = 5): Promise<TopPost[]> {
  if (!supabaseAdmin) return []

  // For now, get recent posts with high view counts
  // In production, you'd track view timestamps in a separate table
  const { data: posts } = await supabaseAdmin
    .from('sm_posts')
    .select('id, title, slug, views, category_id, published_at')
    .eq('status', 'published')
    .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('views', { ascending: false })
    .limit(limit)

  if (!posts) return []

  const categoryIds = [...new Set(posts.map(p => p.category_id))]
  const { data: categories } = await supabaseAdmin
    .from('sm_categories')
    .select('id, slug')
    .in('id', categoryIds)

  const categoryMap = new Map(categories?.map(c => [c.id, c.slug]) || [])

  return posts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    views: post.views || 0,
    categorySlug: categoryMap.get(post.category_id) || 'uncategorized',
  }))
}

// Get popular posts this week
export async function getPopularThisWeek(limit: number = 5): Promise<TopPost[]> {
  if (!supabaseAdmin) return []

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: posts } = await supabaseAdmin
    .from('sm_posts')
    .select('id, title, slug, views, category_id')
    .eq('status', 'published')
    .gte('published_at', weekAgo)
    .order('views', { ascending: false })
    .limit(limit)

  if (!posts) return []

  const categoryIds = [...new Set(posts.map(p => p.category_id))]
  const { data: categories } = await supabaseAdmin
    .from('sm_categories')
    .select('id, slug')
    .in('id', categoryIds)

  const categoryMap = new Map(categories?.map(c => [c.id, c.slug]) || [])

  return posts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    views: post.views || 0,
    categorySlug: categoryMap.get(post.category_id) || 'uncategorized',
  }))
}

// Get views by date (for charts)
export async function getViewsByDate(days: number = 30): Promise<ViewsByDate[]> {
  // This would require a views tracking table with timestamps
  // For now, return mock data structure
  const dates: ViewsByDate[] = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push({
      date: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 1000) + 100, // Mock data
    })
  }

  return dates
}

// Get category breakdown
export async function getCategoryBreakdown(): Promise<CategoryStats[]> {
  if (!supabaseAdmin) return []

  const { data: posts } = await supabaseAdmin
    .from('sm_posts')
    .select('category_id')
    .eq('status', 'published')

  if (!posts) return []

  const { data: categories } = await supabaseAdmin
    .from('sm_categories')
    .select('id, name')

  const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || [])

  // Count posts per category
  const counts = new Map<number, number>()
  posts.forEach(post => {
    counts.set(post.category_id, (counts.get(post.category_id) || 0) + 1)
  })

  const total = posts.length
  const stats: CategoryStats[] = []

  counts.forEach((count, categoryId) => {
    stats.push({
      category: categoryMap.get(categoryId) || 'Unknown',
      count,
      percentage: Math.round((count / total) * 100),
    })
  })

  return stats.sort((a, b) => b.count - a.count)
}

// Calculate reading time from HTML content
export function calculateReadingTime(content: string): number {
  // Strip HTML tags
  const text = content.replace(/<[^>]*>/g, '')
  // Count words
  const words = text.trim().split(/\s+/).length
  // Average reading speed: 200 words per minute
  const minutes = Math.ceil(words / 200)
  return Math.max(1, minutes)
}

// Format large numbers
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Get total site stats
export async function getSiteStats(): Promise<{
  totalPosts: number
  totalViews: number
  totalAuthors: number
  totalCategories: number
}> {
  if (!supabaseAdmin) {
    return { totalPosts: 0, totalViews: 0, totalAuthors: 0, totalCategories: 0 }
  }

  const [postsResult, authorsResult, categoriesResult] = await Promise.all([
    supabaseAdmin.from('sm_posts').select('views', { count: 'exact' }).eq('status', 'published'),
    supabaseAdmin.from('sm_authors').select('id', { count: 'exact' }),
    supabaseAdmin.from('sm_categories').select('id', { count: 'exact' }),
  ])

  const totalViews = postsResult.data?.reduce((sum, post) => sum + (post.views || 0), 0) || 0

  return {
    totalPosts: postsResult.count || 0,
    totalViews,
    totalAuthors: authorsResult.count || 0,
    totalCategories: categoriesResult.count || 0,
  }
}
