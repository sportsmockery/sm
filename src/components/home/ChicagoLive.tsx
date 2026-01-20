'use client'

import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'

interface HeroStory {
  id: number
  title: string
  slug: string
  excerpt?: string | null
  featured_image?: string | null
  published_at: string
  category?: {
    name: string
    slug: string
  }
}

interface UpcomingGame {
  team: string
  teamLogo: string
  teamSlug: string
  opponent: string
  opponentLogo?: string
  date: string
  time: string
  isHome: boolean
  venue?: string
}

interface ChicagoLiveProps {
  heroStory: HeroStory | null
  upcomingGames: UpcomingGame[]
}

export default function ChicagoLive({ heroStory, upcomingGames }: ChicagoLiveProps) {
  return (
    <section className="py-6 md:py-8 lg:py-10" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <h2
              className="text-lg md:text-xl font-bold"
              style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}
            >
              Chicago Live
            </h2>
          </div>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Hero Story - Left 2/3 */}
          <div className="lg:col-span-2">
            {heroStory ? (
              <Link
                href={`/${heroStory.category?.slug || 'chicago-bears'}/${heroStory.slug}`}
                className="group block"
              >
                <article className="relative overflow-hidden rounded-xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {heroStory.featured_image ? (
                      <Image
                        src={heroStory.featured_image}
                        alt={heroStory.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0B162A] to-[#C83803]" />
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
                    {/* Category & Meta */}
                    <div className="flex items-center gap-3 mb-3">
                      {heroStory.category && (
                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-[#bc0000] rounded">
                          {heroStory.category.name}
                        </span>
                      )}
                      <span className="text-white/70 text-sm">
                        {format(new Date(heroStory.published_at), 'MMM d, yyyy • h:mm a')}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 line-clamp-3 group-hover:text-[#ff6b35] transition-colors"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {heroStory.title}
                    </h3>

                    {/* Excerpt */}
                    {heroStory.excerpt && (
                      <p className="text-white/80 text-sm md:text-base line-clamp-2 max-w-2xl">
                        {heroStory.excerpt}
                      </p>
                    )}
                  </div>
                </article>
              </Link>
            ) : (
              <div
                className="rounded-xl aspect-[16/9] flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg-surface)' }}
              >
                <p style={{ color: 'var(--text-muted)' }}>No featured story available</p>
              </div>
            )}
          </div>

          {/* Upcoming Games - Right 1/3 */}
          <div className="lg:col-span-1">
            <div
              className="rounded-xl p-4 md:p-5 h-full"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
            >
              <h3
                className="text-sm font-bold uppercase tracking-wider mb-4 pb-3"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'var(--text-primary)',
                  borderBottom: '2px solid #bc0000'
                }}
              >
                Next Chicago Games
              </h3>

              <div className="space-y-3">
                {upcomingGames.length > 0 ? (
                  upcomingGames.slice(0, 5).map((game, index) => (
                    <Link
                      key={`${game.team}-${index}`}
                      href={`/${game.teamSlug}`}
                      className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-[var(--card-hover-bg)]"
                      style={{ borderBottom: index < upcomingGames.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                    >
                      {/* Team Logo */}
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
                        <Image
                          src={game.teamLogo}
                          alt={game.team}
                          width={32}
                          height={32}
                          className="object-contain"
                          unoptimized
                        />
                      </div>

                      {/* Game Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold text-sm truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {game.team}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {game.isHome ? 'vs' : '@'} {game.opponent}
                        </p>
                      </div>

                      {/* Date/Time */}
                      <div className="text-right flex-shrink-0">
                        <p
                          className="text-xs font-medium"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {game.date}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {game.time}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p
                    className="text-sm text-center py-8"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    No upcoming games scheduled
                  </p>
                )}
              </div>

              {/* View All Link */}
              <Link
                href="/teams"
                className="flex items-center justify-center gap-2 mt-4 pt-4 text-sm font-semibold transition-colors hover:text-[#bc0000]"
                style={{
                  color: 'var(--link-color)',
                  borderTop: '1px solid var(--border-color)'
                }}
              >
                View All Teams
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
