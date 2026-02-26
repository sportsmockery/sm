'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PostSummary, TeamSlug, TEAM_INFO } from '@/lib/types'
import { reorderByFavorites } from '@/lib/users'

interface PersonalizedFeedProps {
  posts: PostSummary[]
  favoriteTeams?: TeamSlug[]
  className?: string
}

/**
 * Personalized article feed that reorders content based on user's favorite teams
 * Bears content is always prioritized (Bears-first design)
 */
export default function PersonalizedFeed({
  posts,
  favoriteTeams = ['bears'],
  className = '',
}: PersonalizedFeedProps) {
  const [activeFilter, setActiveFilter] = useState<TeamSlug | 'all'>('all')

  // Reorder posts based on favorite teams
  const orderedPosts = useMemo(() => {
    return reorderByFavorites(posts, favoriteTeams)
  }, [posts, favoriteTeams])

  // Filter posts if a specific team is selected
  const filteredPosts = useMemo(() => {
    if (activeFilter === 'all') return orderedPosts
    return orderedPosts.filter((post) => post.team === activeFilter)
  }, [orderedPosts, activeFilter])

  // Get team counts for filter badges
  const teamCounts = useMemo(() => {
    const counts: Record<TeamSlug | 'all', number> = {
      all: posts.length,
      bears: 0,
      cubs: 0,
      'white-sox': 0,
      bulls: 0,
      blackhawks: 0,
    }
    posts.forEach((post) => {
      counts[post.team]++
    })
    return counts
  }, [posts])

  // Team filter order (favorites first, then others)
  const filterOrder: (TeamSlug | 'all')[] = [
    'all',
    ...favoriteTeams,
    ...(['bears', 'cubs', 'white-sox', 'bulls', 'blackhawks'] as TeamSlug[]).filter(
      (t) => !favoriteTeams.includes(t)
    ),
  ]

  if (posts.length === 0) {
    return null
  }

  return (
    <section className={`bg-white dark:bg-[#111] ${className}`}>
      <div className="max-w-[1110px] mx-auto px-4 py-8">
        {/* Section header with personalization indicator */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-[18px] font-bold text-[#222] dark:text-white uppercase pb-2 border-b-[3px] border-[#bc0000] inline-block"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              For You
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Personalized based on your favorite teams
            </p>
          </div>

          {/* Favorite teams indicator */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-gray-400">Following:</span>
            {favoriteTeams.map((team) => {
              const teamInfo = TEAM_INFO[team]
              return (
                <div
                  key={team}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: teamInfo.primaryColor }}
                  title={teamInfo.name}
                >
                  {teamInfo.shortName.charAt(0)}
                </div>
              )
            })}
          </div>
        </div>

        {/* Team filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {filterOrder.map((team) => {
            if (team !== 'all' && teamCounts[team] === 0) return null

            const isActive = activeFilter === team
            const teamInfo = team !== 'all' ? TEAM_INFO[team] : null
            const isFavorite = team !== 'all' && favoriteTeams.includes(team)

            return (
              <button
                key={team}
                onClick={() => setActiveFilter(team)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#bc0000] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                style={
                  isActive && teamInfo
                    ? { backgroundColor: teamInfo.primaryColor }
                    : undefined
                }
              >
                {team === 'all' ? (
                  'All Teams'
                ) : (
                  <>
                    {isFavorite && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                    {teamInfo?.shortName}
                  </>
                )}
                <span
                  className={`text-xs px-1.5 rounded-full ${
                    isActive
                      ? 'bg-white/20'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  {teamCounts[team]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.slice(0, 12).map((post, index) => (
            <PersonalizedPostCard
              key={post.id}
              post={post}
              isFavoriteTeam={favoriteTeams.includes(post.team)}
              isPriority={index < 3}
            />
          ))}
        </div>

        {/* View all link */}
        {filteredPosts.length > 12 && (
          <div className="mt-8 text-center">
            <Link
              href={activeFilter === 'all' ? '/latest' : `/${activeFilter}`}
              className="inline-flex items-center gap-2 text-[#bc0000] font-semibold hover:underline"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              View All {activeFilter === 'all' ? 'Articles' : TEAM_INFO[activeFilter].shortName + ' Articles'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * Post card for personalized feed
 */
function PersonalizedPostCard({
  post,
  isFavoriteTeam,
  isPriority,
}: {
  post: PostSummary
  isFavoriteTeam: boolean
  isPriority: boolean
}) {
  const teamInfo = TEAM_INFO[post.team]
  const isBears = post.team === 'bears'

  return (
    <Link
      href={`/${post.categorySlug}/${post.slug}`}
      className="group block"
    >
      <article
        className={`bg-white dark:bg-[#1a1a1a] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all ${
          isFavoriteTeam ? 'ring-1 ring-gray-200 dark:ring-gray-700' : ''
        }`}
      >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={post.featuredImage || '/placeholder.jpg'}
            alt=""
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={isPriority}
          />
          {/* Team color accent */}
          <div
            className="absolute top-0 left-0 w-1 h-full"
            style={{ backgroundColor: teamInfo.primaryColor }}
          />
          {/* Favorite team indicator */}
          {isFavoriteTeam && (
            <div className="absolute top-2 right-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: teamInfo.primaryColor }}
              >
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category tag */}
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-wide mb-2"
            style={{
              color: isBears ? teamInfo.secondaryColor : '#bc0000',
            }}
          >
            {post.categoryName.replace('Chicago ', '')}
          </span>

          {/* Title */}
          <h3
            className="text-[15px] font-bold text-[#222] dark:text-white leading-tight line-clamp-2 group-hover:text-[#bc0000] transition-colors"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {post.title}
          </h3>

          {/* Meta */}
          <div className="flex items-center gap-2 mt-3 text-[11px] text-gray-400">
            <span>{post.author.displayName}</span>
            <span>•</span>
            <span>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
