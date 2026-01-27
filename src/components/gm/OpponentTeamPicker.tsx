'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface LeagueTeam {
  team_key: string
  team_name: string
  abbreviation: string
  city: string
  logo_url: string
  primary_color: string
  conference: string
  division: string
  sport: string
}

// Division rivals for Chicago teams — trades with these carry penalties
const DIVISION_RIVALS: Record<string, string[]> = {
  bears: ['packers', 'vikings', 'lions'],
  bulls: ['cavaliers', 'pistons', 'pacers', 'bucks'],
  blackhawks: ['avalanche', 'stars', 'predators', 'blues', 'wild', 'jets', 'utah'],
  cubs: ['reds', 'brewers', 'pirates', 'cardinals'],
  whitesox: ['guardians', 'tigers', 'royals', 'twins'],
}

interface OpponentTeamPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (team: LeagueTeam) => void
  sport: string
  chicagoTeam: string
}

export function OpponentTeamPicker({ open, onClose, onSelect, sport, chicagoTeam }: OpponentTeamPickerProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [teams, setTeams] = useState<LeagueTeam[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !sport) return
    setLoading(true)
    fetch(`/api/gm/teams?sport=${sport}`)
      .then(r => r.json())
      .then(d => setTeams(d.teams || []))
      .catch(() => setTeams([]))
      .finally(() => setLoading(false))
  }, [open, sport])

  const rivals = DIVISION_RIVALS[chicagoTeam] || []

  const grouped = useMemo(() => {
    let filtered = teams.filter(t => t.team_key !== chicagoTeam)
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(t =>
        t.team_name.toLowerCase().includes(q) ||
        t.abbreviation.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q)
      )
    }
    const groups: Record<string, LeagueTeam[]> = {}
    for (const t of filtered) {
      const key = `${t.conference} - ${t.division}`
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    }
    return groups
  }, [teams, search, chicagoTeam])

  const bgOverlay = 'rgba(0,0,0,0.6)'
  const bgModal = isDark ? '#111827' : '#ffffff'
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const textColor = isDark ? '#ffffff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
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
              maxWidth: 600,
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${borderColor}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: textColor, margin: 0 }}>Select Trade Partner</h3>
                <button
                  onClick={onClose}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: subText, fontSize: '20px', padding: 4 }}
                >
                  &#x2715;
                </button>
              </div>
              <input
                type="text"
                placeholder="Search teams..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                  backgroundColor: isDark ? '#1f2937' : '#f9fafb',
                  color: textColor,
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Teams list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: subText }}>Loading teams...</div>
              ) : Object.keys(grouped).length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: subText }}>No teams found</div>
              ) : (
                Object.entries(grouped).map(([division, divTeams]) => (
                  <div key={division} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: subText, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                      {division}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {divTeams.map(t => {
                        const isRival = rivals.includes(t.team_key)
                        return (
                          <motion.button
                            key={t.team_key}
                            whileHover={{ scale: 1.01, backgroundColor: isDark ? '#1f2937' : '#f3f4f6' }}
                            onClick={() => { onSelect(t); onClose() }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '10px 12px',
                              borderRadius: 10,
                              border: `1px solid ${isRival ? '#ef444440' : 'transparent'}`,
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              width: '100%',
                              textAlign: 'left',
                            }}
                          >
                            <img
                              src={t.logo_url}
                              alt={t.team_name}
                              style={{ width: 32, height: 32, objectFit: 'contain' }}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: textColor }}>{t.team_name}</div>
                              <div style={{ fontSize: '11px', color: subText }}>{t.abbreviation}</div>
                            </div>
                            {isRival && (
                              <div style={{
                                fontSize: '10px', fontWeight: 700,
                                color: '#ef4444', backgroundColor: '#ef444415',
                                padding: '2px 8px', borderRadius: 6,
                              }} title="Division trade penalty applies">
                                RIVAL
                              </div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
