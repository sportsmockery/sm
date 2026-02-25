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
  { top: '8%', left: '5%' },
  { top: '12%', left: '78%' },
  { top: '65%', left: '88%' },
  // Medium (6)
  { top: '25%', left: '15%' },
  { top: '45%', left: '3%' },
  { top: '72%', left: '12%' },
  { top: '30%', left: '90%' },
  { top: '55%', left: '82%' },
  { top: '80%', left: '72%' },
  // Small (5)
  { top: '15%', left: '40%' },
  { top: '38%', left: '68%' },
  { top: '60%', left: '30%' },
  { top: '85%', left: '45%' },
  { top: '5%', left: '60%' },
]

const SIZE_PX: Record<string, number> = { large: 80, medium: 50, small: 30 }
const FONT_SIZE: Record<string, number> = { large: 18, medium: 13, small: 10 }
const LABEL_SIZE: Record<string, number> = { large: 9, medium: 7, small: 6 }

const FALLBACK_STATS: HeroStat[] = [
  // Large (3)
  { label: 'Bears Cap', value: '$69M', team: 'bears', size: 'large' },
  { label: 'CHI Wins', value: '87', size: 'large' },
  { label: 'Bears', value: '11-6', team: 'bears', size: 'large' },
  // Medium (6)
  { label: 'Bulls', value: '23-22', team: 'bulls', size: 'medium' },
  { label: 'Hawks', value: '21-22-7', team: 'blackhawks', size: 'medium' },
  { label: 'Cubs ST', value: '4-2', team: 'cubs', size: 'medium' },
  { label: 'Sox ST', value: '2-4', team: 'whitesox', size: 'medium' },
  { label: 'Bedard', value: '$950K', team: 'blackhawks', size: 'medium' },
  { label: 'Posts/wk', value: '47', size: 'medium' },
  // Small (5)
  { label: 'Teams', value: '5', size: 'small' },
  { label: 'Live', value: '0', size: 'small' },
  { label: 'PVs', value: '30M', size: 'small' },
  { label: 'Avg Comments', value: '89', size: 'small' },
  { label: 'Next Game', value: '14h', size: 'small' },
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
      {stat.size !== 'small' && (
        <span className="hero-stat-orb-label" style={{ fontSize: labelFontSize }}>
          {stat.label}
        </span>
      )}
    </div>
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
          setStats(data.stats.slice(0, 14))
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

  // Select which 14 stats to display for current cycle
  const displayStats = useMemo(() => {
    const all = allStats.current
    if (all.length <= 14) return all
    const offset = (cycleSet * 3) % all.length
    const result: HeroStat[] = []
    for (let i = 0; i < 14; i++) {
      result.push(all[(offset + i) % all.length])
    }
    return result
  }, [cycleSet])

  // On mobile, show fewer orbs
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const visibleStats = useMemo(() => {
    if (isMobile) {
      // Only large + medium on mobile (9 orbs), skip small
      return displayStats.filter(s => s.size !== 'small').slice(0, 9)
    }
    return displayStats.slice(0, 14)
  }, [displayStats, isMobile])

  return (
    <div className="hero-stats-orbs" aria-hidden="true">
      {visibleStats.map((stat, i) => (
        <StatOrb key={`${stat.label}-${stat.value}-${i}`} stat={stat} index={i} />
      ))}
    </div>
  )
}
