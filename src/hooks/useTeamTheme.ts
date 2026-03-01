'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const TEAM_THEMES: Record<string, { gradient: string; glow: string }> = {
  'chicago-bears': {
    gradient: 'linear-gradient(135deg, #0B162A, #C83803)',
    glow: 'rgba(200, 56, 3, 0.3)',
  },
  'chicago-bulls': {
    gradient: 'linear-gradient(135deg, #CE1141, #000000)',
    glow: 'rgba(206, 17, 65, 0.3)',
  },
  'chicago-cubs': {
    gradient: 'linear-gradient(135deg, #0E3386, #CC3433)',
    glow: 'rgba(14, 51, 134, 0.3)',
  },
  'chicago-white-sox': {
    gradient: 'linear-gradient(135deg, #27251F, #C4CED4)',
    glow: 'rgba(196, 206, 212, 0.2)',
  },
  'chicago-blackhawks': {
    gradient: 'linear-gradient(135deg, #CF0A2C, #000000)',
    glow: 'rgba(207, 10, 44, 0.3)',
  },
}

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #bc0000, #8b0000)'
const DEFAULT_GLOW = 'rgba(188, 0, 0, 0.15)'

export function useTeamTheme() {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.documentElement

    const matchedTeam = Object.keys(TEAM_THEMES).find((slug) =>
      pathname.startsWith(`/${slug}`)
    )

    if (matchedTeam) {
      const theme = TEAM_THEMES[matchedTeam]
      root.style.setProperty('--sm-gradient', theme.gradient)
      root.style.setProperty('--sm-red-glow', theme.glow)
    } else {
      root.style.setProperty('--sm-gradient', DEFAULT_GRADIENT)
      root.style.setProperty('--sm-red-glow', DEFAULT_GLOW)
    }

    return () => {
      root.style.setProperty('--sm-gradient', DEFAULT_GRADIENT)
      root.style.setProperty('--sm-red-glow', DEFAULT_GLOW)
    }
  }, [pathname])
}
