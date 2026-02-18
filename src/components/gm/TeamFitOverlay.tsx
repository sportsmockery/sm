'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { TeamFitRadar, TeamFitBars } from './TeamFitRadar'
import type { PlayerData } from './PlayerCard'

interface TeamFitResult {
  player_name: string
  player_espn_id?: string
  target_team: string
  overall_fit: number
  breakdown: {
    positional_need: number
    age_fit: number
    cap_fit: number
    scheme_fit: number
  }
  insights: {
    positional_need: string
    age_fit: string
    cap_fit: string
    scheme_fit: string
  }
  recommendation: string
  comparable_acquisitions?: Array<{
    player_name: string
    team: string
    fit_score: number
    outcome: 'success' | 'neutral' | 'failure'
  }>
}

interface TeamFitOverlayProps {
  player: PlayerData | null
  targetTeam: string
  targetTeamName: string
  targetTeamColor?: string
  sport: string
  show: boolean
  onClose: () => void
}

export function TeamFitOverlay({
  player,
  targetTeam,
  targetTeamName,
  targetTeamColor = '#bc0000',
  sport,
  show,
  onClose,
}: TeamFitOverlayProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [loading, setLoading] = useState(false)
  const [fitData, setFitData] = useState<TeamFitResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRadar, setShowRadar] = useState(true)

  const textColor = 'var(--sm-text)'
  const subText = 'var(--sm-text-muted)'

  useEffect(() => {
    if (!show || !player || !targetTeam) {
      setFitData(null)
      setError(null)
      return
    }

    async function fetchFit() {
      if (!player) return
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          target_team: targetTeam,
          sport,
          player_name: player.full_name,
        })
        if (player.espn_id) {
          params.append('player_espn_id', player.espn_id)
        }

        const res = await fetch(`/api/gm/fit?${params}`)
        if (!res.ok) throw new Error('Failed to fetch fit analysis')
        const data = await res.json()
        setFitData(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load fit analysis')
      } finally {
        setLoading(false)
      }
    }

    fetchFit()
  }, [show, player, targetTeam, sport])

  if (!show || !player) return null

  const fitColor = fitData
    ? fitData.overall_fit >= 70 ? '#22c55e'
      : fitData.overall_fit >= 50 ? '#eab308'
      : '#ef4444'
    : '#6b7280'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          style={{
            backgroundColor: 'var(--sm-card)',
            borderRadius: 16,
            padding: 24,
            maxWidth: 500,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: textColor, margin: 0 }}>
                Team Fit Analysis
              </h2>
              <p style={{ fontSize: '13px', color: subText, margin: '4px 0 0' }}>
                {player.full_name} → {targetTeamName}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: subText,
                cursor: 'pointer',
                padding: 4,
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{
                  width: 40,
                  height: 40,
                  border: '3px solid var(--sm-border)',
                  borderTopColor: targetTeamColor,
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                }}
              />
              <p style={{ color: subText, fontSize: '14px' }}>Analyzing fit...</p>
            </div>
          ) : error ? (
            <div style={{
              padding: 20,
              backgroundColor: '#ef444420',
              borderRadius: 10,
              color: '#ef4444',
              fontSize: '14px',
              textAlign: 'center',
            }}>
              {error}
            </div>
          ) : fitData ? (
            <>
              {/* Overall score */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                marginBottom: 24,
                padding: 16,
                borderRadius: 12,
                backgroundColor: 'var(--sm-surface)',
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  border: `4px solid ${fitColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}>
                  <span style={{ fontSize: '28px', fontWeight: 900, color: fitColor }}>
                    {fitData.overall_fit}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: textColor }}>
                    Overall Fit Score
                  </div>
                  <div style={{ fontSize: '12px', color: fitColor, fontWeight: 600 }}>
                    {fitData.overall_fit >= 70 ? 'Great Fit' : fitData.overall_fit >= 50 ? 'Decent Fit' : 'Poor Fit'}
                  </div>
                </div>
              </div>

              {/* Chart toggle */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                <button
                  onClick={() => setShowRadar(true)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: showRadar ? targetTeamColor : ('var(--sm-border)'),
                    color: showRadar ? '#fff' : subText,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Radar
                </button>
                <button
                  onClick={() => setShowRadar(false)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: !showRadar ? targetTeamColor : ('var(--sm-border)'),
                    color: !showRadar ? '#fff' : subText,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Bars
                </button>
              </div>

              {/* Chart */}
              <div style={{ marginBottom: 24 }}>
                {showRadar ? (
                  <TeamFitRadar breakdown={fitData.breakdown} teamColor={targetTeamColor} />
                ) : (
                  <TeamFitBars breakdown={fitData.breakdown} teamColor={targetTeamColor} />
                )}
              </div>

              {/* Insights */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: textColor, marginBottom: 12 }}>
                  Analysis Breakdown
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(fitData.insights).map(([key, value]) => {
                    const score = fitData.breakdown[key as keyof typeof fitData.breakdown]
                    const labels: Record<string, string> = {
                      positional_need: 'Positional Need',
                      age_fit: 'Age Fit',
                      cap_fit: 'Cap Fit',
                      scheme_fit: 'Scheme Fit',
                    }
                    return (
                      <div
                        key={key}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          backgroundColor: 'var(--sm-surface)',
                          border: '1px solid var(--sm-border)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: textColor }}>
                            {labels[key] || key}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: score >= 70 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444',
                          }}>
                            {score}/100
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: subText, margin: 0, lineHeight: 1.5 }}>
                          {value}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recommendation */}
              <div style={{
                padding: 16,
                borderRadius: 10,
                backgroundColor: `${fitColor}15`,
                border: `1px solid ${fitColor}40`,
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: fitColor, marginBottom: 6, textTransform: 'uppercase' }}>
                  Recommendation
                </div>
                <p style={{ fontSize: '13px', color: textColor, margin: 0, lineHeight: 1.6 }}>
                  {fitData.recommendation}
                </p>
              </div>

              {/* Comparable acquisitions */}
              {fitData.comparable_acquisitions && fitData.comparable_acquisitions.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: textColor, marginBottom: 10 }}>
                    Similar Acquisitions
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {fitData.comparable_acquisitions.map((comp, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: 8,
                          backgroundColor: 'var(--sm-surface)',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: textColor }}>
                            {comp.player_name}
                          </span>
                          <span style={{ fontSize: '11px', color: subText, marginLeft: 6 }}>
                            → {comp.team}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '11px', color: subText }}>{comp.fit_score}</span>
                          <span style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: 4,
                            backgroundColor: comp.outcome === 'success' ? '#22c55e20' : comp.outcome === 'failure' ? '#ef444420' : '#6b728020',
                            color: comp.outcome === 'success' ? '#22c55e' : comp.outcome === 'failure' ? '#ef4444' : '#6b7280',
                            fontWeight: 600,
                          }}>
                            {comp.outcome}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              marginTop: 20,
              padding: '12px 24px',
              borderRadius: 10,
              border: '2px solid var(--sm-border)',
              backgroundColor: 'transparent',
              color: textColor,
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
