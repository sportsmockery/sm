import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBullsPlayers, getBullsRecord, type BullsPlayer } from '@/lib/bullsData'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'

export const metadata: Metadata = {
  title: 'Chicago Bulls Players 2025 | Full Roster | SportsMockery',
  description: 'Complete list of Chicago Bulls players with photos, positions, stats, and player profiles.',
}

export const revalidate = 3600

type PositionGroup = 'guards' | 'forwards' | 'centers'

const POSITION_GROUP_ORDER: PositionGroup[] = ['guards', 'forwards', 'centers']

const POSITION_GROUP_LABELS: Record<PositionGroup, string> = {
  guards: 'Guards',
  forwards: 'Forwards',
  centers: 'Centers',
}

function getPositionGroup(position: string): PositionGroup {
  const pos = position.toUpperCase()
  if (pos.includes('G') || pos === 'PG' || pos === 'SG') return 'guards'
  if (pos.includes('F') || pos === 'SF' || pos === 'PF') return 'forwards'
  if (pos.includes('C')) return 'centers'
  return 'forwards'
}

export default async function BullsPlayersPage() {
  const team = CHICAGO_TEAMS.bulls

  const [players, bullsRecord, nextGame] = await Promise.all([
    getBullsPlayers(),
    getBullsRecord(),
    fetchNextGame('bulls'),
  ])

  const record = {
    wins: bullsRecord.wins,
    losses: bullsRecord.losses,
  }

  // Group players by position group
  const grouped: Record<PositionGroup, BullsPlayer[]> = {
    guards: [],
    forwards: [],
    centers: [],
  }

  players.forEach(player => {
    const group = getPositionGroup(player.position)
    grouped[group].push(player)
  })

  // Sort each group by jersey number
  Object.keys(grouped).forEach(key => {
    grouped[key as PositionGroup].sort((a, b) => (a.jerseyNumber || 99) - (b.jerseyNumber || 99))
  })

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="roster"
    >
      <div className="pb-12">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Players
            </h1>
            <p className="text-sm text-[var(--text-muted)]">{players.length} players on roster</p>
          </div>
          <Link
            href="/chicago-bulls/roster"
            className="text-sm text-[#CE1141] hover:underline"
          >
            View Full Roster →
          </Link>
        </div>

        {/* Players Grid by Position Group */}
        {POSITION_GROUP_ORDER.map(group => {
          const groupPlayers = grouped[group]
          if (groupPlayers.length === 0) return null

          return (
            <div key={group} className="mb-8">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 border-b border-[var(--border-subtle)] pb-2">
                {POSITION_GROUP_LABELS[group]} ({groupPlayers.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {groupPlayers.map(player => (
                  <PlayerCard key={player.playerId} player={player} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </TeamHubLayout>
  )
}

function PlayerCard({ player }: { player: BullsPlayer }) {
  return (
    <Link
      href={`/chicago-bulls/players/${player.slug}`}
      className="group bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl overflow-hidden hover:border-[#CE1141]/50 transition-colors"
    >
      {/* Player Photo */}
      <div className="aspect-[4/5] bg-[var(--bg-tertiary)] relative overflow-hidden">
        {player.headshotUrl ? (
          <Image
            src={player.headshotUrl}
            alt={player.fullName}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
            <svg className="w-16 h-16 opacity-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        )}
        {/* Jersey Number Badge */}
        {player.jerseyNumber && (
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
            #{player.jerseyNumber}
          </div>
        )}
      </div>

      {/* Player Info */}
      <div className="p-3">
        <h3 className="font-semibold text-[var(--text-primary)] text-sm truncate group-hover:text-[#CE1141] transition-colors">
          {player.fullName}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-[var(--text-muted)]">{player.position}</span>
          {player.height && player.weight && (
            <span className="text-xs text-[var(--text-muted)]">
              {player.height}, {player.weight} lbs
            </span>
          )}
        </div>
        {player.college && (
          <div className="text-xs text-[var(--text-muted)] mt-1 truncate">
            {player.college}
          </div>
        )}
      </div>
    </Link>
  )
}
