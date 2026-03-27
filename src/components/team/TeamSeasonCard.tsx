'use client'

import Link from 'next/link'
import Image from 'next/image'
import { type TeamOption } from './TeamSelector'

export interface TeamSeasonData {
  season: number
  record: {
    wins: number
    losses: number
    ties?: number
    otLosses?: number
  }
  standing: string
  nextGame: {
    opponent: string
    opponentLogo?: string | null
    date: string
    time: string
    isHome: boolean
  } | null
  lastGame: {
    opponent: string
    result: 'W' | 'L' | 'T' | null
    score: string
  } | null
}

interface TeamSeasonCardProps {
  team: TeamOption
  season: TeamSeasonData
  className?: string
}

export default function TeamSeasonCard({
  team,
  season,
  className = '',
}: TeamSeasonCardProps) {
  const { record, standing, nextGame, lastGame } = season

  // Calculate win percentage
  const totalGames = record.wins + record.losses + (record.ties || 0)
  const winPct = totalGames > 0
    ? ((record.wins / totalGames) * 100).toFixed(1)
    : '0.0'

  // Format record string based on sport
  const formatRecord = () => {
    if (team.league === 'NHL' && record.otLosses !== undefined) {
      return `${record.wins}-${record.losses}-${record.otLosses}`
    }
    if (record.ties && record.ties > 0) {
      return `${record.wins}-${record.losses}-${record.ties}`
    }
    return `${record.wins}-${record.losses}`
  }

  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${team.primaryColor} 0%, #1a2940 100%)`,
        color: '#FAFAFB',
      }}
    >
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white/10 p-1 flex-shrink-0">
              <Image
                src={team.logo}
                alt={team.name}
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold truncate" style={{ color: '#FAFAFB' }}>
                {season.season} Season
              </h3>
              <p className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{standing}</p>
            </div>
          </div>
          <Link
            href={`/${team.categorySlug}/schedule`}
            className="text-xs sm:text-sm transition-colors hover:opacity-100 whitespace-nowrap flex-shrink-0"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            Full Schedule &rarr;
          </Link>
        </div>
      </div>

      {/* Record display */}
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
          {/* Wins */}
          <div className="text-center">
            <div className="text-3xl sm:text-5xl font-black" style={{ color: '#FAFAFB' }}>{record.wins}</div>
            <div className="text-xs sm:text-sm uppercase tracking-wide mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Wins</div>
          </div>

          {/* Divider */}
          <div className="text-2xl sm:text-4xl font-light" style={{ color: 'rgba(255,255,255,0.4)' }}>-</div>

          {/* Losses */}
          <div className="text-center">
            <div className="text-3xl sm:text-5xl font-black" style={{ color: '#FAFAFB' }}>{record.losses}</div>
            <div className="text-xs sm:text-sm uppercase tracking-wide mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Losses</div>
          </div>

          {/* OT Losses or Ties (if applicable) */}
          {(record.otLosses !== undefined || (record.ties && record.ties > 0)) && (
            <>
              <div className="text-2xl sm:text-4xl font-light" style={{ color: 'rgba(255,255,255,0.4)' }}>-</div>
              <div className="text-center">
                <div className="text-3xl sm:text-5xl font-black" style={{ color: '#FAFAFB' }}>{record.otLosses ?? record.ties}</div>
                <div className="text-xs sm:text-sm uppercase tracking-wide mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {record.otLosses !== undefined ? 'OT' : 'Ties'}
                </div>
              </div>
            </>
          )}

          {/* Win % */}
          <div className="text-center border-l border-white/10 pl-4 sm:pl-8">
            <div className="text-2xl sm:text-3xl font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{winPct}%</div>
            <div className="text-xs sm:text-sm uppercase tracking-wide mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Win %</div>
          </div>
        </div>
      </div>

      {/* Game info */}
      <div className="grid grid-cols-2 border-t border-white/10">
        {/* Next game */}
        <div className="px-3 sm:px-6 py-4 border-r border-white/10">
          <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Next Game</div>
          {nextGame ? (
            <div>
              <div className="flex items-center gap-2">
                {nextGame.opponentLogo && (
                  <Image
                    src={nextGame.opponentLogo}
                    alt=""
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                )}
                <span className="font-bold" style={{ color: '#FAFAFB' }}>
                  {nextGame.isHome ? 'vs' : '@'} {nextGame.opponent}
                </span>
              </div>
              <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {nextGame.date} {nextGame.time && `• ${nextGame.time}`}
              </div>
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.6)' }}>Offseason</div>
          )}
        </div>

        {/* Last game */}
        <div className="px-3 sm:px-6 py-4">
          <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Last Game</div>
          {lastGame && lastGame.result ? (
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    lastGame.result === 'W'
                      ? 'bg-green-500/20 text-green-400'
                      : lastGame.result === 'L'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {lastGame.result}
                </span>
                <span className="font-bold" style={{ color: '#FAFAFB' }}>{lastGame.opponent}</span>
              </div>
              <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>{lastGame.score}</div>
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.6)' }}>No recent games</div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="px-4 sm:px-6 py-3 bg-black/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <Link
            href={`/${team.categorySlug}/roster`}
            className="text-sm transition-colors hover:opacity-100"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            Roster
          </Link>
          <Link
            href={`/${team.categorySlug}/stats`}
            className="text-sm transition-colors hover:opacity-100"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            Stats
          </Link>
          <Link
            href={`/${team.categorySlug}/standings`}
            className="text-sm transition-colors hover:opacity-100"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            Standings
          </Link>
        </div>
        <Link
          href={`/${team.categorySlug}`}
          className="text-sm font-semibold px-3 py-1 rounded transition-colors"
          style={{
            backgroundColor: 'var(--sm-red)',
            color: 'white',
          }}
        >
          All News
        </Link>
      </div>
    </div>
  )
}
