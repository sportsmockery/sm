'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Montserrat } from 'next/font/google'
import { motion } from 'framer-motion'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700'] })

interface Game {
  id: string
  team: string
  teamLogo?: string
  opponent: string
  opponentLogo?: string
  date: string
  time: string
  venue: string
  broadcast?: string
  mockeryPrediction?: string
}

interface UpcomingGamesProps {
  games: Game[]
  title?: string
  className?: string
}

/**
 * Upcoming Games
 *
 * Table-style component showing upcoming Chicago games:
 * - All 5 teams' schedules
 * - Mockery predictions
 * - Broadcast info
 */
export default function UpcomingGames({
  games,
  title = 'Upcoming Games',
  className = '',
}: UpcomingGamesProps) {
  if (games.length === 0) {
    return null
  }

  return (
    <section
      className={`border ${className}`}
      style={{ backgroundColor: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}
      aria-labelledby="upcoming-games-title"
    >
      {/* Header */}
      <header className="px-4 py-3 border-b border-red-600" style={{ backgroundColor: 'var(--sm-surface)' }}>
        <h2
          id="upcoming-games-title"
          className={`text-lg uppercase tracking-wide ${montserrat.className}`}
          style={{ color: 'var(--sm-text)' }}
        >
          {title}
        </h2>
      </header>

      {/* Games table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead className="sr-only">
            <tr>
              <th>Teams</th>
              <th>Date/Time</th>
              <th>Venue</th>
              <th>Prediction</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--sm-border)' }}>
            {games.map((game, index) => (
              <motion.tr
                key={game.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="transition-colors hover:opacity-80"
              >
                {/* Teams */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* Team logos */}
                    <div className="flex items-center gap-1">
                      {game.teamLogo && (
                        <Image
                          src={game.teamLogo}
                          alt={game.team}
                          width={24}
                          height={24}
                          className="w-6 h-6 object-contain"
                        />
                      )}
                      <span className={`font-bold ${montserrat.className}`} style={{ color: 'var(--sm-text)' }}>
                        {game.team}
                      </span>
                    </div>
                    <span style={{ color: 'var(--sm-text-muted)' }}>vs</span>
                    <div className="flex items-center gap-1">
                      {game.opponentLogo && (
                        <Image
                          src={game.opponentLogo}
                          alt={game.opponent}
                          width={24}
                          height={24}
                          className="w-6 h-6 object-contain"
                        />
                      )}
                      <span style={{ color: 'var(--sm-text)' }}>{game.opponent}</span>
                    </div>
                  </div>
                </td>

                {/* Date/Time */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div style={{ color: 'var(--sm-text)' }}>{formatDate(game.date)}</div>
                  <div className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>{game.time}</div>
                </td>

                {/* Venue & broadcast */}
                <td className="px-4 py-3 hidden md:table-cell">
                  <div style={{ color: 'var(--sm-text-muted)' }}>{game.venue}</div>
                  {game.broadcast && (
                    <div className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>{game.broadcast}</div>
                  )}
                </td>

                {/* Mockery prediction */}
                <td className="px-4 py-3 text-right">
                  {game.mockeryPrediction && (
                    <span className="text-red-600 font-bold text-xs whitespace-nowrap">
                      {game.mockeryPrediction}
                    </span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View all link */}
      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--sm-border)' }}>
        <Link
          href="/chicago-bears/schedule"
          className="text-sm text-red-600 font-bold hover:underline focus:outline-none focus:underline"
        >
          View Full Schedule →
        </Link>
      </div>
    </section>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
