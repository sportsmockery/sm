'use client'

import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  className?: string
}

// Per design spec section 15.2:
// - Style: Numbered buttons
// - Current page: #bc0000 background, #ffffff text
// - Other pages: #ffffff background, #222222 text, 1px #e0e0e0 border
// - Hover: Light gray background (#f5f5f5)
// - Button size: 36-40px square
// - Spacing: 5px between

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages + 2) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('ellipsis')
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  const getPageUrl = (page: number) => {
    if (page === 1) return basePath
    return `${basePath}?page=${page}`
  }

  const pages = getPageNumbers()

  return (
    <nav
      className={`flex flex-wrap items-center justify-center gap-[5px] ${className}`}
      aria-label="Pagination"
    >
      {/* Previous button */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="flex items-center justify-center w-[40px] h-[40px] bg-white text-[#222222] border border-[#e0e0e0] text-[14px] font-medium transition-colors hover:bg-[#f5f5f5]"
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
      ) : (
        <span className="flex items-center justify-center w-[40px] h-[40px] bg-[#f5f5f5] text-[#999999] border border-[#e0e0e0] cursor-not-allowed">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </span>
      )}

      {/* Page numbers */}
      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            className="flex items-center justify-center w-[40px] h-[40px] text-[#999999] text-[14px]"
          >
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={getPageUrl(page)}
            className={`flex items-center justify-center w-[40px] h-[40px] text-[14px] font-medium transition-colors ${
              currentPage === page
                ? 'bg-[#bc0000] text-white border border-[#bc0000]'
                : 'bg-white text-[#222222] border border-[#e0e0e0] hover:bg-[#f5f5f5]'
            }`}
          >
            {page}
          </Link>
        )
      )}

      {/* Next button */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="flex items-center justify-center w-[40px] h-[40px] bg-white text-[#222222] border border-[#e0e0e0] text-[14px] font-medium transition-colors hover:bg-[#f5f5f5]"
          aria-label="Next page"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      ) : (
        <span className="flex items-center justify-center w-[40px] h-[40px] bg-[#f5f5f5] text-[#999999] border border-[#e0e0e0] cursor-not-allowed">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </span>
      )}
    </nav>
  )
}
