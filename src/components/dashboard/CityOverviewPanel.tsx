'use client'

import type { City, Team } from './types'

interface Props {
  city: City
  teams: Team[]
}

function MoodGauge({ score, label, emoji, direction }: { score: number; label: string; emoji: string; direction: string }) {
  const barColor = score >= 65 ? '#00D4FF' : score >= 35 ? '#D6B05E' : '#BC0000'
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <span className="text-sm font-bold" style={{ color: '#E8EAED' }}>{label}</span>
        <span className="text-xs" style={{ color: 'rgba(232,234,237,0.35)' }}>
          {direction === 'up' ? '\u2191' : direction === 'down' ? '\u2193' : '\u2192'}
        </span>
      </div>
      <div className="h-1.5 rounded-full w-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: barColor }} />
      </div>
      <span className="text-[10px] tabular-nums" style={{ color: 'rgba(232,234,237,0.3)' }}>{score}/100</span>
    </div>
  )
}

function StatBlock({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: 'rgba(232,234,237,0.3)' }}>{label}</span>
      <span className="text-lg font-bold tabular-nums" style={{ color: '#E8EAED' }}>{value}</span>
      {sub && <span className="text-[10px]" style={{ color: 'rgba(232,234,237,0.35)' }}>{sub}</span>}
    </div>
  )
}

function getTeamName(teamKey: string, teams: Team[]): string {
  const t = teams.find(t => t.team_key === teamKey)
  return t ? t.team_name.replace('Chicago ', '') : teamKey
}

function getTeamColor(teamKey: string, teams: Team[]): string {
  return teams.find(t => t.team_key === teamKey)?.color_primary || '#00D4FF'
}

export default function CityOverviewPanel({ city, teams }: Props) {
  return (
    <div
      className="rounded-2xl p-5 border backdrop-blur-xl"
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderColor: 'rgba(255,255,255,0.06)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(232,234,237,0.3)' }}>
          Executive Briefing
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
      </div>

      <p className="text-sm mb-5 leading-relaxed" style={{ color: 'rgba(232,234,237,0.6)' }}>
        {city.summary}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-5">
        <div className="col-span-2 sm:col-span-1">
          <MoodGauge score={city.mood.score} label={city.mood.label} emoji={city.mood.emoji} direction={city.mood.direction} />
        </div>

        <StatBlock label="City Record" value={`${city.record.wins}-${city.record.losses}`} sub={`${(city.record.win_pct * 100).toFixed(1)}%`} />
        <StatBlock label="Active" value={city.teams_active} sub="teams in-season" />
        <StatBlock label="Above .500" value={city.teams_above_500} sub={`of ${city.teams_active}`} />

        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: 'rgba(232,234,237,0.3)' }}>Hottest</span>
          <span className="text-sm font-bold" style={{ color: getTeamColor(city.hottest_team, teams) }}>
            {getTeamName(city.hottest_team, teams)}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: 'rgba(232,234,237,0.3)' }}>Coldest</span>
          <span className="text-sm font-bold" style={{ color: getTeamColor(city.coldest_team, teams) }}>
            {getTeamName(city.coldest_team, teams)}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: 'rgba(232,234,237,0.3)' }}>Next Up</span>
          <span className="text-sm font-medium" style={{ color: '#E8EAED' }}>
            {city.next_event.team_name} {city.next_event.home ? 'vs' : '@'} {city.next_event.opponent}
          </span>
          <span className="text-[10px]" style={{ color: '#00D4FF' }}>{city.next_event.datetime_display}</span>
        </div>
      </div>
    </div>
  )
}
