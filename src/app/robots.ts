import { MetadataRoute } from 'next'

const BASE_URL = 'https://sportsmockery.com'

/**
 * Generate dynamic robots.txt
 */
export default function robots(): MetadataRoute.Robots {
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
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
