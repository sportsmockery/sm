'use client'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import type { MLBProspect } from '@/types/gm'

interface ProspectCardProps {
  prospect: MLBProspect
  selected: boolean
  teamColor: string
  onClick: () => void
}

// Level colors for visual distinction
const LEVEL_COLORS: Record<string, string> = {
  'AAA': '#22c55e',
  'AA': '#3b82f6',
  'A+': '#8b5cf6',
  'A': '#a855f7',
  'R': '#f59e0b',
  'Rk': '#f59e0b',
}

// Grade colors for prospect badges
const GRADE_COLORS: Record<string, string> = {
  'A+': '#22c55e',
  'A': '#22c55e',
  'A-': '#22c55e',
  'B+': '#3b82f6',
  'B': '#3b82f6',
  'B-': '#3b82f6',
  'C+': '#f59e0b',
  'C': '#f59e0b',
  'C-': '#f59e0b',
  'D': '#ef4444',
}

// Tier colors for valuation display
const TIER_COLORS: Record<string, string> = {
  'elite': '#dc2626',
  'plus': '#22c55e',
  'average': '#3b82f6',
  'organizational': '#9ca3af',
}

export function ProspectCard({ prospect, selected, teamColor, onClick }: ProspectCardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  // Support both field naming conventions
  const level = prospect.current_level || prospect.level || ''
  const rank = prospect.team_rank || prospect.rank || 0
  const isTop100 = prospect.mlb_top_100_rank != null || prospect.isTop100 === true
  const top100Rank = prospect.mlb_top_100_rank

  const levelColor = LEVEL_COLORS[level] || '#6b7280'
  const gradeColor = GRADE_COLORS[prospect.prospect_grade] || '#6b7280'

  // Generate initials for avatar placeholder
  const initials = prospect.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 12,
        backgroundColor: selected
          ? `${teamColor}15`
          : isDark ? '#1f2937' : '#ffffff',
        border: selected
          ? `2px solid ${teamColor}`
          : `1px solid ${borderColor}`,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Rank Badge (top left corner) */}
      {rank > 0 && (
        <div style={{
          position: 'absolute',
          top: -8,
          left: -8,
          width: 28,
          height: 28,
          borderRadius: '50%',
          backgroundColor: isTop100 ? '#dc2626' : teamColor,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 800,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}>
          #{rank}
        </div>
      )}

      {/* Avatar */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        backgroundColor: prospect.headshot_url ? 'transparent' : `${levelColor}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        border: `2px solid ${levelColor}40`,
      }}>
        {prospect.headshot_url ? (
          <img
            src={prospect.headshot_url}
            alt={prospect.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <span style={{ fontSize: 14, fontWeight: 700, color: levelColor }}>{initials}</span>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: textColor,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {prospect.name}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 2,
        }}>
          {/* Level badge */}
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 4,
            backgroundColor: `${levelColor}20`,
            color: levelColor,
          }}>
            {level}
          </span>
          <span style={{ fontSize: 12, color: subText }}>
            {prospect.position}
          </span>
          <span style={{ fontSize: 12, color: subText }}>
            Age {prospect.age}
          </span>
        </div>

        {/* Valuation row (when available) */}
        {(prospect.prospect_fv_bucket || prospect.prospect_tier || prospect.prospect_surplus_value_millions) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 4,
          }}>
            {/* FV bucket */}
            {prospect.prospect_fv_bucket && (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: 3,
                backgroundColor: isDark ? '#374151' : '#e5e7eb',
                color: subText,
              }}>
                FV {prospect.prospect_fv_bucket}
              </span>
            )}
            {/* Tier badge */}
            {prospect.prospect_tier && (
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '1px 5px',
                borderRadius: 3,
                backgroundColor: `${TIER_COLORS[prospect.prospect_tier] || '#9ca3af'}20`,
                color: TIER_COLORS[prospect.prospect_tier] || '#9ca3af',
                textTransform: 'capitalize',
              }}>
                {prospect.prospect_tier}
              </span>
            )}
            {/* Surplus value */}
            {prospect.prospect_surplus_value_millions && (
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#22c55e',
              }}>
                ${prospect.prospect_surplus_value_millions.toFixed(1)}M
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right side: badges */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4,
        flexShrink: 0,
      }}>
        {/* Grade badge */}
        {prospect.prospect_grade && (
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 4,
            backgroundColor: `${gradeColor}20`,
            color: gradeColor,
          }}>
            {prospect.prospect_grade}
          </span>
        )}
        {/* Top 100 or Org badge */}
        {isTop100 && top100Rank ? (
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 4,
            backgroundColor: '#dc262620',
            color: '#dc2626',
          }}>
            #{top100Rank} MLB
          </span>
        ) : rank <= 10 ? (
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 4,
            backgroundColor: `${teamColor}20`,
            color: teamColor,
          }}>
            Org #{rank}
          </span>
        ) : null}

        {/* ETA */}
        {prospect.eta && (
          <span style={{
            fontSize: 10,
            fontWeight: 500,
            color: subText,
          }}>
            ETA {prospect.eta}
          </span>
        )}
      </div>

      {/* Selected checkmark */}
      {selected && (
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: teamColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
      )}
    </motion.div>
  )
}
