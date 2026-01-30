'use client'
import { useTheme } from '@/contexts/ThemeContext'
import type { TradeMode } from '@/types/gm'

interface TradeModePickerProps {
  mode: TradeMode
  onChange: (mode: TradeMode) => void
  disabled?: boolean
}

export function TradeModePicker({ mode, onChange, disabled = false }: TradeModePickerProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const bgColor = isDark ? '#1f2937' : '#f3f4f6'
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const activeColor = '#bc0000'
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <span style={{
        fontSize: 12,
        fontWeight: 600,
        color: subText,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        Trade type:
      </span>
      <div style={{
        display: 'flex',
        borderRadius: 8,
        overflow: 'hidden',
        border: `1px solid ${borderColor}`,
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}>
        <button
          onClick={() => onChange('2-team')}
          style={{
            padding: '6px 14px',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: 12,
            fontWeight: 600,
            backgroundColor: mode === '2-team' ? activeColor : bgColor,
            color: mode === '2-team' ? '#fff' : textColor,
            transition: 'all 0.15s',
          }}
        >
          2-Team
        </button>
        <button
          onClick={() => onChange('3-team')}
          style={{
            padding: '6px 14px',
            border: 'none',
            borderLeft: `1px solid ${borderColor}`,
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: 12,
            fontWeight: 600,
            backgroundColor: mode === '3-team' ? activeColor : bgColor,
            color: mode === '3-team' ? '#fff' : textColor,
            transition: 'all 0.15s',
          }}
        >
          3-Team
        </button>
      </div>
    </div>
  )
}
