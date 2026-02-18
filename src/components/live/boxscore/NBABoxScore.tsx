'use client'

import Image from 'next/image'
import type { PlayerStats, TeamData } from '../hooks/useLiveGameData'

interface NBABoxScoreProps {
  homeTeam: TeamData
  awayTeam: TeamData
  players: PlayerStats[]
}

export default function NBABoxScore({ homeTeam, awayTeam, players }: NBABoxScoreProps) {
  const homePlayers = players.filter(p => p.is_home_team).sort((a, b) => (b.nba_points || 0) - (a.nba_points || 0))
  const awayPlayers = players.filter(p => !p.is_home_team).sort((a, b) => (b.nba_points || 0) - (a.nba_points || 0))

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
              <th className="px-2 py-2 text-center font-medium">MIN</th>
              <th className="px-2 py-2 text-center font-medium">PTS</th>
              <th className="px-2 py-2 text-center font-medium">REB</th>
              <th className="px-2 py-2 text-center font-medium">AST</th>
              <th className="px-2 py-2 text-center font-medium">FG</th>
              <th className="px-2 py-2 text-center font-medium">3P</th>
              <th className="px-2 py-2 text-center font-medium">+/-</th>
            </tr>
          </thead>
          <tbody>
            {teamPlayers.map(player => (
              <tr key={player.player_id} style={{ borderTop: '1px solid var(--sm-border)' }}>
                <td className="px-3 py-2 sticky left-0 z-10" style={{ color: 'var(--sm-text)', backgroundColor: 'var(--sm-card)' }}>
                  <span className="font-medium">{player.full_name}</span>
                  {player.position && <span className="ml-1 text-xs" style={{ color: 'var(--sm-text-muted)' }}>{player.position}</span>}
                </td>
                <td className="px-2 py-2 text-center" style={{ color: 'var(--sm-text-muted)' }}>{player.nba_minutes || '-'}</td>
                <td className="px-2 py-2 text-center font-bold" style={{ color: 'var(--sm-text)' }}>{player.nba_points ?? '-'}</td>
                <td className="px-2 py-2 text-center" style={{ color: 'var(--sm-text-muted)' }}>{player.nba_reb_total ?? '-'}</td>
                <td className="px-2 py-2 text-center" style={{ color: 'var(--sm-text-muted)' }}>{player.nba_assists ?? '-'}</td>
                <td className="px-2 py-2 text-center" style={{ color: 'var(--sm-text-muted)' }}>{player.nba_fg_made ?? 0}-{player.nba_fg_att ?? 0}</td>
                <td className="px-2 py-2 text-center" style={{ color: 'var(--sm-text-muted)' }}>{player.nba_3p_made ?? 0}-{player.nba_3p_att ?? 0}</td>
                <td className="px-2 py-2 text-center" style={{ color: 'var(--sm-text-muted)' }}>{player.nba_plus_minus != null ? (player.nba_plus_minus > 0 ? `+${player.nba_plus_minus}` : player.nba_plus_minus) : '-'}</td>
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
