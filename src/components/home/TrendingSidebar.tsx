import Link from 'next/link'

interface TrendingArticle {
  id: number
  title: string
  slug: string
  category: {
    slug: string
  }
  views?: number
}

interface TrendingSidebarProps {
  articles: TrendingArticle[]
  compact?: boolean
  className?: string
}

export default function TrendingSidebar({ articles, compact = false, className = '' }: TrendingSidebarProps) {
  const topArticles = articles.slice(0, compact ? 5 : 10)

  // Compact version for sidebar use
  if (compact) {
    return (
      <ol className={`space-y-3 ${className}`}>
        {topArticles.map((article, index) => (
          <li key={article.id}>
            <Link
              href={`/${article.category.slug}/${article.slug}`}
              className="group flex items-start gap-3"
            >
              {/* Rank number */}
              <span
                className={`
                  flex h-6 w-6 shrink-0 items-center justify-center rounded
                  text-xs font-bold
                  ${index < 3
                    ? 'bg-[#8B0000] text-white'
                    : ''
                  }
                `}
                style={index >= 3 ? { backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' } : undefined}
              >
                {index + 1}
              </span>

              {/* Title */}
              <span className="flex-1 text-sm font-medium leading-snug transition-colors" style={{ color: 'var(--sm-text)' }}>
                {article.title}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    )
  }

  // Full version with card styling
  return (
    <div className={`rounded-xl p-6 ${className}`} style={{ backgroundColor: 'var(--sm-card)' }}>
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🔥</span>
        <h3 className="font-heading text-lg font-bold" style={{ color: 'var(--sm-text)' }}>
          Trending Now
        </h3>
      </div>

      {/* List */}
      <ol className="space-y-4">
        {topArticles.map((article, index) => (
          <li key={article.id}>
            <Link
              href={`/${article.category.slug}/${article.slug}`}
              className="group flex items-start gap-3"
            >
              {/* Rank number */}
              <span
                className={`
                  flex h-7 w-7 shrink-0 items-center justify-center rounded-lg
                  text-sm font-bold
                  ${index < 3
                    ? 'bg-gradient-to-br from-[#FF0000] to-[#8B0000] text-white'
                    : ''
                  }
                `}
                style={index >= 3 ? { backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-dim)' } : undefined}
              >
                {index + 1}
              </span>

              {/* Title */}
              <span className="flex-1 text-sm font-medium leading-snug transition-colors" style={{ color: 'var(--sm-text-muted)' }}>
                {article.title}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {/* View all link */}
      <Link
        href="/trending"
        className="mt-6 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors"
        style={{ border: '1px solid var(--sm-border)', color: 'var(--sm-text-muted)' }}
      >
        View All Trending
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </div>
  )
}
