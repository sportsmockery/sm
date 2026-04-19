import type { Metadata } from 'next'

// ── Site-wide SEO constants ──────────────────────────────────────────────────
export const SITE_NAME = 'Sports Mockery'
export const SITE_URL = 'https://sportsmockery.com'
export const SITE_DESCRIPTION =
  "Your #1 source for Chicago Bears news, analysis, and rumors. Plus complete coverage of Bulls, Cubs, White Sox, and Blackhawks."
export const DEFAULT_OG_IMAGE = '/og-image.png'
export const TWITTER_HANDLE = '@sportsmockery'

// ── Team display names ───────────────────────────────────────────────────────
const TEAM_META: Record<string, { name: string; fullName: string; sport: string }> = {
  'chicago-bears': { name: 'Bears', fullName: 'Chicago Bears', sport: 'NFL' },
  'chicago-bulls': { name: 'Bulls', fullName: 'Chicago Bulls', sport: 'NBA' },
  'chicago-cubs': { name: 'Cubs', fullName: 'Chicago Cubs', sport: 'MLB' },
  'chicago-white-sox': { name: 'White Sox', fullName: 'Chicago White Sox', sport: 'MLB' },
  'chicago-blackhawks': { name: 'Blackhawks', fullName: 'Chicago Blackhawks', sport: 'NHL' },
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Smart-truncate a description string for meta tags.
 * Breaks at the last word boundary before maxLen, appends ellipsis if needed.
 */
export function truncateDescription(text: string, maxLen = 160): string {
  if (!text) return ''
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLen) return clean
  const truncated = clean.slice(0, maxLen)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

/**
 * Generate consistent metadata for team hub pages and sub-pages.
 */
export function generateTeamMetadata(
  teamSlug: string,
  subPage?: string,
): Metadata {
  const team = TEAM_META[teamSlug]
  if (!team) {
    return { title: 'Chicago Sports | Sports Mockery' }
  }

  const subPageTitle = subPage
    ? ` ${subPage.charAt(0).toUpperCase() + subPage.slice(1)}`
    : ''
  const title = `${team.fullName}${subPageTitle} | News, Stats & Analysis`
  const description = truncateDescription(
    `Complete ${team.fullName}${subPageTitle ? ` ${subPage}` : ''} coverage including latest news, stats, schedule, roster, and expert analysis on Sports Mockery.`,
  )

  const path = subPage
    ? `${SITE_URL}/${teamSlug}/${subPage}`
    : `${SITE_URL}/${teamSlug}`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${team.fullName}${subPageTitle} | ${SITE_NAME}`,
      description,
      type: 'website',
      url: path,
      siteName: SITE_NAME,
      images: [{ url: `${SITE_URL}${DEFAULT_OG_IMAGE}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${team.fullName}${subPageTitle} | ${SITE_NAME}`,
      description,
      images: [`${SITE_URL}${DEFAULT_OG_IMAGE}`],
    },
  }
}

/**
 * Generate consistent metadata for article/post pages.
 */
export function generateArticleMetadata(post: {
  title: string
  seo_title?: string | null
  seo_description?: string | null
  excerpt?: string | null
  featured_image?: string | null
  published_at?: string | null
  updated_at?: string | null
  slug: string
  categorySlug?: string
}): Metadata {
  const title = post.seo_title || post.title
  const description = truncateDescription(
    post.seo_description || post.excerpt || '',
  )
  const url = `${SITE_URL}/${post.categorySlug || 'news'}/${post.slug}`
  const images = post.featured_image ? [{ url: post.featured_image }] : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      ...(images && { images }),
      ...(post.published_at && { publishedTime: post.published_at }),
      ...(post.updated_at && { modifiedTime: post.updated_at }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(post.featured_image && { images: [post.featured_image] }),
    },
    alternates: {
      canonical: url,
    },
  }
}
