'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BearsPlayer, TEAM_INFO } from '@/lib/types'

interface BearsRosterHighlightsProps {
  players: BearsPlayer[]
  className?: string
}

/**
 * Bears key players roster highlights
 * Shows top players with stats and links to full profiles
 */
export default function BearsRosterHighlights({
  players,
  className = '',
}: BearsRosterHighlightsProps) {
  const bearsInfo = TEAM_INFO.bears

  if (players.length === 0) {
    return null
  }

  return (
    <div className={`bg-white dark:bg-[#111] rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className="px-6 py-4 border-b border-gray-100 dark:border-gray-800"
        style={{ borderLeftColor: bearsInfo.secondaryColor, borderLeftWidth: '4px' }}
      >
        <div className="flex items-center justify-between">
          <h3
            className="text-[16px] font-bold text-[#222] dark:text-white uppercase"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Key Players
          </h3>
          <Link
            href="/bears/roster"
            className="text-sm text-[#bc0000] hover:underline"
          >
            Full Roster →
          </Link>
        </div>
      </div>

      {/* Player cards */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {players.slice(0, 5).map((player) => (
          <PlayerCard key={player.id} player={player} teamColor={bearsInfo.secondaryColor} />
        ))}
      </div>
    </div>
  )
}

/**
 * Individual player card
 */
function PlayerCard({
  player,
  teamColor,
}: {
  player: BearsPlayer
  teamColor: string
}) {
  // Get primary stat to display
  const primaryStat = getPrimaryStat(player)

  return (
    <Link
      href={`/bears/players/${player.id}`}
      className="group flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      {/* Player image/number */}
      <div className="relative w-14 h-14 flex-shrink-0">
        {player.imageUrl ? (
          <Image
            src={player.imageUrl}
            alt={player.name}
            fill
            className="object-cover rounded-full"
          />
        ) : (
          <div
            className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: teamColor }}
          >
            #{player.number}
          </div>
        )}
        {/* Position badge */}
        <div
          className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
          style={{ backgroundColor: teamColor }}
        >
          {player.position}
        </div>
      </div>

      {/* Player info */}
      <div className="flex-1 min-w-0">
        <h4
          className="text-[14px] font-bold text-[#222] dark:text-white group-hover:text-[#bc0000] transition-colors"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {player.name}
        </h4>
        <p className="text-[12px] text-gray-500 dark:text-gray-400">
          #{player.number} • {player.position}
        </p>
      </div>

      {/* Primary stat */}
      {primaryStat && (
        <div className="text-right">
          <div
            className="text-[18px] font-bold text-[#222] dark:text-white"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {primaryStat.value}
          </div>
          <div className="text-[10px] text-gray-400 uppercase">{primaryStat.label}</div>
        </div>
      )}

      {/* Arrow */}
      <svg
        className="w-4 h-4 text-gray-300 group-hover:text-[#bc0000] transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

/**
 * Get the primary stat to display for a player based on position
 */
function getPrimaryStat(player: BearsPlayer): { label: string; value: string } | null {
  if (!player.stats) return null

  const { position, stats } = player

  switch (position) {
    case 'QB':
      if (stats.passingYards) {
        return { label: 'Pass Yds', value: formatStat(stats.passingYards) }
      }
      if (stats.touchdowns) {
        return { label: 'TDs', value: String(stats.touchdowns) }
      }
      break
    case 'RB':
      if (stats.rushingYards) {
        return { label: 'Rush Yds', value: formatStat(stats.rushingYards) }
      }
      break
    case 'WR':
    case 'TE':
      if (stats.receivingYards) {
        return { label: 'Rec Yds', value: formatStat(stats.receivingYards) }
      }
      if (stats.receptions) {
        return { label: 'Rec', value: String(stats.receptions) }
      }
      break
    case 'DE':
    case 'DT':
    case 'LB':
      if (stats.sacks) {
        return { label: 'Sacks', value: String(stats.sacks) }
      }
      if (stats.tackles) {
        return { label: 'Tackles', value: String(stats.tackles) }
      }
      break
    case 'CB':
    case 'S':
      if (stats.interceptions) {
        return { label: 'INTs', value: String(stats.interceptions) }
      }
      if (stats.tackles) {
        return { label: 'Tackles', value: String(stats.tackles) }
      }
      break
  }

  // Default: return first available stat
  const statKeys = Object.keys(stats)
  if (statKeys.length > 0) {
    const key = statKeys[0]
    return { label: formatStatLabel(key), value: formatStat(stats[key]) }
  }

  return null
}

function formatStat(value: string | number): string {
  if (typeof value === 'number') {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : String(value)
  }
  return value
}

function formatStatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}
