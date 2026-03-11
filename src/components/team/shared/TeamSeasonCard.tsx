'use client'

import Link from 'next/link'
import { TeamSeasonOverview, TEAM_INFO } from '@/lib/types'

interface TeamSeasonCardProps {
  season: TeamSeasonOverview
  compact?: boolean
  className?: string
}

/**
 * Generic team season overview card — works for all 5 Chicago teams
 */
export default function TeamSeasonCard({
  season,
  compact = false,
  className = '',
}: TeamSeasonCardProps) {
  const teamKey = season.teamSlug.replace('chicago-', '') as keyof typeof TEAM_INFO
  const info = TEAM_INFO[teamKey === 'white-sox' ? 'white-sox' : teamKey]
  if (!info) return null

  const { record, standing, nextGame, lastGame } = season
  const totalGames = record.wins + record.losses + (record.ties || 0)
  const winPct = totalGames > 0 ? ((record.wins / totalGames) * 100).toFixed(1) : '0.0'

  const recordStr = record.otl
    ? `${record.wins}-${record.losses}-${record.otl}`
    : record.ties
    ? `${record.wins}-${record.losses}-${record.ties}`
    : `${record.wins}-${record.losses}`

  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{ background: `${info.primaryColor}` }}
    >
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-base"
              style={{ backgroundColor: info.secondaryColor }}
            >
              {info.shortName.charAt(0)}
            </div>
            <div>
              <h3 className="text-white text-base font-bold">{season.season} Season</h3>
              <p className="text-white/60 text-xs">{standing}</p>
            </div>
          </div>
          <Link
            href={`/${season.teamSlug}/schedule`}
            className="text-xs text-white/70 hover:text-white transition-colors"
          >
            Schedule →
          </Link>
        </div>
      </div>

      {/* Record display */}
      {!compact ? (
        <div className="px-5 py-4">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-black text-white">{record.wins}</div>
              <div className="text-white/60 text-xs uppercase tracking-wide mt-1">Wins</div>
            </div>
            <div className="text-white/30 text-3xl font-light">-</div>
            <div className="text-center">
              <div className="text-4xl font-black text-white">{record.losses}</div>
              <div className="text-white/60 text-xs uppercase tracking-wide mt-1">Losses</div>
            </div>
            <div className="text-center border-l border-white/10 pl-6">
              <div className="text-2xl font-bold text-white/80">{winPct}%</div>
              <div className="text-white/60 text-xs uppercase tracking-wide mt-1">Win %</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5 py-3 text-center">
          <span className="text-2xl font-black text-white">{recordStr}</span>
          <span className="text-white/50 text-sm ml-2">({winPct}%)</span>
        </div>
      )}

      {/* Game info */}
      <div className="grid grid-cols-2 border-t border-white/10">
        <div className="px-4 py-3 border-r border-white/10">
          <div className="text-white/50 text-[10px] uppercase tracking-wide mb-1">Next Game</div>
          {nextGame ? (
            <div>
              <div className="text-white font-bold text-sm">
                {nextGame.isHome ? 'vs' : '@'} {nextGame.opponent}
              </div>
              <div className="text-white/60 text-xs mt-0.5">
                {new Date(nextGame.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                {nextGame.time ? ` • ${nextGame.time}` : ''}
              </div>
            </div>
          ) : (
            <div className="text-white/50 text-sm">Offseason</div>
          )}
        </div>
        <div className="px-4 py-3">
          <div className="text-white/50 text-[10px] uppercase tracking-wide mb-1">Last Game</div>
          {lastGame ? (
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  lastGame.result === 'W' ? 'bg-green-500/20 text-green-400'
                    : lastGame.result === 'L' ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {lastGame.result}
                </span>
                <span className="text-white font-bold text-sm">{lastGame.opponent}</span>
              </div>
              <div className="text-white/60 text-xs mt-0.5">{lastGame.score}</div>
            </div>
          ) : (
            <div className="text-white/50 text-sm">No recent games</div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="px-4 py-2 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/${season.teamSlug}/roster`} className="text-xs text-white/70 hover:text-white transition-colors">Roster</Link>
          <Link href={`/${season.teamSlug}/stats`} className="text-xs text-white/70 hover:text-white transition-colors">Stats</Link>
          <Link href={`/${season.teamSlug}/schedule`} className="text-xs text-white/70 hover:text-white transition-colors">Schedule</Link>
        </div>
        <Link
          href={`/${season.teamSlug}`}
          className="text-xs font-semibold px-2 py-1 rounded transition-colors"
          style={{ backgroundColor: info.secondaryColor, color: 'white' }}
        >
          All News →
        </Link>
      </div>
    </div>
  )
}
