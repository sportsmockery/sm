import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sports Mockery | Categories',
}

// Team colors for category badges
const TEAM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  bears: { bg: 'bg-[#0B162A]', text: 'text-[#C83803]', border: 'border-[#C83803]' },
  bulls: { bg: 'bg-[#CE1141]', text: 'text-white', border: 'border-[#CE1141]' },
  cubs: { bg: 'bg-[#0E3386]', text: 'text-[#CC3433]', border: 'border-[#CC3433]' },
  whitesox: { bg: 'bg-[#27251F]', text: 'text-[#C4CED4]', border: 'border-[#C4CED4]' },
  'white-sox': { bg: 'bg-[#27251F]', text: 'text-[#C4CED4]', border: 'border-[#C4CED4]' },
  blackhawks: { bg: 'bg-[#CF0A2C]', text: 'text-[#FFD100]', border: 'border-[#FFD100]' },
}

export default async function AdminCategoriesPage() {
  const { data: categories } = await supabaseAdmin
    .from('sm_categories')
    .select('id, name, slug, description')
    .order('name')

  // Get post counts for each category
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (category) => {
      const { count } = await supabaseAdmin
        .from('sm_posts')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)

      return { ...category, postCount: count || 0 }
    })
  )

  // Sort: teams first, then alphabetically
  const teamSlugs = ['bears', 'bulls', 'cubs', 'white-sox', 'whitesox', 'blackhawks']
  const sortedCategories = [...categoriesWithCounts].sort((a, b) => {
    const aIsTeam = teamSlugs.includes(a.slug.toLowerCase())
    const bIsTeam = teamSlugs.includes(b.slug.toLowerCase())
    if (aIsTeam && !bIsTeam) return -1
    if (!aIsTeam && bIsTeam) return 1
    return a.name.localeCompare(b.name)
  })

  const totalPosts = categoriesWithCounts.reduce((acc, cat) => acc + cat.postCount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Categories</h1>
          <p className="mt-1 text-[var(--text-muted)]">
            {categories?.length || 0} categories · {totalPosts} total posts
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {sortedCategories.filter(cat => teamSlugs.includes(cat.slug.toLowerCase())).map((category) => {
          const colors = TEAM_COLORS[category.slug.toLowerCase()] || { bg: 'bg-[var(--bg-tertiary)]', text: 'text-[var(--text-primary)]', border: 'border-[var(--border-default)]' }
          return (
            <Link
              key={category.id}
              href={`/admin/posts?category=${category.id}`}
              className={`group relative overflow-hidden rounded-xl border p-4 transition-all hover:scale-[1.02] hover:shadow-lg ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-lg font-bold ${colors.text}`}>{category.name}</p>
                  <p className="text-xs text-white/60">{category.postCount} posts</p>
                </div>
                <div className={`text-3xl font-bold ${colors.text} opacity-20 group-hover:opacity-40 transition-opacity`}>
                  {category.postCount}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Categories Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border-default)] px-6 py-4">
          <h2 className="font-semibold text-[var(--text-primary)]">All Categories</h2>
        </div>
        <table className="w-full">
          <thead className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Category
              </th>
              <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] md:table-cell">
                Slug
              </th>
              <th className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] lg:table-cell">
                Description
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
            {sortedCategories.length > 0 ? (
              sortedCategories.map((category) => {
                const isTeam = teamSlugs.includes(category.slug.toLowerCase())
                const colors = TEAM_COLORS[category.slug.toLowerCase()]

                return (
                  <tr key={category.id} className="group hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {isTeam && colors ? (
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.bg}`}>
                            <span className={`text-xs font-bold ${colors.text}`}>
                              {category.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-tertiary)]">
                            <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{category.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 md:table-cell">
                      <code className="rounded bg-[var(--bg-tertiary)] px-2 py-1 text-xs text-[var(--text-secondary)]">
                        /{category.slug}
                      </code>
                    </td>
                    <td className="hidden px-6 py-4 text-sm text-[var(--text-muted)] lg:table-cell">
                      {category.description || <span className="italic">No description</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/admin/posts?category=${category.id}`}
                        className="inline-flex items-center justify-center rounded-full bg-[var(--bg-tertiary)] px-3 py-1 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        {category.postCount}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${category.slug}`}
                          target="_blank"
                          className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                          title="View Category"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/posts?category=${category.id}`}
                          className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent-red)] transition-colors"
                          title="View Posts"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <svg className="mx-auto h-12 w-12 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                  <p className="mt-4 text-[var(--text-muted)]">No categories found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
