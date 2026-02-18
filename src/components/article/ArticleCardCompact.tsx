import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'

interface ArticleCardCompactProps {
  title: string
  slug: string
  featuredImage?: string
  category: {
    name: string
    slug: string
  }
  publishedAt: string
  index?: number
  showNumber?: boolean
  className?: string
}

export default function ArticleCardCompact({
  title,
  slug,
  featuredImage,
  category,
  publishedAt,
  index,
  showNumber = false,
  className = '',
}: ArticleCardCompactProps) {
  return (
    <article
      className={`group flex gap-3 rounded-lg p-2 transition-colors hover:brightness-95 dark:hover:brightness-110 ${className}`}
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Number for rankings */}
      {showNumber && typeof index === 'number' && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#8B0000] to-[#FF0000] text-lg font-black text-white">
          {index + 1}
        </div>
      )}

      {/* Thumbnail */}
      <Link
        href={`/${category.slug}/${slug}`}
        className="relative block h-16 w-24 shrink-0 overflow-hidden rounded-lg"
      >
        {featuredImage ? (
          <Image
            src={featuredImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            sizes="96px"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: 'linear-gradient(to bottom right, var(--sm-surface), var(--sm-border))' }}
          >
            <span className="text-xs font-black" style={{ color: 'var(--sm-text-dim)' }}>SM</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        {/* Title */}
        <h4
          className="line-clamp-2 text-sm font-semibold leading-tight transition-colors"
          style={{ color: 'var(--sm-text)' }}
        >
          <Link href={`/${category.slug}/${slug}`} className="hover:text-[var(--sm-accent)]">{title}</Link>
        </h4>

        {/* Date */}
        <time
          dateTime={publishedAt}
          className="mt-1 text-xs"
          style={{ color: 'var(--sm-text-muted)' }}
        >
          {format(new Date(publishedAt), 'MMM d, yyyy')}
        </time>
      </div>
    </article>
  )
}
