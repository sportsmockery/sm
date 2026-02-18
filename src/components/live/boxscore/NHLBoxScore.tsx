'use client'

import Image from 'next/image'
import type { PlayerStats, TeamData } from '../hooks/useLiveGameData'

interface NHLBoxScoreProps {
  homeTeam: TeamData
  awayTeam: TeamData
  players: PlayerStats[]
}

export default function NHLBoxScore({ homeTeam, awayTeam, players }: NHLBoxScoreProps) {
  const homePlayers = players.filter(p => p.is_home_team).sort((a, b) => (b.nhl_points || 0) - (a.nhl_points || 0))
  const awayPlayers = players.filter(p => !p.is_home_team).sort((a, b) => (b.nhl_points || 0) - (a.nhl_points || 0))

  const renderTeam = (team: TeamData, teamPlayers: PlayerStats[]) => (
    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--sm-card)' }}>
      <div className="px-4 py-3" style={{ backgroundColor: 'var(--sm-surface)', borderBottom: '1px solid var(--sm-border)' }}>
        <div className="flex items-center gap-2">
          <Image src={team.logo_url} alt={team.name} width={24} height={24} className="object-contain" unoptimized />
          <span className="font-bold" style={{ color: 'var(--sm-text)' }}>{team.name}</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: 'var(--sm-surface)' }}>
            <tr style={{ color: 'var(--sm-text-muted)' }}>
              <th className="px-3 py-2 text-left font-medium sticky left-0 z-10" style={{ backgroundColor: 'var(--sm-surface)' }}>Player</th>
              <th className="px-2 py-2 text-center font-medium">TOI</th>
              <th className="px-2 py-2 text-center font-medium">G</th>
              <th className="px-2 py-2 text-center font-medium">A</th>
              <th className="px-2 py-2 text-center font-medium">PTS</th>
              <th className="px-2 py-2 text-center font-medium">SOG</th>
              <th className="px-2 py-2 text-center font-medium">+/-</th>
              <th className="px-2 py-2 text-center font-medium">HITS</th>
            </tr>
          </thead>
          <tbody>
            {teamPlayers.map(player => (
              <tr key={player.player_id} style={{ borderTop: '1px solid var(--sm-border)' }}>
                <td className="px-3 py-2 sticky left-0 z-10" style={{ color: 'var(--sm-text)', backgroundColor: 'var(--sm-card)' }}>
                  <span className="font-medium">{player.full_name}</span>
                  {player.position && <span className="ml-1 text-xs" style={{ color: 'var(--sm-text-muted)' }}>{player.position}</span>}
                </td>
                <td className="px-2 py-2 text-center" style={{ color: 'var(--sm-text-muted)' }}>{player.nhl_toi || '-'}</td>
                <td className="px-2 py-2 text-center font-bold" style={{ color: 'var(--sm-text)' }}>{player.nhl_goals ?? '-'}</td>
                <td className="px-2 py-2 text-center" style={{ color: 'var(--sm-text-muted)' }}>{player.nhl_assists ?? '-'}</td>
                <td className="px-2 py-2 text-center font-bold" style={{ color: 'var(--sm-text)' }}>{player.nhl_points ?? '-'}</td>
                <td className="px-2 py-2 text-center" style={{ color: 'var(--sm-text-muted)' }}>{player.nhl_shots ?? '-'}</td>
                <td className="px-2 py-2 text-center" style={{ color: 'var(--sm-text-muted)' }}>{player.nhl_plus_minus != null ? (player.nhl_plus_minus > 0 ? `+${player.nhl_plus_minus}` : player.nhl_plus_minus) : '-'}</td>
                <td className="px-2 py-2 text-center" style={{ color: 'var(--sm-text-muted)' }}>{player.nhl_hits ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {renderTeam(awayTeam, awayPlayers)}
      {renderTeam(homeTeam, homePlayers)}
    </div>
  )
}
