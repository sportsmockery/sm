'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import type { SentimentData } from '@/lib/dataBroker'

export default function SentimentMeter() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [sentiment, setSentiment] = useState<SentimentData | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/broker?type=teasers')
        const envelope = await res.json()
        if (envelope.data?.sentiment) {
          setSentiment(envelope.data.sentiment)
        }
      } catch {
        // Silent — meter shows default state
      }
    }
    load()
    const interval = setInterval(load, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const score = sentiment?.score ?? 50
  const activityLevel = sentiment?.activityLevel ?? 'low'
  const messageCount = sentiment?.messageCount ?? 0

  // SVG circular gauge math
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (circumference * score) / 100

  // Color intensity based on sentiment
  const isHighSentiment = score > 65
  const glowIntensity = isHighSentiment ? 0.4 : 0.15
  const strokeColor = '#bc0000'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: isDark ? 'rgba(10,10,10,0.7)' : 'rgba(245,245,245,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderLeft: '2px solid #bc0000',
        borderRadius: 0,
      }}
    >
      {/* Section label */}
      <div
        style={{
          fontSize: 9,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#bc0000',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          marginBottom: 16,
          alignSelf: 'flex-start',
        }}
      >
        Fan Chat Live
      </div>

      {/* Circular gauge */}
      <div style={{ position: 'relative', width: 130, height: 130 }}>
        <svg
          viewBox="0 0 100 100"
          style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}
            strokeWidth="4"
          />
          {/* Animated score arc */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 ${isHighSentiment ? 8 : 3}px rgba(188,0,0,${glowIntensity}))`,
            }}
          />
        </svg>

        {/* Centered score */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 900,
              fontStyle: 'italic',
              color: isDark ? '#ffffff' : '#111111',
              lineHeight: 1,
            }}
          >
            {score}%
          </span>
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: '#bc0000',
              textTransform: 'uppercase',
              marginTop: 2,
            }}
          >
            Hype Index
          </span>
        </div>
      </div>

      {/* Activity info */}
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <p
          style={{
            fontSize: 10,
            textTransform: 'uppercase',
            color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)',
            margin: 0,
            letterSpacing: '0.05em',
          }}
        >
          Activity: <span style={{ color: isDark ? '#fff' : '#111', fontWeight: 600 }}>{activityLevel.toUpperCase()}</span>
        </p>
        {messageCount > 0 && (
          <p
            style={{
              fontSize: 9,
              color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)',
              margin: '4px 0 0',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {messageCount} messages / 2hr
          </p>
        )}
        {sentiment?.topKeyword && (
          <p
            style={{
              fontSize: 9,
              color: '#bc0000',
              margin: '4px 0 0',
              fontWeight: 600,
              fontFamily: "'Space Grotesk', sans-serif",
              textTransform: 'uppercase',
            }}
          >
            Trending: {sentiment.topKeyword}
          </p>
        )}
      </div>
    </div>
  )
}
