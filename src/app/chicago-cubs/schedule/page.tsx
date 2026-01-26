import { Metadata } from 'next'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'
import { getCubsSchedule, getCubsSeparatedRecord, type CubsGame } from '@/lib/cubsData'

const CUBS_LOGO = 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png'

export const metadata: Metadata = {
  title: 'Chicago Cubs Schedule 2025 | Game Dates & Results | SportsMockery',
  description: 'Complete Chicago Cubs 2025 schedule with game dates, times, opponents, scores, and results. View upcoming games and past results.',
}

export const revalidate = 3600

export default async function CubsSchedulePage() {
  const team = CHICAGO_TEAMS.cubs

  const [schedule, separatedRecord, nextGame] = await Promise.all([
    getCubsSchedule(),
    getCubsSeparatedRecord(),
    fetchNextGame('cubs'),
  ])

  // Build record object for TeamHubLayout (regular season only in main display)
  const record = {
    wins: separatedRecord.regularSeason.wins,
    losses: separatedRecord.regularSeason.losses,
    postseason: (separatedRecord.postseason.wins > 0 || separatedRecord.postseason.losses > 0)
      ? separatedRecord.postseason
      : undefined,
    divisionRank: separatedRecord.divisionRank || undefined,
  }

  // For out-of-season teams: order all games by most recent first
  const sortedSchedule = [...schedule].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Count games by type
  const regularGames = schedule.filter(g => g.gameType === 'regular')
  const postseasonGames = schedule.filter(g => g.gameType === 'postseason')
  const hasPostseason = postseasonGames.length > 0

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="schedule"
    >
      <div className="pb-12">
        {/* Record Summary */}
        <div className="mb-6 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <div className="flex flex-wrap gap-6 justify-center text-center">
            <div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Regular Season</div>
              <div className="text-xl font-bold text-[var(--text-primary)]">
                {separatedRecord.regularSeason.wins}-{separatedRecord.regularSeason.losses}
              </div>
              {separatedRecord.divisionRank && (
                <div className="text-xs text-[var(--text-muted)]">{separatedRecord.divisionRank}</div>
              )}
            </div>
            {hasPostseason && (
              <div>
                <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Postseason</div>
                <div className="text-xl font-bold text-[#0E3386]">
                  {separatedRecord.postseason.wins}-{separatedRecord.postseason.losses}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* All Games - most recent first */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              {hasPostseason ? '2025 Season' : 'Regular Season'}
            </h2>
            <span className="text-sm text-[var(--text-muted)]">
              {regularGames.length} regular{hasPostseason ? ` + ${postseasonGames.length} playoff` : ''} games
            </span>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {sortedSchedule.map((game) => (
              <GameRow key={game.gameId} game={game} />
            ))}
          </div>
        </div>
      </div>
    </TeamHubLayout>
  )
}

function GameRow({ game }: { game: CubsGame }) {
  const gameDate = new Date(game.date)
  const isPast = game.status === 'final'
  const isInProgress = game.status === 'in_progress'
  const isPostseason = game.gameType === 'postseason'

  return (
    <div className={`p-4 hover:bg-[var(--bg-hover)] transition-colors ${isPast ? '' : 'bg-[var(--bg-tertiary)]/30'}`}>
      <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[100px_1fr_140px] gap-4 items-center">
        <div className="flex-shrink-0">
          {isPostseason && (
            <div className="px-2 py-1 bg-[#0E3386]/10 text-[#0E3386] text-xs rounded font-semibold inline-block mb-1">
              Playoff
            </div>
          )}
          <div className="font-medium text-[var(--text-primary)]">
            {gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {game.dayOfWeek}
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 flex-shrink-0">
            <Image
              src={CUBS_LOGO}
              alt="Chicago Cubs"
              width={28}
              height={28}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>

          <span className="text-xs text-[var(--text-muted)] font-medium flex-shrink-0">
            {game.homeAway === 'home' ? 'vs' : '@'}
          </span>

          {game.opponentLogo && (
            <div className="w-7 h-7 flex-shrink-0">
              <Image
                src={game.opponentLogo}
                alt={game.opponent}
                width={28}
                height={28}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <span className="text-sm sm:text-base font-semibold text-[var(--text-primary)] truncate block">
              {game.opponentFullName || game.opponent}
            </span>
          </div>
        </div>

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
                {game.cubsScore}-{game.oppScore}{game.innings && game.innings > 9 ? ` (${game.innings})` : ''}
              </span>
            </div>
          ) : isInProgress ? (
            <div className="flex items-center gap-2 justify-end">
              <span className="px-2 py-0.5 bg-[#0E3386]/10 text-[#0E3386] dark:bg-[#CC3433]/10 dark:text-[#CC3433] rounded text-xs font-medium animate-pulse">
                LIVE
              </span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">
                {game.cubsScore}-{game.oppScore}
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
        </div>
      </div>
    </div>
  )
}
