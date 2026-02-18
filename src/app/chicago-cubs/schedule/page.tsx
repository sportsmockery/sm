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
            style={{
              marginBottom: '24px',
              padding: '20px',
              borderRadius: 'var(--sm-radius-lg)',
              backgroundColor: 'var(--sm-card)',
              border: '1px solid var(--sm-border)',
              borderLeft: '4px solid #0E3386',
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  style={{
                    padding: '4px 12px',
                    backgroundColor: 'rgba(14, 51, 134, 0.1)',
                    color: '#0E3386',
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
              <div style={{ fontSize: '11px', color: 'var(--sm-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Regular Season</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--sm-text)', fontFamily: "'Space Grotesk', sans-serif" }}>
                {separatedRecord.regularSeason.wins}-{separatedRecord.regularSeason.losses}
              </div>
              {separatedRecord.divisionRank && (
                <div style={{ fontSize: '12px', color: 'var(--sm-text-muted)' }}>{separatedRecord.divisionRank}</div>
              )}
            </div>
            {hasPostseason && (
              <div>
                <div style={{ fontSize: '11px', color: 'var(--sm-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Postseason</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0E3386', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {separatedRecord.postseason.wins}-{separatedRecord.postseason.losses}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* All Games */}
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
            <h2 style={{ fontWeight: 700, color: 'var(--sm-text)', fontFamily: "'Space Grotesk', sans-serif" }}>
              Chicago Cubs 2025 Schedule
            </h2>
            <span style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>
              {regularGames.length} regular{hasPostseason ? ` + ${postseasonGames.length} playoff` : ''} games
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

function GameRow({ game }: { game: CubsGame }) {
  const gameDate = new Date(game.date)
  const isPast = game.status === 'final'
  const isInProgress = game.status === 'in_progress'
  const isPostseason = game.gameType === 'postseason'

  const borderColor = isPast
    ? game.result === 'W' ? '#10b981' : '#ef4444'
    : '#0E3386'

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
          {isPostseason && (
            <span
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                backgroundColor: 'rgba(14, 51, 134, 0.1)',
                color: '#0E3386',
                fontSize: '11px',
                borderRadius: '100px',
                fontWeight: 700,
                marginBottom: '4px',
              }}
            >
              Playoff
            </span>
          )}
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
              src={CUBS_LOGO}
              alt="Chicago Cubs"
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
                {game.cubsScore}-{game.oppScore}{game.innings && game.innings > 9 ? ` (${game.innings})` : ''}
              </span>
            </div>
          ) : isInProgress ? (
            <div className="flex items-center gap-2 justify-end">
              <span
                className="animate-pulse"
                style={{
                  padding: '2px 8px',
                  backgroundColor: 'rgba(14, 51, 134, 0.1)',
                  color: '#0E3386',
                  borderRadius: '100px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                LIVE
              </span>
              <span style={{ fontWeight: 600, color: 'var(--sm-text)', fontSize: '14px' }}>
                {game.cubsScore}-{game.oppScore}
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
