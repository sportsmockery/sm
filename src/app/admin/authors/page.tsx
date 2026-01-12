import { supabaseAdmin } from '@/lib/supabase-server'
import Link from 'next/link'
import Image from 'next/image'

export default async function AdminAuthorsPage() {
  if (!supabaseAdmin) {
    return <div className="p-6">Database not configured</div>
  }

  const supabase = supabaseAdmin

  const { data: authors } = await supabase
    .from('sm_authors')
    .select('id, display_name, email, bio, avatar_url, social_twitter, social_linkedin')
    .order('display_name')

  // Get post counts for each author
  const authorsWithCounts = await Promise.all(
    (authors || []).map(async (author) => {
      const { count } = await supabase
        .from('sm_posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', author.id)

      return { ...author, postCount: count || 0 }
    })
  )

  // Sort by post count (most posts first)
  const sortedAuthors = [...authorsWithCounts].sort((a, b) => b.postCount - a.postCount)
  const totalPosts = authorsWithCounts.reduce((acc, a) => acc + a.postCount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Authors</h1>
          <p className="mt-1 text-[var(--text-muted)]">
            {authors?.length || 0} authors · {totalPosts} total posts
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <p className="text-3xl font-bold text-[var(--text-primary)]">{authors?.length || 0}</p>
          <p className="text-sm text-[var(--text-muted)]">Total Authors</p>
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <p className="text-3xl font-bold text-[var(--text-primary)]">{totalPosts}</p>
          <p className="text-sm text-[var(--text-muted)]">Total Posts</p>
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <p className="text-3xl font-bold text-[var(--text-primary)]">
            {authors?.length ? Math.round(totalPosts / authors.length) : 0}
          </p>
          <p className="text-sm text-[var(--text-muted)]">Avg Posts/Author</p>
        </div>
      </div>

      {/* Authors Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedAuthors.length > 0 ? (
          sortedAuthors.map((author, index) => (
            <div
              key={author.id}
              className="group relative overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] transition-all hover:border-[var(--border-strong)] hover:shadow-lg"
            >
              {/* Rank Badge for top 3 */}
              {index < 3 && (
                <div className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  index === 0 ? 'bg-amber-500 text-white' :
                  index === 1 ? 'bg-zinc-400 text-white' :
                  'bg-amber-700 text-white'
                }`}>
                  {index + 1}
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  {author.avatar_url ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-2 ring-[var(--border-default)] ring-offset-2 ring-offset-[var(--bg-card)]">
                      <Image
                        src={author.avatar_url}
                        alt={author.display_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-red)] to-red-600 text-lg font-bold text-white">
                      {author.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {author.display_name}
                    </h3>
                    {author.email && (
                      <p className="truncate text-sm text-[var(--text-muted)]">
                        {author.email}
                      </p>
                    )}
                    {/* Social Links */}
                    <div className="mt-2 flex items-center gap-2">
                      {author.social_twitter && (
                        <a
                          href={`https://twitter.com/${author.social_twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--text-muted)] hover:text-[#1DA1F2]"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                          </svg>
                        </a>
                      )}
                      {author.social_linkedin && (
                        <a
                          href={author.social_linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--text-muted)] hover:text-[#0A66C2]"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {author.bio && (
                  <p className="mt-4 line-clamp-2 text-sm text-[var(--text-secondary)]">
                    {author.bio}
                  </p>
                )}

                {/* Stats & Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
                  <Link
                    href={`/admin/posts?author=${author.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--bg-tertiary)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    {author.postCount} posts
                  </Link>
                  <Link
                    href={`/author/${author.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent-red)] hover:text-[var(--accent-red-hover)] transition-colors"
                  >
                    View Profile
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] py-16 text-center">
            <svg className="mb-4 h-12 w-12 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="text-[var(--text-muted)]">No authors found</p>
          </div>
        )}
      </div>
    </div>
  )
}
