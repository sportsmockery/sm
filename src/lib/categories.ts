import { createClient } from '@/lib/supabase'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
  post_count?: number
  created_at: string
  updated_at: string
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sm_categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error

  return data || []
}

export async function getCategoriesWithPostCount(): Promise<Category[]> {
  const supabase = createClient()

  // Get categories
  const { data: categories, error: catError } = await supabase
    .from('sm_categories')
    .select('*')
    .order('name', { ascending: true })

  if (catError) throw catError

  // Get post counts per category
  const { data: counts, error: countError } = await supabase
    .from('sm_posts')
    .select('category_id')

  if (countError) throw countError

  // Calculate counts
  const countMap = (counts || []).reduce((acc, post) => {
    if (post.category_id) {
      acc[post.category_id] = (acc[post.category_id] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return (categories || []).map(cat => ({
    ...cat,
    post_count: countMap[cat.id] || 0
  }))
}

export async function getCategory(id: string): Promise<Category | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sm_categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sm_categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const supabase = createClient()

  const { data: category, error } = await supabase
    .from('sm_categories')
    .insert({
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      parent_id: data.parent_id || null
    })
    .select()
    .single()

  if (error) throw error

  return category
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  const supabase = createClient()

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  }

  if (data.name !== undefined) updates.name = data.name
  if (data.slug !== undefined) updates.slug = data.slug
  if (data.description !== undefined) updates.description = data.description
  if (data.parent_id !== undefined) updates.parent_id = data.parent_id || null

  const { data: category, error } = await supabase
    .from('sm_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return category
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('sm_categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export function buildCategoryTree(categories: Category[]): Category[] {
  const map = new Map<string, Category & { children?: Category[] }>()
  const roots: (Category & { children?: Category[] })[] = []

  // First pass: create map
  categories.forEach(cat => {
    map.set(cat.id, { ...cat, children: [] })
  })

  // Second pass: build tree
  categories.forEach(cat => {
    const node = map.get(cat.id)!
    if (cat.parent_id && map.has(cat.parent_id)) {
      map.get(cat.parent_id)!.children!.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}
