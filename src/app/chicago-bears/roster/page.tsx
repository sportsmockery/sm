import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBearsRosterGrouped, getBearsSeparatedRecord, type BearsPlayer, type PositionGroup } from '@/lib/bearsData'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'

export const metadata: Metadata = {
  title: 'Chicago Bears Roster 2026 | SportsMockery',
  description: 'Complete 2026 Chicago Bears roster with player profiles, positions, measurements, and stats. View all players by position group.',
}

// Revalidate every hour
export const revalidate = 3600

const TEAM_COLOR = '#C83803'

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
  const team = CHICAGO_TEAMS.bears

  // Fetch all data in parallel
  const [roster, separatedRecord, nextGame] = await Promise.all([
    getBearsRosterGrouped(),
    getBearsSeparatedRecord(2025), // 2025 season record for reference
    fetchNextGame('bears'),
  ])

  // Build record object for TeamHubLayout
  const record = {
    wins: separatedRecord.regularSeason.wins,
    losses: separatedRecord.regularSeason.losses,
    ties: separatedRecord.regularSeason.ties > 0 ? separatedRecord.regularSeason.ties : undefined,
    postseason: (separatedRecord.postseason.wins > 0 || separatedRecord.postseason.losses > 0)
      ? separatedRecord.postseason
      : undefined,
    divisionRank: separatedRecord.divisionRank || undefined,
  }

  // Count by side
  const allPlayers = Object.values(roster).flat()
  const offenseCount = allPlayers.filter(p => ['QB', 'RB', 'WR', 'TE', 'OL'].includes(p.positionGroup || '')).length
  const defenseCount = allPlayers.filter(p => ['DL', 'LB', 'CB', 'S'].includes(p.positionGroup || '')).length
  const stCount = allPlayers.filter(p => p.positionGroup === 'ST').length

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="roster"
    >
      {/* Summary Bar */}
      <div
        className="p-4 mb-6"
        style={{
          backgroundColor: 'var(--sm-card)',
          border: '1px solid var(--sm-border)',
          borderRadius: 'var(--sm-radius-lg)',
        }}
      >
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span style={{ color: 'var(--sm-text-muted)' }}>Total: </span>
            <span className="font-semibold" style={{ color: 'var(--sm-text)' }}>{allPlayers.length} players</span>
          </div>
          <div>
            <span style={{ color: 'var(--sm-text-muted)' }}>Offense: </span>
            <span className="font-semibold" style={{ color: 'var(--sm-text)' }}>{offenseCount}</span>
          </div>
          <div>
            <span style={{ color: 'var(--sm-text-muted)' }}>Defense: </span>
            <span className="font-semibold" style={{ color: 'var(--sm-text)' }}>{defenseCount}</span>
          </div>
          <div>
            <span style={{ color: 'var(--sm-text-muted)' }}>Special Teams: </span>
            <span className="font-semibold" style={{ color: 'var(--sm-text)' }}>{stCount}</span>
          </div>
        </div>

        {/* Position Count Chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {POSITION_ORDER.map(group => {
            const count = roster[group]?.length || 0
            if (count === 0) return null
            return (
              <span
                key={group}
                style={{
                  padding: '4px 12px',
                  borderRadius: '100px',
                  backgroundColor: 'var(--sm-surface)',
                  color: 'var(--sm-text-muted)',
                  fontSize: 13,
                }}
              >
                {count} {group}
                {count !== 1 && group !== 'OL' && group !== 'DL' && group !== 'ST' ? 's' : ''}
              </span>
            )
          })}
        </div>
      </div>

      {/* Roster Grid */}
      <div className="pb-12">
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
    </TeamHubLayout>
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
    <div
      className="overflow-hidden"
      style={{
        backgroundColor: 'var(--sm-card)',
        border: '1px solid var(--sm-border)',
        borderRadius: 'var(--sm-radius-xl)',
      }}
    >
      {/* Header */}
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
          {groupName}
        </h2>
        <span className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
          {players.length} player{players.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Player Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)', borderBottom: '1px solid var(--sm-border)' }}>
              <th className="px-4 py-2 w-12">#</th>
              <th className="px-4 py-2">Player</th>
              <th className="px-4 py-2 hidden sm:table-cell">Size</th>
              <th className="px-4 py-2 hidden md:table-cell">College</th>
              <th className="px-4 py-2 hidden lg:table-cell">Exp</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const isStarter = player.primaryRole?.toLowerCase().includes('starter')

              return (
                <tr
                  key={player.playerId}
                  className="transition-colors hover:bg-[var(--sm-card-hover)]"
                  style={{
                    borderBottom: '1px solid var(--sm-border)',
                    backgroundColor: isStarter ? `${TEAM_COLOR}08` : undefined,
                  }}
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
                      {player.jerseyNumber ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/chicago-bears/players/${player.slug}`}
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
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm hidden md:table-cell" style={{ color: 'var(--sm-text-muted)' }}>
                    {player.college || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm hidden lg:table-cell" style={{ color: 'var(--sm-text-muted)' }}>
                    {player.experience || 'R'}
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
