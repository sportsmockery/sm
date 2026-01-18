import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBearsRecentScores, getPlayoffRoundName, type BearsGame } from '@/lib/bearsData'
import BoxScoreClient from './BoxScoreClient'

// Bears logo URL
const BEARS_LOGO = 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png'

export const metadata: Metadata = {
  title: 'Chicago Bears Scores 2025 | Box Scores & Results | SportsMockery',
  description: 'Full Chicago Bears box scores with detailed player stats. View passing, rushing, receiving, and defensive stats for every game.',
}

export const revalidate = 1800

export default async function BearsScoresPage() {
  const recentScores = await getBearsRecentScores(20)

  // Calculate record
  const wins = recentScores.filter(g => g.result === 'W').length
  const losses = recentScores.filter(g => g.result === 'L').length

  // Get latest game ID for initial box score
  const latestGame = recentScores[0]
  const initialGameId = latestGame?.gameId || null

  // Transform games for client component
  const games = recentScores.map(game => ({
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
    <main className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B162A] to-[#0B162A]/90 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/chicago-bears" className="hover:text-white">Chicago Bears</Link>
            <span>/</span>
            <span className="text-white">Scores</span>
          </nav>
          <div className="flex items-center gap-4">
            <Image
              src={BEARS_LOGO}
              alt="Chicago Bears"
              width={64}
              height={64}
              className="w-16 h-16"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Box Scores
              </h1>
              <p className="text-white/70 mt-1">
                2025 Season • {wins}-{losses} Record
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Box Score Client Component */}
      <BoxScoreClient games={games} initialGameId={initialGameId} />

      {/* Footer Link */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="text-center">
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
    </main>
  )
}
