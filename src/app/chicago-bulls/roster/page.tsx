import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getBullsRosterGrouped, POSITION_GROUP_NAMES, type BullsPlayer, type PositionGroup } from '@/lib/bullsData'

export const metadata: Metadata = {
  title: 'Chicago Bulls Roster 2024-25 | SportsMockery',
  description: 'Complete 2024-25 Chicago Bulls roster with player profiles, positions, measurements, and stats.',
}

export const revalidate = 3600

const POSITION_ORDER: PositionGroup[] = ['guards', 'forwards', 'centers']

export default async function BullsRosterPage() {
  const team = CHICAGO_TEAMS.bulls

  const [roster, record, nextGame] = await Promise.all([
    getBullsRosterGrouped(),
    fetchTeamRecord('bulls'),
    fetchNextGame('bulls'),
  ])

  const allPlayers = Object.values(roster).flat()

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="roster"
    >
      {/* Summary Bar */}
      <div
        className="rounded-xl p-4 mb-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Total: </span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{allPlayers.length} players</span>
          </div>
          {POSITION_ORDER.map(group => {
            const count = roster[group]?.length || 0
            if (count === 0) return null
            return (
              <div key={group}>
                <span style={{ color: 'var(--text-muted)' }}>{POSITION_GROUP_NAMES[group]}: </span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {POSITION_ORDER.map(group => {
          const players = roster[group]
          if (!players || players.length === 0) return null

          return (
            <div key={group} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {POSITION_GROUP_NAMES[group]}
                </h2>
                <span className="text-sm text-[var(--text-muted)]">
                  {players.length} player{players.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                      <th className="px-4 py-2 w-12">#</th>
                      <th className="px-4 py-2">Player</th>
                      <th className="px-4 py-2 hidden sm:table-cell">Size</th>
                      <th className="px-4 py-2 hidden md:table-cell">College</th>
                      <th className="px-4 py-2 hidden lg:table-cell">Exp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => (
                      <tr
                        key={player.playerId}
                        className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#CE1141] text-white text-sm font-bold">
                            {player.jerseyNumber ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/chicago-bulls/players/${player.slug}`}
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
                                  unoptimized
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
                              <span className="font-medium text-[var(--text-primary)] group-hover:text-[#CE1141] transition-colors">
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
                          {player.college || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden lg:table-cell">
                          {player.experience || 'R'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </TeamHubLayout>
  )
}
