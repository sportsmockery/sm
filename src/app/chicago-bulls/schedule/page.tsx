import { Metadata } from 'next'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'
import { getBullsSchedule, getBullsRecord, type BullsGame } from '@/lib/bullsData'

const BULLS_LOGO = 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png'

export const metadata: Metadata = {
  title: 'Chicago Bulls Schedule 2025-26 | Game Dates & Results | SportsMockery',
  description: 'Complete Chicago Bulls 2025-26 schedule with game dates, times, opponents, scores, and results. View upcoming games and past results.',
}

export const revalidate = 3600

export default async function BullsSchedulePage() {
  const team = CHICAGO_TEAMS.bulls

  const [schedule, bullsRecord, nextGame] = await Promise.all([
    getBullsSchedule(),
    getBullsRecord(),
    fetchNextGame('bulls'),
  ])

  // Build record for TeamHubLayout
  const record = {
    wins: bullsRecord.wins,
    losses: bullsRecord.losses,
  }

  // Sort schedule: upcoming games first (ascending by date), then completed (descending by date)
  const upcomingGames = schedule.filter(g => g.status !== 'final').sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  const completedGames = schedule.filter(g => g.status === 'final').sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const nextScheduledGame = upcomingGames[0]

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
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">2025-26 Season</div>
              <div className="text-xl font-bold text-[var(--text-primary)]">
                {bullsRecord.wins}-{bullsRecord.losses}
              </div>
            </div>
            {bullsRecord.streak && (
              <div>
                <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Streak</div>
                <div className={`text-xl font-bold ${bullsRecord.streak.startsWith('W') ? 'text-green-500' : 'text-red-500'}`}>
                  {bullsRecord.streak}
                </div>
              </div>
            )}
            <div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Games Played</div>
              <div className="text-xl font-bold text-[var(--text-primary)]">
                {completedGames.length}
              </div>
            </div>
          </div>
        </div>

        {/* Next Game */}
        {nextScheduledGame && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 bg-[#CE1141]/10 text-[#CE1141] text-xs font-semibold rounded">
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
                      unoptimized
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

        {/* Upcoming Games */}
        {upcomingGames.length > 0 && (
          <div className="mb-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-tertiary)]/30">
              <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Upcoming Games
              </h2>
              <span className="text-sm text-[var(--text-muted)]">
                {upcomingGames.length} games
              </span>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {upcomingGames.slice(0, 10).map((game) => (
                <GameRow key={game.gameId} game={game} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Games */}
        {completedGames.length > 0 && (
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Recent Results
              </h2>
              <span className="text-sm text-[var(--text-muted)]">
                {completedGames.length} games
              </span>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {completedGames.map((game) => (
                <GameRow key={game.gameId} game={game} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {schedule.length === 0 && (
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center">
            <p className="text-[var(--text-muted)]">No schedule data available</p>
          </div>
        )}
      </div>
    </TeamHubLayout>
  )
}

function GameRow({ game }: { game: BullsGame }) {
  const gameDate = new Date(game.date)
  const isPast = game.status === 'final'
  const isInProgress = game.status === 'in_progress'

  return (
    <div className={`p-4 hover:bg-[var(--bg-hover)] transition-colors ${isPast ? '' : 'bg-[var(--bg-tertiary)]/30'}`}>
      <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[100px_1fr_140px] gap-4 items-center">
        <div className="flex-shrink-0">
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
              src={BULLS_LOGO}
              alt="Chicago Bulls"
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
                {game.bullsScore}-{game.oppScore}
              </span>
            </div>
          ) : isInProgress ? (
            <div className="flex items-center gap-2 justify-end">
              <span className="px-2 py-0.5 bg-[#CE1141]/10 text-[#CE1141] rounded text-xs font-medium animate-pulse">
                LIVE
              </span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">
                {game.bullsScore}-{game.oppScore}
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
