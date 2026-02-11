import { Metadata } from 'next'
import TeamHubLayout from '@/components/team/TeamHubLayout'
import TeamLivePage from '@/components/live/TeamLivePage'
import {
  CHICAGO_TEAMS,
  fetchTeamRecord,
  fetchNextGame,
  fetchLastGame,
  fetchLastGameWithId,
} from '@/lib/team-config'

export const metadata: Metadata = {
  title: 'Chicago White Sox Live Game | SportsMockery',
  description: 'Watch live Chicago White Sox game scores, stats, and play-by-play updates in real-time.',
  openGraph: {
    title: 'Chicago White Sox Live Game | Sports Mockery',
    description: 'Live White Sox game scores, stats, and play-by-play updates',
    type: 'website',
  },
}

// Don't cache - need fresh data for live games
export const dynamic = 'force-dynamic'

export default async function WhiteSoxLivePage() {
  const team = CHICAGO_TEAMS.whitesox

  // Fetch team data in parallel
  const [record, nextGame, lastGame, lastGameWithId] = await Promise.all([
    fetchTeamRecord('whitesox'),
    fetchNextGame('whitesox'),
    fetchLastGame('whitesox'),
    fetchLastGameWithId('whitesox'),
  ])

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      lastGame={lastGame}
      activeTab="live"
    >
      <TeamLivePage team={team} teamKey="whitesox" lastGame={lastGameWithId} />
    </TeamHubLayout>
  )
}
