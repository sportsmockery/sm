// src/components/homepage/HeroStatsOrbs.tsx
// 500 purely decorative random dots — no text, no stats, no orbital ring.
// Three categories: normal (red), trail (comet glow), themed (white/black).
// New random layout on every page load via useMemo([]).
'use client'

import { useMemo, useState, useEffect } from 'react'

interface Dot {
  top: string
  left: string
  size: number
  delay: number
  duration: number
  kind: 'normal' | 'trail' | 'themed'
}

function generateDots(count: number): Dot[] {
  const trailCount = Math.round(count * 0.10)   // 10% trail
  const themedCount = Math.round(count * 0.10)   // 10% themed
  const normalCount = count - trailCount - themedCount

  const dots: Dot[] = []

  for (let i = 0; i < normalCount; i++) {
    dots.push({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 4,          // 2-6px
      delay: Math.random() * 12,
      duration: 6 + Math.random() * 8,       // 6-14s
      kind: 'normal',
    })
  }

  for (let i = 0; i < trailCount; i++) {
    dots.push({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: 4 + Math.random() * 10,          // 4-14px
      delay: Math.random() * 12,
      duration: 6 + Math.random() * 8,
      kind: 'trail',
    })
  }

  for (let i = 0; i < themedCount; i++) {
    dots.push({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 6,           // 2-8px
      delay: Math.random() * 12,
      duration: 6 + Math.random() * 8,
      kind: 'themed',
    })
  }

  return dots
}

export function HeroStatsOrbs() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  // New random layout each mount (page load) — empty deps = runs once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dots = useMemo(() => generateDots(isMobile ? 200 : 500), [isMobile])

  return (
    <div className="hero-stats-orbs" aria-hidden="true">
      {dots.map((d, i) => {
        const className = d.kind === 'trail'
          ? 'hero-floating-dot hero-dot-trail'
          : d.kind === 'themed'
            ? 'hero-floating-dot hero-dot-themed'
            : 'hero-floating-dot'

        return (
          <div
            key={i}
            className={className}
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
        )
      })}
    </div>
  )
}
