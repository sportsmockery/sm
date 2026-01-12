'use server'

import { supabaseAdmin } from '@/lib/supabase-server'

const POSTS_PER_PAGE = 12

export async function loadMorePosts(offset: number) {
  if (!supabaseAdmin) {
    return { posts: [], hasMore: false }
  }

  const { data: posts, error } = await supabaseAdmin
    .from('sm_posts')
    .select('id, title, slug, excerpt, featured_image, published_at, category_id')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + POSTS_PER_PAGE - 1)

  if (error) {
    console.error('Error loading more posts:', error)
    return { posts: [], hasMore: false }
  }

  // Fetch categories
  const categoryIds = [...new Set(posts?.map(p => p.category_id) || [])]
  const { data: categories } = await supabaseAdmin
    .from('sm_categories')
    .select('id, name, slug')
    .in('id', categoryIds)

  const categoryMap = new Map(categories?.map(c => [c.id, c]) || [])

  const postsWithCategories = posts?.map(post => ({
    ...post,
    category: categoryMap.get(post.category_id) || { name: 'Uncategorized', slug: 'uncategorized' }
  })) || []

  return {
    posts: postsWithCategories,
    hasMore: posts?.length === POSTS_PER_PAGE
  }
}
