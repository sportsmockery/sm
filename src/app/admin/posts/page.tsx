import { supabaseAdmin } from '@/lib/supabase-server'
import Link from 'next/link'
import PostsListClient from './PostsListClient'
import CategoryFilter from './CategoryFilter'

interface PostsPageProps {
  searchParams: Promise<{
    status?: string
    search?: string
    page?: string
    category?: string
  }>
}

const POSTS_PER_PAGE = 20

export default async function AdminPostsPage({ searchParams }: PostsPageProps) {
  const { status, search, page, category } = await searchParams
  const currentPage = Math.max(1, parseInt(page || '1', 10))
  const offset = (currentPage - 1) * POSTS_PER_PAGE

  if (!supabaseAdmin) {
    return <div className="p-6">Database not configured</div>
  }

  const supabase = supabaseAdmin

  let query = supabase
    .from('sm_posts')
    .select('id, title, slug, status, published_at, created_at, category_id, author_id, featured_image, excerpt', { count: 'exact' })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (category && category !== 'all') {
    query = query.eq('category_id', category)
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

  const [categoriesResult, authorsResult, allCategories] = await Promise.all([
    categoryIds.length > 0
      ? supabase.from('sm_categories').select('id, name, slug').in('id', categoryIds)
      : Promise.resolve({ data: [] }),
    authorIds.length > 0
      ? supabase.from('sm_authors').select('id, display_name, avatar_url').in('id', authorIds)
      : Promise.resolve({ data: [] }),
    supabase.from('sm_categories').select('id, name, slug').order('name'),
  ])

  const categoryMap = new Map(categoriesResult.data?.map(c => [c.id, c]) || [])
  const authorMap = new Map(authorsResult.data?.map(a => [a.id, a]) || [])

  // Status counts
  const { count: publishedCount } = await supabase
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  const { count: draftCount } = await supabase
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft')

  const { count: scheduledCount } = await supabase
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scheduled')

  const statusCounts = {
    all: count || 0,
    published: publishedCount || 0,
    draft: draftCount || 0,
    scheduled: scheduledCount || 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Posts</h1>
          <p className="mt-1 text-[var(--text-muted)]">
            Manage all your articles and content
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-red)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-red-hover)] transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Post
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatusCard
          label="All Posts"
          count={statusCounts.all}
          active={(status || 'all') === 'all'}
          href={`/admin/posts${search ? `?search=${search}` : ''}${category ? `${search ? '&' : '?'}category=${category}` : ''}`}
        />
        <StatusCard
          label="Published"
          count={statusCounts.published}
          active={status === 'published'}
          href={`/admin/posts?status=published${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}`}
          color="success"
        />
        <StatusCard
          label="Drafts"
          count={statusCounts.draft}
          active={status === 'draft'}
          href={`/admin/posts?status=draft${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}`}
          color="warning"
        />
        <StatusCard
          label="Scheduled"
          count={statusCounts.scheduled}
          active={status === 'scheduled'}
          href={`/admin/posts?status=scheduled${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}`}
          color="info"
        />
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

        <CategoryFilter
          categories={allCategories.data || []}
          currentCategory={category}
        />
      </div>

      {/* Posts Table with Client-Side Interactions */}
      <PostsListClient
        posts={posts || []}
        categoryMap={Object.fromEntries(categoryMap)}
        authorMap={Object.fromEntries(authorMap)}
        currentPage={currentPage}
        totalPages={totalPages}
        status={status}
        search={search}
        category={category}
      />
    </div>
  )
}

function StatusCard({
  label,
  count,
  active,
  href,
  color,
}: {
  label: string
  count: number
  active: boolean
  href: string
  color?: 'success' | 'warning' | 'info'
}) {
  const colorClasses = {
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  }

  return (
    <Link
      href={href}
      className={`rounded-xl border p-4 transition-all ${
        active
          ? 'border-[var(--accent-red)] bg-[var(--accent-red-muted)]'
          : 'border-[var(--border-default)] bg-[var(--bg-card)] hover:border-[var(--border-strong)]'
      }`}
    >
      <p className={`text-2xl font-bold ${color ? colorClasses[color] : 'text-[var(--text-primary)]'}`}>
        {count.toLocaleString()}
      </p>
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
    </Link>
  )
}
