'use client'

import { useState, useEffect, RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { HomepageData } from '../../dash/types'
import { TEAM_LOGOS } from '../../dash/types'
import { trackPulseEvent } from '../lib/pulseAnalytics'

const TEAM_DISPLAY: Record<string, string> = {
  bears: 'Bears', bulls: 'Bulls', blackhawks: 'Blackhawks', cubs: 'Cubs', whitesox: 'White Sox',
}

interface StickyCityPulseBarProps {
  data: HomepageData
  heroRef: RefObject<HTMLDivElement | null>
}

export function StickyCityPulseBar({ data, heroRef }: StickyCityPulseBarProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show bar when hero is scrolled out of view
        setVisible(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '-60px 0px 0px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [heroRef])

  const pulse = data.hero.city_pulse
  const mood = getCityMoodCompact(pulse)
  const topTeams = data.team_grid.slice(0, 2)
  const hasChanges = data.team_grid.some(t => t.last_game)

  const handleTap = () => {
    trackPulseEvent('sticky_bar_tap')
    heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -52, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -52, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <button
            onClick={handleTap}
            className="w-full flex items-center justify-between px-4 py-2.5 backdrop-blur-xl bg-white/90 dark:bg-[#0B0F14]/90 border-b border-gray-200/60 dark:border-[#1a1a1a]"
            style={{ height: '52px' }}
          >
            {/* Left: Mood + record */}
            <div className="flex items-center gap-2">
              <span className="text-base">{mood.emoji}</span>
              <span className="text-[12px] font-bold" style={{ color: mood.color }}>{mood.label}</span>
              <span className="text-[12px] font-bold tabular-nums text-[#0B0F14] dark:text-[#FAFAFB]">
                {pulse.aggregate_wins}-{pulse.aggregate_losses}
              </span>
            </div>

            {/* Center: Top 2 team chips */}
            <div className="flex items-center gap-2">
              {topTeams.map(team => (
                <div key={team.team_key} className="flex items-center gap-1">
                  <img src={TEAM_LOGOS[team.team_key] || ''} alt="" className="w-4 h-4 object-contain" />
                  <span className="text-[11px] font-medium text-[#0B0F14] dark:text-[#FAFAFB]">
                    {TEAM_DISPLAY[team.team_key] || team.team_key}
                  </span>
                  <span className="text-[10px] tabular-nums text-gray-500 dark:text-[#888888]">{team.record}</span>
                </div>
              ))}
            </div>

            {/* Right: "Since You Left" dot + expand hint */}
            <div className="flex items-center gap-2">
              {hasChanges && (
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#BC0000' }} />
              )}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function getCityMoodCompact(pulse: HomepageData['hero']['city_pulse']): { emoji: string; label: string; color: string } {
  const pct = pulse.win_pct
  if (pct >= 0.6) return { emoji: '\u{1F525}', label: 'Hot', color: '#00ff88' }
  if (pct >= 0.52) return { emoji: '\u{1F60F}', label: 'Good', color: '#00ff88' }
  if (pct >= 0.48) return { emoji: '\u{1F914}', label: 'Meh', color: '#D6B05E' }
  if (pct >= 0.4) return { emoji: '\u{1F612}', label: 'Rough', color: '#BC0000' }
  return { emoji: '\u{1F480}', label: 'Pain', color: '#BC0000' }
}
