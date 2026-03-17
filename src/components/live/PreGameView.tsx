'use client'

import Image from 'next/image'
import type { GameData } from './hooks/useLiveGameData'
import { useEffect, useState } from 'react'

interface PreGameViewProps {
  game: GameData
}

export default function PreGameView({ game }: PreGameViewProps) {
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    if (!game.game_start_time) return

    const update = () => {
      const diff = new Date(game.game_start_time!).getTime() - Date.now()
      if (diff <= 0) {
        setCountdown('Starting soon...')
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown(h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`)
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [game.game_start_time])

  return (
    <div className="px-4 py-8">
      <div className="rounded-lg p-6 text-center max-w-[600px] mx-auto" style={{ backgroundColor: 'var(--sm-card)' }}>
        {/* Matchup */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex flex-col items-center gap-2 flex-1">
            <Image src={game.away_team.logo_url} alt={game.away_team.name} width={80} height={80} className="object-contain" unoptimized />
            <span className="font-bold text-lg" style={{ color: 'var(--sm-text)' }}>{game.away_team.name}</span>
            {(game as any).probable_pitcher_away && (
              <span className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>{(game as any).probable_pitcher_away}</span>
            )}
          </div>
          <span className="text-2xl font-bold px-4 shrink-0" style={{ color: 'var(--sm-text-muted)' }}>VS</span>
          <div className="flex flex-col items-center gap-2 flex-1">
            <Image src={game.home_team.logo_url} alt={game.home_team.name} width={80} height={80} className="object-contain" unoptimized />
            <span className="font-bold text-lg" style={{ color: 'var(--sm-text)' }}>{game.home_team.name}</span>
            {(game as any).probable_pitcher_home && (
              <span className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>{(game as any).probable_pitcher_home}</span>
            )}
          </div>
        </div>

        {/* Countdown */}
        {countdown && (
          <div className="mb-4">
            <div className="text-3xl font-bold" style={{ color: '#bc0000' }}>{countdown}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--sm-text-muted)' }}>until game time</div>
          </div>
        )}

        {/* Game info */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
          {game.venue.name && <span>{game.venue.name}{game.venue.city ? `, ${game.venue.city}` : ''}</span>}
          {game.broadcast.network && (
            <>
              <span style={{ color: 'var(--sm-border)' }}>|</span>
              <span>TV: {game.broadcast.network}</span>
            </>
          )}
          {game.weather.temperature && (game.sport === 'nfl' || game.sport === 'mlb') && (
            <>
              <span style={{ color: 'var(--sm-border)' }}>|</span>
              <span>{game.weather.temperature}&deg;F {game.weather.condition}</span>
            </>
          )}
        </div>

        {/* MLB Gameday link */}
        {game.sport === 'mlb' && (game as any).mlb_game_pk && (
          <div className="mt-3">
            <a
              href={`https://www.mlb.com/gameday/${(game as any).mlb_game_pk}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: '#BC0000' }}
            >
              MLB Gameday
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        )}

        {/* Odds */}
        {game.odds.over_under != null && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
            {game.odds.spread_points != null && (
              <span>Spread: {game.odds.spread_points > 0 ? '+' : ''}{game.odds.spread_points}</span>
            )}
            <span>O/U: {game.odds.over_under}</span>
            {game.odds.moneyline_home && (
              <span>ML: {game.home_team.abbr} {game.odds.moneyline_home} / {game.away_team.abbr} {game.odds.moneyline_away}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
