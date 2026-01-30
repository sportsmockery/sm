'use client'
import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayerCard, PlayerData } from './PlayerCard'
import { DraftPickList } from './DraftPickList'
import { useTheme } from '@/contexts/ThemeContext'
import type { DraftPick } from '@/types/gm'

const POSITION_GROUPS: Record<string, string[]> = {
  nfl: ['ALL', 'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'],
  nba: ['ALL', 'PG', 'SG', 'SF', 'PF', 'C'],
  nhl: ['ALL', 'C', 'LW', 'RW', 'D', 'G'],
  mlb: ['ALL', 'SP', 'RP', 'C', 'IF', 'OF', 'DH'],
}

const SPORT_ROUNDS: Record<string, number> = {
  nfl: 7, nba: 2, nhl: 7, mlb: 20,
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
  teamName?: string
  selectedIds: Set<string>
  onToggle: (playerId: string) => void
  roster: PlayerData[]
  setRoster: (players: PlayerData[]) => void
  loading: boolean
  setLoading: (v: boolean) => void
  onAddCustomPlayer: (name: string, position: string) => void
  onViewFit?: (player: PlayerData) => void
  // Draft pick props
  draftPicks: DraftPick[]
  onAddDraftPick: (pick: DraftPick) => void
  onRemoveDraftPick: (index: number) => void
  compact?: boolean
}

export function OpponentRosterPanel({
  teamKey, sport, teamColor, teamName, selectedIds, onToggle,
  roster, setRoster, loading, setLoading, onAddCustomPlayer, onViewFit,
  draftPicks, onAddDraftPick, onRemoveDraftPick, compact = false,
}: OpponentRosterPanelProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState('ALL')
  const [customName, setCustomName] = useState('')
  const [customPos, setCustomPos] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [showDraft, setShowDraft] = useState(false)
  const [draftYear, setDraftYear] = useState(2026)
  const [draftRound, setDraftRound] = useState(1)
  const [draftCondition, setDraftCondition] = useState('')

  const positions = POSITION_GROUPS[sport] || POSITION_GROUPS.nfl
  const maxRound = SPORT_ROUNDS[sport] || 7
  const years = [2026, 2027, 2028, 2029, 2030]
  const rounds = Array.from({ length: maxRound }, (_, i) => i + 1)

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

  const handleAddDraftPick = () => {
    onAddDraftPick({ year: draftYear, round: draftRound, condition: draftCondition.trim() || undefined })
    setDraftCondition('')
  }

  // Handler for DraftPickList toggle
  const handleToggleDraftPick = (pick: DraftPick) => {
    const existingIndex = draftPicks.findIndex(p => p.year === pick.year && p.round === pick.round)
    if (existingIndex >= 0) {
      onRemoveDraftPick(existingIndex)
    } else {
      onAddDraftPick(pick)
    }
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
          {showCustom ? 'Cancel' : '+ Custom'}
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

      {/* Search - only show when viewing players */}
      {!showDraft && (
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
      )}

      {/* Position filters + Draft button */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
        {!showDraft && positions.map(pos => (
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
        <button
          onClick={() => setShowDraft(!showDraft)}
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: showDraft ? teamColor : (isDark ? '#374151' : '#e5e7eb'),
            color: showDraft ? '#fff' : subText,
            transition: 'background-color 0.15s',
          }}
        >
          Draft
        </button>
      </div>

      {/* Draft Pick List (collapsible checkbox version) */}
      {!showDraft && (
        <DraftPickList
          sport={sport}
          selectedPicks={draftPicks}
          onToggle={handleToggleDraftPick}
          teamColor={teamColor}
          teamName={teamName}
          isOwn={false}
        />
      )}

      {/* Selected count */}
      {(selectedIds.size > 0 || draftPicks.length > 0) && !showDraft && (
        <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {selectedIds.size > 0 && (
            <span style={{ fontSize: '12px', fontWeight: 600, color: teamColor }}>
              {selectedIds.size} player{selectedIds.size > 1 ? 's' : ''}
            </span>
          )}
          {draftPicks.length > 0 && (
            <span style={{ fontSize: '12px', fontWeight: 600, color: teamColor }}>
              {draftPicks.length} pick{draftPicks.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Draft Pick Selection View */}
      {showDraft ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#fff' : '#1a1a1a', marginBottom: 12 }}>
            Select Draft Picks to Receive
          </div>

          {/* Draft pick selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <select
                value={draftYear}
                onChange={e => setDraftYear(+e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${inputBorder}`,
                  backgroundColor: inputBg,
                  color: isDark ? '#fff' : '#000',
                  fontSize: '13px',
                  flex: 1,
                }}
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select
                value={draftRound}
                onChange={e => setDraftRound(+e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${inputBorder}`,
                  backgroundColor: inputBg,
                  color: isDark ? '#fff' : '#000',
                  fontSize: '13px',
                  flex: 1,
                }}
              >
                {rounds.map(r => <option key={r} value={r}>Round {r}</option>)}
              </select>
            </div>
            <input
              type="text"
              value={draftCondition}
              onChange={e => setDraftCondition(e.target.value)}
              placeholder="Condition (optional)"
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${inputBorder}`,
                backgroundColor: inputBg,
                color: isDark ? '#fff' : '#000',
                fontSize: '13px',
              }}
            />
            <button
              onClick={handleAddDraftPick}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: teamColor,
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Add Pick
            </button>
          </div>

          {/* Selected draft picks */}
          {draftPicks.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
                Selected Picks
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {draftPicks.map((pk, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: 8,
                    backgroundColor: isDark ? '#374151' : '#f3f4f6',
                    border: `1px solid ${teamColor}40`,
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#fff' : '#1a1a1a' }}>
                      {pk.year} Round {pk.round}{pk.condition ? ` (${pk.condition})` : ''}
                    </span>
                    <button
                      onClick={() => onRemoveDraftPick(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 700, fontSize: '16px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
