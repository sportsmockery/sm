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
const CONN_DIST = 150
const FRAME_INTERVAL = 33 // ~30fps

export function CyberParticleBg() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!wrapper || !canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animId = 0
    let lastFrame = 0
    let particles: Particle[] = []
    let w = 0
    let h = 0
    const isMobile = window.innerWidth < 768
    const count = isMobile ? MOBILE_COUNT : COUNT

    function resize() {
      w = wrapper!.clientWidth
      h = wrapper!.clientHeight
      if (w === 0 || h === 0) return
      canvas!.width = w
      canvas!.height = h
    }

    function createParticles() {
      if (w === 0 || h === 0) return
      particles = []
      for (let i = 0; i < count; i++) {
        const speed = 0.12 + Math.random() * 0.18
        const angle = Math.random() * Math.PI * 2
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          radius: 1.2 + Math.random() * 1.5,
          alpha: 0.15 + Math.random() * 0.2,
        })
      }
    }

    function draw(now: number) {
      animId = requestAnimationFrame(draw)
      if (w === 0 || h === 0) return
      if (now - lastFrame < FRAME_INTERVAL) return
      lastFrame = now

      ctx!.clearRect(0, 0, w, h)

      const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
      const fade = isDark ? 1 : 0.55

      // Update positions
      for (const p of particles) {
        p.x += p.dx
        p.y += p.dy
        if (p.x < -5) p.x = w + 5
        else if (p.x > w + 5) p.x = -5
        if (p.y < -5) p.y = h + 5
        else if (p.y > h + 5) p.y = -5
      }

      // Batch connection lines into 3 alpha buckets
      const connDistSq = CONN_DIST * CONN_DIST
      ctx!.lineWidth = 0.6
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

      const lineAlphas = [0.03, 0.06, 0.1]
      for (let b = 0; b < 3; b++) {
        if (buckets[b].length === 0) continue
        ctx!.beginPath()
        for (const [x1, y1, x2, y2] of buckets[b]) {
          ctx!.moveTo(x1, y1)
          ctx!.lineTo(x2, y2)
        }
        ctx!.strokeStyle = `rgba(0, 212, 255, ${lineAlphas[b] * fade})`
        ctx!.stroke()
      }

      // Batch dots (2 groups: dim + bright)
      const dimDots: Particle[] = []
      const brightDots: Particle[] = []
      for (const p of particles) {
        if (p.alpha > 0.22) brightDots.push(p)
        else dimDots.push(p)
      }

      for (const group of [dimDots, brightDots]) {
        if (group.length === 0) continue
        const a = group === dimDots ? 0.15 : 0.3
        ctx!.fillStyle = `rgba(0, 212, 255, ${a * fade})`
        ctx!.beginPath()
        for (const p of group) {
          ctx!.moveTo(p.x + p.radius, p.y)
          ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        }
        ctx!.fill()
      }
    }

    // Use ResizeObserver so canvas sizes correctly even if layout isn't ready on mount
    const ro = new ResizeObserver(() => {
      const hadParticles = particles.length > 0
      resize()
      if (!hadParticles) {
        createParticles()
        animId = requestAnimationFrame(draw)
      } else {
        createParticles()
      }
    })
    ro.observe(wrapper)

    const handleVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(animId); animId = 0 }
      else if (!animId) { lastFrame = 0; animId = requestAnimationFrame(draw) }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  )
}
