'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface WarRoomHeaderProps {
  gmScore: number
  rank?: number
  sessionName?: string
  numApproved?: number
  numDangerous?: number
  numFailed?: number
  onOpenPreferences?: () => void
}

export function WarRoomHeader({ gmScore, rank, sessionName, numApproved = 0, numDangerous = 0, numFailed = 0, onOpenPreferences }: WarRoomHeaderProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textColor = 'var(--sm-text)'
  const subText = 'var(--sm-text-muted)'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 16, marginBottom: 16,
    }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: textColor, margin: 0, letterSpacing: '-0.5px' }}>
          WAR ROOM
        </h1>
        <p style={{ fontSize: '13px', color: subText, margin: '4px 0 0' }}>
          {sessionName || 'Propose trades and get them graded by AI'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {/* Analytics link */}
        <Link
          href="/gm/analytics"
          title="View Analytics"
          style={{
            padding: 8,
            borderRadius: 8,
            border: `1px solid ${'var(--sm-border)'}`,
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={subText}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 20V10M12 20V4M6 20v-6" />
          </svg>
        </Link>

        {/* Preferences button */}
        {onOpenPreferences && (
          <button
            onClick={onOpenPreferences}
            title="GM Preferences"
            style={{
              padding: 8,
              borderRadius: 8,
              border: `1px solid ${'var(--sm-border)'}`,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={subText}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        )}

        {/* Session stats */}
        {(numApproved > 0 || numDangerous > 0 || numFailed > 0) && (
          <div style={{ display: 'flex', gap: 8 }}>
            <StatChip value={numApproved} label="Approved" color="#22c55e" />
            <StatChip value={numDangerous} label="Dangerous" color="#eab308" />
            <StatChip value={numFailed} label="Failed" color="#ef4444" />
          </div>
        )}

        {/* GM Score */}
        <div style={{
          textAlign: 'center', padding: '8px 20px', borderRadius: 12,
          backgroundColor: isDark ? '#1f293780' : '#f3f4f6',
          border: `1px solid ${'var(--sm-border)'}`,
        }}>
          <motion.div
            key={gmScore}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            style={{ fontSize: '28px', fontWeight: 900, color: '#bc0000', lineHeight: 1 }}
          >
            {gmScore}
          </motion.div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: subText, marginTop: 2 }}>
            GM Score{rank ? ` | #${rank}` : ''}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatChip({ value, label, color }: { value: number; label: string; color: string }) {
  if (value === 0) return null
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '4px 10px', borderRadius: 8,
      backgroundColor: `${color}10`,
    }}>
      <span style={{ fontSize: '16px', fontWeight: 800, color }}>{value}</span>
      <span style={{ fontSize: '9px', color, fontWeight: 600 }}>{label}</span>
    </div>
  )
}
