// src/components/homepage/HeroStatsOrbs.tsx
// Canvas-based Chicago six-pointed stars that drift across the hero background
// with fading trail lines behind each star.
'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  dx: number
  dy: number
  radius: number
  trail: { x: number; y: number }[]
  cyan: boolean
  rotation: number
  rotationSpeed: number
}

const STAR_COUNT = 62
const MOBILE_STAR_COUNT = 37
const TRAIL_LENGTH = 150

/** Draw a Chicago-style 6-pointed star with pointed tips */
function drawChicagoStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
  rotation: number,
) {
  const innerRadius = outerRadius * 0.45
  const points = 6
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius
    const angle = rotation + (i * Math.PI) / points - Math.PI / 2
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
}

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
    let stars: Star[] = []
    const isMobile = window.innerWidth < 768
    const count = isMobile ? MOBILE_STAR_COUNT : STAR_COUNT

    function resize() {
      const parent = canvas!.parentElement
      if (!parent) return
      canvas!.width = parent.offsetWidth
      canvas!.height = parent.offsetHeight
    }

    function createStars() {
      stars = []
      for (let i = 0; i < count; i++) {
        const speed = 0.2 + Math.random() * 0.5 // 0.2–0.7 px/frame (gentle drift)
        const angle = Math.random() * Math.PI * 2
        stars.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          radius: 3 + Math.random() * 4, // 3–7px
          trail: [],
          cyan: i % 3 === 0,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.008,
        })
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

      for (let s = 0; s < stars.length; s++) {
        const star = stars[s]

        // Store trail position
        star.trail.push({ x: star.x, y: star.y })
        if (star.trail.length > TRAIL_LENGTH) star.trail.shift()

        // Draw trail — 5 bands with fading opacity
        const len = star.trail.length
        if (len > 4) {
          const bands = 5
          const bandSize = Math.floor(len / bands)
          for (let b = 0; b < bands; b++) {
            const start = b * bandSize
            const end = b === bands - 1 ? len - 1 : (b + 1) * bandSize
            if (end - start < 2) continue
            const progress = (b + 1) / bands
            const alpha = progress * (isDark ? 0.05 : 0.025)

            ctx!.beginPath()
            ctx!.moveTo(star.trail[start].x, star.trail[start].y)
            for (let i = start + 1; i <= end; i++) {
              ctx!.lineTo(star.trail[i].x, star.trail[i].y)
            }
            ctx!.strokeStyle = star.cyan ? `rgba(0, 212, 255, ${alpha})` : `rgba(188, 0, 0, ${alpha})`
            ctx!.lineWidth = Math.max(1, star.radius * 0.4)
            ctx!.lineCap = 'round'
            ctx!.lineJoin = 'round'
            ctx!.stroke()
          }
        }

        // Draw star glow (very subtle)
        ctx!.fillStyle = star.cyan
          ? (isDark ? 'rgba(0, 212, 255, 0.02)' : 'rgba(0, 212, 255, 0.012)')
          : (isDark ? 'rgba(188, 0, 0, 0.02)' : 'rgba(188, 0, 0, 0.012)')
        drawChicagoStar(ctx!, star.x, star.y, star.radius * 2, star.rotation)

        // Draw star core
        ctx!.fillStyle = star.cyan
          ? (isDark ? 'rgba(0, 212, 255, 0.12)' : 'rgba(0, 212, 255, 0.08)')
          : (isDark ? 'rgba(188, 0, 0, 0.12)' : 'rgba(188, 0, 0, 0.08)')
        drawChicagoStar(ctx!, star.x, star.y, star.radius, star.rotation)

        // Move star
        star.x += star.dx
        star.y += star.dy
        star.rotation += star.rotationSpeed

        // Bounce off edges
        if (star.x - star.radius < 0) { star.x = star.radius; star.dx = Math.abs(star.dx) }
        if (star.x + star.radius > canvas!.width) { star.x = canvas!.width - star.radius; star.dx = -Math.abs(star.dx) }
        if (star.y - star.radius < 0) { star.y = star.radius; star.dy = Math.abs(star.dy) }
        if (star.y + star.radius > canvas!.height) { star.y = canvas!.height - star.radius; star.dy = -Math.abs(star.dy) }
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    createStars()
    draw()

    const handleResize = () => { resize(); createStars() }
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
