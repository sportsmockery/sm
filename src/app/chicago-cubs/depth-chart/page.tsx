import { Metadata } from 'next'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getCubsRosterGrouped, type CubsPlayer, type PositionGroup, POSITION_GROUP_NAMES } from '@/lib/cubsData'
import DepthChartClient from './DepthChartClient'
import { HubUpdatesFeed } from '@/components/hub'

export const metadata: Metadata = {
  title: 'Chicago Cubs Depth Chart 2025 | Sports Mockery',
  description:
    'Interactive Cubs roster depth chart, starters and backups by position.',
  openGraph: {
    title: 'Chicago Cubs Depth Chart 2025',
    description: 'Interactive Cubs roster depth chart, starters and backups by position.',
    type: 'website',
  },
  twitter: {
    title: 'Chicago Cubs Depth Chart 2025',
    description: 'Interactive Cubs roster depth chart, starters and backups by position.',
  },
}

export const revalidate = 3600

const POSITION_ORDER: PositionGroup[] = ['pitchers', 'catchers', 'infielders', 'outfielders']

export default async function CubsDepthChartPage() {
  const team = CHICAGO_TEAMS.cubs

  const [record, nextGame, roster] = await Promise.all([
    fetchTeamRecord('cubs'),
    fetchNextGame('cubs'),
    getCubsRosterGrouped(),
  ])

  // Build serializable data for client component
  const positionGroups = POSITION_ORDER.map((group) => ({
    key: group,
    name: POSITION_GROUP_NAMES[group],
    players: (roster[group] || []).map((p) => ({
      playerId: p.playerId,
      slug: p.slug,
      fullName: p.fullName,
      position: p.position,
      jerseyNumber: p.jerseyNumber,
      headshotUrl: p.headshotUrl,
      height: p.height,
      weight: p.weight,
      age: p.age,
      experience: p.experience,
      college: p.college,
      bats: p.bats,
      throws: p.throws,
    })),
  })).filter((g) => g.players.length > 0)

  const allPlayers = positionGroups.reduce((acc, g) => acc + g.players.length, 0)
  const pitcherCount = positionGroups
    .filter((g) => g.key === 'pitchers')
    .reduce((acc, g) => acc + g.players.length, 0)
  const positionPlayerCount = positionGroups
    .filter((g) => ['catchers', 'infielders', 'outfielders'].includes(g.key))
    .reduce((acc, g) => acc + g.players.length, 0)

  return (
    <TeamHubLayout team={team} record={record} nextGame={nextGame} activeTab="depth-chart">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <HubUpdatesFeed teamSlug="chicago-cubs" hubSlug="depth-chart" title="Depth Chart Updates" emptyState="No roster updates yet." />
      </div>
      <DepthChartClient
        positionGroups={positionGroups}
        totalPlayers={allPlayers}
        pitcherCount={pitcherCount}
        positionPlayerCount={positionPlayerCount}
      />
    </TeamHubLayout>
  )
}
