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
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg mb-3" style={{ backgroundColor: 'var(--sm-surface)' }}>
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
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#8B0000' }}>
              {article.category.name}
            </span>

            {/* Title */}
            <h3 className="mt-1 text-base font-bold leading-tight transition-colors line-clamp-2" style={{ color: 'var(--sm-text)' }}>
              {article.title}
            </h3>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="mt-2 text-sm line-clamp-2" style={{ color: 'var(--sm-text-muted)' }}>
                {article.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: 'var(--sm-text-muted)' }}>
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
