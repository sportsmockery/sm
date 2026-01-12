import { supabase } from './supabase'

export interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalViews: number
  totalAuthors: number
  totalCategories: number
}

export interface RecentPost {
  id: number
  title: string
  slug: string
  status: string
  published_at: string | null
  created_at: string
  category?: {
    name: string
    slug: string
  }
}

export interface ViewsData {
  date: string
  views: number
}

/**
 * Get total post count
 */
export async function getPostCount(): Promise<number> {
  const { count, error } = await supabase
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error fetching post count:', error)
    return 0
  }

  return count || 0
}

/**
 * Get published post count
 */
export async function getPublishedPostCount(): Promise<number> {
  const { count, error } = await supabase
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  if (error) {
    console.error('Error fetching published post count:', error)
    return 0
  }

  return count || 0
}

/**
 * Get draft post count
 */
export async function getDraftPostCount(): Promise<number> {
  const { count, error } = await supabase
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft')

  if (error) {
    console.error('Error fetching draft post count:', error)
    return 0
  }

  return count || 0
}

/**
 * Get total views across all posts
 */
export async function getTotalViews(): Promise<number> {
  const { data, error } = await supabase
    .from('sm_posts')
    .select('views')

  if (error) {
    console.error('Error fetching total views:', error)
    return 0
  }

  return data?.reduce((sum, post) => sum + (post.views || 0), 0) || 0
}

/**
 * Get author count
 */
export async function getAuthorCount(): Promise<number> {
  const { count, error } = await supabase
    .from('sm_authors')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error fetching author count:', error)
    return 0
  }

  return count || 0
}

/**
 * Get category count
 */
export async function getCategoryCount(): Promise<number> {
  const { count, error } = await supabase
    .from('sm_categories')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error fetching category count:', error)
    return 0
  }

  return count || 0
}

/**
 * Get recent posts
 */
export async function getRecentPosts(limit: number = 10): Promise<RecentPost[]> {
  const { data, error } = await supabase
    .from('sm_posts')
    .select(`
      id,
      title,
      slug,
      status,
      published_at,
      created_at,
      category:sm_categories(name, slug)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent posts:', error)
    return []
  }

  return (data || []).map(post => ({
    ...post,
    category: Array.isArray(post.category) ? post.category[0] : post.category
  })) as unknown as RecentPost[]
}

/**
 * Get top posts by views
 */
export async function getTopPosts(limit: number = 5): Promise<{ id: number; title: string; views: number }[]> {
  const { data, error } = await supabase
    .from('sm_posts')
    .select('id, title, views')
    .order('views', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching top posts:', error)
    return []
  }

  return data || []
}

/**
 * Get posts by category for pie chart
 */
export async function getPostsByCategory(): Promise<{ name: string; count: number }[]> {
  const { data, error } = await supabase
    .from('sm_categories')
    .select(`
      name,
      posts:sm_posts(count)
    `)

  if (error) {
    console.error('Error fetching posts by category:', error)
    return []
  }

  return (data || []).map((cat: { name: string; posts: { count: number }[] }) => ({
    name: cat.name,
    count: cat.posts?.[0]?.count || 0,
  }))
}

/**
 * Get all dashboard stats in one call
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalPosts, publishedPosts, draftPosts, totalViews, totalAuthors, totalCategories] = await Promise.all([
    getPostCount(),
    getPublishedPostCount(),
    getDraftPostCount(),
    getTotalViews(),
    getAuthorCount(),
    getCategoryCount(),
  ])

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews,
    totalAuthors,
    totalCategories,
  }
}
