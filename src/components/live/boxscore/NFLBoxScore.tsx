'use client'

import Image from 'next/image'
import type { PlayerStats, TeamData } from '../hooks/useLiveGameData'

interface NFLBoxScoreProps {
  homeTeam: TeamData
  awayTeam: TeamData
  players: PlayerStats[]
}

export default function NFLBoxScore({ homeTeam, awayTeam, players }: NFLBoxScoreProps) {
  const homePlayers = players.filter(p => p.is_home_team)
  const awayPlayers = players.filter(p => !p.is_home_team)

  const renderTeam = (team: TeamData, teamPlayers: PlayerStats[]) => {
    const passers = teamPlayers.filter(p => p.nfl_pass_attempts && p.nfl_pass_attempts > 0)
    const rushers = teamPlayers.filter(p => p.nfl_rush_attempts && p.nfl_rush_attempts > 0).sort((a, b) => (b.nfl_rushing_yards || 0) - (a.nfl_rushing_yards || 0)).slice(0, 5)
    const receivers = teamPlayers.filter(p => p.nfl_receptions && p.nfl_receptions > 0).sort((a, b) => (b.nfl_receiving_yards || 0) - (a.nfl_receiving_yards || 0)).slice(0, 5)

    return (
      <div className="bg-[var(--bg-surface)] rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <Image src={team.logo_url} alt={team.name} width={24} height={24} className="object-contain" unoptimized />
            <span className="font-bold text-[var(--text-primary)]">{team.name}</span>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {passers.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Passing</h4>
              {passers.map(p => (
                <div key={p.player_id} className="flex justify-between py-1">
                  <span className="text-[var(--text-primary)]">{p.full_name}</span>
                  <span className="text-[var(--text-muted)]">{p.nfl_pass_completions}/{p.nfl_pass_attempts}, {p.nfl_passing_yards} YDS, {p.nfl_passing_tds} TD, {p.nfl_interceptions} INT</span>
                </div>
              ))}
            </div>
          )}
          {rushers.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Rushing</h4>
              {rushers.map(p => (
                <div key={p.player_id} className="flex justify-between py-1">
                  <span className="text-[var(--text-primary)]">{p.full_name}</span>
                  <span className="text-[var(--text-muted)]">{p.nfl_rush_attempts} CAR, {p.nfl_rushing_yards} YDS, {p.nfl_rushing_tds} TD</span>
                </div>
              ))}
            </div>
          )}
          {receivers.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Receiving</h4>
              {receivers.map(p => (
                <div key={p.player_id} className="flex justify-between py-1">
                  <span className="text-[var(--text-primary)]">{p.full_name}</span>
                  <span className="text-[var(--text-muted)]">{p.nfl_receptions} REC, {p.nfl_receiving_yards} YDS, {p.nfl_receiving_tds} TD</span>
                </div>
              ))}
            </div>
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
