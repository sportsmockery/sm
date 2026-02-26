'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import type { RumorPing } from '@/lib/bears1Data'

interface RumorRadarProps {
  rumors: RumorPing[]
}

const RING_LABELS = ['', 'CONFIRMED', 'LIKELY', 'PLAUSIBLE', 'SPECULATIVE', 'WILD']
const RING_RADII = [0, 28, 56, 84, 112, 140]
const CENTER = 160

function polarToXY(ring: number, angleDeg: number): { x: number; y: number } {
  const radius = RING_RADII[ring] || RING_RADII[5]
  const angleRad = (angleDeg * Math.PI) / 180
  return {
    x: CENTER + radius * Math.cos(angleRad),
    y: CENTER + radius * Math.sin(angleRad),
  }
}

function pingColor(ring: number): string {
  if (ring <= 2) return '#bc0000'
  if (ring === 3) return 'rgba(188,0,0,0.7)'
  return 'rgba(188,0,0,0.4)'
}

export default function RumorRadar({ rumors }: RumorRadarProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const hoveredRumor = rumors.find(r => r.id === hoveredId)

  return (
    <div style={{ position: 'relative' }}>
      {/* Section label */}
      <span
        style={{
          fontSize: 10,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#bc0000',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          display: 'block',
          marginBottom: 12,
        }}
      >
        Rumor Radar
      </span>

      <div
        style={{
          background: isDark ? 'rgba(10,10,10,0.6)' : 'rgba(250,250,250,0.8)',
          border: `1px solid ${isDark ? 'rgba(188,0,0,0.15)' : 'rgba(188,0,0,0.08)'}`,
          borderRadius: 12,
          padding: 16,
          position: 'relative',
        }}
      >
        <svg
          viewBox="0 0 320 320"
          style={{ width: '100%', maxWidth: 320, margin: '0 auto', display: 'block' }}
        >
          {/* Concentric rings */}
          {[140, 112, 84, 56, 28].map((r, i) => (
            <circle
              key={r}
              cx={CENTER}
              cy={CENTER}
              r={r}
              fill="none"
              stroke={isDark ? 'rgba(188,0,0,0.1)' : 'rgba(188,0,0,0.06)'}
              strokeWidth="0.5"
            />
          ))}

          {/* Cross-hairs */}
          <line
            x1={CENTER} y1={CENTER - 145} x2={CENTER} y2={CENTER + 145}
            stroke={isDark ? 'rgba(188,0,0,0.08)' : 'rgba(188,0,0,0.05)'}
            strokeWidth="0.5"
          />
          <line
            x1={CENTER - 145} y1={CENTER} x2={CENTER + 145} y2={CENTER}
            stroke={isDark ? 'rgba(188,0,0,0.08)' : 'rgba(188,0,0,0.05)'}
            strokeWidth="0.5"
          />

          {/* Ring labels */}
          {RING_LABELS.map((label, i) => {
            if (i === 0 || !label) return null
            const y = CENTER - RING_RADII[i] + 10
            return (
              <text
                key={label}
                x={CENTER}
                y={y}
                textAnchor="middle"
                fill={isDark ? 'rgba(188,0,0,0.25)' : 'rgba(188,0,0,0.15)'}
                fontSize="6"
                fontFamily="'Space Grotesk', sans-serif"
                fontWeight="600"
              >
                {label}
              </text>
            )
          })}

          {/* Sweep line */}
          <line
            className="b1-radar-sweep"
            x1={CENTER}
            y1={CENTER}
            x2={CENTER}
            y2={CENTER - 145}
            stroke="rgba(188,0,0,0.3)"
            strokeWidth="1"
          />

          {/* Sweep gradient cone */}
          <defs>
            <linearGradient id="sweep-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(188,0,0,0.15)" />
              <stop offset="100%" stopColor="rgba(188,0,0,0)" />
            </linearGradient>
          </defs>
          <path
            className="b1-radar-sweep"
            d={`M${CENTER},${CENTER} L${CENTER},${CENTER - 145} A145,145 0 0,1 ${CENTER + 40},${CENTER - 139} Z`}
            fill="url(#sweep-grad)"
          />

          {/* Rumor pings */}
          {rumors.map(rumor => {
            const { x, y } = polarToXY(rumor.ring, rumor.angle)
            const isHovered = hoveredId === rumor.id
            return (
              <g key={rumor.id}>
                <circle
                  className="b1-radar-ping"
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill={pingColor(rumor.ring)}
                  style={{
                    cursor: 'pointer',
                    transition: 'r 0.2s ease',
                    filter: isHovered ? 'drop-shadow(0 0 6px rgba(188,0,0,0.6))' : 'none',
                  }}
                  onMouseEnter={() => setHoveredId(rumor.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              </g>
            )
          })}

          {/* Center dot */}
          <circle cx={CENTER} cy={CENTER} r="3" fill="#bc0000" opacity="0.6" />
        </svg>

        {/* Tooltip on hover */}
        {hoveredRumor && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: 8,
              padding: '10px 14px',
              maxWidth: 280,
              background: isDark ? 'rgba(10,10,10,0.95)' : 'rgba(255,255,255,0.97)',
              border: `1px solid ${isDark ? 'rgba(188,0,0,0.2)' : 'rgba(188,0,0,0.1)'}`,
              borderRadius: 8,
              backdropFilter: 'blur(20px)',
              zIndex: 20,
              pointerEvents: 'none',
            }}
          >
            {/* Category + badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#bc0000',
                  letterSpacing: '0.1em',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {hoveredRumor.category}
              </span>
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 3,
                  background: isDark ? 'rgba(188,0,0,0.15)' : 'rgba(188,0,0,0.08)',
                  color: '#bc0000',
                  letterSpacing: '0.05em',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {hoveredRumor.auditBadge}
              </span>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: isDark ? '#ddd' : '#222',
                lineHeight: 1.35,
                marginBottom: 4,
              }}
            >
              {hoveredRumor.title.length > 80
                ? hoveredRumor.title.slice(0, 77) + '...'
                : hoveredRumor.title}
            </div>

            {/* Reliability */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${hoveredRumor.reliabilityScore}%`,
                    height: '100%',
                    background: '#bc0000',
                    borderRadius: 2,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#bc0000',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {hoveredRumor.reliabilityScore}%
              </span>
            </div>
          </div>
        )}

        {/* Rumor list below radar */}
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rumors.slice(0, 5).map(rumor => (
            <Link
              key={rumor.id}
              href={`/chicago-bears/${rumor.slug}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px',
                borderRadius: 6,
                textDecoration: 'none',
                background: hoveredId === rumor.id
                  ? isDark ? 'rgba(188,0,0,0.1)' : 'rgba(188,0,0,0.05)'
                  : 'transparent',
                transition: 'background 0.2s',
              }}
              onMouseEnter={() => setHoveredId(rumor.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: pingColor(rumor.ring),
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: isDark ? '#ccc' : '#333',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
              >
                {rumor.title}
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: '#bc0000',
                  fontFamily: "'Space Grotesk', sans-serif",
                  flexShrink: 0,
                }}
              >
                {rumor.reliabilityScore}%
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
