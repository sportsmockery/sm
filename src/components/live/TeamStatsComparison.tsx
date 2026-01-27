'use client'

import Image from 'next/image'
import type { GameData } from './hooks/useLiveGameData'

interface TeamStatsComparisonProps {
  game: GameData
}

export default function TeamStatsComparison({ game }: TeamStatsComparisonProps) {
  if (!game.team_stats) {
    return <div className="text-center text-[var(--text-muted)] py-8">Team stats not available</div>
  }

  const statKeys = Object.keys(game.team_stats.home)

  return (
    <div className="bg-[var(--bg-surface)] rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Image src={game.away_team.logo_url} alt={game.away_team.name} width={32} height={32} className="object-contain" unoptimized />
          <span className="font-bold text-[var(--text-primary)]">{game.away_team.abbr}</span>
        </div>
        <span className="text-[var(--text-muted)] text-sm">Team Stats</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--text-primary)]">{game.home_team.abbr}</span>
          <Image src={game.home_team.logo_url} alt={game.home_team.name} width={32} height={32} className="object-contain" unoptimized />
        </div>
      </div>
      <div className="space-y-3">
        {statKeys.map(key => {
          const awayVal = game.team_stats!.away[key]
          const homeVal = game.team_stats!.home[key]
          const awayNum = typeof awayVal === 'number' ? awayVal : parseFloat(String(awayVal)) || 0
          const homeNum = typeof homeVal === 'number' ? homeVal : parseFloat(String(homeVal)) || 0
          const total = awayNum + homeNum || 1
          const awayPct = (awayNum / total) * 100
          const homePct = (homeNum / total) * 100

          return (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-[var(--text-primary)]">{awayVal}</span>
                <span className="text-[var(--text-muted)] capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-medium text-[var(--text-primary)]">{homeVal}</span>
              </div>
              <div className="flex h-2 rounded overflow-hidden bg-[var(--bg-secondary)]">
                <div className="bg-blue-500" style={{ width: `${awayPct}%` }} />
                <div className="bg-[#bc0000]" style={{ width: `${homePct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
