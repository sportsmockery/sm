'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useHomepage } from '../dash/hooks/useHomepage'
import { useLiveOverlay } from '../dash/hooks/useLiveOverlay'
import { HeroSection } from '../dash/components/HeroSection'
import { ContentFeed } from '../dash/components/ContentFeed'
import { TodayDebate } from '../dash/components/TodayDebate'
import { StickyCityPulseBar } from './components/StickyCityPulseBar'
import { MostTalkedAbout } from './components/MostTalkedAbout'
import { usePulsePersonalization } from './hooks/usePulsePersonalization'
import { trackPulseEvent } from './lib/pulseAnalytics'

export function Dash3Content() {
  const { data, isLoading, error } = useHomepage()
  const liveOverlay = useLiveOverlay(data?.hero?.mode)
  const heroRef = useRef<HTMLDivElement>(null)
  const { markSeen } = usePulsePersonalization()

  // Track hero dwell time
  useEffect(() => {
    if (!data) return
    const start = Date.now()
    trackPulseEvent('hero_view', { mode: data.hero.mode })
    return () => {
      const dwell = Date.now() - start
      if (dwell > 1000) trackPulseEvent('hero_dwell', { ms: dwell, mode: data.hero.mode })
    }
  }, [data?.hero?.mode])

  // Mark as seen for "Since You Left" personalization
  useEffect(() => {
    if (data) markSeen()
  }, [data])

  if (isLoading) return <Dash3Skeleton />
  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg font-medium text-[#0B0F14] dark:text-[#FAFAFB]">Unable to load City Pulse</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#888888]">
            {error instanceof Error ? error.message : 'Please try again later'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Sticky bar — appears after scrolling past hero */}
      <StickyCityPulseBar data={data} heroRef={heroRef} />

      <div className="max-w-[600px] mx-auto px-4 py-3">
        {/* Hero module */}
        <div ref={heroRef}>
          <HeroSection data={data} liveOverlay={liveOverlay.data} />
        </div>

        {/* Most Talked About */}
        <div className="mt-4">
          <MostTalkedAbout feed={data.feed} teams={data.team_grid} />
        </div>

        {/* Debate */}
        {data.pulse_row.todays_debate && (
          <div className="mt-5" id="debate">
            <TodayDebate debate={data.pulse_row.todays_debate} />
          </div>
        )}

        {/* Content feed */}
        <div className="mt-5">
          <ContentFeed items={data.feed} />
        </div>

        {/* Timestamp */}
        <div className="mt-8 mb-4 text-center">
          <span className="text-[13px] text-gray-400 dark:text-[#555555]">
            Updated {formatCacheAge(data.cache_age_ms)} ago
          </span>
        </div>
      </div>
    </>
  )
}

function Dash3Skeleton() {
  return (
    <div className="max-w-[600px] mx-auto px-4 py-3 space-y-3 animate-pulse">
      <div className="h-10 w-3/4 rounded-lg bg-gray-100 dark:bg-[#111111] mt-4" />
      <div className="h-5 w-1/2 rounded bg-gray-100 dark:bg-[#111111]" />
      <div className="h-20 rounded-2xl bg-gray-100 dark:bg-[#111111]" />
      <div className="flex gap-2.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 w-[156px] flex-shrink-0 rounded-2xl bg-gray-100 dark:bg-[#111111]" />
        ))}
      </div>
      <div className="h-20 rounded-2xl bg-gray-100 dark:bg-[#111111]" />
    </div>
  )
}

function formatCacheAge(ms: number): string {
  if (!ms || ms < 0) return '0s'
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s`
  return `${Math.floor(sec / 60)}m`
}
