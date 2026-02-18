'use client'

import { useState } from 'react'

interface Team {
  name: string
  abbreviation: string
  logo?: string
  record?: string
}

interface Game {
  id: string
  homeTeam: Team
  awayTeam: Team
  date: string
  time: string
  venue: string
  broadcast?: string
  chicagoTeam: 'bears' | 'bulls' | 'cubs' | 'whitesox' | 'blackhawks'
}

const sampleGames: Game[] = [
  {
    id: '1',
    homeTeam: { name: 'Bears', abbreviation: 'CHI', record: '8-5' },
    awayTeam: { name: 'Packers', abbreviation: 'GB', record: '7-6' },
    date: 'Sun, Dec 22',
    time: '12:00 PM',
    venue: 'Soldier Field',
    broadcast: 'FOX',
    chicagoTeam: 'bears',
  },
  {
    id: '2',
    homeTeam: { name: 'Bulls', abbreviation: 'CHI', record: '15-18' },
    awayTeam: { name: 'Heat', abbreviation: 'MIA', record: '14-17' },
    date: 'Mon, Dec 23',
    time: '7:00 PM',
    venue: 'United Center',
    broadcast: 'NBCSCH',
    chicagoTeam: 'bulls',
  },
  {
    id: '3',
    homeTeam: { name: 'Blackhawks', abbreviation: 'CHI', record: '10-20-4' },
    awayTeam: { name: 'Blues', abbreviation: 'STL', record: '15-14-3' },
    date: 'Tue, Dec 24',
    time: '6:00 PM',
    venue: 'United Center',
    broadcast: 'ESPN+',
    chicagoTeam: 'blackhawks',
  },
]

const teamColors: Record<string, { bg: string; border: string }> = {
  bears: { bg: 'bg-[#0B162A]', border: 'border-l-[#C83803]' },
  bulls: { bg: 'bg-[#CE1141]', border: 'border-l-[#CE1141]' },
  cubs: { bg: 'bg-[#0E3386]', border: 'border-l-[#0E3386]' },
  whitesox: { bg: 'bg-[#27251F]', border: 'border-l-[#27251F]' },
  blackhawks: { bg: 'bg-[#CF0A2C]', border: 'border-l-[#CF0A2C]' },
}

interface UpcomingGamesProps {
  games?: Game[]
  compact?: boolean
  className?: string
}

export default function UpcomingGames({ games = sampleGames, compact = false, className = '' }: UpcomingGamesProps) {
  const [filter, setFilter] = useState<'all' | 'bears' | 'bulls' | 'cubs' | 'whitesox' | 'blackhawks'>('all')

  const filteredGames = filter === 'all' ? games : games.filter((g) => g.chicagoTeam === filter)

  // Compact version for sidebar
  if (compact) {
    return (
      <div className={`space-y-3 ${className}`}>
        {games.slice(0, 3).map((game) => {
          const colors = teamColors[game.chicagoTeam]
          return (
            <div
              key={game.id}
              className={`border-l-4 ${colors.border} p-3`}
              style={{ backgroundColor: 'var(--sm-surface)' }}
            >
              {/* Teams */}
              <div className="mb-1 flex items-center justify-between text-sm font-semibold">
                <span style={{ color: 'var(--sm-text)' }}>{game.awayTeam.abbreviation}</span>
                <span className="text-xs" style={{ color: 'var(--sm-text-dim)' }}>@</span>
                <span style={{ color: 'var(--sm-text)' }}>{game.homeTeam.abbreviation}</span>
              </div>
              {/* Date/Time */}
              <div className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                {game.date} · {game.time}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Full version with filters
  return (
    <section className={className}>
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold" style={{ color: 'var(--sm-text)' }}>
            <svg
              className="h-5 w-5 text-[#8B0000]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Upcoming Games
          </h3>
        </div>

        {/* Team filter */}
        <div className="mb-4 flex flex-wrap gap-2">
          {(['all', 'bears', 'bulls', 'cubs', 'whitesox', 'blackhawks'] as const).map((team) => (
            <button
              key={team}
              onClick={() => setFilter(team)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === team
                  ? 'bg-[#8B0000] text-white'
                  : ''
              }`}
              style={filter !== team ? { backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' } : undefined}
            >
              {team === 'all' ? 'All' : team === 'whitesox' ? 'White Sox' : team.charAt(0).toUpperCase() + team.slice(1)}
            </button>
          ))}
        </div>

        {/* Games list */}
        <div className="space-y-3">
          {filteredGames.length === 0 ? (
            <p className="py-4 text-center text-sm" style={{ color: 'var(--sm-text-muted)' }}>
              No upcoming games for this team
            </p>
          ) : (
            filteredGames.map((game) => {
              const colors = teamColors[game.chicagoTeam]
              return (
                <div key={game.id} className={`border-l-4 ${colors.border} rounded-r-lg p-4`} style={{ backgroundColor: 'var(--sm-surface)' }}>
                  {/* Teams */}
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium" style={{ color: 'var(--sm-text)' }}>{game.awayTeam.name}</span>
                      {game.awayTeam.record && (
                        <span className="ml-1 text-xs" style={{ color: 'var(--sm-text-dim)' }}>({game.awayTeam.record})</span>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--sm-text-dim)' }}>@</span>
                    <div className="text-right text-sm">
                      <span className="font-semibold" style={{ color: 'var(--sm-text)' }}>{game.homeTeam.name}</span>
                      {game.homeTeam.record && (
                        <span className="ml-1 text-xs" style={{ color: 'var(--sm-text-dim)' }}>({game.homeTeam.record})</span>
                      )}
                    </div>
                  </div>

                  {/* Game info */}
                  <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                    <span>{game.date}</span>
                    <span>·</span>
                    <span>{game.time}</span>
                    <span>·</span>
                    <span>{game.venue}</span>
                    {game.broadcast && (
                      <>
                        <span>·</span>
                        <span className="font-medium">{game.broadcast}</span>
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* View full schedule link */}
        <a
          href="/schedule"
          className="mt-4 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors"
          style={{ border: '1px solid var(--sm-border)', color: 'var(--sm-text-muted)' }}
        >
          View Full Schedule
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    </section>
  )
}
