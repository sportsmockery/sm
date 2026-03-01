// src/components/homepage/HeroStatsOrbs.tsx
// 100 canvas-based orbs that slowly bounce around the hero background.
// Each orb has a bright red glow and a fading trail line behind it.
'use client'

import { useEffect, useRef } from 'react'

interface Orb {
  x: number
  y: number
  dx: number
  dy: number
  radius: number
  trail: { x: number; y: number }[]
}

const ORB_COUNT = 100
const MOBILE_ORB_COUNT = 50
const TRAIL_LENGTH = 150 // positions stored per orb

export function HeroStatsOrbs() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let orbs: Orb[] = []
    const isMobile = window.innerWidth < 768
    const count = isMobile ? MOBILE_ORB_COUNT : ORB_COUNT

    function resize() {
      const parent = canvas!.parentElement
      if (!parent) return
      canvas!.width = parent.offsetWidth
      canvas!.height = parent.offsetHeight
    }

    function createOrbs() {
      orbs = []
      for (let i = 0; i < count; i++) {
        const speed = 0.3 + Math.random() * 0.7 // 0.3–1.0 px/frame (slow)
        const angle = Math.random() * Math.PI * 2
        orbs.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          radius: 2 + Math.random() * 3, // 2–5px
          trail: [],
        })
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

      for (let o = 0; o < orbs.length; o++) {
        const orb = orbs[o]

        // Store trail position
        orb.trail.push({ x: orb.x, y: orb.y })
        if (orb.trail.length > TRAIL_LENGTH) orb.trail.shift()

        // Draw trail — split into 5 bands with fading opacity (oldest = transparent, newest = visible)
        const len = orb.trail.length
        if (len > 4) {
          const bands = 5
          const bandSize = Math.floor(len / bands)
          for (let b = 0; b < bands; b++) {
            const start = b * bandSize
            const end = b === bands - 1 ? len - 1 : (b + 1) * bandSize
            if (end - start < 2) continue
            const progress = (b + 1) / bands // 0.2 (oldest) → 1.0 (newest)
            const alpha = progress * (isDark ? 0.30 : 0.18)

            ctx!.beginPath()
            ctx!.moveTo(orb.trail[start].x, orb.trail[start].y)
            for (let i = start + 1; i <= end; i++) {
              ctx!.lineTo(orb.trail[i].x, orb.trail[i].y)
            }
            ctx!.strokeStyle = `rgba(188, 0, 0, ${alpha})`
            ctx!.lineWidth = Math.max(1, orb.radius * 0.5)
            ctx!.lineCap = 'round'
            ctx!.lineJoin = 'round'
            ctx!.stroke()
          }
        }

        // Draw orb glow (larger faint circle)
        ctx!.beginPath()
        ctx!.arc(orb.x, orb.y, orb.radius * 3, 0, Math.PI * 2)
        ctx!.fillStyle = isDark ? 'rgba(188, 0, 0, 0.18)' : 'rgba(188, 0, 0, 0.12)'
        ctx!.fill()

        // Draw orb core (bright)
        ctx!.beginPath()
        ctx!.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
        ctx!.fillStyle = isDark ? 'rgba(188, 0, 0, 0.75)' : 'rgba(188, 0, 0, 0.55)'
        ctx!.fill()

        // Move orb
        orb.x += orb.dx
        orb.y += orb.dy

        // Bounce off edges
        if (orb.x - orb.radius < 0) { orb.x = orb.radius; orb.dx = Math.abs(orb.dx) }
        if (orb.x + orb.radius > canvas!.width) { orb.x = canvas!.width - orb.radius; orb.dx = -Math.abs(orb.dx) }
        if (orb.y - orb.radius < 0) { orb.y = orb.radius; orb.dy = Math.abs(orb.dy) }
        if (orb.y + orb.radius > canvas!.height) { orb.y = canvas!.height - orb.radius; orb.dy = -Math.abs(orb.dy) }
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    createOrbs()
    draw()

    const handleResize = () => { resize(); createOrbs() }
    window.addEventListener('resize', handleResize)

    const handleVisibility = () => {
      if (document.hidden) cancelAnimationFrame(animId)
      else draw()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <div className="hero-stats-orbs" aria-hidden="true">
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
    </div>
  )
}
