'use client'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface LeaderboardEntry {
  user_email: string
  total_score: number
  trades_count: number
  avg_grade: number
  total_improvement?: number
  best_grade?: number
  accepted_count?: number
  rejected_count?: number
  dangerous_count?: number
  streak?: number
  favorite_team?: string
}

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[]
  currentUserEmail?: string
}

export function LeaderboardPanel({ entries, currentUserEmail }: LeaderboardPanelProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textColor = 'var(--sm-text)'
  const subText = 'var(--sm-text-muted)'
  const cardBg = isDark ? '#1f293780' : '#f9fafb'

  const rankColors = ['#eab308', '#9ca3af', '#b45309']

  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: textColor, marginBottom: 16 }}>Leaderboard</h2>
      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 24, color: subText, fontSize: '13px' }}>
          No trades yet. Be the first GM!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map((entry, i) => {
            const isCurrentUser = entry.user_email === currentUserEmail
            return (
              <motion.div
                key={entry.user_email}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  backgroundColor: cardBg,
                  border: isCurrentUser ? '2px solid #bc0000' : '1px solid transparent',
                }}
              >
                {/* Rank */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: i < 3 ? `${rankColors[i]}20` : 'transparent',
                  color: i < 3 ? rankColors[i] : subText,
                  fontWeight: 800, fontSize: i < 3 ? '14px' : '12px',
                }}>
                  {i === 0 ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={rankColors[0]} stroke="none">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  ) : (
                    `#${i + 1}`
                  )}
                </div>

                {/* User info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 600, color: textColor,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {entry.user_email.split('@')[0]}
                    {isCurrentUser && <span style={{ fontSize: '10px', color: '#bc0000', marginLeft: 4 }}>(you)</span>}
                  </div>
                  <div style={{ fontSize: '10px', color: subText }}>
                    {entry.trades_count} trades | avg {entry.avg_grade}
                    {entry.streak ? ` | ${entry.streak} streak` : ''}
                  </div>
                </div>

                {/* Score */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#bc0000' }}>
                    {entry.total_score}
                  </div>
                  {entry.total_improvement != null && entry.total_improvement !== 0 && (
                    <div style={{
                      fontSize: '10px', fontWeight: 600,
                      color: entry.total_improvement > 0 ? '#22c55e' : '#ef4444',
                    }}>
                      {entry.total_improvement > 0 ? '+' : ''}{Number(entry.total_improvement).toFixed(1)} imp
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
