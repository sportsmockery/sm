'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

interface PlayerHoloCardProps {
  name: string
  position: string
  jerseyNumber: number | null
  headshotUrl: string | null
  slug: string
  isActive: boolean
  statLine?: string
  onClick?: () => void
}

export default function PlayerHoloCard({
  name,
  position,
  jerseyNumber,
  headshotUrl,
  slug,
  isActive,
  statLine,
  onClick,
}: PlayerHoloCardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const cardContent = (
    <div
      className={`b1-holo-card ${isActive ? 'b1-holo-card-active' : ''}`}
      onClick={onClick}
      style={{
        width: isActive ? 180 : 160,
        minHeight: isActive ? 240 : 210,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        background: isDark ? 'rgba(10,10,10,0.8)' : 'rgba(255,255,255,0.85)',
        borderRadius: 12,
        transform: isActive ? 'scale(1.08)' : 'scale(1)',
        opacity: isActive ? 1 : 0.65,
        filter: isActive ? 'none' : 'brightness(0.7)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        flexShrink: 0,
      }}
    >
      {/* Headshot */}
      <div
        style={{
          width: isActive ? 90 : 72,
          height: isActive ? 90 : 72,
          borderRadius: '50%',
          overflow: 'hidden',
          border: `2px solid ${isActive ? '#bc0000' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDark ? 'rgba(20,20,20,0.9)' : 'rgba(240,240,240,0.9)',
          transition: 'all 0.3s ease',
          position: 'relative',
        }}
      >
        {headshotUrl ? (
          <Image
            src={headshotUrl}
            alt={name}
            width={isActive ? 90 : 72}
            height={isActive ? 90 : 72}
            style={{
              objectFit: 'cover',
              filter: headshotUrl.includes('espn') || headshotUrl.includes('a.espncdn')
                ? 'grayscale(1) brightness(0.4) contrast(1.2)'
                : 'none',
            }}
            unoptimized
          />
        ) : (
          /* Wireframe silhouette fallback with jersey number */
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <svg
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', height: '100%' }}
            >
              {/* Head */}
              <circle cx="30" cy="18" r="10" stroke="#bc0000" strokeWidth="1" fill="none" />
              {/* Shoulders */}
              <path d="M14 38 Q14 28 22 26 L30 24 L38 26 Q46 28 46 38" stroke="#bc0000" strokeWidth="1" fill="none" />
              {/* Body */}
              <line x1="30" y1="34" x2="30" y2="52" stroke="#bc0000" strokeWidth="1" />
            </svg>
            {jerseyNumber !== null && (
              <span
                style={{
                  position: 'absolute',
                  top: '52%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 14,
                  fontWeight: 900,
                  color: '#bc0000',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {jerseyNumber}
              </span>
            )}
          </div>
        )}
        {/* Red overlay for non-SM headshots */}
        {headshotUrl && (headshotUrl.includes('espn') || headshotUrl.includes('a.espncdn')) && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(188,0,0,0.15)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Jersey number badge */}
      {jerseyNumber !== null && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#bc0000',
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: '0.05em',
          }}
        >
          #{jerseyNumber}
        </span>
      )}

      {/* Name */}
      <span
        style={{
          fontSize: isActive ? 14 : 12,
          fontWeight: 700,
          color: isDark ? '#fff' : '#111',
          textAlign: 'center',
          lineHeight: 1.2,
          transition: 'font-size 0.3s ease',
        }}
      >
        {name}
      </span>

      {/* Position */}
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: isDark ? '#888' : '#666',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {position}
      </span>

      {/* Stat line for active card */}
      {isActive && statLine && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#bc0000',
            fontFamily: "'Space Grotesk', sans-serif",
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          {statLine}
        </span>
      )}
    </div>
  )

  // Active card links to player page
  if (isActive) {
    return (
      <Link href={`/chicago-bears/players/${slug}`} style={{ textDecoration: 'none' }}>
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
