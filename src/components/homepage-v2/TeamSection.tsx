'use client'

import Link from 'next/link'
import { Montserrat } from 'next/font/google'
import { motion } from 'framer-motion'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700'] })

type TeamName = 'bears' | 'bulls' | 'blackhawks' | 'cubs' | 'whitesox'

interface TeamArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  category: {
    name: string
    slug: string
  }
  published_at: string
}

interface Team {
  name: string
  slug: string
  articles: TeamArticle[]
  record?: string
  nextGame?: string
}

interface TeamSectionProps {
  teams: Team[]
  className?: string
}

// Team-specific colors
const TEAM_COLORS: Record<string, { primary: string; accent: string; border: string }> = {
  'chicago-bears': {
    primary: 'bg-[#0B162A]',
    accent: 'text-orange-500',
    border: 'border-orange-500',
  },
  'chicago-bulls': {
    primary: 'bg-red-700',
    accent: 'text-red-600',
    border: 'border-red-600',
  },
  'chicago-blackhawks': {
    primary: 'bg-red-800',
    accent: 'text-red-600',
    border: 'border-red-600',
  },
  'chicago-cubs': {
    primary: 'bg-blue-800',
    accent: 'text-blue-600',
    border: 'border-blue-600',
  },
  'chicago-white-sox': {
    primary: 'bg-zinc-900',
    accent: 'text-zinc-400',
    border: 'border-zinc-600',
  },
}

/**
 * Team Section
 *
 * Horizontal flex layout showing each team's:
 * - Team name with colors
 * - Latest articles
 * - Record and next game
 * - Quick links
 */
export default function TeamSection({ teams, className = '' }: TeamSectionProps) {
  if (teams.length === 0) {
    return null
  }

  return (
    <section className={className} aria-label="Team sections">
      <div className="flex flex-col lg:flex-row gap-6">
        {teams.map((team, index) => (
          <TeamCard key={team.slug} team={team} index={index} />
        ))}
      </div>
    </section>
  )
}

function TeamCard({ team, index }: { team: Team; index: number }) {
  const colors = TEAM_COLORS[team.slug] || {
    primary: 'bg-zinc-800',
    accent: 'text-red-600',
    border: 'border-red-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex-1 border"
      style={{ backgroundColor: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}
    >
      {/* Team header */}
      <header className={`${colors.primary} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <Link
            href={`/${team.slug}`}
            className={`text-white text-lg uppercase tracking-wide hover:underline focus:outline-none focus:underline ${montserrat.className}`}
          >
            {team.name}
          </Link>
          {team.record && (
            <span className="text-white/80 text-sm font-mono">{team.record}</span>
          )}
        </div>
        {team.nextGame && (
          <div className="text-white/60 text-xs mt-1">Next: {team.nextGame}</div>
        )}
      </header>

      {/* Articles list */}
      <ul className="divide-y" style={{ borderColor: 'var(--sm-border)' }}>
        {team.articles.slice(0, 3).map((article) => (
          <li key={article.id}>
            <Link
              href={`/${article.category.slug}/${article.slug}`}
              className="block p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-600 group hover:opacity-80"
            >
              <h3 className="text-sm font-medium leading-snug group-hover:text-red-600 transition-colors line-clamp-2" style={{ color: 'var(--sm-text)' }}>
                {article.title}
              </h3>
              <time
                dateTime={article.published_at}
                className="text-xs mt-1 block"
                style={{ color: 'var(--sm-text-muted)' }}
              >
                {formatRelativeTime(article.published_at)}
              </time>
            </Link>
          </li>
        ))}
      </ul>

      {/* View more link */}
      <div className={`px-4 py-3 border-t ${colors.border}`}>
        <Link
          href={`/${team.slug}`}
          className={`text-sm font-bold hover:underline focus:outline-none focus:underline ${colors.accent}`}
        >
          More {team.name} →
        </Link>
      </div>
    </motion.div>
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
