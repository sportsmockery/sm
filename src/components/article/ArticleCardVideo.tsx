import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import CategoryBadge from './CategoryBadge'

interface ArticleCardVideoProps {
  title: string
  slug: string
  featuredImage?: string
  category: {
    name: string
    slug: string
  }
  publishedAt: string
  duration?: string // e.g., "5:32"
  className?: string
}

export default function ArticleCardVideo({
  title,
  slug,
  featuredImage,
  category,
  publishedAt,
  duration = '0:00',
  className = '',
}: ArticleCardVideoProps) {
  return (
    <article
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${className}`}
      style={{ backgroundColor: 'var(--sm-card)' }}
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#8B0000]/0 to-[#FF0000]/0 opacity-0 blur-xl transition-opacity duration-300 group-hover:from-[#8B0000]/20 group-hover:to-[#FF0000]/20 group-hover:opacity-100" />

      <div className="relative">
        {/* Video Thumbnail */}
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

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: 'color-mix(in srgb, var(--sm-card) 90%, transparent)' }}>
              <svg
                className="ml-1 h-8 w-8 text-[#8B0000]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Category Badge */}
          <div className="absolute left-3 top-3">
            <CategoryBadge slug={category.slug} name={category.name} />
          </div>

          {/* Video Icon Indicator */}
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
            <svg
              className="h-3 w-3 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
            <span className="text-xs font-semibold text-white">Video</span>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-3 right-3 rounded bg-black/80 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {duration}
          </div>
        </Link>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="mb-2 line-clamp-2 font-heading text-lg font-bold leading-tight transition-colors group-hover:text-[var(--sm-accent)]" style={{ color: 'var(--sm-text)' }}>
            <Link href={`/${category.slug}/${slug}`}>{title}</Link>
          </h3>

          {/* Date */}
          <time
            dateTime={publishedAt}
            className="text-xs"
            style={{ color: 'var(--sm-text-muted)' }}
          >
            {format(new Date(publishedAt), 'MMM d, yyyy')}
          </time>
        </div>
      </div>
    </article>
  )
}
