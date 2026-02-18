'use client'

import Image from 'next/image'
import type { GameData, Play } from './hooks/useLiveGameData'
import { formatPeriodLabel } from '@/lib/live-games-utils'

interface LinescoreProps {
  game: GameData
}

function computeLinescoreFromPlays(plays: Play[], sport: string): Record<string, { home: number; away: number }> {
  if (plays.length === 0) return {}

  const sorted = [...plays].sort((a, b) => a.sequence - b.sequence)
  const linescore: Record<string, { home: number; away: number }> = {}
  let prevHome = 0
  let prevAway = 0

  for (const play of sorted) {
    const key = formatPeriodLabel(sport, play.period)
    if (!linescore[key]) {
      linescore[key] = { home: 0, away: 0 }
    }
    const homeDelta = play.score_home - prevHome
    const awayDelta = play.score_away - prevAway
    if (homeDelta > 0) linescore[key].home += homeDelta
    if (awayDelta > 0) linescore[key].away += awayDelta
    prevHome = play.score_home
    prevAway = play.score_away
  }

  return linescore
}

export default function Linescore({ game }: LinescoreProps) {
  const linescore = game.linescore || computeLinescoreFromPlays(game.play_by_play, game.sport)
  const periods = Object.keys(linescore)

  if (periods.length === 0) return null

  return (
    <div style={{ backgroundColor: 'var(--sm-card)', borderBottom: '1px solid var(--sm-border)' }}>
      <div className="max-w-[1200px] mx-auto px-4 py-3">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[300px]">
            <thead>
              <tr style={{ color: 'var(--sm-text-muted)' }}>
                <th className="px-3 py-1 text-left font-medium w-24">Team</th>
                {periods.map(p => (
                  <th key={p} className="px-2 py-1 text-center font-medium min-w-[32px]">{p}</th>
                ))}
                <th className="px-3 py-1 text-center font-bold min-w-[40px]">T</th>
              </tr>
            </thead>
            <tbody>
              {/* Away */}
              <tr style={{ borderTop: '1px solid var(--sm-border)' }}>
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <Image src={game.away_team.logo_url} alt="" width={18} height={18} className="object-contain" unoptimized />
                    <span className="font-medium" style={{ color: 'var(--sm-text)' }}>{game.away_team.abbr}</span>
                  </div>
                </td>
                {periods.map(p => (
                  <td key={p} className="px-2 py-1.5 text-center" style={{ color: 'var(--sm-text-muted)' }}>{linescore[p].away}</td>
                ))}
                <td className="px-3 py-1.5 text-center font-bold" style={{ color: 'var(--sm-text)' }}>{game.away_team.score}</td>
              </tr>
              {/* Home */}
              <tr style={{ borderTop: '1px solid var(--sm-border)' }}>
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <Image src={game.home_team.logo_url} alt="" width={18} height={18} className="object-contain" unoptimized />
                    <span className="font-medium" style={{ color: 'var(--sm-text)' }}>{game.home_team.abbr}</span>
                  </div>
                </td>
                {periods.map(p => (
                  <td key={p} className="px-2 py-1.5 text-center" style={{ color: 'var(--sm-text-muted)' }}>{linescore[p].home}</td>
                ))}
                <td className="px-3 py-1.5 text-center font-bold" style={{ color: 'var(--sm-text)' }}>{game.home_team.score}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
