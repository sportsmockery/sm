import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getWhiteSoxPlayers, getWhiteSoxRecord, type WhiteSoxPlayer } from '@/lib/whitesoxData'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'

export const metadata: Metadata = {
  title: 'Chicago White Sox Players 2025 | Full Roster | SportsMockery',
  description: 'Complete list of Chicago White Sox players with photos, positions, stats, and player profiles.',
}

export const revalidate = 3600

type PositionGroup = 'pitchers' | 'catchers' | 'infielders' | 'outfielders'

const POSITION_GROUP_ORDER: PositionGroup[] = ['pitchers', 'catchers', 'infielders', 'outfielders']

const POSITION_GROUP_LABELS: Record<PositionGroup, string> = {
  pitchers: 'Pitchers',
  catchers: 'Catchers',
  infielders: 'Infielders',
  outfielders: 'Outfielders',
}

function getPositionGroup(position: string): PositionGroup {
  const pos = position.toUpperCase()
  if (pos === 'P' || pos === 'SP' || pos === 'RP' || pos === 'CL') return 'pitchers'
  if (pos === 'C') return 'catchers'
  if (['1B', '2B', '3B', 'SS', 'IF'].includes(pos)) return 'infielders'
  return 'outfielders'
}

export default async function WhiteSoxPlayersPage() {
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

  // Group players by position group
  const grouped: Record<PositionGroup, WhiteSoxPlayer[]> = {
    pitchers: [],
    catchers: [],
    infielders: [],
    outfielders: [],
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
            <h1 className="text-2xl font-bold text-[var(--sm-text)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Players
            </h1>
            <p className="text-sm text-[var(--sm-text-muted)]">{players.length} players on roster</p>
          </div>
          <Link
            href="/chicago-white-sox/roster"
            className="text-sm text-[#27251F] hover:underline"
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
              <h2 className="text-lg font-bold text-[var(--sm-text)] mb-4 border-b border-[var(--sm-border)] pb-2">
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

function PlayerCard({ player }: { player: WhiteSoxPlayer }) {
  return (
    <Link
      href={`/chicago-white-sox/players/${player.slug}`}
      className="group overflow-hidden hover:border-[#27251F]/50 transition-colors"
      style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)', borderRadius: 'var(--sm-radius-lg)' }}
    >
      {/* Player Photo */}
      <div className="aspect-[4/5] bg-[var(--sm-surface)] relative overflow-hidden">
        {player.headshotUrl ? (
          <Image
            src={player.headshotUrl}
            alt={player.fullName}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--sm-text-muted)]">
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
        <h3 className="font-semibold text-[var(--sm-text)] text-sm truncate group-hover:text-[#27251F] transition-colors">
          {player.fullName}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-[var(--sm-text-muted)]">{player.position}</span>
          {player.height && player.weight && (
            <span className="text-xs text-[var(--sm-text-muted)]">
              {player.height}, {player.weight} lbs
            </span>
          )}
        </div>
        {player.bats && player.throws && (
          <div className="text-xs text-[var(--sm-text-muted)] mt-1">
            B/T: {player.bats}/{player.throws}
          </div>
        )}
      </div>
    </Link>
  )
}
