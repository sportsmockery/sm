import type { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from './constants'

const TEAM_META: Record<string, { name: string; fullName: string; sport: string }> = {
  'chicago-bears': { name: 'Bears', fullName: 'Chicago Bears', sport: 'NFL' },
  'chicago-bulls': { name: 'Bulls', fullName: 'Chicago Bulls', sport: 'NBA' },
  'chicago-cubs': { name: 'Cubs', fullName: 'Chicago Cubs', sport: 'MLB' },
  'chicago-white-sox': { name: 'White Sox', fullName: 'Chicago White Sox', sport: 'MLB' },
  'chicago-blackhawks': { name: 'Blackhawks', fullName: 'Chicago Blackhawks', sport: 'NHL' },
}

export function truncateDescription(text: string, maxLen = 160): string {
  if (!text) return ''
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLen) return clean
  const truncated = clean.slice(0, maxLen)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

/**
 * Build an article <title> capped at Google's recommended 60-char SEO limit.
 *
 * Why: appending "| Sports Mockery" to long article headlines pushes every
 * article title past 60 chars, which Google truncates in SERPs.
 *
 * Strategy:
 *   1. headline + suffix fits → use it
 *   2. headline alone fits → drop the suffix
 *   3. otherwise → truncate headline at the last whole word ≤ max,
 *      or hard-cut at (max - 3) + "..." if no usable word boundary
 */
export function buildArticleTitle(
  headline: string,
  suffix: string = '| Sports Mockery',
  max: number = 60,
): string {
  const clean = (headline || '').replace(/\s+/g, ' ').trim()
  if (!clean) return ''

  const withSuffix = `${clean} ${suffix}`
  if (withSuffix.length <= max) return withSuffix

  if (clean.length <= max) return clean

  const window = clean.slice(0, max)
  const lastSpace = window.lastIndexOf(' ')
  if (lastSpace >= 20) {
    return clean.slice(0, lastSpace).replace(/[\s,;:.\-–—]+$/, '')
  }

  const ellipsisRoom = Math.max(1, max - 3)
  return clean.slice(0, ellipsisRoom).replace(/[\s,;:.\-–—]+$/, '') + '...'
}

export function generateTeamMetadata(teamSlug: string, subPage?: string): Metadata {
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

  return {
    title,
    description,
    openGraph: {
      title: `${team.fullName}${subPageTitle} | ${SITE_NAME}`,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${team.fullName}${subPageTitle} | ${SITE_NAME}`,
      description,
    },
  }
}

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
