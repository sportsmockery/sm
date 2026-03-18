// src/components/gm/CyberParticleBg.tsx
// Lightweight canvas particle network — cyan ambient background for /gm
// Optimized: low count, batched draws, 30fps cap, no gradients, DPR=1
'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  dx: number
  dy: number
  radius: number
  alpha: number
}

const COUNT = 45
const MOBILE_COUNT = 22
const CONN_DIST = 140
const FRAME_INTERVAL = 33 // ~30fps

export function CyberParticleBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animId: number
    let lastFrame = 0
    let particles: Particle[] = []
    const isMobile = window.innerWidth < 768
    const count = isMobile ? MOBILE_COUNT : COUNT

    function resize() {
      const parent = canvas!.parentElement
      if (!parent) return
      // DPR=1 intentionally — faded ambient bg doesn't need retina
      canvas!.width = parent.offsetWidth
      canvas!.height = parent.offsetHeight
    }

    function createParticles() {
      const w = canvas!.width
      const h = canvas!.height
      particles = []
      for (let i = 0; i < count; i++) {
        const speed = 0.1 + Math.random() * 0.2
        const angle = Math.random() * Math.PI * 2
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          radius: 1 + Math.random() * 1.5,
          alpha: 0.1 + Math.random() * 0.15,
        })
      }
    }

    function draw(now: number) {
      animId = requestAnimationFrame(draw)

      // Throttle to ~30fps
      if (now - lastFrame < FRAME_INTERVAL) return
      lastFrame = now

      const w = canvas!.width
      const h = canvas!.height
      ctx!.clearRect(0, 0, w, h)

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
      const fade = isDark ? 1 : 0.5

      // Update positions
      for (const p of particles) {
        p.x += p.dx
        p.y += p.dy
        if (p.x < -5) p.x = w + 5
        else if (p.x > w + 5) p.x = -5
        if (p.y < -5) p.y = h + 5
        else if (p.y > h + 5) p.y = -5
      }

      // Batch all connection lines into one path
      const connDistSq = CONN_DIST * CONN_DIST
      ctx!.lineWidth = 0.5
      ctx!.lineCap = 'round'

      // Group lines by approximate alpha to reduce state changes (3 buckets)
      const buckets: [number, number, number, number][][] = [[], [], []]
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distSq = dx * dx + dy * dy
          if (distSq < connDistSq) {
            const ratio = 1 - Math.sqrt(distSq) / CONN_DIST
            const bucket = ratio > 0.6 ? 2 : ratio > 0.3 ? 1 : 0
            buckets[bucket].push([particles[i].x, particles[i].y, particles[j].x, particles[j].y])
          }
        }
      }

      const alphas = [0.02, 0.04, 0.07]
      for (let b = 0; b < 3; b++) {
        if (buckets[b].length === 0) continue
        ctx!.beginPath()
        for (const [x1, y1, x2, y2] of buckets[b]) {
          ctx!.moveTo(x1, y1)
          ctx!.lineTo(x2, y2)
        }
        ctx!.strokeStyle = `rgba(0, 212, 255, ${alphas[b] * fade})`
        ctx!.stroke()
      }

      // Batch all dots into one path per alpha group (2 groups: dim + bright)
      const dimDots: Particle[] = []
      const brightDots: Particle[] = []
      for (const p of particles) {
        if (p.alpha > 0.18) brightDots.push(p)
        else dimDots.push(p)
      }

      for (const group of [dimDots, brightDots]) {
        if (group.length === 0) continue
        const a = group === dimDots ? 0.1 : 0.2
        ctx!.fillStyle = `rgba(0, 212, 255, ${a * fade})`
        ctx!.beginPath()
        for (const p of group) {
          ctx!.moveTo(p.x + p.radius, p.y)
          ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        }
        ctx!.fill()
      }
    }

    resize()
    createParticles()
    animId = requestAnimationFrame(draw)

    const handleResize = () => { resize(); createParticles() }
    window.addEventListener('resize', handleResize)

    const handleVisibility = () => {
      if (document.hidden) cancelAnimationFrame(animId)
      else { lastFrame = 0; animId = requestAnimationFrame(draw) }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
    </div>
  )
}
