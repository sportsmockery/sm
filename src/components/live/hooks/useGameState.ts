'use client'

import { useMemo } from 'react'
import type { GameData } from './useLiveGameData'

export type GameState = 'pre_game' | 'live' | 'post_game'

export function useGameState(game: GameData | null): GameState {
  return useMemo(() => {
    if (!game) return 'pre_game'
    if (game.status === 'in_progress') return 'live'
    if (game.status === 'final') return 'post_game'
    return 'pre_game'
  }, [game?.status])
}
