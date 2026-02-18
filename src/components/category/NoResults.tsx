import Link from 'next/link'

interface NoResultsProps {
  categoryName?: string
  message?: string
  className?: string
}

export default function NoResults({
  categoryName,
  message = 'No articles found',
  className = '',
}: NoResultsProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border-dashed px-8 py-16 text-center ${className}`}
      style={{ border: '1px dashed var(--sm-border)', backgroundColor: 'var(--sm-surface)' }}
    >
      {/* Illustration */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--sm-surface)' }}>
        <svg
          className="h-12 w-12"
          style={{ color: 'var(--sm-text-dim)' }}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
      </div>

      {/* Message */}
      <h3 className="mb-2 font-heading text-xl font-bold" style={{ color: 'var(--sm-text)' }}>
        {message}
      </h3>
      <p className="mb-6 max-w-md" style={{ color: 'var(--sm-text-muted)' }}>
        {categoryName
          ? `We're working on bringing you the latest ${categoryName} content. Check back soon for updates!`
          : "We couldn't find any articles matching your criteria. Try adjusting your filters or check back later."}
      </p>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors"
          style={{ backgroundColor: 'var(--sm-accent)', color: '#ffffff' }}
        >
          Go to Homepage
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors"
          style={{ backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)', border: '1px solid var(--sm-border)' }}
        >
          Refresh Page
        </button>
      </div>

      {/* Fun fact / tip */}
      <div className="mt-8 flex items-start gap-2 rounded-lg p-4 text-left shadow-sm" style={{ backgroundColor: 'var(--sm-card)' }}>
        <span className="text-xl">💡</span>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--sm-text)' }}>
            Did you know?
          </p>
          <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
            SportsMockery publishes hundreds of articles every month. Try browsing our other team categories!
          </p>
        </div>
      </div>
    </div>
  )
}
