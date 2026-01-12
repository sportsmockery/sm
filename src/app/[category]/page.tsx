import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import CategoryHeader from '@/components/category/CategoryHeader'
import CategoryFilters from '@/components/category/CategoryFilters'
import CategoryFeatured from '@/components/category/CategoryFeatured'
import CategoryGrid from '@/components/category/CategoryGrid'
import CategorySidebar from '@/components/category/CategorySidebar'
import Pagination from '@/components/category/Pagination'
import NoResults from '@/components/category/NoResults'
import SubcategoryNav from '@/components/category/SubcategoryNav'
import CategoryStats from '@/components/category/CategoryStats'

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

  // Fetch trending posts for sidebar
  const { data: trendingPosts } = await supabaseAdmin
    .from('sm_posts')
    .select('id, slug, title, featured_image, published_at, views')
    .eq('category_id', category.id)
    .eq('status', 'published')
    .order('views', { ascending: false, nullsFirst: false })
    .limit(5)

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

  // Fetch other categories for sidebar
  const { data: otherCategories } = await supabaseAdmin
    .from('sm_categories')
    .select('id, name, slug')
    .neq('id', category.id)
    .limit(5)

  // Get articles count per category
  const relatedCategories = await Promise.all(
    (otherCategories || []).map(async (cat) => {
      const { count } = await supabaseAdmin
        .from('sm_posts')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.id)
        .eq('status', 'published')
      return { ...cat, post_count: count || 0 }
    })
  )

  // Calculate this week's article count
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const { count: weekCount } = await supabaseAdmin
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', category.id)
    .eq('status', 'published')
    .gte('published_at', weekAgo.toISOString())

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

  const formattedTrending = (trendingPosts || []).map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    featured_image: post.featured_image,
    published_at: post.published_at,
    views: post.views,
    category: { name: category.name, slug: category.slug },
  }))

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Premium Category Header */}
      <CategoryHeader
        categorySlug={category.slug}
        categoryName={category.name}
        postCount={totalPosts}
        description={categoryDescriptions[categorySlug]}
      />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats Bar */}
        <CategoryStats
          totalArticles={totalPosts}
          articlesThisWeek={weekCount || 0}
          className="mb-6"
        />

        {/* Subcategory Navigation */}
        <SubcategoryNav categorySlug={category.slug} className="mb-6" />

        {/* Filters */}
        <CategoryFilters categorySlug={category.slug} className="mb-8" />

        {/* Featured Section (only on first page with default filters) */}
        {currentPage === 1 && sortBy === 'latest' && timeFilter === 'all' && formattedFeatured.length > 0 && (
          <CategoryFeatured posts={formattedFeatured} className="mb-10" />
        )}

        {/* Main Content Grid */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Articles Grid */}
          <div className="lg:col-span-8">
            {formattedPosts.length > 0 ? (
              <>
                <CategoryGrid articles={formattedPosts} />

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath={`/${categorySlug}`}
                  className="mt-12"
                />
              </>
            ) : (
              <NoResults categoryName={category.name} />
            )}
          </div>

          {/* Sidebar */}
          <div className="mt-10 lg:col-span-4 lg:mt-0">
            <CategorySidebar
              trendingPosts={formattedTrending}
              relatedCategories={relatedCategories}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
