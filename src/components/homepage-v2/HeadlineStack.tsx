'use client'

import Link from 'next/link'
import { Montserrat } from 'next/font/google'
import { motion } from 'framer-motion'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700'] })

interface Headline {
  id: string
  slug: string
  title: string
  category: {
    name: string
    slug: string
  }
  published_at: string
  isHot?: boolean
}

interface HeadlineStackProps {
  headlines: Headline[]
  title?: string
  className?: string
}

/**
 * Headline Stack
 *
 * Vertical text list like ESPN's right sidebar:
 * - Numbered headlines
 * - Category tags
 * - Hot indicator for trending
 * - Text-dominant, no images
 */
export default function HeadlineStack({
  headlines,
  title = 'Top Headlines',
  className = '',
}: HeadlineStackProps) {
  if (headlines.length === 0) {
    return null
  }

  return (
    <section
      className={`border ${className}`}
      style={{ backgroundColor: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}
      aria-labelledby="headline-stack-title"
    >
      {/* Header */}
      <header className="px-4 py-3 border-b border-red-600" style={{ backgroundColor: 'var(--sm-surface)' }}>
        <h2
          id="headline-stack-title"
          className={`text-lg uppercase tracking-wide ${montserrat.className}`}
          style={{ color: 'var(--sm-text)' }}
        >
          {title}
        </h2>
      </header>

      {/* Headlines list */}
      <ol className="divide-y" style={{ borderColor: 'var(--sm-border)' }} role="list">
        {headlines.map((headline, index) => (
          <motion.li
            key={headline.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={`/${headline.category.slug}/${headline.slug}`}
              className="flex items-start gap-3 p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-600 group hover:opacity-80"
            >
              {/* Number */}
              <span
                className={`flex-shrink-0 w-6 h-6 flex items-center justify-center text-sm font-bold rounded ${
                  index < 3
                    ? 'bg-red-600 text-white'
                    : ''
                } ${montserrat.className}`}
                style={index >= 3 ? { backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' } : undefined}
              >
                {index + 1}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Category and hot indicator */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-red-600 font-bold uppercase">
                    {headline.category.name}
                  </span>
                  {headline.isHot && (
                    <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase">
                      HOT
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-medium leading-snug group-hover:text-red-600 transition-colors line-clamp-2" style={{ color: 'var(--sm-text)' }}>
                  {headline.title}
                </h3>

                {/* Time */}
                <time
                  dateTime={headline.published_at}
                  className="text-xs mt-1 block"
                  style={{ color: 'var(--sm-text-muted)' }}
                >
                  {formatRelativeTime(headline.published_at)}
                </time>
              </div>
            </Link>
          </motion.li>
        ))}
      </ol>

      {/* View all link */}
      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--sm-border)' }}>
        <Link
          href="/search"
          className="text-sm text-red-600 font-bold hover:underline focus:outline-none focus:underline"
        >
          View All Headlines →
        </Link>
      </div>
    </section>
  )
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
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
