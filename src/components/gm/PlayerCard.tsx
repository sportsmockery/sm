'use client'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

export interface PlayerData {
  player_id: string
  full_name: string
  position: string
  jersey_number: number | null
  headshot_url: string | null
  age: number | null
  weight_lbs: number | null
  college: string | null
  years_exp: number | null
  draft_info: string | null
  espn_id: string | null
  stat_line: string
  stats: Record<string, any>
  status?: string
  cap_hit?: number | null
  contract_years?: number | null
  is_rookie_deal?: boolean | null
}

interface PlayerCardProps {
  player: PlayerData
  selected?: boolean
  compact?: boolean
  teamColor?: string
  onClick?: () => void
}

export function PlayerCard({ player, selected = false, compact = false, teamColor = '#bc0000', onClick }: PlayerCardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const borderColor = selected ? teamColor : (isDark ? '#374151' : '#e5e7eb')
  const textColor = isDark ? '#ffffff' : '#1a1a1a'
  const subTextColor = isDark ? '#9ca3af' : '#6b7280'

  if (compact) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 10px',
          borderRadius: '8px',
          backgroundColor: isDark ? '#374151' : '#f3f4f6',
          border: `1px solid ${borderColor}`,
        }}
      >
        {player.headshot_url ? (
          <img
            src={player.headshot_url}
            alt={player.full_name}
            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            backgroundColor: teamColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '10px', fontWeight: 700,
          }}>
            {player.jersey_number || player.full_name.charAt(0)}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {player.full_name}
          </div>
          <div style={{ fontSize: '11px', color: subTextColor }}>{player.position}</div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layoutId={`player-${player.player_id}`}
      whileHover={{ scale: 1.02 }}
      animate={selected ? { scale: 1.03 } : { scale: 1 }}
      onClick={onClick}
      style={{
        position: 'relative',
        padding: '12px',
        borderRadius: '12px',
        backgroundColor: cardBg,
        border: `2px solid ${borderColor}`,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: selected ? `0 0 12px ${teamColor}40` : 'none',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Jersey number badge */}
      {player.jersey_number && (
        <div style={{
          position: 'absolute', top: 8, left: 8,
          backgroundColor: teamColor, color: '#fff',
          fontSize: '11px', fontWeight: 700,
          width: 24, height: 24, borderRadius: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {player.jersey_number}
        </div>
      )}

      {/* Position badge */}
      <div style={{
        position: 'absolute', top: 8, right: 8,
        display: 'flex', gap: 4, alignItems: 'center',
      }}>
        {player.status && player.status !== 'Active' && (
          <span style={{
            fontSize: '9px', fontWeight: 700,
            padding: '2px 6px', borderRadius: '10px',
            backgroundColor: player.status === 'IR' ? '#ef444430' : '#6b728030',
            color: player.status === 'IR' ? '#ef4444' : '#6b7280',
          }}>
            {player.status === 'Practice Squad' ? 'PS' : player.status}
          </span>
        )}
        <span style={{
          backgroundColor: isDark ? '#374151' : '#f3f4f6',
          color: subTextColor, fontSize: '10px', fontWeight: 600,
          padding: '2px 8px', borderRadius: '10px',
        }}>
          {player.position}
        </span>
      </div>

      {/* Headshot */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, marginTop: 4 }}>
        {player.headshot_url ? (
          <img
            src={player.headshot_url}
            alt={player.full_name}
            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${isDark ? '#374151' : '#e5e7eb'}` }}
            onError={(e) => {
              const el = e.target as HTMLImageElement
              el.style.display = 'none'
              el.nextElementSibling?.setAttribute('style', 'display:flex')
            }}
          />
        ) : null}
        <div style={{
          display: player.headshot_url ? 'none' : 'flex',
          width: 56, height: 56, borderRadius: '50%',
          backgroundColor: `${teamColor}20`, border: `2px solid ${teamColor}40`,
          alignItems: 'center', justifyContent: 'center',
          color: teamColor, fontSize: '20px', fontWeight: 700,
        }}>
          {player.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
      </div>

      {/* Name */}
      <div style={{
        textAlign: 'center', fontWeight: 700, fontSize: '13px',
        color: textColor, marginBottom: 4,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {player.full_name}
      </div>

      {/* Stat line */}
      {player.stat_line && (
        <div style={{
          textAlign: 'center', fontSize: '11px', color: teamColor,
          fontWeight: 600, marginBottom: 4,
        }}>
          {player.stat_line}
        </div>
      )}

      {/* Details */}
      <div style={{ textAlign: 'center', fontSize: '10px', color: subTextColor }}>
        {[
          player.age ? `Age ${player.age}` : null,
          player.cap_hit ? `$${(player.cap_hit / 1_000_000).toFixed(1)}M` : null,
          player.college,
        ].filter(Boolean).join(' | ')}
      </div>

      {/* Selected checkmark */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute', bottom: 6, right: 6,
            width: 20, height: 20, borderRadius: '50%',
            backgroundColor: teamColor, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  )
}
