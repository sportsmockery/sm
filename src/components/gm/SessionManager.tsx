'use client'
import { useTheme } from '@/contexts/ThemeContext'

interface Session {
  id: string
  session_name: string
  chicago_team: string
  is_active: boolean
  num_trades: number
  num_approved: number
  num_dangerous: number
  num_failed: number
  total_improvement: number
  created_at: string
}

interface SessionManagerProps {
  sessions: Session[]
  activeSession: Session | null
  onNewSession: () => void
  onSelectSession: (session: Session) => void
}

export function SessionManager({ sessions, activeSession, onNewSession, onSelectSession }: SessionManagerProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const textColor = isDark ? '#fff' : '#1a1a1a'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {activeSession && (
        <span style={{ fontSize: '12px', color: subText }}>
          Session: <strong style={{ color: textColor }}>{activeSession.session_name}</strong>
          {' '}({activeSession.num_trades} trades)
        </span>
      )}
      <button
        onClick={onNewSession}
        style={{
          padding: '4px 12px', borderRadius: 6,
          border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
          backgroundColor: 'transparent', color: subText,
          fontSize: '11px', fontWeight: 600, cursor: 'pointer',
        }}
      >
        New Session
      </button>
    </div>
  )
}
