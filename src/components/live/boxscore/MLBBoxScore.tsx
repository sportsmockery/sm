'use client'

import Image from 'next/image'
import type { PlayerStats, TeamData } from '../hooks/useLiveGameData'

interface MLBBoxScoreProps {
  homeTeam: TeamData
  awayTeam: TeamData
  players: PlayerStats[]
}

export default function MLBBoxScore({ homeTeam, awayTeam, players }: MLBBoxScoreProps) {
  const homePlayers = players.filter(p => p.is_home_team)
  const awayPlayers = players.filter(p => !p.is_home_team)

  const renderTeam = (team: TeamData, teamPlayers: PlayerStats[]) => {
    const batters = teamPlayers.filter(p => p.mlb_ab && p.mlb_ab > 0)
    const pitchers = teamPlayers.filter(p => p.mlb_ip && p.mlb_ip > 0)

    return (
      <div className="bg-[var(--bg-surface)] rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <Image src={team.logo_url} alt={team.name} width={24} height={24} className="object-contain" unoptimized />
            <span className="font-bold text-[var(--text-primary)]">{team.name}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {batters.length > 0 && (
            <>
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase px-4 py-2 bg-[var(--bg-secondary)]">Batting</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[var(--text-muted)] bg-[var(--bg-secondary)]">
                    <th className="px-3 py-2 text-left font-medium sticky left-0 bg-[var(--bg-secondary)] z-10">Player</th>
                    <th className="px-2 py-2 text-center font-medium">AB</th>
                    <th className="px-2 py-2 text-center font-medium">H</th>
                    <th className="px-2 py-2 text-center font-medium">HR</th>
                    <th className="px-2 py-2 text-center font-medium">RBI</th>
                    <th className="px-2 py-2 text-center font-medium">BB</th>
                    <th className="px-2 py-2 text-center font-medium">K</th>
                    <th className="px-2 py-2 text-center font-medium">AVG</th>
                  </tr>
                </thead>
                <tbody>
                  {batters.map(player => (
                    <tr key={player.player_id} className="border-t border-[var(--border-color)]">
                      <td className="px-3 py-2 text-[var(--text-primary)] sticky left-0 bg-[var(--bg-surface)] z-10">
                        <span className="font-medium">{player.full_name}</span>
                        {player.position && <span className="text-[var(--text-muted)] ml-1 text-xs">{player.position}</span>}
                      </td>
                      <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_ab ?? '-'}</td>
                      <td className="px-2 py-2 text-center font-bold text-[var(--text-primary)]">{player.mlb_hits ?? '-'}</td>
                      <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_home_runs ?? '-'}</td>
                      <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_rbi ?? '-'}</td>
                      <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_bb ?? '-'}</td>
                      <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_so ?? '-'}</td>
                      <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_avg?.toFixed(3) ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {pitchers.length > 0 && (
            <>
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase px-4 py-2 bg-[var(--bg-secondary)] mt-2">Pitching</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[var(--text-muted)] bg-[var(--bg-secondary)]">
                    <th className="px-3 py-2 text-left font-medium sticky left-0 bg-[var(--bg-secondary)] z-10">Player</th>
                    <th className="px-2 py-2 text-center font-medium">IP</th>
                    <th className="px-2 py-2 text-center font-medium">H</th>
                    <th className="px-2 py-2 text-center font-medium">ER</th>
                    <th className="px-2 py-2 text-center font-medium">K</th>
                    <th className="px-2 py-2 text-center font-medium">ERA</th>
                  </tr>
                </thead>
                <tbody>
                  {pitchers.map(player => (
                    <tr key={player.player_id} className="border-t border-[var(--border-color)]">
                      <td className="px-3 py-2 text-[var(--text-primary)] sticky left-0 bg-[var(--bg-surface)] z-10">
                        <span className="font-medium">{player.full_name}</span>
                      </td>
                      <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_ip ?? '-'}</td>
                      <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_h_allowed ?? '-'}</td>
                      <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_er ?? '-'}</td>
                      <td className="px-2 py-2 text-center font-bold text-[var(--text-primary)]">{player.mlb_k ?? '-'}</td>
                      <td className="px-2 py-2 text-center text-[var(--text-muted)]">{player.mlb_era?.toFixed(2) ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {renderTeam(awayTeam, awayPlayers)}
      {renderTeam(homeTeam, homePlayers)}
    </div>
  )
}
