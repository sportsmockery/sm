'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import type {
  SimulationResult, TeamStanding, PlayoffMatchup, SimulatedGame, SeasonSegment,
  PlayerSimImpact, V3TradeAnalysis, V3KeyPlayerImpact, V3PlayerArchetype,
  V3_ARCHETYPE_COLORS,
} from '@/types/gm'

interface SimulationResultsProps {
  result: SimulationResult
  tradeCount: number
  teamName: string
  teamColor: string
  onSimulateAgain: () => void
  onClose: () => void
}

type Tab = 'overview' | 'analysis' | 'games' | 'standings' | 'playoffs' | 'summary'

function formatGameDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

const ARCHETYPE_COLORS: Record<string, string> = {
  'Franchise Changer': '#FFD700',
  'Role Player Upgrade': '#3b82f6',
  'Culture Setter': '#8b5cf6',
  'Boom-or-Bust': '#f97316',
  'Declining Star': '#6b7280',
  'System Player': '#14b8a6',
}

export function SimulationResults({
  result,
  tradeCount,
  teamName,
  teamColor,
  onSimulateAgain,
  onClose,
}: SimulationResultsProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const textColor = 'var(--sm-text)'
  const subText = 'var(--sm-text-muted)'
  const borderColor = 'var(--sm-border)'
  const cardBg = 'var(--sm-card)'
  const surfaceBg = isDark ? '#111827' : '#f9fafb'

  const { baseline, modified, gmScore, scoreBreakdown, standings, playoffs, championship, seasonSummary,
    games, segments, playerImpacts, baselinePowerRating, modifiedPowerRating, previousSeasonRecord } = result

  // V3 fields
  const isV3AI = result.simulation_version === 'v3-ai'
  const hasTradeImpactDetail = result.tradeImpactDetail != null
  const projectedRecord = result.projectedRecord || { wins: modified.wins, losses: modified.losses }
  const recordChange = result.recordChange ?? (modified.wins - baseline.wins)
  const playoffProb = result.playoffProbability
  const winImprovement = recordChange
  const isImprovement = winImprovement > 0

  const getGradeLetter = (score: number): string => {
    if (score >= 90) return 'A+'
    if (score >= 85) return 'A'
    if (score >= 80) return 'A-'
    if (score >= 75) return 'B+'
    if (score >= 70) return 'B'
    if (score >= 65) return 'B-'
    if (score >= 60) return 'C+'
    if (score >= 55) return 'C'
    if (score >= 50) return 'C-'
    if (score >= 45) return 'D+'
    if (score >= 40) return 'D'
    return 'F'
  }

  // Show Analysis tab only if V3 AI data is available
  const hasAIAnalysis = isV3AI && (result.seasonNarrative || result.tradeAnalysis || result.rosterAssessment)

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    ...(hasAIAnalysis ? [{ id: 'analysis' as Tab, label: 'AI Analysis', icon: '🧠' }] : []),
    ...(games && games.length > 0 ? [{ id: 'games' as Tab, label: 'Games', icon: '🎮' }] : []),
    { id: 'standings', label: 'Standings', icon: '🏆' },
    { id: 'playoffs', label: 'Playoffs', icon: '🎯' },
    { id: 'summary', label: 'Summary', icon: '📝' },
  ]

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          zIndex: 999,
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '95%',
          maxWidth: 900,
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 1000,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: `1px solid ${borderColor}`,
            position: 'sticky',
            top: 0,
            backgroundColor: cardBg,
            zIndex: 10,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: textColor }}>
              2026 Season Simulation
            </h2>
            <p style={{ margin: 0, marginTop: 2, fontSize: 12, color: subText }}>
              {teamName} • {tradeCount} trade{tradeCount !== 1 ? 's' : ''} executed
              {result.simulation_version && (
                <span style={{ marginLeft: 8, padding: '1px 6px', borderRadius: 4, backgroundColor: isV3AI ? '#22c55e20' : `${borderColor}`, color: isV3AI ? '#22c55e' : subText, fontSize: 10, fontWeight: 600 }}>
                  {result.simulation_version}
                </span>
              )}
              {result._cached && (
                <span style={{ marginLeft: 4, fontSize: 10, color: subText }}>(cached)</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: subText,
              padding: 0,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: '12px 20px',
            borderBottom: `1px solid ${borderColor}`,
            backgroundColor: surfaceBg,
            overflowX: 'auto',
          }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: activeTab === tab.id ? teamColor : 'transparent',
                color: activeTab === tab.id ? '#fff' : subText,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 20 }}>
          <AnimatePresence mode="wait">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Record Comparison */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    gap: 16,
                    padding: 20,
                    background: surfaceBg,
                    borderRadius: 12,
                    marginBottom: 20,
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', color: subText, marginBottom: 8, fontWeight: 600 }}>
                      Without Trades
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: textColor, lineHeight: 1 }}>
                      {baseline.wins}-{baseline.losses}
                    </div>
                    <div style={{ fontSize: 12, color: subText, marginTop: 6 }}>
                      {baseline.madePlayoffs ? `✅ Playoffs${baseline.playoffSeed ? ` (#${baseline.playoffSeed})` : ''}` : '❌ Missed Playoffs'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: isImprovement ? '#22c55e' : winImprovement < 0 ? '#ef4444' : subText }}>
                    →
                  </div>

                  <div style={{ textAlign: 'center', background: `${teamColor}15`, padding: 16, borderRadius: 10, margin: '-16px -4px -16px 0' }}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', color: teamColor, marginBottom: 8, fontWeight: 600 }}>
                      With Your Trades
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: textColor, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      {projectedRecord.wins}-{projectedRecord.losses}
                      {winImprovement !== 0 && (
                        <span style={{ fontSize: 13, fontWeight: 600, padding: '4px 8px', borderRadius: 6, backgroundColor: isImprovement ? '#22c55e' : '#ef4444', color: '#fff' }}>
                          {winImprovement > 0 ? '+' : ''}{winImprovement}W
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: subText, marginTop: 6 }}>
                      {result.projectedSeed ? `✅ #${result.projectedSeed} Seed` : modified.madePlayoffs ? `✅${modified.playoffSeed ? ` #${modified.playoffSeed}` : ''} Seed` : '❌ Missed Playoffs'}
                    </div>
                  </div>
                </div>

                {/* Playoff Probability Gauge (V3) */}
                {playoffProb != null && (
                  <div style={{
                    padding: 16, background: surfaceBg, borderRadius: 12, marginBottom: 20, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', color: subText, marginBottom: 8, fontWeight: 600 }}>
                      Playoff Probability
                    </div>
                    <div style={{ position: 'relative', height: 12, borderRadius: 6, backgroundColor: isDark ? '#1f2937' : '#e5e7eb', overflow: 'hidden', marginBottom: 8 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${playoffProb}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{
                          height: '100%', borderRadius: 6,
                          background: playoffProb >= 70 ? '#22c55e' : playoffProb >= 40 ? '#eab308' : '#ef4444',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: playoffProb >= 70 ? '#22c55e' : playoffProb >= 40 ? '#eab308' : '#ef4444' }}>
                      {playoffProb}%
                    </div>
                  </div>
                )}

                {/* Monte Carlo Confidence Interval (V3) */}
                {result.monteCarloResults && (
                  <div style={{
                    padding: 16, background: surfaceBg, borderRadius: 12, marginBottom: 20,
                  }}>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', color: subText, marginBottom: 10, fontWeight: 600 }}>
                      Monte Carlo Projection ({result.monteCarloResults.iterations} simulations)
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: subText }}>Floor (p10)</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>{result.monteCarloResults.confidenceInterval.low}W</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: teamColor, fontWeight: 600 }}>Median</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: teamColor }}>{result.monteCarloResults.winDistribution.median}W</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: subText }}>Ceiling (p90)</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>{result.monteCarloResults.confidenceInterval.high}W</div>
                      </div>
                    </div>
                    {result.monteCarloResults.divisionWinProbability > 0 && (
                      <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: subText }}>
                        Division win: {result.monteCarloResults.divisionWinProbability.toFixed(1)}%
                      </div>
                    )}
                  </div>
                )}

                {/* Trade Value Analysis (V3 WVS) */}
                {hasTradeImpactDetail && result.tradeImpactDetail && (
                  <div style={{
                    padding: 16, background: surfaceBg, borderRadius: 12, marginBottom: 20,
                    border: `1px solid ${borderColor}`,
                  }}>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', color: subText, marginBottom: 12, fontWeight: 600 }}>
                      Trade Value Analysis (WVS)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#ef4444', fontWeight: 600 }}>Sent</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>{result.tradeImpactDetail.wvsBreakdown.sent.toFixed(1)}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: subText }}>WVS Delta</div>
                        <div style={{
                          fontSize: 20, fontWeight: 700,
                          color: result.tradeImpactDetail.wvsBreakdown.delta > 0 ? '#22c55e' : result.tradeImpactDetail.wvsBreakdown.delta < 0 ? '#ef4444' : subText,
                        }}>
                          {result.tradeImpactDetail.wvsBreakdown.delta > 0 ? '+' : ''}{result.tradeImpactDetail.wvsBreakdown.delta.toFixed(1)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 600 }}>Received</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>{result.tradeImpactDetail.wvsBreakdown.received.toFixed(1)}</div>
                      </div>
                    </div>

                    {result.tradeImpactDetail.talentDensityWarning && (
                      <div style={{
                        backgroundColor: isDark ? 'rgba(234,179,8,0.1)' : 'rgba(234,179,8,0.08)',
                        color: '#eab308',
                        fontSize: 12, padding: '8px 12px', borderRadius: 8, marginBottom: 8,
                      }}>
                        {result.tradeImpactDetail.talentDensityWarning}
                      </div>
                    )}

                    {result.tradeImpactDetail.chicagoMarketBias > 0 && (
                      <div style={{ fontSize: 12, color: '#3b82f6', marginBottom: 4 }}>
                        Chicago Market Bonus: +{result.tradeImpactDetail.chicagoMarketBias} wins
                      </div>
                    )}
                  </div>
                )}

                {/* Chemistry Penalty (V3) */}
                {result.chemistryPenalty && result.chemistryPenalty.earlySeasonWinReduction > 0 && (
                  <div style={{
                    padding: 12, background: isDark ? 'rgba(234,179,8,0.08)' : 'rgba(234,179,8,0.06)',
                    borderRadius: 8, marginBottom: 20, border: '1px solid rgba(234,179,8,0.2)',
                    display: 'flex', alignItems: 'center', gap: 10, fontSize: 12,
                  }}>
                    <span style={{ fontSize: 16 }}>⚠️</span>
                    <span style={{ color: '#eab308' }}>
                      Chemistry penalty: -{result.chemistryPenalty.earlySeasonWinReduction.toFixed(2)} wins during {result.chemistryPenalty.integrationGames}-game integration period (full integration by Week {result.chemistryPenalty.fullIntegrationWeek})
                    </span>
                  </div>
                )}

                {/* Power Rating Comparison (legacy) */}
                {baselinePowerRating != null && modifiedPowerRating != null && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
                    padding: 16, background: surfaceBg, borderRadius: 12, marginBottom: 20,
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', color: subText, marginBottom: 4 }}>Power Rating</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: subText }}>{baselinePowerRating}</div>
                    </div>
                    <div style={{ fontSize: 20, color: modifiedPowerRating > baselinePowerRating ? '#22c55e' : modifiedPowerRating < baselinePowerRating ? '#ef4444' : subText }}>→</div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', color: teamColor, marginBottom: 4 }}>Modified</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: teamColor }}>{modifiedPowerRating}</div>
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                      backgroundColor: modifiedPowerRating > baselinePowerRating ? '#22c55e20' : modifiedPowerRating < baselinePowerRating ? '#ef444420' : `${borderColor}`,
                      color: modifiedPowerRating > baselinePowerRating ? '#22c55e' : modifiedPowerRating < baselinePowerRating ? '#ef4444' : subText,
                    }}>
                      {modifiedPowerRating > baselinePowerRating ? '+' : ''}{(modifiedPowerRating - baselinePowerRating).toFixed(1)}
                    </div>
                  </div>
                )}

                {/* Player Impacts (V3 or legacy) */}
                {result.keyPlayerImpacts && result.keyPlayerImpacts.length > 0 ? (
                  <div style={{
                    padding: 16, background: surfaceBg, borderRadius: 12, marginBottom: 20,
                  }}>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', color: subText, marginBottom: 10, fontWeight: 600 }}>
                      Key Player Impacts
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {result.keyPlayerImpacts.map((pi, idx) => (
                        <div key={idx} style={{
                          padding: '10px 12px', borderRadius: 8,
                          backgroundColor: pi.direction === 'added' ? (isDark ? '#22c55e08' : '#22c55e06') : (isDark ? '#ef444408' : '#ef444406'),
                          borderLeft: `3px solid ${pi.direction === 'added' ? '#22c55e' : '#ef4444'}`,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: textColor }}>{pi.playerName}</span>
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                              backgroundColor: `${ARCHETYPE_COLORS[pi.archetype] || '#6b7280'}20`,
                              color: ARCHETYPE_COLORS[pi.archetype] || '#6b7280',
                            }}>
                              {pi.archetype}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: subText, lineHeight: 1.4 }}>
                            {pi.impact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : playerImpacts && playerImpacts.length > 0 ? (
                  <div style={{
                    padding: 16, background: surfaceBg, borderRadius: 12, marginBottom: 20,
                  }}>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', color: subText, marginBottom: 10, fontWeight: 600 }}>
                      Player Impact on Power Rating
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {playerImpacts.map((pi: PlayerSimImpact, idx: number) => (
                        <div key={idx} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '6px 10px', borderRadius: 6,
                          backgroundColor: pi.direction === 'added' ? '#22c55e10' : '#ef444410',
                          borderLeft: `3px solid ${pi.direction === 'added' ? '#22c55e' : '#ef4444'}`,
                        }}>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: textColor }}>{pi.playerName}</span>
                            <span style={{ fontSize: 11, color: subText, marginLeft: 8 }}>{pi.position} - {pi.category}</span>
                          </div>
                          <span style={{
                            fontSize: 13, fontWeight: 700,
                            color: pi.powerRatingDelta > 0 ? '#22c55e' : '#ef4444',
                          }}>
                            {pi.powerRatingDelta > 0 ? '+' : ''}{pi.powerRatingDelta}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Championship Banner */}
                {playoffs?.userTeamResult?.wonChampionship && championship && (
                  <div style={{
                    background: `linear-gradient(135deg, ${teamColor}, ${teamColor}dd)`,
                    color: '#fff',
                    padding: 20,
                    borderRadius: 12,
                    textAlign: 'center',
                    marginBottom: 20,
                  }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>CHAMPIONS!</div>
                    <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>
                      {teamName} defeat {championship.runnerUp.teamName} {championship.seriesScore}
                    </div>
                  </div>
                )}

                {/* GM Score */}
                <div style={{
                  background: `linear-gradient(135deg, ${teamColor}, ${teamColor}dd)`,
                  color: '#fff',
                  padding: 20,
                  borderRadius: 12,
                  textAlign: 'center',
                  marginBottom: 20,
                }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.9, marginBottom: 4 }}>
                    Your GM Score
                  </div>
                  <div style={{ fontSize: 44, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    {gmScore.toFixed(1)}
                    <span style={{ fontSize: 22, fontWeight: 700, padding: '6px 12px', borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      {getGradeLetter(gmScore)}
                    </span>
                  </div>

                  {scoreBreakdown && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: 8, padding: 12, marginTop: 16, textAlign: 'left' }}>
                      {[
                        { label: `Trade quality (${tradeCount} trade${tradeCount !== 1 ? 's' : ''})`, value: scoreBreakdown.tradeQualityScore, max: 30 },
                        { label: `Win improvement (${winImprovement > 0 ? '+' : ''}${scoreBreakdown.winImprovement} wins)`, value: scoreBreakdown.winImprovementScore, max: 30 },
                        { label: 'Playoff achievement', value: scoreBreakdown.playoffBonusScore, max: 20 },
                        { label: 'Championship bonus', value: scoreBreakdown.championshipBonus || 0, max: 15 },
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12, borderBottom: idx < 3 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none' }}>
                          <span>{item.label}</span>
                          <span style={{ fontWeight: 600 }}>{item.value.toFixed(1)} / {item.max} pts</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Performance metadata */}
                {result.performance && (
                  <div style={{ fontSize: 10, color: subText, textAlign: 'center', marginBottom: 16 }}>
                    Simulated in {(result.performance.totalMs / 1000).toFixed(1)}s • {result.performance.simulationDepth} depth
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={onSimulateAgain} style={{ flex: 1, padding: '12px 20px', borderRadius: 10, border: `2px solid ${borderColor}`, backgroundColor: 'transparent', color: textColor, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                    🎲 Simulate Again
                  </button>
                  <button onClick={onClose} style={{ flex: 1, padding: '12px 20px', borderRadius: 10, border: 'none', backgroundColor: teamColor, color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                    Continue Trading
                  </button>
                </div>
              </motion.div>
            )}

            {/* AI ANALYSIS TAB (V3) */}
            {activeTab === 'analysis' && hasAIAnalysis && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Season Narrative Headline */}
                {result.seasonNarrative && (
                  <div style={{
                    padding: 20, borderRadius: 12, backgroundColor: surfaceBg, marginBottom: 20, textAlign: 'center',
                  }}>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: textColor, marginBottom: 12, lineHeight: 1.3 }}>
                      {result.seasonNarrative.headline}
                    </h3>
                    <p style={{ fontSize: 14, color: subText, lineHeight: 1.7, textAlign: 'left', whiteSpace: 'pre-line' }}>
                      {result.seasonNarrative.analysis}
                    </p>
                  </div>
                )}

                {/* Trade Impact Cards */}
                {result.tradeAnalysis && result.tradeAnalysis.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', color: subText, marginBottom: 10, fontWeight: 600 }}>
                      Per-Trade Analysis
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {result.tradeAnalysis.map((trade) => (
                        <div key={trade.tradeId} style={{
                          padding: 16, borderRadius: 12, backgroundColor: surfaceBg, border: `1px solid ${borderColor}`,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{
                              padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                              backgroundColor: trade.netImpact === 'positive' ? '#22c55e20' : trade.netImpact === 'negative' ? '#ef444420' : (isDark ? '#374151' : '#e5e7eb'),
                              color: trade.netImpact === 'positive' ? '#22c55e' : trade.netImpact === 'negative' ? '#ef4444' : subText,
                            }}>
                              {trade.netImpact.toUpperCase()}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: trade.winsAdded > 0 ? '#22c55e' : '#ef4444' }}>
                              {trade.winsAdded > 0 ? '+' : ''}{trade.winsAdded.toFixed(1)} wins
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                              backgroundColor: `${ARCHETYPE_COLORS[trade.playerArchetype] || '#6b7280'}20`,
                              color: ARCHETYPE_COLORS[trade.playerArchetype] || '#6b7280',
                            }}>
                              {trade.playerArchetype}
                            </span>
                            <span style={{ fontSize: 10, color: subText, padding: '2px 6px' }}>
                              Scheme Fit: {trade.schemeFit}/100
                            </span>
                            <span style={{ fontSize: 10, color: subText, padding: '2px 6px' }}>
                              Need: {trade.positionalNeed}/100
                            </span>
                          </div>
                          <p style={{ fontSize: 13, color: textColor, margin: 0, lineHeight: 1.5 }}>{trade.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Roster Assessment */}
                {result.rosterAssessment && (
                  <div style={{
                    padding: 16, borderRadius: 12, backgroundColor: surfaceBg, border: `1px solid ${borderColor}`, marginBottom: 20,
                  }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                        backgroundColor: result.rosterAssessment.overallChange === 'improved' ? '#22c55e20' : result.rosterAssessment.overallChange === 'declined' ? '#ef444420' : '#eab30820',
                        color: result.rosterAssessment.overallChange === 'improved' ? '#22c55e' : result.rosterAssessment.overallChange === 'declined' ? '#ef4444' : '#eab308',
                      }}>
                        Roster {result.rosterAssessment.overallChange}
                      </span>
                      <span style={{ fontSize: 12, color: subText }}>
                        Depth: {result.rosterAssessment.depthScore}/100
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: textColor, margin: 0, marginBottom: 12 }}>
                      {result.rosterAssessment.identityShift}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#22c55e', marginBottom: 6, fontWeight: 600 }}>Strengths Gained</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {result.rosterAssessment.strengthsGained.map((s, i) => (
                            <span key={i} style={{ backgroundColor: '#22c55e15', color: '#22c55e', fontSize: 11, padding: '3px 8px', borderRadius: 6 }}>{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#ef4444', marginBottom: 6, fontWeight: 600 }}>Weaknesses Created</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {result.rosterAssessment.weaknessesCreated.map((w, i) => (
                            <span key={i} style={{ backgroundColor: '#ef444415', color: '#ef4444', fontSize: 11, padding: '3px 8px', borderRadius: 6 }}>{w}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Swing Games */}
                {result.seasonNarrative?.swingGames && result.seasonNarrative.swingGames.length > 0 && (
                  <div style={{
                    padding: 16, borderRadius: 12, backgroundColor: surfaceBg, border: `1px solid ${borderColor}`, marginBottom: 20,
                  }}>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', color: subText, marginBottom: 10, fontWeight: 600 }}>
                      Swing Games — Most Affected by Trades
                    </div>
                    {result.seasonNarrative.swingGames.map((game, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
                        borderBottom: i < result.seasonNarrative!.swingGames.length - 1 ? `1px solid ${borderColor}` : 'none',
                      }}>
                        <span style={{ fontSize: 11, color: subText, width: 40, flexShrink: 0 }}>Wk {game.week}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: textColor, width: 40, flexShrink: 0 }}>{game.opponent}</span>
                        <span style={{ fontSize: 12, color: subText, flex: 1 }}>{game.why}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Key Matchups */}
                {result.seasonNarrative?.keyMatchups && result.seasonNarrative.keyMatchups.length > 0 && (
                  <div style={{
                    padding: 16, borderRadius: 12, backgroundColor: surfaceBg, border: `1px solid ${borderColor}`, marginBottom: 20,
                  }}>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', color: subText, marginBottom: 10, fontWeight: 600 }}>
                      Key Matchup Impacts
                    </div>
                    {result.seasonNarrative.keyMatchups.map((matchup, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
                        borderBottom: i < result.seasonNarrative!.keyMatchups.length - 1 ? `1px solid ${borderColor}` : 'none',
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: teamColor, width: 40, flexShrink: 0 }}>
                          {matchup.opponent}
                        </span>
                        <span style={{ fontSize: 12, color: textColor }}>{matchup.impact}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Playoff Outlook */}
                {result.seasonNarrative?.playoffOutlook && (
                  <div style={{
                    padding: 16, borderRadius: 12,
                    border: `2px solid ${teamColor}`,
                    backgroundColor: `${teamColor}08`,
                  }}>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', color: teamColor, marginBottom: 8, fontWeight: 600 }}>
                      Playoff Outlook
                    </div>
                    <p style={{ fontSize: 14, color: textColor, margin: 0, lineHeight: 1.6 }}>
                      {result.seasonNarrative.playoffOutlook}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* GAMES TAB */}
            {activeTab === 'games' && games && games.length > 0 && (
              <motion.div
                key="games"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div style={{ fontSize: 13, color: subText, marginBottom: 16, textAlign: 'center' }}>
                  {games.length} games simulated • {modified.wins}-{modified.losses}{modified.otLosses ? `-${modified.otLosses}` : ''} final record
                </div>
                {(() => {
                  const segmentOrder: string[] = []
                  const segmentGames = new Map<string, SimulatedGame[]>()
                  for (const g of games) {
                    if (!segmentGames.has(g.segment)) {
                      segmentOrder.push(g.segment)
                      segmentGames.set(g.segment, [])
                    }
                    segmentGames.get(g.segment)!.push(g)
                  }
                  return segmentOrder.map((seg: string) => {
                    const sg = segmentGames.get(seg)!
                    const segData = segments?.find((s: SeasonSegment) => s.label === seg)
                    return (
                      <div key={seg} style={{ marginBottom: 20 }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 12px', backgroundColor: `${teamColor}15`, borderRadius: 8, marginBottom: 8,
                        }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: teamColor }}>{seg}</span>
                          <span style={{ fontSize: 12, color: subText }}>
                            {segData ? `${segData.wins}-${segData.losses}${segData.otLosses ? `-${segData.otLosses}` : ''} (${(segData.winPct * 100).toFixed(0)}%)` : ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {/* Header */}
                          <div style={{
                            display: 'grid', gridTemplateColumns: '32px 56px 1fr 40px 60px 56px',
                            gap: 6, padding: '4px 8px', fontSize: 10, fontWeight: 600, color: subText, textTransform: 'uppercase',
                          }}>
                            <span>#</span>
                            <span>Date</span>
                            <span>Opponent</span>
                            <span style={{ textAlign: 'center' }}>H/A</span>
                            <span style={{ textAlign: 'center' }}>Score</span>
                            <span style={{ textAlign: 'center' }}>Record</span>
                          </div>
                          {sg.map((g: SimulatedGame) => (
                            <div key={g.gameNumber}>
                              <div style={{
                                display: 'grid', gridTemplateColumns: '32px 56px 1fr 40px 60px 56px',
                                gap: 6, padding: '6px 8px', borderRadius: 6, alignItems: 'center',
                                backgroundColor: g.result === 'W' ? '#22c55e08' : g.result === 'OTL' ? '#eab30808' : '#ef444408',
                                borderLeft: `3px solid ${g.result === 'W' ? '#22c55e' : g.result === 'OTL' ? '#eab308' : '#ef4444'}`,
                              }}>
                                <span style={{ fontSize: 11, color: subText }}>{g.gameNumber}</span>
                                <span style={{ fontSize: 11, color: subText }}>{formatGameDate(g.date)}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                                  <img src={g.opponentLogoUrl} alt="" style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                  <span style={{ fontSize: 12, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {g.opponentName}
                                  </span>
                                </div>
                                <span style={{ fontSize: 11, color: subText, textAlign: 'center' }}>{g.isHome ? 'HOME' : 'AWAY'}</span>
                                <div style={{ textAlign: 'center' }}>
                                  <span style={{
                                    fontSize: 12, fontWeight: 700,
                                    color: g.result === 'W' ? '#22c55e' : g.result === 'OTL' ? '#eab308' : '#ef4444',
                                  }}>
                                    {g.result}{g.isOvertime ? '/OT' : ''} {g.teamScore}-{g.opponentScore}
                                  </span>
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 600, color: textColor, textAlign: 'center' }}>
                                  {g.runningRecord.wins}-{g.runningRecord.losses}{g.runningRecord.otLosses ? `-${g.runningRecord.otLosses}` : ''}
                                </span>
                              </div>
                              {g.highlight && (
                                <div style={{ padding: '2px 8px 4px 40px', fontSize: 11, fontStyle: 'italic', color: subText }}>
                                  {g.highlight}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })
                })()}
              </motion.div>
            )}

            {/* STANDINGS TAB */}
            {activeTab === 'standings' && standings && (
              <motion.div
                key="standings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { name: standings.conference1Name, teams: standings.conference1 },
                    { name: standings.conference2Name, teams: standings.conference2 },
                  ].map(conf => (
                    <div key={conf.name} style={{ backgroundColor: surfaceBg, borderRadius: 12, padding: 16 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: textColor, marginBottom: 12, textAlign: 'center' }}>
                        {conf.name}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {/* Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 48px 48px', gap: 8, padding: '4px 8px', fontSize: 10, fontWeight: 600, color: subText, textTransform: 'uppercase' }}>
                          <span>#</span>
                          <span>Team</span>
                          <span style={{ textAlign: 'center' }}>W-L</span>
                          <span style={{ textAlign: 'center' }}>GB</span>
                        </div>
                        {conf.teams.slice(0, 12).map((team: TeamStanding, idx: number) => (
                          <div
                            key={team.teamKey}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '24px 1fr 48px 48px',
                              gap: 8,
                              padding: '8px',
                              borderRadius: 6,
                              backgroundColor: team.isUserTeam ? `${teamColor}20` : team.isTradePartner ? '#ef444420' : idx < 7 ? (isDark ? '#1f2937' : '#fff') : 'transparent',
                              border: team.isUserTeam ? `2px solid ${teamColor}` : team.isTradePartner ? '2px solid #ef4444' : 'none',
                            }}
                          >
                            <span style={{ fontSize: 12, fontWeight: 600, color: team.playoffSeed ? '#22c55e' : subText }}>
                              {team.conferenceRank}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                              <img
                                src={team.logoUrl}
                                alt=""
                                style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                              />
                              <span style={{ fontSize: 12, fontWeight: team.isUserTeam ? 700 : 500, color: team.isUserTeam ? teamColor : textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {team.abbreviation}
                              </span>
                              {team.tradeImpact !== undefined && team.tradeImpact !== 0 && (
                                <span style={{ fontSize: 10, padding: '1px 4px', borderRadius: 4, backgroundColor: team.tradeImpact > 0 ? '#22c55e20' : '#ef444420', color: team.tradeImpact > 0 ? '#22c55e' : '#ef4444' }}>
                                  {team.tradeImpact > 0 ? '+' : ''}{team.tradeImpact}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 500, color: textColor, textAlign: 'center' }}>
                              {team.wins}-{team.losses}
                            </span>
                            <span style={{ fontSize: 12, color: subText, textAlign: 'center' }}>
                              {team.gamesBack === 0 ? '-' : team.gamesBack.toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 8, fontSize: 10, color: subText, textAlign: 'center' }}>
                        ✅ = Playoff spot • Your team highlighted
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PLAYOFFS TAB */}
            {activeTab === 'playoffs' && playoffs && (
              <motion.div
                key="playoffs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {!modified.madePlayoffs ? (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>😢</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: textColor, marginBottom: 8 }}>
                      Missed the Playoffs
                    </h3>
                    <p style={{ color: subText, fontSize: 14 }}>
                      {teamName} finished with a {modified.wins}-{modified.losses} record, not enough to make the postseason.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* User team result */}
                    {playoffs.userTeamResult && (
                      <div style={{
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: playoffs.userTeamResult.wonChampionship ? `${teamColor}20` : surfaceBg,
                        border: playoffs.userTeamResult.wonChampionship ? `2px solid ${teamColor}` : `1px solid ${borderColor}`,
                        marginBottom: 20,
                        textAlign: 'center',
                      }}>
                        {playoffs.userTeamResult.wonChampionship ? (
                          <>
                            <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: teamColor }}>CHAMPIONS!</div>
                          </>
                        ) : playoffs.userTeamResult.eliminatedRound ? (
                          <>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>💔</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: textColor }}>
                              Eliminated in Round {playoffs.userTeamResult.eliminatedRound}
                            </div>
                            <div style={{ fontSize: 13, color: subText, marginTop: 4 }}>
                              Lost to {playoffs.userTeamResult.eliminatedBy}
                            </div>
                          </>
                        ) : (
                          <div style={{ fontSize: 14, color: textColor }}>Playoffs in progress...</div>
                        )}
                      </div>
                    )}

                    {/* Bracket */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {Array.from(new Set(playoffs.bracket.map((m: PlayoffMatchup) => m.round))).map((round: number) => {
                        const roundMatches = playoffs.bracket.filter((m: PlayoffMatchup) => m.round === round)
                        const roundName = roundMatches[0]?.roundName.split(' - ')[0] || `Round ${round}`
                        return (
                          <div key={round}>
                            <h4 style={{ fontSize: 13, fontWeight: 700, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
                              {roundName}
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                              {roundMatches.map((match: PlayoffMatchup, idx: number) => (
                                <div
                                  key={idx}
                                  style={{
                                    padding: 12,
                                    borderRadius: 8,
                                    backgroundColor: match.userTeamInvolved ? `${teamColor}10` : surfaceBg,
                                    border: match.userTeamInvolved ? `2px solid ${teamColor}` : `1px solid ${borderColor}`,
                                  }}
                                >
                                  {/* Home team */}
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 0',
                                    borderBottom: `1px solid ${borderColor}`,
                                    opacity: match.winner === 'away' ? 0.5 : 1,
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span style={{ fontSize: 10, color: subText, width: 16 }}>({match.homeTeam.seed})</span>
                                      <img src={match.homeTeam.logoUrl} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                      <span style={{ fontSize: 12, fontWeight: match.winner === 'home' ? 700 : 500 }}>
                                        {match.homeTeam.abbreviation}
                                      </span>
                                    </div>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: match.winner === 'home' ? '#22c55e' : textColor }}>
                                      {match.seriesWins[0]}
                                    </span>
                                  </div>
                                  {/* Away team */}
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 0',
                                    opacity: match.winner === 'home' ? 0.5 : 1,
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span style={{ fontSize: 10, color: subText, width: 16 }}>({match.awayTeam.seed})</span>
                                      <img src={match.awayTeam.logoUrl} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                      <span style={{ fontSize: 12, fontWeight: match.winner === 'away' ? 700 : 500 }}>
                                        {match.awayTeam.abbreviation}
                                      </span>
                                    </div>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: match.winner === 'away' ? '#22c55e' : textColor }}>
                                      {match.seriesWins[1]}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Championship Result */}
                    {championship && (
                      <div style={{
                        marginTop: 20,
                        padding: 20,
                        borderRadius: 12,
                        background: `linear-gradient(135deg, ${championship.winner.primaryColor}20, ${championship.winner.primaryColor}40)`,
                        border: `2px solid ${championship.winner.primaryColor}`,
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
                        <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: subText, marginBottom: 4 }}>
                          Champion
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                          <img src={championship.winner.logoUrl} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          <span style={{ fontSize: 20, fontWeight: 800, color: championship.winner.primaryColor }}>
                            {championship.winner.teamName}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: subText, marginTop: 8 }}>
                          Defeated {championship.runnerUp.teamName} {championship.seriesScore}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* SUMMARY TAB */}
            {activeTab === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Previous Season Comparison */}
                {previousSeasonRecord && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
                    padding: 14, background: surfaceBg, borderRadius: 12, marginBottom: 20,
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', color: subText, marginBottom: 2 }}>Last Season</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: subText }}>
                        {previousSeasonRecord.wins}-{previousSeasonRecord.losses}{previousSeasonRecord.otLosses ? `-${previousSeasonRecord.otLosses}` : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: 18, color: subText }}>→</div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', color: teamColor, marginBottom: 2 }}>Simulated</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: teamColor }}>
                        {modified.wins}-{modified.losses}{modified.otLosses ? `-${modified.otLosses}` : ''}
                      </div>
                    </div>
                    {winImprovement !== 0 && (
                      <div style={{
                        fontSize: 14, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                        backgroundColor: isImprovement ? '#22c55e20' : '#ef444420',
                        color: isImprovement ? '#22c55e' : '#ef4444',
                      }}>
                        {winImprovement > 0 ? '+' : ''}{winImprovement}W
                      </div>
                    )}
                  </div>
                )}

                {/* Use V3 narrative if available, otherwise legacy seasonSummary */}
                {result.seasonNarrative ? (
                  <>
                    <div style={{
                      padding: 20, borderRadius: 12, backgroundColor: surfaceBg, marginBottom: 20, textAlign: 'center',
                    }}>
                      <h3 style={{ fontSize: 20, fontWeight: 800, color: textColor, marginBottom: 12, lineHeight: 1.3 }}>
                        {result.seasonNarrative.headline}
                      </h3>
                      <p style={{ fontSize: 14, color: subText, lineHeight: 1.6, textAlign: 'left', whiteSpace: 'pre-line' }}>
                        {result.seasonNarrative.analysis}
                      </p>
                    </div>
                    {result.seasonNarrative.playoffOutlook && (
                      <div style={{
                        padding: 16, borderRadius: 12, border: `2px solid ${teamColor}`, backgroundColor: `${teamColor}10`, marginBottom: 20,
                      }}>
                        <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: teamColor, marginBottom: 8, fontWeight: 600 }}>
                          Playoff Outlook
                        </div>
                        <p style={{ fontSize: 14, color: textColor, margin: 0, lineHeight: 1.6 }}>
                          {result.seasonNarrative.playoffOutlook}
                        </p>
                      </div>
                    )}
                  </>
                ) : seasonSummary ? (
                  <>
                    {/* Headline */}
                    <div style={{
                      padding: 20, borderRadius: 12, backgroundColor: surfaceBg, marginBottom: 20, textAlign: 'center',
                    }}>
                      <h3 style={{ fontSize: 20, fontWeight: 800, color: textColor, marginBottom: 12, lineHeight: 1.3 }}>
                        {seasonSummary.headline}
                      </h3>
                      <p style={{ fontSize: 14, color: subText, lineHeight: 1.6 }}>
                        {seasonSummary.narrative}
                      </p>
                    </div>

                    {/* Trade Impact */}
                    <div style={{
                      padding: 16, borderRadius: 12, border: `2px solid ${teamColor}`, backgroundColor: `${teamColor}10`, marginBottom: 20,
                    }}>
                      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: teamColor, marginBottom: 8, fontWeight: 600 }}>
                        Trade Impact
                      </div>
                      <p style={{ fontSize: 14, color: textColor, margin: 0 }}>
                        {seasonSummary.tradeImpactSummary}
                      </p>
                    </div>

                    {/* Key Moments */}
                    <div style={{ marginBottom: 20 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: textColor, marginBottom: 12 }}>
                        Key Moments
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {seasonSummary.keyMoments.map((moment: string, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, backgroundColor: surfaceBg,
                            }}
                          >
                            <div style={{
                              width: 24, height: 24, borderRadius: '50%', backgroundColor: teamColor, color: '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
                            }}>
                              {idx + 1}
                            </div>
                            <span style={{ fontSize: 13, color: textColor }}>{moment}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Affected Teams */}
                    {seasonSummary.affectedTeams.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: textColor, marginBottom: 12 }}>
                          Trade Partner Outcomes
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {seasonSummary.affectedTeams.map((team: { teamName: string; impact: string }, idx: number) => (
                            <div
                              key={idx}
                              style={{
                                padding: '12px 14px', borderRadius: 8, backgroundColor: '#ef444410', border: '1px solid #ef444430',
                              }}
                            >
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>
                                {team.teamName}
                              </div>
                              <div style={{ fontSize: 12, color: subText }}>
                                {team.impact}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: 40, color: subText }}>
                    No summary available for this simulation.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}
