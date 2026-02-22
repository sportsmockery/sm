import { Metadata } from 'next'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getBlackhawksRosterGrouped, POSITION_GROUP_NAMES, type PositionGroup } from '@/lib/blackhawksData'
import DepthChartClient from './DepthChartClient'
import { HubUpdatesFeed } from '@/components/hub'

export const metadata: Metadata = {
  title: 'Chicago Blackhawks Depth Chart 2026 | Sports Mockery',
  description:
    'Interactive roster depth chart with forwards, defensemen, goaltenders.',
  openGraph: {
    title: 'Chicago Blackhawks Depth Chart 2026',
    description: 'Interactive roster depth chart with forwards, defensemen, goaltenders.',
    type: 'website',
  },
  twitter: {
    title: 'Chicago Blackhawks Depth Chart 2026',
    description: 'Interactive roster depth chart with forwards, defensemen, goaltenders.',
  },
}

export const revalidate = 3600

const POSITION_ORDER: PositionGroup[] = ['forwards', 'defensemen', 'goalies']

export default async function BlackhawksDepthChartPage() {
  const team = CHICAGO_TEAMS.blackhawks

  const [record, nextGame, roster] = await Promise.all([
    fetchTeamRecord('blackhawks'),
    fetchNextGame('blackhawks'),
    getBlackhawksRosterGrouped(),
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
      birthCountry: p.birthCountry,
    })),
  })).filter((g) => g.players.length > 0)

  const allPlayers = positionGroups.reduce((acc, g) => acc + g.players.length, 0)
  const forwardsCount = positionGroups
    .filter((g) => g.key === 'forwards')
    .reduce((acc, g) => acc + g.players.length, 0)
  const defenseCount = positionGroups
    .filter((g) => g.key === 'defensemen')
    .reduce((acc, g) => acc + g.players.length, 0)
  const goalieCount = positionGroups
    .filter((g) => g.key === 'goalies')
    .reduce((acc, g) => acc + g.players.length, 0)

  return (
    <TeamHubLayout team={team} record={record} nextGame={nextGame} activeTab="depth-chart">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <HubUpdatesFeed hubSlug="depth-chart" teamSlug="chicago-blackhawks" title="Depth Chart Updates" emptyState="No roster updates yet." />
      </div>
      <DepthChartClient
        positionGroups={positionGroups}
        totalPlayers={allPlayers}
        forwardsCount={forwardsCount}
        defenseCount={defenseCount}
        goalieCount={goalieCount}
      />
    </TeamHubLayout>
  )
}
