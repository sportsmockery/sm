/**
 * Single source of truth for the canonical site URL.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL — explicit override per Vercel environment
 *   2. https://sportsmockery.com — production fallback
 *
 * Set in Vercel:
 *   - Production:        NEXT_PUBLIC_SITE_URL = https://sportsmockery.com
 *   - Preview/Staging:   NEXT_PUBLIC_SITE_URL = https://test.sportsmockery.com
 *   - Development:       NEXT_PUBLIC_SITE_URL = http://localhost:3000
 */
export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://sportsmockery.com'
).replace(/\/+$/, '')

export const PRODUCTION_HOST = 'sportsmockery.com'

/**
 * True only when the current deployment is the production site
 * (sportsmockery.com). Any other env — preview, staging, dev — returns false
 * so robots.txt and meta tags can emit `noindex`.
 */
export const IS_PRODUCTION_SITE: boolean =
  SITE_URL === `https://${PRODUCTION_HOST}` ||
  SITE_URL === `https://www.${PRODUCTION_HOST}`
