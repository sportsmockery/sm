'use client'

import { useHomepage } from './hooks/useHomepage'
import { useLiveOverlay } from './hooks/useLiveOverlay'
import { HeroSection } from './components/HeroSection'
import { ContentFeed } from './components/ContentFeed'
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
    <div className="max-w-[600px] mx-auto px-4 py-3">
      {/* Hero module — the scroll-stopper */}
      <HeroSection data={data} liveOverlay={liveOverlay.data} />

      {/* Debate (below hero, in feed flow) */}
      {data.pulse_row.todays_debate && (
        <div className="mt-6" id="debate">
          <TodayDebate debate={data.pulse_row.todays_debate} />
        </div>
      )}

      {/* Content feed */}
      <div className="mt-6">
        <ContentFeed items={data.feed} />
      </div>

      {/* Updated timestamp */}
      <div className="mt-8 mb-4 text-center">
        <span className="text-[13px] text-gray-400 dark:text-[#555555]">
          Updated {formatCacheAge(data.cache_age_ms)} ago
        </span>
      </div>
    </div>
  )
}

function DashSkeleton() {
  return (
    <div className="max-w-[600px] mx-auto px-4 py-3 space-y-3 animate-pulse">
      {/* Headline */}
      <div className="h-10 w-3/4 rounded-lg bg-gray-100 dark:bg-[#111111] mt-4" />
      <div className="h-5 w-1/2 rounded bg-gray-100 dark:bg-[#111111]" />
      {/* Pulse */}
      <div className="h-20 rounded-2xl bg-gray-100 dark:bg-[#111111]" />
      {/* Team strip */}
      <div className="flex gap-2.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 w-[160px] flex-shrink-0 rounded-2xl bg-gray-100 dark:bg-[#111111]" />
        ))}
      </div>
      {/* Featured insight */}
      <div className="h-24 rounded-2xl bg-gray-100 dark:bg-[#111111]" />
      {/* What changed */}
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 w-[140px] flex-shrink-0 rounded-xl bg-gray-100 dark:bg-[#111111]" />
        ))}
      </div>
      {/* CTA */}
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-1 h-11 rounded-xl bg-gray-100 dark:bg-[#111111]" />
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
