'use client'

import Link from 'next/link'
import { BearsSeasonOverview, TEAM_INFO } from '@/lib/types'

interface BearsSeasonCardProps {
  season: BearsSeasonOverview
  className?: string
}

/**
 * Bears season overview card
 * Shows current record, standings, and upcoming/recent game info
 */
export default function BearsSeasonCard({
  season,
  className = '',
}: BearsSeasonCardProps) {
  const bearsInfo = TEAM_INFO.bears
  const { record, standing, nextGame, lastGame } = season

  const winPct = record.wins + record.losses > 0
    ? ((record.wins / (record.wins + record.losses)) * 100).toFixed(1)
    : '0.0'

  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${bearsInfo.primaryColor} 0%, #1a2940 100%)`,
      }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-xl"
              style={{ backgroundColor: bearsInfo.secondaryColor }}
            >
              B
            </div>
            <div>
              <h3
                className="text-white text-lg font-bold"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {season.season} Season
              </h3>
              <p className="text-white/60 text-sm">{standing}</p>
            </div>
          </div>
          <Link
            href="/chicago-bears/schedule"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Full Schedule →
          </Link>
        </div>
      </div>

      {/* Record display */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-center gap-8">
          {/* Wins */}
          <div className="text-center">
            <div
              className="text-5xl font-black text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {record.wins}
            </div>
            <div className="text-white/60 text-sm uppercase tracking-wide mt-1">Wins</div>
          </div>

          {/* Divider */}
          <div className="text-white/30 text-4xl font-light">-</div>

          {/* Losses */}
          <div className="text-center">
            <div
              className="text-5xl font-black text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {record.losses}
            </div>
            <div className="text-white/60 text-sm uppercase tracking-wide mt-1">Losses</div>
          </div>

          {/* Win % */}
          <div className="text-center border-l border-white/10 pl-8">
            <div
              className="text-3xl font-bold text-white/80"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {winPct}%
            </div>
            <div className="text-white/60 text-sm uppercase tracking-wide mt-1">Win %</div>
          </div>
        </div>
      </div>

      {/* Game info */}
      <div className="grid grid-cols-2 border-t border-white/10">
        {/* Next game */}
        <div className="px-6 py-4 border-r border-white/10">
          <div className="text-white/50 text-xs uppercase tracking-wide mb-2">Next Game</div>
          {nextGame ? (
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-white font-bold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {nextGame.isHome ? 'vs' : '@'} {nextGame.opponent}
                </span>
              </div>
              <div className="text-white/60 text-sm mt-1">
                {new Date(nextGame.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
                {' • '}
                {nextGame.time}
              </div>
            </div>
          ) : (
            <div className="text-white/50">Offseason</div>
          )}
        </div>

        {/* Last game */}
        <div className="px-6 py-4">
          <div className="text-white/50 text-xs uppercase tracking-wide mb-2">Last Game</div>
          {lastGame ? (
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
                <span
                  className="text-white font-bold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {lastGame.opponent}
                </span>
              </div>
              <div className="text-white/60 text-sm mt-1">{lastGame.score}</div>
            </div>
          ) : (
            <div className="text-white/50">No recent games</div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="px-6 py-3 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/chicago-bears/roster"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Roster
          </Link>
          <Link
            href="/chicago-bears/stats"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Stats
          </Link>
          <Link
            href="/chicago-bears/schedule"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Schedule
          </Link>
        </div>
        <Link
          href="/chicago-bears"
          className="text-sm font-semibold px-3 py-1 rounded transition-colors"
          style={{
            backgroundColor: bearsInfo.secondaryColor,
            color: 'white',
          }}
        >
          All News →
        </Link>
      </div>
    </div>
  )
}
