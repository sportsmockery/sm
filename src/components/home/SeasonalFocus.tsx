'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import type { TeamData, Post } from '@/lib/homepage-data'
import { FadeInView } from '@/components/motion'

interface SeasonalFocusProps {
  teams: { team: TeamData; posts: Post[] }[]
}

/**
 * SeasonalFocus - In Season Right Now section
 *
 * GUARANTEE: Always renders at least 1 team card.
 * Shows teams currently in active season with their recent posts.
 * Features staggered entrance animations for team cards.
 */
export function SeasonalFocus({ teams }: SeasonalFocusProps) {
  // Show up to 3 active teams
  const displayTeams = teams.slice(0, 3)
  const prefersReducedMotion = useReducedMotion()

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  }

  if (displayTeams.length === 0) return null

  return (
    <FadeInView as="section" className="sm-section sm-seasonal-section" threshold={0.1}>
      <div className="sm-container">
        <header className="sm-section-header">
          <h2 className="sm-section-title">In Season Right Now</h2>
          <p className="sm-section-subtitle">The teams making (or breaking) our hearts this week.</p>
        </header>

        <motion.div
          className="sm-seasonal-grid"
          variants={prefersReducedMotion ? {} : containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {displayTeams.map(({ team, posts }) => (
            <motion.article
              key={team.id}
              className={`sm-team-card sm-team-card--${team.id.toLowerCase()}`}
              variants={prefersReducedMotion ? {} : cardVariants}
              whileHover={prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
            >
              <div className="sm-team-card-header">
                <div className="sm-team-info">
                  <h3 className="sm-team-name">{team.name}</h3>
                  <span className="sm-team-record">{team.record || 'Season in progress'}</span>
                </div>
                <span className="sm-team-league">{team.league}</span>
              </div>

              <div className="sm-team-status">
                <span className={`sm-status-indicator ${team.isPlayingNow ? 'sm-status-indicator--live' : ''}`}>
                  {team.isPlayingNow ? 'LIVE NOW' : team.nextGame?.shortLabel || 'Schedule TBD'}
                </span>
              </div>

              {/* Team Posts */}
              {posts.length > 0 && (
                <ul className="sm-team-posts">
                  {posts.slice(0, 3).map((post) => (
                    <li key={post.id} className="sm-team-post">
                      <Link href={`/${post.category.slug}/${post.slug}`}>
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="sm-team-links">
                <Link href={`/${getTeamSlug(team.id)}`} className="sm-chip sm-chip--ghost">
                  All {getTeamShortName(team.id)} stories
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </FadeInView>
  )
}

function getTeamSlug(teamId: string): string {
  const slugs: Record<string, string> = {
    BEARS: 'chicago-bears',
    BULLS: 'chicago-bulls',
    BLACKHAWKS: 'chicago-blackhawks',
    CUBS: 'chicago-cubs',
    WHITE_SOX: 'chicago-white-sox',
    CITYWIDE: 'chicago',
  }
  return slugs[teamId] || 'chicago'
}

function getTeamShortName(teamId: string): string {
  const names: Record<string, string> = {
    BEARS: 'Bears',
    BULLS: 'Bulls',
    BLACKHAWKS: 'Hawks',
    CUBS: 'Cubs',
    WHITE_SOX: 'Sox',
    CITYWIDE: 'Chicago',
  }
  return names[teamId] || 'Chicago'
}
