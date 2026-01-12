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

// Format date for display - per spec: "Month Day, Year"
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

// Category tag component - RED bg, white text per spec (section 6.3)
function CategoryTag({ category, className = '' }: { category: string; className?: string }) {
  return (
    <span
      className={`inline-block bg-[#bc0000] text-white text-[10px] font-bold uppercase tracking-[0.5px] px-[10px] py-[4px] ${className}`}
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {category}
    </span>
  )
}

// Featured article - per spec section 5.1
// Full width, 16:9 aspect, gradient overlay, category top-left, headline bottom
function FeaturedArticle({ article, onView }: { article: any; onView: (a: any) => void }) {
  return (
    <article className="relative group">
      <Link
        href={`/${article.category?.slug || 'news'}/${article.slug}`}
        onClick={() => onView(article)}
        className="block"
      >
        {/* Image container - 16:9 aspect ratio per spec */}
        <div className="relative w-full pb-[56.25%] overflow-hidden">
          <Image
            src={article.featured_image || '/placeholder.jpg'}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            priority
          />
          {/* Gradient overlay per spec: rgba(0,0,0,0.6) from bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Category tag - top-left, 15px from edges per spec */}
          <div className="absolute top-[15px] left-[15px]">
            <CategoryTag category={formatCategoryName(article.category?.slug)} />
          </div>

          {/* Headline - bottom, over gradient per spec */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2
              className="text-white text-[28px] md:text-[32px] font-bold leading-[1.25] group-hover:underline decoration-[#bc0000] decoration-2 underline-offset-4"
              style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: '-0.3px' }}
            >
              {article.title}
            </h2>
          </div>
        </div>
      </Link>
    </article>
  )
}

// Article card - per spec section 6
// Image (70% aspect), category tag bottom-left overlapping, headline below, metadata below
function ArticleCard({ article, onView }: { article: any; onView: (a: any) => void }) {
  return (
    <article className="article-card group bg-white">
      <Link
        href={`/${article.category?.slug || 'news'}/${article.slug}`}
        onClick={() => onView(article)}
        className="block"
      >
        {/* Image container - 70% aspect ratio per spec */}
        <div className="relative w-full pb-[70%] overflow-hidden">
          <Image
            src={article.featured_image || '/placeholder.jpg'}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {/* Category tag - absolute, bottom-left, overlapping per spec */}
          <div className="absolute bottom-0 left-[10px] translate-y-1/2">
            <CategoryTag category={formatCategoryName(article.category?.slug)} />
          </div>
        </div>

        {/* Content area - padding per spec: 0 15px 15px 15px */}
        <div className="pt-5 px-0 pb-4">
          {/* Headline per spec: Montserrat 700, 18-20px, #222, hover: #bc0000 + underline */}
          <h3
            className="text-[18px] font-bold text-[#222222] leading-[1.3] line-clamp-3 group-hover:text-[#bc0000] group-hover:underline decoration-1 underline-offset-2 transition-colors"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {article.title}
          </h3>
          {/* Metadata per spec: 12-13px, #999999, "Author Name • Month Day, Year" */}
          <p className="mt-2 text-[12px] text-[#999999]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {article.author?.display_name || 'Staff'} • {formatDate(article.published_at)}
          </p>
        </div>
      </Link>
    </article>
  )
}

// Section header per spec section 5.2:
// Montserrat 700, 18-20px, #222, uppercase, 3px red bottom border, padding-bottom 10px, margin-bottom 20px
function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="border-b-[3px] border-[#bc0000] pb-[10px] mb-5">
      {href ? (
        <Link
          href={href}
          className="text-[18px] font-bold text-[#222222] uppercase hover:text-[#bc0000] transition-colors"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {title}
        </Link>
      ) : (
        <h2
          className="text-[18px] font-bold text-[#222222] uppercase"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {title}
        </h2>
      )}
    </div>
  )
}

// Loading skeleton for featured article
function FeaturedSkeleton() {
  return (
    <div className="relative w-full pb-[56.25%] skeleton">
      <div className="absolute top-[15px] left-[15px] h-5 w-20 bg-gray-300" />
      <div className="absolute bottom-6 left-6 right-6">
        <div className="h-8 w-3/4 bg-gray-300" />
      </div>
    </div>
  )
}

// Loading skeleton for article card
function CardSkeleton() {
  return (
    <div className="bg-white">
      <div className="relative w-full pb-[70%] skeleton" />
      <div className="pt-5 px-0 pb-4">
        <div className="h-5 w-full bg-gray-200 mb-2" />
        <div className="h-5 w-2/3 bg-gray-200 mb-3" />
        <div className="h-3 w-1/2 bg-gray-200" />
      </div>
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
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#666666] mb-4">Unable to load articles</p>
          <button onClick={refresh} className="btn-primary">
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
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Main content container - 1110px max per spec */}
      <main className="max-w-[1110px] mx-auto px-4 py-6">

        {/* ========== FEATURED SECTION (per spec 5.1) ========== */}
        <section className="mb-8">
          {loading ? (
            <FeaturedSkeleton />
          ) : featured ? (
            <FeaturedArticle article={featured} onView={trackView} />
          ) : null}
        </section>

        {/* ========== LATEST NEWS SECTION ========== */}
        <section className="mb-10">
          <SectionHeader title="Latest News" href="/search" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            ) : (
              latestNews.slice(0, 6).map((article) => (
                <ArticleCard key={article.id} article={article} onView={trackView} />
              ))
            )}
          </div>
        </section>

        {/* ========== TEAM SECTIONS ========== */}

        {/* Bears Section */}
        {(loading || teamSections.bears?.length > 0) && (
          <section className="mb-10">
            <SectionHeader title="Chicago Bears" href="/chicago-bears" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
            <SectionHeader title="Chicago Bulls" href="/chicago-bulls" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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

        {/* Cubs Section */}
        {(loading || teamSections.cubs?.length > 0) && (
          <section className="mb-10">
            <SectionHeader title="Chicago Cubs" href="/chicago-cubs" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
            <SectionHeader title="Chicago White Sox" href="/chicago-white-sox" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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

        {/* Blackhawks Section */}
        {(loading || teamSections.blackhawks?.length > 0) && (
          <section className="mb-10">
            <SectionHeader title="Chicago Blackhawks" href="/chicago-blackhawks" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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

        {/* ========== LOAD MORE BUTTON (per spec 11.3) ========== */}
        <div className="text-center py-8">
          <button className="btn-primary w-[200px]">
            Load More
          </button>
        </div>

      </main>
    </div>
  )
}
