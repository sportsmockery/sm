import { Metadata } from 'next'
import Link from 'next/link'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'
import { getBlackhawksRecentScores, getBlackhawksRecord } from '@/lib/blackhawksData'
import BoxScoreClient from './BoxScoreClient'

export const metadata: Metadata = {
  title: 'Chicago Blackhawks Scores 2025-26 | Box Scores & Results | SportsMockery',
  description: 'Chicago Blackhawks box scores with detailed player stats. View goals, assists, saves, and more for every game.',
}

export const revalidate = 1800

export default async function BlackhawksScoresPage() {
  const team = CHICAGO_TEAMS.blackhawks

  const [scores, hawksRecord, nextGame] = await Promise.all([
    getBlackhawksRecentScores(10),
    getBlackhawksRecord(),
    fetchNextGame('blackhawks'),
  ])

  const record = {
    wins: hawksRecord.wins,
    losses: hawksRecord.losses,
    otl: hawksRecord.otLosses,
  }

  const latestGame = scores[0]
  const initialGameId = latestGame?.gameId || null

  const games = scores.map(game => ({
    gameId: game.gameId,
    date: game.date,
    opponent: game.opponent,
    opponentFullName: game.opponentFullName,
    opponentLogo: game.opponentLogo,
    hawksScore: game.blackhawksScore,
    oppScore: game.oppScore,
    result: game.result,
    homeAway: game.homeAway,
    isOT: game.overtime || game.shootout,
  }))

  return (
    <TeamHubLayout team={team} record={record} nextGame={nextGame} activeTab="scores">
      <div className="pb-12">
        <div className="glass-card glass-card-sm glass-card-static"  >
          <div className="flex flex-wrap gap-6 justify-center text-center">
            <div>
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--sm-text-muted)' }}>2025-26 Season</div>
              <div className="text-xl font-bold" style={{ color: 'var(--sm-text)' }}>
                {hawksRecord.wins}-{hawksRecord.losses}-{hawksRecord.otLosses}
              </div>
            </div>
          </div>
        </div>

        {games.length > 0 ? (
          <BoxScoreClient games={games} initialGameId={initialGameId} />
        ) : (
          <div className="glass-card glass-card-static" >
            <p style={{ color: 'var(--sm-text-muted)' }}>No completed games yet</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/chicago-blackhawks/schedule"
            className="btn btn-md btn-primary"
            style={{ display: 'inline-flex', textDecoration: 'none' }}>
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
