import { Metadata } from 'next'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getDepthChart } from '@/lib/depthChartData'
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

export default async function CubsDepthChartPage() {
  const team = CHICAGO_TEAMS.cubs

  const [record, nextGame, depthChart] = await Promise.all([
    fetchTeamRecord('cubs'),
    fetchNextGame('cubs'),
    getDepthChart('cubs'),
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
        bats: p.bats ?? null,
        throws: p.throws ?? null,
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
        <HubUpdatesFeed teamSlug="chicago-cubs" hubSlug="depth-chart" title="Depth Chart Updates" emptyState="No roster updates yet." />
      </div>
      <DepthChartClient
        positionGroups={positionGroups}
        totalPlayers={allPlayers}
        starterCount={starterCount}
        injuredCount={injuredCount}
        teamSlug="chicago-cubs"
        teamColor="#0E3386"
        starterBgAlpha="rgba(14,51,134,0.03)"
      />
    </TeamHubLayout>
  )
}
