import { Metadata } from 'next'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'
import { getBearsSeparatedRecord, getBearsRosterGrouped, type BearsPlayer, type PositionGroup } from '@/lib/bearsData'
import DepthChartClient from './DepthChartClient'

export const metadata: Metadata = {
  title: 'Chicago Bears Depth Chart & Roster 2026 | Sports Mockery',
  description:
    'Interactive Chicago Bears depth chart: 53-man roster, starter/backup hierarchy, position groups, and player profiles. Updated for 2026.',
  openGraph: {
    title: 'Chicago Bears Depth Chart & Roster 2026',
    description: 'Interactive Bears depth chart with starter/backup hierarchy and player profiles.',
    type: 'website',
  },
  twitter: {
    title: 'Chicago Bears Depth Chart 2026',
    description: 'Interactive 53-man roster with starters, backups, and position breakdowns.',
  },
}

export const revalidate = 3600

const POSITION_ORDER: PositionGroup[] = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'ST']

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

export default async function BearsDepthChartPage() {
  const team = CHICAGO_TEAMS.bears

  const [separatedRecord, nextGame, roster] = await Promise.all([
    getBearsSeparatedRecord(2025),
    fetchNextGame('bears'),
    getBearsRosterGrouped(),
  ])

  const record = {
    wins: separatedRecord.regularSeason.wins,
    losses: separatedRecord.regularSeason.losses,
    ties: separatedRecord.regularSeason.ties > 0 ? separatedRecord.regularSeason.ties : undefined,
    postseason:
      separatedRecord.postseason.wins > 0 || separatedRecord.postseason.losses > 0
        ? separatedRecord.postseason
        : undefined,
    divisionRank: separatedRecord.divisionRank || undefined,
  }

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
      primaryRole: p.primaryRole,
    })),
  })).filter((g) => g.players.length > 0)

  const allPlayers = positionGroups.reduce((acc, g) => acc + g.players.length, 0)
  const offenseCount = positionGroups
    .filter((g) => ['QB', 'RB', 'WR', 'TE', 'OL'].includes(g.key))
    .reduce((acc, g) => acc + g.players.length, 0)
  const defenseCount = positionGroups
    .filter((g) => ['DL', 'LB', 'CB', 'S'].includes(g.key))
    .reduce((acc, g) => acc + g.players.length, 0)

  return (
    <TeamHubLayout team={team} record={record} nextGame={nextGame} activeTab="depth-chart">
      <DepthChartClient
        positionGroups={positionGroups}
        totalPlayers={allPlayers}
        offenseCount={offenseCount}
        defenseCount={defenseCount}
      />
    </TeamHubLayout>
  )
}
