'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const POLL_INTERVAL_LIVE = 10000
const POLL_INTERVAL_IDLE = 30000

interface LiveGame {
  game_id: string
  sport: string
  status: string
  game_start_time: string
  home_team_id: string
  away_team_id: string
  home_team_name: string
  away_team_name: string
  home_team_abbr: string
  away_team_abbr: string
  home_logo_url: string
  away_logo_url: string
  home_score: number
  away_score: number
  period: number | null
  period_label: string | null
  clock: string | null
  venue_name: string | null
  broadcast_network: string | null
  updated_at: string
  chicago_team: string
  is_chicago_home: boolean
}

const SPORT_ORDER = ['nba', 'nhl', 'nfl', 'mlb']
const SPORT_LABELS: Record<string, string> = { nfl: 'NFL', nba: 'NBA', nhl: 'NHL', mlb: 'MLB' }
const SPORT_COLORS: Record<string, string> = { nfl: '#0B162A', nba: '#CE1141', nhl: '#CF0A2C', mlb: '#0E3386' }

const TEAM_HUB: Record<string, string> = {
  bears: '/chicago-bears/live',
  bulls: '/chicago-bulls/live',
  blackhawks: '/chicago-blackhawks/live',
  cubs: '/chicago-cubs/live',
  whitesox: '/chicago-white-sox/live',
}

function formatGameTime(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  } catch {
    return ''
  }
}

function StatusBadge({ status, clock, periodLabel, sport }: { status: string; clock: string | null; periodLabel: string | null; sport: string }) {
  if (status === 'in_progress' || status === 'live') {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>
          {periodLabel}{clock && sport !== 'mlb' ? ` ${clock}` : ''}
        </span>
      </div>
    )
  }
  if (status === 'final') {
    return <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sm-text-muted)' }}>FINAL</span>
  }
  if (status === 'upcoming') {
    return <span style={{ fontSize: 12, fontWeight: 500, color: '#00D4FF' }}>UPCOMING</span>
  }
  return <span style={{ fontSize: 12, color: 'var(--sm-text-muted)' }}>{status}</span>
}

function GameCard({ game, prevScore }: { game: LiveGame; prevScore: { home: number; away: number } | null }) {
  const homeScored = prevScore && game.home_score > prevScore.home
  const awayScored = prevScore && game.away_score > prevScore.away
  const isLive = game.status === 'in_progress' || game.status === 'live'
  const gameLink = `/live/${game.sport}/${game.game_id}`

  return (
    <Link href={gameLink} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          cursor: 'pointer',
          border: isLive ? '1px solid rgba(22,163,106,0.2)' : undefined,
        }}
      >
        {/* Sport + status row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: SPORT_COLORS[game.sport] || '#0B0F14',
                background: `${SPORT_COLORS[game.sport] || '#0B0F14'}15`,
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              {SPORT_LABELS[game.sport] || game.sport}
            </span>
            {game.venue_name && (
              <span style={{ fontSize: 11, color: 'var(--sm-text-muted)' }}>{game.venue_name}</span>
            )}
          </div>
          <StatusBadge status={game.status} clock={game.clock} periodLabel={game.period_label} sport={game.sport} />
        </div>

        {/* Away team */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {game.away_logo_url ? (
              <Image src={game.away_logo_url} alt={game.away_team_abbr} width={32} height={32} className="w-8 h-8 object-contain" unoptimized />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center" style={{ fontSize: 10, fontWeight: 700 }}>{game.away_team_abbr}</div>
            )}
            <div>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--sm-text)' }}>{game.away_team_name}</span>
              {!game.is_chicago_home && game.chicago_team && (
                <span style={{ fontSize: 10, color: '#BC0000', marginLeft: 6, fontWeight: 600 }}>CHI</span>
              )}
            </div>
          </div>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--sm-text)',
              transition: 'color 0.3s',
              ...(awayScored ? { color: '#BC0000' } : {}),
            }}
          >
            {game.away_score}
          </span>
        </div>

        {/* Home team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {game.home_logo_url ? (
              <Image src={game.home_logo_url} alt={game.home_team_abbr} width={32} height={32} className="w-8 h-8 object-contain" unoptimized />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center" style={{ fontSize: 10, fontWeight: 700 }}>{game.home_team_abbr}</div>
            )}
            <div>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--sm-text)' }}>{game.home_team_name}</span>
              {game.is_chicago_home && game.chicago_team && (
                <span style={{ fontSize: 10, color: '#BC0000', marginLeft: 6, fontWeight: 600 }}>CHI</span>
              )}
            </div>
          </div>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--sm-text)',
              transition: 'color 0.3s',
              ...(homeScored ? { color: '#BC0000' } : {}),
            }}
          >
            {game.home_score}
          </span>
        </div>

        {/* Broadcast */}
        {game.broadcast_network && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--sm-border)', fontSize: 11, color: 'var(--sm-text-muted)' }}>
            {game.broadcast_network}
          </div>
        )}
      </div>
    </Link>
  )
}

export default function GameCenterClient() {
  const [games, setGames] = useState<LiveGame[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const prevScoresRef = useRef<Record<string, { home: number; away: number }>>({})

  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch('/api/live-games?include_upcoming=true', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()

      // Save previous scores for flash animation
      const prevScores: Record<string, { home: number; away: number }> = {}
      for (const g of games) {
        prevScores[g.game_id] = { home: g.home_score, away: g.away_score }
      }
      prevScoresRef.current = prevScores

      setGames(data.games || [])
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) {
      console.error('[GameCenter] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [games])

  useEffect(() => {
    fetchGames()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const hasLive = games.some(g => g.status === 'in_progress' || g.status === 'live')
    const interval = setInterval(fetchGames, hasLive ? POLL_INTERVAL_LIVE : POLL_INTERVAL_IDLE)
    return () => clearInterval(interval)
  }, [fetchGames, games])

  // Group by sport
  const grouped = SPORT_ORDER.reduce<Record<string, LiveGame[]>>((acc, sport) => {
    const sportGames = games.filter(g => g.sport === sport)
    if (sportGames.length > 0) acc[sport] = sportGames
    return acc
  }, {})

  // Separate live, upcoming, final
  const liveGames = games.filter(g => g.status === 'in_progress' || g.status === 'live')
  const upcomingGames = games.filter(g => g.status === 'upcoming')
  const finalGames = games.filter(g => g.status === 'final')

  const hasLive = liveGames.length > 0

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 80px', background: '#FAFAFB', minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--sm-text)', letterSpacing: '-0.5px', margin: 0 }}>
            Game Center
          </h1>
          <p style={{ fontSize: 14, color: 'var(--sm-text-muted)', margin: '4px 0 0' }}>
            Live scores for all Chicago teams
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasLive && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(22,163,106,0.08)' }}>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>
                {liveGames.length} Live
              </span>
            </div>
          )}
          {lastUpdated && (
            <span style={{ fontSize: 11, color: 'var(--sm-text-muted)' }}>
              Updated {lastUpdated}
            </span>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-[#BC0000] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* No games */}
      {!loading && games.length === 0 && (
        <div className="text-center py-16">
          <p style={{ fontSize: 16, color: 'var(--sm-text-muted)' }}>No games scheduled right now.</p>
          <p style={{ fontSize: 14, color: 'var(--sm-text-muted)', marginTop: 8 }}>Check back on game day!</p>
        </div>
      )}

      {/* Live Games */}
      {liveGames.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#16a34a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            Live Now
          </h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {liveGames.map(game => (
              <GameCard key={game.game_id} game={game} prevScore={prevScoresRef.current[game.game_id] || null} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcomingGames.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#00D4FF', marginBottom: 12 }}>
            Upcoming
          </h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {upcomingGames.map(game => (
              <GameCard key={game.game_id} game={game} prevScore={null} />
            ))}
          </div>
        </section>
      )}

      {/* Final / Recent */}
      {finalGames.length > 0 && (
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--sm-text-muted)', marginBottom: 12 }}>
            Final
          </h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {finalGames.map(game => (
              <GameCard key={game.game_id} game={game} prevScore={null} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
