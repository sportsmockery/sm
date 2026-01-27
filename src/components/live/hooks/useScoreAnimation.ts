'use client'

import { useEffect, useRef, useState } from 'react'

interface ScoreAnimationState {
  homeAnimating: boolean
  awayAnimating: boolean
}

export function useScoreAnimation(
  homeScore: number | undefined,
  awayScore: number | undefined
): ScoreAnimationState {
  const prevHome = useRef<number | undefined>(undefined)
  const prevAway = useRef<number | undefined>(undefined)
  const [homeAnimating, setHomeAnimating] = useState(false)
  const [awayAnimating, setAwayAnimating] = useState(false)

  useEffect(() => {
    if (prevHome.current !== undefined && homeScore !== undefined && homeScore !== prevHome.current) {
      setHomeAnimating(true)
      const t = setTimeout(() => setHomeAnimating(false), 2000)
      return () => clearTimeout(t)
    }
    prevHome.current = homeScore
  }, [homeScore])

  useEffect(() => {
    if (prevAway.current !== undefined && awayScore !== undefined && awayScore !== prevAway.current) {
      setAwayAnimating(true)
      const t = setTimeout(() => setAwayAnimating(false), 2000)
      return () => clearTimeout(t)
    }
    prevAway.current = awayScore
  }, [awayScore])

  return { homeAnimating, awayAnimating }
}
