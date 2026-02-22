'use client'

import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'

const ORB_COUNT = 120

interface Orb {
  left: string
  top: string
  size: number
  color: string
  opacity: number
  duration: string
  delay: string
  driftX: number
  driftY: number
  blur: number
}

// Seeded pseudo-random for SSR safety (no Math.random)
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

interface HeroParticlesProps {
  accentColor?: string
}

export default function HeroParticles({ accentColor = '#bc0000' }: HeroParticlesProps) {
  const prefersReducedMotion = useReducedMotion()

  const orbs = useMemo<Orb[]>(() => {
    const rand = seededRandom(73)

    // Parse accent color to rgb components for variation
    const hex = accentColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    return Array.from({ length: ORB_COUNT }, (_, i) => {
      const rn = rand()
      const rn2 = rand()
      const rn3 = rand()
      const rn4 = rand()
      const rn5 = rand()
      const rn6 = rand()
      const rn7 = rand()

      // Size distribution: 75% tiny (1-4px), 20% small (4-8px), 5% medium (8-14px)
      let size: number
      if (rn < 0.75) {
        size = 1 + rn2 * 3
      } else if (rn < 0.95) {
        size = 4 + rn2 * 4
      } else {
        size = 8 + rn2 * 6
      }

      // Color variations based on accent — visible opacity range
      let color: string
      const baseOpacity = 0.25 + rn3 * 0.45
      if (rn4 < 0.5) {
        // Team accent color
        color = `rgba(${r},${g},${b},${baseOpacity})`
      } else if (rn4 < 0.75) {
        // Slightly brighter version
        const br = Math.min(255, r + 60)
        const bg2 = Math.min(255, g + 40)
        const bb = Math.min(255, b + 40)
        color = `rgba(${br},${bg2},${bb},${baseOpacity * 0.85})`
      } else if (rn4 < 0.9) {
        // Warm tint
        color = `rgba(${Math.min(255, r + 80)},${Math.min(255, g + 60)},${Math.min(255, b + 20)},${baseOpacity * 0.7})`
      } else {
        // White highlight
        color = `rgba(255,255,255,${baseOpacity * 0.5})`
      }

      // Drift distances (how far the orb floats)
      const driftX = (rn5 - 0.5) * 60
      const driftY = (rn6 - 0.5) * 50

      // Blur for larger orbs
      const blur = size > 6 ? 1 + (size - 6) * 0.4 : 0

      return {
        left: `${rn7 * 100}%`,
        top: `${rand() * 100}%`,
        size,
        color,
        opacity: 1,
        duration: `${6 + rand() * 14}s`,
        delay: `${-rand() * 20}s`,
        driftX,
        driftY,
        blur,
      }
    })
  }, [accentColor])

  if (prefersReducedMotion) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      {orbs.map((orb, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: orb.left,
            top: orb.top,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            borderRadius: '50%',
            background: orb.color,
            filter: orb.blur > 0 ? `blur(${orb.blur}px)` : undefined,
            animation: `hero-orb-drift ${orb.duration} ease-in-out infinite`,
            animationDelay: orb.delay,
            willChange: 'transform, opacity',
            ['--drift-x' as string]: `${orb.driftX}px`,
            ['--drift-y' as string]: `${orb.driftY}px`,
          }}
        />
      ))}
    </div>
  )
}
