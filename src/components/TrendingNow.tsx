import Link from 'next/link'
import Image from 'next/image'
import { getTrendingPosts, formatNumber } from '@/lib/analytics'

interface TrendingNowProps {
  limit?: number
  className?: string
}

export default async function TrendingNow({ limit = 4, className = '' }: TrendingNowProps) {
  const posts = await getTrendingPosts(limit)

  if (posts.length === 0) {
    return null
  }

  return (
    <section className={`${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF0000] to-[#8B0000] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
          </div>
          {/* Animated pulse */}
          <div className="absolute inset-0 rounded-xl bg-[#FF0000] animate-ping opacity-25" />
        </div>
        <div>
          <h2 className="font-black text-xl text-zinc-900 dark:text-zinc-100 font-[var(--font-montserrat)] uppercase tracking-tight">
            Trending Now
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Hot stories in the last 24 hours
          </p>
        </div>
      </div>

      {/* Trending grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/${post.categorySlug}/${post.slug}`}
            className="group relative rounded-xl overflow-hidden bg-zinc-900 aspect-[4/3]"
          >
            {/* Background gradient as fallback */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />

            {/* Trending badge */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF0000] text-white text-xs font-bold">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
              #{index + 1}
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-zinc-200 transition-colors">
                {post.title}
              </h3>
              <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{formatNumber(post.views)}</span>
              </div>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-[#8B0000]/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
          </Link>
        ))}
      </div>
    </section>
  )
}

// Compact horizontal version for sidebar
export async function TrendingNowCompact({ limit = 3, className = '' }: TrendingNowProps) {
  const posts = await getTrendingPosts(limit)

  if (posts.length === 0) {
    return null
  }

  return (
    <div className={`rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="relative">
          <svg className="w-4 h-4 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
        </div>
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Trending Now</h3>
      </div>

      {/* Posts */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/${post.categorySlug}/${post.slug}`}
            className="group flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <span className="shrink-0 w-5 h-5 rounded bg-[#8B0000] text-white text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300 line-clamp-1 group-hover:text-[#8B0000] transition-colors">
              {post.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Loading skeleton
export function TrendingNowSkeleton() {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="space-y-2">
          <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          <div className="h-3 w-40 bg-zinc-100 dark:bg-zinc-800/50 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-zinc-200 dark:bg-zinc-800 aspect-[4/3] animate-pulse" />
        ))}
      </div>
    </section>
  )
}
