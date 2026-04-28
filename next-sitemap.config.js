const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Resolve site URL once. NEXT_PUBLIC_SITE_URL is the canonical env var
// (matches the runtime resolution in src/lib/site-url.ts). SITE_URL is
// preserved as a fallback for backwards compatibility with any existing
// deploys that still set the old name.
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  'https://sportsmockery.com'
).replace(/\/+$/, '')

const isProductionSite =
  siteUrl === 'https://sportsmockery.com' ||
  siteUrl === 'https://www.sportsmockery.com'

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl,
  // Only emit a permissive robots.txt for production. Non-production builds
  // emit Disallow: / so any leaked staging deploy stays out of the index.
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: isProductionSite
      ? [{ userAgent: '*', allow: '/' }]
      : [{ userAgent: '*', disallow: '/' }],
  },
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
