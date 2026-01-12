'use client'

import { useState } from 'react'
import ArticleCard from '@/components/article/ArticleCard'

interface Article {
  id: number
  title: string
  slug: string
  excerpt?: string
  featured_image?: string
  published_at: string
  category: {
    name: string
    slug: string
  }
  author?: {
    name: string
    slug: string
    avatar_url?: string
  }
}

interface LatestNewsProps {
  articles: Article[]
  title?: string
  className?: string
}

export default function LatestNews({
  articles,
  title = 'Latest News',
  className = '',
}: LatestNewsProps) {
  const [visibleCount, setVisibleCount] = useState(6)

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 6, articles.length))
  }

  const visibleArticles = articles.slice(0, visibleCount)
  const hasMore = visibleCount < articles.length

  return (
    <section className={className}>
      {/* Section header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-[#FF0000] to-[#8B0000]" />
        <h2 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white">
          {title}
        </h2>
      </div>

      {/* Articles grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleArticles.map((article, index) => (
          <div
            key={article.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ArticleCard
              title={article.title}
              slug={article.slug}
              excerpt={article.excerpt}
              featuredImage={article.featured_image}
              publishedAt={article.published_at}
              category={article.category}
              author={article.author ? {
                id: article.author.slug,
                name: article.author.name,
                avatarUrl: article.author.avatar_url,
              } : undefined}
            />
          </div>
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3 font-semibold text-zinc-700 transition-all hover:border-[#8B0000] hover:bg-[#8B0000] hover:text-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-[#FF6666] dark:hover:bg-[#FF6666] dark:hover:text-white"
          >
            Load More
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
              />
            </svg>
          </button>
        </div>
      )}
    </section>
  )
}
