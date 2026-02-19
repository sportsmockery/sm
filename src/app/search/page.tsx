import { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search Sports Mockery for articles, teams, and players across all five Chicago teams.',
}
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

  // Fetch categories and authors for filters
  const [{ data: categories }, { data: authors }] = await Promise.all([
    supabaseAdmin.from('sm_categories').select('id, name, slug'),
    supabaseAdmin.from('sm_authors').select('id, display_name'),
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

  const TEAMS = [
    { name: 'Bears', slug: 'chicago-bears', color: '#C83803' },
    { name: 'Bulls', slug: 'chicago-bulls', color: '#CE1141' },
    { name: 'Cubs', slug: 'chicago-cubs', color: '#0E3386' },
    { name: 'White Sox', slug: 'chicago-white-sox', color: '#27251F' },
    { name: 'Blackhawks', slug: 'chicago-blackhawks', color: '#CF0A2C' },
  ]

  return (
    <div style={{ backgroundColor: 'var(--sm-dark)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <header className="sm-hero-bg" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="sm-grid-overlay" />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '720px',
            margin: '0 auto',
            padding: '120px 24px 64px',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--sm-font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-1px',
              color: 'var(--sm-text)',
              margin: '0 0 32px',
              lineHeight: 1.1,
            }}
          >
            Search SportsMockery
          </h1>

          {/* Search Input - 48px height */}
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <SearchInput initialQuery={query} autoFocus={!query} />
          </div>

          {/* Popular Searches (when no query) */}
          {!query && (
            <div style={{ marginTop: '32px' }}>
              <PopularSearches />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: 'var(--sm-max-width)',
          margin: '0 auto',
          padding: '48px 24px 80px',
        }}
      >
        {query ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '32px',
            }}
          >
            {/* Desktop: sidebar + results */}
            <div
              style={{
                display: 'grid',
                gap: '32px',
              }}
              className="search-layout"
            >
              {/* Sidebar Filters */}
              <aside className="glass-card glass-card-static" style={{ alignSelf: 'start' }}>
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
              <div>
                {results.length > 0 ? (
                  <>
                    <div className="glass-card glass-card-static" style={{ marginBottom: '24px' }}>
                      <SearchResults
                        articles={results}
                        query={query}
                        totalCount={total}
                      />
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <nav
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          marginTop: '32px',
                        }}
                      >
                        {currentPage > 1 && (
                          <a
                            href={`/search?q=${encodeURIComponent(query)}${category ? `&category=${category}` : ''}${author ? `&author=${author}` : ''}${dateRange ? `&dateRange=${dateRange}` : ''}&page=${currentPage - 1}`}
                            className="btn-secondary btn-sm"
                          >
                            Previous
                          </a>
                        )}

                        <span
                          style={{
                            padding: '0 16px',
                            fontSize: '14px',
                            color: 'var(--sm-text-muted)',
                            fontFamily: 'var(--sm-font-body)',
                          }}
                        >
                          Page {currentPage} of {totalPages}
                        </span>

                        {currentPage < totalPages && (
                          <a
                            href={`/search?q=${encodeURIComponent(query)}${category ? `&category=${category}` : ''}${author ? `&author=${author}` : ''}${dateRange ? `&dateRange=${dateRange}` : ''}&page=${currentPage + 1}`}
                            className="btn-secondary btn-sm"
                          >
                            Next
                          </a>
                        )}
                      </nav>
                    )}
                  </>
                ) : (
                  <div className="glass-card glass-card-static">
                    <NoSearchResults query={query} />
                  </div>
                )}
              </div>
            </div>

            {/* Responsive grid for search layout */}
            <style>{`
              .search-layout {
                grid-template-columns: 1fr;
              }
              @media (min-width: 1024px) {
                .search-layout {
                  grid-template-columns: 280px 1fr;
                }
              }
            `}</style>
          </div>
        ) : (
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            {/* Recent Searches */}
            <div style={{ marginBottom: '32px' }}>
              <RecentSearches />
            </div>

            {/* Browse by team */}
            <div className="glass-card glass-card-static">
              <h2
                style={{
                  fontFamily: 'var(--sm-font-heading)',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--sm-text)',
                  margin: '0 0 20px',
                }}
              >
                Browse by Team
              </h2>
              <div
                style={{
                  display: 'grid',
                  gap: '12px',
                }}
                className="team-browse-grid"
              >
                {TEAMS.map((team) => (
                  <a
                    key={team.slug}
                    href={`/${team.slug}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '20px 12px',
                      borderRadius: 'var(--sm-radius-md)',
                      background: `linear-gradient(135deg, ${team.color}, ${team.color}88)`,
                      color: '#ffffff',
                      textDecoration: 'none',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      fontFamily: 'var(--sm-font-heading)',
                    }}
                    className="team-browse-link"
                  >
                    <span style={{ fontSize: '15px', fontWeight: 700 }}>{team.name}</span>
                  </a>
                ))}
              </div>

              {/* Responsive grid for team browse */}
              <style>{`
                .team-browse-grid {
                  grid-template-columns: repeat(2, 1fr);
                }
                @media (min-width: 640px) {
                  .team-browse-grid {
                    grid-template-columns: repeat(5, 1fr);
                  }
                }
                .team-browse-link:hover {
                  transform: translateY(-3px);
                  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                }
              `}</style>
            </div>

            {/* Latest articles teaser */}
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <p
                style={{
                  color: 'var(--sm-text-muted)',
                  fontFamily: 'var(--sm-font-body)',
                  fontSize: '15px',
                  marginBottom: '16px',
                }}
              >
                Or check out the latest news
              </p>
              <a href="/" className="btn-primary btn-sm">
                Browse All Articles
                <svg
                  style={{ width: '16px', height: '16px' }}
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
