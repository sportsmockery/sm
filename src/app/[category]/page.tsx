import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import CategoryFilters from '@/components/category/CategoryFilters'
import CategoryFeatured from '@/components/category/CategoryFeatured'
import CategoryGrid from '@/components/category/CategoryGrid'
import Pagination from '@/components/category/Pagination'
import NoResults from '@/components/category/NoResults'

const POSTS_PER_PAGE = 12

interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
  searchParams: Promise<{
    page?: string
    sort?: string
    time?: string
    type?: string
  }>
}

// Team descriptions for SEO
const categoryDescriptions: Record<string, string> = {
  'chicago-bears': 'Get the latest Chicago Bears news, rumors, analysis, and opinion. Your source for all things Bears football.',
  bears: 'Get the latest Chicago Bears news, rumors, analysis, and opinion. Your source for all things Bears football.',
  'chicago-bulls': 'Stay updated with Chicago Bulls news, trade rumors, game analysis, and fan takes. NBA coverage at its finest.',
  bulls: 'Stay updated with Chicago Bulls news, trade rumors, game analysis, and fan takes. NBA coverage at its finest.',
  'chicago-cubs': 'Your home for Chicago Cubs news, rumors, and analysis. Follow the Cubs through every pitch and swing.',
  cubs: 'Your home for Chicago Cubs news, rumors, and analysis. Follow the Cubs through every pitch and swing.',
  'chicago-white-sox': 'White Sox news, trade rumors, and game analysis. Complete coverage of the South Side team.',
  'white-sox': 'White Sox news, trade rumors, and game analysis. Complete coverage of the South Side team.',
  'chicago-blackhawks': 'Blackhawks news, trade rumors, and NHL analysis. Your source for Chicago hockey coverage.',
  blackhawks: 'Blackhawks news, trade rumors, and NHL analysis. Your source for Chicago hockey coverage.',
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params

  const { data: category } = await supabaseAdmin
    .from('sm_categories')
    .select('name, slug')
    .eq('slug', categorySlug)
    .single()

  if (!category) {
    return { title: 'Category Not Found' }
  }

  const description = categoryDescriptions[categorySlug] ||
    `Latest ${category.name} news, rumors, and analysis from Sports Mockery.`

  return {
    title: `${category.name} News & Rumors | Sports Mockery`,
    description,
    openGraph: {
      title: `${category.name} News & Rumors | Sports Mockery`,
      description,
      type: 'website',
      url: `https://sportsmockery.com/${category.slug}`,
      siteName: 'SportsMockery.com',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} News & Rumors`,
      description,
    },
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category: categorySlug } = await params
  const { page, sort, time } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1', 10))
  const sortBy = sort || 'latest'
  const timeFilter = time || 'all'

  // Fetch category by slug
  const { data: category, error: categoryError } = await supabaseAdmin
    .from('sm_categories')
    .select('id, name, slug, wp_id')
    .eq('slug', categorySlug)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // Build the date filter based on time selection
  let dateFilter: Date | null = null
  if (timeFilter === 'week') {
    dateFilter = new Date()
    dateFilter.setDate(dateFilter.getDate() - 7)
  } else if (timeFilter === 'month') {
    dateFilter = new Date()
    dateFilter.setMonth(dateFilter.getMonth() - 1)
  } else if (timeFilter === 'year') {
    dateFilter = new Date()
    dateFilter.setFullYear(dateFilter.getFullYear() - 1)
  }

  // Count total posts for pagination
  let countQuery = supabaseAdmin
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', category.id)
    .eq('status', 'published')

  if (dateFilter) {
    countQuery = countQuery.gte('published_at', dateFilter.toISOString())
  }

  const { count } = await countQuery

  const totalPosts = count || 0
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE)
  const offset = (currentPage - 1) * POSTS_PER_PAGE

  // Determine sort order
  const sortColumn = sortBy === 'popular' ? 'views' : 'published_at'
  const sortOrder = sortBy === 'oldest' ? true : false

  // Fetch posts for this category
  let postsQuery = supabaseAdmin
    .from('sm_posts')
    .select('id, slug, title, excerpt, featured_image, published_at, author_id, views')
    .eq('category_id', category.id)
    .eq('status', 'published')

  if (dateFilter) {
    postsQuery = postsQuery.gte('published_at', dateFilter.toISOString())
  }

  const { data: posts, error: postsError } = await postsQuery
    .order(sortColumn, { ascending: sortOrder, nullsFirst: false })
    .range(offset, offset + POSTS_PER_PAGE - 1)

  if (postsError) {
    console.error('Error fetching posts:', postsError)
  }

  // Fetch featured posts (top 3 by views, only on first page)
  const { data: featuredPosts } = currentPage === 1 && sortBy === 'latest' && timeFilter === 'all'
    ? await supabaseAdmin
        .from('sm_posts')
        .select('id, slug, title, excerpt, featured_image, published_at, author_id')
        .eq('category_id', category.id)
        .eq('status', 'published')
        .order('views', { ascending: false, nullsFirst: false })
        .limit(3)
    : { data: [] }

  // Fetch authors
  const allPostsWithAuthors = [...(posts || []), ...(featuredPosts || [])]
  const authorIds = [...new Set(allPostsWithAuthors.map(p => p.author_id).filter(Boolean))]
  const { data: authors } = authorIds.length > 0
    ? await supabaseAdmin
        .from('sm_authors')
        .select('id, display_name, slug, avatar_url')
        .in('id', authorIds)
    : { data: [] }

  const authorMap = new Map(authors?.map(a => [a.id, a]) || [])

  // Format posts for components
  const formattedPosts = (posts || []).map(post => {
    const author = authorMap.get(post.author_id)
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featured_image: post.featured_image,
      published_at: post.published_at,
      category: { name: category.name, slug: category.slug },
      author: author
        ? { name: author.display_name, slug: author.slug || String(author.id), avatar_url: author.avatar_url }
        : { name: 'Staff', slug: 'staff' },
    }
  })

  const formattedFeatured = (featuredPosts || []).map(post => {
    const author = authorMap.get(post.author_id)
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featured_image: post.featured_image,
      published_at: post.published_at,
      category: { name: category.name, slug: category.slug },
      author: author
        ? { name: author.display_name, slug: author.slug }
        : undefined,
    }
  })

  return (
    <div style={{ backgroundColor: 'var(--sm-dark)', minHeight: '100vh' }}>
      {/* Category header with sm-hero-bg */}
      <header className="sm-hero-bg" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="sm-grid-overlay" />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 'var(--sm-max-width)',
            margin: '0 auto',
            padding: '100px 24px 40px',
          }}
        >
          <div className="sm-tag" style={{ marginBottom: '16px' }}>
            <span className="pulse-dot" />
            {category.name}
          </div>
          <h2
            style={{
              fontFamily: 'var(--sm-font-heading)',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 800,
              letterSpacing: '-1px',
              color: 'var(--sm-text)',
              margin: '0 0 8px',
              lineHeight: 1.1,
            }}
          >
            {category.name} News & Rumors
          </h2>
          <p
            style={{
              fontFamily: 'var(--sm-font-body)',
              fontSize: '16px',
              color: 'var(--sm-text-muted)',
              margin: 0,
            }}
          >
            {totalPosts.toLocaleString()} articles
          </p>
        </div>
      </header>

      {/* Sort bar */}
      <CategoryFilters
        categorySlug={category.slug}
        categoryName={category.name}
        postCount={totalPosts}
      />

      {/* Main content container */}
      <main
        style={{
          maxWidth: 'var(--sm-max-width)',
          margin: '0 auto',
          padding: '40px 24px 80px',
        }}
      >
        {/* Featured Section (only on first page with default filters) */}
        {currentPage === 1 && sortBy === 'latest' && timeFilter === 'all' && formattedFeatured.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <CategoryFeatured posts={formattedFeatured} />
          </div>
        )}

        {/* Articles Grid - 3 col to 1 col */}
        {formattedPosts.length > 0 ? (
          <>
            <CategoryGrid articles={formattedPosts} />

            {/* Pagination with btn-secondary pills */}
            <div style={{ marginTop: '48px' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath={`/${categorySlug}`}
              />
            </div>
          </>
        ) : (
          <NoResults categoryName={category.name} />
        )}
      </main>
    </div>
  )
}
