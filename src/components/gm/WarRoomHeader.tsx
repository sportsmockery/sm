'use client'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface WarRoomHeaderProps {
  gmScore: number
  rank?: number
  sessionName?: string
  numApproved?: number
  numDangerous?: number
  numFailed?: number
}

export function WarRoomHeader({ gmScore, rank, sessionName, numApproved = 0, numDangerous = 0, numFailed = 0 }: WarRoomHeaderProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'

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
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
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
