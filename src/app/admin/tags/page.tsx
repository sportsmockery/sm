import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sports Mockery | Tags',
}

export const dynamic = 'force-dynamic'

export default async function AdminTagsPage() {
  // Fetch all tags
  const { data: tags } = await supabaseAdmin
    .from('sm_tags')
    .select('id, name, slug')
    .order('name')

  // Get post counts for each tag via sm_post_tags
  const tagsWithCounts = await Promise.all(
    (tags || []).map(async (tag) => {
      const { count } = await supabaseAdmin
        .from('sm_post_tags')
        .select('*', { count: 'exact', head: true })
        .eq('tag_id', tag.id)

      return { ...tag, postCount: count || 0 }
    })
  )

  const totalTags = tagsWithCounts.length
  const usedTags = tagsWithCounts.filter(t => t.postCount > 0).length
  const unusedTags = totalTags - usedTags
  const totalTagUsages = tagsWithCounts.reduce((acc, t) => acc + t.postCount, 0)

  // Sort by post count descending for the "most used" section
  const topTags = [...tagsWithCounts].sort((a, b) => b.postCount - a.postCount).slice(0, 20)

  // All tags sorted alphabetically (default)
  const sortedTags = [...tagsWithCounts].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tags</h1>
          <p className="mt-1 text-[var(--text-muted)]">
            {totalTags} tags · {totalTagUsages} total usages across posts
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <p className="text-sm text-[var(--text-muted)]">Total Tags</p>
          <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{totalTags}</p>
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <p className="text-sm text-[var(--text-muted)]">Used Tags</p>
          <p className="mt-1 text-3xl font-bold text-[var(--accent-red)]">{usedTags}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Assigned to at least 1 post</p>
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <p className="text-sm text-[var(--text-muted)]">Unused Tags</p>
          <p className="mt-1 text-3xl font-bold text-[var(--text-secondary)]">{unusedTags}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">No posts assigned</p>
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <p className="text-sm text-[var(--text-muted)]">Total Usages</p>
          <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">{totalTagUsages}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Tag-post associations</p>
        </div>
      </div>

      {/* Most Used Tags */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border-default)] px-6 py-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Most Used Tags</h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Top 20 tags by post count</p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {topTags.map((tag) => {
              const maxCount = topTags[0]?.postCount || 1
              const intensity = Math.max(0.15, tag.postCount / maxCount)
              return (
                <Link
                  key={tag.id}
                  href={`/admin/posts?tag=${tag.id}`}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] px-3 py-1.5 text-sm transition-all hover:border-[var(--accent-red)] hover:shadow-sm"
                  style={{ opacity: 0.4 + intensity * 0.6 }}
                >
                  <span className="text-[var(--text-primary)] group-hover:text-[var(--accent-red)]">
                    {tag.name}
                  </span>
                  <span className="rounded-full bg-[var(--bg-tertiary)] px-1.5 py-0.5 text-xs text-[var(--text-muted)]">
                    {tag.postCount}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* All Tags Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border-default)] px-6 py-4">
          <h2 className="font-semibold text-[var(--text-primary)]">All Tags</h2>
        </div>
        <table className="w-full">
          <thead className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Tag
              </th>
              <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] md:table-cell">
                Slug
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Posts
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {sortedTags.length > 0 ? (
              sortedTags.map((tag) => (
                <tr key={tag.id} className="group hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-tertiary)]">
                        <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                        </svg>
                      </div>
                      <p className="font-medium text-[var(--text-primary)]">{tag.name}</p>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <code className="rounded bg-[var(--bg-tertiary)] px-2 py-1 text-xs text-[var(--text-secondary)]">
                      {tag.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {tag.postCount > 0 ? (
                      <Link
                        href={`/admin/posts?tag=${tag.id}`}
                        className="inline-flex items-center justify-center rounded-full bg-[var(--bg-tertiary)] px-3 py-1 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        {tag.postCount}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center justify-center rounded-full bg-[var(--bg-tertiary)] px-3 py-1 text-sm text-[var(--text-muted)]">
                        0
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/tag/${tag.slug}`}
                        target="_blank"
                        className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                        title="View Tag Page"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                  <svg className="mx-auto h-12 w-12 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                  <p className="mt-4 text-[var(--text-muted)]">No tags found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
