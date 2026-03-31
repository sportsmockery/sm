'use client'

import { useState, useEffect } from 'react'
import type { SeasonSimulation } from '@/types/gm'

interface SeasonImpactPanelProps {
  simulation: SeasonSimulation | null
  isLoading?: boolean
  error?: string | null
  onSimulateAgain?: () => void
  sport?: string
}

function ShimmerBlock({ height = 20, width = '100%', rounded = '6px' }: {
  height?: number
  width?: string | number
  rounded?: string
}) {
  return (
    <div style={{
      height,
      width,
      borderRadius: rounded,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  )
}

function RecordDisplay({ wins, losses, label, highlight }: {
  wins: number
  losses: number
  sport?: string
  label: string
  highlight?: boolean
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '11px',
        fontWeight: 600,
        color: 'rgba(255, 255, 255, 0.4)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        margin: '0 0 6px',
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 800,
        fontSize: '28px',
        color: highlight ? '#22c55e' : 'rgba(255, 255, 255, 0.9)',
        margin: '0 0 4px',
        lineHeight: 1,
      }}>
        {wins}&ndash;{losses}
      </p>
    </div>
  )
}

export function SeasonImpactPanel({
  simulation,
  isLoading = false,
  error = null,
  onSimulateAgain,
  sport,
}: SeasonImpactPanelProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const panelStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '24px',
    marginTop: '24px',
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(8px)',
    transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
  }

  // Loading state
  if (isLoading) {
    return (
      <div style={panelStyle}>
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <ShimmerBlock height={22} width={160} />
          <ShimmerBlock height={18} width={120} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', gap: '16px', marginBottom: '24px' }}>
          <ShimmerBlock height={60} rounded="8px" />
          <ShimmerBlock height={40} rounded="8px" />
          <ShimmerBlock height={60} rounded="8px" />
        </div>
        <ShimmerBlock height={8} rounded="4px" />
        <div style={{ height: '12px' }} />
        <ShimmerBlock height={16} width="60%" />
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <ShimmerBlock height={16} />
          <ShimmerBlock height={16} width="90%" />
          <ShimmerBlock height={16} width="80%" />
          <ShimmerBlock height={16} width="70%" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div style={panelStyle}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '16px 0',
          gap: '12px',
        }}>
          <p style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: 0,
          }}>
            Season Impact unavailable
          </p>
          <p style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.5)',
            margin: 0,
            maxWidth: '300px',
          }}>
            {error}
          </p>
          {onSimulateAgain && (
            <button
              onClick={onSimulateAgain}
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600,
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.9)',
                background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseOut={e => (e.currentTarget.style.opacity = '1')}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!simulation) return null

  const recordDelta = simulation.recordChange
  const isPositive = recordDelta > 0
  const isNegative = recordDelta < 0
  const deltaColor = isPositive ? '#22c55e' : isNegative ? '#ef4444' : 'rgba(255, 255, 255, 0.5)'
  const deltaSign = isPositive ? '+' : ''

  const overallChange = simulation.rosterAssessment?.overallChange
  const changeColors = {
    improved: { bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.25)', text: '#22c55e' },
    declined: { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.25)', text: '#ef4444' },
    lateral: { bg: 'rgba(255, 255, 255, 0.06)', border: 'rgba(255, 255, 255, 0.15)', text: 'rgba(255,255,255,0.6)' },
  }
  const changeStyle = overallChange ? changeColors[overallChange] : changeColors.lateral

  return (
    <div style={panelStyle}>
      <style>{`
        @media (max-width: 640px) {
          .season-impact-cols { flex-direction: column !important; }
          .season-impact-record-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
        }
      `}</style>

      {/* Panel Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <h3 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 700,
          fontSize: '18px',
          color: 'rgba(255, 255, 255, 0.95)',
          margin: 0,
        }}>
          Season Impact
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {simulation.aiModel && (
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.35)',
            }}>
              Simulated by Season ({simulation.aiModel === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash' : simulation.aiModel})
            </span>
          )}
          {overallChange && (
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: changeStyle.text,
              background: changeStyle.bg,
              border: `1px solid ${changeStyle.border}`,
              borderRadius: '6px',
              padding: '3px 8px',
            }}>
              {overallChange}
            </span>
          )}
        </div>
      </div>

      {/* Record Comparison */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 80px 1fr',
        gap: '16px',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
      }}>
        <RecordDisplay
          wins={simulation.baseline.wins}
          losses={simulation.baseline.losses}
          sport={sport}
          label="Without Trade"
        />
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 800,
            fontSize: '22px',
            color: deltaColor,
            margin: 0,
            lineHeight: 1,
          }}>
            {deltaSign}{recordDelta}W
          </p>
          {simulation.baseline.madePlayoffs !== simulation.modified.madePlayoffs && (
            <p style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '10px',
              color: simulation.modified.madePlayoffs ? '#22c55e' : '#ef4444',
              margin: '4px 0 0',
            }}>
              {simulation.modified.madePlayoffs ? 'Playoffs' : 'No Playoffs'}
            </p>
          )}
        </div>
        <RecordDisplay
          wins={simulation.modified.wins}
          losses={simulation.modified.losses}
          sport={sport}
          label="With Trade"
          highlight={isPositive}
        />
      </div>

      {/* Playoff Probability */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.6)',
          }}>
            Playoff Probability
          </span>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '18px',
            fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.9)',
          }}>
            {simulation.playoffProbability}%
          </span>
        </div>
        <div style={{
          height: '8px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${simulation.playoffProbability}%`,
            background: simulation.playoffProbability >= 50
              ? 'linear-gradient(90deg, #22c55e, #16a34a)'
              : simulation.playoffProbability >= 25
              ? 'linear-gradient(90deg, #eab308, #ca8a04)'
              : 'linear-gradient(90deg, #ef4444, #dc2626)',
            borderRadius: '4px',
            transition: 'width 0.6s ease-out',
          }} />
        </div>
        {simulation.projectedSeed && (
          <p style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.4)',
            margin: '6px 0 0',
            textAlign: 'right',
          }}>
            Projected seed: #{simulation.projectedSeed}
          </p>
        )}
      </div>

      {/* Season Narrative */}
      {simulation.seasonNarrative && (
        <div style={{
          marginBottom: '20px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        }}>
          <h4 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '15px',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: '0 0 10px',
          }}>
            {simulation.seasonNarrative.headline}
          </h4>
          <p style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.6,
            margin: '0 0 10px',
          }}>
            {simulation.seasonNarrative.analysis}
          </p>
          <p style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.5)',
            lineHeight: 1.6,
            margin: 0,
            fontStyle: 'italic',
          }}>
            {simulation.seasonNarrative.playoffOutlook}
          </p>
        </div>
      )}

      {/* Key Player Impacts */}
      {simulation.keyPlayerImpacts && simulation.keyPlayerImpacts.length > 0 && (
        <div style={{
          marginBottom: '20px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        }}>
          <h4 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 600,
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: '0 0 10px',
          }}>
            Key Players
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {simulation.keyPlayerImpacts.map((player, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}>
                <span style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: player.direction === 'added' ? '#22c55e' : '#ef4444',
                  minWidth: '16px',
                  marginTop: '1px',
                }}>
                  {player.direction === 'added' ? '+' : '\u2013'}
                </span>
                <div>
                  <span style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.85)',
                    marginRight: '6px',
                  }}>
                    {player.playerName}
                  </span>
                  <span style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}>
                    {player.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roster Assessment */}
      {simulation.rosterAssessment && (
        <div style={{ marginBottom: '20px' }}>
          {simulation.rosterAssessment.identityShift && (
            <p style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0 0 12px',
              fontStyle: 'italic',
            }}>
              &ldquo;{simulation.rosterAssessment.identityShift}&rdquo;
            </p>
          )}

          <div
            className="season-impact-cols"
            style={{ display: 'flex', gap: '12px' }}
          >
            {simulation.rosterAssessment.strengthsGained.length > 0 && (
              <div style={{
                flex: 1,
                background: 'rgba(34, 197, 94, 0.05)',
                border: '1px solid rgba(34, 197, 94, 0.15)',
                borderRadius: '8px',
                padding: '12px',
              }}>
                <p style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#22c55e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  margin: '0 0 8px',
                }}>
                  Strengths Gained
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {simulation.rosterAssessment.strengthsGained.map((s, i) => (
                    <li key={i} style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      display: 'flex',
                      gap: '6px',
                    }}>
                      <span style={{ color: '#22c55e', flexShrink: 0 }}>+</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {simulation.rosterAssessment.weaknessesCreated.length > 0 && (
              <div style={{
                flex: 1,
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '8px',
                padding: '12px',
              }}>
                <p style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#ef4444',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  margin: '0 0 8px',
                }}>
                  Weaknesses Created
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {simulation.rosterAssessment.weaknessesCreated.map((w, i) => (
                    <li key={i} style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      display: 'flex',
                      gap: '6px',
                    }}>
                      <span style={{ color: '#ef4444', flexShrink: 0 }}>&ndash;</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simulate Again */}
      {onSimulateAgain && (
        <div style={{ textAlign: 'right', marginTop: '16px' }}>
          <button
            onClick={onSimulateAgain}
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 600,
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
            }}
          >
            Simulate Again
          </button>
        </div>
      )}
    </div>
  )
}
