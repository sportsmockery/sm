import { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'

const BASE_URL = 'https://sportsmockery.com'

/**
 * Generate dynamic sitemap for SEO
 * Includes static pages, team pages, and all published articles
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/bears`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/chicago-bears`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/chicago-bulls`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/chicago-cubs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/chicago-white-sox`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/chicago-blackhawks`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Fetch all published posts
  const { data: posts } = await supabaseAdmin
    .from('sm_posts')
    .select('slug, published_at, updated_at, category:sm_categories(slug)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(5000) // Limit to prevent timeout

  // Map posts to sitemap entries
  const postPages: MetadataRoute.Sitemap = (posts || []).map((post) => {
    const categorySlug = (post.category as any)?.slug || 'news'
    const lastMod = post.updated_at || post.published_at

    return {
      url: `${BASE_URL}/${categorySlug}/${post.slug}`,
      lastModified: new Date(lastMod),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }
  })

  // Fetch authors
  const { data: authors } = await supabaseAdmin
    .from('sm_authors')
    .select('id, slug')
    .limit(500)

  const authorPages: MetadataRoute.Sitemap = (authors || []).map((author) => ({
    url: `${BASE_URL}/author/${author.slug || author.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...postPages, ...authorPages]
}
