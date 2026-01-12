const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://sportsmockery.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  additionalPaths: async (config) => {
    const paths = []

    // Fetch all published posts
    const { data: posts } = await supabase
      .from('sm_posts')
      .select('slug, updated_at, sm_categories(slug)')
      .eq('status', 'published')

    if (posts) {
      for (const post of posts) {
        const categorySlug = post.sm_categories?.slug
        if (categorySlug) {
          paths.push({
            loc: `/${categorySlug}/${post.slug}`,
            lastmod: post.updated_at || new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.7,
          })
        }
      }
    }

    // Fetch all categories
    const { data: categories } = await supabase
      .from('sm_categories')
      .select('slug, updated_at')

    if (categories) {
      for (const category of categories) {
        paths.push({
          loc: `/${category.slug}`,
          lastmod: category.updated_at || new Date().toISOString(),
          changefreq: 'daily',
          priority: 0.8,
        })
      }
    }

    return paths
  },
}
