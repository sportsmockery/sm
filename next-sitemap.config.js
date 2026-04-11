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
    const paths = [
      // Feature pages
      { loc: '/gm', changefreq: 'weekly', priority: 0.9 },
      { loc: '/mock-draft', changefreq: 'weekly', priority: 0.9 },
      { loc: '/scout-ai', changefreq: 'weekly', priority: 0.9 },
      { loc: '/fan-chat', changefreq: 'weekly', priority: 0.8 },
      { loc: '/live', changefreq: 'always', priority: 0.8 },
      { loc: '/leaderboard', changefreq: 'daily', priority: 0.7 },
      { loc: '/owner', changefreq: 'weekly', priority: 0.7 },
      { loc: '/pricing', changefreq: 'monthly', priority: 0.6 },
      // Team hub pages
      { loc: '/chicago-bears', changefreq: 'daily', priority: 0.9 },
      { loc: '/chicago-bulls', changefreq: 'daily', priority: 0.9 },
      { loc: '/chicago-cubs', changefreq: 'daily', priority: 0.9 },
      { loc: '/chicago-white-sox', changefreq: 'daily', priority: 0.9 },
      { loc: '/chicago-blackhawks', changefreq: 'daily', priority: 0.9 },
      // Team sub-pages
      ...['chicago-bears','chicago-bulls','chicago-cubs','chicago-white-sox','chicago-blackhawks']
        .flatMap(team => [
          { loc: `/${team}/roster`, changefreq: 'weekly', priority: 0.7 },
          { loc: `/${team}/schedule`, changefreq: 'daily', priority: 0.7 },
          { loc: `/${team}/scores`, changefreq: 'daily', priority: 0.7 },
          { loc: `/${team}/stats`, changefreq: 'daily', priority: 0.7 },
          { loc: `/${team}/players`, changefreq: 'weekly', priority: 0.7 },
          { loc: `/${team}/cap-tracker`, changefreq: 'weekly', priority: 0.6 },
        ]),
    ]

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
