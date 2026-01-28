'use client'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import type { PlayerData } from '@/components/gm/PlayerCard'

interface GradeResult {
  grade: number
  reasoning: string
  status: string
  is_dangerous: boolean
  trade_summary?: string
  improvement_score?: number
  shared_code?: string
  breakdown?: {
    talent_balance: number
    contract_value: number
    team_fit: number
    future_assets: number
  }
  cap_analysis?: string
}

interface DraftPick {
  year: number
  round: number
  condition?: string
}

interface TradeDetails {
  chicagoTeam: string
  chicagoLogo?: string
  chicagoColor?: string
  opponentName: string
  opponentLogo?: string | null
  opponentColor?: string
  playersSent: PlayerData[]
  playersReceived: Array<PlayerData | { name: string; position: string }>
  draftPicksSent: DraftPick[]
  draftPicksReceived: DraftPick[]
}

interface GradeRevealProps {
  result: GradeResult | null
  show: boolean
  onClose: () => void
  onNewTrade: () => void
  tradeDetails?: TradeDetails
}

function formatMoney(value: number | null | undefined): string {
  if (!value) return ''
  return `$${(value / 1_000_000).toFixed(1)}M`
}

function ConfettiParticle({ delay }: { delay: number }) {
  const colors = ['#bc0000', '#22c55e', '#eab308', '#3b82f6', '#a855f7']
  const color = colors[Math.floor(Math.random() * colors.length)]
  const x = Math.random() * 100
  const size = 4 + Math.random() * 6

  return (
    <motion.div
      initial={{ opacity: 1, y: -20, x: `${x}vw`, rotate: 0 }}
      animate={{ opacity: 0, y: '100vh', rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
      transition={{ duration: 2 + Math.random(), delay, ease: 'easeIn' }}
      style={{
        position: 'fixed', top: 0, left: 0, zIndex: 100,
        width: size, height: size * 1.5,
        backgroundColor: color, borderRadius: 1,
      }}
    />
  )
}

export function GradeReveal({ result, show, onClose, onNewTrade, tradeDetails }: GradeRevealProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [phase, setPhase] = useState(0) // 0=loading, 1=number, 2=status, 3=breakdown, 4=reasoning
  const [displayGrade, setDisplayGrade] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (!show || !result) {
      setPhase(0)
      setDisplayGrade(0)
      setShowConfetti(false)
      return
    }

    // Phase 0: Loading text (already showing)
    const t1 = setTimeout(() => {
      // Phase 1: Start counting
      setPhase(1)
      let current = 0
      const target = result.grade
      const step = Math.max(1, Math.ceil(target / 40))
      const interval = setInterval(() => {
        current = Math.min(current + step, target)
        setDisplayGrade(current)
        if (current >= target) {
          clearInterval(interval)
          // Phase 2: Show status
          setTimeout(() => setPhase(2), 300)
          // Phase 3: Show breakdown
          setTimeout(() => setPhase(3), 800)
          // Phase 4: Show reasoning
          setTimeout(() => setPhase(4), 1400)
          // Confetti for high grades
          if (target >= 85) {
            setTimeout(() => setShowConfetti(true), 500)
          }
        }
      }, 35)
      return () => clearInterval(interval)
    }, 1200)

    return () => clearTimeout(t1)
  }, [show, result])

  if (!show || !result) return null

  const gradeColor = result.grade >= 75 ? '#22c55e' : result.grade >= 50 ? '#eab308' : '#ef4444'
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  const breakdownItems = result.breakdown ? [
    { label: 'Talent Balance', value: result.breakdown.talent_balance },
    { label: 'Contract Value', value: result.breakdown.contract_value },
    { label: 'Team Fit', value: result.breakdown.team_fit },
    { label: 'Future Assets', value: result.breakdown.future_assets },
  ] : []

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={phase >= 4 ? onClose : undefined}
        style={{
          position: 'fixed', inset: 0, zIndex: 60,
          backgroundColor: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}
      >
        {/* Confetti */}
        {showConfetti && Array.from({ length: 40 }).map((_, i) => (
          <ConfettiParticle key={i} delay={i * 0.04} />
        ))}

        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          onClick={e => e.stopPropagation()}
          style={{
            backgroundColor: isDark ? '#111827' : '#fff',
            borderRadius: 20,
            padding: 32,
            maxWidth: 500,
            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* Loading phase */}
          {phase === 0 && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ fontSize: '18px', fontWeight: 700, color: subText, padding: '40px 0' }}
            >
              ANALYZING TRADE...
            </motion.div>
          )}

          {/* Grade number */}
          {phase >= 1 && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ fontSize: '80px', fontWeight: 900, color: gradeColor, lineHeight: 1 }}
            >
              {displayGrade}
            </motion.div>
          )}

          {/* Status badge */}
          {phase >= 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}
            >
              <span style={{
                padding: '6px 20px', borderRadius: 20,
                fontWeight: 800, fontSize: '14px', letterSpacing: '1px',
                backgroundColor: result.status === 'accepted' ? '#22c55e20' : '#ef444420',
                color: result.status === 'accepted' ? '#22c55e' : '#ef4444',
              }}>
                {result.status === 'accepted' ? 'ACCEPTED' : 'REJECTED'}
              </span>
              {result.is_dangerous && (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1, 0.3, 1] }}
                  transition={{ duration: 1 }}
                  style={{
                    padding: '6px 16px', borderRadius: 20,
                    fontWeight: 800, fontSize: '14px',
                    backgroundColor: '#eab30820', color: '#eab308',
                  }}
                >
                  DANGEROUS
                </motion.span>
              )}
            </motion.div>
          )}

          {/* Trade summary */}
          {phase >= 2 && result.trade_summary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: 12, fontSize: '13px', color: subText, fontStyle: 'italic' }}
            >
              {result.trade_summary}
            </motion.div>
          )}

          {/* Improvement score */}
          {phase >= 2 && typeof result.improvement_score === 'number' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginTop: 8, fontSize: '13px', fontWeight: 700,
                color: result.improvement_score > 0 ? '#22c55e' : result.improvement_score < 0 ? '#ef4444' : subText,
              }}
            >
              Team Improvement: {result.improvement_score > 0 ? '+' : ''}{result.improvement_score}
            </motion.div>
          )}

          {/* Trade Details */}
          {phase >= 3 && tradeDetails && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 16,
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: 12,
                textAlign: 'left',
              }}
            >
              {/* Players Sent */}
              <div style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#1f2937' : '#f9fafb',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                  paddingBottom: 8,
                  borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                }}>
                  {tradeDetails.chicagoLogo && (
                    <img
                      src={tradeDetails.chicagoLogo}
                      alt=""
                      style={{ width: 20, height: 20, objectFit: 'contain' }}
                    />
                  )}
                  <span style={{ fontSize: '12px', fontWeight: 700, color: tradeDetails.chicagoColor || textColor, textTransform: 'uppercase' }}>
                    {tradeDetails.chicagoTeam} Sends
                  </span>
                </div>
                {tradeDetails.playersSent.map((player, idx) => (
                  <div key={`sent-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    {player.headshot_url ? (
                      <img
                        src={player.headshot_url}
                        alt=""
                        style={{ width: 32, height: 32, borderRadius: 16, objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div style={{
                        width: 32, height: 32, borderRadius: 16,
                        backgroundColor: tradeDetails.chicagoColor || '#666',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 700, color: '#fff',
                      }}>
                        {player.full_name.charAt(0)}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {player.full_name}
                      </div>
                      <div style={{ fontSize: '10px', color: subText }}>
                        {player.position} {player.age ? `· ${player.age}y` : ''}
                      </div>
                      {(player.cap_hit || player.contract_years) && (
                        <div style={{ fontSize: '9px', color: subText }}>
                          {formatMoney(player.cap_hit)}
                          {player.contract_years ? ` · ${player.contract_years}yr` : ''}
                          {player.is_rookie_deal ? ' (Rookie)' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {tradeDetails.draftPicksSent.map((pick, idx) => (
                  <div key={`pick-sent-${idx}`} style={{ fontSize: '11px', color: subText, marginBottom: 4, paddingLeft: 4 }}>
                    📄 {pick.year} Round {pick.round}{pick.condition ? ` (${pick.condition})` : ''}
                  </div>
                ))}
              </div>

              {/* Swap Icon */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '20px', color: subText }}>⇄</span>
              </div>

              {/* Players Received */}
              <div style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#1f2937' : '#f9fafb',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                  paddingBottom: 8,
                  borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                }}>
                  {tradeDetails.opponentLogo && (
                    <img
                      src={tradeDetails.opponentLogo}
                      alt=""
                      style={{ width: 20, height: 20, objectFit: 'contain' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  )}
                  <span style={{ fontSize: '12px', fontWeight: 700, color: tradeDetails.opponentColor || textColor, textTransform: 'uppercase' }}>
                    {tradeDetails.opponentName} Sends
                  </span>
                </div>
                {tradeDetails.playersReceived.map((player, idx) => {
                  const isFullPlayer = 'player_id' in player
                  const playerData = player as PlayerData
                  return (
                    <div key={`recv-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      {isFullPlayer && playerData.headshot_url ? (
                        <img
                          src={playerData.headshot_url}
                          alt=""
                          style={{ width: 32, height: 32, borderRadius: 16, objectFit: 'cover' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : (
                        <div style={{
                          width: 32, height: 32, borderRadius: 16,
                          backgroundColor: tradeDetails.opponentColor || '#666',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 700, color: '#fff',
                        }}>
                          {(isFullPlayer ? playerData.full_name : player.name).charAt(0)}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {isFullPlayer ? playerData.full_name : player.name}
                        </div>
                        <div style={{ fontSize: '10px', color: subText }}>
                          {player.position} {isFullPlayer && playerData.age ? `· ${playerData.age}y` : ''}
                        </div>
                        {isFullPlayer && (playerData.cap_hit || playerData.contract_years) && (
                          <div style={{ fontSize: '9px', color: subText }}>
                            {formatMoney(playerData.cap_hit)}
                            {playerData.contract_years ? ` · ${playerData.contract_years}yr` : ''}
                            {playerData.is_rookie_deal ? ' (Rookie)' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {tradeDetails.draftPicksReceived.map((pick, idx) => (
                  <div key={`pick-recv-${idx}`} style={{ fontSize: '11px', color: subText, marginBottom: 4, paddingLeft: 4 }}>
                    📄 {pick.year} Round {pick.round}{pick.condition ? ` (${pick.condition})` : ''}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Breakdown bars */}
          {phase >= 3 && breakdownItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: 20, textAlign: 'left' }}
            >
              {breakdownItems.map((item, i) => (
                <div key={item.label} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: subText, marginBottom: 3 }}>
                    <span>{item.label}</span>
                    <span>{Math.round(item.value * 100)}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      style={{ height: '100%', borderRadius: 3, backgroundColor: gradeColor }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Cap Analysis */}
          {phase >= 3 && result.cap_analysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 16, padding: 12, borderRadius: 10,
                backgroundColor: isDark ? '#1e293b' : '#f0fdf4',
                border: `1px solid ${isDark ? '#334155' : '#bbf7d0'}`,
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}
            >
              <span style={{ fontSize: '18px', flexShrink: 0 }}>$</span>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Cap Impact
                </div>
                <div style={{ fontSize: '13px', lineHeight: 1.5, color: isDark ? '#e2e8f0' : '#334155' }}>
                  {result.cap_analysis}
                </div>
              </div>
            </motion.div>
          )}

          {/* Reasoning */}
          {phase >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 20, padding: 16, borderRadius: 12,
                backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                fontSize: '13px', lineHeight: 1.6, color: textColor,
                textAlign: 'left',
              }}
            >
              {result.reasoning}
            </motion.div>
          )}

          {/* Action buttons */}
          {phase >= 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}
            >
              <button
                onClick={onNewTrade}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  backgroundColor: '#bc0000', color: '#fff',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                }}
              >
                New Trade
              </button>
              {result.shared_code && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/gm/share/${result.shared_code}`)
                  }}
                  style={{
                    padding: '10px 24px', borderRadius: 10,
                    border: `2px solid ${isDark ? '#374151' : '#d1d5db'}`,
                    backgroundColor: 'transparent', color: textColor,
                    fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                  }}
                >
                  Share Trade
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  padding: '10px 24px', borderRadius: 10,
                  border: `2px solid ${isDark ? '#374151' : '#d1d5db'}`,
                  backgroundColor: 'transparent', color: textColor,
                  fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                }}
              >
                Close
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
