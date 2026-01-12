'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useOracleFeed } from '@/hooks/useOracleFeed'

// Format category slug to display name
const formatCategoryName = (slug: string | undefined | null): string => {
  if (!slug) return 'NEWS'
  const name = slug.replace('chicago-', '').replace(/-/g, ' ')
  return name.toUpperCase()
}

// Format date for display - uppercase style like SportsMockery.com
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()
}

// Category badge component - white bg, black border, uppercase (SportsMockery.com exact)
function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className="inline-block bg-white text-black text-[11px] uppercase tracking-wider px-1.5 py-1 border border-black font-normal"
      style={{ fontFamily: 'ABeeZee, sans-serif' }}
    >
      {category}
    </span>
  )
}

// Large featured article card with image and overlay text - SportsMockery.com hero style
function HeroCard({ article, onView, size = 'large' }: { article: any; onView: (a: any) => void; size?: 'large' | 'medium' }) {
  return (
    <article className="relative group">
      <Link
        href={`/${article.category?.slug || 'news'}/${article.slug}`}
        onClick={() => onView(article)}
        className="block"
      >
        {/* Image container with aspect ratio */}
        <div className={`relative w-full overflow-hidden ${size === 'large' ? 'pb-[70%]' : 'pb-[70%]'}`}>
          <Image
            src={article.featured_image || '/placeholder.jpg'}
            alt={article.title}
            fill
            className="object-cover"
            priority={size === 'large'}
          />
          {/* Dark gradient overlay - SportsMockery.com style */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }}
          />

          {/* Content overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <CategoryBadge category={formatCategoryName(article.category?.slug)} />
            <h2
              className={`mt-2 font-semibold text-white leading-tight group-hover:underline decoration-[#bc0000] decoration-2 underline-offset-2 ${
                size === 'large' ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
              }`}
              style={{ lineHeight: 1.1, fontFamily: 'Montserrat, sans-serif' }}
            >
              {article.title}
            </h2>
          </div>
        </div>
      </Link>
    </article>
  )
}

// Standard article card - image on top, content below (SportsMockery.com style)
function ArticleCard({ article, onView }: { article: any; onView: (a: any) => void }) {
  return (
    <article className="group article-card">
      <Link
        href={`/${article.category?.slug || 'news'}/${article.slug}`}
        onClick={() => onView(article)}
        className="block"
      >
        {/* Image - 70% aspect ratio like SportsMockery.com */}
        <div className="relative w-full pb-[70%] mb-3 overflow-hidden">
          <Image
            src={article.featured_image || '/placeholder.jpg'}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div>
          <CategoryBadge category={formatCategoryName(article.category?.slug)} />
          <h3
            className="mt-2 text-base font-semibold text-[#222] leading-tight article-title"
            style={{ lineHeight: 1.1, fontFamily: 'Montserrat, sans-serif' }}
          >
            {article.title}
          </h3>
          <p
            className="mt-2 text-xs uppercase tracking-wider text-[#999]"
            style={{ fontFamily: 'ABeeZee, sans-serif' }}
          >
            {article.author?.display_name || 'STAFF'} - {formatDate(article.published_at)}
          </p>
        </div>
      </Link>
    </article>
  )
}

// Section header with red underline - SportsMockery.com exact style
function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-5 pb-2 border-b-[3px] border-[#bc0000]">
      {href ? (
        <Link
          href={href}
          className="text-lg font-bold text-[#222] hover:text-[#bc0000] transition-colors"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {title}
        </Link>
      ) : (
        <h2
          className="text-lg font-bold text-[#222]"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {title}
        </h2>
      )}
    </div>
  )
}

// Loading skeleton for hero
function HeroSkeleton() {
  return (
    <div className="relative w-full pb-[70%] bg-gray-200 animate-pulse">
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="h-5 w-24 bg-gray-300 mb-2" />
        <div className="h-6 w-3/4 bg-gray-300" />
      </div>
    </div>
  )
}

// Loading skeleton for article card
function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative w-full pb-[70%] bg-gray-200 mb-3" />
      <div className="h-4 w-20 bg-gray-200 mb-2" />
      <div className="h-5 w-full bg-gray-200 mb-1" />
      <div className="h-5 w-2/3 bg-gray-200 mb-2" />
      <div className="h-3 w-1/2 bg-gray-200" />
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#666] mb-4" style={{ fontFamily: 'ABeeZee, sans-serif' }}>Unable to load articles</p>
          <button
            onClick={refresh}
            className="px-6 py-2 bg-[#bc0000] text-white hover:bg-[#8a0000] transition-colors"
            style={{ fontFamily: 'ABeeZee, sans-serif' }}
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
  const teamSections = feed?.teamSections || {}

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-[1110px] mx-auto px-4 py-6">

        {/* ========== HERO GRID SECTION - SportsMockery.com Style ========== */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main featured article - large */}
            <div className="md:col-span-1">
              {loading ? (
                <HeroSkeleton />
              ) : featured ? (
                <HeroCard article={featured} onView={trackView} size="large" />
              ) : null}
            </div>

            {/* Secondary featured articles - 2x2 grid */}
            <div className="grid grid-cols-2 gap-4">
              {loading ? (
                <>
                  <HeroSkeleton />
                  <HeroSkeleton />
                  <HeroSkeleton />
                  <HeroSkeleton />
                </>
              ) : (
                topHeadlines.slice(0, 4).map((article) => (
                  <HeroCard key={article.id} article={article} onView={trackView} size="medium" />
                ))
              )}
            </div>
          </div>
        </section>

        {/* ========== LATEST NEWS SECTION - 3 column grid ========== */}
        <section className="mb-10">
          <SectionHeader title="Latest News" href="/search" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            ) : (
              latestNews.slice(0, 6).map((article) => (
                <ArticleCard key={article.id} article={article} onView={trackView} />
              ))
            )}
          </div>
        </section>

        {/* ========== TEAM SECTIONS - 3 column grid ========== */}

        {/* Bears Section */}
        {(loading || teamSections.bears?.length > 0) && (
          <section className="mb-10">
            <SectionHeader title="Chicago Bears News & Rumors" href="/bears" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
              ) : (
                teamSections.bears?.slice(0, 3).map((article: any) => (
                  <ArticleCard key={article.id} article={article} onView={trackView} />
                ))
              )}
            </div>
          </section>
        )}

        {/* Bulls Section */}
        {(loading || teamSections.bulls?.length > 0) && (
          <section className="mb-10">
            <SectionHeader title="Chicago Bulls News & Rumors" href="/bulls" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
              ) : (
                teamSections.bulls?.slice(0, 3).map((article: any) => (
                  <ArticleCard key={article.id} article={article} onView={trackView} />
                ))
              )}
            </div>
          </section>
        )}

        {/* Blackhawks Section */}
        {(loading || teamSections.blackhawks?.length > 0) && (
          <section className="mb-10">
            <SectionHeader title="Chicago Blackhawks News & Rumors" href="/blackhawks" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
              ) : (
                teamSections.blackhawks?.slice(0, 3).map((article: any) => (
                  <ArticleCard key={article.id} article={article} onView={trackView} />
                ))
              )}
            </div>
          </section>
        )}

        {/* Cubs Section */}
        {(loading || teamSections.cubs?.length > 0) && (
          <section className="mb-10">
            <SectionHeader title="Chicago Cubs News & Rumors" href="/cubs" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
              ) : (
                teamSections.cubs?.slice(0, 3).map((article: any) => (
                  <ArticleCard key={article.id} article={article} onView={trackView} />
                ))
              )}
            </div>
          </section>
        )}

        {/* White Sox Section */}
        {(loading || teamSections['white sox']?.length > 0) && (
          <section className="mb-10">
            <SectionHeader title="Chicago White Sox News & Rumors" href="/white-sox" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
              ) : (
                teamSections['white sox']?.slice(0, 3).map((article: any) => (
                  <ArticleCard key={article.id} article={article} onView={trackView} />
                ))
              )}
            </div>
          </section>
        )}

        {/* ========== LOAD MORE - SportsMockery.com style ========== */}
        <div className="text-center py-8">
          <button
            className="px-8 py-3 bg-[#bc0000] text-white font-medium hover:bg-[#8a0000] transition-colors"
            style={{ fontFamily: 'ABeeZee, sans-serif' }}
          >
            Load More
          </button>
        </div>

      </main>
    </div>
  )
}
