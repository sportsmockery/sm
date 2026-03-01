'use client'

import { motion, useReducedMotion } from 'framer-motion'

export interface StatChip {
  player: string
  stat: string
  value: string
}

interface QuickStatsProps {
  teamSlug: string
  teamLabel: string
  league: string
  stats?: StatChip[]
}

// Placeholder stats per team — will be replaced with live Supabase data
const PLACEHOLDER_STATS: Record<string, StatChip[]> = {
  'chicago-bears': [
    { player: 'Caleb Williams', stat: 'YDS', value: '3,541' },
    { player: 'D.J. Moore', stat: 'REC', value: '96' },
    { player: 'D\'Andre Swift', stat: 'RUSH', value: '892' },
    { player: 'Montez Sweat', stat: 'SACK', value: '10.5' },
  ],
  'chicago-bulls': [
    { player: 'Zach LaVine', stat: 'PPG', value: '24.8' },
    { player: 'Coby White', stat: 'APG', value: '5.2' },
    { player: 'Nikola Vucevic', stat: 'RPG', value: '10.1' },
    { player: 'Alex Caruso', stat: 'SPG', value: '1.8' },
  ],
  'chicago-blackhawks': [
    { player: 'Connor Bedard', stat: 'PTS', value: '52' },
    { player: 'Taylor Hall', stat: 'G', value: '18' },
    { player: 'Seth Jones', stat: '+/-', value: '-8' },
    { player: 'Petr Mrazek', stat: 'SV%', value: '.908' },
  ],
  'chicago-cubs': [
    { player: 'Cody Bellinger', stat: 'AVG', value: '.266' },
    { player: 'Ian Happ', stat: 'HR', value: '25' },
    { player: 'Nico Hoerner', stat: 'SB', value: '28' },
    { player: 'Justin Steele', stat: 'ERA', value: '3.02' },
  ],
  'chicago-white-sox': [
    { player: 'Andrew Vaughn', stat: 'AVG', value: '.245' },
    { player: 'Luis Robert Jr.', stat: 'HR', value: '18' },
    { player: 'Garrett Crochet', stat: 'SO', value: '189' },
    { player: 'Tim Anderson', stat: 'SB', value: '12' },
  ],
}

export default function QuickStats({ teamSlug, teamLabel, league, stats }: QuickStatsProps) {
  const prefersReducedMotion = useReducedMotion()
  const chipData = stats || PLACEHOLDER_STATS[teamSlug] || []

  if (chipData.length === 0) return null

  return (
    <div className="glass-card glass-card-static">
      <h3
        style={{
          fontFamily: "Barlow, sans-serif",
          color: 'var(--sm-text)',
          fontWeight: 700,
          fontSize: '16px',
          margin: '0 0 16px 0',
        }}
      >
        Quick Stats
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {chipData.map((chip, i) => (
          <motion.div
            key={`${chip.player}-${chip.stat}`}
            className="quick-stats-chip"
            whileHover={
              prefersReducedMotion
                ? {}
                : { scale: 1.02, transition: { duration: 0.15 } }
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: 'var(--sm-radius-sm)',
              background: 'var(--sm-surface)',
              border: '1px solid var(--sm-border)',
              transition: 'border-color 0.2s',
              cursor: 'default',
            }}
          >
            <span
              style={{
                fontFamily: "Barlow, sans-serif",
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--sm-text)',
              }}
            >
              {chip.player}
            </span>
            <span
              style={{
                fontFamily: "Barlow, sans-serif",
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--sm-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--sm-text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {chip.stat}
              </span>
              {chip.value}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
