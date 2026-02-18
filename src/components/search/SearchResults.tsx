import SearchResultCard from './SearchResultCard'

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
    avatar_url?: string
  }
}

interface SearchResultsProps {
  articles: Article[]
  query: string
  totalCount?: number
  className?: string
}

export default function SearchResults({
  articles,
  query,
  totalCount,
  className = '',
}: SearchResultsProps) {
  const count = totalCount ?? articles.length

  return (
    <div className={className}>
      {/* Results header */}
      <div className="mb-6 flex items-center justify-between">
        <p style={{ color: 'var(--sm-text-muted)' }}>
          Found <span className="font-semibold" style={{ color: 'var(--sm-text)' }}>{count}</span>{' '}
          {count === 1 ? 'result' : 'results'} for{' '}
          <span className="font-semibold text-[#8B0000] dark:text-[#FF6666]">
            &ldquo;{query}&rdquo;
          </span>
        </p>
      </div>

      {/* Results list */}
      <div className="space-y-4">
        {articles.map((article) => (
          <SearchResultCard
            key={article.id}
            article={article}
            query={query}
          />
        ))}
      </div>
    </div>
  )
}
