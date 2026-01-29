'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayerCard, PlayerData } from './PlayerCard'
import { ValidationIndicator, ValidationState } from './ValidationIndicator'
import { useTheme } from '@/contexts/ThemeContext'

interface DraftPick {
  year: number
  round: number
  condition?: string
}

type ReceivedPlayer = PlayerData | { name: string; position: string }

function isPlayerData(p: ReceivedPlayer): p is PlayerData {
  return 'player_id' in p
}

interface TradeBoardProps {
  chicagoTeam: string
  chicagoLogo: string
  chicagoColor: string
  opponentName: string
  opponentLogo: string | null
  opponentColor: string
  playersSent: PlayerData[]
  playersReceived: ReceivedPlayer[]
  draftPicksSent: DraftPick[]
  draftPicksReceived: DraftPick[]
  onRemoveSent: (playerId: string) => void
  onRemoveReceived: (index: number) => void
  onRemoveDraftSent: (index: number) => void
  onRemoveDraftReceived: (index: number) => void
  canGrade: boolean
  grading: boolean
  onGrade: () => void
  validation?: ValidationState
}

export function TradeBoard({
  chicagoTeam, chicagoLogo, chicagoColor,
  opponentName, opponentLogo, opponentColor,
  playersSent, playersReceived,
  draftPicksSent, draftPicksReceived,
  onRemoveSent, onRemoveReceived,
  onRemoveDraftSent, onRemoveDraftReceived,
  canGrade, grading, onGrade,
  validation,
}: TradeBoardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const panelBg = isDark ? '#111827' : '#f9fafb'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Two-panel trade visualization */}
      <div style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
        {/* Chicago side */}
        <div style={{
          flex: 1, padding: 16, borderRadius: '12px 0 0 12px',
          backgroundColor: panelBg, border: `1px solid ${borderColor}`,
          borderRight: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <img src={chicagoLogo} alt={chicagoTeam} style={{ width: 28, height: 28, objectFit: 'contain' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <span style={{ fontWeight: 700, fontSize: '14px', color: chicagoColor, textTransform: 'capitalize' }}>
              {chicagoTeam} Send
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 80 }}>
            <AnimatePresence>
              {playersSent.map(p => (
                <motion.div
                  key={p.player_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{ position: 'relative' }}
                >
                  <PlayerCard player={p} compact teamColor={chicagoColor} />
                  <button
                    onClick={() => onRemoveSent(p.player_id)}
                    style={{
                      position: 'absolute', top: 4, right: 4,
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#ef4444', fontSize: '14px', fontWeight: 700,
                    }}
                  >
                    &#x2715;
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {draftPicksSent.map((pk, i) => (
              <div key={`sp-${i}`} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 10px', borderRadius: 8,
                backgroundColor: isDark ? '#374151' : '#e5e7eb',
                fontSize: '12px', color: textColor,
              }}>
                <span>{pk.year} Rd {pk.round}{pk.condition ? ` (${pk.condition})` : ''}</span>
                <button onClick={() => onRemoveDraftSent(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 700 }}>&#x2715;</button>
              </div>
            ))}
            {playersSent.length === 0 && draftPicksSent.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: subText, fontSize: '12px' }}>
                Select players from roster
              </div>
            )}
          </div>
        </div>

        {/* Center arrows */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '0 8px',
          backgroundColor: isDark ? '#0f172a' : '#e5e7eb',
          borderTop: `1px solid ${borderColor}`,
          borderBottom: `1px solid ${borderColor}`,
        }}>
          <motion.div
            animate={{ x: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={chicagoColor} strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={opponentColor} strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </motion.div>
        </div>

        {/* Opponent side */}
        <div style={{
          flex: 1, padding: 16, borderRadius: '0 12px 12px 0',
          backgroundColor: panelBg, border: `1px solid ${borderColor}`,
          borderLeft: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            {opponentLogo && (
              <img src={opponentLogo} alt={opponentName} style={{ width: 28, height: 28, objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            )}
            <span style={{ fontWeight: 700, fontSize: '14px', color: opponentColor }}>
              {opponentName || 'Select Opponent'} Send
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 80 }}>
            <AnimatePresence>
              {playersReceived.map((p, i) => (
                <motion.div
                  key={isPlayerData(p) ? p.player_id : `r-${i}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  style={{ position: 'relative' }}
                >
                  {isPlayerData(p) ? (
                    <PlayerCard player={p} compact teamColor={opponentColor} />
                  ) : (
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      padding: '8px 10px', borderRadius: 8,
                      backgroundColor: isDark ? '#374151' : '#f3f4f6',
                      border: `1px solid ${borderColor}`,
                    }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: textColor }}>{p.name}</span>
                      <span style={{ fontSize: '11px', color: subText, marginLeft: 6 }}>{p.position}</span>
                    </div>
                  )}
                  <button
                    onClick={() => onRemoveReceived(i)}
                    style={{
                      position: 'absolute', top: 4, right: 4,
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#ef4444', fontSize: '14px', fontWeight: 700,
                    }}
                  >
                    &#x2715;
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {draftPicksReceived.map((pk, i) => (
              <div key={`rp-${i}`} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 10px', borderRadius: 8,
                backgroundColor: isDark ? '#374151' : '#e5e7eb',
                fontSize: '12px', color: textColor,
              }}>
                <span>{pk.year} Rd {pk.round}{pk.condition ? ` (${pk.condition})` : ''}</span>
                <button onClick={() => onRemoveDraftReceived(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 700 }}>&#x2715;</button>
              </div>
            ))}
            {playersReceived.length === 0 && draftPicksReceived.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: subText, fontSize: '12px' }}>
                Add players to receive
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validation indicator */}
      {validation && validation.status !== 'idle' && (
        <ValidationIndicator validation={validation} />
      )}

      {/* Grade button */}
      {(() => {
        const isBlocked = validation?.status === 'invalid'
        const canClick = canGrade && !grading && !isBlocked
        return (
          <motion.button
            whileHover={canClick ? { scale: 1.02 } : {}}
            whileTap={canClick ? { scale: 0.98 } : {}}
            animate={canClick ? { scale: [1, 1.03, 1] } : {}}
            transition={canClick ? { repeat: Infinity, duration: 2 } : {}}
            onClick={onGrade}
            disabled={!canClick}
            style={{
              width: '100%',
              padding: '14px 32px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: canClick ? '#bc0000' : (isDark ? '#374151' : '#d1d5db'),
              color: canClick ? '#fff' : subText,
              fontWeight: 800,
              fontSize: '16px',
              cursor: canClick ? 'pointer' : 'not-allowed',
              letterSpacing: '0.5px',
            }}
          >
            {grading ? 'ANALYZING TRADE...' : isBlocked ? 'FIX ISSUES TO GRADE' : 'GRADE TRADE'}
          </motion.button>
        )
      })()}
    </div>
  )
}
