'use client'

import { motion } from 'framer-motion'
import type { HomepageData, LiveOverlayData } from '../types'
import { LiveBadge } from '../shared/LiveBadge'

interface HeroSectionProps {
  hero: HomepageData['hero']
  liveOverlay?: LiveOverlayData | null
}

export function HeroSection({ hero, liveOverlay }: HeroSectionProps) {
  if (hero.mode === 'live') return <LiveGameHero hero={hero} liveOverlay={liveOverlay} />
  if (hero.mode === 'breaking') return <BreakingStoryHero breaking={hero.breaking!} />
  return <CityPulseHero pulse={hero.city_pulse} />
}

function LiveGameHero({ hero, liveOverlay }: { hero: HomepageData['hero']; liveOverlay?: LiveOverlayData | null }) {
  const games = liveOverlay?.games ?? hero.live_games
  const primary = games[0]
  if (!primary) return <CityPulseHero pulse={hero.city_pulse} />

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#111111] dark:to-[#0B0F14] border border-gray-200 dark:border-[#222222] p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <LiveBadge />
        {primary.venue && <span className="text-[13px] text-gray-500 dark:text-[#888888]">{primary.venue}</span>}
        {primary.broadcast && <span className="text-[13px] text-gray-500 dark:text-[#888888]">{primary.broadcast}</span>}
      </div>

      {/* Scoreboard */}
      <div className="flex items-center justify-center gap-8 md:gap-16">
        {/* Away team */}
        <div className="flex flex-col items-center gap-3">
          <img src={primary.away_logo} alt={primary.away_team} className="w-16 h-16 md:w-20 md:h-20 object-contain" />
          <span className="text-[13px] font-medium text-[#0B0F14] dark:text-[#FAFAFB]">{primary.away_abbr}</span>
          <motion.span
            key={primary.away_score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-4xl md:text-5xl font-bold text-[#0B0F14] dark:text-[#FAFAFB] tabular-nums"
          >
            {primary.away_score}
          </motion.span>
        </div>

        {/* Period / Clock */}
        <div className="flex flex-col items-center gap-1">
          {primary.period && (
            <span className="text-sm font-medium text-gray-500 dark:text-[#888888]">{primary.period}</span>
          )}
          {primary.clock && (
            <span className="text-2xl font-bold tabular-nums" style={{ color: '#BC0000' }}>{primary.clock}</span>
          )}
        </div>

        {/* Home team */}
        <div className="flex flex-col items-center gap-3">
          <img src={primary.home_logo} alt={primary.home_team} className="w-16 h-16 md:w-20 md:h-20 object-contain" />
          <span className="text-[13px] font-medium text-[#0B0F14] dark:text-[#FAFAFB]">{primary.home_abbr}</span>
          <motion.span
            key={primary.home_score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-4xl md:text-5xl font-bold text-[#0B0F14] dark:text-[#FAFAFB] tabular-nums"
          >
            {primary.home_score}
          </motion.span>
        </div>
      </div>

      {/* Recent plays */}
      {'plays' in primary && Array.isArray((primary as any).plays) && (primary as any).plays.length > 0 && (
        <div className="mt-6 space-y-2">
          {(primary as any).plays.slice(-3).reverse().map((play: any, i: number) => (
            <div key={i} className="text-[13px] text-gray-600 dark:text-[#888888] bg-gray-100 dark:bg-[#1a1a1a] rounded-lg px-3 py-2">
              {play.description || play.text || JSON.stringify(play)}
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-6 text-center">
        <a
          href={`/live/${primary.game_id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: '#BC0000' }}
        >
          Full Box Score
        </a>
      </div>

      {/* Mini ticker for other games */}
      {games.length > 1 && (
        <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
          {games.slice(1).map(g => (
            <a key={g.game_id} href={`/live/${g.game_id}`} className="flex-shrink-0 flex items-center gap-2 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg px-3 py-2">
              <img src={g.away_logo} alt="" className="w-5 h-5" />
              <span className="text-sm font-medium tabular-nums text-[#0B0F14] dark:text-[#FAFAFB]">{g.away_score}</span>
              <span className="text-[13px] text-gray-400">-</span>
              <span className="text-sm font-medium tabular-nums text-[#0B0F14] dark:text-[#FAFAFB]">{g.home_score}</span>
              <img src={g.home_logo} alt="" className="w-5 h-5" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function BreakingStoryHero({ breaking }: { breaking: NonNullable<HomepageData['hero']['breaking']> }) {
  const emotionColors: Record<string, string> = {
    rage: '#BC0000', panic: '#BC0000', disappointment: '#BC0000',
    hype: '#00ff88', hope: '#00ff88',
    nostalgia: '#888888', LOL: '#888888',
  }
  const accentColor = emotionColors[breaking.emotion] || '#BC0000'

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-[#222222] p-6 md:p-8" style={{ background: `linear-gradient(135deg, ${accentColor}10, transparent)` }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2.5 py-1 rounded-full text-[13px] font-medium text-white" style={{ backgroundColor: '#BC0000' }}>
          BREAKING
        </span>
        <span className="px-2 py-0.5 rounded-full text-[13px] font-medium capitalize" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
          {breaking.emotion}
        </span>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-[#0B0F14] dark:text-[#FAFAFB] mb-3">{breaking.headline}</h2>
      <p className="text-base text-gray-600 dark:text-[#888888] mb-6">{breaking.hook}</p>
      <a
        href={`/ask-ai?q=${encodeURIComponent(breaking.headline)}`}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
        style={{ backgroundColor: '#00D4FF' }}
      >
        Ask Scout
      </a>
    </div>
  )
}

function CityPulseHero({ pulse }: { pulse: HomepageData['hero']['city_pulse'] }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#111111] dark:to-[#0B0F14] border border-gray-200 dark:border-[#222222] p-6 md:p-8">
      <div className="text-center">
        <span className="text-[13px] font-medium text-gray-500 dark:text-[#888888] uppercase tracking-wider">City of Chicago</span>
        <div className="mt-3 flex items-center justify-center gap-3">
          <span className="text-5xl md:text-6xl font-bold tabular-nums text-[#0B0F14] dark:text-[#FAFAFB]">
            {pulse.aggregate_wins}-{pulse.aggregate_losses}
            {pulse.aggregate_otl > 0 && `-${pulse.aggregate_otl}`}
          </span>
        </div>
        <div className="mt-2 text-lg tabular-nums" style={{ color: pulse.win_pct >= 0.5 ? '#16a34a' : '#BC0000' }}>
          .{Math.round(pulse.win_pct * 1000).toString().padStart(3, '0')}
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <span className="text-gray-500 dark:text-[#888888]">
            Hottest: <span className="font-medium capitalize" style={{ color: '#00ff88' }}>{pulse.hottest}</span>
          </span>
          <span className="text-gray-500 dark:text-[#888888]">
            Coldest: <span className="font-medium capitalize" style={{ color: '#BC0000' }}>{pulse.coldest}</span>
          </span>
        </div>
        <div className="mt-1 text-[13px] text-gray-400 dark:text-[#666666]">{pulse.teams_active} teams in season</div>
      </div>
    </div>
  )
}
