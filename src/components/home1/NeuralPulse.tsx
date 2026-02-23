'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'

interface NeuralPulseProps {
  headlines?: { title: string; teamKey: string | null }[]
}

// Generate ECG-style path
function generateECGPath(
  width: number,
  height: number,
  amplitude: number,
  phase: number,
  midY: number
): string {
  const segments: string[] = []
  const segmentWidth = 200 // pixels per heartbeat cycle
  const numCycles = Math.ceil(width / segmentWidth) + 1
  const startX = -(phase % segmentWidth)

  for (let i = 0; i < numCycles; i++) {
    const x = startX + i * segmentWidth

    // P wave (small bump)
    segments.push(
      `L ${x + 30} ${midY}`,
      `Q ${x + 40} ${midY - amplitude * 0.15} ${x + 50} ${midY}`
    )

    // QRS complex (sharp spike)
    segments.push(
      `L ${x + 70} ${midY}`,
      `L ${x + 78} ${midY + amplitude * 0.2}`, // Q dip
      `L ${x + 88} ${midY - amplitude}`, // R peak
      `L ${x + 98} ${midY + amplitude * 0.35}`, // S dip
      `L ${x + 108} ${midY}` // back to baseline
    )

    // T wave (rounded bump)
    segments.push(
      `L ${x + 130} ${midY}`,
      `Q ${x + 145} ${midY - amplitude * 0.25} ${x + 160} ${midY}`
    )

    // Flatline
    segments.push(`L ${x + segmentWidth} ${midY}`)
  }

  return `M ${startX} ${midY} ${segments.join(' ')}`
}

export default function NeuralPulse({ headlines = [] }: NeuralPulseProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const path2Ref = useRef<SVGPathElement>(null)
  const path3Ref = useRef<SVGPathElement>(null)
  const phaseRef = useRef(0)
  const amplitudeRef = useRef(40)
  const targetAmplitudeRef = useRef(40)
  const animFrameRef = useRef<number>(0)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [hovered, setHovered] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 1200, height: 200 })

  // Fetch pulse data periodically
  useEffect(() => {
    const fetchPulse = async () => {
      try {
        const res = await fetch('/api/broker?type=pulse')
        const envelope = await res.json()
        if (envelope.data?.engagementScore) {
          // Map 0-100 score to amplitude 20-80
          targetAmplitudeRef.current = 20 + (envelope.data.engagementScore / 100) * 60
        }
      } catch {
        // Silent fail — keep current amplitude
      }
    }

    fetchPulse()
    const interval = setInterval(fetchPulse, 30000)
    return () => clearInterval(interval)
  }, [])

  // Measure container
  useEffect(() => {
    const measure = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width || 1200, height: 200 })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Animation loop — direct DOM mutation for 60fps
  const animate = useCallback(() => {
    phaseRef.current += 1.2

    // Smooth amplitude lerp
    amplitudeRef.current += (targetAmplitudeRef.current - amplitudeRef.current) * 0.05

    const { width, height } = dimensions
    const midY = height / 2
    const amp = amplitudeRef.current

    if (pathRef.current) {
      pathRef.current.setAttribute('d', generateECGPath(width, height, amp, phaseRef.current, midY))
    }

    // Expanded tiers when hovered
    if (hovered) {
      if (path2Ref.current) {
        path2Ref.current.setAttribute(
          'd',
          generateECGPath(width, height, amp * 0.6, phaseRef.current * 0.8, midY - 40)
        )
      }
      if (path3Ref.current) {
        path3Ref.current.setAttribute(
          'd',
          generateECGPath(width, height, amp * 0.4, phaseRef.current * 1.2, midY + 40)
        )
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)
  }, [dimensions, hovered])

  useEffect(() => {
    // Check reduced motion preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      // Static line
      const midY = dimensions.height / 2
      if (pathRef.current) {
        pathRef.current.setAttribute('d', `M 0 ${midY} L ${dimensions.width} ${midY}`)
      }
      return
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [animate, dimensions])

  const strokeColor = '#bc0000'

  return (
    <section
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background label */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(var(--h1-nav-height) + 24px)',
          left: 24,
          fontSize: 10,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: isDark ? '#333' : '#ccc',
          fontFamily: "'SF Mono', 'Fira Code', monospace",
        }}
      >
        Neural Pulse Monitor
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width="100%"
        height={200}
        style={{ maxWidth: '100%', overflow: 'visible' }}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="none"
      >
        {/* Glow filter (dark mode only) */}
        {isDark && (
          <defs>
            <filter id="h1-ecg-glow" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}

        {/* Primary ECG line */}
        <path
          ref={pathRef}
          fill="none"
          stroke={strokeColor}
          strokeWidth={isDark ? 2 : 2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={isDark ? 'url(#h1-ecg-glow)' : undefined}
          style={{ transition: 'opacity 0.3s' }}
        />

        {/* Expanded tiers (hovered) */}
        <AnimatePresence>
          {hovered && (
            <>
              <motion.path
                ref={path2Ref}
                fill="none"
                stroke={strokeColor}
                strokeWidth={1}
                strokeLinecap="round"
                opacity={0.4}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
              <motion.path
                ref={path3Ref}
                fill="none"
                stroke={strokeColor}
                strokeWidth={1}
                strokeLinecap="round"
                opacity={0.3}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            </>
          )}
        </AnimatePresence>
      </svg>

      {/* Headline overlay on hover */}
      <AnimatePresence>
        {hovered && headlines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              bottom: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              maxWidth: 600,
              padding: '0 24px',
            }}
          >
            {headlines.slice(0, 2).map((h, i) => (
              <div
                key={i}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                  marginBottom: 6,
                  letterSpacing: '-0.01em',
                }}
              >
                {h.title.length > 80 ? h.title.slice(0, 77) + '...' : h.title}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          color: isDark ? '#333' : '#ccc',
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontFamily: "'SF Mono', 'Fira Code', monospace",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.div>
    </section>
  )
}
