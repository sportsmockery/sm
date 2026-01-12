import { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import { searchPosts, trackSearch } from '@/lib/search'
import SearchInput from '@/components/search/SearchInput'
import SearchResults from '@/components/search/SearchResults'
import NoSearchResults from '@/components/search/NoSearchResults'
import RecentSearches from '@/components/search/RecentSearches'
import PopularSearches from '@/components/search/PopularSearches'
import SearchFiltersClient from './SearchFiltersClient'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    author?: string
    dateRange?: string
    page?: string
  }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams

  return {
    title: q ? `Search: ${q} | SportsMockery` : 'Search | SportsMockery',
    description: q
      ? `Search results for "${q}" on SportsMockery - Chicago sports news and analysis`
      : 'Search SportsMockery for the latest Chicago Bears, Bulls, Cubs, White Sox, and Blackhawks news',
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category, author, dateRange, page } = await searchParams
  const query = q?.trim() || ''
  const currentPage = Math.max(1, parseInt(page || '1', 10))
  const pageSize = 12
  const offset = (currentPage - 1) * pageSize

  if (!supabaseAdmin) {
    return <div className="p-6">Database not configured</div>
  }

  const supabase = supabaseAdmin

  // Fetch categories and authors for filters
  const [{ data: categories }, { data: authors }] = await Promise.all([
    supabase.from('sm_categories').select('id, name, slug'),
    supabase.from('sm_authors').select('id, display_name'),
  ])

  const filterCategories = categories?.map((c) => ({ name: c.name, slug: c.slug })) || []
  const filterAuthors = authors?.map((a) => ({ id: a.id, name: a.display_name })) || []

  // Search if query exists
  let results: Awaited<ReturnType<typeof searchPosts>>['results'] = []
  let total = 0

  if (query) {
    const searchResults = await searchPosts({
      query,
      categorySlug: category,
      authorId: author ? parseInt(author, 10) : undefined,
      dateRange: dateRange as 'day' | 'week' | 'month' | 'year' | undefined,
      limit: pageSize,
      offset,
    })
    results = searchResults.results
    total = searchResults.total

    // Track search analytics
    await trackSearch(query, total)
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Hero Section */}
      <header className="bg-gradient-to-b from-zinc-900 to-zinc-800 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="mb-6 text-center font-heading text-4xl font-black text-white">
            Search SportsMockery
          </h1>

          {/* Search Input */}
          <SearchInput initialQuery={query} autoFocus={!query} />

          {/* Popular Searches (when no query) */}
          {!query && (
            <div className="mt-8">
              <PopularSearches />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        {query ? (
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar Filters */}
            <aside className="lg:col-span-1">
              <SearchFiltersClient
                categories={filterCategories}
                authors={filterAuthors}
                selectedCategory={category}
                selectedAuthor={author}
                dateRange={dateRange}
                query={query}
              />
            </aside>

            {/* Results */}
            <div className="lg:col-span-3">
              {results.length > 0 ? (
                <>
                  <SearchResults
                    articles={results}
                    query={query}
                    totalCount={total}
                  />

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav className="mt-8 flex items-center justify-center gap-2">
                      {currentPage > 1 && (
                        <a
                          href={`/search?q=${encodeURIComponent(query)}${category ? `&category=${category}` : ''}${author ? `&author=${author}` : ''}${dateRange ? `&dateRange=${dateRange}` : ''}&page=${currentPage - 1}`}
                          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                          Previous
                        </a>
                      )}

                      <span className="px-4 text-sm text-zinc-600 dark:text-zinc-400">
                        Page {currentPage} of {totalPages}
                      </span>

                      {currentPage < totalPages && (
                        <a
                          href={`/search?q=${encodeURIComponent(query)}${category ? `&category=${category}` : ''}${author ? `&author=${author}` : ''}${dateRange ? `&dateRange=${dateRange}` : ''}&page=${currentPage + 1}`}
                          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                          Next
                        </a>
                      )}
                    </nav>
                  )}
                </>
              ) : (
                <NoSearchResults query={query} />
              )}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            {/* Recent Searches */}
            <div className="mb-8">
              <RecentSearches />
            </div>

            {/* Browse by team */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 font-heading text-xl font-bold text-zinc-900 dark:text-white">
                Browse by Team
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                  { name: 'Bears', slug: 'chicago-bears', emoji: '🐻', color: 'from-[#0B162A] to-[#C83200]' },
                  { name: 'Bulls', slug: 'chicago-bulls', emoji: '🐂', color: 'from-[#CE1141] to-[#000000]' },
                  { name: 'Cubs', slug: 'chicago-cubs', emoji: '🧸', color: 'from-[#0E3386] to-[#CC3433]' },
                  { name: 'White Sox', slug: 'chicago-white-sox', emoji: '⚾', color: 'from-[#27251F] to-[#C4CED4]' },
                  { name: 'Blackhawks', slug: 'chicago-blackhawks', emoji: '🦅', color: 'from-[#CF0A2C] to-[#000000]' },
                ].map((team) => (
                  <a
                    key={team.slug}
                    href={`/${team.slug}`}
                    className={`flex flex-col items-center justify-center rounded-xl bg-gradient-to-br ${team.color} p-4 text-white transition-transform hover:scale-105`}
                  >
                    <span className="text-3xl">{team.emoji}</span>
                    <span className="mt-2 text-sm font-semibold">{team.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Latest articles teaser */}
            <div className="mt-8 text-center">
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                Or check out the latest news
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-[#8B0000] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#a00000] dark:bg-[#FF6666] dark:hover:bg-[#FF8888]"
              >
                Browse All Articles
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
