import { MetadataRoute } from 'next'
import { headers } from 'next/headers'

const PROD_BASE_URL = 'https://sportsmockery.com'

/**
 * Dynamic robots.txt — gated by both Vercel env AND request host.
 *
 * Audit finding #11: pre-launch we want test.sportsmockery.com (and any
 * preview deploy) to return `Disallow: /` so they can't be indexed
 * accidentally before cutover.
 *
 * Decision rules (first match wins):
 *   1. Host starts with `test.` or `preview-` or any `*.vercel.app`
 *      → fully disallow.
 *   2. Vercel env is `preview` or `development` → fully disallow.
 *   3. Otherwise (production sportsmockery.com) → allow public crawl.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerList = await headers()
  const host = (headerList.get('host') || '').toLowerCase()

  const isProductionEnv = process.env.VERCEL_ENV === 'production'
  const isStagingHost =
    host.startsWith('test.') ||
    host.startsWith('preview-') ||
    host.endsWith('.vercel.app')

  // Pre-launch: dev/staging/preview must NOT be indexable.
  if (!isProductionEnv || isStagingHost) {
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
    sitemap: [`${PROD_BASE_URL}/sitemap_index.xml`, `${PROD_BASE_URL}/news-sitemap.xml`],
    host: PROD_BASE_URL,
  }
}
