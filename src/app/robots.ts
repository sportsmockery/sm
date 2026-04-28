import { MetadataRoute } from 'next'
import { SITE_URL, IS_PRODUCTION_SITE } from '@/lib/site-url'

/**
 * Generate dynamic robots.txt
 *
 * Production: allow indexing of public pages, disallow auth/admin/affiliate paths.
 * Any non-production deploy (preview, staging, test.sportsmockery.com): block all crawlers.
 *
 * IMPORTANT: This is one of two layers protecting staging from being indexed.
 * The middleware also emits an `X-Robots-Tag: noindex, nofollow` header when
 * the hostname is not the production host — that's the belt to this suspenders.
 */
export default function robots(): MetadataRoute.Robots {
  // Non-production: tell every crawler to stay out, full stop.
  if (!IS_PRODUCTION_SITE) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
      sitemap: `${SITE_URL}/sitemap.xml`,
      host: SITE_URL,
    }
  }

  // Production rules
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
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
