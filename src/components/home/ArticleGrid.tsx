'use client'

import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'

interface Article {
  id: string
  title: string
  slug: string
  excerpt?: string
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
  columns?: 2 | 3
  className?: string
}

export default function ArticleGrid({ articles, columns = 2, className = '' }: ArticleGridProps) {
  const gridCols = columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'

  return (
    <div className={`grid gap-6 ${gridCols} ${className}`}>
      {articles.map((article) => (
        <article key={article.id} className="group">
          <Link href={`/${article.category.slug}/${article.slug}`}>
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 mb-3">
              {article.featured_image ? (
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl opacity-50">
                    {article.category.slug.includes('bears') && '🐻'}
                    {article.category.slug.includes('bulls') && '🐂'}
                    {article.category.slug.includes('cubs') && '🧸'}
                    {article.category.slug.includes('white-sox') && '⚾'}
                    {article.category.slug.includes('blackhawks') && '🦅'}
                    {!article.category.slug.includes('bears') &&
                      !article.category.slug.includes('bulls') &&
                      !article.category.slug.includes('cubs') &&
                      !article.category.slug.includes('white-sox') &&
                      !article.category.slug.includes('blackhawks') &&
                      '📰'}
                  </span>
                </div>
              )}
            </div>

            {/* Category */}
            <span className="text-xs font-semibold uppercase tracking-wide text-[#8B0000] dark:text-[#FF6666]">
              {article.category.name}
            </span>

            {/* Title */}
            <h3 className="mt-1 text-base font-bold leading-tight text-zinc-900 dark:text-white group-hover:text-[#8B0000] dark:group-hover:text-[#FF6666] transition-colors line-clamp-2">
              {article.title}
            </h3>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {article.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
              {article.author && <span>{article.author.name}</span>}
              {article.author && <span>·</span>}
              <time dateTime={article.published_at}>
                {format(new Date(article.published_at), 'MMM d, yyyy')}
              </time>
            </div>
          </Link>
        </article>
      ))}
    </div>
  )
}
