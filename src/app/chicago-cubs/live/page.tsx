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
  title: 'Chicago Cubs Live Game | SportsMockery',
  description: 'Watch live Chicago Cubs game scores, stats, and play-by-play updates in real-time.',
  openGraph: {
    title: 'Chicago Cubs Live Game | Sports Mockery',
    description: 'Live Cubs game scores, stats, and play-by-play updates',
    type: 'website',
  },
}

// Don't cache - need fresh data for live games
export const dynamic = 'force-dynamic'

export default async function CubsLivePage() {
  const team = CHICAGO_TEAMS.cubs

  // Fetch team data in parallel
  const [record, nextGame, lastGame, lastGameWithId] = await Promise.all([
    fetchTeamRecord('cubs'),
    fetchNextGame('cubs'),
    fetchLastGame('cubs'),
    fetchLastGameWithId('cubs'),
  ])

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      lastGame={lastGame}
      activeTab="live"
    >
      <TeamLivePage team={team} teamKey="cubs" lastGame={lastGameWithId} />
    </TeamHubLayout>
  )
}
