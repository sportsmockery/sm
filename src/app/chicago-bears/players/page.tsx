import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBearsPlayers, getBearsSeparatedRecord, type BearsPlayer } from '@/lib/bearsData'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'

export const metadata: Metadata = {
  title: 'Chicago Bears Players | Roster & Stats | SportsMockery',
  description: 'View all Chicago Bears players, stats, and profiles. Select any player to see their full statistics and game log.',
}

export const revalidate = 3600

export default async function PlayersIndexPage() {
  const team = CHICAGO_TEAMS.bears

  // Fetch all data in parallel
  const [players, separatedRecord, nextGame] = await Promise.all([
    getBearsPlayers(),
    getBearsSeparatedRecord(2025),
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

  if (!players || players.length === 0) {
    return (
      <TeamHubLayout
        team={team}
        record={record}
        nextGame={nextGame}
        activeTab="players"
      >
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">No Players Found</h1>
          <p className="text-[var(--text-muted)]">Unable to load roster data. Please try again later.</p>
        </div>
      </TeamHubLayout>
    )
  }

  // Sort players by jersey number
  const sortedPlayers = [...players].sort((a, b) => {
    const numA = typeof a.jerseyNumber === 'number' ? a.jerseyNumber : parseInt(String(a.jerseyNumber)) || 999
    const numB = typeof b.jerseyNumber === 'number' ? b.jerseyNumber : parseInt(String(b.jerseyNumber)) || 999
    return numA - numB
  })

  // Group by position side
  const offense = sortedPlayers.filter(p => p.side === 'OFF')
  const defense = sortedPlayers.filter(p => p.side === 'DEF')
  const specialTeams = sortedPlayers.filter(p => p.side === 'ST')

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="players"
    >
      <div className="pb-12">
        {/* Summary */}
        <div className="mb-6 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-[var(--text-muted)]">Total: </span>
              <span className="font-semibold text-[var(--text-primary)]">{players.length} players</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Offense: </span>
              <span className="font-semibold text-[var(--text-primary)]">{offense.length}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Defense: </span>
              <span className="font-semibold text-[var(--text-primary)]">{defense.length}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Special Teams: </span>
              <span className="font-semibold text-[var(--text-primary)]">{specialTeams.length}</span>
            </div>
          </div>
        </div>

        {/* Player Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedPlayers.map((player) => (
            <PlayerCard key={player.playerId} player={player} />
          ))}
        </div>
      </div>
    </TeamHubLayout>
  )
}

function PlayerCard({ player }: { player: BearsPlayer }) {
  return (
    <Link
      href={`/chicago-bears/players/${player.slug}`}
      className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4 hover:border-[#C83200] transition-colors group"
    >
      <div className="flex flex-col items-center text-center">
        {/* Photo */}
        {player.headshotUrl ? (
          <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-[var(--border-subtle)] group-hover:border-[#C83200] transition-colors">
            <Image
              src={player.headshotUrl}
              alt={player.fullName}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-3 border-2 border-[var(--border-subtle)]">
            <span className="text-2xl font-bold text-[var(--text-muted)]">
              {player.jerseyNumber ?? '?'}
            </span>
          </div>
        )}

        {/* Name */}
        <div className="font-semibold text-[var(--text-primary)] group-hover:text-[#C83200] transition-colors truncate w-full">
          {player.fullName}
        </div>

        {/* Position & Number */}
        <div className="text-sm text-[var(--text-muted)]">
          #{player.jerseyNumber} • {player.position}
        </div>
      </div>
    </Link>
  )
}
