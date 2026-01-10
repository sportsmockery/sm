'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useOracleFeed } from '@/hooks/useOracleFeed'

// Team configuration
const teams = [
  { name: 'Bears', slug: 'chicago-bears', color: '#C83200', bgColor: '#0B162A', sport: 'NFL' },
  { name: 'Bulls', slug: 'chicago-bulls', color: '#ffffff', bgColor: '#CE1141', sport: 'NBA' },
  { name: 'Blackhawks', slug: 'chicago-blackhawks', color: '#FFD100', bgColor: '#CF0A2C', sport: 'NHL' },
  { name: 'Cubs', slug: 'chicago-cubs', color: '#CC3433', bgColor: '#0E3386', sport: 'MLB' },
  { name: 'White Sox', slug: 'chicago-white-sox', color: '#C4CED4', bgColor: '#27251F', sport: 'MLB' },
]

// Team badge colors - handles both short and full category slugs
const teamColors: Record<string, { bg: string; text: string }> = {
  'bears': { bg: '#0B162A', text: '#C83200' },
  'chicago-bears': { bg: '#0B162A', text: '#C83200' },
  'bulls': { bg: '#CE1141', text: '#ffffff' },
  'chicago-bulls': { bg: '#CE1141', text: '#ffffff' },
  'blackhawks': { bg: '#CF0A2C', text: '#ffffff' },
  'chicago-blackhawks': { bg: '#CF0A2C', text: '#ffffff' },
  'cubs': { bg: '#0E3386', text: '#ffffff' },
  'chicago-cubs': { bg: '#0E3386', text: '#ffffff' },
  'whitesox': { bg: '#27251F', text: '#C4CED4' },
  'white-sox': { bg: '#27251F', text: '#C4CED4' },
  'chicago-white-sox': { bg: '#27251F', text: '#C4CED4' },
}

// Get team colors with fallback
const getTeamColors = (slug: string | undefined | null): { bg: string; text: string } => {
  if (!slug) return { bg: '#bc0000', text: '#ffffff' }
  return teamColors[slug] || teamColors[slug.replace('chicago-', '')] || { bg: '#bc0000', text: '#ffffff' }
}

// Format category slug to display name
const formatTeamName = (slug: string | undefined | null): string => {
  if (!slug) return 'News'
  // Remove "chicago-" prefix if present
  const name = slug.replace('chicago-', '').replace(/-/g, ' ')
  // Special cases
  if (name === 'white sox' || name === 'whitesox') return 'White Sox'
  // Capitalize each word
  return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

// Format date for display
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Article card component - matches SportsMockery.com style
function ArticleCard({
  article,
  size = 'default',
  onView
}: {
  article: any
  size?: 'featured' | 'large' | 'default' | 'small'
  onView: (article: any) => void
}) {
  const colors = getTeamColors(article.category?.slug || '')

  const sizeClasses = {
    featured: 'col-span-full lg:col-span-2 lg:row-span-2',
    large: 'col-span-full md:col-span-2',
    default: '',
    small: '',
  }

  const imageAspect = {
    featured: 'aspect-[16/9] lg:aspect-[4/3]',
    large: 'aspect-[16/9]',
    default: 'aspect-[16/10]',
    small: 'aspect-[16/9]',
  }

  const titleSize = {
    featured: 'text-xl md:text-2xl lg:text-3xl',
    large: 'text-lg md:text-xl',
    default: 'text-base md:text-lg',
    small: 'text-sm md:text-base',
  }

  return (
    <article className={`group ${sizeClasses[size]}`}>
      <Link
        href={`/${article.category?.slug || 'news'}/${article.slug}`}
        onClick={() => onView(article)}
        className="block h-full"
      >
        <div className="bg-white dark:bg-[#111113] rounded-lg overflow-hidden h-full hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-[#27272a]">
          {/* Image */}
          <div className={`relative ${imageAspect[size]} overflow-hidden`}>
            <Image
              src={article.featured_image || '/placeholder.jpg'}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority={size === 'featured'}
            />
            {/* Category badge */}
            <span
              className="absolute top-3 left-3 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {formatTeamName(article.category?.slug)}
            </span>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className={`font-bold text-gray-900 dark:text-white leading-tight group-hover:text-[#bc0000] transition-colors ${titleSize[size]}`}>
              {article.title}
            </h3>

            {/* Excerpt for larger cards */}
            {(size === 'featured' || size === 'large') && article.excerpt && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {article.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {article.author?.display_name && (
                <>
                  <span className="font-medium">{article.author.display_name}</span>
                  <span>•</span>
                </>
              )}
              <span>{formatDate(article.published_at)}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

// Loading skeleton
function ArticleSkeleton({ size = 'default' }: { size?: 'featured' | 'large' | 'default' | 'small' }) {
  const sizeClasses = {
    featured: 'col-span-full lg:col-span-2 lg:row-span-2',
    large: 'col-span-full md:col-span-2',
    default: '',
    small: '',
  }

  return (
    <div className={`animate-pulse ${sizeClasses[size]}`}>
      <div className="bg-white dark:bg-[#111113] rounded-lg overflow-hidden border border-gray-100 dark:border-[#27272a]">
        <div className="aspect-[16/10] bg-gray-200 dark:bg-[#27272a]" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-[#27272a] rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-[#27272a] rounded w-1/2" />
          <div className="h-3 bg-gray-200 dark:bg-[#27272a] rounded w-1/4" />
        </div>
      </div>
    </div>
  )
}

// Section header component
function SectionHeader({
  title,
  team,
  href,
  linkText
}: {
  title: string
  team?: typeof teams[0]
  href?: string
  linkText?: string
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {team && (
          <div
            className="w-1 h-6 rounded-full"
            style={{ backgroundColor: team.bgColor }}
          />
        )}
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="text-sm font-semibold text-[#bc0000] hover:underline"
        >
          {linkText || 'View All'} →
        </Link>
      )}
    </div>
  )
}

export default function HomePage() {
  const { feed, loading, error, trackView, isUnseen, refresh } = useOracleFeed({
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
  })

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Unable to load articles</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-[#bc0000] text-white rounded-lg hover:bg-[#a00000]"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b]">
      {/* Main Content - wider max-width for optimized desktop */}
      <main className="max-w-[1800px] mx-auto px-4 lg:px-8 py-6 lg:py-8">

        {/* ========== FEATURED / HERO SECTION ========== */}
        <section className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Main featured article */}
            {loading ? (
              <ArticleSkeleton size="featured" />
            ) : feed?.featured ? (
              <article className="lg:col-span-2 lg:row-span-2 group">
                <Link
                  href={`/${feed.featured.category?.slug || 'news'}/${feed.featured.slug}`}
                  onClick={() => feed.featured && trackView(feed.featured)}
                  className="block h-full"
                >
                  <div className="relative h-full min-h-[300px] lg:min-h-[500px] rounded-xl overflow-hidden">
                    <Image
                      src={feed.featured.featured_image || '/placeholder.jpg'}
                      alt={feed.featured.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      priority
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* Content overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                      <span
                        className="inline-block w-fit px-3 py-1 text-xs font-bold uppercase tracking-wider rounded mb-4"
                        style={{
                          backgroundColor: getTeamColors(feed.featured.category?.slug).bg,
                          color: getTeamColors(feed.featured.category?.slug).text
                        }}
                      >
                        {formatTeamName(feed.featured.category?.slug)}
                      </span>
                      <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight group-hover:text-[#bc0000] transition-colors mb-3">
                        {feed.featured.title}
                      </h1>
                      {feed.featured.excerpt && (
                        <p className="text-sm md:text-base text-gray-200 line-clamp-2 mb-4 max-w-xl">
                          {feed.featured.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <span className="font-medium">{feed.featured.author?.display_name || 'Staff'}</span>
                        <span>•</span>
                        <span>{formatDate(feed.featured.published_at)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ) : null}

            {/* Secondary featured articles */}
            {loading ? (
              <>
                <ArticleSkeleton />
                <ArticleSkeleton />
                <ArticleSkeleton />
                <ArticleSkeleton />
              </>
            ) : (
              feed?.topHeadlines?.slice(0, 4).map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  size="default"
                  onView={trackView}
                />
              ))
            )}
          </div>
        </section>

        {/* ========== LATEST NEWS ========== */}
        <section className="mb-12">
          <SectionHeader
            title="Latest News"
            href="/search"
            linkText="View All"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <ArticleSkeleton key={i} size={i === 0 ? 'large' : 'default'} />
              ))
            ) : (
              feed?.latestNews?.slice(0, 10).map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  size={index === 0 ? 'large' : 'default'}
                  onView={trackView}
                />
              ))
            )}
          </div>
        </section>

        {/* ========== TEAM SECTIONS ========== */}
        {teams.map((team) => {
          const teamArticles = feed?.teamSections?.[team.name.toLowerCase()]
          if (!teamArticles?.length && !loading) return null

          return (
            <section key={team.slug} className="mb-12">
              <SectionHeader
                title={`${team.name} News`}
                team={team}
                href={`/${team.slug.replace('chicago-', '')}`}
                linkText={`More ${team.name}`}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <ArticleSkeleton key={i} />
                  ))
                ) : (
                  teamArticles?.slice(0, 5).map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onView={trackView}
                    />
                  ))
                )}
              </div>
            </section>
          )
        })}

        {/* ========== LOAD MORE ========== */}
        <div className="text-center py-8">
          <button className="px-8 py-3 bg-[#bc0000] hover:bg-[#a00000] text-white font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl">
            Load More Articles
          </button>
        </div>
      </main>
    </div>
  )
}
