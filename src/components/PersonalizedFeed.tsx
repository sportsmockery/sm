'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface PersonalizedArticle {
  id: string
  title: string
  slug: string
  excerpt?: string
  featuredImage?: string
  category: {
    name: string
    slug: string
  }
  matchReason: 'team' | 'topic' | 'author' | 'trending' | 'similar'
  matchScore: number // 0-100
}

interface PersonalizedFeedProps {
  articles?: PersonalizedArticle[]
  favoriteTeam?: string
}

const defaultArticles: PersonalizedArticle[] = [
  {
    id: '1',
    title: 'Bears Offensive Line Shows Major Improvement',
    slug: 'bears-offensive-line-improvement',
    excerpt: 'The offensive line has been a revelation this season, giving the quarterback more time to throw.',
    featuredImage: '/images/bears-oline.jpg',
    category: { name: 'Bears', slug: 'bears' },
    matchReason: 'team',
    matchScore: 98,
  },
  {
    id: '2',
    title: 'Draft Analysis: Best Options for Chicago',
    slug: 'draft-analysis-chicago',
    excerpt: 'Breaking down the top prospects that could help any Chicago team.',
    category: { name: 'Analysis', slug: 'analysis' },
    matchReason: 'topic',
    matchScore: 85,
  },
  {
    id: '3',
    title: 'Bulls Point Guard Debate Continues',
    slug: 'bulls-point-guard-debate',
    excerpt: 'Fans weigh in on the ongoing backcourt discussion.',
    featuredImage: '/images/bulls-pg.jpg',
    category: { name: 'Bulls', slug: 'bulls' },
    matchReason: 'trending',
    matchScore: 76,
  },
  {
    id: '4',
    title: 'Inside the Bears Locker Room',
    slug: 'bears-locker-room-inside',
    excerpt: 'Exclusive access to the team preparing for the playoffs.',
    featuredImage: '/images/bears-locker.jpg',
    category: { name: 'Bears', slug: 'bears' },
    matchReason: 'author',
    matchScore: 92,
  },
]

const matchReasonLabels = {
  team: 'Your Team',
  topic: 'Based on Interests',
  author: 'From Authors You Follow',
  trending: 'Trending Now',
  similar: 'Similar to Recent Reads',
}

const matchReasonIcons = {
  team: (
    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  topic: (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    </svg>
  ),
  author: (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  trending: (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
  similar: (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  ),
}

export default function PersonalizedFeed({
  articles = defaultArticles,
  favoriteTeam = 'Bears',
}: PersonalizedFeedProps) {
  const [filter, setFilter] = useState<keyof typeof matchReasonLabels | 'all'>('all')

  const filteredArticles = filter === 'all'
    ? articles
    : articles.filter(a => a.matchReason === filter)

  return (
    <section className="rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-[#8B0000]/10 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B0000] to-[#FF0000] shadow-lg shadow-[#8B0000]/20">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-white">For You</h3>
            <p className="text-xs text-zinc-500">Personalized based on your interests</p>
          </div>
        </div>

        <Link
          href="/profile"
          className="text-xs font-semibold text-[#FF6666] transition-colors hover:text-[#FF0000]"
        >
          Customize
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-[#8B0000] text-white'
              : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          All
        </button>
        {(Object.keys(matchReasonLabels) as Array<keyof typeof matchReasonLabels>).map((reason) => (
          <button
            key={reason}
            onClick={() => setFilter(reason)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              filter === reason
                ? 'bg-[#8B0000] text-white'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {matchReasonIcons[reason]}
            {matchReasonLabels[reason]}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="space-y-4">
        {filteredArticles.map((article, index) => (
          <Link
            key={article.id}
            href={`/${article.category.slug}/${article.slug}`}
            className="group flex gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-[#8B0000]/30 hover:bg-white/10"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Thumbnail */}
            {article.featuredImage ? (
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-800" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="h-8 w-8 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900">
                <span className="text-2xl font-black text-zinc-700">SM</span>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Match reason badge */}
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-[#8B0000]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[#FF6666]">
                  {matchReasonIcons[article.matchReason]}
                  {matchReasonLabels[article.matchReason]}
                </span>
                <span className="text-[10px] text-zinc-600">
                  {article.matchScore}% match
                </span>
              </div>

              {/* Category */}
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                {article.category.name}
              </span>

              {/* Title */}
              <h4 className="line-clamp-2 font-semibold text-white transition-colors group-hover:text-[#FF0000]">
                {article.title}
              </h4>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                  {article.excerpt}
                </p>
              )}
            </div>

            {/* Arrow */}
            <div className="flex shrink-0 items-center">
              <svg
                className="h-5 w-5 text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-[#FF0000]"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* View more */}
      <button className="mt-4 w-full rounded-xl bg-white/5 py-3 text-sm font-semibold text-zinc-400 transition-colors hover:bg-white/10 hover:text-white">
        View More Recommendations
      </button>

      {/* Info */}
      <p className="mt-4 text-center text-[10px] text-zinc-600">
        Based on your reading history and preferences.{' '}
        <Link href="/profile/settings" className="text-[#FF6666] hover:underline">
          Adjust settings
        </Link>
      </p>
    </section>
  )
}
