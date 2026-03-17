'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LiveGamePage from '@/components/live/LiveGamePage'
import Link from 'next/link'

interface LiveGame {
  game_id: string
  sport: string
  status: string
  home_team_abbr: string
  away_team_abbr: string
  home_score: number
  away_score: number
  chicago_team: string
}

export default function LivePage() {
  const [game, setGame] = useState<LiveGame | null>(null)
  const [allGames, setAllGames] = useState<LiveGame[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLive() {
      try {
        const res = await fetch('/api/live-games?include_upcoming=true', { cache: 'no-store' })
        const data = await res.json()
        const games: LiveGame[] = data.games || []
        setAllGames(games)

        // Pick the best game: prefer in_progress, then upcoming
        const live = games.find(g => g.status === 'in_progress' || g.status === 'live')
        if (live) {
          setGame(live)
        } else {
          const upcoming = games.find(g => g.status === 'upcoming')
          if (upcoming) setGame(upcoming)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchLive()
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sm-dark)' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #BC0000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-2030 1s linear infinite' }} />
      </div>
    )
  }

  if (game) {
    return <LiveGamePage sport={game.sport} gameId={game.game_id} />
  }

  // No live game — show game center link
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sm-dark)' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--sm-text)', marginBottom: 8 }}>
          No Live Game Right Now
        </h1>
        <p style={{ color: 'var(--sm-text-muted)', marginBottom: 24 }}>
          Check back when a Chicago team is playing.
        </p>
        <Link
          href="/game-center"
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            borderRadius: 999,
            background: '#BC0000',
            color: '#FAFAFB',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          View Game Center
        </Link>
      </div>
    </div>
  )
}
