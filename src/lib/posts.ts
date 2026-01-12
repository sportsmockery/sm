import { createClient } from '@/lib/supabase'

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image: string
  category_id: string
  author_id: string
  status: 'draft' | 'published'
  published_at: string | null
  meta_title: string
  meta_description: string
  og_image: string
  views: number
  created_at: string
  updated_at: string
  category?: {
    id: string
    name: string
    slug: string
  }
  author?: {
    id: string
    name: string
    avatar_url: string
  }
}

export interface PostFilters {
  search?: string
  category?: string
  status?: 'draft' | 'published'
  author?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface PostsResult {
  posts: Post[]
  total: number
  page: number
  totalPages: number
}

export async function getPosts(filters: PostFilters = {}): Promise<PostsResult> {
  const supabase = createClient()
  const {
    search = '',
    category = '',
    status = '',
    author = '',
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 20
  } = filters

  const offset = (page - 1) * limit

  let query = supabase
    .from('sm_posts')
    .select(`
      *,
      category:sm_categories(id, name, slug),
      author:sm_authors(id, name, avatar_url)
    `, { count: 'exact' })

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }

  if (category) {
    query = query.eq('category_id', category)
  }

  if (status) {
    query = query.eq('status', status)
  }

  if (author) {
    query = query.eq('author_id', author)
  }

  query = query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) throw error

  return {
    posts: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit)
  }
}

export async function getPost(id: string): Promise<Post | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sm_posts')
    .select(`
      *,
      category:sm_categories(id, name, slug),
      author:sm_authors(id, name, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sm_posts')
    .select(`
      *,
      category:sm_categories(id, name, slug),
      author:sm_authors(id, name, avatar_url)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

export async function createPost(data: Partial<Post>): Promise<Post> {
  const supabase = createClient()

  const { data: post, error } = await supabase
    .from('sm_posts')
    .insert({
      title: data.title,
      slug: data.slug,
      content: data.content || '',
      excerpt: data.excerpt || '',
      featured_image: data.featured_image || '',
      category_id: data.category_id || null,
      author_id: data.author_id || null,
      status: data.status || 'draft',
      published_at: data.published_at,
      meta_title: data.meta_title || '',
      meta_description: data.meta_description || '',
      og_image: data.og_image || '',
      views: 0
    })
    .select()
    .single()

  if (error) throw error

  return post
}

export async function updatePost(id: string, data: Partial<Post>): Promise<Post> {
  const supabase = createClient()

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  }

  if (data.title !== undefined) updateData.title = data.title
  if (data.slug !== undefined) updateData.slug = data.slug
  if (data.content !== undefined) updateData.content = data.content
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt
  if (data.featured_image !== undefined) updateData.featured_image = data.featured_image
  if (data.category_id !== undefined) updateData.category_id = data.category_id || null
  if (data.author_id !== undefined) updateData.author_id = data.author_id || null
  if (data.status !== undefined) updateData.status = data.status
  if (data.published_at !== undefined) updateData.published_at = data.published_at
  if (data.meta_title !== undefined) updateData.meta_title = data.meta_title
  if (data.meta_description !== undefined) updateData.meta_description = data.meta_description
  if (data.og_image !== undefined) updateData.og_image = data.og_image

  const { data: post, error } = await supabase
    .from('sm_posts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return post
}

export async function deletePost(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('sm_posts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function incrementPostViews(id: string): Promise<void> {
  const supabase = createClient()

  await supabase.rpc('increment_post_views', { post_id: id })
}

export async function getRelatedPosts(postId: string, categoryId: string, limit = 3): Promise<Post[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sm_posts')
    .select(`
      *,
      category:sm_categories(id, name, slug),
      author:sm_authors(id, name, avatar_url)
    `)
    .eq('category_id', categoryId)
    .eq('status', 'published')
    .neq('id', postId)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return data || []
}
