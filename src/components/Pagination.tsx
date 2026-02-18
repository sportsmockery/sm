import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageUrl = (page: number) => {
    if (page === 1) return basePath
    return `${basePath}?page=${page}`
  }

  const pages: (number | 'ellipsis')[] = []

  // Always show first page
  pages.push(1)

  // Add ellipsis if needed
  if (currentPage > 3) {
    pages.push('ellipsis')
  }

  // Add pages around current page
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    if (!pages.includes(i)) {
      pages.push(i)
    }
  }

  // Add ellipsis if needed
  if (currentPage < totalPages - 2) {
    pages.push('ellipsis')
  }

  // Always show last page
  if (totalPages > 1 && !pages.includes(totalPages)) {
    pages.push(totalPages)
  }

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      {/* Previous button */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow"
          style={{ color: 'var(--sm-text-dim)', backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}
          aria-label="Previous page"
        >
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed" style={{ color: 'var(--sm-text-muted)', backgroundColor: 'var(--sm-surface)', border: '1px solid var(--sm-border)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </span>
      )}

      {/* Page numbers */}
      <div className="hidden sm:flex items-center gap-1 px-2">
        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 py-2" style={{ color: 'var(--sm-text-muted)' }}
            >
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={getPageUrl(page)}
              className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                page === currentPage
                  ? 'bg-gradient-to-r from-[#FF0000] to-[#8B0000] text-white shadow-lg hover:shadow-xl scale-105'
                  : 'text-[var(--sm-text-dim)] hover:text-[var(--sm-text)] hover:bg-[var(--sm-card-hover)]'
              }`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
              {page === currentPage && (
                <span className="absolute inset-0 rounded-xl bg-white opacity-0 hover:opacity-10 transition-opacity" />
              )}
            </Link>
          )
        )}
      </div>

      {/* Mobile page indicator */}
      <div className="sm:hidden flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: 'var(--sm-surface)' }}>
        <span className="text-sm font-semibold text-[#8B0000]">{currentPage}</span>
        <span className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>/</span>
        <span className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>{totalPages}</span>
      </div>

      {/* Next button */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow"
          style={{ color: 'var(--sm-text-dim)', backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed" style={{ color: 'var(--sm-text-muted)', backgroundColor: 'var(--sm-surface)', border: '1px solid var(--sm-border)' }}>
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </nav>
  )
}
