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
        <p className="text-zinc-600 dark:text-zinc-400">
          Found <span className="font-semibold text-zinc-900 dark:text-white">{count}</span>{' '}
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
