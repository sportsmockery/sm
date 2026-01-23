import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import StudioPostsClient from './StudioPostsClient'

export const metadata: Metadata = {
  title: 'Sports Mockery | Posts',
}

interface PostsPageProps {
  searchParams: Promise<{
    status?: string
    search?: string
    page?: string
  }>
}

const POSTS_PER_PAGE = 20

export default async function StudioPostsPage({ searchParams }: PostsPageProps) {
  const { status, search, page } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1', 10))
  const offset = (currentPage - 1) * POSTS_PER_PAGE

  // Get current user
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()

  // Find author matching current user's email and check role
  const { data: currentAuthor } = await supabaseAdmin
    .from('sm_authors')
    .select('id, display_name, role')
    .eq('email', user?.email || '')
    .single()

  const isEditor = currentAuthor?.role === 'editor' || currentAuthor?.role === 'admin'

  // Build query - authors only see their own posts, editors see all
  let query = supabaseAdmin
    .from('sm_posts')
    .select('id, title, slug, status, published_at, created_at, category_id, author_id, featured_image, excerpt', { count: 'exact' })

  if (!isEditor && currentAuthor?.id) {
    query = query.eq('author_id', currentAuthor.id)
  }

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  const { data: posts, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + POSTS_PER_PAGE - 1)

  const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE)

  // Fetch categories and authors for display
  const categoryIds = [...new Set(posts?.map(p => p.category_id).filter(Boolean) || [])]
  const authorIds = [...new Set(posts?.map(p => p.author_id).filter(Boolean) || [])]

  const [categoriesResult, authorsResult] = await Promise.all([
    categoryIds.length > 0
      ? supabaseAdmin.from('sm_categories').select('id, name, slug').in('id', categoryIds)
      : Promise.resolve({ data: [] }),
    authorIds.length > 0
      ? supabaseAdmin.from('sm_authors').select('id, display_name, avatar_url').in('id', authorIds)
      : Promise.resolve({ data: [] }),
  ])

  const categoryMap = new Map(categoriesResult.data?.map(c => [c.id, c]) || [])
  const authorMap = new Map(authorsResult.data?.map(a => [a.id, a]) || [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {isEditor ? 'All Posts' : 'My Posts'}
          </h1>
          <p className="mt-1 text-[var(--text-muted)]">
            {isEditor ? 'Manage all articles' : 'Manage your articles'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 sm:flex-row sm:items-center">
        <form className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            name="search"
            placeholder="Search posts..."
            defaultValue={search}
            className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
          />
        </form>

        <div className="flex gap-2">
          {['all', 'published', 'draft', 'scheduled'].map((s) => (
            <Link
              key={s}
              href={`/studio/posts${s !== 'all' ? `?status=${s}` : ''}${search ? `${s !== 'all' ? '&' : '?'}search=${search}` : ''}`}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                (status || 'all') === s
                  ? 'bg-[var(--accent-red)] text-white'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Link>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <StudioPostsClient
        posts={posts || []}
        categoryMap={Object.fromEntries(categoryMap)}
        authorMap={Object.fromEntries(authorMap)}
        currentPage={currentPage}
        totalPages={totalPages}
        status={status}
        search={search}
        isEditor={isEditor}
      />
    </div>
  )
}
