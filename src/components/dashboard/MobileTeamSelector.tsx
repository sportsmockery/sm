'use client'

import type { Team } from './types'

interface Props {
  teams: Team[]
  selectedTeam: string | null
  onSelectTeam: (teamKey: string) => void
}

export default function MobileTeamSelector({ teams, selectedTeam, onSelectTeam }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden scrollbar-hide">
      {teams.map((team) => {
        const isSelected = selectedTeam === team.team_key
        const streakColor = team.recent.streak.type === 'W' ? '#00D4FF' : '#BC0000'
        return (
          <button
            key={team.team_key}
            onClick={() => onSelectTeam(team.team_key)}
            className="flex-shrink-0 rounded-xl px-3 py-2.5 border transition-all"
            style={{
              backgroundColor: isSelected ? 'rgba(0,212,255,0.06)' : 'rgba(11,15,20,0.02)',
              borderColor: isSelected ? team.color_primary : 'rgba(11,15,20,0.08)',
              minWidth: 120,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: team.color_primary }}
              />
              <span className="text-xs font-medium" style={{ color: '#0B0F14' }}>
                {team.team_name.replace('Chicago ', '')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs tabular-nums" style={{ color: 'rgba(11,15,20,0.5)' }}>
                {team.record.record_display}
              </span>
              <span
                className="text-xs font-bold px-1 rounded"
                style={{ backgroundColor: `${streakColor}15`, color: streakColor }}
              >
                {team.recent.streak.display}
              </span>
            </div>
            {team.status.is_live && (
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#BC0000' }} />
                <span className="text-xs font-medium" style={{ color: '#BC0000' }}>LIVE</span>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
