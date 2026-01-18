import Link from 'next/link'

interface PopularSearchesProps {
  searches?: string[]
  onSearchClick?: (query: string) => void
  className?: string
}

// Default popular searches for Chicago sports
const DEFAULT_POPULAR_SEARCHES = [
  'Bears',
  'Bulls',
  'Cubs',
  'White Sox',
  'Blackhawks',
  'Caleb Williams',
  'Zach LaVine',
  'trade rumors',
  'injury update',
  'draft picks',
]

export default function PopularSearches({
  searches = DEFAULT_POPULAR_SEARCHES,
  onSearchClick,
  className = '',
}: PopularSearchesProps) {
  return (
    <div className={className}>
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
        <svg
          className="h-4 w-4 text-[#8B0000] dark:text-[#FF6666]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
          />
        </svg>
        Popular Searches
      </h3>

      <div className="flex flex-wrap gap-2 relative z-10">
        {searches.map((query, index) =>
          onSearchClick ? (
            <button
              key={query}
              type="button"
              onClick={() => onSearchClick(query)}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-all hover:border-[#8B0000]/30 hover:bg-[#8B0000]/5 hover:text-[#8B0000] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-[#FF6666]/30 dark:hover:bg-[#FF6666]/5 dark:hover:text-[#FF6666] cursor-pointer"
            >
              {index < 3 && (
                <span className="text-[#8B0000] dark:text-[#FF6666]">🔥</span>
              )}
              {query}
            </button>
          ) : (
            <Link
              key={query}
              href={`/search?q=${encodeURIComponent(query)}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-all hover:border-[#8B0000]/30 hover:bg-[#8B0000]/5 hover:text-[#8B0000] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-[#FF6666]/30 dark:hover:bg-[#FF6666]/5 dark:hover:text-[#FF6666] cursor-pointer"
            >
              {index < 3 && (
                <span className="text-[#8B0000] dark:text-[#FF6666]">🔥</span>
              )}
              {query}
            </Link>
          )
        )}
      </div>
    </div>
  )
}
