interface CategoryStatsProps {
  totalArticles: number
  articlesThisWeek?: number
  topAuthor?: {
    name: string
    postCount: number
  }
  className?: string
}

export default function CategoryStats({
  totalArticles,
  articlesThisWeek = 0,
  topAuthor,
  className = '',
}: CategoryStatsProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-4 rounded-xl px-6 py-4 sm:justify-start sm:gap-8 ${className}`}
      style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}
    >
      {/* Total articles */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--sm-accent) 10%, transparent)' }}>
          <svg
            className="h-5 w-5"
            style={{ color: 'var(--sm-accent)' }}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: 'var(--sm-text)' }}>
            {totalArticles.toLocaleString()}
          </p>
          <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>Total Articles</p>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden h-10 w-px sm:block" style={{ backgroundColor: 'var(--sm-border)' }} />

      {/* This week */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
          <svg
            className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
            />
          </svg>
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: 'var(--sm-text)' }}>
            {articlesThisWeek.toLocaleString()}
          </p>
          <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>This Week</p>
        </div>
      </div>

      {/* Divider */}
      {topAuthor && (
        <div className="hidden h-10 w-px sm:block" style={{ backgroundColor: 'var(--sm-border)' }} />
      )}

      {/* Top author */}
      {topAuthor && (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
            <svg
              className="h-5 w-5 text-amber-600 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <div>
            <p className="font-bold" style={{ color: 'var(--sm-text)' }}>
              {topAuthor.name}
            </p>
            <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
              Top Author ({topAuthor.postCount} articles)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
