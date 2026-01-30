'use client'
import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayerCard, PlayerData } from './PlayerCard'
import { useTheme } from '@/contexts/ThemeContext'

const POSITION_GROUPS: Record<string, string[]> = {
  nfl: ['ALL', 'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'],
  nba: ['ALL', 'PG', 'SG', 'SF', 'PF', 'C'],
  nhl: ['ALL', 'C', 'LW', 'RW', 'D', 'G'],
  mlb: ['ALL', 'SP', 'RP', 'C', 'IF', 'OF', 'DH'],
}

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

interface OpponentRosterPanelProps {
  teamKey: string
  sport: string
  teamColor: string
  selectedIds: Set<string>
  onToggle: (playerId: string) => void
  roster: PlayerData[]
  setRoster: (players: PlayerData[]) => void
  loading: boolean
  setLoading: (v: boolean) => void
  onAddCustomPlayer: (name: string, position: string) => void
  onViewFit?: (player: PlayerData) => void
  onDraftClick?: () => void
}

export function OpponentRosterPanel({
  teamKey, sport, teamColor, selectedIds, onToggle,
  roster, setRoster, loading, setLoading, onAddCustomPlayer, onViewFit, onDraftClick,
}: OpponentRosterPanelProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState('ALL')
  const [customName, setCustomName] = useState('')
  const [customPos, setCustomPos] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const positions = POSITION_GROUPS[sport] || POSITION_GROUPS.nfl

  useEffect(() => {
    if (!teamKey || !sport) return
    setLoading(true)
    setSearch('')
    setPosFilter('ALL')
    fetch(`/api/gm/roster?team_key=${encodeURIComponent(teamKey)}&sport=${encodeURIComponent(sport)}`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed'))
      .then(data => setRoster(data.players || []))
      .catch(() => setRoster([]))
      .finally(() => setLoading(false))
  }, [teamKey, sport])

  const filtered = useMemo(() => {
    let result = roster
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => p.full_name.toLowerCase().includes(q))
    }
    if (posFilter !== 'ALL') {
      result = result.filter(p => getPositionGroup(p.position, sport) === posFilter || p.position === posFilter)
    }
    return result
  }, [roster, search, posFilter, sport])

  const inputBg = isDark ? '#374151' : '#ffffff'
  const inputBorder = isDark ? '#4b5563' : '#d1d5db'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  function handleAddCustom() {
    if (!customName.trim()) return
    onAddCustomPlayer(customName.trim(), customPos.trim() || 'Unknown')
    setCustomName('')
    setCustomPos('')
    setShowCustom(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: subText, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Opponent Roster
        </span>
        <button
          onClick={() => setShowCustom(!showCustom)}
          style={{
            padding: '3px 10px', borderRadius: 6, border: `1px solid ${inputBorder}`,
            backgroundColor: 'transparent', color: subText, fontSize: '11px',
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          {showCustom ? 'Cancel' : '+ Custom Player'}
        </button>
      </div>

      {/* Custom player input */}
      {showCustom && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <input
            type="text"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            placeholder="Player name"
            onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
            style={{
              flex: 1, padding: '6px 10px', borderRadius: 6,
              border: `1px solid ${inputBorder}`, backgroundColor: inputBg,
              color: isDark ? '#fff' : '#000', fontSize: '13px', outline: 'none',
            }}
          />
          <input
            type="text"
            value={customPos}
            onChange={e => setCustomPos(e.target.value)}
            placeholder="Pos"
            onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
            style={{
              width: 60, padding: '6px 8px', borderRadius: 6,
              border: `1px solid ${inputBorder}`, backgroundColor: inputBg,
              color: isDark ? '#fff' : '#000', fontSize: '13px', outline: 'none',
            }}
          />
          <button
            onClick={handleAddCustom}
            style={{
              padding: '6px 14px', borderRadius: 6, border: 'none',
              backgroundColor: '#bc0000', color: '#fff',
              fontWeight: 600, fontSize: '13px', cursor: 'pointer',
            }}
          >
            Add
          </button>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search players..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '8px 12px', borderRadius: '8px',
          border: `1px solid ${inputBorder}`, backgroundColor: inputBg,
          color: isDark ? '#fff' : '#000', fontSize: '13px', outline: 'none',
          marginBottom: 8,
        }}
      />

      {/* Position filters + Draft button */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
        {positions.map(pos => (
          <button
            key={pos}
            onClick={() => setPosFilter(pos)}
            style={{
              padding: '4px 10px', borderRadius: '6px', border: 'none',
              cursor: 'pointer', fontSize: '11px', fontWeight: 600,
              backgroundColor: posFilter === pos ? teamColor : (isDark ? '#374151' : '#e5e7eb'),
              color: posFilter === pos ? '#fff' : subText,
            }}
          >
            {pos}
          </button>
        ))}
        {onDraftClick && (
          <button
            onClick={onDraftClick}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: `2px solid ${teamColor}`,
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: 'transparent',
              color: teamColor,
              transition: 'all 0.15s',
              marginLeft: 4,
            }}
          >
            📋 Draft
          </button>
        )}
      </div>

      {/* Selected count */}
      {selectedIds.size > 0 && (
        <div style={{ marginBottom: 6, fontSize: '12px', fontWeight: 600, color: teamColor }}>
          {selectedIds.size} selected
        </div>
      )}

      {/* Player list - single column for better card display */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingRight: 4,
      }}>
        {loading ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                height: 160, borderRadius: 12,
                backgroundColor: isDark ? '#1f293780' : '#f3f4f680',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
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
