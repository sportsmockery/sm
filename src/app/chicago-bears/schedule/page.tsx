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
          <div
            style={{
              marginBottom: '24px',
              padding: '20px',
              borderRadius: 'var(--sm-radius-lg)',
              backgroundColor: 'var(--sm-card)',
              border: '1px solid var(--sm-border)',
              borderLeft: '4px solid #C83200',
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  style={{
                    padding: '4px 12px',
                    backgroundColor: 'rgba(200, 50, 0, 0.1)',
                    color: '#C83200',
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
                {separatedRecord.regularSeason.ties > 0 && `-${separatedRecord.regularSeason.ties}`}
              </div>
              {separatedRecord.divisionRank && (
                <div style={{ fontSize: '11px', color: 'var(--sm-text-muted)' }}>{separatedRecord.divisionRank}</div>
              )}
            </div>
            {(separatedRecord.postseason.wins > 0 || separatedRecord.postseason.losses > 0) && (
              <div>
                <div style={{ fontSize: '11px', color: 'var(--sm-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Postseason</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#C83200', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {separatedRecord.postseason.wins}-{separatedRecord.postseason.losses}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* All Games - most recent first (for out-of-season display) */}
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
              <h2 style={{ fontWeight: 700, color: 'var(--sm-text)', fontFamily: "'Space Grotesk', sans-serif" }}>
                Chicago Bears 2025 Schedule
              </h2>
              <span style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>
                {schedule.length} games
              </span>
            </div>
            <div>
              {sortedSchedule.map((game) => (
                <GameRow
                  key={game.gameId}
                  game={game}
                  isPreseason={game.gameType === 'preseason'}
                />
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

  const borderColor = isPast
    ? game.result === 'W' ? '#10b981' : game.result === 'T' ? '#eab308' : '#ef4444'
    : '#C83200'

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
      <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[100px_1fr_160px] gap-4 items-center">
        {/* Week & Date */}
        <div className="flex-shrink-0">
          {game.isPlayoff ? (
            <span
              style={{
                padding: '2px 8px',
                backgroundColor: 'rgba(200, 50, 0, 0.1)',
                color: '#C83200',
                fontSize: '11px',
                fontWeight: 700,
                borderRadius: '100px',
                display: 'inline-block',
                marginBottom: '4px',
              }}
            >
              {playoffRound || 'Playoff'}
            </span>
          ) : isPreseason ? (
            <div style={{ fontSize: '12px', color: 'var(--sm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pre {game.week}
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--sm-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Week {game.week}
            </div>
          )}
          <div style={{ fontWeight: 500, color: 'var(--sm-text)' }}>
            {gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--sm-text-muted)' }}>
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

          <span style={{ fontSize: '12px', color: 'var(--sm-text-muted)', fontWeight: 500 }} className="flex-shrink-0">
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
            <span className="text-sm sm:text-base truncate block" style={{ fontWeight: 600, color: 'var(--sm-text)' }}>
              {game.opponentFullName || game.opponent}
            </span>
            {game.venue && (
              <div className="truncate hidden sm:block" style={{ fontSize: '12px', color: 'var(--sm-text-muted)' }}>
                {game.venue}
              </div>
            )}
          </div>
        </div>

        {/* Result / Time - Right aligned */}
        <div className="text-right flex-shrink-0">
          {isPast ? (
            <div className="flex items-center gap-2 justify-end">
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '100px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: game.result === 'W' ? 'rgba(16, 185, 129, 0.1)' : game.result === 'T' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: game.result === 'W' ? '#10b981' : game.result === 'T' ? '#eab308' : '#ef4444',
                }}
              >
                {game.result}
              </span>
              <span style={{ fontWeight: 600, color: 'var(--sm-text)', fontSize: '14px' }}>
                {game.bearsScore}-{game.oppScore}
              </span>
            </div>
          ) : isInProgress ? (
            <div className="flex items-center gap-2 justify-end">
              <span
                className="animate-pulse"
                style={{
                  padding: '2px 8px',
                  backgroundColor: 'rgba(200, 50, 0, 0.1)',
                  color: '#C83200',
                  borderRadius: '100px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                LIVE
              </span>
              <span style={{ fontWeight: 600, color: 'var(--sm-text)', fontSize: '14px' }}>
                {game.bearsScore}-{game.oppScore}
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
          {/* Progressive Record (regular season only) */}
          {progressiveRecord && isPast && !isPreseason && (
            <div style={{ fontSize: '12px', color: 'var(--sm-text-muted)', marginTop: '4px' }}>
              ({progressiveRecord})
            </div>
          )}
          {/* Recap Link inline */}
          {game.articleSlug && (
            <Link
              href={`/bears/${game.articleSlug}`}
              style={{ fontSize: '12px', color: '#C83200', marginTop: '4px', display: 'inline-block' }}
              className="hover:underline"
            >
              Recap →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
