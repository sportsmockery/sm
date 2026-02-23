'use client'

import { useTheme } from '@/contexts/ThemeContext'

interface SystemDiagnosticProps {
  systems?: { name: string; status: 'up' | 'down' | 'checking' }[]
  onRetry?: () => void
}

export default function SystemDiagnostic({ systems, onRetry }: SystemDiagnosticProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const defaultSystems = systems || [
    { name: 'DataLab', status: 'checking' as const },
    { name: 'Headlines', status: 'checking' as const },
    { name: 'Pulse', status: 'checking' as const },
  ]

  return (
    <div
      className="h1-diagnostic h1-diagnostic-pulse"
      style={{
        background: isDark ? 'rgba(10,10,10,0.9)' : 'rgba(250,250,250,0.95)',
        maxWidth: 400,
        margin: '0 auto',
      }}
    >
      {/* Scan line */}
      <div className="h1-scan-line" />

      {/* Title */}
      <div
        style={{
          fontSize: 11,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#bc0000',
          marginBottom: 16,
          fontWeight: 600,
        }}
      >
        System Diagnostic
      </div>

      {/* Status indicators */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {defaultSystems.map((sys) => (
          <div
            key={sys.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12,
              color: isDark ? '#888' : '#666',
            }}
          >
            <span>{sys.name}</span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color:
                  sys.status === 'up'
                    ? '#00d084'
                    : sys.status === 'down'
                      ? '#bc0000'
                      : isDark
                        ? '#555'
                        : '#999',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background:
                    sys.status === 'up'
                      ? '#00d084'
                      : sys.status === 'down'
                        ? '#bc0000'
                        : isDark
                          ? '#555'
                          : '#999',
                }}
              />
              {sys.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            width: '100%',
            padding: '8px 16px',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            backgroundColor: 'transparent',
            color: '#bc0000',
            border: '1px solid #bc0000',
            borderRadius: 6,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#bc0000'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#bc0000'
          }}
        >
          Retry Connection
        </button>
      )}
    </div>
  )
}
