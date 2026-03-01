'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import type { GMTeaser } from '@/lib/dataBroker'

const SM_FEATURES = [
  {
    id: 'gm',
    name: 'GM TRADES',
    desc: 'Grade trades with Claude Opus',
    route: '/gm',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#bc0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4" />
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
      </svg>
    ),
  },
  {
    id: 'draft',
    name: 'MOCK DRAFT',
    desc: 'Simulate the 2026 Class',
    route: '/mock-draft',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#bc0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    id: 'chat',
    name: 'FAN CHAT',
    desc: 'Real-time Chicago sentiment',
    route: '/fan-chat',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#bc0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'vision',
    name: 'VISION THEATER',
    desc: 'Immersive BFR Multimedia',
    route: '/vision-theater',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#bc0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10,8 16,12 10,16" fill="#bc0000" stroke="none" />
      </svg>
    ),
  },
]

export default function FeatureGrid() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [gmTeaser, setGmTeaser] = useState<GMTeaser | null>(null)

  useEffect(() => {
    const loadTeasers = async () => {
      try {
        const res = await fetch('/api/broker?type=teasers')
        const envelope = await res.json()
        if (envelope.data?.gm) setGmTeaser(envelope.data.gm)
      } catch {
        // Silent
      }
    }
    loadTeasers()
  }, [])

  const getTeaser = (id: string): string | null => {
    if (id === 'gm' && gmTeaser) {
      const letter = gmTeaser.grade >= 90 ? 'A' : gmTeaser.grade >= 80 ? 'B+' : gmTeaser.grade >= 70 ? 'B' : gmTeaser.grade >= 60 ? 'C' : 'D'
      return `${gmTeaser.chicagoTeam.toUpperCase()} ↔ ${gmTeaser.tradePartner}: ${letter}`
    }
    return null
  }

  return (
    <section
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px 60px',
      }}
    >
      {/* Section label */}
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#bc0000',
          fontFamily: "Barlow, sans-serif",
          marginBottom: 20,
          fontWeight: 600,
        }}
      >
        The Laboratory
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
        }}
        className="h1-feature-grid"
      >
        {SM_FEATURES.map((f, i) => {
          const teaser = getTeaser(f.id)

          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.03, borderColor: '#bc0000' }}
              style={{
                background: isDark ? 'rgba(10,10,10,0.7)' : 'rgba(245,245,245,0.8)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                padding: 24,
                position: 'relative',
                overflow: 'hidden',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              className="h1-shard"
            >
              <Link
                href={`${f.route}?mode=modern`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                {/* Icon */}
                <div style={{ marginBottom: 16 }}>
                  {f.icon}
                </div>

                {/* Name */}
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    fontStyle: 'italic',
                    color: isDark ? '#ffffff' : '#111111',
                    margin: 0,
                    marginBottom: 6,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {f.name}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.01em',
                    color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
                    margin: 0,
                    marginBottom: teaser ? 12 : 16,
                    lineHeight: 1.4,
                  }}
                >
                  {f.desc}
                </p>

                {/* Live teaser */}
                {teaser && (
                  <div
                    style={{
                      fontSize: 10,
                      fontFamily: "Barlow, sans-serif",
                      color: '#bc0000',
                      fontWeight: 600,
                      padding: '4px 8px',
                      borderRadius: 4,
                      backgroundColor: 'rgba(188,0,0,0.1)',
                      marginBottom: 12,
                      display: 'inline-block',
                    }}
                  >
                    {teaser}
                  </div>
                )}

                {/* Launch link */}
                <div
                  style={{
                    fontSize: 10,
                    color: '#bc0000',
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                  }}
                >
                  LAUNCH INTERFACE
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .h1-feature-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 500px) {
          .h1-feature-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
