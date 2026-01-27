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
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="bg-[var(--bg-surface)] rounded-lg p-6 text-center">
        {/* Matchup */}
        <div className="flex items-center justify-center gap-6 sm:gap-12 mb-6">
          <div className="flex flex-col items-center gap-2">
            <Image src={game.away_team.logo_url} alt={game.away_team.name} width={80} height={80} className="object-contain" unoptimized />
            <span className="font-bold text-lg text-[var(--text-primary)]">{game.away_team.name}</span>
          </div>
          <span className="text-2xl font-bold text-[var(--text-muted)]">VS</span>
          <div className="flex flex-col items-center gap-2">
            <Image src={game.home_team.logo_url} alt={game.home_team.name} width={80} height={80} className="object-contain" unoptimized />
            <span className="font-bold text-lg text-[var(--text-primary)]">{game.home_team.name}</span>
          </div>
        </div>

        {/* Countdown */}
        {countdown && (
          <div className="mb-4">
            <div className="text-3xl font-bold text-[#bc0000]">{countdown}</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">until game time</div>
          </div>
        )}

        {/* Game info */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-[var(--text-muted)]">
          {game.venue.name && <span>{game.venue.name}{game.venue.city ? `, ${game.venue.city}` : ''}</span>}
          {game.broadcast.network && (
            <>
              <span className="text-[var(--border-color)]">|</span>
              <span>TV: {game.broadcast.network}</span>
            </>
          )}
          {game.weather.temperature && (game.sport === 'nfl' || game.sport === 'mlb') && (
            <>
              <span className="text-[var(--border-color)]">|</span>
              <span>{game.weather.temperature}&deg;F {game.weather.condition}</span>
            </>
          )}
        </div>

        {/* Odds */}
        {game.odds.over_under != null && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--text-muted)]">
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
