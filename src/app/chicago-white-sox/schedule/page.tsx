import { Metadata } from 'next'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'
import { getWhiteSoxSchedule, getWhiteSoxRecord, type WhiteSoxGame } from '@/lib/whitesoxData'

const WHITE_SOX_LOGO = 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png'

export const metadata: Metadata = {
  title: 'Chicago White Sox Schedule 2025 | Game Dates & Results | SportsMockery',
  description: 'Complete Chicago White Sox 2025 schedule with game dates, times, opponents, scores, and results. View upcoming games and past results.',
}

export const revalidate = 3600

export default async function WhiteSoxSchedulePage() {
  const team = CHICAGO_TEAMS.whitesox

  const [schedule, soxRecord, nextGame] = await Promise.all([
    getWhiteSoxSchedule(),
    getWhiteSoxRecord(),
    fetchNextGame('whitesox'),
  ])

  const record = {
    wins: soxRecord.wins,
    losses: soxRecord.losses,
  }

  // For out-of-season teams: order all games by most recent first
  const sortedSchedule = [...schedule].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Find next scheduled game
  const nextScheduledGame = schedule.find(g => g.status === 'scheduled')

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="schedule"
    >
      <div className="pb-12">
        {/* Next Game Highlight */}
        {nextScheduledGame && (
          <div
            className="glass-card glass-card-sm glass-card-static"
            style={{ marginBottom: '24px', borderLeft: '4px solid var(--sm-red)' }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="sm-tag">UP NEXT</span>
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
                  <span style={{ fontWeight: 600, color: 'var(--sm-text)' }}>
                    {nextScheduledGame.homeAway === 'home' ? 'vs' : '@'} {nextScheduledGame.opponentFullName || nextScheduledGame.opponent}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm">
                <div style={{ color: 'var(--sm-text)', fontWeight: 500 }}>
                  {new Date(nextScheduledGame.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div style={{ color: 'var(--sm-text-muted)' }}>
                  {nextScheduledGame.time || 'TBD'} {nextScheduledGame.tv && `· ${nextScheduledGame.tv}`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Record Summary */}
        <div className="glass-card glass-card-sm glass-card-static" style={{ marginBottom: '24px' }}>
          <div className="flex flex-wrap gap-6 justify-center text-center">
            <div>
              <div style={{ fontSize: '11px', color: 'var(--sm-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>2025 Season</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--sm-text)', fontFamily: "Barlow, sans-serif" }}>
                {soxRecord.wins}-{soxRecord.losses}
              </div>
            </div>
          </div>
        </div>

        {/* All Games */}
        <div className="glass-card glass-card-static" style={{ overflow: 'hidden', padding: 0 }}>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--sm-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h2 style={{ fontWeight: 700, color: 'var(--sm-text)', fontFamily: "Barlow, sans-serif" }}>
              White Sox 2025 Schedule
            </h2>
            <span style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>
              {schedule.length} games
            </span>
          </div>
          <div>
            {sortedSchedule.map((game) => (
              <GameRow key={game.gameId} game={game} />
            ))}
          </div>
        </div>
      </div>
    </TeamHubLayout>
  )
}

function GameRow({ game }: { game: WhiteSoxGame }) {
  const gameDate = new Date(game.date)
  const isPast = game.status === 'final'
  const isInProgress = game.status === 'in_progress'

  const borderColor = isPast
    ? game.result === 'W' ? '#10b981' : '#ef4444'
    : 'var(--sm-red)'

  return (
    <div
      style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--sm-border)',
        borderLeft: `3px solid ${borderColor}`,
        transition: 'background-color 0.15s ease',
      }}
      className="hover:brightness-95 dark:hover:brightness-110"
    >
      <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[100px_1fr_140px] gap-4 items-center">
        <div className="flex-shrink-0">
          <div style={{ fontWeight: 500, color: 'var(--sm-text)' }}>
            {gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--sm-text-muted)' }}>
            {game.dayOfWeek}
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 flex-shrink-0">
            <Image
              src={WHITE_SOX_LOGO}
              alt="Chicago White Sox"
              width={28}
              height={28}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>
          <span style={{ fontSize: '12px', color: 'var(--sm-text-muted)', fontWeight: 500 }} className="flex-shrink-0">
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
            <span className="text-sm sm:text-base truncate block" style={{ fontWeight: 600, color: 'var(--sm-text)' }}>
              {game.opponentFullName || game.opponent}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          {isPast ? (
            <div className="flex items-center gap-2 justify-end">
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '100px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: game.result === 'W' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: game.result === 'W' ? '#10b981' : '#ef4444',
                }}
              >
                {game.result}
              </span>
              <span style={{ fontWeight: 600, color: 'var(--sm-text)', fontSize: '14px' }}>
                {game.whitesoxScore}-{game.oppScore}{game.innings && game.innings > 9 ? ` (${game.innings})` : ''}
              </span>
            </div>
          ) : isInProgress ? (
            <div className="flex items-center gap-2 justify-end">
              <span
                className="animate-pulse"
                style={{
                  padding: '2px 8px',
                  backgroundColor: 'rgba(39, 37, 31, 0.1)',
                  color: 'var(--sm-red)',
                  borderRadius: '100px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                LIVE
              </span>
              <span style={{ fontWeight: 600, color: 'var(--sm-text)', fontSize: '14px' }}>
                {game.whitesoxScore}-{game.oppScore}
              </span>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 500, color: 'var(--sm-text)', fontSize: '14px' }}>
                {game.time || 'TBD'}
              </div>
              {game.tv && (
                <div style={{ fontSize: '12px', color: 'var(--sm-text-muted)' }}>
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
