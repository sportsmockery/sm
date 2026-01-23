import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getWhiteSoxPlayers, getWhiteSoxRecord, type WhiteSoxPlayer } from '@/lib/whitesoxData'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'

export const metadata: Metadata = {
  title: 'Chicago White Sox Players | Roster & Stats | SportsMockery',
  description: 'View all Chicago White Sox players, stats, and profiles. Select any player to see their full statistics and game log.',
}

export const revalidate = 3600

export default async function PlayersIndexPage() {
  const team = CHICAGO_TEAMS.whitesox

  const [players, soxRecord, nextGame] = await Promise.all([
    getWhiteSoxPlayers(),
    getWhiteSoxRecord(),
    fetchNextGame('whitesox'),
  ])

  const record = {
    wins: soxRecord.wins,
    losses: soxRecord.losses,
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

  // Group by position
  const pitchers = sortedPlayers.filter(p => p.positionGroup === 'pitchers')
  const catchers = sortedPlayers.filter(p => p.positionGroup === 'catchers')
  const infielders = sortedPlayers.filter(p => p.positionGroup === 'infielders')
  const outfielders = sortedPlayers.filter(p => p.positionGroup === 'outfielders')

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
              <span className="text-[var(--text-muted)]">Pitchers: </span>
              <span className="font-semibold text-[var(--text-primary)]">{pitchers.length}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Catchers: </span>
              <span className="font-semibold text-[var(--text-primary)]">{catchers.length}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Infielders: </span>
              <span className="font-semibold text-[var(--text-primary)]">{infielders.length}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Outfielders: </span>
              <span className="font-semibold text-[var(--text-primary)]">{outfielders.length}</span>
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

function PlayerCard({ player }: { player: WhiteSoxPlayer }) {
  return (
    <Link
      href={`/chicago-white-sox/players/${player.slug}`}
      className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4 hover:border-[#27251F] dark:hover:border-[#C4CED4] transition-colors group"
    >
      <div className="flex flex-col items-center text-center">
        {player.headshotUrl ? (
          <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-[var(--border-subtle)] group-hover:border-[#27251F] dark:group-hover:border-[#C4CED4] transition-colors">
            <Image
              src={player.headshotUrl}
              alt={player.fullName}
              width={80}
              height={80}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-3 border-2 border-[var(--border-subtle)]">
            <span className="text-2xl font-bold text-[var(--text-muted)]">
              {player.jerseyNumber ?? '?'}
            </span>
          </div>
        )}

        <div className="font-semibold text-[var(--text-primary)] group-hover:text-[#27251F] dark:group-hover:text-[#C4CED4] transition-colors truncate w-full">
          {player.fullName}
        </div>

        <div className="text-sm text-[var(--text-muted)]">
          #{player.jerseyNumber} • {player.position}
        </div>
      </div>
    </Link>
  )
}
