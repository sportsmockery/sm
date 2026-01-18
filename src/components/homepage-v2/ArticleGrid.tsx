'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Montserrat } from 'next/font/google'
import { motion } from 'framer-motion'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700'] })

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  featured_image?: string
  category: {
    name: string
    slug: string
  }
  author?: {
    name: string
  }
  published_at: string
}

interface ArticleGridProps {
  articles: Article[]
  title?: string
  showThumbnails?: boolean
  className?: string
}

/**
 * Article Grid
 *
 * Text-dominant grid layout:
 * - 1 column mobile, 2 tablet, 3 desktop
 * - Small 80x80 rounded thumbnails if enabled
 * - Text-heavy cards without glows
 * - Category badge, title, excerpt, meta
 */
export default function ArticleGrid({
  articles,
  title,
  showThumbnails = true,
  className = '',
}: ArticleGridProps) {
  if (articles.length === 0) {
    return null
  }

  return (
    <section className={className} aria-labelledby={title ? 'article-grid-title' : undefined}>
      {title && (
        <header className="mb-6 pb-3 border-b-4 border-red-600">
          <h2
            id="article-grid-title"
            className={`text-2xl text-black dark:text-white uppercase tracking-wide ${montserrat.className}`}
          >
            {title}
          </h2>
        </header>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <ArticleCard
            key={article.id}
            article={article}
            index={index}
            showThumbnail={showThumbnails}
          />
        ))}
      </div>
    </section>
  )
}

function ArticleCard({
  article,
  index,
  showThumbnail,
}: {
  article: Article
  index: number
  showThumbnail: boolean
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-red-600 dark:hover:border-red-600 transition-colors"
    >
      <Link
        href={`/${article.category.slug}/${article.slug}`}
        className="block p-4 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-600"
      >
        <div className="flex gap-4">
          {/* Thumbnail - 80x80 rounded */}
          {showThumbnail && article.featured_image && (
            <div className="flex-shrink-0 w-20 h-20 relative rounded overflow-hidden bg-zinc-200 dark:bg-zinc-800">
              <Image
                src={article.featured_image}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Category */}
            <span className="inline-block text-xs text-red-600 font-bold uppercase mb-1">
              {article.category.name}
            </span>

            {/* Title - 24pt */}
            <h3
              className={`text-lg text-black dark:text-white leading-snug group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-2 ${montserrat.className}`}
            >
              {article.title}
            </h3>
          </div>
        </div>

        {/* Excerpt */}
        <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400 line-clamp-2 font-serif">
          {article.excerpt}
        </p>

        {/* Meta */}
        <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
          <span>{article.author?.name || 'Staff'}</span>
          <time dateTime={article.published_at}>
            {formatDate(article.published_at)}
          </time>
        </div>
      </Link>
    </motion.article>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
