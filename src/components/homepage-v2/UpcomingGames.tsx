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
      className={`bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 ${className}`}
      aria-labelledby="upcoming-games-title"
    >
      {/* Header */}
      <header className="px-4 py-3 border-b border-red-600 bg-zinc-50 dark:bg-zinc-900">
        <h2
          id="upcoming-games-title"
          className={`text-lg text-black dark:text-white uppercase tracking-wide ${montserrat.className}`}
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
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {games.map((game, index) => (
              <motion.tr
                key={game.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
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
                      <span className={`font-bold text-black dark:text-white ${montserrat.className}`}>
                        {game.team}
                      </span>
                    </div>
                    <span className="text-zinc-400">vs</span>
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
                      <span className="text-black dark:text-white">{game.opponent}</span>
                    </div>
                  </div>
                </td>

                {/* Date/Time */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-black dark:text-white">{formatDate(game.date)}</div>
                  <div className="text-xs text-zinc-500">{game.time}</div>
                </td>

                {/* Venue & broadcast */}
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="text-zinc-600 dark:text-zinc-400">{game.venue}</div>
                  {game.broadcast && (
                    <div className="text-xs text-zinc-500">{game.broadcast}</div>
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
      <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
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
