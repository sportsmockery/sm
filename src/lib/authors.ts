import { supabaseAdmin } from './supabase-server'

export interface Author {
  id: number
  name: string
  slug?: string
  avatar_url?: string
  bio?: string
  post_count: number
  total_views?: number
  created_at?: string
}

export interface AuthorWithDetails extends Author {
  twitter_url?: string
  facebook_url?: string
  instagram_url?: string
  email?: string
  title?: string
}

/**
 * Fetch all authors with their post counts
 */
export async function getAuthorsWithPostCounts(): Promise<Author[]> {
  const { data: authors } = await supabaseAdmin
    .from('sm_authors')
    .select('id, display_name, bio, avatar_url, created_at')

  if (!authors) return []

  // Get post counts for each author
  const authorIds = authors.map(a => a.id)
  const { data: posts } = await supabaseAdmin
    .from('sm_posts')
    .select('author_id, views')
    .in('author_id', authorIds)

  // Calculate post counts and views per author
  const statsMap = new Map<number, { count: number; views: number }>()
  posts?.forEach(post => {
    const current = statsMap.get(post.author_id) || { count: 0, views: 0 }
    statsMap.set(post.author_id, {
      count: current.count + 1,
      views: current.views + (post.views || 0),
    })
  })

  return authors.map(author => ({
    id: author.id,
    name: author.display_name,
    avatar_url: author.avatar_url || undefined,
    bio: author.bio || undefined,
    post_count: statsMap.get(author.id)?.count || 0,
    total_views: statsMap.get(author.id)?.views || 0,
    created_at: author.created_at || undefined,
  }))
}

/**
 * Fetch a single author by ID with full details
 */
export async function getAuthorById(id: string | number): Promise<AuthorWithDetails | null> {
  const { data: author, error } = await supabaseAdmin
    .from('sm_authors')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !author) return null

  // Get post count and views
  const { data: posts } = await supabaseAdmin
    .from('sm_posts')
    .select('views')
    .eq('author_id', author.id)

  const post_count = posts?.length || 0
  const total_views = posts?.reduce((sum, p) => sum + (p.views || 0), 0) || 0

  return {
    id: author.id,
    name: author.display_name,
    slug: author.slug || undefined,
    avatar_url: author.avatar_url || undefined,
    bio: author.bio || undefined,
    title: author.title || undefined,
    twitter_url: author.twitter_url || undefined,
    facebook_url: author.facebook_url || undefined,
    instagram_url: author.instagram_url || undefined,
    email: author.email || undefined,
    post_count,
    total_views,
    created_at: author.created_at || undefined,
  }
}

/**
 * Fetch top authors by post count
 */
export async function getTopAuthors(limit: number = 5): Promise<Author[]> {
  const authors = await getAuthorsWithPostCounts()
  return authors
    .sort((a, b) => b.post_count - a.post_count)
    .slice(0, limit)
}

/**
 * Fetch authors for a specific category
 */
export async function getAuthorsByCategory(categoryId: number, limit: number = 10): Promise<Author[]> {
  // Get posts in this category
  const { data: posts } = await supabaseAdmin
    .from('sm_posts')
    .select('author_id')
    .eq('category_id', categoryId)

  if (!posts) return []

  // Count posts per author in this category
  const authorPostCount = new Map<number, number>()
  posts.forEach(post => {
    authorPostCount.set(post.author_id, (authorPostCount.get(post.author_id) || 0) + 1)
  })

  // Get unique author IDs sorted by post count
  const sortedAuthorIds = [...authorPostCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  if (sortedAuthorIds.length === 0) return []

  // Fetch author details
  const { data: authors } = await supabaseAdmin
    .from('sm_authors')
    .select('id, display_name, bio, avatar_url')
    .in('id', sortedAuthorIds)

  if (!authors) return []

  // Return authors with their post counts for this category
  const result: Author[] = []
  for (const id of sortedAuthorIds) {
    const author = authors.find(a => a.id === id)
    if (author) {
      result.push({
        id: author.id,
        name: author.display_name,
        avatar_url: author.avatar_url || undefined,
        bio: author.bio || undefined,
        post_count: authorPostCount.get(id) || 0,
      })
    }
  }
  return result
}
