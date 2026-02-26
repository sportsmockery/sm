'use client'

import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import type { EnrichedHeadline } from '@/lib/dataBroker'

interface BearsNewsFeedProps {
  headlines: EnrichedHeadline[]
}

function highlightStats(text: string, stats: { value: string }[]): React.ReactNode {
  if (!stats.length) return text

  const result = text
  const parts: React.ReactNode[] = []
  let lastIndex = 0

  for (const stat of stats) {
    const idx = result.indexOf(stat.value, lastIndex)
    if (idx === -1) continue

    if (idx > lastIndex) {
      parts.push(result.slice(lastIndex, idx))
    }
    parts.push(
      <mark key={idx} className="b1-stat-highlight">
        {stat.value}
      </mark>
    )
    lastIndex = idx + stat.value.length
  }

  if (lastIndex < result.length) {
    parts.push(result.slice(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function BearsNewsFeed({ headlines }: BearsNewsFeedProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div>
      {/* Section label */}
      <span
        style={{
          fontSize: 10,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#bc0000',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          display: 'block',
          marginBottom: 12,
        }}
      >
        Bears Intel Feed
      </span>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {headlines.map((headline, i) => (
          <Link
            key={headline.postId || i}
            href={`/${headline.category || 'chicago-bears'}/${headline.postId}`}
            style={{
              display: 'block',
              padding: '12px 14px',
              background: isDark ? 'rgba(10,10,10,0.6)' : 'rgba(250,250,250,0.8)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
              borderRadius: 8,
              textDecoration: 'none',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = isDark ? 'rgba(188,0,0,0.2)' : 'rgba(188,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
            }}
          >
            {/* Title */}
            <h3
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: isDark ? '#ddd' : '#222',
                lineHeight: 1.35,
                margin: 0,
                marginBottom: 4,
              }}
            >
              {highlightStats(headline.title, headline.keyStats || [])}
            </h3>

            {/* Excerpt */}
            {headline.excerpt && (
              <p
                style={{
                  fontSize: 11,
                  lineHeight: 1.4,
                  color: isDark ? '#777' : '#888',
                  margin: 0,
                  marginBottom: 6,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {headline.excerpt}
              </p>
            )}

            {/* Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {headline.publishedAt && (
                <span
                  style={{
                    fontSize: 10,
                    color: isDark ? '#555' : '#aaa',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {timeAgo(headline.publishedAt)}
                </span>
              )}
              {headline.keyStats?.length > 0 && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    padding: '1px 5px',
                    borderRadius: 3,
                    background: isDark ? 'rgba(188,0,0,0.12)' : 'rgba(188,0,0,0.06)',
                    color: '#bc0000',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {headline.keyStats[0].value}
                </span>
              )}
            </div>
          </Link>
        ))}

        {headlines.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', fontSize: 12, color: isDark ? '#555' : '#999' }}>
            No Bears headlines available
          </div>
        )}
      </div>
    </div>
  )
}
