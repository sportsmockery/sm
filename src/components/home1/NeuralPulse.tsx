'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'

interface NeuralPulseProps {
  headlines?: { title: string; teamKey: string | null }[]
  onSearchSubmit?: (query: string) => void
}

// Generate ECG-style path
function generateECGPath(
  width: number,
  amplitude: number,
  phase: number,
  midY: number
): string {
  const segments: string[] = []
  const segmentWidth = 200
  const numCycles = Math.ceil(width / segmentWidth) + 1
  const startX = -(phase % segmentWidth)

  for (let i = 0; i < numCycles; i++) {
    const x = startX + i * segmentWidth
    segments.push(
      `L ${x + 30} ${midY}`,
      `Q ${x + 40} ${midY - amplitude * 0.15} ${x + 50} ${midY}`,
      `L ${x + 70} ${midY}`,
      `L ${x + 78} ${midY + amplitude * 0.2}`,
      `L ${x + 88} ${midY - amplitude}`,
      `L ${x + 98} ${midY + amplitude * 0.35}`,
      `L ${x + 108} ${midY}`,
      `L ${x + 130} ${midY}`,
      `Q ${x + 145} ${midY - amplitude * 0.25} ${x + 160} ${midY}`,
      `L ${x + segmentWidth} ${midY}`
    )
  }
  return `M ${startX} ${midY} ${segments.join(' ')}`
}

export default function NeuralPulse({ headlines = [], onSearchSubmit }: NeuralPulseProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const phaseRef = useRef(0)
  const amplitudeRef = useRef(40)
  const targetAmplitudeRef = useRef(40)
  const animFrameRef = useRef<number>(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [shattered, setShattered] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResult, setSearchResult] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: 1200, height: 200 })

  // Fetch pulse data
  useEffect(() => {
    const fetchPulse = async () => {
      try {
        const res = await fetch('/api/broker?type=pulse')
        const envelope = await res.json()
        if (envelope.data?.engagementScore) {
          targetAmplitudeRef.current = 20 + (envelope.data.engagementScore / 100) * 60
        }
      } catch {
        // Silent
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

  // Animation loop
  const animate = useCallback(() => {
    if (shattered) return // Stop animating when shattered

    phaseRef.current += 1.2
    amplitudeRef.current += (targetAmplitudeRef.current - amplitudeRef.current) * 0.05

    const midY = dimensions.height / 2
    if (pathRef.current) {
      pathRef.current.setAttribute('d', generateECGPath(dimensions.width, amplitudeRef.current, phaseRef.current, midY))
    }
    animFrameRef.current = requestAnimationFrame(animate)
  }, [dimensions, shattered])

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || shattered) {
      if (!shattered && pathRef.current) {
        const midY = dimensions.height / 2
        pathRef.current.setAttribute('d', `M 0 ${midY} L ${dimensions.width} ${midY}`)
      }
      return
    }
    animFrameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [animate, dimensions, shattered])

  // Focus search input after shatter
  useEffect(() => {
    if (shattered && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 500)
    }
  }, [shattered])

  const handleShatter = () => {
    if (!shattered) {
      cancelAnimationFrame(animFrameRef.current)
      setShattered(true)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchLoading) return

    setSearchLoading(true)
    setSearchResult(null)

    if (onSearchSubmit) {
      onSearchSubmit(searchQuery)
    }

    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      })
      const data = await res.json()
      setSearchResult(data.response || 'No results found.')
    } catch {
      setSearchResult('Connection error. Try again.')
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <section
      style={{
        minHeight: shattered ? 'auto' : '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: shattered ? 'default' : 'pointer',
        overflow: 'hidden',
        padding: shattered ? '100px 24px 40px' : 0,
        transition: 'min-height 0.6s ease, padding 0.6s ease',
      }}
      onClick={!shattered ? handleShatter : undefined}
    >
      {/* Background label */}
      <div
        style={{
          position: shattered ? 'relative' : 'absolute',
          top: shattered ? 'auto' : 'calc(var(--h1-nav-height) + 24px)',
          left: shattered ? 'auto' : 24,
          fontSize: 10,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: isDark ? '#333' : '#ccc',
          fontFamily: "Barlow, sans-serif",
          marginBottom: shattered ? 16 : 0,
          alignSelf: shattered ? 'flex-start' : 'auto',
        }}
      >
        {shattered ? 'Scout Intelligence Search' : 'Neural Pulse Monitor — Click to Activate'}
      </div>

      {/* ECG SVG — fades out on shatter */}
      <AnimatePresence>
        {!shattered && (
          <motion.div
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%' }}
          >
            <svg
              ref={svgRef}
              width="100%"
              height={200}
              style={{ maxWidth: '100%', overflow: 'visible' }}
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              preserveAspectRatio="none"
            >
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
              <path
                ref={pathRef}
                fill="none"
                stroke="#bc0000"
                strokeWidth={isDark ? 2 : 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={isDark ? 'url(#h1-ecg-glow)' : undefined}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shattered state: Search bar */}
      <AnimatePresence>
        {shattered && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '100%',
              maxWidth: 700,
            }}
          >
            {/* Search bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 20px',
                background: isDark ? 'rgba(10,10,10,0.8)' : 'rgba(245,245,245,0.9)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isDark ? 'rgba(188,0,0,0.3)' : 'rgba(188,0,0,0.15)'}`,
                borderRadius: 0,
                boxShadow: isDark ? '0 0 30px rgba(188,0,0,0.1)' : '0 4px 20px rgba(0,0,0,0.08)',
              }}
              className="h1-shard"
            >
              <Image
                src="/downloads/scout-v2.png"
                alt="Scout"
                width={24}
                height={24}
                style={{ borderRadius: '50%', flexShrink: 0 }}
              />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="What does Scout need to find for you today?"
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: 500,
                  color: isDark ? '#fff' : '#111',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                  letterSpacing: '-0.01em',
                }}
              />
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                style={{
                  padding: '8px 20px',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  backgroundColor: '#bc0000',
                  color: '#ffffff',
                  border: 'none',
                  cursor: searchLoading ? 'not-allowed' : 'pointer',
                  opacity: searchLoading ? 0.5 : 1,
                  fontFamily: 'inherit',
                  flexShrink: 0,
                }}
              >
                {searchLoading ? '...' : 'SEARCH'}
              </button>
            </div>

            {/* Search result */}
            {searchResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: 16,
                  padding: 20,
                  background: isDark ? 'rgba(10,10,10,0.6)' : 'rgba(245,245,245,0.8)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: isDark ? '#ddd' : '#333',
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              >
                {searchResult}
              </motion.div>
            )}

            {/* Headline chips below search */}
            {headlines.length > 0 && !searchResult && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginTop: 16,
                }}
              >
                {headlines.slice(0, 4).map((h, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    onClick={() => {
                      setSearchQuery(h.title)
                      searchInputRef.current?.focus()
                    }}
                    style={{
                      padding: '6px 14px',
                      fontSize: 11,
                      fontWeight: 500,
                      color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      borderRadius: 0,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s',
                      textAlign: 'left',
                      lineHeight: 1.3,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#bc0000' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
                  >
                    {h.title.length > 50 ? h.title.slice(0, 47) + '...' : h.title}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll indicator — only before shatter */}
      {!shattered && (
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            color: isDark ? '#444' : '#bbb',
            fontSize: 10,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontFamily: "Barlow, sans-serif",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>Click the pulse to activate</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      )}
    </section>
  )
}
