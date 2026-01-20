'use client'

import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { motion, useReducedMotion } from 'framer-motion'
import TeamColorBadge from '@/components/ui/TeamColorBadge'

interface HeroArticle {
  title: string
  slug: string
  excerpt?: string
  featured_image?: string
  published_at: string
  category: {
    name: string
    slug: string
  }
  author?: {
    name: string
    avatar_url?: string
  }
}

interface HeroSectionProps {
  article: HeroArticle
  className?: string
}

export default function HeroSection({ article, className = '' }: HeroSectionProps) {
  const readingTime = Math.ceil((article.excerpt?.length || 200) / 200)
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden ${className}`}
    >
      <Link
        href={`/${article.category.slug}/${article.slug}`}
        className="group block"
      >
        {/* Background Image */}
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
          {article.featured_image ? (
            <motion.div
              className="absolute inset-0"
              whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <Image
                src={article.featured_image}
                alt={article.title}
                fill
                priority
                className="object-cover"
              />
            </motion.div>
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
          )}

          {/* Enhanced multi-layer gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-12">
            <motion.div
              className="mx-auto max-w-6xl"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Category badge */}
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <TeamColorBadge team={article.category.slug} size="md" className="mb-4">
                  {article.category.name}
                </TeamColorBadge>
              </motion.div>

              {/* Title */}
              <motion.h1
                className="mb-4 max-w-4xl text-balance font-heading text-2xl font-black text-white transition-colors group-hover:text-[#FF6666] sm:text-4xl lg:text-5xl xl:text-6xl"
                style={{ lineHeight: 'var(--line-height-tight)' }}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {article.title}
              </motion.h1>

              {/* Excerpt */}
              {article.excerpt && (
                <motion.p
                  className="mb-6 hidden max-w-2xl text-lg text-zinc-300 text-pretty sm:block"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {article.excerpt.slice(0, 150)}...
                </motion.p>
              )}

              {/* Meta */}
              <motion.div
                className="flex flex-wrap items-center gap-4 text-sm text-zinc-400"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                {/* Author */}
                {article.author && (
                  <div className="flex items-center gap-2">
                    {article.author.avatar_url ? (
                      <Image
                        src={article.author.avatar_url}
                        alt={article.author.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8B0000] text-sm font-bold text-white">
                        {article.author.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-white">{article.author.name}</span>
                  </div>
                )}

                {/* Date */}
                <span>
                  {format(new Date(article.published_at), 'MMM d, yyyy')}
                </span>

                {/* Reading time */}
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {readingTime} min read
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.section>
  )
}
