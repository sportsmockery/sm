'use client'

import type { HomepageData, TeamCard } from '../types'
import { TeamLogo } from '../shared/TeamLogo'
import { VibeBadge } from '../shared/VibeBadge'
import { StreakBadge } from '../shared/StreakBadge'

interface PulseRowProps {
  cityPulse: HomepageData['hero']['city_pulse']
  pulseRow: HomepageData['pulse_row']
  teamGrid: TeamCard[]
}

export function PulseRow({ cityPulse, pulseRow, teamGrid }: PulseRowProps) {
  const hottestTeam = teamGrid.find(t => t.team_key === cityPulse.hottest)

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible">
      {/* Chicago Record */}
      <div className="flex-shrink-0 min-w-[200px] sm:min-w-0 rounded-xl border border-gray-200 dark:border-[#222222] bg-white dark:bg-[#111111] p-4">
        <span className="text-[13px] text-gray-500 dark:text-[#888888] uppercase tracking-wider">Chicago</span>
        <div className="mt-2 text-2xl font-bold tabular-nums text-[#0B0F14] dark:text-[#FAFAFB]">
          {cityPulse.aggregate_wins}-{cityPulse.aggregate_losses}
        </div>
        <div className="mt-1 text-sm tabular-nums" style={{ color: cityPulse.win_pct >= 0.5 ? '#16a34a' : '#BC0000' }}>
          .{Math.round(cityPulse.win_pct * 1000).toString().padStart(3, '0')}
        </div>
      </div>

      {/* Who's Hot */}
      <div className="flex-shrink-0 min-w-[200px] sm:min-w-0 rounded-xl border border-gray-200 dark:border-[#222222] bg-white dark:bg-[#111111] p-4">
        <span className="text-[13px] text-gray-500 dark:text-[#888888] uppercase tracking-wider">Who&apos;s Hot</span>
        {hottestTeam ? (
          <div className="mt-2 flex items-center gap-2">
            <TeamLogo teamKey={hottestTeam.team_key} size={28} />
            <span className="font-medium text-[#0B0F14] dark:text-[#FAFAFB] capitalize">{hottestTeam.team_key}</span>
          </div>
        ) : (
          <div className="mt-2 text-sm text-gray-500 dark:text-[#888888] capitalize">{cityPulse.hottest}</div>
        )}
        <div className="mt-2 flex items-center gap-2">
          {hottestTeam && <VibeBadge label={hottestTeam.vibe_label} color={hottestTeam.vibe_color} />}
          {hottestTeam && <StreakBadge type={hottestTeam.streak_type} count={hottestTeam.streak_count} />}
        </div>
      </div>

      {/* Today's Debate */}
      <div className="flex-shrink-0 min-w-[200px] sm:min-w-0 rounded-xl border border-gray-200 dark:border-[#222222] bg-white dark:bg-[#111111] p-4">
        <span className="text-[13px] text-gray-500 dark:text-[#888888] uppercase tracking-wider">Today&apos;s Debate</span>
        {pulseRow.todays_debate ? (
          <>
            <p className="mt-2 text-sm font-medium text-[#0B0F14] dark:text-[#FAFAFB] line-clamp-2">
              {pulseRow.todays_debate.caption.split('\n')[0]}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <TeamLogo teamKey={pulseRow.todays_debate.team} size={20} />
              <span className="text-[13px] text-gray-500 dark:text-[#888888] tabular-nums">{pulseRow.todays_debate.total_votes} votes</span>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-gray-500 dark:text-[#888888]">Coming at noon</p>
        )}
      </div>

      {/* Scout Says */}
      <div className="flex-shrink-0 min-w-[200px] sm:min-w-0 rounded-xl border border-gray-200 dark:border-[#222222] bg-white dark:bg-[#111111] p-4">
        <span className="text-[13px] text-gray-500 dark:text-[#888888] uppercase tracking-wider">Scout Says</span>
        {pulseRow.scout_says ? (
          <>
            <p className="mt-2 text-sm font-medium text-[#0B0F14] dark:text-[#FAFAFB] line-clamp-2">{pulseRow.scout_says.headline}</p>
            <span className="mt-2 inline-flex px-2 py-0.5 rounded-full text-[13px] capitalize" style={{ backgroundColor: '#00D4FF20', color: '#00D4FF' }}>
              {pulseRow.scout_says.emotion}
            </span>
          </>
        ) : (
          <p className="mt-2 text-sm text-gray-500 dark:text-[#888888]">Analyzing...</p>
        )}
      </div>
    </div>
  )
}
