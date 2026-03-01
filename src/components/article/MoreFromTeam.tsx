'use client'

import Link from 'next/link'
import Image from 'next/image'
import { PostSummary, TeamSlug, TEAM_INFO } from '@/lib/types'

interface MoreFromTeamProps {
  posts: PostSummary[]
  team: TeamSlug
  currentPostId: number
  className?: string
}

/**
 * More articles from the same team
 * Displays related content based on team/category
 */
export default function MoreFromTeam({
  posts,
  team,
  currentPostId,
  className = '',
}: MoreFromTeamProps) {
  const teamInfo = TEAM_INFO[team]

  // Filter out current post and limit to 4
  const relatedPosts = posts
    .filter((post) => post.id !== currentPostId)
    .slice(0, 4)

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <section className={`rounded-xl overflow-hidden ${className}`} style={{ backgroundColor: 'var(--sm-card)' }}>
      {/* Header */}
      <div
        className="px-6 py-4"
        style={{ borderBottom: '1px solid var(--sm-border)', borderLeftColor: teamInfo.secondaryColor, borderLeftWidth: '4px', borderLeftStyle: 'solid' }}
      >
        <div className="flex items-center justify-between">
          <h3
            className="text-[16px] font-bold uppercase"
            style={{ fontFamily: "Barlow, sans-serif", color: 'var(--sm-text)' }}
          >
            More {teamInfo.shortName} News
          </h3>
          <Link
            href={`/${getTeamCategorySlug(team)}`}
            className="text-sm hover:underline"
            style={{ color: teamInfo.secondaryColor }}
          >
            View All →
          </Link>
        </div>
      </div>

      {/* Posts list */}
      <div className="divide-y" style={{ borderColor: 'var(--sm-border)' }}>
        {relatedPosts.map((post) => (
          <RelatedPostCard key={post.id} post={post} teamColor={teamInfo.secondaryColor} />
        ))}
      </div>
    </section>
  )
}

/**
 * Individual related post card
 */
function RelatedPostCard({
  post,
  teamColor,
}: {
  post: PostSummary
  teamColor: string
}) {
  return (
    <Link
      href={`/${post.categorySlug}/${post.slug}`}
      className="group flex gap-4 p-4 transition-colors hover:brightness-95 dark:hover:brightness-110"
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded">
        <Image
          src={post.featuredImage || '/placeholder.jpg'}
          alt=""
          fill
          className="object-cover group-hover:scale-105 transition-transform"
        />
        <div
          className="absolute top-0 left-0 w-1 h-full"
          style={{ backgroundColor: teamColor }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4
          className="text-[14px] font-semibold leading-tight line-clamp-2 transition-colors"
          style={{ fontFamily: "Barlow, sans-serif", color: 'var(--sm-text)' }}
        >
          {post.title}
        </h4>
        <p className="text-[11px] mt-1" style={{ color: 'var(--sm-text-muted)' }}>
          {new Date(post.publishedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>
    </Link>
  )
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
