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
          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:hover:border-zinc-700 transition-all duration-300 shadow-sm hover:shadow"
          aria-label="Previous page"
        >
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 dark:text-zinc-700 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 cursor-not-allowed">
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
              className="px-2 py-2 text-zinc-400 dark:text-zinc-600"
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
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800'
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
      <div className="sm:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800">
        <span className="text-sm font-semibold text-[#8B0000]">{currentPage}</span>
        <span className="text-xs text-zinc-400">/</span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{totalPages}</span>
      </div>

      {/* Next button */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:hover:border-zinc-700 transition-all duration-300 shadow-sm hover:shadow"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 dark:text-zinc-700 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 cursor-not-allowed">
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </nav>
  )
}
