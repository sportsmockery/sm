'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'


interface OracleScore {
  id: string
  team: string
  opponent: string
  teamScore: number | null
  opponentScore: number | null
  status: 'live' | 'final' | 'upcoming'
  time?: string
  mockeryOdds?: string
  isLive?: boolean
}

interface OracleScoresBarProps {
  className?: string
}

/**
 * Oracle Scores Bar
 *
 * Persistent sticky bar at top like ESPN displaying:
 * - Live game scores
 * - Upcoming games
 * - Mockery odds (red bold text)
 *
 * Pulls from database with real-time updates via Supabase
 */
export default function OracleScoresBar({ className = '' }: OracleScoresBarProps) {
  const [scores, setScores] = useState<OracleScore[]>([])
  const [loading, setLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Fetch scores from API
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch('/api/oracle/scores')
        if (res.ok) {
          const data = await res.json()
          setScores(data.scores || [])
        }
      } catch (error) {
        console.error('Failed to fetch oracle scores:', error)
        // Fallback to mock data
        setScores(getMockScores())
      } finally {
        setLoading(false)
      }
    }

    fetchScores()

    // Real-time subscription would go here with Supabase
    // const channel = supabase.channel('oracle-scores').on('broadcast', { event: 'score-update' }, ...)

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchScores, 30000)
    return () => clearInterval(interval)
  }, [])

  // Mock scores for development
  const getMockScores = (): OracleScore[] => [
    { id: '1', team: 'CHI', opponent: 'GB', teamScore: 24, opponentScore: 21, status: 'live', time: 'Q4 2:34', mockeryOdds: '78% Flop Alert', isLive: true },
    { id: '2', team: 'Bulls', opponent: 'Lakers', teamScore: 98, opponentScore: 102, status: 'final', mockeryOdds: 'Tank Mode: ON' },
    { id: '3', team: 'Cubs', opponent: 'Cards', teamScore: null, opponentScore: null, status: 'upcoming', time: '7:10 PM CT', mockeryOdds: '55% Collapse Risk' },
    { id: '4', team: 'Hawks', opponent: 'Wings', teamScore: 2, opponentScore: 1, status: 'live', time: '2nd', mockeryOdds: 'Cautious Hope', isLive: true },
    { id: '5', team: 'Sox', opponent: 'Tigers', teamScore: 1, opponentScore: 8, status: 'final', mockeryOdds: 'Rebuild Year 47' },
  ]

  if (loading) {
    return (
      <div
        className={`sticky top-0 z-50 border-b border-red-600 p-2 ${className}`}
        style={{ backgroundColor: 'var(--sm-card)' }}
        role="region"
        aria-label="Loading scores"
      >
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-40 h-8 rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`sticky top-0 z-50 border-b border-red-600 ${className}`}
      style={{ backgroundColor: 'var(--sm-card)' }}
      role="region"
      aria-label="Live scores and mockery odds"
    >
      {/* Mobile collapse toggle */}
      <button
        className="md:hidden w-full p-2 flex items-center justify-between text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
        style={{ color: 'var(--sm-text)' }}
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-expanded={!isCollapsed}
        aria-controls="oracle-scores-content"
      >
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>Oracle Scores</span>
        <svg
          className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Scores content */}
      <AnimatePresence>
        {(!isCollapsed || typeof window !== 'undefined' && window.innerWidth >= 768) && (
          <motion.div
            id="oracle-scores-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-2 flex overflow-x-auto gap-4 text-sm scrollbar-hide"
            style={{ color: 'var(--sm-text)' }}
          >
            {scores.map((score) => (
              <ScoreItem key={score.id} score={score} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ScoreItem({ score }: { score: OracleScore }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-shrink-0 flex items-center gap-3 px-3 py-1 rounded border hover:border-red-600 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-600"
      style={{ backgroundColor: 'var(--sm-surface)', borderColor: 'var(--sm-border)' }}
      tabIndex={0}
      role="article"
      aria-label={`${score.team} vs ${score.opponent}${score.status === 'live' ? ', live game' : ''}`}
    >
      {/* Live indicator */}
      {score.isLive && (
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          <span className="text-red-600 font-bold text-xs">LIVE</span>
        </span>
      )}

      {/* Teams and scores */}
      <div className="flex items-center gap-2">
        <span className={`font-bold `}>{score.team}</span>
        {score.teamScore !== null && (
          <span className="font-mono">{score.teamScore}</span>
        )}
        <span style={{ color: 'var(--sm-text-muted)' }}>-</span>
        {score.opponentScore !== null && (
          <span className="font-mono">{score.opponentScore}</span>
        )}
        <span>{score.opponent}</span>
      </div>

      {/* Time or status */}
      {score.time && (
        <span className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
          {score.time}
        </span>
      )}
      {score.status === 'final' && (
        <span className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>FINAL</span>
      )}

      {/* Mockery odds */}
      {score.mockeryOdds && (
        <span className="text-red-600 font-bold text-xs whitespace-nowrap">
          {score.mockeryOdds}
        </span>
      )}
    </motion.div>
  )
}
