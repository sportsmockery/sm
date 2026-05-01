import 'server-only'
import { unstable_cache, revalidateTag } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-server'

export interface AuthorRecord {
  id: number
  slug: string | null
  display_name: string
  bio: string | null
  avatar_url: string | null
  job_title: string | null
  alumni_of: string | null
  knows_about: string[] | null
  same_as: string[] | null
  active: boolean | null
  twitter_url?: string | null
  facebook_url?: string | null
  instagram_url?: string | null
  email?: string | null
  created_at?: string | null
}

const AUTHOR_FIELDS =
  'id, slug, display_name, bio, avatar_url, job_title, alumni_of, knows_about, same_as, active, twitter_url, facebook_url, instagram_url, email, created_at'

export async function getAuthorBySlug(slug: string): Promise<AuthorRecord | null> {
  const { data, error } = await supabaseAdmin
    .from('sm_authors')
    .select(AUTHOR_FIELDS)
    .eq('slug', slug)
    .maybeSingle()
  if (error) {
    console.error('getAuthorBySlug error:', error.message, slug)
    return null
  }
  return (data as AuthorRecord | null) ?? null
}

export async function getAuthorById(id: string | number): Promise<AuthorRecord | null> {
  const { data, error } = await supabaseAdmin
    .from('sm_authors')
    .select(AUTHOR_FIELDS)
    .eq('id', id)
    .maybeSingle()
  if (error) {
    console.error('getAuthorById error:', error.message, id)
    return null
  }
  return (data as AuthorRecord | null) ?? null
}

export async function getAllActiveAuthors(): Promise<AuthorRecord[]> {
  const { data, error } = await supabaseAdmin
    .from('sm_authors')
    .select(AUTHOR_FIELDS)
    .eq('active', true)
    .not('slug', 'is', null)
  if (error) {
    console.error('getAllActiveAuthors error:', error.message)
    return []
  }
  return (data as AuthorRecord[] | null) ?? []
}

const _getSlugForAuthorId = unstable_cache(
  async (id: string): Promise<string | null> => {
    const { data, error } = await supabaseAdmin
      .from('sm_authors')
      .select('slug')
      .eq('id', id)
      .maybeSingle()
    if (error || !data?.slug) return null
    return data.slug as string
  },
  ['author-id-to-slug'],
  { revalidate: 300, tags: ['authors'] }
)

export async function getSlugForAuthorId(id: string): Promise<string | null> {
  return _getSlugForAuthorId(id)
}

export interface AuthorArticle {
  id: number
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  published_at: string
  category: { name: string; slug: string } | null
  views?: number | null
}

export async function getArticlesByAuthorId(
  id: number,
  limit = 20
): Promise<AuthorArticle[]> {
  const { data, error } = await supabaseAdmin
    .from('sm_posts')
    .select('id, title, slug, excerpt, featured_image, published_at, category_id, views')
    .eq('author_id', id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error || !data) {
    console.error('getArticlesByAuthorId error:', error?.message, id)
    return []
  }

  const categoryIds = Array.from(new Set(data.map((p) => p.category_id).filter(Boolean)))
  const { data: categories } = categoryIds.length
    ? await supabaseAdmin
        .from('sm_categories')
        .select('id, name, slug')
        .in('id', categoryIds)
    : { data: [] as Array<{ id: number; name: string; slug: string }> }

  const catMap = new Map<number, { name: string; slug: string }>(
    (categories ?? []).map((c) => [c.id, { name: c.name, slug: c.slug }])
  )

  return data.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    featured_image: p.featured_image,
    published_at: p.published_at,
    category: p.category_id ? catMap.get(p.category_id) ?? null : null,
    views: p.views,
  }))
}

export function invalidateAuthorsCache(): void {
  revalidateTag('authors', 'default')
}
