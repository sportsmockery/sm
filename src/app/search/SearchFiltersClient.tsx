'use client'

import { useRouter } from 'next/navigation'
import SearchFilters from '@/components/search/SearchFilters'
import AdvancedSearch from '@/components/search/AdvancedSearch'

interface SearchFiltersClientProps {
  categories: { name: string; slug: string }[]
  authors: { id: number; name: string }[]
  selectedCategory?: string
  selectedAuthor?: string
  dateRange?: string
  query: string
}

export default function SearchFiltersClient({
  categories,
  authors,
  selectedCategory,
  selectedAuthor,
  dateRange,
  query,
}: SearchFiltersClientProps) {
  const router = useRouter()

  const handleFilterChange = (filters: {
    category?: string
    author?: string
    dateRange?: string
  }) => {
    const params = new URLSearchParams()
    params.set('q', query)

    if (filters.category) params.set('category', filters.category)
    if (filters.author) params.set('author', filters.author)
    if (filters.dateRange) params.set('dateRange', filters.dateRange)

    router.push(`/search?${params.toString()}`)
  }

  const handleAdvancedSearch = (options: {
    exactPhrase?: string
    excludeWords?: string[]
    category?: string
    dateFrom?: string
    dateTo?: string
  }) => {
    // Build a new search query with advanced options
    let searchQuery = query

    // Add exact phrase if specified
    if (options.exactPhrase) {
      searchQuery = `"${options.exactPhrase}"`
    }

    // Exclude words (this would need backend support in a real implementation)
    // For now, we'll just redirect with the filters applied

    const params = new URLSearchParams()
    params.set('q', searchQuery)

    if (options.category) params.set('category', options.category)
    // Date range would need custom handling
    // For now, just redirect

    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <SearchFilters
        categories={categories}
        authors={authors}
        selectedCategory={selectedCategory}
        selectedAuthor={selectedAuthor}
        dateRange={dateRange}
        onFilterChange={handleFilterChange}
      />

      <AdvancedSearch
        categories={categories}
        onSearch={handleAdvancedSearch}
      />
    </div>
  )
}
