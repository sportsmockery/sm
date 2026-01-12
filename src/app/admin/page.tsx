import { supabaseAdmin } from '@/lib/supabase-server'
import Link from 'next/link'
import StatsCard from '@/components/admin/StatsCard'
import QuickActions from '@/components/admin/QuickActions'
import RecentPosts from '@/components/admin/RecentPosts'
import ActivityFeed from '@/components/admin/ActivityFeed'
import ViewsChart from '@/components/admin/ViewsChart'
import CategoryBreakdown from '@/components/admin/CategoryBreakdown'
import TopPostsChart from '@/components/admin/TopPostsChart'

export default async function AdminDashboard() {
  if (!supabaseAdmin) {
    return <div className="p-6">Database not configured</div>
  }

  const supabase = supabaseAdmin

  const [postsResult, categoriesResult, authorsResult, recentPostsResult, viewsResult] = await Promise.all([
    supabase.from('sm_posts').select('*', { count: 'exact', head: true }),
    supabase.from('sm_categories').select('*', { count: 'exact', head: true }),
    supabase.from('sm_authors').select('*', { count: 'exact', head: true }),
    supabase
      .from('sm_posts')
      .select('id, title, slug, status, published_at, category_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('sm_posts')
      .select('views')
      .single(),
  ])

  const totalPosts = postsResult.count || 0
  const totalCategories = categoriesResult.count || 0
  const totalAuthors = authorsResult.count || 0
  const recentPosts = recentPostsResult.data || []

  // Get published vs draft counts
  const { count: publishedCount } = await supabase
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  const { count: draftCount } = await supabase
    .from('sm_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft')

  // Mock views data for now (would come from analytics)
  const viewsToday = 12847

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome back!</h1>
        <p className="mt-1 text-[var(--text-muted)]">
          Here&apos;s what&apos;s happening with your content today.
        </p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Posts"
          value={totalPosts.toLocaleString()}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
          href="/admin/posts"
          color="blue"
          trend={{ value: 12, label: 'vs last month', direction: 'up' }}
        />
        <StatsCard
          title="Views Today"
          value={viewsToday.toLocaleString()}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          href="/admin/analytics"
          color="green"
          trend={{ value: 8, label: 'vs yesterday', direction: 'up' }}
        />
        <StatsCard
          title="Authors"
          value={totalAuthors}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          }
          href="/admin/authors"
          color="purple"
        />
        <StatsCard
          title="Categories"
          value={totalCategories}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          }
          href="/admin/categories"
          color="yellow"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column - 60% */}
        <div className="lg:col-span-3 space-y-6">
          {/* Views Chart */}
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Views This Week</h2>
                <p className="text-sm text-[var(--text-muted)]">Daily pageviews across all posts</p>
              </div>
              <Link
                href="/admin/analytics"
                className="text-sm font-medium text-[var(--accent-red)] hover:underline"
              >
                View all analytics →
              </Link>
            </div>
            <ViewsChart />
          </div>

          {/* Recent Posts Table */}
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] px-6 py-4">
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Recent Posts</h2>
                <p className="text-sm text-[var(--text-muted)]">Latest content updates</p>
              </div>
              <Link
                href="/admin/posts"
                className="text-sm font-medium text-[var(--accent-red)] hover:underline"
              >
                View all →
              </Link>
            </div>
            <RecentPosts posts={recentPosts} />
          </div>
        </div>

        {/* Right Column - 40% */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Posts Today */}
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[var(--text-primary)]">Top Posts Today</h2>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--accent-red-glow)] text-[var(--accent-red)]">
                Live
              </span>
            </div>
            <TopPostsChart />
          </div>

          {/* Category Breakdown */}
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
            <h2 className="font-semibold text-[var(--text-primary)] mb-4">Category Breakdown</h2>
            <CategoryBreakdown />
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
            <div className="border-b border-[var(--border-default)] px-6 py-4">
              <h2 className="font-semibold text-[var(--text-primary)]">Recent Activity</h2>
            </div>
            <ActivityFeed />
          </div>
        </div>
      </div>

      {/* Post Status Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/posts?status=published"
          className="flex items-center gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 transition-all hover:border-[var(--success)] hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
            <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{publishedCount || 0}</p>
            <p className="text-sm text-[var(--text-muted)]">Published</p>
          </div>
        </Link>

        <Link
          href="/admin/posts?status=draft"
          className="flex items-center gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 transition-all hover:border-[var(--warning)] hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
            <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{draftCount || 0}</p>
            <p className="text-sm text-[var(--text-muted)]">Drafts</p>
          </div>
        </Link>

        <Link
          href="/admin/posts/new"
          className="flex items-center gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 transition-all hover:border-[var(--accent-red)] hover:shadow-md group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent-red-glow)] group-hover:bg-[var(--accent-red)] transition-colors">
            <svg className="h-6 w-6 text-[var(--accent-red)] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--text-primary)]">New Post</p>
            <p className="text-sm text-[var(--text-muted)]">Create content</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
