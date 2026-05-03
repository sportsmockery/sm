import { MetadataRoute } from 'next'

const BASE_URL = 'https://sportsmockery.com'

/**
 * Dynamic robots.txt — env-gated by Vercel.
 *
 * Production (VERCEL_ENV=production):
 *   - Allow indexing the public site
 *   - Point crawlers at the new sitemap_index.xml stack
 *   - Block admin/api/auth/profile + any betting/casino legacy URLs
 *
 * Anything else (preview, dev):
 *   - Disallow everything to keep test deploys out of search
 */
export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.VERCEL_ENV === 'production'

  if (!isProduction) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/rss'],
        disallow: [
          '/admin/',
          '/api/',
          '/profile/',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/betmgm-illinois',
          '/pointsbet-illinois-sportsbook',
          '/draftkings-illinois-sportsbook',
          '/chicago-blackhawks-odds',
          '/sports-betting',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/api/rss'],
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: [`${BASE_URL}/sitemap_index.xml`, `${BASE_URL}/news-sitemap.xml`],
    host: BASE_URL,
  }
}
