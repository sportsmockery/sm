import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBearsSchedule, getAvailableSeasons, getPlayoffRoundName, type BearsGame } from '@/lib/bearsData'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'

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
  const team = CHICAGO_TEAMS.bears

  // Fetch all data in parallel
  const [schedule, seasons, record, nextGame] = await Promise.all([
    getBearsSchedule(currentSeason),
    getAvailableSeasons(),
    fetchTeamRecord('bears'),
    fetchNextGame('bears'),
  ])

  // Calculate record
  const completedGames = schedule.filter(g => g.status === 'final')
  const wins = completedGames.filter(g => g.result === 'W').length
  const losses = completedGames.filter(g => g.result === 'L').length

  // Find next scheduled game
  const nextScheduledGame = schedule.find(g => g.status === 'scheduled')

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="schedule"
    >
      {/* Schedule Content */}
      <div>
        {/* Next Game Highlight - Full Width */}
        {nextScheduledGame && (
          <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-[#0B162A] to-[#0B162A]/90 border border-[var(--border-subtle)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Left: Badge + Matchup */}
              <div className="flex items-center gap-4">
                <div className="px-3 py-1.5 bg-[#C83200] text-white text-xs font-bold rounded uppercase tracking-wide">
                  Up Next
                </div>
                <div className="flex items-center gap-3">
                  <Image
                    src="https://a.espncdn.com/i/teamlogos/nfl/500/chi.png"
                    alt="Chicago Bears"
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                  <span className="text-white/60 text-sm font-medium">
                    {nextScheduledGame.homeAway === 'home' ? 'vs' : '@'}
                  </span>
                  {nextScheduledGame.opponentLogo && (
                    <Image
                      src={nextScheduledGame.opponentLogo}
                      alt={nextScheduledGame.opponent}
                      width={40}
                      height={40}
                      className="w-10 h-10"
                    />
                  )}
                  <span className="font-bold text-white text-lg">
                    {nextScheduledGame.opponentFullName || nextScheduledGame.opponent}
                  </span>
                </div>
              </div>

              {/* Center: Date & Time */}
              <div className="flex items-center gap-6 text-center sm:text-left">
                <div>
                  <div className="text-white font-semibold">
                    {new Date(nextScheduledGame.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="text-white/60 text-sm">
                    {nextScheduledGame.time || 'Time TBD'}
                  </div>
                </div>
                {nextScheduledGame.tv && (
                  <div className="px-3 py-1 bg-white/10 rounded text-white/80 text-sm font-medium">
                    {nextScheduledGame.tv}
                  </div>
                )}
              </div>

              {/* Right: Venue & Weather */}
              <div className="text-right text-sm">
                {nextScheduledGame.venue && (
                  <div className="text-white/70">{nextScheduledGame.venue}</div>
                )}
                {nextScheduledGame.weather?.tempF && (
                  <div className="text-white/50 flex items-center gap-1 justify-end mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    {nextScheduledGame.weather.tempF}°F
                    {nextScheduledGame.weather.windMph && ` • ${nextScheduledGame.weather.windMph}mph wind`}
                  </div>
                )}
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
    </TeamHubLayout>
  )
}

function GameRow({ game }: { game: BearsGame }) {
  const gameDate = new Date(game.date)
  const isPast = game.status === 'final'
  const isInProgress = game.status === 'in_progress'
  const playoffRound = game.isPlayoff ? getPlayoffRoundName(game.week) : null

  return (
    <div className={`p-4 hover:bg-[var(--bg-hover)] transition-colors ${isPast ? '' : 'bg-[var(--bg-tertiary)]/30'}`}>
      <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[100px_1fr_140px] gap-4 items-center">
        {/* Week & Date */}
        <div className="flex-shrink-0">
          {game.isPlayoff ? (
            <div className="px-2 py-1 bg-[#C83200]/10 text-[#C83200] text-xs rounded font-semibold inline-block mb-1">
              {playoffRound || 'Playoff'}
            </div>
          ) : (
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
              Week {game.week}
            </div>
          )}
          <div className="font-medium text-[var(--text-primary)]">
            {gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {game.dayOfWeek}
          </div>
        </div>

        {/* Matchup - Compact Design */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Bears Logo */}
          <div className="w-7 h-7 flex-shrink-0">
            <Image
              src={BEARS_LOGO}
              alt="Chicago Bears"
              width={28}
              height={28}
              className="w-full h-full object-contain"
            />
          </div>

          <span className="text-xs text-[var(--text-muted)] font-medium flex-shrink-0">
            {game.homeAway === 'home' ? 'vs' : '@'}
          </span>

          {/* Opponent Logo */}
          {game.opponentLogo && (
            <div className="w-7 h-7 flex-shrink-0">
              <Image
                src={game.opponentLogo}
                alt={game.opponentFullName || game.opponent}
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <span className="text-sm sm:text-base font-semibold text-[var(--text-primary)] truncate block">
              {game.opponentFullName || game.opponent}
            </span>
            {game.venue && (
              <div className="text-xs text-[var(--text-muted)] truncate hidden sm:block">
                {game.venue}
              </div>
            )}
          </div>
        </div>

        {/* Result / Time - Right aligned */}
        <div className="text-right flex-shrink-0">
          {isPast ? (
            <div className="flex items-center gap-2 justify-end">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                game.result === 'W'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {game.result}
              </span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">
                {game.bearsScore}-{game.oppScore}
              </span>
            </div>
          ) : isInProgress ? (
            <div className="flex items-center gap-2 justify-end">
              <span className="px-2 py-0.5 bg-[#C83200]/10 text-[#C83200] rounded text-xs font-medium animate-pulse">
                LIVE
              </span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">
                {game.bearsScore}-{game.oppScore}
              </span>
            </div>
          ) : (
            <div>
              <div className="font-medium text-[var(--text-primary)] text-sm">
                {game.time || 'TBD'}
              </div>
              {game.tv && (
                <div className="text-xs text-[var(--text-muted)]">
                  {game.tv}
                </div>
              )}
            </div>
          )}
          {/* Recap Link inline */}
          {game.articleSlug && (
            <Link
              href={`/bears/${game.articleSlug}`}
              className="text-xs text-[#C83200] hover:underline mt-1 inline-block"
            >
              Recap →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
