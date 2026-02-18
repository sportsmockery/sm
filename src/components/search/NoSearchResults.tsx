import Link from 'next/link'
import PopularSearches from './PopularSearches'

interface NoSearchResultsProps {
  query: string
  onSearchClick?: (query: string) => void
  className?: string
}

export default function NoSearchResults({
  query,
  onSearchClick,
  className = '',
}: NoSearchResultsProps) {
  const suggestions = [
    'Check your spelling',
    'Try different or more general keywords',
    'Try searching for a team name',
  ]

  return (
    <div className={`text-center ${className}`}>
      {/* Illustration */}
      <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--sm-surface)' }}>
        <svg
          className="h-16 w-16"
          style={{ color: 'var(--sm-text-dim)' }}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
          />
        </svg>
      </div>

      {/* Message */}
      <h2 className="mb-2 font-heading text-2xl font-bold" style={{ color: 'var(--sm-text)' }}>
        No results found
      </h2>
      <p className="mb-6" style={{ color: 'var(--sm-text-muted)' }}>
        We couldn&apos;t find any articles matching{' '}
        <span className="font-semibold text-[#8B0000] dark:text-[#FF6666]">
          &ldquo;{query}&rdquo;
        </span>
      </p>

      {/* Suggestions */}
      <div className="mx-auto mb-8 max-w-md rounded-xl border p-6 text-left" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-surface)' }}>
        <h3 className="mb-3 font-semibold" style={{ color: 'var(--sm-text)' }}>
          Search tips:
        </h3>
        <ul className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm"
              style={{ color: 'var(--sm-text-muted)' }}
            >
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#8B0000] dark:text-[#FF6666]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      {/* Popular searches */}
      <div className="mx-auto max-w-lg">
        <PopularSearches onSearchClick={onSearchClick} />
      </div>

      {/* Browse teams */}
      <div className="mt-8 border-t pt-8" style={{ borderColor: 'var(--sm-border)' }}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--sm-text)' }}>
          Browse by team:
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { name: 'Bears', slug: 'chicago-bears', emoji: '🐻' },
            { name: 'Bulls', slug: 'chicago-bulls', emoji: '🐂' },
            { name: 'Cubs', slug: 'chicago-cubs', emoji: '🧸' },
            { name: 'White Sox', slug: 'chicago-white-sox', emoji: '⚾' },
            { name: 'Blackhawks', slug: 'chicago-blackhawks', emoji: '🦅' },
          ].map((team) => (
            <Link
              key={team.slug}
              href={`/${team.slug}`}
              className="flex items-center gap-2 rounded-xl border px-4 py-2 font-medium transition-colors hover:border-[#8B0000]/30 dark:hover:border-[#FF6666]/30"
              style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)' }}
            >
              <span>{team.emoji}</span>
              <span>{team.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
