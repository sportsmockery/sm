'use client'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

const TEAMS = [
  { key: 'bears', label: 'Bears', sport: 'nfl', color: '#0B162A', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png' },
  { key: 'bulls', label: 'Bulls', sport: 'nba', color: '#CE1141', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png' },
  { key: 'blackhawks', label: 'Blackhawks', sport: 'nhl', color: '#CF0A2C', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png' },
  { key: 'cubs', label: 'Cubs', sport: 'mlb', color: '#0E3386', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png' },
  { key: 'whitesox', label: 'White Sox', sport: 'mlb', color: '#27251F', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png' },
]

interface TeamSelectorProps {
  selected: string
  onSelect: (teamKey: string) => void
}

export function TeamSelector({ selected, onSelect }: TeamSelectorProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      overflowX: 'auto',
      padding: '4px 0',
      WebkitOverflowScrolling: 'touch',
      scrollSnapType: 'x mandatory',
    }}>
      {TEAMS.map(t => {
        const isSelected = selected === t.key
        return (
          <motion.button
            key={t.key}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(t.key)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 20px',
              borderRadius: '12px',
              border: `2px solid ${isSelected ? t.color : (isDark ? '#374151' : '#d1d5db')}`,
              backgroundColor: isSelected ? `${t.color}15` : 'transparent',
              cursor: 'pointer',
              flexShrink: 0,
              scrollSnapAlign: 'start',
              transition: 'background-color 0.2s',
            }}
          >
            <img
              src={t.logo}
              alt={t.label}
              style={{ width: 32, height: 32, objectFit: 'contain' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span style={{
              fontWeight: 700,
              fontSize: '14px',
              color: isSelected ? t.color : (isDark ? '#d1d5db' : '#374151'),
            }}>
              {t.label}
            </span>
            {isSelected && (
              <motion.div
                layoutId="team-underline"
                style={{
                  position: 'absolute',
                  bottom: -2,
                  left: '20%',
                  right: '20%',
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: t.color,
                }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

export { TEAMS }
