import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBearsRecentScores, getPlayoffRoundName, type BearsGame } from '@/lib/bearsData'
import BoxScoreClient from './BoxScoreClient'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'

// Bears logo URL
const BEARS_LOGO = 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png'

export const metadata: Metadata = {
  title: 'Chicago Bears Scores 2025 | Box Scores & Results | SportsMockery',
  description: 'Full Chicago Bears box scores with detailed player stats. View passing, rushing, receiving, and defensive stats for every game.',
}

export const revalidate = 1800

export default async function BearsScoresPage() {
  const team = CHICAGO_TEAMS.bears

  // Fetch all data in parallel
  const [recentScores, record, nextGame] = await Promise.all([
    getBearsRecentScores(20),
    fetchTeamRecord('bears'),
    fetchNextGame('bears'),
  ])

  // Calculate record
  const wins = recentScores.filter(g => g.result === 'W').length
  const losses = recentScores.filter(g => g.result === 'L').length

  // Get latest game ID for initial box score
  const latestGame = recentScores[0]
  const initialGameId = latestGame?.gameId || null

  // Transform games for client component - most recent first
  const games = recentScores
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(game => ({
      gameId: game.gameId,
      week: game.week,
      date: game.date,
      opponent: game.opponent,
      opponentFullName: game.opponentFullName,
      opponentLogo: game.opponentLogo,
      bearsScore: game.bearsScore,
      oppScore: game.oppScore,
      result: game.result,
      isPlayoff: game.isPlayoff,
      playoffRound: game.isPlayoff ? getPlayoffRoundName(game.week) : null,
      homeAway: game.homeAway,
    }))

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="scores"
    >
      {/* Box Score Client Component */}
      <BoxScoreClient games={games} initialGameId={initialGameId} />

      {/* Footer Link */}
      <div className="mt-8 text-center">
        <Link
          href="/chicago-bears/schedule"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#C83200] hover:bg-[#a82900] text-white font-semibold rounded-xl transition-colors"
        >
          View Full Schedule
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </TeamHubLayout>
  )
}
