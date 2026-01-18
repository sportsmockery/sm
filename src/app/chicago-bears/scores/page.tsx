import { Metadata } from 'next'
import Link from 'next/link'
import { getBearsRecentScores, type BearsGame } from '@/lib/bearsData'

export const metadata: Metadata = {
  title: 'Chicago Bears Scores 2025 | Recent Game Results | SportsMockery',
  description: 'Latest Chicago Bears game scores and results. See box scores, win/loss records, and game recaps for the 2025 season.',
}

export const revalidate = 1800 // Revalidate every 30 minutes

export default async function BearsScoresPage() {
  const recentScores = await getBearsRecentScores(10)

  // Calculate win streak
  let streak = 0
  let streakType: 'W' | 'L' | 'T' | null = null
  for (const game of recentScores) {
    if (!streakType) {
      streakType = game.result
      streak = 1
    } else if (game.result === streakType) {
      streak++
    } else {
      break
    }
  }

  // Calculate recent record (last 5)
  const lastFive = recentScores.slice(0, 5)
  const lastFiveWins = lastFive.filter(g => g.result === 'W').length
  const lastFiveLosses = lastFive.filter(g => g.result === 'L').length

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
          <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Chicago Bears Recent Scores
          </h1>
          <p className="text-white/70 mt-2">
            Latest results and key stats from Bears games.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 mt-4">
            {streakType && (
              <div className="px-4 py-2 bg-white/10 rounded-lg">
                <span className="text-white/60 text-sm">Current Streak: </span>
                <span className={`font-bold ${streakType === 'W' ? 'text-green-400' : 'text-red-400'}`}>
                  {streak}{streakType}
                </span>
              </div>
            )}
            <div className="px-4 py-2 bg-white/10 rounded-lg">
              <span className="text-white/60 text-sm">Last 5: </span>
              <span className="text-white font-bold">{lastFiveWins}-{lastFiveLosses}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {recentScores.length === 0 ? (
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Scores Yet</h2>
            <p className="text-[var(--text-muted)]">
              Check back once the season starts for game results.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentScores.map((game) => (
              <ScoreCard key={game.gameId} game={game} />
            ))}
          </div>
        )}

        {/* Link to Full Schedule */}
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
    </main>
  )
}

function ScoreCard({ game }: { game: BearsGame }) {
  const gameDate = new Date(game.date)
  const isWin = game.result === 'W'

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden hover:border-[var(--border-strong)] transition-colors">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Date & Week */}
          <div className="md:w-24 flex-shrink-0">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
              Week {game.week}
            </div>
            <div className="text-sm font-medium text-[var(--text-secondary)]">
              {gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>

          {/* Matchup */}
          <div className="flex-1">
            <div className="flex items-center gap-4">
              {/* Bears */}
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #0B162A 0%, #C83200 100%)' }}
                >
                  CHI
                </div>
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">Bears</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {game.homeAway === 'home' ? 'Home' : 'Away'}
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center gap-3 px-4">
                <span className={`text-3xl font-bold ${isWin ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                  {game.bearsScore}
                </span>
                <span className="text-[var(--text-muted)]">-</span>
                <span className={`text-3xl font-bold ${!isWin ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                  {game.oppScore}
                </span>
              </div>

              {/* Opponent */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center font-bold text-[var(--text-muted)]">
                  {game.opponent.substring(0, 3).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-[var(--text-primary)]">{game.opponent}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {game.homeAway === 'home' ? 'Away' : 'Home'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Result Badge */}
          <div className="md:w-24 flex-shrink-0 flex md:justify-end">
            <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-xl font-bold ${
              isWin
                ? 'bg-green-500/10 text-green-500'
                : 'bg-red-500/10 text-red-500'
            }`}>
              {game.result}
            </span>
          </div>
        </div>

        {/* Game Details */}
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--text-muted)]">
          {game.venue && (
            <div>
              <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {game.venue}
            </div>
          )}
          {game.weather && game.weather.tempF && (
            <div>
              <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              {game.weather.tempF}°F
              {game.weather.windMph && ` • ${game.weather.windMph} mph wind`}
            </div>
          )}
          {game.isPlayoff && (
            <div className="text-[#C83200] font-medium">
              Playoff Game
            </div>
          )}
        </div>

        {/* Recap Link */}
        {game.articleSlug && (
          <div className="mt-4">
            <Link
              href={`/bears/${game.articleSlug}`}
              className="inline-flex items-center gap-2 text-[#C83200] hover:text-[#a82900] font-medium transition-colors"
            >
              Read Game Recap
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
