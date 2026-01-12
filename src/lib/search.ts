import { supabaseAdmin } from './supabase-server'

export interface SearchResult {
  id: number
  title: string
  slug: string
  excerpt?: string
  featured_image?: string
  published_at: string
  category: {
    name: string
    slug: string
  }
  author?: {
    name: string
    avatar_url?: string
  }
}

export interface SearchOptions {
  query: string
  categorySlug?: string
  authorId?: number
  dateRange?: 'day' | 'week' | 'month' | 'year'
  limit?: number
  offset?: number
}

/**
 * Calculate date filter based on range
 */
function getDateFilter(range: string): Date | null {
  const now = new Date()
  switch (range) {
    case 'day':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case 'year':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    default:
      return null
  }
}

/**
 * Search posts with full-text search on title and content
 */
export async function searchPosts(options: SearchOptions): Promise<{
  results: SearchResult[]
  total: number
}> {
  if (!supabaseAdmin) return { results: [], total: 0 }

  const { query, categorySlug, authorId, dateRange, limit = 20, offset = 0 } = options

  // Get category ID if slug provided
  let categoryId: number | undefined
  if (categorySlug) {
    const { data: category } = await supabaseAdmin
      .from('sm_categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()
    categoryId = category?.id
  }

  // Build search query
  let searchQuery = supabaseAdmin
    .from('sm_posts')
    .select('id, title, slug, excerpt, featured_image, published_at, category_id, author_id', {
      count: 'exact',
    })
    .eq('status', 'published')
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
    .order('published_at', { ascending: false })

  // Apply filters
  if (categoryId) {
    searchQuery = searchQuery.eq('category_id', categoryId)
  }
  if (authorId) {
    searchQuery = searchQuery.eq('author_id', authorId)
  }
  if (dateRange) {
    const dateFilter = getDateFilter(dateRange)
    if (dateFilter) {
      searchQuery = searchQuery.gte('published_at', dateFilter.toISOString())
    }
  }

  // Apply pagination
  searchQuery = searchQuery.range(offset, offset + limit - 1)

  const { data: posts, count, error } = await searchQuery

  if (error || !posts) {
    console.error('Search error:', error)
    return { results: [], total: 0 }
  }

  // Get category and author info
  const categoryIds = [...new Set(posts.map((p) => p.category_id))]
  const authorIds = [...new Set(posts.map((p) => p.author_id).filter(Boolean))]

  const [{ data: categories }, { data: authors }] = await Promise.all([
    supabaseAdmin.from('sm_categories').select('id, name, slug').in('id', categoryIds),
    authorIds.length > 0
      ? supabaseAdmin.from('sm_authors').select('id, display_name, avatar_url').in('id', authorIds)
      : Promise.resolve({ data: [] }),
  ])

  const categoryMap = new Map(categories?.map((c) => [c.id, c]) || [])
  const authorMap = new Map(authors?.map((a) => [a.id, a]) || [])

  // Transform results
  const results: SearchResult[] = posts.map((post) => {
    const category = categoryMap.get(post.category_id)
    const author = post.author_id ? authorMap.get(post.author_id) : undefined

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || undefined,
      featured_image: post.featured_image || undefined,
      published_at: post.published_at,
      category: {
        name: category?.name || 'Uncategorized',
        slug: category?.slug || 'uncategorized',
      },
      author: author
        ? {
            name: author.display_name,
            avatar_url: author.avatar_url || undefined,
          }
        : undefined,
    }
  })

  return { results, total: count || 0 }
}

/**
 * Get search suggestions (autocomplete)
 */
export async function getSearchSuggestions(query: string, limit: number = 5) {
  if (!query || query.length < 2 || !supabaseAdmin) {
    return { articles: [], categories: [], authors: [] }
  }

  const [articlesResult, categoriesResult, authorsResult] = await Promise.all([
    // Search articles
    supabaseAdmin
      .from('sm_posts')
      .select('id, title, slug, featured_image, category_id')
      .eq('status', 'published')
      .ilike('title', `%${query}%`)
      .order('published_at', { ascending: false })
      .limit(limit),

    // Search categories
    supabaseAdmin
      .from('sm_categories')
      .select('id, name, slug')
      .ilike('name', `%${query}%`)
      .limit(limit),

    // Search authors
    supabaseAdmin
      .from('sm_authors')
      .select('id, display_name, avatar_url')
      .ilike('display_name', `%${query}%`)
      .limit(limit),
  ])

  // Get category slugs for articles
  const categoryIds = [
    ...new Set(articlesResult.data?.map((a) => a.category_id) || []),
  ]
  const { data: articleCategories } = await supabaseAdmin
    .from('sm_categories')
    .select('id, slug')
    .in('id', categoryIds)

  const categorySlugMap = new Map(articleCategories?.map((c) => [c.id, c.slug]) || [])

  return {
    articles: (articlesResult.data || []).map((a) => ({
      id: a.id,
      title: a.title,
      slug: `${categorySlugMap.get(a.category_id) || 'uncategorized'}/${a.slug}`,
      image: a.featured_image || undefined,
    })),
    categories: (categoriesResult.data || []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })),
    authors: (authorsResult.data || []).map((a) => ({
      id: a.id,
      name: a.display_name,
      slug: String(a.id),
      avatar: a.avatar_url || undefined,
    })),
  }
}

/**
 * Track search analytics (placeholder)
 */
export async function trackSearch(query: string, resultsCount: number) {
  // TODO: Implement actual analytics tracking
  // This could log to a database, send to analytics service, etc.
  console.log(`[Search Analytics] Query: "${query}", Results: ${resultsCount}`)
}
