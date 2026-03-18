'use client'

import { useHomepage } from './hooks/useHomepage'
import { useLiveOverlay } from './hooks/useLiveOverlay'
import { HeroSection } from './components/HeroSection'
import { PulseRow } from './components/PulseRow'
import { SpotlightModules } from './components/SpotlightModules'
import { TeamGrid } from './components/TeamGrid'
import { ContentFeed } from './components/ContentFeed'
import { FanInteraction } from './components/FanInteraction'
import { TodayDebate } from './components/TodayDebate'

export function DashContent() {
  const { data, isLoading, error } = useHomepage()
  const liveOverlay = useLiveOverlay(data?.hero?.mode)

  if (isLoading) return <DashSkeleton />
  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-medium text-[#0B0F14] dark:text-[#FAFAFB]">Unable to load dashboard</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#888888]">
            {error instanceof Error ? error.message : 'Please try again later'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1300px] mx-auto px-4 py-6 space-y-8">
      {/* Cache freshness */}
      <div className="flex justify-end">
        <span className="text-[13px] text-gray-400 dark:text-[#666666]">
          Updated {formatCacheAge(data.cache_age_ms)} ago
        </span>
      </div>

      {/* Hero */}
      <HeroSection hero={data.hero} liveOverlay={liveOverlay.data} />

      {/* Pulse Row */}
      <PulseRow cityPulse={data.hero.city_pulse} pulseRow={data.pulse_row} teamGrid={data.team_grid} />

      {/* Today's Debate (if available) */}
      {data.pulse_row.todays_debate && (
        <TodayDebate debate={data.pulse_row.todays_debate} />
      )}

      {/* Spotlight */}
      <SpotlightModules spotlight={data.spotlight} />

      {/* Team Grid */}
      <div>
        <h2 className="text-lg font-bold text-[#0B0F14] dark:text-[#FAFAFB] mb-4">Teams</h2>
        <TeamGrid teams={data.team_grid} injuries={data.injuries} feed={data.feed} />
      </div>

      {/* Content Feed */}
      <ContentFeed items={data.feed} />

      {/* Fan Interaction */}
      <FanInteraction fanZone={data.fan_zone} />
    </div>
  )
}

function DashSkeleton() {
  return (
    <div className="max-w-[1300px] mx-auto px-4 py-6 space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-[280px] rounded-2xl bg-gray-100 dark:bg-[#111111]" />
      {/* Pulse row skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[100px] rounded-xl bg-gray-100 dark:bg-[#111111]" />
        ))}
      </div>
      {/* Team grid skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-[120px] rounded-xl bg-gray-100 dark:bg-[#111111]" />
        ))}
      </div>
    </div>
  )
}

function formatCacheAge(ms: number): string {
  if (!ms || ms < 0) return '0s'
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  return `${min}m`
}
