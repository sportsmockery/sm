'use client'

import Link from 'next/link'
import { BearsTrend, TEAM_INFO } from '@/lib/types'

interface BearsTrendingTopicsProps {
  trends: BearsTrend[]
  className?: string
}

/**
 * Bears trending topics widget
 * Shows hot topics and storylines around the Bears
 */
export default function BearsTrendingTopics({
  trends,
  className = '',
}: BearsTrendingTopicsProps) {
  const bearsInfo = TEAM_INFO.bears

  if (trends.length === 0) {
    return null
  }

  return (
    <div className={`glass-card glass-card-static ${className}`} style={{ overflow: 'hidden', padding: 0 }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--sm-border)',
          borderLeft: `4px solid ${bearsInfo.secondaryColor}`,
        }}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5"
            style={{ color: bearsInfo.secondaryColor }}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
              clipRule="evenodd"
            />
          </svg>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--sm-text)',
              textTransform: 'uppercase',
              fontFamily: "'Space Grotesk', sans-serif",
              margin: 0,
            }}
          >
            Trending Topics
          </h3>
        </div>
      </div>

      {/* Trends list */}
      <div>
        {trends.map((trend, index) => (
          <TrendItem
            key={trend.id}
            trend={trend}
            rank={index + 1}
            teamColor={bearsInfo.secondaryColor}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-surface)' }}>
        <Link
          href="/chicago-bears"
          className="text-sm hover:underline font-medium"
          style={{ color: '#bc0000' }}
        >
          View All Topics →
        </Link>
      </div>
    </div>
  )
}

/**
 * Individual trend item
 */
function TrendItem({
  trend,
  rank,
  teamColor,
}: {
  trend: BearsTrend
  rank: number
  teamColor: string
}) {
  return (
    <Link
      href={`/chicago-bears`}
      className="group flex items-center gap-4 px-6 py-4 hover:bg-[var(--sm-card-hover)] transition-colors"
      style={{ borderBottom: '1px solid var(--sm-border)' }}
    >
      {/* Rank */}
      <div
        className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-[12px] font-bold ${
          rank <= 3
            ? 'text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
        }`}
        style={rank <= 3 ? { backgroundColor: teamColor } : undefined}
      >
        {rank}
      </div>

      {/* Topic info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4
            className="text-[14px] font-semibold group-hover:text-[#bc0000] transition-colors truncate"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--sm-text)' }}
          >
            {trend.title}
          </h4>
          {trend.isHot && (
            <span className="flex-shrink-0 px-1.5 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold rounded uppercase">
              Hot
            </span>
          )}
        </div>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--sm-text-muted)' }}>
          {trend.postCount} {trend.postCount === 1 ? 'article' : 'articles'}
        </p>
      </div>

      {/* Arrow */}
      <svg
        className="w-4 h-4 text-gray-300 group-hover:text-[#bc0000] transition-colors flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
