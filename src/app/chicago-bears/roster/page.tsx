import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBearsRosterGrouped, type BearsPlayer, type PositionGroup } from '@/lib/bearsData'

export const metadata: Metadata = {
  title: 'Chicago Bears Roster 2025 | SportsMockery',
  description: 'Complete 2025 Chicago Bears roster with player profiles, positions, measurements, and stats. View all players by position group.',
}

// Revalidate every hour
export const revalidate = 3600

const POSITION_GROUP_NAMES: Record<PositionGroup, string> = {
  QB: 'Quarterbacks',
  RB: 'Running Backs',
  WR: 'Wide Receivers',
  TE: 'Tight Ends',
  OL: 'Offensive Line',
  DL: 'Defensive Line',
  LB: 'Linebackers',
  CB: 'Cornerbacks',
  S: 'Safeties',
  ST: 'Special Teams',
}

const POSITION_ORDER: PositionGroup[] = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'ST']

export default async function BearsRosterPage() {
  const roster = await getBearsRosterGrouped()

  // Count by side
  const allPlayers = Object.values(roster).flat()
  const offenseCount = allPlayers.filter(p => ['QB', 'RB', 'WR', 'TE', 'OL'].includes(p.positionGroup || '')).length
  const defenseCount = allPlayers.filter(p => ['DL', 'LB', 'CB', 'S'].includes(p.positionGroup || '')).length
  const stCount = allPlayers.filter(p => p.positionGroup === 'ST').length

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B162A] to-[#0B162A]/90 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/chicago-bears" className="hover:text-white">Chicago Bears</Link>
            <span>/</span>
            <span className="text-white">Roster</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Chicago Bears Roster
          </h1>
          <p className="text-white/70 mt-2">
            2025 roster with positions, measurables, and profile links.
          </p>

          {/* Position Count Chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {POSITION_ORDER.map(group => {
              const count = roster[group]?.length || 0
              if (count === 0) return null
              return (
                <span
                  key={group}
                  className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80"
                >
                  {count} {group}
                  {count !== 1 && group !== 'OL' && group !== 'DL' && group !== 'ST' ? 's' : ''}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-[var(--text-muted)]">Total: </span>
              <span className="font-semibold text-[var(--text-primary)]">{allPlayers.length} players</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Offense: </span>
              <span className="font-semibold text-[var(--text-primary)]">{offenseCount}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Defense: </span>
              <span className="font-semibold text-[var(--text-primary)]">{defenseCount}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Special Teams: </span>
              <span className="font-semibold text-[var(--text-primary)]">{stCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Roster Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {POSITION_ORDER.map(group => {
            const players = roster[group]
            if (!players || players.length === 0) return null

            return (
              <PositionCard
                key={group}
                groupName={POSITION_GROUP_NAMES[group]}
                players={players}
              />
            )
          })}
        </div>
      </div>
    </main>
  )
}

function PositionCard({
  groupName,
  players,
}: {
  groupName: string
  players: BearsPlayer[]
}) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] flex items-center justify-between">
        <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          {groupName}
        </h2>
        <span className="text-sm text-[var(--text-muted)]">
          {players.length} player{players.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Player Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
              <th className="px-4 py-2 w-12">#</th>
              <th className="px-4 py-2">Player</th>
              <th className="px-4 py-2 hidden sm:table-cell">Size</th>
              <th className="px-4 py-2 hidden md:table-cell">Exp</th>
              <th className="px-4 py-2 hidden lg:table-cell">Role</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => {
              const isStarter = player.primaryRole?.toLowerCase().includes('starter')

              return (
                <tr
                  key={player.playerId}
                  className={`border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors ${
                    isStarter ? 'bg-[#C83200]/5' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0B162A] text-white text-sm font-bold">
                      {player.jerseyNumber ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/players/${player.slug}`}
                      className="flex items-center gap-3 group"
                    >
                      {player.headshotUrl ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[var(--border-subtle)]">
                          <Image
                            src={player.headshotUrl}
                            alt={player.fullName}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-[var(--text-primary)] group-hover:text-[#C83200] transition-colors">
                          {player.fullName}
                        </span>
                        <div className="text-xs text-[var(--text-muted)]">
                          {player.position}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden sm:table-cell">
                    {player.height && player.weight
                      ? `${player.height} · ${player.weight} lbs`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">
                    {player.experience || 'R'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {player.primaryRole && (
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                          isStarter
                            ? 'bg-[#C83200]/10 text-[#C83200]'
                            : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                        }`}
                      >
                        {player.primaryRole}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
