import { Metadata } from 'next'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'
import { getBlackhawksSchedule, getBlackhawksRecord, type BlackhawksGame } from '@/lib/blackhawksData'

const BLACKHAWKS_LOGO = 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png'

export const metadata: Metadata = {
  title: 'Chicago Blackhawks Schedule 2025-26 | Game Dates & Results | SportsMockery',
  description: 'Complete Chicago Blackhawks 2025-26 schedule with game dates, times, opponents, scores, and results. View upcoming games and past results.',
}

export const revalidate = 3600

export default async function BlackhawksSchedulePage() {
  const team = CHICAGO_TEAMS.blackhawks

  const [schedule, hawksRecord, nextGame] = await Promise.all([
    getBlackhawksSchedule(),
    getBlackhawksRecord(),
    fetchNextGame('blackhawks'),
  ])

  const record = {
    wins: hawksRecord.wins,
    losses: hawksRecord.losses,
    otLosses: hawksRecord.otLosses,
  }

  // For in-season teams: show only the next upcoming game, hide the rest
  // Show completed games in reverse chronological order (most recent first)
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
        {/* Next Game Highlight */}
        {nextScheduledGame && (
          <div
            style={{
              marginBottom: '24px',
              padding: '20px',
              borderRadius: 'var(--sm-radius-lg)',
              backgroundColor: 'var(--sm-card)',
              border: '1px solid var(--sm-border)',
              borderLeft: '4px solid #CF0A2C',
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  style={{
                    padding: '4px 12px',
                    backgroundColor: 'rgba(207, 10, 44, 0.1)',
                    color: '#CF0A2C',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '100px',
                    letterSpacing: '0.5px',
                  }}
                >
                  UP NEXT
                </span>
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
        <div
          style={{
            marginBottom: '24px',
            padding: '20px',
            borderRadius: 'var(--sm-radius-lg)',
            backgroundColor: 'var(--sm-card)',
            border: '1px solid var(--sm-border)',
          }}
        >
          <div className="flex flex-wrap gap-6 justify-center text-center">
            <div>
              <div style={{ fontSize: '11px', color: 'var(--sm-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>2025-26 Season</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--sm-text)', fontFamily: "'Montserrat', sans-serif" }}>
                {hawksRecord.wins}-{hawksRecord.losses}-{hawksRecord.otLosses}
              </div>
            </div>
            {hawksRecord.streak && (
              <div>
                <div style={{ fontSize: '11px', color: 'var(--sm-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Streak</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: hawksRecord.streak.startsWith('W') ? '#10b981' : '#ef4444', fontFamily: "'Montserrat', sans-serif" }}>
                  {hawksRecord.streak}
                </div>
              </div>
            )}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--sm-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Games Played</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--sm-text)', fontFamily: "'Montserrat', sans-serif" }}>
                {completedGames.length}
              </div>
            </div>
          </div>
        </div>

        {/* Full Schedule */}
        {schedule.length > 0 && (
          <div
            style={{
              backgroundColor: 'var(--sm-card)',
              border: '1px solid var(--sm-border)',
              borderRadius: 'var(--sm-radius-xl)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--sm-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2 style={{ fontWeight: 700, color: 'var(--sm-text)', fontFamily: "'Montserrat', sans-serif" }}>
                Chicago Blackhawks 2025-26 Schedule
              </h2>
              <span style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>
                {schedule.length} games
              </span>
            </div>
            <div>
              {[...upcomingGames, ...completedGames].map((game) => (
                <GameRow key={game.gameId} game={game} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {schedule.length === 0 && (
          <div
            style={{
              backgroundColor: 'var(--sm-card)',
              border: '1px solid var(--sm-border)',
              borderRadius: 'var(--sm-radius-xl)',
              padding: '48px',
              textAlign: 'center',
            }}
          >
            <p style={{ color: 'var(--sm-text-muted)' }}>No schedule data available</p>
          </div>
        )}
      </div>
    </TeamHubLayout>
  )
}

function GameRow({ game }: { game: BlackhawksGame }) {
  const gameDate = new Date(game.date)
  const isPast = game.status === 'final'
  const isInProgress = game.status === 'in_progress'

  const borderColor = isPast
    ? game.result === 'W' ? '#10b981' : game.result === 'OTL' ? '#eab308' : '#ef4444'
    : '#CF0A2C'

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
              src={BLACKHAWKS_LOGO}
              alt="Chicago Blackhawks"
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
                  backgroundColor: game.result === 'W' ? 'rgba(16, 185, 129, 0.1)' : game.result === 'OTL' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: game.result === 'W' ? '#10b981' : game.result === 'OTL' ? '#eab308' : '#ef4444',
                }}
              >
                {game.result}{game.overtime ? ' (OT)' : ''}{game.shootout ? ' (SO)' : ''}
              </span>
              <span style={{ fontWeight: 600, color: 'var(--sm-text)', fontSize: '14px' }}>
                {game.blackhawksScore}-{game.oppScore}
              </span>
            </div>
          ) : isInProgress ? (
            <div className="flex items-center gap-2 justify-end">
              <span
                className="animate-pulse"
                style={{
                  padding: '2px 8px',
                  backgroundColor: 'rgba(207, 10, 44, 0.1)',
                  color: '#CF0A2C',
                  borderRadius: '100px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                LIVE
              </span>
              <span style={{ fontWeight: 600, color: 'var(--sm-text)', fontSize: '14px' }}>
                {game.blackhawksScore}-{game.oppScore}
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
