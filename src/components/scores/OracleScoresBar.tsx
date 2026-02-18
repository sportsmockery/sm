'use client'

import { useState } from 'react'
import Link from 'next/link'

interface GameScore {
  id: string
  homeTeam: {
    name: string
    abbreviation: string
    score: number
    logo?: string
  }
  awayTeam: {
    name: string
    abbreviation: string
    score: number
    logo?: string
  }
  status: 'live' | 'final' | 'upcoming'
  quarter?: string
  time?: string
  startTime?: string
  sport: 'nfl' | 'nba' | 'mlb' | 'nhl'
  isChicagoTeam?: boolean
}

const sampleScores: GameScore[] = [
  {
    id: '1',
    homeTeam: { name: 'Bears', abbreviation: 'CHI', score: 24 },
    awayTeam: { name: 'Packers', abbreviation: 'GB', score: 17 },
    status: 'live',
    quarter: '4th',
    time: '5:42',
    sport: 'nfl',
    isChicagoTeam: true,
  },
  {
    id: '2',
    homeTeam: { name: 'Bulls', abbreviation: 'CHI', score: 98 },
    awayTeam: { name: 'Heat', abbreviation: 'MIA', score: 102 },
    status: 'live',
    quarter: '3rd',
    time: '2:15',
    sport: 'nba',
    isChicagoTeam: true,
  },
  {
    id: '3',
    homeTeam: { name: 'Blackhawks', abbreviation: 'CHI', score: 3 },
    awayTeam: { name: 'Blues', abbreviation: 'STL', score: 2 },
    status: 'final',
    sport: 'nhl',
    isChicagoTeam: true,
  },
  {
    id: '4',
    homeTeam: { name: 'Chiefs', abbreviation: 'KC', score: 31 },
    awayTeam: { name: 'Raiders', abbreviation: 'LV', score: 17 },
    status: 'final',
    sport: 'nfl',
  },
  {
    id: '5',
    homeTeam: { name: 'Lakers', abbreviation: 'LAL', score: 0 },
    awayTeam: { name: 'Celtics', abbreviation: 'BOS', score: 0 },
    status: 'upcoming',
    startTime: '7:30 PM',
    sport: 'nba',
  },
]

interface OracleScoresBarProps {
  scores?: GameScore[]
  className?: string
}

export default function OracleScoresBar({ scores = sampleScores, className = '' }: OracleScoresBarProps) {
  const [isPaused, setIsPaused] = useState(false)

  return (
    <div
      className={`relative h-[50px] overflow-hidden ${className}`}
      style={{ backgroundColor: 'var(--sm-card)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left branding */}
      <div className="absolute left-0 top-0 z-10 flex h-full items-center pl-4 pr-10" style={{ background: 'linear-gradient(to right, var(--sm-card), var(--sm-card), transparent)' }}>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)' }}>Scores</span>
      </div>

      {/* Scores ticker */}
      <div
        className={`flex h-full items-center whitespace-nowrap pl-20 ${isPaused ? '' : 'animate-scores-ticker'}`}
        style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
      >
        {[...scores, ...scores].map((game, index) => (
          <Link
            key={`${game.id}-${index}`}
            href={`/scores/${game.sport}/${game.id}`}
            className="mx-1 flex items-center gap-2 rounded px-3 py-1 transition-colors"
            style={{ backgroundColor: game.isChicagoTeam ? 'var(--sm-surface)' : undefined }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--sm-surface)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = game.isChicagoTeam ? 'var(--sm-surface)' : ''}
          >
            {/* Teams and scores */}
            <div className="flex items-center gap-2 text-xs">
              {/* Away team */}
              <span className="font-semibold" style={{ color: 'var(--sm-text-muted)' }}>{game.awayTeam.abbreviation}</span>
              <span className="font-bold" style={{ color: game.status === 'final' && game.awayTeam.score > game.homeTeam.score ? 'var(--sm-text)' : 'var(--sm-text-muted)' }}>
                {game.status !== 'upcoming' ? game.awayTeam.score : '-'}
              </span>

              <span style={{ color: 'var(--sm-text-dim)' }}>-</span>

              {/* Home team */}
              <span className="font-bold" style={{ color: game.status === 'final' && game.homeTeam.score > game.awayTeam.score ? 'var(--sm-text)' : 'var(--sm-text-muted)' }}>
                {game.status !== 'upcoming' ? game.homeTeam.score : '-'}
              </span>
              <span className="font-semibold" style={{ color: 'var(--sm-text-muted)' }}>{game.homeTeam.abbreviation}</span>
            </div>

            {/* Status */}
            {game.status === 'live' && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-red-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                {game.quarter}
              </span>
            )}
            {game.status === 'final' && (
              <span className="text-[10px] font-medium" style={{ color: 'var(--sm-text-dim)' }}>F</span>
            )}
            {game.status === 'upcoming' && (
              <span className="text-[10px]" style={{ color: 'var(--sm-text-muted)' }}>{game.startTime}</span>
            )}

            {/* Divider */}
            <span className="ml-1" style={{ color: 'var(--sm-border)' }}>|</span>
          </Link>
        ))}
      </div>

      {/* Gradient fade right */}
      <div className="absolute right-0 top-0 z-10 h-full w-16" style={{ background: 'linear-gradient(to left, var(--sm-card), transparent)' }} />
    </div>
  )
}
