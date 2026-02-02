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

interface AvailablePick extends DraftPick {
  id: string // Unique identifier like "2026-1"
}

interface DraftPickListProps {
  sport: string
  selectedPicks: DraftPick[]
  onToggle: (pick: DraftPick) => void
  teamColor: string
  teamName?: string
  isOwn?: boolean // true for Chicago, false for opponent
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
}: DraftPickListProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [collapsed, setCollapsed] = useState(true)

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const checkboxBg = isDark ? '#374151' : '#ffffff'

  // Generate available picks for the next 5 years
  const years = [2026, 2027, 2028, 2029, 2030]
  const availablePicks = useMemo(() => generateAvailablePicks(sport, years), [sport])

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
          backgroundColor: isDark ? '#1f2937' : '#f9fafb',
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
                      return (
                        <button
                          key={pick.id}
                          onClick={() => handleToggle(pick)}
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
                          <span style={{
                            fontSize: 12,
                            fontWeight: selected ? 600 : 500,
                            color: selected ? teamColor : textColor,
                          }}>
                            Rd {pick.round}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

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
