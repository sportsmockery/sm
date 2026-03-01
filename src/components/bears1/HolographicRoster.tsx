'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import PlayerHoloCard from './PlayerHoloCard'
import type { BearsPlayer, BearsStats, LeaderboardEntry } from '@/lib/bearsData'

const POSITION_TABS = ['ALL', 'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'ST'] as const

interface HolographicRosterProps {
  players: BearsPlayer[]
  stats: BearsStats
  onActiveChange: (player: BearsPlayer | null) => void
}

function findInLeaderboard(entries: LeaderboardEntry[], playerId: string): LeaderboardEntry | undefined {
  return entries.find(e => e.player.playerId === playerId)
}

function getStatLine(player: BearsPlayer, stats: BearsStats): string {
  const lb = stats.leaderboards
  const pid = player.playerId

  if (player.position === 'QB') {
    const entry = findInLeaderboard(lb.passing, pid)
    if (entry) return `${entry.primaryStat} ${entry.primaryLabel}`
  }
  if (player.position === 'RB') {
    const entry = findInLeaderboard(lb.rushing, pid)
    if (entry) return `${entry.primaryStat} ${entry.primaryLabel}`
  }
  if (player.position === 'WR' || player.position === 'TE') {
    const entry = findInLeaderboard(lb.receiving, pid)
    if (entry) return `${entry.primaryStat} ${entry.primaryLabel}`
  }
  // Defense
  const defEntry = findInLeaderboard(lb.defense, pid)
  if (defEntry) return `${defEntry.primaryStat} ${defEntry.primaryLabel}`
  const sackEntry = findInLeaderboard(lb.sacks, pid)
  if (sackEntry) return `${sackEntry.primaryStat} ${sackEntry.primaryLabel}`

  return ''
}

export default function HolographicRoster({ players, stats, onActiveChange }: HolographicRosterProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState<string>('ALL')
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const filtered = activeTab === 'ALL'
    ? players
    : players.filter(p => {
        const pos = p.position?.toUpperCase() || ''
        if (activeTab === 'OL') return ['OT', 'OG', 'C', 'T', 'G', 'OL'].includes(pos)
        if (activeTab === 'DL') return ['DE', 'DT', 'NT', 'DL'].includes(pos)
        if (activeTab === 'LB') return ['LB', 'ILB', 'OLB', 'MLB'].includes(pos)
        if (activeTab === 'S') return ['S', 'FS', 'SS', 'DB'].includes(pos)
        if (activeTab === 'CB') return pos === 'CB'
        if (activeTab === 'ST') return ['K', 'P', 'LS'].includes(pos)
        return pos === activeTab
      })

  const handleCardClick = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  // Notify parent of active player change
  useEffect(() => {
    if (filtered.length > 0 && activeIndex < filtered.length) {
      onActiveChange(filtered[activeIndex])
    } else {
      onActiveChange(null)
    }
  }, [activeIndex, filtered, onActiveChange])

  // Reset index on tab change
  useEffect(() => {
    setActiveIndex(0)
  }, [activeTab])

  // Scroll active card into view
  useEffect(() => {
    if (scrollRef.current) {
      const cards = scrollRef.current.children
      if (cards[activeIndex]) {
        (cards[activeIndex] as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      }
    }
  }, [activeIndex])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setActiveIndex(prev => Math.min(prev + 1, filtered.length - 1))
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex(prev => Math.max(prev - 1, 0))
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [filtered.length])

  const scrollBy = (dir: number) => {
    setActiveIndex(prev => {
      const next = prev + dir
      if (next < 0) return 0
      if (next >= filtered.length) return filtered.length - 1
      return next
    })
  }

  return (
    <section style={{ padding: '24px 0', position: 'relative' }}>
      {/* Section label */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#bc0000',
            fontFamily: "Barlow, sans-serif",
            fontWeight: 600,
          }}
        >
          Roster Intelligence
        </span>
      </div>

      {/* Position tabs */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
          marginBottom: 20,
        }}
      >
        {POSITION_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '4px 12px',
              fontSize: 11,
              fontWeight: activeTab === tab ? 700 : 500,
              letterSpacing: '0.05em',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              background: activeTab === tab
                ? '#bc0000'
                : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              color: activeTab === tab
                ? '#fff'
                : isDark ? '#aaa' : '#666',
              transition: 'all 0.2s ease',
              fontFamily: "Barlow, sans-serif",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Carousel container */}
      <div style={{ position: 'relative' }}>
        {/* Left arrow */}
        {activeIndex > 0 && (
          <button
            onClick={() => scrollBy(-1)}
            style={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
              color: isDark ? '#fff' : '#111',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
            aria-label="Previous player"
          >
            &#8249;
          </button>
        )}

        {/* Right arrow */}
        {activeIndex < filtered.length - 1 && (
          <button
            onClick={() => scrollBy(1)}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
              color: isDark ? '#fff' : '#111',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
            aria-label="Next player"
          >
            &#8250;
          </button>
        )}

        {/* Cards row */}
        <motion.div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: 12,
            padding: '12px 24px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          drag="x"
          dragConstraints={scrollRef}
          dragElastic={0.1}
        >
          {filtered.map((player, i) => (
            <div key={player.playerId} style={{ scrollSnapAlign: 'center' }}>
              <PlayerHoloCard
                name={player.fullName}
                position={player.position}
                jerseyNumber={player.jerseyNumber}
                headshotUrl={player.headshotUrl}
                slug={player.slug}
                isActive={i === activeIndex}
                statLine={i === activeIndex ? getStatLine(player, stats) : undefined}
                onClick={() => handleCardClick(i)}
              />
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: 40, color: isDark ? '#555' : '#999', fontSize: 13 }}>
              No players in this group
            </div>
          )}
        </motion.div>
      </div>

      {/* Player count */}
      <div
        style={{
          maxWidth: 1200,
          margin: '8px auto 0',
          padding: '0 24px',
          fontSize: 10,
          color: isDark ? '#444' : '#bbb',
          fontFamily: "Barlow, sans-serif",
        }}
      >
        {filtered.length} players {activeTab !== 'ALL' ? `(${activeTab})` : ''}
        {filtered.length > 0 && ` \u2022 ${activeIndex + 1} of ${filtered.length}`}
      </div>
    </section>
  )
}
