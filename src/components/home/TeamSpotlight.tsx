'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TeamSlug, TeamSpotlightData, TEAM_INFO, PostSummary } from '@/lib/types'

interface TeamSpotlightProps {
  spotlightData: Record<TeamSlug, TeamSpotlightData>
  className?: string
}

/**
 * Team spotlight section for homepage
 * Shows expandable cards for each team with quick stats and latest posts
 * Bears is always first and expanded by default
 */
export default function TeamSpotlight({
  spotlightData,
  className = '',
}: TeamSpotlightProps) {
  // Bears expanded by default (Bears-first design)
  const [expandedTeam, setExpandedTeam] = useState<TeamSlug | null>('bears')

  // Order teams: Bears first, then alphabetically
  const teamOrder: TeamSlug[] = ['bears', 'blackhawks', 'bulls', 'cubs', 'white-sox']

  const toggleTeam = (team: TeamSlug) => {
    setExpandedTeam(expandedTeam === team ? null : team)
  }

  return (
    <section className={className} style={{ backgroundColor: 'var(--sm-card)' }}>
      <div className="max-w-[1110px] mx-auto px-4 py-8">
        {/* Section header */}
        <h2
          className="text-[18px] font-bold uppercase mb-6 pb-2 border-b-[3px] border-[#bc0000]"
          style={{ color: 'var(--sm-text)', fontFamily: "'Montserrat', sans-serif" }}
        >
          Team Spotlight
        </h2>

        {/* Team cards */}
        <div className="space-y-3">
          {teamOrder.map((teamSlug) => {
            const teamInfo = TEAM_INFO[teamSlug]
            const data = spotlightData[teamSlug]
            const isExpanded = expandedTeam === teamSlug
            const isBears = teamSlug === 'bears'

            return (
              <div
                key={teamSlug}
                className={`border rounded-lg overflow-hidden transition-all ${
                  isBears
                    ? 'border-[#C83803] shadow-md'
                    : ''
                }`}
                style={!isBears ? { borderColor: 'var(--sm-border)' } : undefined}
              >
                {/* Card header - always visible */}
                <button
                  onClick={() => toggleTeam(teamSlug)}
                  className="w-full flex items-center justify-between p-4 transition-colors"
                  style={{
                    borderLeft: `4px solid ${teamInfo.primaryColor}`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Team logo placeholder */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: teamInfo.primaryColor }}
                    >
                      {teamInfo.shortName.charAt(0)}
                    </div>

                    {/* Team name and record */}
                    <div className="text-left">
                      <h3
                        className="text-[16px] font-bold"
                        style={{ color: 'var(--sm-text)', fontFamily: "'Montserrat', sans-serif" }}
                      >
                        {teamInfo.name}
                        {isBears && (
                          <span className="ml-2 text-[10px] px-2 py-0.5 bg-[#C83803] text-white rounded-full">
                            PRIMARY
                          </span>
                        )}
                      </h3>
                      {data?.quickStats?.record && (
                        <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                          {data.quickStats.record}
                          {data.quickStats.standing && ` • ${data.quickStats.standing}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expand/collapse indicator */}
                  <div className="flex items-center gap-3">
                    {data?.latestPosts?.length > 0 && (
                      <span className="text-xs hidden sm:inline" style={{ color: 'var(--sm-text-dim)' }}>
                        {data.latestPosts.length} articles
                      </span>
                    )}
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      style={{ color: 'var(--sm-text-dim)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && data && (
                  <div style={{ borderTop: '1px solid var(--sm-border)' }}>
                    {/* Quick stats row */}
                    {data.quickStats && (
                      <div
                        className="flex items-center gap-6 px-4 py-3 text-sm"
                        style={{ backgroundColor: `${teamInfo.primaryColor}10` }}
                      >
                        {data.quickStats.streak && (
                          <div>
                            <span style={{ color: 'var(--sm-text-muted)' }}>Streak:</span>{' '}
                            <span className="font-semibold" style={{ color: 'var(--sm-text)' }}>
                              {data.quickStats.streak}
                            </span>
                          </div>
                        )}
                        {data.quickStats.nextGame && (
                          <div>
                            <span style={{ color: 'var(--sm-text-muted)' }}>Next:</span>{' '}
                            <span className="font-semibold" style={{ color: 'var(--sm-text)' }}>
                              {data.quickStats.nextGame}
                            </span>
                          </div>
                        )}
                        <Link
                          href={`/${teamSlug === 'white-sox' ? 'chicago-white-sox' : `chicago-${teamSlug}`}`}
                          className="ml-auto text-[#bc0000] hover:underline font-medium"
                        >
                          View All →
                        </Link>
                      </div>
                    )}

                    {/* Latest posts */}
                    {data.latestPosts && data.latestPosts.length > 0 && (
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {data.latestPosts.slice(0, 3).map((post) => (
                            <SpotlightPostCard
                              key={post.id}
                              post={post}
                              teamColor={teamInfo.primaryColor}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/**
 * Small post card for spotlight section
 */
function SpotlightPostCard({
  post,
  teamColor,
}: {
  post: PostSummary
  teamColor: string
}) {
  return (
    <Link
      href={`/${post.categorySlug}/${post.slug}`}
      className="group block"
    >
      <article className="flex gap-3">
        {/* Thumbnail */}
        <div className="relative w-20 h-14 flex-shrink-0 overflow-hidden rounded">
          <Image
            src={post.featuredImage || '/placeholder.jpg'}
            alt=""
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4
            className="text-[13px] font-semibold leading-tight line-clamp-2 group-hover:text-[#bc0000] transition-colors"
            style={{ color: 'var(--sm-text)', fontFamily: "'Montserrat', sans-serif" }}
          >
            {post.title}
          </h4>
          <p className="text-[11px] mt-1" style={{ color: 'var(--sm-text-dim)' }}>
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </article>
    </Link>
  )
}
