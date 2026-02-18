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
      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--sm-card)' }}>
        <div className="px-4 py-3" style={{ backgroundColor: 'var(--sm-surface)', borderBottom: '1px solid var(--sm-border)' }}>
          <div className="flex items-center gap-2">
            <Image src={team.logo_url} alt={team.name} width={24} height={24} className="object-contain" unoptimized />
            <span className="font-bold" style={{ color: 'var(--sm-text)' }}>{team.name}</span>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {passers.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--sm-text-muted)' }}>Passing</h4>
              {passers.map(p => (
                <div key={p.player_id} className="flex justify-between py-1">
                  <span style={{ color: 'var(--sm-text)' }}>{p.full_name}</span>
                  <span style={{ color: 'var(--sm-text-muted)' }}>{p.nfl_pass_completions}/{p.nfl_pass_attempts}, {p.nfl_passing_yards} YDS, {p.nfl_passing_tds} TD, {p.nfl_interceptions} INT</span>
                </div>
              ))}
            </div>
          )}
          {rushers.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--sm-text-muted)' }}>Rushing</h4>
              {rushers.map(p => (
                <div key={p.player_id} className="flex justify-between py-1">
                  <span style={{ color: 'var(--sm-text)' }}>{p.full_name}</span>
                  <span style={{ color: 'var(--sm-text-muted)' }}>{p.nfl_rush_attempts} CAR, {p.nfl_rushing_yards} YDS, {p.nfl_rushing_tds} TD</span>
                </div>
              ))}
            </div>
          )}
          {receivers.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--sm-text-muted)' }}>Receiving</h4>
              {receivers.map(p => (
                <div key={p.player_id} className="flex justify-between py-1">
                  <span style={{ color: 'var(--sm-text)' }}>{p.full_name}</span>
                  <span style={{ color: 'var(--sm-text-muted)' }}>{p.nfl_receptions} REC, {p.nfl_receiving_yards} YDS, {p.nfl_receiving_tds} TD</span>
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
