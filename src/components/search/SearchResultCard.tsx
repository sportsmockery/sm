import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'

interface SearchResultCardProps {
  article: {
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
      avatar_url?: string
    }
  }
  query: string
  className?: string
}

// Highlight matching text
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || !text) return text

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, i) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return (
        <mark
          key={i}
          className="rounded bg-[#8B0000]/20 px-0.5 text-[#8B0000] dark:bg-[#FF6666]/20 dark:text-[#FF6666]"
        >
          {part}
        </mark>
      )
    }
    return part
  })
}

export default function SearchResultCard({
  article,
  query,
  className = '',
}: SearchResultCardProps) {
  return (
    <Link
      href={`/${article.category.slug}/${article.slug}`}
      className={`group flex gap-4 rounded-2xl border p-4 transition-all hover:border-[#8B0000]/30 hover:shadow-lg dark:hover:border-[#FF6666]/30 ${className}`}
      style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}
    >
      {/* Thumbnail */}
      {article.featured_image && (
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-32">
          <Image
            src={article.featured_image}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        {/* Category */}
        <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#8B0000] dark:text-[#FF6666]">
          {article.category.name}
        </span>

        {/* Title with highlighted match */}
        <h3 className="mb-2 line-clamp-2 font-heading text-lg font-bold transition-colors group-hover:text-[#8B0000] dark:group-hover:text-[#FF6666]" style={{ color: 'var(--sm-text)' }}>
          {highlightMatch(article.title, query)}
        </h3>

        {/* Excerpt with highlighted match */}
        {article.excerpt && (
          <p className="mb-3 line-clamp-2 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
            {highlightMatch(article.excerpt, query)}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--sm-text-muted)' }}>
          {article.author && (
            <>
              <div className="flex items-center gap-1.5">
                {article.author.avatar_url ? (
                  <Image
                    src={article.author.avatar_url}
                    alt=""
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold" style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}>
                    {article.author.name.charAt(0)}
                  </div>
                )}
                <span>{article.author.name}</span>
              </div>
              <span>•</span>
            </>
          )}
          <time dateTime={article.published_at}>
            {format(new Date(article.published_at), 'MMM d, yyyy')}
          </time>
        </div>
      </div>

      {/* Arrow indicator */}
      <div className="hidden items-center sm:flex">
        <svg
          className="h-5 w-5 transition-all group-hover:translate-x-1 group-hover:text-[#8B0000] dark:group-hover:text-[#FF6666]"
          style={{ color: 'var(--sm-text-dim)' }}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </div>
    </Link>
  )
}
