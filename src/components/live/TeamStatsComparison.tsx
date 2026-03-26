'use client'

import Image from 'next/image'
import type { GameData } from './hooks/useLiveGameData'

interface TeamStatsComparisonProps {
  game: GameData
  dark?: boolean
}

export default function TeamStatsComparison({ game, dark }: TeamStatsComparisonProps) {
  if (!game.team_stats) {
    return <div className="text-center py-8" style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'var(--sm-text-muted)' }}>Team stats not available</div>
  }

  const statKeys = Object.keys(game.team_stats.home)

  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'var(--sm-card)', border: dark ? '1px solid rgba(255,255,255,0.15)' : undefined }}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Image src={game.away_team.logo_url} alt={game.away_team.name} width={32} height={32} className="object-contain" unoptimized />
          <span className="font-bold" style={{ color: dark ? '#FAFAFB' : 'var(--sm-text)' }}>{game.away_team.abbr}</span>
        </div>
        <span className="text-sm" style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'var(--sm-text-muted)' }}>Team Stats</span>
        <div className="flex items-center gap-2">
          <span className="font-bold" style={{ color: dark ? '#FAFAFB' : 'var(--sm-text)' }}>{game.home_team.abbr}</span>
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
                <span className="font-medium" style={{ color: dark ? '#FAFAFB' : 'var(--sm-text)' }}>{awayVal}</span>
                <span className="capitalize" style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'var(--sm-text-muted)' }}>{key.replace(/_/g, ' ')}</span>
                <span className="font-medium" style={{ color: dark ? '#FAFAFB' : 'var(--sm-text)' }}>{homeVal}</span>
              </div>
              <div className="flex h-2 rounded overflow-hidden" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'var(--sm-surface)' }}>
                <div className="bg-blue-500" style={{ width: `${awayPct}%` }} />
                <div style={{ width: `${homePct}%`, backgroundColor: '#bc0000' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
