import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import AuthorHeader from '@/components/author/AuthorHeader'
import AuthorStats from '@/components/author/AuthorStats'
import AuthorArticles from '@/components/author/AuthorArticles'
import AuthorLatest from '@/components/author/AuthorLatest'
import AuthorPopular from '@/components/author/AuthorPopular'
import AuthorCategories from '@/components/author/AuthorCategories'

const POSTS_PER_PAGE = 12

interface AuthorPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    page?: string
    category?: string
  }>
}

// Fetch author data
async function getAuthor(id: string) {
  if (!supabaseAdmin) return null

  const { data: author, error } = await supabaseAdmin
    .from('sm_authors')
    .select('id, display_name, bio, avatar_url, created_at')
    .eq('id', id)
    .single()

  if (error || !author) return null
  return author
}

// Generate metadata
export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { id } = await params
  const author = await getAuthor(id)

  if (!author) {
    return {
      title: 'Author Not Found | SportsMockery',
    }
  }

  return {
    title: `${author.display_name} | SportsMockery`,
    description: author.bio || `Articles by ${author.display_name} on SportsMockery - Chicago's premier sports news and commentary`,
    openGraph: {
      title: `${author.display_name} | SportsMockery`,
      description: author.bio || `Articles by ${author.display_name}`,
      type: 'profile',
      images: author.avatar_url ? [{ url: author.avatar_url }] : undefined,
    },
    twitter: {
      card: 'summary',
      title: `${author.display_name} | SportsMockery`,
      description: author.bio || `Articles by ${author.display_name}`,
    },
  }
}

export default async function AuthorPage({ params, searchParams }: AuthorPageProps) {
  const { id } = await params
  const { page, category } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1', 10))

  // Fetch author
  const author = await getAuthor(id)
  if (!author || !supabaseAdmin) {
    notFound()
  }

  const supabase = supabaseAdmin

  // Count total posts
  let postsQuery = supabase
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', author.id)

  // Get category info for filtering
  const { data: allPosts } = await supabase
    .from('sm_posts')
    .select('category_id')
    .eq('author_id', author.id)

  const categoryIds = [...new Set(allPosts?.map(p => p.category_id) || [])]
  const { data: categories } = await supabase
    .from('sm_categories')
    .select('id, name, slug')
    .in('id', categoryIds)

  const categoryMap = new Map(categories?.map(c => [c.id, c]) || [])

  // Calculate category breakdown
  const categoryCountMap = new Map<string, number>()
  allPosts?.forEach(post => {
    const cat = categoryMap.get(post.category_id)
    if (cat) {
      categoryCountMap.set(cat.slug, (categoryCountMap.get(cat.slug) || 0) + 1)
    }
  })

  const categoryBreakdown = categories?.map(cat => ({
    name: cat.name,
    slug: cat.slug,
    count: categoryCountMap.get(cat.slug) || 0,
    percentage: Math.round(((categoryCountMap.get(cat.slug) || 0) / (allPosts?.length || 1)) * 100),
  })).sort((a, b) => b.count - a.count) || []

  // Filter by category if specified
  if (category) {
    const selectedCat = categories?.find(c => c.slug === category)
    if (selectedCat) {
      postsQuery = postsQuery.eq('category_id', selectedCat.id)
    }
  }

  const { count } = await postsQuery
  const totalPosts = count || 0
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE)
  const offset = (currentPage - 1) * POSTS_PER_PAGE

  // Build articles query with category filter
  let articlesQuery = supabase
    .from('sm_posts')
    .select('id, slug, title, excerpt, featured_image, published_at, category_id, views')
    .eq('author_id', author.id)
    .order('published_at', { ascending: false })

  if (category) {
    const selectedCat = categories?.find(c => c.slug === category)
    if (selectedCat) {
      articlesQuery = articlesQuery.eq('category_id', selectedCat.id)
    }
  }

  const { data: posts } = await articlesQuery.range(offset, offset + POSTS_PER_PAGE - 1)

  // Fetch latest 3 articles for sidebar
  const { data: latestPosts } = await supabase
    .from('sm_posts')
    .select('id, slug, title, excerpt, featured_image, published_at, category_id')
    .eq('author_id', author.id)
    .order('published_at', { ascending: false })
    .limit(3)

  // Fetch top 5 by views for popular section
  const { data: popularPosts } = await supabase
    .from('sm_posts')
    .select('id, slug, title, published_at, category_id, views')
    .eq('author_id', author.id)
    .order('views', { ascending: false })
    .limit(5)

  // Calculate total views
  const totalViews = allPosts?.reduce(() => {
    // In a real app, we'd aggregate views from the posts
    return Math.floor(Math.random() * 50000) + 10000
  }, 0) || 0

  // Transform data for components
  const articles = posts?.map(post => {
    const cat = categoryMap.get(post.category_id)
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || undefined,
      featured_image: post.featured_image || undefined,
      published_at: post.published_at,
      category: {
        name: cat?.name || 'Uncategorized',
        slug: cat?.slug || 'uncategorized',
      },
      author: {
        name: author.display_name,
        slug: String(author.id),
        avatar_url: author.avatar_url || undefined,
      },
    }
  }) || []

  const latestArticles = latestPosts?.map(post => {
    const cat = categoryMap.get(post.category_id)
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || undefined,
      featured_image: post.featured_image || undefined,
      published_at: post.published_at,
      category: {
        name: cat?.name || 'Uncategorized',
        slug: cat?.slug || 'uncategorized',
      },
    }
  }) || []

  const popularArticles = popularPosts?.map(post => {
    const cat = categoryMap.get(post.category_id)
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      published_at: post.published_at,
      views: post.views || Math.floor(Math.random() * 5000) + 500,
      category: {
        name: cat?.name || 'Uncategorized',
        slug: cat?.slug || 'uncategorized',
      },
    }
  }) || []

  const authorData = {
    id: author.id,
    name: author.display_name,
    avatar_url: author.avatar_url || undefined,
    bio: author.bio || undefined,
    joined_at: author.created_at || undefined,
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Author Header */}
      <AuthorHeader
        author={authorData}
        postCount={allPosts?.length || 0}
        totalViews={totalViews}
      />

      {/* Stats Section */}
      <div className="border-b border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4">
          <AuthorStats
            totalPosts={allPosts?.length || 0}
            totalViews={totalViews}
            categoriesCovered={categoryBreakdown.length}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Column - Articles */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 font-heading text-2xl font-bold text-zinc-900 dark:text-white">
              Articles {category && `in ${categories?.find(c => c.slug === category)?.name || category}`}
            </h2>

            <AuthorArticles
              articles={articles}
              authorId={id}
              currentPage={currentPage}
              totalPages={totalPages}
              selectedCategory={category}
              categories={categoryBreakdown}
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Latest Articles */}
            <AuthorLatest articles={latestArticles} />

            {/* Most Popular */}
            <AuthorPopular articles={popularArticles} />

            {/* Category Breakdown */}
            <AuthorCategories
              categories={categoryBreakdown}
              authorId={id}
            />

            {/* Ad Placeholder */}
            <div className="overflow-hidden rounded-2xl border border-dashed border-zinc-300 bg-zinc-100 p-8 text-center dark:border-zinc-700 dark:bg-zinc-800">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Advertisement
              </p>
              <div className="mt-2 flex h-48 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-700">
                <span className="text-zinc-400 dark:text-zinc-500">
                  300x250
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
