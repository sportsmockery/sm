import { Metadata } from 'next'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'
import { getCubsSchedule, getCubsRecord, type CubsGame } from '@/lib/cubsData'

const CUBS_LOGO = 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png'

export const metadata: Metadata = {
  title: 'Chicago Cubs Schedule 2025 | Game Dates & Results | SportsMockery',
  description: 'Complete Chicago Cubs 2025 schedule with game dates, times, opponents, scores, and results. View upcoming games and past results.',
}

export const revalidate = 3600

export default async function CubsSchedulePage() {
  const team = CHICAGO_TEAMS.cubs

  const [schedule, cubsRecord, nextGame] = await Promise.all([
    getCubsSchedule(),
    getCubsRecord(),
    fetchNextGame('cubs'),
  ])

  const record = {
    wins: cubsRecord.wins,
    losses: cubsRecord.losses,
  }

  // For out-of-season teams: order all games by most recent first
  const sortedSchedule = [...schedule].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="schedule"
    >
      <div>
        {/* All Games - most recent first (out-of-season display) */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              2025 Season
            </h2>
            <span className="text-sm text-[var(--text-muted)]">
              {schedule.length} games
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
