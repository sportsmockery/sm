import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'
import { getWhiteSoxRosterGrouped, getWhiteSoxRecord, POSITION_GROUP_NAMES, type WhiteSoxPlayer, type PositionGroup } from '@/lib/whitesoxData'

export const metadata: Metadata = {
  title: 'Chicago White Sox Roster 2025 | SportsMockery',
  description: 'Complete 2025 Chicago White Sox roster with player profiles, positions, measurements, and stats.',
}

export const revalidate = 3600

const TEAM_COLOR = 'var(--sm-red)'

const POSITION_ORDER: PositionGroup[] = ['pitchers', 'catchers', 'infielders', 'outfielders']

export default async function WhiteSoxRosterPage() {
  const team = CHICAGO_TEAMS.whitesox

  const [roster, soxRecord, nextGame] = await Promise.all([
    getWhiteSoxRosterGrouped(),
    getWhiteSoxRecord(),
    fetchNextGame('whitesox'),
  ])

  const record = {
    wins: soxRecord.wins,
    losses: soxRecord.losses,
  }

  const allPlayers = Object.values(roster).flat()

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="roster"
    >
      {/* Summary Bar */}
      <div className="glass-card glass-card-sm glass-card-static mb-6">
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span style={{ color: 'var(--sm-text-muted)' }}>Total: </span>
            <span className="font-semibold" style={{ color: 'var(--sm-text)' }}>{allPlayers.length} players</span>
          </div>
          {POSITION_ORDER.map(group => {
            const count = roster[group]?.length || 0
            if (count === 0) return null
            return (
              <div key={group}>
                <span style={{ color: 'var(--sm-text-muted)' }}>{POSITION_GROUP_NAMES[group]}: </span>
                <span className="font-semibold" style={{ color: 'var(--sm-text)' }}>{count}</span>
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
            <div
              key={group}
              className={`glass-card glass-card-static ${group === 'pitchers' ? 'lg:col-span-2' : ''}`}
              style={{ overflow: 'hidden', padding: 0 }}
            >
              <div
                className="flex items-center justify-between"
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'var(--sm-surface)',
                  borderBottom: '1px solid var(--sm-border)',
                  borderLeft: `3px solid ${TEAM_COLOR}`,
                }}
              >
                <h2 className="font-bold" style={{ color: 'var(--sm-text)', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {POSITION_GROUP_NAMES[group]}
                </h2>
                <span className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                  {players.length} player{players.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)', borderBottom: '1px solid var(--sm-border)' }}>
                      <th className="px-4 py-2 w-12">#</th>
                      <th className="px-4 py-2">Player</th>
                      <th className="px-4 py-2 hidden sm:table-cell">Size</th>
                      <th className="px-4 py-2 hidden md:table-cell">B/T</th>
                      <th className="px-4 py-2 hidden lg:table-cell">Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => (
                      <tr
                        key={player.playerId}
                        className="transition-colors hover:bg-[var(--sm-card-hover)]"
                        style={{ borderBottom: '1px solid var(--sm-border)' }}
                      >
                        <td className="px-4 py-3">
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              backgroundColor: TEAM_COLOR,
                              color: '#fff',
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {player.jerseyNumber ?? '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/chicago-white-sox/players/${player.slug}`}
                            className="flex items-center gap-3 group"
                          >
                            {player.headshotUrl ? (
                              <div
                                className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                                style={{ border: '2px solid var(--sm-border)' }}
                              >
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
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: 'var(--sm-surface)' }}
                              >
                                <svg className="w-5 h-5" style={{ color: 'var(--sm-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <span className="font-medium transition-colors" style={{ color: 'var(--sm-text)' }}>
                                {player.fullName}
                              </span>
                              <div className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                                {player.position}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm hidden sm:table-cell" style={{ color: 'var(--sm-text-muted)' }}>
                          {player.height && player.weight
                            ? `${player.height} · ${player.weight} lbs`
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm hidden md:table-cell" style={{ color: 'var(--sm-text-muted)' }}>
                          {player.bats && player.throws
                            ? `${player.bats}/${player.throws}`
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm hidden lg:table-cell" style={{ color: 'var(--sm-text-muted)' }}>
                          {player.age || '-'}
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
