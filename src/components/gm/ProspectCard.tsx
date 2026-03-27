'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import type { ProspectData } from '@/types/gm'

interface ProspectCardProps {
  prospect: ProspectData
  selected: boolean
  teamColor: string
  onClick: () => void
}

// Level colors for visual distinction (MLB + NHL)
const LEVEL_COLORS: Record<string, string> = {
  // MLB
  'AAA': '#00D4FF',
  'AA': '#00D4FF',
  'A+': '#D6B05E',
  'A': '#a855f7',
  'R': '#f59e0b',
  'Rk': '#f59e0b',
  // NHL
  'AHL': '#00D4FF',
  'NHL': '#BC0000',
  'OHL': '#00D4FF',
  'WHL': '#00D4FF',
  'QMJHL': '#00D4FF',
  'USHL': '#D6B05E',
  'NCAA': '#D6B05E',
  'USNTDP': '#a855f7',
  'SHL': '#00D4FF',
  'KHL': '#BC0000',
  'Liiga': '#06b6d4',
  'NLA': '#06b6d4',
}

// Grade colors for prospect badges (MLB letter grades)
const GRADE_COLORS: Record<string, string> = {
  'A+': '#00D4FF',
  'A': '#00D4FF',
  'A-': '#00D4FF',
  'B+': '#00D4FF',
  'B': '#00D4FF',
  'B-': '#00D4FF',
  'C+': '#f59e0b',
  'C': '#f59e0b',
  'C-': '#f59e0b',
  'D': '#BC0000',
}

// Get tier color (handles both NHL and MLB tier names)
function getTierColor(tier: string | undefined): string {
  if (!tier) return '#808080'
  const t = tier.toLowerCase()
  if (t.includes('elite')) return '#FFD700'       // Gold
  if (t.includes('high-end') || t.includes('plus')) return '#9B30FF' // Purple
  if (t.includes('very good')) return '#1E90FF'    // Blue
  if (t.includes('good') || t.includes('average')) return '#32CD32' // Green
  if (t.includes('below') || t.includes('organizational')) return '#808080' // Gray
  if (t.includes('fringe') || t.includes('longshot')) return '#404040' // Dark gray
  return '#808080'
}

export function ProspectCard({ prospect, selected, teamColor, onClick }: ProspectCardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const textColor = 'var(--sm-text)'
  const subText = 'var(--sm-text-muted)'
  const borderColor = 'var(--sm-border)'

  // Support multiple field naming conventions (API compatibility)
  const level = prospect.current_level || prospect.currentlevel || prospect.level || ''
  const rank = prospect.org_rank || prospect.orgrank || prospect.team_rank || prospect.rank || 0
  const isTop5 = rank <= 5  // Top 5 org prospects highlighted
  const gradeNumeric = prospect.prospect_grade_numeric || prospect.prospectgradenumeric || 0
  const grade = prospect.prospect_grade || prospect.prospectgrade || ''
  const tier = prospect.prospect_tier || prospect.tier || ''
  const tradeValue = prospect.trade_value || prospect.tradevalue || 0
  const headshot = prospect.headshot_url || prospect.headshoturl || ''
  const eta = prospect.eta || ''
  const fvBucket = prospect.prospect_fv_bucket || prospect.fvbucket
  const surplusValue = prospect.prospect_surplus_value_millions

  // NHL-specific fields
  const shootsCatches = prospect.shoots_catches || prospect.shootscatches
  const nhlProjection = prospect.nhl_projection || prospect.nhlprojection
  const contractStatus = prospect.contract_status || prospect.contractstatus

  const levelColor = LEVEL_COLORS[level] || '#6b7280'
  const gradeColor = grade ? (GRADE_COLORS[grade] || getTierColor(tier) || '#6b7280') : getTierColor(tier)

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
          : 'var(--sm-card)',
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
          backgroundColor: isTop5 ? '#BC0000' : teamColor,
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
        position: 'relative',
        width: 44,
        height: 44,
        borderRadius: '50%',
        backgroundColor: headshot ? 'transparent' : `${levelColor}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        border: `2px solid ${levelColor}40`,
      }}>
        {headshot ? (
          <Image
            src={headshot}
            alt={prospect.name}
            fill
            sizes="44px"
            style={{ objectFit: 'cover' }}
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
        {(fvBucket || tier || surplusValue) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 4,
          }}>
            {/* FV bucket (MLB) */}
            {fvBucket && (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: 3,
                backgroundColor: 'var(--sm-border)',
                color: subText,
              }}>
                FV {fvBucket}
              </span>
            )}
            {/* Tier badge */}
            {tier && (
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '1px 5px',
                borderRadius: 3,
                backgroundColor: `${getTierColor(tier)}20`,
                color: getTierColor(tier),
                textTransform: 'capitalize',
              }}>
                {tier}
              </span>
            )}
            {/* Surplus value (MLB) */}
            {surplusValue && (
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#00D4FF',
              }}>
                ${surplusValue.toFixed(1)}M
              </span>
            )}
          </div>
        )}

        {/* NHL-specific row */}
        {(shootsCatches || nhlProjection || contractStatus) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 4,
            flexWrap: 'wrap',
          }}>
            {/* Shoots/Catches */}
            {shootsCatches && (
              <span style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: 'var(--sm-border)',
                color: subText,
                fontWeight: 600,
              }}>
                {shootsCatches === 'L' ? '↙ Left' : '↗ Right'}
              </span>
            )}
            {/* Contract status */}
            {contractStatus && (
              <span style={{
                fontSize: 9,
                padding: '1px 4px',
                borderRadius: 3,
                backgroundColor: contractStatus === 'ELC' ? '#065f46' : '#374151',
                color: '#fff',
                fontWeight: 600,
              }}>
                {contractStatus}
              </span>
            )}
            {/* NHL projection */}
            {nhlProjection && (
              <span style={{
                fontSize: 9,
                color: subText,
              }}>
                {nhlProjection}
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
        {(grade || gradeNumeric > 0) && (
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 4,
            backgroundColor: `${gradeColor}20`,
            color: gradeColor,
          }}>
            {grade || gradeNumeric}
          </span>
        )}
        {/* Trade value badge */}
        {tradeValue > 0 && (
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 4,
            backgroundColor: tradeValue >= 80 ? '#BC000020' : `${teamColor}20`,
            color: tradeValue >= 80 ? '#BC0000' : teamColor,
          }}>
            TV: {tradeValue}
          </span>
        )}

        {/* ETA */}
        {eta && (
          <span style={{
            fontSize: 10,
            fontWeight: 500,
            color: subText,
          }}>
            ETA {eta}
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
