// src/components/homepage/HeroStatsOrbs.tsx
'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'

interface HeroStat {
  label: string
  value: string
  team?: string
  size: 'large' | 'medium' | 'small'
}

// Team accent colors at ultra-low opacity for rim glow
const TEAM_COLORS: Record<string, string> = {
  bears: 'rgba(11, 22, 42, 0.10)',
  bulls: 'rgba(206, 17, 65, 0.10)',
  blackhawks: 'rgba(207, 10, 44, 0.10)',
  cubs: 'rgba(14, 51, 134, 0.10)',
  whitesox: 'rgba(39, 37, 31, 0.10)',
}

// Fixed positions scattered organically (percentages)
const ORB_POSITIONS: { top: string; left: string }[] = [
  // Large (3)
  { top: '8%', left: '3%' },
  { top: '10%', left: '76%' },
  { top: '62%', left: '85%' },
  // Medium (5)
  { top: '28%', left: '12%' },
  { top: '50%', left: '2%' },
  { top: '75%', left: '10%' },
  { top: '35%', left: '88%' },
  { top: '78%', left: '70%' },
  // Small (2)
  { top: '18%', left: '42%' },
  { top: '82%', left: '48%' },
]

const SIZE_PX: Record<string, number> = { large: 110, medium: 80, small: 56 }
const FONT_SIZE: Record<string, number> = { large: 18, medium: 14, small: 12 }
const LABEL_SIZE: Record<string, number> = { large: 9, medium: 8, small: 7 }

const FALLBACK_STATS: HeroStat[] = [
  // Large (3): In-season records + recent score
  { label: 'Bulls Record', value: '23-22', team: 'bulls', size: 'large' },
  { label: 'Hawks Record', value: '21-22-8', team: 'blackhawks', size: 'large' },
  { label: 'Bulls L vs CHA', value: '99-131', team: 'bulls', size: 'large' },
  // Medium (6): Last games + offseason records
  { label: 'Hawks W vs SJ', value: '6-3', team: 'blackhawks', size: 'medium' },
  { label: 'Bears Record', value: '11-6', team: 'bears', size: 'medium' },
  { label: 'Cubs Record', value: '92-70', team: 'cubs', size: 'medium' },
  { label: 'White Sox Record', value: '60-102', team: 'whitesox', size: 'medium' },
  { label: 'Posts This Week', value: '6', size: 'medium' },
  // Small (3): Site stats
  { label: 'Total Posts', value: '31K', size: 'small' },
  { label: 'Weekly Views', value: '6.8K', size: 'small' },
]

// Simple count-up for numeric values
function useCountUp(target: string, duration: number = 1000, delay: number = 0): string {
  const [current, setCurrent] = useState(target)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) { setCurrent(target); return }

    // Parse number from target (handle $12.4M, 30K, 11-6, etc.)
    const numMatch = target.match(/^(\$?)([\d.]+)([KM]?)$/)
    if (!numMatch) { setCurrent(target); hasRun.current = true; return }

    const prefix = numMatch[1]
    const num = parseFloat(numMatch[2])
    const suffix = numMatch[3]
    const isFloat = numMatch[2].includes('.')

    const timeout = setTimeout(() => {
      const start = Date.now()
      const step = () => {
        const elapsed = Date.now() - start
        const progress = Math.min(elapsed / duration, 1)
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        const val = eased * num
        const formatted = isFloat ? val.toFixed(1) : String(Math.round(val))
        setCurrent(`${prefix}${formatted}${suffix}`)
        if (progress < 1) requestAnimationFrame(step)
        else hasRun.current = true
      }
      requestAnimationFrame(step)
    }, delay)

    return () => clearTimeout(timeout)
  }, [target, duration, delay])

  return current
}

function StatOrb({ stat, index }: { stat: HeroStat; index: number }) {
  const size = SIZE_PX[stat.size] || 50
  const fontSize = FONT_SIZE[stat.size] || 13
  const labelFontSize = LABEL_SIZE[stat.size] || 7
  const pos = ORB_POSITIONS[index] || { top: '50%', left: '50%' }
  const teamColor = stat.team ? TEAM_COLORS[stat.team] : undefined
  const delayMs = index * 120

  const displayValue = useCountUp(stat.value, 1000, delayMs)

  return (
    <div
      className="hero-stat-orb"
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        width: size,
        height: size,
        animationDelay: `${delayMs}ms`,
        ...(teamColor ? { '--orb-accent': teamColor } as React.CSSProperties : {}),
      }}
    >
      <span className="hero-stat-orb-value" style={{ fontSize }}>
        {displayValue}
      </span>
      <span className="hero-stat-orb-label" style={{ fontSize: labelFontSize }}>
        {stat.label}
      </span>
    </div>
  )
}

// 100 purely decorative floating dots — no data, just ambiance
const DOTS = Array.from({ length: 100 }, (_, i) => ({
  top: `${(i * 7.3 + i * i * 0.13) % 100}%`,
  left: `${(i * 11.7 + i * i * 0.09) % 100}%`,
  size: 2 + (i % 5),               // 2–6px
  delay: (i * 0.15) % 12,          // stagger over 12s
  duration: 6 + (i % 8),           // 6–13s drift cycle
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

export function HeroStatsOrbs() {
  const [stats, setStats] = useState<HeroStat[]>(FALLBACK_STATS)
  const [cycleSet, setCycleSet] = useState(0)
  const allStats = useRef<HeroStat[]>(FALLBACK_STATS)

  // Fetch live stats
  useEffect(() => {
    fetch('/api/hero-stats')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.stats?.length) {
          allStats.current = data.stats
          setStats(data.stats.slice(0, 10))
        }
      })
      .catch(() => {})
  }, [])

  // Cycle stats every 8 seconds — rotate through available stats
  useEffect(() => {
    const interval = setInterval(() => {
      setCycleSet(prev => prev + 1)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  // Select which 10 stats to display for current cycle
  const displayStats = useMemo(() => {
    const all = allStats.current
    if (all.length <= 10) return all
    const offset = (cycleSet * 2) % all.length
    const result: HeroStat[] = []
    for (let i = 0; i < 10; i++) {
      result.push(all[(offset + i) % all.length])
    }
    return result
  }, [cycleSet])

  // On mobile, show fewer orbs (large + medium only)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const visibleStats = useMemo(() => {
    if (isMobile) {
      return displayStats.filter(s => s.size !== 'small').slice(0, 6)
    }
    return displayStats.slice(0, 10)
  }, [displayStats, isMobile])

  return (
    <div className="hero-stats-orbs" aria-hidden="true">
      <FloatingDots />
      {visibleStats.map((stat, i) => (
        <StatOrb key={`${stat.label}-${stat.value}-${i}`} stat={stat} index={i} />
      ))}
    </div>
  )
}
