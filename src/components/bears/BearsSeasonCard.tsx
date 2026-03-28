'use client'

import Link from 'next/link'
import Image from 'next/image'
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
        background: '#0B0F14',
        color: '#FAFAFB',
        border: '1px solid #00D4FF',
      }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white/10 shrink-0">
              <Image
                src={bearsInfo.logoUrl}
                alt={bearsInfo.name}
                width={40}
                height={40}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: '#FAFAFB' }}>
                {season.season} Season
              </h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{standing}</p>
            </div>
          </div>
          <Link
            href="/chicago-bears/schedule"
            className="text-sm transition-colors hover:opacity-100"
            style={{ color: 'rgba(255,255,255,0.85)' }}
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
            <div className="text-5xl font-black" style={{ color: '#FAFAFB' }}>{record.wins}</div>
            <div className="text-sm uppercase tracking-wide mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Wins</div>
          </div>

          {/* Divider */}
          <div className="text-4xl font-light" style={{ color: 'rgba(255,255,255,0.4)' }}>-</div>

          {/* Losses */}
          <div className="text-center">
            <div className="text-5xl font-black" style={{ color: '#FAFAFB' }}>{record.losses}</div>
            <div className="text-sm uppercase tracking-wide mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Losses</div>
          </div>

          {/* Win % */}
          <div className="text-center border-l border-white/10 pl-8">
            <div className="text-3xl font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{winPct}%</div>
            <div className="text-sm uppercase tracking-wide mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Win %</div>
          </div>
        </div>
      </div>

      {/* Game info */}
      <div className="grid grid-cols-2 border-t border-white/10">
        {/* Next game */}
        <div className="px-6 py-4 border-r border-white/10">
          <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Next Game</div>
          {nextGame ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold" style={{ color: '#FAFAFB' }}>
                  {nextGame.isHome ? 'vs' : '@'} {nextGame.opponent}
                </span>
              </div>
              <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
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
            <div style={{ color: 'rgba(255,255,255,0.6)' }}>Offseason</div>
          )}
        </div>

        {/* Last game */}
        <div className="px-6 py-4">
          <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Last Game</div>
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
      <div className="px-6 py-3 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/chicago-bears/roster"
            className="text-sm transition-colors hover:opacity-100"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            Roster
          </Link>
          <Link
            href="/chicago-bears/stats"
            className="text-sm transition-colors hover:opacity-100"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            Stats
          </Link>
          <Link
            href="/chicago-bears/schedule"
            className="text-sm transition-colors hover:opacity-100"
            style={{ color: 'rgba(255,255,255,0.85)' }}
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
