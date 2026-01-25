import { Metadata } from 'next'
import { getBearsPlayers, getBearsSeparatedRecord, getPlayerProfile, type BearsPlayer } from '@/lib/bearsData'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'
import PlayerProfileClient from './PlayerProfileClient'

export const metadata: Metadata = {
  title: 'Chicago Bears Players 2025 | Full Roster | SportsMockery',
  description: 'Complete list of Chicago Bears players with photos, positions, stats, and player profiles.',
}

export const revalidate = 3600

export default async function BearsPlayersPage() {
  const team = CHICAGO_TEAMS.bears

  const [players, separatedRecord, nextGame] = await Promise.all([
    getBearsPlayers(),
    getBearsSeparatedRecord(),
    fetchNextGame('bears'),
  ])

  // Build record object
  const record = {
    wins: separatedRecord.regularSeason.wins,
    losses: separatedRecord.regularSeason.losses,
    ties: separatedRecord.regularSeason.ties > 0 ? separatedRecord.regularSeason.ties : undefined,
    postseason: (separatedRecord.postseason.wins > 0 || separatedRecord.postseason.losses > 0)
      ? separatedRecord.postseason
      : undefined,
    divisionRank: separatedRecord.divisionRank || undefined,
  }

  // Sort players by jersey number
  const sortedPlayers = [...players].sort((a, b) => (a.jerseyNumber || 99) - (b.jerseyNumber || 99))

  // Get the first player by jersey number
  const firstPlayer = sortedPlayers[0]

  if (!firstPlayer) {
    return (
      <TeamHubLayout
        team={team}
        record={record}
        nextGame={nextGame}
        activeTab="roster"
      >
        <div className="pb-12 text-center">
          <p className="text-[var(--text-muted)]">No players found</p>
        </div>
      </TeamHubLayout>
    )
  }

  // Get full profile for the first player
  const initialProfile = await getPlayerProfile(firstPlayer.slug)

  // Transform players list for the client component
  const playersList = sortedPlayers.map(p => ({
    playerId: p.playerId,
    slug: p.slug,
    fullName: p.fullName,
    jerseyNumber: p.jerseyNumber,
    position: p.position,
    headshotUrl: p.headshotUrl,
  }))

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="roster"
    >
      <PlayerProfileClient
        players={playersList}
        initialPlayerSlug={firstPlayer.slug}
        initialProfile={initialProfile}
      />
    </TeamHubLayout>
  )
}
