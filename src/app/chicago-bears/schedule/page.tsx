import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBearsSchedule, getAvailableSeasons, type BearsGame } from '@/lib/bearsData'

// Bears logo URL
const BEARS_LOGO = 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png'

export const metadata: Metadata = {
  title: 'Chicago Bears Schedule 2025 | Game Dates & Results | SportsMockery',
  description: 'Complete Chicago Bears 2025 schedule with game dates, times, opponents, scores, and results. View upcoming games and past results.',
}

export const revalidate = 3600

export default async function BearsSchedulePage() {
  // 2025-26 NFL season is stored as season = 2025
  const currentSeason = 2025
  const schedule = await getBearsSchedule(currentSeason)
  const seasons = await getAvailableSeasons()

  // Calculate record
  const completedGames = schedule.filter(g => g.status === 'final')
  const wins = completedGames.filter(g => g.result === 'W').length
  const losses = completedGames.filter(g => g.result === 'L').length

  // Find next game
  const nextGame = schedule.find(g => g.status === 'scheduled')

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
            <span className="text-white">Schedule</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Chicago Bears Schedule {currentSeason}
          </h1>
          <p className="text-white/70 mt-2">
            Full season schedule with game times, opponents, and results.
          </p>

          {/* Record Summary */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="px-4 py-2 bg-white/10 rounded-lg">
              <span className="text-white/60 text-sm">Record: </span>
              <span className="text-white font-bold">{wins}-{losses}</span>
            </div>
            <div className="px-4 py-2 bg-white/10 rounded-lg">
              <span className="text-white/60 text-sm">Games Played: </span>
              <span className="text-white font-bold">{completedGames.length}</span>
            </div>
            <div className="px-4 py-2 bg-white/10 rounded-lg">
              <span className="text-white/60 text-sm">Remaining: </span>
              <span className="text-white font-bold">{schedule.length - completedGames.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Next Game Highlight */}
        {nextGame && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Next Game
            </h2>
            <div className="bg-gradient-to-r from-[#0B162A] to-[#0B162A]/90 rounded-2xl p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-white/60 text-sm mb-1">
                    Week {nextGame.week} • {nextGame.dayOfWeek}
                  </div>
                  <div className="text-2xl font-bold">
                    {nextGame.homeAway === 'home' ? 'vs' : '@'} {nextGame.opponent}
                  </div>
                  <div className="text-white/70 mt-1">
                    {new Date(nextGame.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    {nextGame.time && ` • ${nextGame.time}`}
                  </div>
                </div>
                <div className="text-right">
                  {nextGame.venue && (
                    <div className="text-white/60 text-sm">{nextGame.venue}</div>
                  )}
                  {nextGame.tv && (
                    <div className="mt-1 px-3 py-1 bg-white/10 rounded inline-block text-sm">
                      {nextGame.tv}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Schedule */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Full Schedule
            </h2>
            <span className="text-sm text-[var(--text-muted)]">
              {schedule.length} games
            </span>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {schedule.map((game) => (
              <GameRow key={game.gameId} game={game} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

function GameRow({ game }: { game: BearsGame }) {
  const gameDate = new Date(game.date)
  const isPast = game.status === 'final'
  const isInProgress = game.status === 'in_progress'

  return (
    <div className={`p-4 hover:bg-[var(--bg-hover)] transition-colors ${isPast ? '' : 'bg-[var(--bg-tertiary)]/30'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Week & Date */}
        <div className="sm:w-32 flex-shrink-0">
          <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
            Week {game.week}
          </div>
          <div className="font-medium text-[var(--text-primary)]">
            {gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div className="text-sm text-[var(--text-muted)]">
            {game.dayOfWeek}
          </div>
        </div>

        {/* Matchup with Logos */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {/* Bears Logo */}
            <div className="w-8 h-8 flex-shrink-0">
              <Image
                src={BEARS_LOGO}
                alt="Chicago Bears"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>

            <span className="text-sm text-[var(--text-muted)] font-medium">
              {game.homeAway === 'home' ? 'vs' : '@'}
            </span>

            {/* Opponent Logo */}
            {game.opponentLogo && (
              <div className="w-8 h-8 flex-shrink-0">
                <Image
                  src={game.opponentLogo}
                  alt={game.opponentFullName || game.opponent}
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <span className="text-lg font-semibold text-[var(--text-primary)]">
              {game.opponentFullName || game.opponent}
            </span>

            {game.isPlayoff && (
              <span className="px-2 py-0.5 bg-[#C83200]/10 text-[#C83200] text-xs rounded-full font-medium">
                Playoff
              </span>
            )}
          </div>
          {game.venue && (
            <div className="text-sm text-[var(--text-muted)] mt-1 ml-11">
              {game.venue}
            </div>
          )}
        </div>

        {/* Result / Time */}
        <div className="sm:w-40 sm:text-right flex-shrink-0">
          {isPast ? (
            <div className="flex items-center gap-2 sm:justify-end">
              <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                game.result === 'W'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {game.result}
              </span>
              <span className="font-semibold text-[var(--text-primary)]">
                {game.bearsScore}-{game.oppScore}
              </span>
            </div>
          ) : isInProgress ? (
            <div className="flex items-center gap-2 sm:justify-end">
              <span className="px-3 py-1 bg-[#C83200]/10 text-[#C83200] rounded-lg text-sm font-medium animate-pulse">
                LIVE
              </span>
              <span className="font-semibold text-[var(--text-primary)]">
                {game.bearsScore}-{game.oppScore}
              </span>
            </div>
          ) : (
            <div>
              <div className="font-medium text-[var(--text-primary)]">
                {game.time || 'TBD'}
              </div>
              {game.tv && (
                <div className="text-sm text-[var(--text-muted)]">
                  {game.tv}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recap Link */}
        {game.articleSlug && (
          <Link
            href={`/bears/${game.articleSlug}`}
            className="sm:w-24 text-center px-3 py-1 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-sm text-[#C83200] rounded-lg transition-colors"
          >
            Recap
          </Link>
        )}
      </div>
    </div>
  )
}
