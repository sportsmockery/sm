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
