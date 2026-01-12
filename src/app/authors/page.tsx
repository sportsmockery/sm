import { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import AuthorsGrid from '@/components/author/AuthorsGrid'

export const metadata: Metadata = {
  title: 'Our Authors | SportsMockery',
  description: 'Meet the writers behind SportsMockery - Chicago\'s premier sports news and commentary team covering Bears, Bulls, Cubs, White Sox, and Blackhawks.',
  openGraph: {
    title: 'Our Authors | SportsMockery',
    description: 'Meet the writers behind SportsMockery',
    type: 'website',
  },
}

interface AuthorsPageProps {
  searchParams: Promise<{
    sort?: string
  }>
}

export default async function AuthorsPage({ searchParams }: AuthorsPageProps) {
  const { sort } = await searchParams

  if (!supabaseAdmin) {
    return <div className="p-6">Database not configured</div>
  }

  const supabase = supabaseAdmin

  // Fetch all authors with post counts
  const { data: authors } = await supabase
    .from('sm_authors')
    .select('id, display_name, bio, avatar_url')

  // Get post counts for each author
  const authorIds = authors?.map(a => a.id) || []
  const { data: postCounts } = await supabase
    .from('sm_posts')
    .select('author_id')
    .in('author_id', authorIds)

  // Calculate post counts per author
  const postCountMap = new Map<number, number>()
  postCounts?.forEach(post => {
    postCountMap.set(post.author_id, (postCountMap.get(post.author_id) || 0) + 1)
  })

  // Transform authors with post counts
  let authorsWithCounts = authors?.map(author => ({
    id: author.id,
    name: author.display_name,
    bio: author.bio || undefined,
    avatar_url: author.avatar_url || undefined,
    post_count: postCountMap.get(author.id) || 0,
  })) || []

  // Sort authors
  if (sort === 'name') {
    authorsWithCounts.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sort === 'articles') {
    authorsWithCounts.sort((a, b) => b.post_count - a.post_count)
  } else {
    // Default: sort by post count (most active first)
    authorsWithCounts.sort((a, b) => b.post_count - a.post_count)
  }

  const totalArticles = authorsWithCounts.reduce((sum, a) => sum + a.post_count, 0)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-[#8B0000]/30 py-16 lg:py-24">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-4 font-heading text-4xl font-black text-white sm:text-5xl lg:text-6xl">
            Our Authors
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-300">
            Meet the passionate writers and analysts behind SportsMockery. Our team brings you the hottest takes and deepest insights on Chicago sports.
          </p>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#FF6666]">{authorsWithCounts.length}</p>
              <p className="text-sm text-zinc-400">Writers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#FF6666]">{totalArticles.toLocaleString()}</p>
              <p className="text-sm text-zinc-400">Articles</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#FF6666]">5</p>
              <p className="text-sm text-zinc-400">Teams Covered</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12">
        {/* Sort Filters */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-bold text-zinc-900 dark:text-white">
            {authorsWithCounts.length} {authorsWithCounts.length === 1 ? 'Author' : 'Authors'}
          </h2>

          <div className="flex gap-2">
            <a
              href="/authors"
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                !sort || sort === 'articles'
                  ? 'bg-[#8B0000] text-white dark:bg-[#FF6666]'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              Most Active
            </a>
            <a
              href="/authors?sort=name"
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                sort === 'name'
                  ? 'bg-[#8B0000] text-white dark:bg-[#FF6666]'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              A-Z
            </a>
          </div>
        </div>

        {/* Authors Grid */}
        <AuthorsGrid authors={authorsWithCounts} />

        {/* Join CTA */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-[#8B0000] to-[#a00000] p-8 text-center dark:from-[#FF6666] dark:to-[#FF8888]">
          <h3 className="mb-3 font-heading text-2xl font-bold text-white">
            Want to Write for SportsMockery?
          </h3>
          <p className="mx-auto mb-6 max-w-xl text-white/90">
            We&apos;re always looking for passionate Chicago sports fans who can bring unique perspectives and hot takes to our readers.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-[#8B0000] transition-colors hover:bg-zinc-100"
          >
            Apply Now
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </a>
        </div>
      </main>
    </div>
  )
}
