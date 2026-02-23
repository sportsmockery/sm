import { Metadata } from 'next'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getDepthChart } from '@/lib/depthChartData'
import DepthChartClient from './DepthChartClient'
import { HubUpdatesFeed } from '@/components/hub'

export const metadata: Metadata = {
  title: 'Chicago Bulls Depth Chart 2026 | Sports Mockery',
  description:
    'Interactive Bulls roster depth chart with starters and backups.',
  openGraph: {
    title: 'Chicago Bulls Depth Chart 2026',
    description: 'Interactive Bulls roster depth chart with starters and backups.',
    type: 'website',
  },
  twitter: {
    title: 'Chicago Bulls Depth Chart 2026',
    description: 'Interactive Bulls roster depth chart with starters and backups.',
  },
}

export const revalidate = 3600

export default async function BullsDepthChartPage() {
  const team = CHICAGO_TEAMS.bulls

  const [record, nextGame, depthChart] = await Promise.all([
    fetchTeamRecord('bulls'),
    fetchNextGame('bulls'),
    getDepthChart('bulls'),
  ])

  const positionGroups = depthChart.map((group) => ({
    key: group.key,
    name: group.name,
    positions: group.positions.map((pos) => ({
      position: pos.position,
      players: pos.players.map((p) => ({
        playerId: p.espnId || String(p.id),
        slug: p.slug,
        fullName: p.playerName,
        position: p.position,
        jerseyNumber: p.jerseyNumber,
        headshotUrl: p.headshotUrl,
        height: p.height,
        weight: p.weight,
        age: p.age,
        experience: p.experience,
        college: p.college,
        depthOrder: p.depthOrder,
        isStarter: p.isStarter,
        injuryStatus: p.injuryStatus,
        injuryDetail: p.injuryDetail,
      })),
    })),
  }))

  const allPlayers = positionGroups.reduce((acc, g) => acc + g.positions.reduce((a, p) => a + p.players.length, 0), 0)
  const starterCount = positionGroups.reduce((acc, g) => acc + g.positions.reduce((a, p) => a + p.players.filter((pl) => pl.isStarter).length, 0), 0)
  const injuredCount = positionGroups.reduce((acc, g) => acc + g.positions.reduce((a, p) => a + p.players.filter((pl) => pl.injuryStatus).length, 0), 0)

  return (
    <TeamHubLayout team={team} record={record} nextGame={nextGame} activeTab="depth-chart">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <HubUpdatesFeed hubSlug="depth-chart" title="Depth Chart Updates" emptyState="No roster updates yet." />
      </div>
      <DepthChartClient
        positionGroups={positionGroups}
        totalPlayers={allPlayers}
        starterCount={starterCount}
        injuredCount={injuredCount}
        teamSlug="chicago-bulls"
        teamColor="#CE1141"
        starterBgAlpha="rgba(206,17,65,0.03)"
      />
    </TeamHubLayout>
  )
}
