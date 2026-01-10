'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useOracleFeed } from '@/hooks/useOracleFeed'

// Team configuration
const teams = [
  { name: 'Bears', slug: 'chicago-bears', color: '#C83200', bgColor: '#0B162A', sport: 'NFL' },
  { name: 'Bulls', slug: 'chicago-bulls', color: '#ffffff', bgColor: '#CE1141', sport: 'NBA' },
  { name: 'Blackhawks', slug: 'chicago-blackhawks', color: '#FFD100', bgColor: '#CF0A2C', sport: 'NHL' },
  { name: 'Cubs', slug: 'chicago-cubs', color: '#CC3433', bgColor: '#0E3386', sport: 'MLB' },
  { name: 'White Sox', slug: 'chicago-white-sox', color: '#C4CED4', bgColor: '#27251F', sport: 'MLB' },
]

// Format category slug to display name
const formatTeamName = (slug: string | undefined | null): string => {
  if (!slug) return 'NEWS'
  const name = slug.replace('chicago-', '').replace(/-/g, ' ')
  if (name === 'white sox' || name === 'whitesox') return 'WHITE SOX'
  return name.toUpperCase()
}

// Format date for display
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

// Large featured article card with overlay text
function FeaturedCard({ article, onView, size = 'large' }: { article: any; onView: (a: any) => void; size?: 'large' | 'medium' | 'small' }) {
  const heights = {
    large: 'h-[400px] md:h-[500px]',
    medium: 'h-[250px] md:h-[300px]',
    small: 'h-[200px] md:h-[250px]',
  }

  return (
    <article className="relative group overflow-hidden">
      <Link
        href={`/${article.category?.slug || 'news'}/${article.slug}`}
        onClick={() => onView(article)}
        className="block"
      >
        <div className={`relative ${heights[size]} w-full`}>
          <Image
            src={article.featured_image || '/placeholder.jpg'}
            alt={article.title}
            fill
            className="object-cover"
            priority={size === 'large'}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            <span className="inline-block text-[11px] font-semibold text-white uppercase tracking-wide mb-2 border-b-2 border-[#bc0000] pb-1">
              {formatTeamName(article.category?.slug)}
            </span>
            <h2 className={`font-bold text-white leading-tight group-hover:underline decoration-[#bc0000] decoration-2 ${
              size === 'large' ? 'text-xl md:text-2xl lg:text-3xl' :
              size === 'medium' ? 'text-lg md:text-xl' : 'text-base md:text-lg'
            }`}>
              {article.title}
            </h2>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-300">
              <span>{article.author?.display_name || 'Staff'}</span>
              <span>|</span>
              <span>{formatDate(article.published_at)}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

// Standard article card (image above, text below)
function ArticleCard({ article, onView, showExcerpt = false }: { article: any; onView: (a: any) => void; showExcerpt?: boolean }) {
  return (
    <article className="group border-b border-gray-200 dark:border-gray-700 pb-4">
      <Link
        href={`/${article.category?.slug || 'news'}/${article.slug}`}
        onClick={() => onView(article)}
        className="block"
      >
        {/* Image */}
        <div className="relative aspect-[16/10] w-full mb-3 overflow-hidden">
          <Image
            src={article.featured_image || '/placeholder.jpg'}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div>
          <span className="inline-block text-[10px] font-semibold text-[#bc0000] uppercase tracking-wide mb-1">
            {formatTeamName(article.category?.slug)}
          </span>
          <h3 className="font-semibold text-gray-900 dark:text-white leading-snug group-hover:text-[#bc0000] transition-colors text-base md:text-lg">
            {article.title}
          </h3>
          {showExcerpt && article.excerpt && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-500 dark:text-gray-400">
            <span>{article.author?.display_name || 'Staff'}</span>
            <span>|</span>
            <span>{formatDate(article.published_at)}</span>
          </div>
        </div>
      </Link>
    </article>
  )
}

// Compact article card for sidebars/lists
function CompactCard({ article, onView, index }: { article: any; onView: (a: any) => void; index?: number }) {
  return (
    <article className="group flex gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <Link
        href={`/${article.category?.slug || 'news'}/${article.slug}`}
        onClick={() => onView(article)}
        className="flex gap-3 w-full"
      >
        {index !== undefined && (
          <span className="text-2xl font-bold text-gray-200 dark:text-gray-700 w-6 flex-shrink-0">
            {index + 1}
          </span>
        )}
        <div className="relative w-20 h-14 flex-shrink-0 overflow-hidden">
          <Image
            src={article.featured_image || '/placeholder.jpg'}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[9px] font-semibold text-[#bc0000] uppercase tracking-wide">
            {formatTeamName(article.category?.slug)}
          </span>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-snug group-hover:text-[#bc0000] transition-colors line-clamp-2">
            {article.title}
          </h4>
        </div>
      </Link>
    </article>
  )
}

// Loading skeleton
function ArticleSkeleton({ type = 'card' }: { type?: 'featured' | 'card' | 'compact' }) {
  if (type === 'featured') {
    return (
      <div className="relative h-[400px] bg-gray-200 dark:bg-gray-800 animate-pulse">
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
          <div className="h-3 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-3 w-1/3 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
      </div>
    )
  }

  if (type === 'compact') {
    return (
      <div className="flex gap-3 py-3 animate-pulse">
        <div className="w-20 h-14 bg-gray-200 dark:bg-gray-800 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-2 w-12 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="animate-pulse pb-4 border-b border-gray-200 dark:border-gray-700">
      <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-800 mb-3" />
      <div className="space-y-2">
        <div className="h-2 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-2 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
    </div>
  )
}

// Section header
function SectionHeader({ title, href, team }: { title: string; href?: string; team?: typeof teams[0] }) {
  return (
    <div className="flex items-center justify-between border-b-2 border-gray-900 dark:border-white pb-2 mb-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
        {team && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: team.bgColor }} />}
        {title}
      </h2>
      {href && (
        <Link href={href} className="text-xs font-semibold text-[#bc0000] hover:underline uppercase">
          View All →
        </Link>
      )}
    </div>
  )
}

export default function HomePage() {
  const { feed, loading, error, trackView, refresh } = useOracleFeed({
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000,
  })

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Unable to load articles</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-[#bc0000] text-white hover:bg-[#a00000]"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const featured = feed?.featured
  const topHeadlines = feed?.topHeadlines || []
  const latestNews = feed?.latestNews || []

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0b]">
      <main className="max-w-[1400px] mx-auto px-4 py-6">

        {/* ========== HERO SECTION ========== */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
            {/* Main featured */}
            {loading ? (
              <ArticleSkeleton type="featured" />
            ) : featured ? (
              <FeaturedCard article={featured} onView={trackView} size="large" />
            ) : null}

            {/* Secondary featured grid */}
            <div className="grid grid-cols-2 gap-1">
              {loading ? (
                <>
                  <ArticleSkeleton type="featured" />
                  <ArticleSkeleton type="featured" />
                  <ArticleSkeleton type="featured" />
                  <ArticleSkeleton type="featured" />
                </>
              ) : (
                topHeadlines.slice(0, 4).map((article) => (
                  <FeaturedCard key={article.id} article={article} onView={trackView} size="small" />
                ))
              )}
            </div>
          </div>
        </section>

        {/* ========== MAIN CONTENT AREA ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column - Latest News */}
          <div className="lg:col-span-2">
            <SectionHeader title="Latest News" href="/search" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <ArticleSkeleton key={i} type="card" />
                ))
              ) : (
                latestNews.slice(0, 6).map((article) => (
                  <ArticleCard key={article.id} article={article} onView={trackView} />
                ))
              )}
            </div>

            {/* Team Sections */}
            {teams.slice(0, 3).map((team) => {
              const teamArticles = feed?.teamSections?.[team.name.toLowerCase()]
              if (!teamArticles?.length && !loading) return null

              return (
                <section key={team.slug} className="mt-10">
                  <SectionHeader
                    title={`${team.name} News`}
                    href={`/${team.slug.replace('chicago-', '')}`}
                    team={team}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <ArticleSkeleton key={i} type="card" />
                      ))
                    ) : (
                      teamArticles?.slice(0, 4).map((article) => (
                        <ArticleCard key={article.id} article={article} onView={trackView} />
                      ))
                    )}
                  </div>
                </section>
              )
            })}
          </div>

          {/* Right sidebar */}
          <aside className="lg:col-span-1">
            {/* Trending/Popular */}
            <div className="sticky top-24">
              <SectionHeader title="Trending" />

              <div className="bg-gray-50 dark:bg-[#111113] p-4">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <ArticleSkeleton key={i} type="compact" />
                  ))
                ) : (
                  feed?.trending?.slice(0, 5).map((article, index) => (
                    <CompactCard key={article.id} article={article} onView={trackView} index={index} />
                  ))
                )}
              </div>

              {/* More team sections in sidebar */}
              {teams.slice(3).map((team) => {
                const teamArticles = feed?.teamSections?.[team.name.toLowerCase()]
                if (!teamArticles?.length && !loading) return null

                return (
                  <div key={team.slug} className="mt-8">
                    <SectionHeader
                      title={team.name}
                      href={`/${team.slug.replace('chicago-', '')}`}
                      team={team}
                    />
                    <div className="space-y-0">
                      {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <ArticleSkeleton key={i} type="compact" />
                        ))
                      ) : (
                        teamArticles?.slice(0, 3).map((article) => (
                          <CompactCard key={article.id} article={article} onView={trackView} />
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </aside>
        </div>

        {/* Load More */}
        <div className="text-center py-10 mt-8 border-t border-gray-200 dark:border-gray-800">
          <button className="px-8 py-3 bg-[#bc0000] hover:bg-[#a00000] text-white font-semibold uppercase text-sm tracking-wide transition-colors">
            Load More Articles
          </button>
        </div>
      </main>
    </div>
  )
}
