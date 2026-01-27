'use client'

import type { GameData } from './hooks/useLiveGameData'

interface GameInfoProps {
  game: GameData
}

export default function GameInfo({ game }: GameInfoProps) {
  const hasVenue = game.venue.name
  const hasBroadcast = game.broadcast.network
  const hasWeather = game.weather.temperature && (game.sport === 'nfl' || game.sport === 'mlb')

  if (!hasVenue && !hasBroadcast && !hasWeather) return null

  return (
    <div className="py-2 border-t border-white/10 flex items-center justify-center gap-4 text-sm text-white/60">
      {hasVenue && (
        <span>{game.venue.name}{game.venue.city ? `, ${game.venue.city}` : ''}</span>
      )}
      {hasBroadcast && (
        <>
          <span className="text-white/20">|</span>
          <span>TV: {game.broadcast.network}</span>
        </>
      )}
      {hasWeather && (
        <>
          <span className="text-white/20">|</span>
          <span>{game.weather.temperature}&deg;F {game.weather.condition}</span>
        </>
      )}
    </div>
  )
}
