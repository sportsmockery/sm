'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { motion, useReducedMotion } from 'framer-motion'
import type { Post } from '@/lib/homepage-data'
import { FadeInView } from '@/components/motion'

interface LatestStreamProps {
  posts: Post[]
}

/**
 * LatestStream - Latest from Chicago section
 *
 * GUARANTEE: Always renders content.
 * Displays up to 15 latest posts in a clean list with staggered entrance animations.
 */
export function LatestStream({ posts }: LatestStreamProps) {
  const displayPosts = posts.slice(0, 15)
  const prefersReducedMotion = useReducedMotion()

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  }

  return (
    <FadeInView as="section" className="sm-section sm-latest-section" threshold={0.1}>
      <div className="sm-container">
        <header className="sm-section-header">
          <h2 className="sm-section-title">Latest from Chicago</h2>
          <p className="sm-section-subtitle">Fresh takes, breaking news, and everything in between.</p>
        </header>

        <motion.div
          className="sm-latest-grid"
          variants={prefersReducedMotion ? {} : containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {displayPosts.map((post) => (
            <motion.article
              key={post.id}
              className="sm-latest-item"
              variants={prefersReducedMotion ? {} : itemVariants}
            >
              <div className="sm-latest-marker">
                <span className={`sm-team-dot sm-team-dot--${getTeamClass(post.category.name)}`} />
              </div>
              <div className="sm-latest-content">
                <header className="sm-latest-header">
                  <span className={`sm-tag sm-tag--${getTeamClass(post.category.name)} sm-tag--small`}>
                    {getCategoryAbbrev(post.category.name)}
                  </span>
                  <span className="sm-latest-time">
                    {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
                  </span>
                </header>
                <Link href={`/${post.category.slug}/${post.slug}`} className="sm-latest-link">
                  <h3 className="sm-latest-title">{post.title}</h3>
                </Link>
                {post.excerpt && (
                  <p className="sm-latest-excerpt">{truncateExcerpt(post.excerpt, 120)}</p>
                )}
              </div>
            </motion.article>
          ))}
        </motion.div>

        <div className="sm-latest-footer">
          <Link href="/latest" className="sm-chip sm-chip--primary">
            View all stories
          </Link>
        </div>
      </div>
    </FadeInView>
  )
}

function getTeamClass(categoryName: string): string {
  const name = categoryName.toLowerCase()
  if (name.includes('bears')) return 'bears'
  if (name.includes('bulls')) return 'bulls'
  if (name.includes('cubs')) return 'cubs'
  if (name.includes('white sox') || name.includes('sox')) return 'whitesox'
  if (name.includes('blackhawks') || name.includes('hawks')) return 'blackhawks'
  return 'citywide'
}

function getCategoryAbbrev(categoryName: string): string {
  const name = categoryName.toLowerCase()
  if (name.includes('bears')) return 'BEARS'
  if (name.includes('bulls')) return 'BULLS'
  if (name.includes('cubs')) return 'CUBS'
  if (name.includes('white sox') || name.includes('sox')) return 'SOX'
  if (name.includes('blackhawks') || name.includes('hawks')) return 'HAWKS'
  return 'CHI'
}

function truncateExcerpt(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}
