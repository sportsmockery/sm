'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import type { DraftPick } from '@/types/gm'

const SPORT_ROUNDS: Record<string, number> = {
  nfl: 7,
  nba: 2,
  nhl: 7,
  mlb: 20,
}

// Pick value tiers (0-3000 scale)
interface PickTier {
  label: string
  color: string
  bgColor: string
}

function getPickTier(value: number | undefined): PickTier | null {
  if (!value) return null
  if (value >= 2000) return { label: 'Franchise', color: '#b45309', bgColor: '#fef3c7' } // Gold
  if (value >= 1200) return { label: 'Blue Chip', color: '#1d4ed8', bgColor: '#dbeafe' } // Blue
  if (value >= 700) return { label: 'Premium', color: '#15803d', bgColor: '#dcfce7' } // Green
  if (value >= 300) return { label: 'Solid', color: '#0f766e', bgColor: '#ccfbf1' } // Teal
  if (value >= 100) return { label: 'Useful', color: '#6b7280', bgColor: '#f3f4f6' } // Gray
  if (value >= 30) return { label: 'Depth', color: '#9ca3af', bgColor: '#f9fafb' } // Light Gray
  return { label: 'Marginal', color: '#d1d5db', bgColor: '#fafafa' } // Muted
}

// Sport-specific context for tooltips
const SPORT_CONTEXT: Record<string, string> = {
  nfl: 'NFL picks are the most valuable in pro sports. Even 4th rounders become starters ~20% of the time.',
  nba: 'Only lottery picks (#1-14) and late 1st rounders matter. 2nd round = no guaranteed contract.',
  nhl: 'NHL picks take 3-5 years to develop. Rounds 1-3 valuable, 4-7 are lottery tickets.',
  mlb: '20-round draft but only rounds 1-5 have real trade value.',
}

// Capitalize first letter of each word in team name
function capitalizeTeamName(name: string): string {
  if (!name) return name
  return name.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}

interface AvailablePick extends DraftPick {
  id: string // Unique identifier like "2026-1"
  label?: string
  estimatedPosition?: number
  value?: number
  conditional?: string | null
}

// Tradeable pick from datalab API
interface TradeablePick {
  id: number
  label: string
  year: number
  round: number
  originalTeam: string
  estimatedPosition?: number
  value: number
  conditional?: string | null
}

interface TradedAwayPick {
  label: string
  owedTo: string
  year: number
  round: number
}

interface DraftPickListProps {
  sport: string
  selectedPicks: DraftPick[]
  onToggle: (pick: DraftPick) => void
  teamColor: string
  teamName?: string
  isOwn?: boolean // true for Chicago, false for opponent
  tradeablePicks?: TradeablePick[] // From datalab API
  tradedAwayPicks?: TradedAwayPick[] // Picks owed away
  loading?: boolean
}

function generateAvailablePicks(sport: string, years: number[]): AvailablePick[] {
  const maxRound = SPORT_ROUNDS[sport] || 7
  const picks: AvailablePick[] = []

  for (const year of years) {
    for (let round = 1; round <= maxRound; round++) {
      picks.push({
        id: `${year}-${round}`,
        year,
        round,
        originalTeam: 'Own',
      })
    }
  }

  return picks
}

function pickMatches(p1: DraftPick, p2: DraftPick): boolean {
  return p1.year === p2.year && p1.round === p2.round
}

export function DraftPickList({
  sport,
  selectedPicks,
  onToggle,
  teamColor,
  teamName,
  isOwn = true,
  tradeablePicks = [],
  tradedAwayPicks = [],
  loading = false,
}: DraftPickListProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [collapsed, setCollapsed] = useState(true)

  const textColor = 'var(--sm-text)'
  const subText = 'var(--sm-text-muted)'
  const borderColor = 'var(--sm-border)'
  const checkboxBg = isDark ? '#374151' : '#ffffff'

  // Use tradeable picks from API if available, otherwise generate
  const years = [2026, 2027, 2028, 2029, 2030]
  const availablePicks = useMemo(() => {
    if (tradeablePicks.length > 0) {
      // Convert API picks to AvailablePick format
      return tradeablePicks.map(tp => ({
        id: `${tp.year}-${tp.round}-${tp.originalTeam}`,
        year: tp.year,
        round: tp.round,
        originalTeam: tp.originalTeam,
        label: tp.label,
        estimatedPosition: tp.estimatedPosition,
        value: tp.value,
        conditional: tp.conditional,
      }))
    }
    // Fallback to generated picks
    return generateAvailablePicks(sport, years)
  }, [sport, tradeablePicks])

  // Group picks by year for display
  const picksByYear = useMemo(() => {
    const grouped: Record<number, AvailablePick[]> = {}
    for (const pick of availablePicks) {
      if (!grouped[pick.year]) grouped[pick.year] = []
      grouped[pick.year].push(pick)
    }
    return grouped
  }, [availablePicks])

  const isSelected = (pick: AvailablePick) => {
    return selectedPicks.some(sp => pickMatches(sp, pick))
  }

  const handleToggle = (pick: AvailablePick) => {
    console.log('[DraftPickList.handleToggle] called with pick:', pick)
    onToggle({ year: pick.year, round: pick.round, originalTeam: pick.originalTeam })
  }

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Collapsible header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          borderRadius: 8,
          border: `1px solid ${borderColor}`,
          backgroundColor: 'var(--sm-surface)',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <rect x="4" y="4" width="16" height="18" rx="2" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="13" x2="15" y2="13" />
          </svg>
          <span style={{ fontWeight: 600, fontSize: 13, color: textColor }}>
            Draft Picks
          </span>
          {selectedPicks.length > 0 && (
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 10,
              backgroundColor: `${teamColor}20`,
              color: teamColor,
            }}>
              {selectedPicks.length} selected
            </span>
          )}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={subText}
          strokeWidth="2"
          style={{
            transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.2s',
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '12px',
              marginTop: 8,
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              backgroundColor: isDark ? '#111827' : '#ffffff',
              maxHeight: 300,
              overflowY: 'auto',
            }}>
              {/* Picks grouped by year */}
              {years.map(year => (
                <div key={year} style={{ marginBottom: 12 }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: subText,
                    textTransform: 'uppercase',
                    marginBottom: 6,
                    letterSpacing: '0.5px',
                  }}>
                    {year}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {picksByYear[year]?.map(pick => {
                      const selected = isSelected(pick)
                      const tier = getPickTier(pick.value)
                      const tooltipText = pick.value
                        ? `${pick.label || `${pick.year} Round ${pick.round}`} (${pick.value} pts${tier ? `, ${tier.label}` : ''})${SPORT_CONTEXT[sport] ? `\n\n${SPORT_CONTEXT[sport]}` : ''}`
                        : SPORT_CONTEXT[sport] || undefined
                      return (
                        <button
                          key={pick.id}
                          onClick={() => handleToggle(pick)}
                          title={tooltipText}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 10px',
                            borderRadius: 6,
                            border: selected ? `2px solid ${teamColor}` : `1px solid ${borderColor}`,
                            backgroundColor: selected ? `${teamColor}15` : checkboxBg,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          {/* Checkbox */}
                          <div style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: selected ? 'none' : `2px solid ${borderColor}`,
                            backgroundColor: selected ? teamColor : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            {selected && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                <path d="M5 12l5 5L20 7" />
                              </svg>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{
                                fontSize: 12,
                                fontWeight: selected ? 600 : 500,
                                color: selected ? teamColor : textColor,
                              }}>
                                Rd {pick.round}
                                {pick.estimatedPosition && (
                                  <span style={{ fontSize: 10, color: subText, marginLeft: 4 }}>
                                    #{pick.estimatedPosition}
                                  </span>
                                )}
                              </span>
                              {/* Tier badge */}
                              {tier && (
                                <span style={{
                                  fontSize: 8,
                                  fontWeight: 600,
                                  padding: '1px 4px',
                                  borderRadius: 3,
                                  backgroundColor: tier.bgColor,
                                  color: tier.color,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.3px',
                                }}>
                                  {tier.label}
                                </span>
                              )}
                            </div>
                            {pick.originalTeam && pick.originalTeam !== 'Own' && pick.originalTeam !== teamName && (
                              <span style={{ fontSize: 9, color: subText }}>
                                via {capitalizeTeamName(pick.originalTeam)}
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Traded Away Picks Info */}
              {tradedAwayPicks.length > 0 && (
                <div style={{
                  marginTop: 12,
                  padding: '10px 12px',
                  borderRadius: 6,
                  backgroundColor: isDark ? '#1f1f1f' : '#fef3cd',
                  border: `1px solid ${isDark ? '#4a4a4a' : '#ffc107'}`,
                }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isDark ? '#ffc107' : '#856404',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Picks Owed Away
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {tradedAwayPicks.map((tap, idx) => (
                      <div key={idx} style={{
                        fontSize: 11,
                        color: isDark ? '#d4d4d4' : '#6c757d',
                      }}>
                        {tap.label} → {capitalizeTeamName(tap.owedTo)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16,
                  color: subText,
                  fontSize: 12,
                }}>
                  Loading picks...
                </div>
              )}

              {/* Helper text */}
              <div style={{
                fontSize: 11,
                color: subText,
                textAlign: 'center',
                paddingTop: 8,
                borderTop: `1px solid ${borderColor}`,
                marginTop: 8,
              }}>
                Click to {isOwn ? 'send' : 'receive'} picks
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
