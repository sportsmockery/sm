'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayerCard, PlayerData } from './PlayerCard'
import { useTheme } from '@/contexts/ThemeContext'

const POSITION_GROUPS: Record<string, string[]> = {
  nfl: ['ALL', 'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'],
  nba: ['ALL', 'PG', 'SG', 'SF', 'PF', 'C'],
  nhl: ['ALL', 'C', 'LW', 'RW', 'D', 'G'],
  mlb: ['ALL', 'SP', 'RP', 'C', 'IF', 'OF', 'DH'],
}

// Map positions to their group for filtering
function getPositionGroup(pos: string, sport: string): string {
  if (sport === 'nfl') {
    if (['LT', 'RT', 'LG', 'RG', 'C', 'OT', 'OG', 'OL', 'T', 'G'].includes(pos)) return 'OL'
    if (['DE', 'DT', 'NT', 'DL', 'EDGE'].includes(pos)) return 'DL'
    if (['ILB', 'OLB', 'MLB', 'LB'].includes(pos)) return 'LB'
    if (['FS', 'SS', 'S', 'DB'].includes(pos)) return 'S'
    return pos
  }
  if (sport === 'mlb') {
    if (['1B', '2B', '3B', 'SS'].includes(pos)) return 'IF'
    if (['LF', 'CF', 'RF'].includes(pos)) return 'OF'
    if (['CL', 'MR', 'SU'].includes(pos)) return 'RP'
    return pos
  }
  return pos
}

interface RosterPanelProps {
  players: PlayerData[]
  loading: boolean
  selectedIds: Set<string>
  onToggle: (playerId: string) => void
  sport: string
  teamColor: string
  onViewFit?: (player: PlayerData) => void
}

export function RosterPanel({ players, loading, selectedIds, onToggle, sport, teamColor, onViewFit }: RosterPanelProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState('ALL')

  const positions = POSITION_GROUPS[sport] || POSITION_GROUPS.nfl

  const filtered = useMemo(() => {
    let result = players
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => p.full_name.toLowerCase().includes(q))
    }
    if (posFilter !== 'ALL') {
      result = result.filter(p => getPositionGroup(p.position, sport) === posFilter || p.position === posFilter)
    }
    return result
  }, [players, search, posFilter, sport])

  const inputBg = isDark ? '#374151' : '#ffffff'
  const inputBorder = isDark ? '#4b5563' : '#d1d5db'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search */}
      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            border: `1px solid ${inputBorder}`,
            backgroundColor: inputBg,
            color: isDark ? '#fff' : '#000',
            fontSize: '13px',
            outline: 'none',
          }}
        />
      </div>

      {/* Position filters */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
        {positions.map(pos => (
          <button
            key={pos}
            onClick={() => setPosFilter(pos)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: posFilter === pos ? teamColor : (isDark ? '#374151' : '#e5e7eb'),
              color: posFilter === pos ? '#fff' : subText,
              transition: 'background-color 0.15s',
            }}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* Selected count */}
      {selectedIds.size > 0 && (
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: teamColor }}>
            {selectedIds.size} selected
          </span>
        </div>
      )}

      {/* Player grid */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        paddingRight: 4,
      }}>
        {loading ? (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 160,
                  borderRadius: 12,
                  backgroundColor: isDark ? '#1f293780' : '#f3f4f680',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
            ))}
          </>
        ) : (
          <AnimatePresence>
            {filtered.map((player, i) => (
              <motion.div
                key={player.player_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <PlayerCard
                  player={player}
                  selected={selectedIds.has(player.player_id)}
                  teamColor={teamColor}
                  onClick={() => onToggle(player.player_id)}
                  onViewFit={onViewFit}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 20, color: subText, fontSize: '13px' }}>
          No players found
        </div>
      )}
    </div>
  )
}
