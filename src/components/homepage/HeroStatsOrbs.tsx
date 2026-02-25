// src/components/homepage/HeroStatsOrbs.tsx
// Orbital stat orbs — ALL data fetched live from /api/hero-stats (same sources as team pages).
// Zero hardcoded stats. Orbital animation on desktop, vertical stack on mobile.
'use client'

import { useState, useEffect, useMemo } from 'react'

interface HeroStat {
  label: string
  value: string
  team?: string
  size: 'large' | 'medium' | 'small'
  phase?: string
}

// Team accent colors at ultra-low opacity for rim glow
const TEAM_COLORS: Record<string, string> = {
  bears: 'rgba(11, 22, 42, 0.10)',
  bulls: 'rgba(206, 17, 65, 0.10)',
  blackhawks: 'rgba(207, 10, 44, 0.10)',
  cubs: 'rgba(14, 51, 134, 0.10)',
  whitesox: 'rgba(39, 37, 31, 0.10)',
}

// Orbit radii per size tier (desktop)
const ORBIT_RADIUS: Record<string, number> = { large: 180, medium: 140, small: 100 }
// Orb diameters — large enough for vertical label + value with no truncation
const SIZE_PX: Record<string, number> = { large: 110, medium: 80, small: 56 }

// 100 decorative floating dots
const DOTS = Array.from({ length: 100 }, (_, i) => ({
  top: `${(i * 7.3 + i * i * 0.13) % 100}%`,
  left: `${(i * 11.7 + i * i * 0.09) % 100}%`,
  size: 2 + (i % 5),
  delay: (i * 0.15) % 12,
  duration: 6 + (i % 8),
}))

function FloatingDots() {
  return (
    <>
      {DOTS.map((d, i) => (
        <div
          key={`dot-${i}`}
          className="hero-floating-dot"
          style={{
            position: 'absolute',
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </>
  )
}

function StatOrb({ stat, index, total }: { stat: HeroStat; index: number; total: number }) {
  const size = SIZE_PX[stat.size] || 80
  const radius = ORBIT_RADIUS[stat.size] || 140
  const teamColor = stat.team ? TEAM_COLORS[stat.team] : undefined

  // Stagger orbit delays evenly across the full 12s cycle
  const orbitDelay = total > 0 ? (index / total) * -12 : 0

  return (
    <div
      className={`hero-stat-orb orb-${stat.size}`}
      style={{
        width: size,
        height: size,
        '--orbit-radius': `${radius}px`,
        '--orbit-delay': `${orbitDelay}s`,
        '--delay': `${index * 0.15}s`,
        ...(teamColor ? { '--orb-accent': teamColor } : {}),
      } as React.CSSProperties}
    >
      <span className="hero-stat-orb-label">{stat.label}</span>
      <span className="hero-stat-orb-value">{stat.value}</span>
    </div>
  )
}

export function HeroStatsOrbs() {
  const [stats, setStats] = useState<HeroStat[]>([])

  // Fetch live stats from API (same sources as team pages)
  useEffect(() => {
    fetch('/api/hero-stats')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.stats?.length) {
          setStats(data.stats)
        }
      })
      .catch(() => {})
  }, [])

  // Limit to 10 orbs max
  const visibleStats = useMemo(() => stats.slice(0, 10), [stats])

  if (visibleStats.length === 0) {
    return (
      <div className="hero-stats-orbs" aria-hidden="true">
        <FloatingDots />
      </div>
    )
  }

  return (
    <div className="hero-stats-orbs" aria-hidden="true">
      <FloatingDots />
      <div className="hero-orbs-orbit-ring">
        {visibleStats.map((stat, i) => (
          <StatOrb
            key={`${stat.label}-${stat.value}-${i}`}
            stat={stat}
            index={i}
            total={visibleStats.length}
          />
        ))}
      </div>
    </div>
  )
}
