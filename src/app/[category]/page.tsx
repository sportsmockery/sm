import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabase-server'

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

// Format category slug to display name
function formatCategoryName(slug: string): string {
  const name = slug.replace('chicago-', '').replace(/-/g, ' ')
  return name.toUpperCase()
}

// Format date for display - uppercase style like SportsMockery.com
function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()
}

// Category badge component - white bg, black border, uppercase (SportsMockery.com exact)
function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className="inline-block bg-white text-black text-[11px] uppercase tracking-wider px-1.5 py-1 border border-black font-normal"
      style={{ fontFamily: 'ABeeZee, sans-serif' }}
    >
      {category}
    </span>
  )
}

// Article card - SportsMockery.com style
function ArticleCard({ article }: { article: any }) {
  return (
    <article className="group article-card">
      <Link href={`/${article.category.slug}/${article.slug}`} className="block">
        {/* Image - 70% aspect ratio like SportsMockery.com */}
        {article.featured_image && (
          <div className="relative w-full pb-[70%] mb-3 overflow-hidden">
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div>
          <CategoryBadge category={formatCategoryName(article.category.slug)} />
          <h3
            className="mt-2 text-base font-semibold text-[#222] leading-tight article-title"
            style={{ lineHeight: 1.1, fontFamily: 'Montserrat, sans-serif' }}
          >
            {article.title}
          </h3>
          <p
            className="mt-2 text-xs uppercase tracking-wider text-[#999]"
            style={{ fontFamily: 'ABeeZee, sans-serif' }}
          >
            {article.author?.name || 'STAFF'} - {formatDate(article.published_at)}
          </p>
        </div>
      </Link>
    </article>
  )
}

// Section header with red underline - SportsMockery.com exact style
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-5 pb-2 border-b-[3px] border-[#bc0000]">
      <h1
        className="text-lg font-bold text-[#222]"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        {title}
      </h1>
    </div>
  )
}

// Pagination - SportsMockery.com style
function Pagination({ currentPage, totalPages, basePath }: { currentPage: number; totalPages: number; basePath: string }) {
  if (totalPages <= 1) return null

  const pages = []
  const showEllipsis = totalPages > 7

  if (showEllipsis) {
    // Always show first page
    pages.push(1)

    if (currentPage > 3) {
      pages.push('...')
    }

    // Show pages around current
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push('...')
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages)
    }
  } else {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  }

  return (
    <nav className="flex justify-center gap-2 mt-10" aria-label="Pagination">
      {currentPage > 1 && (
        <Link
          href={`${basePath}?page=${currentPage - 1}`}
          className="px-3 py-2 text-sm text-[#222] border border-gray-200 hover:bg-gray-50"
          style={{ fontFamily: 'ABeeZee, sans-serif' }}
        >
          Previous
        </Link>
      )}

      {pages.map((page, idx) => (
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-3 py-2 text-sm text-[#999]">...</span>
        ) : (
          <Link
            key={page}
            href={`${basePath}?page=${page}`}
            className={`px-3 py-2 text-sm border ${
              page === currentPage
                ? 'bg-[#bc0000] text-white border-[#bc0000]'
                : 'text-[#222] border-gray-200 hover:bg-gray-50'
            }`}
            style={{ fontFamily: 'ABeeZee, sans-serif' }}
          >
            {page}
          </Link>
        )
      ))}

      {currentPage < totalPages && (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="px-3 py-2 text-sm text-[#222] border border-gray-200 hover:bg-gray-50"
          style={{ fontFamily: 'ABeeZee, sans-serif' }}
        >
          Next
        </Link>
      )}
    </nav>
  )
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
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1', 10))

  // Fetch category by slug
  const { data: category, error: categoryError } = await supabaseAdmin
    .from('sm_categories')
    .select('id, name, slug, wp_id')
    .eq('slug', categorySlug)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // Count total posts for pagination
  const { count } = await supabaseAdmin
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', category.id)
    .eq('status', 'published')

  const totalPosts = count || 0
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE)
  const offset = (currentPage - 1) * POSTS_PER_PAGE

  // Fetch posts for this category
  const { data: posts, error: postsError } = await supabaseAdmin
    .from('sm_posts')
    .select('id, slug, title, excerpt, featured_image, published_at, author_id, views')
    .eq('category_id', category.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + POSTS_PER_PAGE - 1)

  if (postsError) {
    console.error('Error fetching posts:', postsError)
  }

  // Fetch authors
  const authorIds = [...new Set((posts || []).map(p => p.author_id).filter(Boolean))]
  const { data: authors } = authorIds.length > 0
    ? await supabaseAdmin
        .from('sm_authors')
        .select('id, display_name, slug, avatar_url')
        .in('id', authorIds)
    : { data: [] }

  const authorMap = new Map(authors?.map(a => [a.id, a]) || [])

  // Format posts for display
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

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-[1110px] mx-auto px-4 py-6">
        {/* Category Header - SportsMockery.com style */}
        <SectionHeader title={`${category.name} News & Rumors`} />

        {/* Article Grid - 3 columns, 16px gap */}
        {formattedPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {formattedPosts.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[#666]" style={{ fontFamily: 'ABeeZee, sans-serif' }}>
              No articles found in this category.
            </p>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={`/${categorySlug}`}
        />
      </main>
    </div>
  )
}
