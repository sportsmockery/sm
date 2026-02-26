'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'


interface HeroArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  category: {
    name: string
    slug: string
  }
  author?: {
    name: string
  }
  published_at: string
}

interface HeroSectionProps {
  article: HeroArticle | null
  onARClick?: () => void
  isElite?: boolean
  className?: string
}

/**
 * Hero Section
 *
 * Small text-only featured section (200px height):
 * - Title at 36pt (text-4xl)
 * - Excerpt at 16pt (text-base)
 * - No large images, text-dominant
 * - Category badge in red
 * - AR button for elite users
 */
export default function HeroSection({
  article,
  onARClick,
  isElite = false,
  className = '',
}: HeroSectionProps) {
  if (!article) {
    return (
      <section
        className={`h-[200px] flex items-center justify-center ${className}`}
        style={{ backgroundColor: 'var(--sm-surface)' }}
        aria-label="Featured article loading"
      >
        <div className="animate-pulse" style={{ color: 'var(--sm-text-muted)' }}>Loading featured story...</div>
      </section>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative h-[200px] flex flex-col justify-center px-6 md:px-12 border-b-4 border-red-600 ${className}`}
      style={{ background: 'linear-gradient(to right, var(--sm-surface), var(--sm-card))' }}
      role="banner"
      aria-label="Featured article"
    >
      <div className="max-w-4xl">
        {/* Category badge */}
        <Link
          href={`/${article.category.slug}`}
          className="inline-block mb-3 px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
        >
          {article.category.name}
        </Link>

        {/* Title - 36pt */}
        <h1 className="mb-3">
          <Link
            href={`/${article.category.slug}/${article.slug}`}
            className={`text-4xl md:text-5xl hover:text-red-600 transition-colors focus:outline-none focus:underline focus:decoration-red-600 `}
            style={{ color: 'var(--sm-text)' }}
          >
            {article.title}
          </Link>
        </h1>

        {/* Excerpt - 16pt */}
        <p className="text-base line-clamp-2 max-w-2xl font-serif" style={{ color: 'var(--sm-text-muted)' }}>
          {article.excerpt}
        </p>

        {/* Meta and AR button row */}
        <div className="mt-4 flex items-center gap-4">
          <span className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
            By {article.author?.name || 'Staff'} • {formatDate(article.published_at)}
          </span>

          {/* AR Button - Elite Only */}
          {onARClick && (
            <button
              onClick={onARClick}
              className="px-4 py-2 bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              aria-label={isElite ? 'View in AR' : 'Unlock AR Mockery - Elite Only'}
            >
              {isElite ? '🎮 View in AR' : '🔒 Unlock AR Mockery - Elite Only'}
            </button>
          )}
        </div>
      </div>

      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-red-600/5 to-transparent pointer-events-none" />
    </motion.section>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
