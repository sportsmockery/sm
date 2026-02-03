'use client'
import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AssetRow } from './AssetRow'
import { ValidationIndicator, ValidationState } from './ValidationIndicator'
import { AuditButton } from './AuditButton'
import { AuditReportCard } from './AuditReportCard'
import { useTheme } from '@/contexts/ThemeContext'
import type { DraftPick, TradeFlow } from '@/types/gm'
import type { PlayerData } from './PlayerCard'
import type { AuditResult } from '@/types/gm-audit'

interface TeamInfo {
  key: string
  name: string
  logo: string | null
  color: string
}

interface ThreeTeamTradeBoardProps {
  team1: TeamInfo  // Chicago team
  team2: TeamInfo  // Opponent 1
  team3: TeamInfo  // Opponent 2
  flows: TradeFlow[]
  onRemoveFromFlow: (fromTeam: string, toTeam: string, type: 'player' | 'pick', id: string | number) => void
  canGrade: boolean
  grading: boolean
  onGrade: () => void
  validation?: ValidationState
  gradeResult?: any
  mobile?: boolean
  onNewTrade?: () => void
  onEditTrade?: () => void
}

export function ThreeTeamTradeBoard({
  team1, team2, team3,
  flows,
  onRemoveFromFlow,
  canGrade, grading, onGrade,
  validation,
  gradeResult,
  mobile = false,
  onNewTrade,
  onEditTrade,
}: ThreeTeamTradeBoardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const panelBg = isDark ? '#111827' : '#f9fafb'
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const flowBg = isDark ? '#1f2937' : '#ffffff'
  const teams = [team1, team2, team3]

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
    link.download = `3-team-trade-grade-${gradeResult?.grade || 0}.png`
    link.href = generatedImageUrl
    link.click()
  }, [generatedImageUrl, gradeResult?.grade])

  // Get flow between two teams
  function getFlow(from: string, to: string): TradeFlow | undefined {
    return flows.find(f => f.from === from && f.to === to)
  }

  // Count assets in a flow
  function countFlowAssets(flow: TradeFlow | undefined): number {
    if (!flow) return 0
    return (flow.players?.length || 0) + (flow.picks?.length || 0)
  }

  // Get what a team is receiving (from all sources)
  function getReceiving(teamKey: string): { from: TeamInfo; flow: TradeFlow }[] {
    return teams
      .filter(t => t.key !== teamKey)
      .map(from => ({ from, flow: getFlow(from.key, teamKey) }))
      .filter(({ flow }) => flow && countFlowAssets(flow) > 0) as { from: TeamInfo; flow: TradeFlow }[]
  }

  // Get what a team is sending (to all destinations)
  function getSending(teamKey: string): { to: TeamInfo; flow: TradeFlow }[] {
    return teams
      .filter(t => t.key !== teamKey)
      .map(to => ({ to, flow: getFlow(teamKey, to.key) }))
      .filter(({ flow }) => flow && countFlowAssets(flow) > 0) as { to: TeamInfo; flow: TradeFlow }[]
  }

  // Render a team card
  function renderTeamCard(team: TeamInfo) {
    const receiving = getReceiving(team.key)
    const sending = getSending(team.key)
    const totalReceiving = receiving.reduce((sum, { flow }) => sum + countFlowAssets(flow), 0)
    const totalSending = sending.reduce((sum, { flow }) => sum + countFlowAssets(flow), 0)

    return (
      <div
        key={team.key}
        style={{
          flex: 1,
          minWidth: mobile ? 'auto' : 0,
          backgroundColor: panelBg,
          borderRadius: 12,
          border: `1px solid ${borderColor}`,
          overflow: 'hidden',
        }}
      >
        {/* Team header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 14px',
          backgroundColor: `${team.color}15`,
          borderBottom: `2px solid ${team.color}`,
        }}>
          {team.logo && (
            <img
              src={team.logo}
              alt={team.name}
              style={{ width: 32, height: 32, objectFit: 'contain' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: team.color }}>
              {team.name}
            </div>
            <div style={{ fontSize: 11, color: subText }}>
              Sends {totalSending} · Gets {totalReceiving}
            </div>
          </div>
        </div>

        {/* Sending section */}
        <div style={{ padding: 12, borderBottom: `1px solid ${borderColor}` }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#ef4444',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            SENDS OUT
          </div>

          {sending.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sending.map(({ to, flow }) => (
                <div key={to.key} style={{
                  backgroundColor: flowBg,
                  borderRadius: 8,
                  padding: 10,
                  border: `1px solid ${borderColor}`,
                }}>
                  {/* Destination badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 8,
                    fontSize: 10,
                    color: subText,
                  }}>
                    <span>To</span>
                    {to.logo && (
                      <img src={to.logo} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                    )}
                    <span style={{ fontWeight: 600, color: to.color }}>{to.name}</span>
                  </div>

                  {/* Assets */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <AnimatePresence>
                      {flow.players?.map((p: any) => (
                        <AssetRow
                          key={p.player_id}
                          type="PLAYER"
                          player={p}
                          teamColor={team.color}
                          onRemove={gradeResult ? undefined : () => onRemoveFromFlow(team.key, to.key, 'player', p.player_id)}
                          compact
                        />
                      ))}
                      {flow.picks?.map((pk: DraftPick, i: number) => (
                        <AssetRow
                          key={`pk-${i}`}
                          type="DRAFT_PICK"
                          pick={pk}
                          teamColor={team.color}
                          onRemove={gradeResult ? undefined : () => onRemoveFromFlow(team.key, to.key, 'pick', i)}
                          compact
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '12px 0',
              fontSize: 11,
              color: isDark ? '#4b5563' : '#9ca3af',
            }}>
              Not sending any assets
            </div>
          )}
        </div>

        {/* Receiving section */}
        <div style={{ padding: 12 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#22c55e',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            RECEIVES
          </div>

          {receiving.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {receiving.map(({ from, flow }) => (
                <div key={from.key} style={{
                  backgroundColor: flowBg,
                  borderRadius: 8,
                  padding: 10,
                  border: `1px solid ${borderColor}`,
                }}>
                  {/* Source badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 8,
                    fontSize: 10,
                    color: subText,
                  }}>
                    <span>From</span>
                    {from.logo && (
                      <img src={from.logo} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                    )}
                    <span style={{ fontWeight: 600, color: from.color }}>{from.name}</span>
                  </div>

                  {/* Assets (read-only, removal handled from sender) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {flow.players?.map((p: any) => (
                      <div
                        key={p.player_id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          backgroundColor: isDark ? '#374151' : '#f3f4f6',
                          borderRadius: 6,
                          borderLeft: `3px solid ${from.color}`,
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 600, color: textColor }}>{p.full_name}</span>
                        <span style={{ fontSize: 10, color: subText }}>{p.position}</span>
                      </div>
                    ))}
                    {flow.picks?.map((pk: DraftPick, i: number) => (
                      <div
                        key={`rpk-${i}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          backgroundColor: isDark ? '#374151' : '#f3f4f6',
                          borderRadius: 6,
                          borderLeft: '3px solid #8b5cf6',
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 600, color: textColor }}>
                          {pk.year} Round {pk.round}
                        </span>
                        {pk.condition && (
                          <span style={{ fontSize: 10, color: subText }}>{pk.condition}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '12px 0',
              fontSize: 11,
              color: isDark ? '#4b5563' : '#9ca3af',
            }}>
              Not receiving any assets
            </div>
          )}
        </div>
      </div>
    )
  }

  // Total assets in trade
  const totalAssets = flows.reduce((sum, f) => sum + countFlowAssets(f), 0)
  const activeFlows = flows.filter(f => countFlowAssets(f) > 0).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 3-Team Trade Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '12px 16px',
        backgroundColor: '#bc000010',
        borderRadius: 10,
        border: '1px solid #bc000030',
      }}>
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#bc0000',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          3-Team Trade
        </span>
        <span style={{ color: subText, fontSize: 12 }}>
          {totalAssets} assets · {activeFlows} active flows
        </span>
      </div>

      {/* Team Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)',
        gap: 12,
      }}>
        {renderTeamCard(team1)}
        {renderTeamCard(team2)}
        {renderTeamCard(team3)}
      </div>

      {/* Flow Diagram (visual summary) */}
      {!mobile && activeFlows > 0 && (
        <div style={{
          backgroundColor: panelBg,
          borderRadius: 12,
          border: `1px solid ${borderColor}`,
          padding: 16,
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: subText,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 12,
          }}>
            Trade Summary
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            {flows.filter(f => countFlowAssets(f) > 0).map((flow, idx) => {
              const from = teams.find(t => t.key === flow.from)
              const to = teams.find(t => t.key === flow.to)
              if (!from || !to) return null

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    backgroundColor: flowBg,
                    borderRadius: 20,
                    border: `1px solid ${borderColor}`,
                    fontSize: 11,
                  }}
                >
                  {from.logo && (
                    <img src={from.logo} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                  )}
                  <span style={{ fontWeight: 600, color: from.color }}>{from.name.split(' ').pop()}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={subText} strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {to.logo && (
                    <img src={to.logo} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                  )}
                  <span style={{ fontWeight: 600, color: to.color }}>{to.name.split(' ').pop()}</span>
                  <span style={{
                    backgroundColor: '#bc000020',
                    color: '#bc0000',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 8,
                    fontSize: 10,
                  }}>
                    {countFlowAssets(flow)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Validation */}
      {validation && validation.status !== 'idle' && (
        <ValidationIndicator validation={validation} />
      )}

      {/* Grade button */}
      {!gradeResult && (() => {
        const isBlocked = validation?.status === 'invalid'
        const canClick = canGrade && !grading && !isBlocked
        return (
          <motion.button
            whileHover={canClick ? { scale: 1.02 } : {}}
            whileTap={canClick ? { scale: 0.98 } : {}}
            onClick={onGrade}
            disabled={!canClick}
            style={{
              width: '100%',
              padding: '14px 32px',
              borderRadius: 12,
              border: 'none',
              backgroundColor: canClick ? '#bc0000' : (isDark ? '#374151' : '#d1d5db'),
              color: canClick ? '#fff' : subText,
              fontWeight: 800,
              fontSize: 16,
              cursor: canClick ? 'pointer' : 'not-allowed',
              letterSpacing: '0.5px',
            }}
          >
            {grading ? 'ANALYZING 3-TEAM TRADE...' : isBlocked ? 'FIX ISSUES TO GRADE' : 'GRADE 3-TEAM TRADE'}
          </motion.button>
        )
      })()}

      {/* Grade Result Display */}
      {gradeResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: 16 }}
        >
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
              {showShareOptions && generatedImageUrl && (
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
                      Share your 3-team trade
                    </div>
                    <div style={{ fontSize: 11, color: subText }}>
                      Download the image to share on social media
                    </div>
                  </div>

                  {/* Generated Image Preview */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: `1px solid ${borderColor}`,
                      marginBottom: 12,
                    }}>
                      <img
                        src={generatedImageUrl}
                        alt="Trade grade"
                        style={{ width: '100%', display: 'block' }}
                      />
                    </div>
                    <button
                      onClick={handleDownloadImage}
                      style={{
                        width: '100%',
                        padding: '12px 20px',
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: '#bc0000',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 14,
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {totalAssets === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 40,
          color: subText,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔄</div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Build Your 3-Team Trade</div>
          <div style={{ fontSize: 12, lineHeight: 1.5 }}>
            Click on players from any team's roster to add them to the trade.
            <br />
            A modal will ask which team should receive each player.
          </div>
        </div>
      )}
    </div>
  )
}
