import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import CategoryBadge from './CategoryBadge'
import AuthorByline from './AuthorByline'
import ReadingTime from './ReadingTime'

interface ArticleCardProps {
  title: string
  slug: string
  excerpt?: string
  featuredImage?: string
  category: {
    name: string
    slug: string
  }
  author?: {
    id: string
    name: string
    avatarUrl?: string
  }
  publishedAt: string
  content?: string
  className?: string
}

export default function ArticleCard({
  title,
  slug,
  excerpt,
  featuredImage,
  category,
  author,
  publishedAt,
  content,
  className = '',
}: ArticleCardProps) {
  return (
    <article
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${className}`}
      style={{ backgroundColor: 'var(--sm-card)' }}
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#8B0000]/0 to-[#FF0000]/0 opacity-0 blur-xl transition-opacity duration-300 group-hover:from-[#8B0000]/20 group-hover:to-[#FF0000]/20 group-hover:opacity-100" />

      <div className="relative">
        {/* Featured Image */}
        <Link
          href={`/${category.slug}/${slug}`}
          className="relative block aspect-video overflow-hidden"
        >
          {featuredImage ? (
            <Image
              src={featuredImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--sm-surface), var(--sm-border))' }}>
              <span className="text-4xl font-black" style={{ color: 'var(--sm-text-dim)' }}>SM</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Category Badge */}
          <div className="absolute left-3 top-3">
            <CategoryBadge slug={category.slug} name={category.name} />
          </div>
        </Link>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="mb-2 line-clamp-2 font-heading text-lg font-bold leading-tight transition-colors group-hover:text-[var(--sm-accent)]" style={{ color: 'var(--sm-text)' }}>
            <Link href={`/${category.slug}/${slug}`}>{title}</Link>
          </h3>

          {/* Excerpt */}
          {excerpt && (
            <p className="mb-3 line-clamp-3 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
              {excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--sm-text-muted)' }}>
            {author && (
              <AuthorByline
                author={author}
                date={publishedAt}
                size="sm"
              />
            )}

            {!author && (
              <time dateTime={publishedAt}>
                {format(new Date(publishedAt), 'MMM d, yyyy')}
              </time>
            )}

            {content && (
              <>
                <span style={{ color: 'var(--sm-text-dim)' }}>•</span>
                <ReadingTime content={content} />
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
