import Link from 'next/link'

interface TrendingPost {
  id: string
  title: string
  slug: string
  categorySlug: string
}

interface TrendingSidebarProps {
  posts: TrendingPost[]
}

export default function TrendingSidebar({ posts }: TrendingSidebarProps) {
  return (
    <aside className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
      {/* Glass reflection effect */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-red-500/20 to-transparent blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-tr from-blue-500/10 to-transparent blur-2xl" />

      {/* Header with pulse animation */}
      <div className="relative mb-6 flex items-center gap-3">
        <div className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
        </div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--sm-text)' }}>
          Trending Now
        </h2>
      </div>

      {/* Trending list */}
      <div className="relative space-y-1">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/${post.categorySlug}/${post.slug}`}
            className="group flex items-start gap-4 rounded-xl p-3 transition-all duration-300 hover:bg-[var(--sm-card-hover)]"
          >
            {/* Number badge */}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-700 text-sm font-bold text-white shadow-lg shadow-red-500/25 transition-transform duration-300 group-hover:scale-110">
              {index + 1}
            </span>

            {/* Title */}
            <span className="text-sm font-medium leading-tight transition-colors" style={{ color: 'var(--sm-text-dim)' }}>
              {post.title}
            </span>
          </Link>
        ))}

        {posts.length === 0 && (
          <p className="py-4 text-center text-sm" style={{ color: 'var(--sm-text-muted)' }}>
            No trending posts
          </p>
        )}
      </div>
    </aside>
  )
}
