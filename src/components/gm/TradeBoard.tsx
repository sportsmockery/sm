'use client'
import { useState, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PlayerData } from './PlayerCard'
import { AssetRow } from './AssetRow'
import { ValidationIndicator, ValidationState } from './ValidationIndicator'
import { DraftPickValueWidget, type DraftPickValue } from './DraftPickValueWidget'
import { VeteranTradeValueWidget, type VeteranTradeValue } from './VeteranTradeValueWidget'
import { FuturePickDiscountWidget, type FuturePickValue } from './FuturePickDiscountWidget'
import { AgingCurveWidget, type AgingCurveData } from './AgingCurveWidget'
import { AuditButton } from './AuditButton'
import { AuditReportCard } from './AuditReportCard'
import { HistoricalContextPanel, SuggestedTradePanel } from './HistoricalContextPanel'
import { useTheme } from '@/contexts/ThemeContext'
import type { DraftPick, HistoricalContext, EnhancedSuggestedTrade, LegacySuggestedTrade, LegacyHistoricalTradeRef } from '@/types/gm'
import type { AuditResult } from '@/types/gm-audit'

type ReceivedPlayer = PlayerData | { name: string; position: string }

function isPlayerData(p: ReceivedPlayer): p is PlayerData {
  return 'player_id' in p
}

// Legacy interfaces kept for backwards compatibility - types imported from @/types/gm

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
  draft_analysis?: string
  // MLB-specific fields
  service_time_analysis?: string
  arb_projection?: string
  control_timeline?: string
  cbt_impact?: string
  rejection_reason?: string
  // NFL-specific fields
  draftPickValuesSent?: DraftPickValue[]
  draftPickValuesReceived?: DraftPickValue[]
  veteranValueSent?: VeteranTradeValue[]
  veteranValueReceived?: VeteranTradeValue[]
  futurePicksSent?: FuturePickValue[]
  futurePicksReceived?: FuturePickValue[]
  agingCurvesSent?: AgingCurveData[]
  agingCurvesReceived?: AgingCurveData[]
  // Historical context - supports both legacy and enhanced formats
  historical_comparisons?: LegacyHistoricalTradeRef[]
  historical_context?: HistoricalContext | null
  // Suggested trade - supports both legacy and enhanced formats
  suggested_trade?: LegacySuggestedTrade | null
  enhanced_suggested_trade?: EnhancedSuggestedTrade | null
}

interface TradeBoardProps {
  chicagoTeam: string
  chicagoLabel?: string
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
  currentStep?: number
  mobile?: boolean
  gradeResult?: GradeResult | null
  onNewTrade?: () => void
  onEditTrade?: () => void
  sport?: 'nfl' | 'nba' | 'nhl' | 'mlb'
  // MLB salary retention & cash considerations
  salaryRetentions?: Record<string, number>
  onSalaryRetentionChange?: (playerId: string, pct: number) => void
  cashSent?: number
  cashReceived?: number
  onCashSentChange?: (amount: number) => void
  onCashReceivedChange?: (amount: number) => void
}

export function TradeBoard({
  chicagoTeam, chicagoLabel, chicagoLogo, chicagoColor,
  opponentName, opponentLogo, opponentColor,
  playersSent, playersReceived,
  draftPicksSent, draftPicksReceived,
  onRemoveSent, onRemoveReceived,
  onRemoveDraftSent, onRemoveDraftReceived,
  canGrade, grading, onGrade,
  validation,
  mobile = false,
  gradeResult,
  onNewTrade,
  onEditTrade,
  sport,
  salaryRetentions,
  onSalaryRetentionChange,
  cashSent,
  cashReceived,
  onCashSentChange,
  onCashReceivedChange,
}: TradeBoardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const panelBg = isDark ? '#111827' : '#f9fafb'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  const displayLabel = chicagoLabel || chicagoTeam

  // Share state
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const gradeCardRef = useRef<HTMLDivElement>(null)

  // Audit state
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)

  const shareUrl = gradeResult?.shared_code
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/gm/share/${gradeResult.shared_code}`
    : ''

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setShowShareOptions(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (e) {
      console.error('Failed to copy', e)
    }
  }, [shareUrl])

  const handleCreateImage = useCallback(async () => {
    if (!gradeCardRef.current || !gradeResult) return
    setGeneratingImage(true)

    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(gradeCardRef.current, {
        quality: 0.95,
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
      })
      setGeneratedImageUrl(dataUrl)
      setShowShareOptions(true)
    } catch (e) {
      console.error('Failed to generate image', e)
    } finally {
      setGeneratingImage(false)
    }
  }, [gradeResult, isDark])

  const handleDownloadImage = useCallback(() => {
    if (!generatedImageUrl) return
    const link = document.createElement('a')
    link.download = `trade-grade-${gradeResult?.grade || 0}.png`
    link.href = generatedImageUrl
    link.click()
  }, [generatedImageUrl, gradeResult?.grade])

  const socialShareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my trade grade of ${gradeResult?.grade || 0}! Built with SportsMockery Trade Simulator`)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(`My trade got a ${gradeResult?.grade || 0} grade on SportsMockery Trade Simulator`)}`,
  }

  // Check if both sides have assets
  const hasSentAssets = playersSent.length > 0 || draftPicksSent.length > 0
  const hasReceivedAssets = playersReceived.length > 0 || draftPicksReceived.length > 0
  const bothSidesHaveAssets = hasSentAssets && hasReceivedAssets

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* CSS animation for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {/* Two-panel trade visualization - always show so users can see trade details */}
      <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: 0, alignItems: 'stretch' }}>
        {/* Chicago side */}
        <div style={{
          flex: 1, padding: 16,
          borderRadius: mobile ? '12px 12px 0 0' : '12px 0 0 12px',
          backgroundColor: panelBg, border: `1px solid ${borderColor}`,
          borderRight: mobile ? `1px solid ${borderColor}` : 'none',
          borderBottom: mobile ? 'none' : `1px solid ${borderColor}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <img src={chicagoLogo} alt={displayLabel} style={{ width: 28, height: 28, objectFit: 'contain' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <span style={{ fontWeight: 700, fontSize: '14px', color: chicagoColor }}>
              {displayLabel} Send
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 80 }}>
            <AnimatePresence>
              {playersSent.map(p => (
                <AssetRow
                  key={p.player_id}
                  type="PLAYER"
                  player={p}
                  teamColor={chicagoColor}
                  onRemove={gradeResult ? undefined : () => onRemoveSent(p.player_id)}
                />
              ))}
              {draftPicksSent.map((pk, i) => (
                <AssetRow
                  key={`sp-${i}`}
                  type="DRAFT_PICK"
                  pick={pk}
                  teamColor={chicagoColor}
                  onRemove={gradeResult ? undefined : () => onRemoveDraftSent(i)}
                />
              ))}
            </AnimatePresence>
            {playersSent.length === 0 && draftPicksSent.length === 0 && !gradeResult && (
              <div style={{ textAlign: 'center', padding: 20, color: subText, fontSize: '12px' }}>
                Select players from roster
              </div>
            )}
          </div>
        </div>

        {/* Center arrows */}
        <div style={{
          display: 'flex', flexDirection: mobile ? 'row' : 'column', alignItems: 'center', justifyContent: 'center',
          padding: mobile ? '8px 0' : '0 8px',
          backgroundColor: isDark ? '#0f172a' : '#e5e7eb',
          borderTop: mobile ? 'none' : `1px solid ${borderColor}`,
          borderBottom: mobile ? 'none' : `1px solid ${borderColor}`,
          borderLeft: mobile ? `1px solid ${borderColor}` : 'none',
          borderRight: mobile ? `1px solid ${borderColor}` : 'none',
        }}>
          <div
            style={{ display: 'flex', flexDirection: mobile ? 'row' : 'column', gap: 4 }}
          >
            {mobile ? (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={chicagoColor} strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={opponentColor} strokeWidth="2" strokeLinecap="round">
                  <path d="M12 19V5M19 12l-7-7-7 7" />
                </svg>
              </>
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={chicagoColor} strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={opponentColor} strokeWidth="2" strokeLinecap="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </>
            )}
          </div>
        </div>

        {/* Opponent side */}
        <div style={{
          flex: 1, padding: 16,
          borderRadius: mobile ? '0 0 12px 12px' : '0 12px 12px 0',
          backgroundColor: panelBg, border: `1px solid ${borderColor}`,
          borderLeft: mobile ? `1px solid ${borderColor}` : 'none',
          borderTop: mobile ? 'none' : `1px solid ${borderColor}`,
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
                isPlayerData(p) ? (
                  <div key={p.player_id}>
                    <AssetRow
                      type="PLAYER"
                      player={p}
                      teamColor={opponentColor}
                      onRemove={gradeResult ? undefined : () => onRemoveReceived(i)}
                    />
                    {/* MLB Salary Retention Slider */}
                    {sport === 'mlb' && p.cap_hit && !gradeResult && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        marginLeft: 12, marginTop: 4, marginBottom: 4,
                        padding: '6px 10px', borderRadius: 6,
                        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                        fontSize: 11, color: subText,
                      }}>
                        <span style={{ whiteSpace: 'nowrap' }}>Salary Retention:</span>
                        <input
                          type="range"
                          min={0}
                          max={50}
                          step={5}
                          value={salaryRetentions?.[p.player_id] || 0}
                          onChange={e => onSalaryRetentionChange?.(p.player_id, Number(e.target.value))}
                          style={{ width: 80, cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: 600, minWidth: 30 }}>
                          {salaryRetentions?.[p.player_id] || 0}%
                        </span>
                        {(salaryRetentions?.[p.player_id] || 0) > 0 && (
                          <span style={{ color: '#22c55e' }}>
                            (${((p.cap_hit * (salaryRetentions?.[p.player_id] || 0)) / 100 / 1_000_000).toFixed(1)}M retained)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <motion.div
                    key={`r-${i}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', borderRadius: 10,
                      backgroundColor: isDark ? '#1f2937' : '#f9fafb',
                      border: `1px solid ${borderColor}`,
                      borderLeft: `3px solid ${opponentColor}`,
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '13px', color: textColor }}>{p.name}</span>
                      <span style={{ fontSize: '11px', color: subText, marginLeft: 6 }}>{p.position}</span>
                    </div>
                    {!gradeResult && (
                      <button
                        onClick={() => onRemoveReceived(i)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#ef4444', fontSize: '16px', fontWeight: 700,
                        }}
                      >
                        &times;
                      </button>
                    )}
                  </motion.div>
                )
              ))}
              {draftPicksReceived.map((pk, i) => (
                <AssetRow
                  key={`rp-${i}`}
                  type="DRAFT_PICK"
                  pick={pk}
                  teamColor={opponentColor}
                  onRemove={gradeResult ? undefined : () => onRemoveDraftReceived(i)}
                />
              ))}
            </AnimatePresence>
            {playersReceived.length === 0 && draftPicksReceived.length === 0 && !gradeResult && (
              <div style={{ textAlign: 'center', padding: 20, color: subText, fontSize: '12px' }}>
                Add players to receive
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validation and Grade section - stable layout with reserved space */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Validation indicator container - always reserve space to prevent layout shift */}
        {!gradeResult && (
          <div style={{ minHeight: bothSidesHaveAssets ? 60 : 0, transition: 'min-height 0.15s ease-out' }}>
            {bothSidesHaveAssets && validation && validation.status !== 'idle' && (
              <ValidationIndicator validation={validation} />
            )}
          </div>
        )}

        {/* MLB Cash Considerations */}
        {sport === 'mlb' && !gradeResult && (
          <div style={{
            display: 'flex', gap: 16, padding: 12, borderRadius: 10,
            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f3f4f6',
            fontSize: 12, alignItems: 'center', justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: subText }}>Cash Sent:</span>
              <input
                type="number"
                min={0}
                max={100000}
                step={5000}
                value={cashSent || 0}
                onChange={e => onCashSentChange?.(Math.min(100000, Math.max(0, Number(e.target.value))))}
                style={{
                  width: 90, padding: '4px 8px', borderRadius: 6,
                  backgroundColor: isDark ? '#374151' : '#fff',
                  border: `1px solid ${borderColor}`,
                  color: textColor, fontSize: 12,
                }}
              />
              {(cashSent || 0) > 100000 && <span style={{ color: '#ef4444', fontSize: 10 }}>Max $100K</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: subText }}>Cash Received:</span>
              <input
                type="number"
                min={0}
                max={100000}
                step={5000}
                value={cashReceived || 0}
                onChange={e => onCashReceivedChange?.(Math.min(100000, Math.max(0, Number(e.target.value))))}
                style={{
                  width: 90, padding: '4px 8px', borderRadius: 6,
                  backgroundColor: isDark ? '#374151' : '#fff',
                  border: `1px solid ${borderColor}`,
                  color: textColor, fontSize: 12,
                }}
              />
            </div>
            <span style={{ color: subText, fontSize: 10 }}>(CBA max: $100K)</span>
          </div>
        )}

        {/* Grade button - hide when we have a result */}
        {!gradeResult && (() => {
          const isBlocked = validation?.status === 'invalid'
          const canClick = canGrade && !grading && !isBlocked
          return (
            <button
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
            </button>
          )
        })()}

        {/* Inline Grade Result */}
        {gradeResult && (
          <div
            ref={gradeCardRef}
            style={{
              padding: 24,
              borderRadius: 16,
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              border: `1px solid ${borderColor}`,
            }}
          >
            {/* Grade number and status */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{
                fontSize: 64,
                fontWeight: 900,
                color: gradeResult.grade >= 70 ? '#22c55e' : gradeResult.grade >= 50 ? '#eab308' : '#ef4444',
                lineHeight: 1,
              }}>
                {gradeResult.grade}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                <span style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: '1px',
                  backgroundColor: gradeResult.status === 'accepted' ? '#22c55e20' : '#ef444420',
                  color: gradeResult.status === 'accepted' ? '#22c55e' : '#ef4444',
                }}>
                  {gradeResult.status === 'accepted' ? 'ACCEPTED' : 'REJECTED'}
                </span>
                {gradeResult.is_dangerous && (
                  <span style={{
                    padding: '6px 16px',
                    borderRadius: 20,
                    fontWeight: 800,
                    fontSize: 12,
                    backgroundColor: '#eab30820',
                    color: '#eab308',
                  }}>
                    DANGEROUS
                  </span>
                )}
              </div>
            </div>

            {/* Trade summary */}
            {gradeResult.trade_summary && (
              <div style={{
                fontSize: 13,
                color: subText,
                fontStyle: 'italic',
                textAlign: 'center',
                marginBottom: 12,
              }}>
                {gradeResult.trade_summary}
              </div>
            )}

            {/* Improvement score */}
            {typeof gradeResult.improvement_score === 'number' && (
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                textAlign: 'center',
                marginBottom: 16,
                color: gradeResult.improvement_score > 0 ? '#22c55e' : gradeResult.improvement_score < 0 ? '#ef4444' : subText,
              }}>
                Team Improvement: {gradeResult.improvement_score > 0 ? '+' : ''}{gradeResult.improvement_score}
              </div>
            )}

            {/* Rejection reason box */}
            {gradeResult.status === 'rejected' && (
              <div style={{
                marginBottom: 16,
                padding: 16,
                backgroundColor: isDark ? 'rgba(127, 29, 29, 0.3)' : 'rgba(254, 202, 202, 0.3)',
                border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
                borderRadius: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ fontSize: 20, color: '#ef4444' }}>⚠️</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      color: '#ef4444',
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      margin: 0,
                    }}>
                      Why This Trade Was Rejected
                    </h4>
                    <p style={{
                      color: textColor,
                      marginTop: 8,
                      fontSize: 13,
                      lineHeight: 1.5,
                      margin: '8px 0 0 0',
                    }}>
                      {gradeResult.rejection_reason || `Trade score of ${gradeResult.grade} is below the 70-point acceptance threshold.`}
                    </p>
                    <div style={{
                      marginTop: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 12,
                    }}>
                      <span style={{ color: subText }}>Current score:</span>
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>{gradeResult.grade}</span>
                      <span style={{ color: subText }}>|</span>
                      <span style={{ color: subText }}>Needed:</span>
                      <span style={{ color: '#22c55e', fontWeight: 700 }}>70+</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Breakdown bars */}
            {gradeResult.breakdown && (
              <div style={{ marginBottom: 16 }}>
                {[
                  { label: 'Talent Balance', value: gradeResult.breakdown.talent_balance },
                  { label: 'Contract Value', value: gradeResult.breakdown.contract_value },
                  { label: 'Team Fit', value: gradeResult.breakdown.team_fit },
                  { label: 'Future Assets', value: gradeResult.breakdown.future_assets },
                ].map((item) => (
                  <div key={item.label} style={{ marginBottom: 8 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 11,
                      fontWeight: 600,
                      color: subText,
                      marginBottom: 3,
                    }}>
                      <span>{item.label}</span>
                      <span>{Math.round(item.value * 100)}%</span>
                    </div>
                    <div style={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isDark ? '#374151' : '#e5e7eb',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${item.value * 100}%`,
                        borderRadius: 3,
                        backgroundColor: gradeResult.grade >= 70 ? '#22c55e' : gradeResult.grade >= 50 ? '#eab308' : '#ef4444',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cap Analysis */}
            {gradeResult.cap_analysis && (
              <div style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#1e293b' : '#f0fdf4',
                border: `1px solid ${isDark ? '#334155' : '#bbf7d0'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>💰</span>
                <div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isDark ? '#94a3b8' : '#64748b',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Cap Impact
                  </div>
                  <div style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: isDark ? '#e2e8f0' : '#334155',
                  }}>
                    {gradeResult.cap_analysis}
                  </div>
                </div>
              </div>
            )}

            {/* Draft Analysis */}
            {gradeResult.draft_analysis && (
              <div style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#1e1b4b' : '#f5f3ff',
                border: `1px solid ${isDark ? '#3730a3' : '#c4b5fd'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>📋</span>
                <div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isDark ? '#a5b4fc' : '#6366f1',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Draft Capital Analysis
                  </div>
                  <div style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: isDark ? '#e2e8f0' : '#334155',
                  }}>
                    {gradeResult.draft_analysis}
                  </div>
                </div>
              </div>
            )}

            {/* MLB-Specific: Luxury Tax (CBT) Impact */}
            {sport === 'mlb' && gradeResult.cbt_impact && (
              <div style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#422006' : '#fef3c7',
                border: `1px solid ${isDark ? '#92400e' : '#fbbf24'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>💰</span>
                <div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isDark ? '#fcd34d' : '#b45309',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Luxury Tax Impact
                  </div>
                  <div style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: isDark ? '#fef3c7' : '#78350f',
                  }}>
                    {gradeResult.cbt_impact}
                  </div>
                </div>
              </div>
            )}

            {/* MLB-Specific: Service Time Analysis */}
            {sport === 'mlb' && gradeResult.service_time_analysis && (
              <div style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#172554' : '#dbeafe',
                border: `1px solid ${isDark ? '#1e40af' : '#60a5fa'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>⏱️</span>
                <div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isDark ? '#93c5fd' : '#1d4ed8',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Service Time
                  </div>
                  <div style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: isDark ? '#dbeafe' : '#1e3a8a',
                  }}>
                    {gradeResult.service_time_analysis}
                  </div>
                  {gradeResult.arb_projection && (
                    <div style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: `1px solid ${isDark ? '#1e40af' : '#93c5fd'}`,
                      fontSize: 12,
                      color: isDark ? '#bfdbfe' : '#1e40af',
                    }}>
                      <strong>Arbitration Projection:</strong> {gradeResult.arb_projection}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MLB-Specific: Team Control Timeline */}
            {sport === 'mlb' && gradeResult.control_timeline && (
              <div style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 10,
                backgroundColor: isDark ? '#14532d' : '#dcfce7',
                border: `1px solid ${isDark ? '#166534' : '#4ade80'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>📅</span>
                <div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isDark ? '#86efac' : '#166534',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Team Control
                  </div>
                  <div style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: isDark ? '#dcfce7' : '#14532d',
                  }}>
                    {gradeResult.control_timeline}
                  </div>
                </div>
              </div>
            )}

            {/* NFL-Specific: Draft Pick Value Analysis */}
            {sport === 'nfl' && gradeResult.draftPickValuesSent && gradeResult.draftPickValuesSent.length > 0 && (
              <DraftPickValueWidget
                picks={gradeResult.draftPickValuesSent}
                side="sent"
                teamColor={chicagoColor}
              />
            )}

            {sport === 'nfl' && gradeResult.draftPickValuesReceived && gradeResult.draftPickValuesReceived.length > 0 && (
              <DraftPickValueWidget
                picks={gradeResult.draftPickValuesReceived}
                side="received"
                teamColor={opponentColor}
              />
            )}

            {/* NFL-Specific: Veteran Trade Value Breakdown */}
            {sport === 'nfl' && gradeResult.veteranValueSent && gradeResult.veteranValueSent.map((veteran, idx) => (
              <VeteranTradeValueWidget
                key={`vet-sent-${idx}`}
                veteran={veteran}
                teamColor={chicagoColor}
              />
            ))}

            {sport === 'nfl' && gradeResult.veteranValueReceived && gradeResult.veteranValueReceived.map((veteran, idx) => (
              <VeteranTradeValueWidget
                key={`vet-recv-${idx}`}
                veteran={veteran}
                teamColor={opponentColor}
              />
            ))}

            {/* NFL-Specific: Future Pick Discounts */}
            {sport === 'nfl' && gradeResult.futurePicksSent && gradeResult.futurePicksSent.length > 0 && (
              <FuturePickDiscountWidget
                picks={gradeResult.futurePicksSent}
                teamColor={chicagoColor}
              />
            )}

            {sport === 'nfl' && gradeResult.futurePicksReceived && gradeResult.futurePicksReceived.length > 0 && (
              <FuturePickDiscountWidget
                picks={gradeResult.futurePicksReceived}
                teamColor={opponentColor}
              />
            )}

            {/* NFL-Specific: Aging Curves */}
            {sport === 'nfl' && gradeResult.agingCurvesSent && gradeResult.agingCurvesSent.map((curve, idx) => (
              <AgingCurveWidget
                key={`aging-sent-${idx}`}
                data={curve}
                teamColor={chicagoColor}
              />
            ))}

            {sport === 'nfl' && gradeResult.agingCurvesReceived && gradeResult.agingCurvesReceived.map((curve, idx) => (
              <AgingCurveWidget
                key={`aging-recv-${idx}`}
                data={curve}
                teamColor={opponentColor}
              />
            ))}

            {/* Reasoning */}
            <div style={{
              padding: 16,
              borderRadius: 12,
              backgroundColor: isDark ? '#111827' : '#f3f4f6',
              fontSize: 13,
              lineHeight: 1.6,
              color: textColor,
              marginBottom: 16,
            }}>
              {gradeResult.reasoning}
            </div>

            {/* Historical Context - supports both enhanced and legacy formats */}
            {(gradeResult.historical_context || (gradeResult.historical_comparisons && gradeResult.historical_comparisons.length > 0)) && (
              <div style={{ marginBottom: 16 }}>
                <HistoricalContextPanel
                  historicalContext={gradeResult.historical_context}
                  historicalComparisons={gradeResult.historical_comparisons}
                  isDark={isDark}
                  isRejected={gradeResult.status === 'rejected' || gradeResult.grade < 70}
                />
              </div>
            )}

            {/* Suggested Trade Improvements - supports both enhanced and legacy formats (for rejected trades) */}
            {gradeResult.grade < 70 && (gradeResult.enhanced_suggested_trade || gradeResult.suggested_trade) && (
              <div style={{ marginBottom: 16 }}>
                <SuggestedTradePanel
                  enhancedSuggestion={gradeResult.enhanced_suggested_trade}
                  legacySuggestion={gradeResult.suggested_trade}
                  isDark={isDark}
                  chicagoTeam={displayLabel}
                  opponentTeam={opponentName}
                />
              </div>
            )}

            {/* Audit Report */}
            {auditResult && (
              <AuditReportCard
                audit={auditResult}
                gmGrade={gradeResult.grade}
                isDark={isDark}
              />
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', width: '100%', maxWidth: 600, margin: '0 auto' }}>
              <button
                onClick={onNewTrade}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#bc0000',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                New Trade
              </button>
              {onEditTrade && (
                <button
                  onClick={onEditTrade}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `2px solid ${borderColor}`,
                    backgroundColor: 'transparent',
                    color: textColor,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Edit
                </button>
              )}
              {gradeResult.shared_code && !auditResult && (
                <AuditButton
                  tradeId={gradeResult.shared_code}
                  onAuditComplete={setAuditResult}
                  isDark={isDark}
                />
              )}
              {gradeResult.shared_code && (
                <>
                  <button
                    onClick={handleCopyLink}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: `2px solid ${copied ? '#22c55e' : borderColor}`,
                      backgroundColor: copied ? '#22c55e10' : 'transparent',
                      color: copied ? '#22c55e' : textColor,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {copied ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Share
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCreateImage}
                    disabled={generatingImage}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: `2px solid ${borderColor}`,
                      backgroundColor: generatingImage ? (isDark ? '#374151' : '#e5e7eb') : 'transparent',
                      color: textColor,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: generatingImage ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      opacity: generatingImage ? 0.7 : 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {generatingImage ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                        </svg>
                        ...
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                          <polyline points="21 15 16 10 5 21" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Image
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Share Options Panel */}
            <AnimatePresence>
              {showShareOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    marginTop: 16,
                    padding: 20,
                    borderRadius: 12,
                    backgroundColor: isDark ? '#111827' : '#f3f4f6',
                    border: `1px solid ${borderColor}`,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: textColor, marginBottom: 4 }}>
                      Share your trade
                    </div>
                    <div style={{ fontSize: 11, color: subText }}>
                      Show off your GM skills on social media
                    </div>
                  </div>

                  {/* Generated Image Preview */}
                  {generatedImageUrl && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: `1px solid ${borderColor}`,
                        marginBottom: 12,
                      }}>
                        <img
                          src={generatedImageUrl}
                          alt="Trade Grade"
                          style={{ width: '100%', display: 'block' }}
                        />
                      </div>
                      <button
                        onClick={handleDownloadImage}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          borderRadius: 8,
                          border: 'none',
                          backgroundColor: '#22c55e',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                          <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Download Image
                      </button>
                    </div>
                  )}

                  {/* Social Icons */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                    {/* Twitter/X */}
                    <a
                      href={socialShareLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: 48, height: 48,
                        borderRadius: 12,
                        backgroundColor: '#000000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        transition: 'transform 0.2s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>

                    {/* Facebook */}
                    <a
                      href={socialShareLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: 48, height: 48,
                        borderRadius: 12,
                        backgroundColor: '#1877F2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        transition: 'transform 0.2s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>

                    {/* Reddit */}
                    <a
                      href={socialShareLinks.reddit}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: 48, height: 48,
                        borderRadius: 12,
                        backgroundColor: '#FF4500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        transition: 'transform 0.2s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                      </svg>
                    </a>

                    {/* Copy Link */}
                    <button
                      onClick={handleCopyLink}
                      style={{
                        width: 48, height: 48,
                        borderRadius: 12,
                        backgroundColor: isDark ? '#374151' : '#e5e7eb',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={textColor} strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>

                  {/* Promo text */}
                  <div style={{
                    marginTop: 16,
                    padding: '12px 16px',
                    borderRadius: 8,
                    backgroundColor: '#bc000010',
                    border: '1px solid #bc000030',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 12, color: '#bc0000', fontWeight: 600 }}>
                      Build your own trades at SportsMockery.com/gm
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => setShowShareOptions(false)}
                    style={{
                      display: 'block',
                      margin: '12px auto 0',
                      padding: '8px 16px',
                      borderRadius: 6,
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: subText,
                      fontWeight: 500,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Watermark for image generation */}
            <div style={{
              marginTop: 12,
              textAlign: 'center',
              fontSize: 11,
              color: subText,
              opacity: 0.7,
            }}>
              Built with SportsMockery Trade Simulator
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
