'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import type { AssetType, DraftPick, MLBProspect, GMPlayerData, formatDraftPick, formatProspect, formatSalary, ASSET_ACCENT_COLORS } from '@/types/gm'
import type { PlayerData } from './PlayerCard'

// Icons as inline SVGs
const PlayerIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={color} stroke="none">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
)

const DraftPickIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <rect x="4" y="4" width="16" height="18" rx="2" />
    <line x1="9" y1="9" x2="15" y2="9" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="12" y2="17" />
  </svg>
)

const ProspectIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M12 2L2 12l10 10 10-10L12 2z" />
  </svg>
)

interface AssetRowProps {
  type: AssetType
  player?: PlayerData | GMPlayerData
  pick?: DraftPick
  prospect?: MLBProspect
  teamColor: string
  teamAbbrev?: string
  onRemove?: () => void
  showTooltip?: boolean
  compact?: boolean    // Smaller row for 3-team view
  showOnly?: boolean   // Hide remove button, display only
}

export function AssetRow({
  type,
  player,
  pick,
  prospect,
  teamColor,
  teamAbbrev,
  onRemove,
  showTooltip = true,
  compact = false,
  showOnly = false,
}: AssetRowProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [hovered, setHovered] = useState(false)

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  // Compact sizing
  const padding = compact ? '6px 8px' : '10px 12px'
  const iconSize = compact ? 24 : 32
  const primaryFontSize = compact ? 11 : 13
  const secondaryFontSize = compact ? 10 : 11
  const minHeight = compact ? 36 : 48

  // Determine accent color
  const accentColor = type === 'PLAYER'
    ? teamColor
    : type === 'DRAFT_PICK'
      ? '#8b5cf6'
      : '#22c55e'

  // Build display content based on type
  let primaryText = ''
  let secondaryText = ''
  let rightText = ''
  let rightBadge = ''
  let tooltipText = ''
  let avatarUrl: string | null = null
  let avatarInitials = ''

  if (type === 'PLAYER' && player) {
    primaryText = player.full_name
    const ageStr = player.age ? `Age: ${player.age}` : ''
    const contractStr = player.cap_hit ? `Contract: $${(player.cap_hit / 1000000).toFixed(1)}M` : ''
    secondaryText = player.position + (ageStr ? ` - ${ageStr}` : '') + (contractStr ? ` ${contractStr}` : '')
    rightText = ''  // Contract now shown in secondaryText
    avatarUrl = player.headshot_url
    avatarInitials = player.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)
    tooltipText = player.stat_line || ''
  } else if (type === 'DRAFT_PICK' && pick) {
    const pickNum = pick.pickNumber ? ` Pick ${pick.pickNumber}` : ''
    primaryText = `${pick.year} Round ${pick.round}${pickNum}`
    secondaryText = pick.originalTeam && pick.originalTeam !== 'Own'
      ? `Original: ${pick.originalTeam}`
      : pick.condition || ''
    rightBadge = 'Pick'
    tooltipText = 'Draft pick value varies by position'
  } else if (type === 'PROSPECT' && prospect) {
    const rank = prospect.org_rank || prospect.team_rank || prospect.rank || 0
    const level = prospect.current_level || prospect.level || ''
    const rankPrefix = rank ? `#${rank} ` : ''
    primaryText = `${rankPrefix}${prospect.name}`
    secondaryText = level ? `${level} - ${prospect.position}` : prospect.position
    if (prospect.age) secondaryText += ` - Age ${prospect.age}`
    rightBadge = prospect.prospect_grade || 'Prospect'
    if (prospect.trade_value) {
      rightText = `TV: ${prospect.trade_value}`
    } else if (prospect.eta) {
      rightText = `ETA ${prospect.eta}`
    }
    avatarInitials = prospect.name.split(' ').map(n => n[0]).join('').slice(0, 2)
    avatarUrl = prospect.headshot_url || null
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: type === 'PLAYER' ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: type === 'PLAYER' ? -10 : 10 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 6 : 10,
        padding,
        borderRadius: compact ? 6 : 10,
        backgroundColor: isDark ? '#1f2937' : '#f9fafb',
        border: `1px solid ${borderColor}`,
        borderLeft: `3px solid ${accentColor}`,
        minHeight,
      }}
    >
      {/* Left: Icon or Avatar */}
      <div style={{
        width: iconSize,
        height: iconSize,
        borderRadius: type === 'PLAYER' ? '50%' : compact ? 4 : 6,
        backgroundColor: avatarUrl ? 'transparent' : `${accentColor}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : type === 'PLAYER' ? (
          avatarInitials ? (
            <span style={{ fontSize: 11, fontWeight: 700, color: accentColor }}>{avatarInitials}</span>
          ) : (
            <PlayerIcon color={accentColor} />
          )
        ) : type === 'DRAFT_PICK' ? (
          <DraftPickIcon color={accentColor} />
        ) : (
          avatarInitials ? (
            <span style={{ fontSize: 11, fontWeight: 700, color: accentColor }}>{avatarInitials}</span>
          ) : (
            <ProspectIcon color={accentColor} />
          )
        )}
      </div>

      {/* Middle: Labels */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: primaryFontSize,
          fontWeight: 600,
          color: textColor,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {primaryText}
        </div>
        {secondaryText && !compact && (
          <div style={{
            fontSize: secondaryFontSize,
            color: subText,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {secondaryText}
          </div>
        )}
      </div>

      {/* Right: Stat/Badge + Remove */}
      <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 4 : 8, flexShrink: 0 }}>
        {rightText && !compact && (
          <span style={{ fontSize: 11, color: subText, fontWeight: 500 }}>
            {rightText}
          </span>
        )}
        {rightBadge && !compact && (
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: 4,
            backgroundColor: `${accentColor}20`,
            color: accentColor,
          }}>
            {rightBadge}
          </span>
        )}
        {!showOnly && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#ef4444',
              fontSize: compact ? 14 : 16,
              fontWeight: 700,
              padding: compact ? 2 : 4,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            &times;
          </button>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && tooltipText && hovered && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 8,
          padding: '6px 10px',
          borderRadius: 6,
          backgroundColor: isDark ? '#374151' : '#1f2937',
          color: '#fff',
          fontSize: 11,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          zIndex: 50,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {tooltipText}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            border: '6px solid transparent',
            borderTopColor: isDark ? '#374151' : '#1f2937',
          }} />
        </div>
      )}
    </motion.div>
  )
}
