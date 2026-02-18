import Link from 'next/link'
import { getPopularThisWeek, formatNumber } from '@/lib/analytics'

interface PopularThisWeekProps {
  limit?: number
  className?: string
}

export default async function PopularThisWeek({ limit = 5, className = '' }: PopularThisWeekProps) {
  const posts = await getPopularThisWeek(limit)

  if (posts.length === 0) {
    return null
  }

  return (
    <div className={`rounded-2xl bg-[var(--sm-card)] border border-[var(--sm-border)] overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF0000] to-[#8B0000] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="font-bold text-white font-[var(--font-montserrat)] uppercase tracking-wider text-sm">
            Popular This Week
          </h3>
        </div>
      </div>

      {/* Posts list */}
      <div className="divide-y divide-[var(--sm-border)]">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/${post.categorySlug}/${post.slug}`}
            className="group flex items-start gap-4 px-6 py-4 hover:bg-[var(--sm-card-hover)] transition-colors"
          >
            {/* Rank number */}
            <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm font-[var(--font-montserrat)]" style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}>
              {index + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-[#8B0000] transition-colors" style={{ color: 'var(--sm-text)' }}>
                {post.title}
              </h4>
              <div className="mt-1 flex items-center gap-2 text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{formatNumber(post.views)} views</span>
              </div>
            </div>

            {/* Arrow */}
            <svg
              className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Loading skeleton for PopularThisWeek
export function PopularThisWeekSkeleton() {
  return (
    <div className="rounded-2xl bg-[var(--sm-card)] border border-[var(--sm-border)] overflow-hidden">
      <div className="bg-gradient-to-r from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-800 px-6 py-4 animate-pulse">
        <div className="h-8 w-40 bg-white/30 rounded" />
      </div>
      <div className="divide-y divide-[var(--sm-border)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 px-6 py-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--sm-surface)] animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-full bg-[var(--sm-surface)] rounded animate-pulse" />
              <div className="h-3 w-20 bg-[var(--sm-surface)] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
