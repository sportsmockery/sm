'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { HomepageTimelineItem, TEAM_INFO } from '@/lib/types'

interface HomepageTimelineProps {
  items: HomepageTimelineItem[]
  className?: string
}

/**
 * Chronological timeline feed for homepage
 * Shows posts in time order with team color accents
 * Breaking news and Bears stories are highlighted
 */
export default function HomepageTimeline({
  items,
  className = '',
}: HomepageTimelineProps) {
  const [showCount, setShowCount] = useState(10)

  const visibleItems = items.slice(0, showCount)
  const hasMore = items.length > showCount

  const loadMore = () => {
    setShowCount((prev) => Math.min(prev + 10, items.length))
  }

  if (items.length === 0) {
    return null
  }

  return (
    <section className={`bg-[#f5f5f5] dark:bg-[#0a0a0b] ${className}`}>
      <div className="max-w-[1110px] mx-auto px-4 py-8">
        {/* Section header */}
        <h2
          className="text-[18px] font-bold text-[#222] dark:text-white uppercase mb-6 pb-2 border-b-[3px] border-[#bc0000]"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Latest Updates
        </h2>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          {/* Timeline items */}
          <div className="space-y-6">
            {visibleItems.map((item, index) => (
              <TimelineItem
                key={item.id}
                item={item}
                isFirst={index === 0}
              />
            ))}
          </div>
        </div>

        {/* Load more button */}
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700 text-[#222] dark:text-white font-semibold text-sm hover:border-[#bc0000] hover:text-[#bc0000] transition-colors rounded-lg"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Load More
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * Individual timeline item
 */
function TimelineItem({
  item,
  isFirst,
}: {
  item: HomepageTimelineItem
  isFirst: boolean
}) {
  const { post, type, isBreaking } = item
  const teamInfo = TEAM_INFO[post.team]
  const isBears = post.team === 'bears'

  // Format timestamp
  const timestamp = new Date(item.timestamp)
  const timeAgo = getTimeAgo(timestamp)
  const formattedTime = timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <article className="relative pl-12 md:pl-16">
      {/* Timeline dot */}
      <div
        className={`absolute left-2 md:left-4 w-4 h-4 rounded-full border-2 bg-white dark:bg-[#0a0a0b] ${
          isBreaking
            ? 'border-red-500 animate-pulse'
            : isBears
            ? 'border-[#C83803]'
            : 'border-gray-300 dark:border-gray-600'
        }`}
        style={{
          borderColor: !isBreaking && !isBears ? undefined : (isBreaking ? '#ef4444' : teamInfo.secondaryColor),
        }}
      />

      {/* Content card */}
      <div
        className={`bg-white dark:bg-[#111] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
          isBreaking ? 'ring-2 ring-red-500' : ''
        }`}
      >
        <Link
          href={`/${post.categorySlug}/${post.slug}`}
          className="group flex flex-col md:flex-row"
        >
          {/* Image */}
          <div className="relative md:w-48 aspect-video md:aspect-auto flex-shrink-0">
            <Image
              src={post.featuredImage || '/placeholder.jpg'}
              alt=""
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
            {/* Team color accent */}
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: teamInfo.primaryColor }}
            />
            {/* Breaking badge */}
            {isBreaking && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wide rounded animate-pulse">
                Breaking
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            {/* Meta row */}
            <div className="flex items-center gap-2 mb-2">
              {/* Team/category tag */}
              <span
                className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded"
                style={{
                  backgroundColor: isBears ? `${teamInfo.secondaryColor}20` : '#f5f5f5',
                  color: isBears ? teamInfo.secondaryColor : '#666',
                }}
              >
                {post.categoryName.replace('Chicago ', '')}
              </span>

              {/* Time */}
              <span className="text-[11px] text-gray-400">
                {timeAgo} • {formattedTime}
              </span>

              {/* Type badge */}
              {type === 'rumor' && (
                <span className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded font-medium">
                  Rumor
                </span>
              )}
            </div>

            {/* Title */}
            <h3
              className="text-[15px] md:text-[16px] font-bold text-[#222] dark:text-white leading-tight line-clamp-2 group-hover:text-[#bc0000] transition-colors"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {post.title}
            </h3>

            {/* Excerpt (hidden on mobile) */}
            {post.excerpt && (
              <p className="hidden md:block text-[13px] text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                {post.excerpt}
              </p>
            )}

            {/* Author */}
            <p className="text-[11px] text-gray-400 mt-2">
              By {post.author.displayName}
            </p>
          </div>
        </Link>
      </div>
    </article>
  )
}

/**
 * Get relative time string
 */
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
