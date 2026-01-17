'use client'

import Link from 'next/link'
import Image from 'next/image'
import { TeamSlug, TeamInfo, PostSummary, TEAM_INFO } from '@/lib/types'

interface TeamHubProps {
  team: TeamSlug
  posts: PostSummary[]
  featuredPosts?: PostSummary[]
  totalPosts: number
  className?: string
}

/**
 * Generic Team Hub component
 * Used for Cubs, White Sox, Bulls, and Blackhawks pages
 * Bears has its own dedicated hub with additional features
 */
export default function TeamHub({
  team,
  posts,
  featuredPosts = [],
  totalPosts,
  className = '',
}: TeamHubProps) {
  const teamInfo = TEAM_INFO[team]
  const displayPosts = posts.slice(0, 12)

  return (
    <div className={`min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0b] ${className}`}>
      {/* Hero header */}
      <header
        className="relative py-12 md:py-16"
        style={{
          background: `linear-gradient(135deg, ${teamInfo.primaryColor} 0%, ${adjustColor(teamInfo.primaryColor, 20)} 100%)`,
        }}
      >
        <div className="max-w-[1110px] mx-auto px-4">
          <div className="flex items-center gap-6">
            {/* Team logo */}
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white font-black text-3xl md:text-4xl shadow-lg"
              style={{ backgroundColor: teamInfo.secondaryColor }}
            >
              {teamInfo.shortName.charAt(0)}
            </div>

            {/* Team name and info */}
            <div>
              <h1
                className="text-white text-3xl md:text-5xl font-black uppercase"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {teamInfo.name}
              </h1>
              <p className="text-white/70 text-sm md:text-base mt-1">
                {getSportDescription(teamInfo.sport)} Coverage
              </p>
              <p className="text-white/50 text-sm mt-2">
                {totalPosts.toLocaleString()} articles
              </p>
            </div>
          </div>

          {/* Quick stats placeholder */}
          <div className="mt-8 flex flex-wrap gap-4">
            <QuickStatBadge label="Sport" value={capitalize(teamInfo.sport)} />
            <QuickStatBadge label="City" value={teamInfo.city} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1110px] mx-auto px-4 py-8">
        {/* Featured section */}
        {featuredPosts.length > 0 && (
          <section className="mb-10">
            <h2
              className="text-[18px] font-bold text-[#222] dark:text-white uppercase mb-6 pb-2 border-b-[3px]"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                borderColor: teamInfo.secondaryColor,
              }}
            >
              Featured Stories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.slice(0, 3).map((post, index) => (
                <FeaturedCard
                  key={post.id}
                  post={post}
                  teamInfo={teamInfo}
                  isPrimary={index === 0}
                />
              ))}
            </div>
          </section>
        )}

        {/* Latest articles */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-[18px] font-bold text-[#222] dark:text-white uppercase pb-2 border-b-[3px]"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                borderColor: teamInfo.secondaryColor,
              }}
            >
              Latest {teamInfo.shortName} News
            </h2>
            {totalPosts > 12 && (
              <Link
                href={`/${getTeamCategorySlug(team)}?page=2`}
                className="text-sm hover:underline"
                style={{ color: teamInfo.secondaryColor }}
              >
                View All →
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPosts.map((post) => (
              <ArticleCard key={post.id} post={post} teamInfo={teamInfo} />
            ))}
          </div>

          {/* Pagination hint */}
          {totalPosts > 12 && (
            <div className="mt-8 text-center">
              <Link
                href={`/${getTeamCategorySlug(team)}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-transform hover:scale-105"
                style={{
                  backgroundColor: teamInfo.primaryColor,
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Browse All {teamInfo.shortName} Articles
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

/**
 * Quick stat badge component
 */
function QuickStatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-2 bg-white/10 rounded-lg">
      <span className="text-white/60 text-xs uppercase tracking-wide">{label}:</span>
      <span className="ml-2 text-white font-semibold">{value}</span>
    </div>
  )
}

/**
 * Featured article card
 */
function FeaturedCard({
  post,
  teamInfo,
  isPrimary,
}: {
  post: PostSummary
  teamInfo: TeamInfo
  isPrimary: boolean
}) {
  return (
    <Link
      href={`/${post.categorySlug}/${post.slug}`}
      className={`group block ${isPrimary ? 'md:col-span-2 md:row-span-2' : ''}`}
    >
      <article className="relative h-full overflow-hidden rounded-lg bg-black">
        <Image
          src={post.featuredImage || '/placeholder.jpg'}
          alt=""
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          priority={isPrimary}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Team accent */}
        <div
          className="absolute top-0 left-0 w-1 h-full"
          style={{ backgroundColor: teamInfo.secondaryColor }}
        />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <span
            className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white mb-2 rounded"
            style={{ backgroundColor: teamInfo.secondaryColor }}
          >
            {teamInfo.shortName}
          </span>
          <h3
            className={`text-white font-bold leading-tight group-hover:underline decoration-1 underline-offset-2 ${
              isPrimary ? 'text-xl md:text-2xl line-clamp-3' : 'text-base line-clamp-2'
            }`}
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {post.title}
          </h3>
          <p className="text-white/70 text-xs mt-2">
            {post.author.displayName} •{' '}
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

/**
 * Standard article card
 */
function ArticleCard({
  post,
  teamInfo,
}: {
  post: PostSummary
  teamInfo: TeamInfo
}) {
  return (
    <Link
      href={`/${post.categorySlug}/${post.slug}`}
      className="group block"
    >
      <article className="bg-white dark:bg-[#111] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={post.featuredImage || '/placeholder.jpg'}
            alt=""
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div
            className="absolute top-0 left-0 w-1 h-full"
            style={{ backgroundColor: teamInfo.primaryColor }}
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-wide mb-2"
            style={{ color: teamInfo.secondaryColor }}
          >
            {teamInfo.shortName}
          </span>
          <h3
            className="text-[15px] font-bold text-[#222] dark:text-white leading-tight line-clamp-2 group-hover:text-[#bc0000] transition-colors"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {post.title}
          </h3>
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

// Helper functions
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt)
  const B = Math.min(255, (num & 0x0000ff) + amt)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}

function getSportDescription(sport: string): string {
  const descriptions: Record<string, string> = {
    football: 'NFL Football',
    baseball: 'MLB Baseball',
    basketball: 'NBA Basketball',
    hockey: 'NHL Hockey',
  }
  return descriptions[sport] || sport
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function getTeamCategorySlug(team: TeamSlug): string {
  const slugMap: Record<TeamSlug, string> = {
    bears: 'chicago-bears',
    cubs: 'chicago-cubs',
    'white-sox': 'chicago-white-sox',
    bulls: 'chicago-bulls',
    blackhawks: 'chicago-blackhawks',
  }
  return slugMap[team]
}
