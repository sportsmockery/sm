import { Metadata } from 'next'
import Link from 'next/link'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'
import { getCubsRecentScores, getCubsSeparatedRecord } from '@/lib/cubsData'
import BoxScoreClient from './BoxScoreClient'

export const metadata: Metadata = {
  title: 'Chicago Cubs Scores 2025 | Box Scores & Results | SportsMockery',
  description: 'Chicago Cubs box scores with detailed player stats. View batting, pitching, and more for every game.',
}

export const revalidate = 1800

export default async function CubsScoresPage() {
  const team = CHICAGO_TEAMS.cubs

  const [scores, separatedRecord, nextGame] = await Promise.all([
    getCubsRecentScores(10),
    getCubsSeparatedRecord(),
    fetchNextGame('cubs'),
  ])

  const record = {
    wins: separatedRecord.regularSeason.wins,
    losses: separatedRecord.regularSeason.losses,
    postseason: (separatedRecord.postseason.wins > 0 || separatedRecord.postseason.losses > 0)
      ? separatedRecord.postseason : undefined,
    divisionRank: separatedRecord.divisionRank || undefined,
  }

  const latestGame = scores[0]
  const initialGameId = latestGame?.gameId || null

  const games = scores.map(game => ({
    gameId: game.gameId,
    date: game.date,
    opponent: game.opponent,
    opponentFullName: game.opponentFullName,
    opponentLogo: game.opponentLogo,
    teamScore: game.cubsScore,
    oppScore: game.oppScore,
    result: game.result,
    homeAway: game.homeAway,
  }))

  return (
    <TeamHubLayout team={team} record={record} nextGame={nextGame} activeTab="scores">
      <div className="pb-12">
        <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
          <div className="flex flex-wrap gap-6 justify-center text-center">
            <div>
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--sm-text-muted)' }}>Regular Season</div>
              <div className="text-xl font-bold" style={{ color: 'var(--sm-text)' }}>
                {separatedRecord.regularSeason.wins}-{separatedRecord.regularSeason.losses}
              </div>
            </div>
            {record.postseason && (
              <div>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--sm-text-muted)' }}>Postseason</div>
                <div className="text-xl font-bold" style={{ color: '#0E3386' }}>
                  {separatedRecord.postseason.wins}-{separatedRecord.postseason.losses}
                </div>
              </div>
            )}
          </div>
        </div>

        {games.length > 0 ? (
          <BoxScoreClient games={games} initialGameId={initialGameId} />
        ) : (
          <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
            <p style={{ color: 'var(--sm-text-muted)' }}>No completed games yet</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/chicago-cubs/schedule"
            className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-colors"
            style={{ backgroundColor: '#0E3386', color: '#ffffff' }}>
            View Full Schedule
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </TeamHubLayout>
  )
}
