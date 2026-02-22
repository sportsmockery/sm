'use client'

import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'

const PARTICLE_COUNT = 8

interface Particle {
  left: string
  top: string
  size: number
  duration: string
  delay: string
  opacity: number
}

export default function HeroParticles() {
  const prefersReducedMotion = useReducedMotion()

  const particles = useMemo<Particle[]>(() => {
    // Deterministic positions — no Math.random so SSR matches client
    const positions = [
      { left: '12%', top: '20%' },
      { left: '88%', top: '15%' },
      { left: '25%', top: '70%' },
      { left: '72%', top: '65%' },
      { left: '45%', top: '10%' },
      { left: '60%', top: '80%' },
      { left: '8%', top: '50%' },
      { left: '92%', top: '45%' },
    ]

    return positions.slice(0, PARTICLE_COUNT).map((pos, i) => ({
      left: pos.left,
      top: pos.top,
      size: 3 + (i % 3),
      duration: `${3 + (i % 4)}s`,
      delay: `${i * 0.4}s`,
      opacity: 0.08 + (i % 3) * 0.04,
    }))
  }, [])

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
      {particles.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: 'var(--sm-red, #bc0000)',
            opacity: p.opacity,
            animation: `hero-particle-float ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  )
}
