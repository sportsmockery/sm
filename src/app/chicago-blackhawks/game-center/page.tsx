import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame, fetchLastGame } from '@/lib/team-config'
import { getBlackhawksSchedule, type BlackhawksGame } from '@/lib/blackhawksData'
import { HubUpdatesFeed } from '@/components/hub'

export const metadata: Metadata = {
  title: 'Chicago Blackhawks Game Center | Sports Mockery',
  description:
    'Live scores, play-by-play, previews.',
  openGraph: {
    title: 'Chicago Blackhawks Game Center',
    description: 'Live scores, play-by-play, previews.',
    type: 'website',
  },
  twitter: {
    title: 'Chicago Blackhawks Game Center',
    description: 'Live scores, play-by-play, previews.',
  },
}

export const revalidate = 1800

export default async function BlackhawksGameCenterPage() {
  const team = CHICAGO_TEAMS.blackhawks

  const [record, nextGame, lastGame, schedule] = await Promise.all([
    fetchTeamRecord('blackhawks'),
    fetchNextGame('blackhawks'),
    fetchLastGame('blackhawks'),
    getBlackhawksSchedule(2026),
  ])

  // Recent completed games (most recent first)
  const completedGames = schedule
    .filter((g) => g.status === 'final')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Upcoming games
  const upcomingGames = schedule
    .filter((g) => g.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <TeamHubLayout team={team} record={record} nextGame={nextGame} activeTab="game-center">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--sm-text)',
              letterSpacing: '-1px',
              margin: '0 0 8px 0',
            }}
          >
            Blackhawks Game Center
          </h1>
          <p style={{ color: 'var(--sm-text-muted)', fontSize: '16px', margin: 0, lineHeight: 1.6 }}>
            Live scores, play-by-play, and game previews for every Blackhawks game.
          </p>
        </div>

        {/* Next/Last Game Hero Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {/* Next Game */}
          {nextGame ? (
            <div
              className="glass-card glass-card-static"
              style={{
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(207,10,44,0.15), rgba(0,0,0,0.3))',
                borderColor: 'rgba(207,10,44,0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: 'var(--sm-red-light)',
                  marginBottom: '12px',
                }}
              >
                Next Game
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '22px',
                  fontWeight: 700,
                  color: 'var(--sm-text)',
                  marginBottom: '6px',
                }}
              >
                {nextGame.isHome ? 'vs' : '@'} {nextGame.opponent}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>
                {nextGame.date} {nextGame.time && `at ${nextGame.time}`}
              </div>
              {nextGame.venue && (
                <div style={{ fontSize: '12px', color: 'var(--sm-text-dim)', marginTop: '4px' }}>
                  {nextGame.venue}
                </div>
              )}
            </div>
          ) : (
            <div
              className="glass-card glass-card-static"
              style={{ padding: '24px' }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: 'var(--sm-text-dim)',
                  marginBottom: '12px',
                }}
              >
                Next Game
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--sm-text-muted)',
                }}
              >
                Offseason
              </div>
            </div>
          )}

          {/* Last Game */}
          {lastGame && (
            <Link
              href="/chicago-blackhawks/scores"
              style={{ textDecoration: 'none' }}
            >
              <div className="glass-card" style={{ padding: '24px', height: '100%' }}>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--sm-text-dim)',
                    marginBottom: '12px',
                  }}
                >
                  Last Game
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '14px',
                      backgroundColor:
                        lastGame.result === 'W' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                      color: lastGame.result === 'W' ? 'var(--sm-success, #22c55e)' : 'var(--sm-error, #ef4444)',
                    }}
                  >
                    {lastGame.result}
                  </span>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '20px',
                        fontWeight: 700,
                        color: 'var(--sm-text)',
                      }}
                    >
                      {lastGame.isHome ? 'vs' : '@'} {lastGame.opponent}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>
                      {lastGame.teamScore}-{lastGame.opponentScore}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Quick Links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
          {[
            { label: 'Full Schedule', href: '/chicago-blackhawks/schedule' },
            { label: 'Box Scores', href: '/chicago-blackhawks/scores' },
            { label: 'Team Stats', href: '/chicago-blackhawks/stats' },
            { label: 'Trade Rumors', href: '/chicago-blackhawks/trade-rumors' },
          ].map((link) => (
            <Link key={link.label} href={link.href} className="team-pill">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Hub Updates Feed */}
        <HubUpdatesFeed hubSlug="game-center" teamSlug="chicago-blackhawks" title="Game Notes" emptyState="No game notes yet." />

        {/* Recent Results */}
        {completedGames.length > 0 && (
          <section style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: 'var(--sm-text)',
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '-0.5px',
                paddingBottom: '8px',
                borderBottom: '3px solid var(--sm-red)',
                margin: '0 0 20px 0',
              }}
            >
              Recent Results
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {completedGames.slice(0, 8).map((game) => (
                <GameRow key={game.gameId} game={game} />
              ))}
            </div>
            {completedGames.length > 8 && (
              <Link
                href="/chicago-blackhawks/scores"
                className="btn btn-sm btn-secondary"
                style={{
                  display: 'inline-block',
                  marginTop: '16px',
                  textDecoration: 'none',
                }}
              >
                View All Scores
              </Link>
            )}
          </section>
        )}

        {/* Upcoming Games */}
        {upcomingGames.length > 0 && (
          <section style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: 'var(--sm-text)',
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '-0.5px',
                paddingBottom: '8px',
                borderBottom: '3px solid var(--sm-red)',
                margin: '0 0 20px 0',
              }}
            >
              Upcoming Games
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcomingGames.slice(0, 6).map((game) => (
                <GameRow key={game.gameId} game={game} />
              ))}
            </div>
            {upcomingGames.length > 6 && (
              <Link
                href="/chicago-blackhawks/schedule"
                className="btn btn-sm btn-secondary"
                style={{
                  display: 'inline-block',
                  marginTop: '16px',
                  textDecoration: 'none',
                }}
              >
                Full Schedule
              </Link>
            )}
          </section>
        )}

        {/* Ask Scout CTA */}
        <div
          className="glass-card glass-card-static"
          style={{ marginTop: '32px', textAlign: 'center', padding: '32px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <Image src="/downloads/scout-v2.png" alt="Scout AI" width={28} height={28} />
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: 'var(--sm-text)',
                fontWeight: 700,
                fontSize: '18px',
                margin: 0,
              }}
            >
              Ask Scout About Blackhawks Games
            </h3>
          </div>
          <p style={{ color: 'var(--sm-text-muted)', fontSize: '14px', margin: '0 0 16px 0' }}>
            Get instant game previews, score predictions, and post-game analysis.
          </p>
          <Link
            href="/scout-ai?team=chicago-blackhawks&q=How%20did%20the%20Blackhawks%20do%20in%20their%20last%20game"
            className="btn btn-md btn-primary"
            style={{ display: 'inline-block', textDecoration: 'none', borderRadius: 'var(--sm-radius-pill)' }}
          >
            Ask Scout
          </Link>
        </div>
      </div>
    </TeamHubLayout>
  )
}

function GameRow({ game }: { game: BlackhawksGame }) {
  const isCompleted = game.status === 'final'
  const gameDate = new Date(game.date)

  // Format result label for NHL (includes OTL)
  const resultLabel = game.result === 'OTL' ? 'OTL' : game.result

  return (
    <Link
      href={isCompleted ? '/chicago-blackhawks/scores' : '/chicago-blackhawks/schedule'}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        className="glass-card glass-card-sm"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          overflow: 'hidden',
        }}
      >
        {/* Date */}
        <div
          style={{
            width: '60px',
            flexShrink: 0,
            fontSize: '12px',
            color: 'var(--sm-text-muted)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontWeight: 600 }}>
            {gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--sm-text-dim)' }}>
            {game.dayOfWeek.slice(0, 3)}
          </div>
        </div>

        {/* Opponent Logo */}
        {game.opponentLogo && (
          <div style={{ width: '28px', height: '28px', flexShrink: 0 }}>
            <Image
              src={game.opponentLogo}
              alt={game.opponent}
              width={28}
              height={28}
              style={{ objectFit: 'contain' }}
              unoptimized
            />
          </div>
        )}

        {/* Opponent + Location */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--sm-text)',
            }}
          >
            {game.homeAway === 'home' ? 'vs' : '@'} {game.opponentFullName || game.opponent}
          </div>
          {game.arena && (
            <div style={{ fontSize: '11px', color: 'var(--sm-text-dim)' }}>{game.arena}</div>
          )}
        </div>

        {/* Score or Time */}
        {isCompleted ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: '13px',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor:
                  game.result === 'W' ? 'rgba(34,197,94,0.15)' :
                  game.result === 'OTL' ? 'rgba(249,115,22,0.15)' :
                  'rgba(239,68,68,0.15)',
                color:
                  game.result === 'W' ? 'var(--sm-success, #22c55e)' :
                  game.result === 'OTL' ? '#f97316' :
                  'var(--sm-error, #ef4444)',
              }}
            >
              {resultLabel}
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--sm-text)',
              }}
            >
              {game.blackhawksScore}-{game.oppScore}
              {(game.overtime || game.shootout) && (
                <span style={{ fontSize: '11px', color: 'var(--sm-text-dim)', marginLeft: '4px' }}>
                  {game.shootout ? 'SO' : 'OT'}
                </span>
              )}
            </span>
          </div>
        ) : (
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sm-text)' }}>
              {game.time || 'TBD'}
            </div>
            {game.tv && (
              <div style={{ fontSize: '11px', color: 'var(--sm-text-dim)' }}>{game.tv}</div>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
