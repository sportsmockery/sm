import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBearsSchedule, getAvailableSeasons, getPlayoffRoundName, getBearsSeparatedRecord, type BearsGame } from '@/lib/bearsData'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'

// Bears logo URL
const BEARS_LOGO = 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png'

// Bye week for 2025 season
const BYE_WEEK = 5

export const metadata: Metadata = {
  title: 'Chicago Bears Schedule 2025 | Game Dates & Results | SportsMockery',
  description: 'Complete Chicago Bears 2025 schedule with game dates, times, opponents, scores, and results. View upcoming games and past results.',
}

export const revalidate = 3600

// Helper to calculate progressive record
function calculateProgressiveRecord(games: BearsGame[]): (BearsGame & { progressiveRecord: string })[] {
  let wins = 0
  let losses = 0
  let ties = 0
  return games.map(g => {
    if (g.status === 'final') {
      if (g.result === 'W') wins++
      else if (g.result === 'L') losses++
      else if (g.result === 'T') ties++
    }
    const tieStr = ties > 0 ? `-${ties}` : ''
    return { ...g, progressiveRecord: `${wins}-${losses}${tieStr}` }
  })
}

export default async function BearsSchedulePage() {
  // 2025-26 NFL season is stored as season = 2025
  const currentSeason = 2025
  const team = CHICAGO_TEAMS.bears

  // Fetch all data in parallel
  const [schedule, seasons, separatedRecord, nextGame] = await Promise.all([
    getBearsSchedule(currentSeason),
    getAvailableSeasons(),
    getBearsSeparatedRecord(currentSeason),
    fetchNextGame('bears'),
  ])

  // For out-of-season teams: order all games by most recent first
  const sortedSchedule = [...schedule].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Separate games by type for display purposes
  const preseasonGames = schedule.filter(g => g.gameType === 'preseason')
  const regularGames = schedule.filter(g => g.gameType === 'regular')
  const postseasonGames = schedule.filter(g => g.gameType === 'postseason')

  // Calculate progressive record for regular season (needed for record display)
  const regularWithRecord = calculateProgressiveRecord(regularGames)

  // Build record object for TeamHubLayout (regular season only in main display)
  const record = {
    wins: separatedRecord.regularSeason.wins,
    losses: separatedRecord.regularSeason.losses,
    ties: separatedRecord.regularSeason.ties > 0 ? separatedRecord.regularSeason.ties : undefined,
    postseason: (separatedRecord.postseason.wins > 0 || separatedRecord.postseason.losses > 0)
      ? separatedRecord.postseason
      : undefined,
    divisionRank: separatedRecord.divisionRank || undefined,
  }

  // Find next scheduled game (any type)
  const nextScheduledGame = schedule.find(g => g.status === 'scheduled')

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="schedule"
    >
      {/* Schedule Content */}
      <div className="pb-12">
        {/* Next Game Highlight - Compact */}
        {nextScheduledGame && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 bg-[#C83200]/10 text-[#C83200] text-xs font-semibold rounded">
                  UP NEXT
                </div>
                <div className="flex items-center gap-2">
                  {nextScheduledGame.opponentLogo && (
                    <Image
                      src={nextScheduledGame.opponentLogo}
                      alt={nextScheduledGame.opponent}
                      width={28}
                      height={28}
                      className="w-7 h-7"
                    />
                  )}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {nextScheduledGame.homeAway === 'home' ? 'vs' : '@'} {nextScheduledGame.opponentFullName || nextScheduledGame.opponent}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="text-[var(--text-primary)] font-medium">
                  {new Date(nextScheduledGame.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="text-[var(--text-muted)]">
                  {nextScheduledGame.time || 'TBD'} {nextScheduledGame.tv && `• ${nextScheduledGame.tv}`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Record Summary */}
        <div className="mb-6 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <div className="flex flex-wrap gap-6 justify-center text-center">
            <div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Regular Season</div>
              <div className="text-xl font-bold text-[var(--text-primary)]">
                {separatedRecord.regularSeason.wins}-{separatedRecord.regularSeason.losses}
                {separatedRecord.regularSeason.ties > 0 && `-${separatedRecord.regularSeason.ties}`}
              </div>
              {separatedRecord.divisionRank && (
                <div className="text-xs text-[var(--text-muted)]">{separatedRecord.divisionRank}</div>
              )}
            </div>
            {(separatedRecord.postseason.wins > 0 || separatedRecord.postseason.losses > 0) && (
              <div>
                <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Postseason</div>
                <div className="text-xl font-bold text-[#C83200]">
                  {separatedRecord.postseason.wins}-{separatedRecord.postseason.losses}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* All Games - most recent first (for out-of-season display) */}
        <div className="mb-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Chicago Bears 2025 Schedule
              </h2>
              <span className="text-sm text-[var(--text-muted)]">
                {schedule.length} games
              </span>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {sortedSchedule.map((game) => (
                <GameRow
                  key={game.gameId}
                  game={game}
                  isPreseason={game.gameType === 'preseason'}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </TeamHubLayout>
  )
}

function GameRow({
  game,
  progressiveRecord,
  isPreseason
}: {
  game: BearsGame
  progressiveRecord?: string
  isPreseason?: boolean
}) {
  const gameDate = new Date(game.date)
  const isPast = game.status === 'final'
  const isInProgress = game.status === 'in_progress'
  const playoffRound = game.isPlayoff ? getPlayoffRoundName(game.week) : null

  return (
    <div className={`p-4 hover:bg-[var(--bg-hover)] transition-colors ${isPast ? '' : 'bg-[var(--bg-tertiary)]/30'}`}>
      <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[100px_1fr_160px] gap-4 items-center">
        {/* Week & Date */}
        <div className="flex-shrink-0">
          {game.isPlayoff ? (
            <div className="px-2 py-1 bg-[#C83200]/10 text-[#C83200] text-xs rounded font-semibold inline-block mb-1">
              {playoffRound || 'Playoff'}
            </div>
          ) : isPreseason ? (
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
              Pre {game.week}
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
                  : game.result === 'T'
                    ? 'bg-yellow-500/10 text-yellow-500'
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
          {/* Progressive Record (regular season only) */}
          {progressiveRecord && isPast && !isPreseason && (
            <div className="text-xs text-[var(--text-muted)] mt-1">
              ({progressiveRecord})
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
