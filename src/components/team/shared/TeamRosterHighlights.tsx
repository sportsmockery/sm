'use client'

import Link from 'next/link'
import PlayerImage from '@/components/team/PlayerImage'
import { TeamPlayer, TEAM_INFO } from '@/lib/types'

interface TeamRosterHighlightsProps {
  players: TeamPlayer[]
  teamSlug: string
  className?: string
}

/**
 * Generic key players roster highlights — works for all 5 Chicago teams
 */
export default function TeamRosterHighlights({
  players,
  teamSlug,
  className = '',
}: TeamRosterHighlightsProps) {
  const teamKey = teamSlug.replace('chicago-', '') as keyof typeof TEAM_INFO
  const info = TEAM_INFO[teamKey === 'white-sox' ? 'white-sox' : teamKey]
  if (!info || players.length === 0) return null

  return (
    <div className={`glass-card glass-card-static ${className}`} style={{ overflow: 'hidden', padding: 0 }}>
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--sm-border)',
          borderLeft: `4px solid ${info.secondaryColor}`,
        }}
      >
        <div className="flex items-center justify-between">
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--sm-text)', textTransform: 'uppercase', margin: 0 }}>
            Key Players
          </h3>
          <Link href={`/${teamSlug}/roster`} className="text-xs hover:underline" style={{ color: '#bc0000' }}>
            Full Roster →
          </Link>
        </div>
      </div>

      {/* Player list */}
      <div>
        {players.slice(0, 5).map((player, idx) => (
          <Link
            key={`${player.id}-${idx}`}
            href={`/${teamSlug}/players/${player.id}`}
            className="group flex items-center gap-3 px-4 py-3 hover:bg-[var(--sm-card-hover)] transition-colors"
            style={{ borderBottom: '1px solid var(--sm-border)' }}
          >
            {/* Player image/number */}
            <div className="relative w-10 h-10 flex-shrink-0">
              {player.imageUrl ? (
                <PlayerImage
                  src={player.imageUrl}
                  alt={player.name}
                  fill
                  className="object-cover rounded-full"
                  fallbackText={`#${player.number}`}
                  fallbackColor={info.secondaryColor}
                />
              ) : (
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: info.secondaryColor }}
                >
                  #{player.number}
                </div>
              )}
              <div
                className="absolute -bottom-0.5 -right-0.5 px-1 py-0.5 rounded text-[9px] font-bold text-white"
                style={{ backgroundColor: info.secondaryColor }}
              >
                {player.position}
              </div>
            </div>

            {/* Player info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-[#222] dark:text-white group-hover:text-[#bc0000] transition-colors truncate" style={{ fontSize: 12 }}>
                {player.name}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                #{player.number} • {player.position}
              </p>
            </div>

            {/* Primary stat */}
            {player.stats && Object.keys(player.stats).length > 0 && (() => {
              const [label, value] = Object.entries(player.stats!)[0]
              return (
                <div className="text-right">
                  <div className="font-bold text-[#222] dark:text-white" style={{ fontSize: 12 }}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </div>
                  <div className="text-[9px] text-gray-400 uppercase">
                    {label.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              )
            })()}

            {/* Arrow */}
            <svg className="w-3 h-3 text-gray-300 group-hover:text-[#bc0000] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}
