'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface TeamOption {
  key: string
  name: string
  logo: string | null
  color: string
}

interface DestinationPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (destinationTeamKey: string) => void
  fromTeam: TeamOption
  teams: TeamOption[]
  playerName: string
  assetType?: 'player' | 'pick'
}

export function DestinationPicker({
  open,
  onClose,
  onSelect,
  fromTeam,
  teams,
  playerName,
  assetType = 'player',
}: DestinationPickerProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const bgOverlay = 'rgba(0,0,0,0.6)'
  const bgModal = isDark ? '#111827' : '#ffffff'
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const textColor = isDark ? '#ffffff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  // Filter out the source team - can't send to self
  const destinationTeams = teams.filter(t => t.key !== fromTeam.key)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            backgroundColor: bgOverlay,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: bgModal,
              borderRadius: 16,
              border: `1px solid ${borderColor}`,
              width: '100%',
              maxWidth: 400,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${borderColor}`,
              textAlign: 'center',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: textColor, margin: 0 }}>
                Where is {playerName} going?
              </h3>
              <p style={{ fontSize: 12, color: subText, marginTop: 4, marginBottom: 0 }}>
                Select which team receives this {assetType}
              </p>
            </div>

            {/* Source team indicator */}
            <div style={{
              padding: '12px 20px',
              backgroundColor: isDark ? '#1f2937' : '#f9fafb',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderBottom: `1px solid ${borderColor}`,
            }}>
              <span style={{ fontSize: 11, color: subText, fontWeight: 600, textTransform: 'uppercase' }}>From:</span>
              {fromTeam.logo && (
                <img src={fromTeam.logo} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
              )}
              <span style={{ fontWeight: 600, fontSize: 13, color: fromTeam.color }}>{fromTeam.name}</span>
            </div>

            {/* Destination options */}
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: subText, fontWeight: 600, textTransform: 'uppercase', marginBottom: 12 }}>
                Send to:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {destinationTeams.map(team => (
                  <motion.button
                    key={team.key}
                    whileHover={{ scale: 1.02, backgroundColor: isDark ? '#374151' : '#f3f4f6' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelect(team.key)
                      onClose()
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: `2px solid ${borderColor}`,
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    {team.logo ? (
                      <img src={team.logo} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                    ) : (
                      <div style={{
                        width: 36, height: 36, borderRadius: 18,
                        backgroundColor: team.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: '#fff',
                      }}>
                        {team.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: team.color }}>
                        {team.name}
                      </div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={subText} strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Cancel button */}
            <div style={{ padding: '12px 16px', borderTop: `1px solid ${borderColor}` }}>
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: isDark ? '#374151' : '#e5e7eb',
                  color: textColor,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
