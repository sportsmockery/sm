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
      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.15)' }}>
        <div className="px-4 py-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="flex items-center gap-2">
            <Image src={team.logo_url} alt={team.name} width={24} height={24} className="object-contain" unoptimized />
            <span className="font-bold" style={{ color: '#FAFAFB' }}>{team.name}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {batters.length > 0 && (
            <>
              <h4 className="text-xs font-bold uppercase px-4 py-2" style={{ color: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.06)' }}>Batting</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <th className="px-3 py-2 text-left font-medium sticky left-0 z-10" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>Player</th>
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
                    <tr key={player.player_id} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <td className="px-3 py-2 sticky left-0 z-10" style={{ color: '#FAFAFB', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                        <span className="font-medium">{player.full_name}</span>
                        {player.position && <span className="ml-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{player.position}</span>}
                      </td>
                      <td className="px-2 py-2 text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>{player.mlb_ab ?? '-'}</td>
                      <td className="px-2 py-2 text-center font-bold" style={{ color: '#FAFAFB' }}>{player.mlb_hits ?? '-'}</td>
                      <td className="px-2 py-2 text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>{player.mlb_home_runs ?? '-'}</td>
                      <td className="px-2 py-2 text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>{player.mlb_rbi ?? '-'}</td>
                      <td className="px-2 py-2 text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>{player.mlb_bb ?? '-'}</td>
                      <td className="px-2 py-2 text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>{player.mlb_so ?? '-'}</td>
                      <td className="px-2 py-2 text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>{player.mlb_avg?.toFixed(3) ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {pitchers.length > 0 && (
            <>
              <h4 className="text-xs font-bold uppercase px-4 py-2 mt-2" style={{ color: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.06)' }}>Pitching</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <th className="px-3 py-2 text-left font-medium sticky left-0 z-10" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>Player</th>
                    <th className="px-2 py-2 text-center font-medium">IP</th>
                    <th className="px-2 py-2 text-center font-medium">H</th>
                    <th className="px-2 py-2 text-center font-medium">ER</th>
                    <th className="px-2 py-2 text-center font-medium">K</th>
                    <th className="px-2 py-2 text-center font-medium">ERA</th>
                  </tr>
                </thead>
                <tbody>
                  {pitchers.map(player => (
                    <tr key={player.player_id} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <td className="px-3 py-2 sticky left-0 z-10" style={{ color: '#FAFAFB', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                        <span className="font-medium">{player.full_name}</span>
                      </td>
                      <td className="px-2 py-2 text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>{player.mlb_ip ?? '-'}</td>
                      <td className="px-2 py-2 text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>{player.mlb_h_allowed ?? '-'}</td>
                      <td className="px-2 py-2 text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>{player.mlb_er ?? '-'}</td>
                      <td className="px-2 py-2 text-center font-bold" style={{ color: '#FAFAFB' }}>{player.mlb_k ?? '-'}</td>
                      <td className="px-2 py-2 text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>{player.mlb_era?.toFixed(2) ?? '-'}</td>
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
