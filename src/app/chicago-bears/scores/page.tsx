import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBearsSchedule, getPlayoffRoundName, getBearsSeparatedRecord, type BearsGame } from '@/lib/bearsData'
import BoxScoreClient from './BoxScoreClient'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'

// Bears logo URL
const BEARS_LOGO = 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png'

export const metadata: Metadata = {
  title: 'Chicago Bears Scores 2025 | Box Scores & Results | SportsMockery',
  description: 'Full Chicago Bears box scores with detailed player stats. View passing, rushing, receiving, and defensive stats for every game.',
}

export const revalidate = 1800

export default async function BearsScoresPage() {
  const team = CHICAGO_TEAMS.bears
  const currentSeason = 2025

  // Fetch all data in parallel
  const [schedule, separatedRecord, nextGame] = await Promise.all([
    getBearsSchedule(currentSeason),
    getBearsSeparatedRecord(currentSeason),
    fetchNextGame('bears'),
  ])

  // Get completed games only (final status), separate by type
  const completedGames = schedule.filter(g => g.status === 'final')
  const regularGames = completedGames.filter(g => g.gameType === 'regular')
  const postseasonGames = completedGames.filter(g => g.gameType === 'postseason')

  // Build record object for TeamHubLayout
  const record = {
    wins: separatedRecord.regularSeason.wins,
    losses: separatedRecord.regularSeason.losses,
    ties: separatedRecord.regularSeason.ties > 0 ? separatedRecord.regularSeason.ties : undefined,
    postseason: (separatedRecord.postseason.wins > 0 || separatedRecord.postseason.losses > 0)
      ? separatedRecord.postseason
      : undefined,
    divisionRank: separatedRecord.divisionRank || undefined,
  }

  // Get latest game ID for initial box score (most recent first)
  const allGamesSorted = completedGames
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const latestGame = allGamesSorted[0]
  const initialGameId = latestGame?.gameId || null

  // Transform games for client component - most recent first
  const games = allGamesSorted.map(game => ({
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
    isPreseason: game.isPreseason,
    gameType: game.gameType,
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
      <div className="pb-12">
        {/* Record Summary */}
        <div className="mb-6 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <div className="flex flex-wrap gap-6 justify-center text-center">
            <div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Regular Season</div>
              <div className="text-xl font-bold text-[var(--text-primary)]">
                {separatedRecord.regularSeason.wins}-{separatedRecord.regularSeason.losses}
                {separatedRecord.regularSeason.ties > 0 && `-${separatedRecord.regularSeason.ties}`}
              </div>
              <div className="text-xs text-[var(--text-muted)]">{regularGames.length} games</div>
            </div>
            {postseasonGames.length > 0 && (
              <div>
                <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Postseason</div>
                <div className="text-xl font-bold text-[#C83200]">
                  {separatedRecord.postseason.wins}-{separatedRecord.postseason.losses}
                </div>
                <div className="text-xs text-[var(--text-muted)]">{postseasonGames.length} games</div>
              </div>
            )}
          </div>
        </div>

        {/* Box Score Client Component */}
        {games.length > 0 ? (
          <BoxScoreClient games={games} initialGameId={initialGameId} />
        ) : (
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center">
            <p className="text-[var(--text-muted)]">No completed games yet</p>
          </div>
        )}

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
      </div>
    </TeamHubLayout>
  )
}
