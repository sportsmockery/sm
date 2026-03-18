'use client'

import type { City, Team } from './types'

interface Props {
  city: City
  teams: Team[]
}

function getTeamName(teamKey: string, teams: Team[]): string {
  return teams.find(t => t.team_key === teamKey)?.team_name.replace('Chicago ', '') || teamKey
}
function getTeamColor(teamKey: string, teams: Team[]): string {
  return teams.find(t => t.team_key === teamKey)?.color_primary || '#00D4FF'
}

export default function CityOverviewPanel({ city, teams }: Props) {
  const moodColor = city.mood.score >= 60 ? '#00D4FF' : city.mood.score >= 35 ? '#D6B05E' : '#BC0000'

  return (
    <section
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(11,15,20,0.04), 0 8px 32px rgba(11,15,20,0.04)' }}
    >
      {/* Header band */}
      <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(11,15,20,0.05)' }}>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(11,15,20,0.3)' }}>Executive Briefing</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(11,15,20,0.04)' }} />
          <span className="text-lg">{city.mood.emoji}</span>
          <span className="text-[13px] font-bold" style={{ color: moodColor }}>{city.mood.label}</span>
          <span className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md" style={{ backgroundColor: `${moodColor}10`, color: moodColor }}>
            {city.mood.score}
          </span>
        </div>
        <p className="text-[13px] leading-relaxed max-w-3xl" style={{ color: 'rgba(11,15,20,0.6)' }}>
          {city.summary}
        </p>
      </div>

      {/* Metrics strip */}
      <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6">
        <div>
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase block mb-1" style={{ color: 'rgba(11,15,20,0.25)' }}>City Record</span>
          <span className="text-2xl font-bold tabular-nums" style={{ color: '#0B0F14' }}>{city.record.wins}-{city.record.losses}</span>
          <span className="text-[11px] block" style={{ color: 'rgba(11,15,20,0.35)' }}>{(city.record.win_pct * 100).toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase block mb-1" style={{ color: 'rgba(11,15,20,0.25)' }}>Active</span>
          <span className="text-2xl font-bold" style={{ color: '#0B0F14' }}>{city.teams_active}</span>
          <span className="text-[11px] block" style={{ color: 'rgba(11,15,20,0.35)' }}>in-season</span>
        </div>
        <div>
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase block mb-1" style={{ color: 'rgba(11,15,20,0.25)' }}>Above .500</span>
          <span className="text-2xl font-bold" style={{ color: '#0B0F14' }}>{city.teams_above_500}</span>
          <span className="text-[11px] block" style={{ color: 'rgba(11,15,20,0.35)' }}>of {city.teams_active}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase block mb-1" style={{ color: 'rgba(11,15,20,0.25)' }}>Hottest</span>
          <span className="text-[15px] font-bold" style={{ color: getTeamColor(city.hottest_team, teams) }}>{getTeamName(city.hottest_team, teams)}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase block mb-1" style={{ color: 'rgba(11,15,20,0.25)' }}>Coldest</span>
          <span className="text-[15px] font-bold" style={{ color: getTeamColor(city.coldest_team, teams) }}>{getTeamName(city.coldest_team, teams)}</span>
        </div>
        <div className="col-span-2">
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase block mb-1" style={{ color: 'rgba(11,15,20,0.25)' }}>Next Event</span>
          <span className="text-[13px] font-bold block" style={{ color: '#0B0F14' }}>
            {city.next_event.team_name} {city.next_event.home ? 'vs' : '@'} {city.next_event.opponent}
          </span>
          <span className="text-[11px] font-medium" style={{ color: '#00D4FF' }}>{city.next_event.datetime_display}</span>
          <span className="text-[11px] ml-2" style={{ color: 'rgba(11,15,20,0.3)' }}>{city.next_event.venue}</span>
        </div>
      </div>
    </section>
  )
}
