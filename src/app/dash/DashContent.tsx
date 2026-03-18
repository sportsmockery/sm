'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHomepage } from './hooks/useHomepage'
import { useLiveOverlay } from './hooks/useLiveOverlay'
import { ContentFeed } from './components/ContentFeed'
import { TodayDebate } from './components/TodayDebate'
import { VibeRing } from './shared/VibeRing'
import { LiveBadge } from './shared/LiveBadge'
import type { HomepageData, TeamCard, Injury, FeedItem, LiveGame } from './types'
import { TEAM_LOGOS } from './types'
import {
  tn, getCityMood, getHeadline, getSubline, getWhatsNext,
  getPulseNarrative, getFeaturedInsight, getWhatChanged,
  getSurpriseElement, getTeamUrgency, isGameToday, formatCacheAge,
} from './lib/pulseLogic'

// ============================================================
// MAIN: Desktop Command Center
// ============================================================

export function DashContent() {
  const { data, isLoading, error } = useHomepage()
  const liveOverlay = useLiveOverlay(data?.hero?.mode)

  if (isLoading) return <DashSkeleton />
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

  return <DesktopLayout data={data} liveOverlay={liveOverlay.data ?? null} />
}

function DesktopLayout({ data, liveOverlay }: { data: HomepageData; liveOverlay: import('./types').LiveOverlayData | null }) {
  const { hero, team_grid, injuries, feed, pulse_row, spotlight } = data
  const pulse = hero.city_pulse
  const liveGames = liveOverlay?.games ?? hero.live_games
  const hasLive = hero.mode === 'live' && liveGames.length > 0
  const liveTeamIds = liveGames.map(g => g.team_id)

  const mood = useMemo(() => getCityMood(pulse, team_grid), [pulse, team_grid])
  const headline = getHeadline(hero, pulse, team_grid)
  const subline = getSubline(hero, pulse, team_grid)
  const whatsNext = getWhatsNext(team_grid, hero)
  const pulseNarrative = getPulseNarrative(pulse, team_grid)
  const insight = getFeaturedInsight(hero, pulse_row, spotlight)
  const whatChanged = getWhatChanged(team_grid)
  const surprise = useMemo(() => getSurpriseElement(team_grid, pulse, pulse_row), [team_grid, pulse, pulse_row])

  // Comparison data
  const hottest = team_grid.find(t => t.team_key === pulse.hottest)
  const coldest = team_grid.find(t => t.team_key === pulse.coldest)
  const bestWatch = team_grid.find(t => t.next_game && isGameToday(t.next_game.date))

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      {/* ================================================================
          FULL-WIDTH PULSE BAND
          ================================================================ */}
      <div className="mb-8">
        {/* Brand + Live badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-300 dark:text-[#333333]">City Pulse</span>
          <div className="flex items-center gap-3">
            {hasLive && <LiveBadge />}
            <span className="text-[12px] text-gray-400 dark:text-[#555555]">Updated {formatCacheAge(data.cache_age_ms)} ago</span>
          </div>
        </div>

        {/* Headline row */}
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-[clamp(30px,4vw,48px)] font-bold leading-[1.05] text-[#0B0F14] dark:text-[#FAFAFB]">
              {headline}
            </h1>
            <div className="mt-2 flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-[14px] font-medium" style={{ color: mood.color }}>
                <span className="text-lg">{mood.emoji}</span> {mood.label}
              </span>
              <span className="text-[14px] text-gray-500 dark:text-[#888888]">{subline}</span>
              {whatsNext && (
                <span className="text-[13px] font-medium" style={{ color: '#D6B05E' }}>{whatsNext}</span>
              )}
            </div>
          </div>

          {/* Pulse stats — right side of band */}
          <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
            <div className="text-right">
              <span className="text-[11px] text-gray-400 dark:text-[#555555] uppercase tracking-wide">Chicago</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tabular-nums text-[#0B0F14] dark:text-[#FAFAFB]">
                  {pulse.aggregate_wins}-{pulse.aggregate_losses}{pulse.aggregate_otl > 0 ? `-${pulse.aggregate_otl}` : ''}
                </span>
                <span className="text-base font-bold tabular-nums" style={{ color: pulse.win_pct >= 0.5 ? '#16a34a' : '#BC0000' }}>
                  .{Math.round(pulse.win_pct * 1000).toString().padStart(3, '0')}
                </span>
              </div>
            </div>
            <div className="w-px h-10 bg-gray-200 dark:bg-[#222222]" />
            <div>
              <div className="text-[12px]"><span className="text-gray-400 dark:text-[#555555]">Carrying: </span><span className="font-medium" style={{ color: '#00ff88' }}>{tn(pulse.hottest)}</span></div>
              <div className="text-[12px]"><span className="text-gray-400 dark:text-[#555555]">Sinking: </span><span className="font-medium" style={{ color: '#BC0000' }}>{tn(pulse.coldest)}</span></div>
            </div>
          </div>
        </div>

        {/* Since You Left + Narrative */}
        {whatChanged.items.length > 0 && (
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <span className="text-[12px] font-medium" style={{ color: whatChanged.sentimentColor }}>{whatChanged.sentimentLabel}</span>
            <span className="text-[13px] text-[#0B0F14] dark:text-[#FAFAFB]">{whatChanged.summary}</span>
          </div>
        )}

        {/* Live scoreboard strip */}
        {hasLive && (
          <div className="mt-4 flex gap-3 overflow-x-auto scrollbar-hide">
            {liveGames.map(game => (
              <LiveGameChip key={game.game_id} game={game} />
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="mt-5 border-t border-gray-200/60 dark:border-[#1a1a1a]" />
      </div>

      {/* ================================================================
          2-COLUMN LAYOUT: Main (8 cols) + Right Rail (4 cols)
          ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ==================== LEFT MAIN ==================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* City Comparison */}
          <CityComparison hottest={hottest} coldest={coldest} bestWatch={bestWatch} teams={team_grid} />

          {/* Featured Insight */}
          {insight && <InsightCard insight={insight} />}

          {/* Team Panels */}
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-gray-300 dark:text-[#333333] mb-3">All Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {team_grid.map(team => (
                <TeamPanel
                  key={team.team_key}
                  team={team}
                  injuries={injuries.filter(i => i.team_key === team.team_key)}
                  headlines={feed.filter(f => f.type === 'article' && (f as any).team === team.team_key).slice(0, 1) as any[]}
                  hasLive={hasLive}
                  liveTeamIds={liveTeamIds}
                />
              ))}
            </div>
          </div>

          {/* Timeline */}
          <TimelineSection teams={team_grid} whatChanged={whatChanged} />

          {/* Debate */}
          {data.pulse_row.todays_debate && (
            <div id="debate">
              <TodayDebate debate={data.pulse_row.todays_debate} />
            </div>
          )}

          {/* Content Feed */}
          <ContentFeed items={feed} />
        </div>

        {/* ==================== RIGHT RAIL ==================== */}
        <div className="lg:col-span-4 space-y-4">
          {/* Scout Take */}
          <RailCard title="Scout's Take" accentColor="#00D4FF">
            {insight ? (
              <>
                <p className="text-[14px] font-medium text-[#0B0F14] dark:text-[#FAFAFB] leading-snug">{insight.text}</p>
                {insight.subtext && <p className="mt-1 text-[12px] text-gray-500 dark:text-[#888888]">{insight.subtext}</p>}
                {insight.cta && (
                  <a href={insight.cta.href} className="mt-2 inline-flex text-[12px] font-medium" style={{ color: '#00D4FF' }}>{insight.cta.label} &rsaquo;</a>
                )}
              </>
            ) : (
              <p className="text-[13px] text-gray-500 dark:text-[#888888]">Scout is analyzing the city...</p>
            )}
          </RailCard>

          {/* Panic Meter */}
          <PanicMeter />

          {/* Most Talked About */}
          <MostTalkedAboutRail feed={feed} teams={team_grid} />

          {/* Next Up */}
          <RailCard title="Next Up" accentColor="#D6B05E">
            <div className="space-y-2">
              {team_grid.filter(t => t.next_game).map(t => (
                <div key={t.team_key} className="flex items-center gap-2 text-[13px]">
                  <img src={TEAM_LOGOS[t.team_key] || ''} alt="" className="w-5 h-5 object-contain" />
                  <span className="font-medium text-[#0B0F14] dark:text-[#FAFAFB]">{tn(t.team_key)}</span>
                  <span className="text-gray-500 dark:text-[#888888]">
                    {t.next_game!.home ? 'vs' : '@'} {t.next_game!.opponent}
                  </span>
                  {t.next_game!.time && (
                    <span className="ml-auto font-medium tabular-nums" style={{ color: isGameToday(t.next_game!.date) ? '#D6B05E' : '#888888' }}>
                      {t.next_game!.time}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </RailCard>

          {/* Surprise element */}
          {surprise && (
            <div className="px-1">
              <p className="text-[12px] italic leading-snug" style={{ color: surprise.color }}>
                &ldquo;{surprise.text}&rdquo;
              </p>
            </div>
          )}

          {/* Quick Links */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-300 dark:text-[#333333]">Go Deeper</h3>
            {[
              { label: 'War Room', desc: 'Build trades, simulate seasons', href: '/gm', color: '#D6B05E' },
              { label: 'Ask Scout', desc: 'AI-powered analysis', href: '/ask-ai', color: '#00D4FF' },
              { label: 'Fan Chat', desc: 'Talk to the city', href: '/fan-chat', color: '#BC0000' },
            ].map(link => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-[#1a1a1a] bg-white dark:bg-[#111111] px-3.5 py-2.5 active:scale-[0.98] transition-transform"
              >
                <div>
                  <span className="text-[13px] font-medium text-[#0B0F14] dark:text-[#FAFAFB]">{link.label}</span>
                  <span className="text-[12px] text-gray-500 dark:text-[#888888] ml-2">{link.desc}</span>
                </div>
                <span className="text-[13px] font-medium" style={{ color: link.color }}>&rsaquo;</span>
              </a>
            ))}
          </div>

          {/* Team hub links */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-300 dark:text-[#333333]">Team Hubs</h3>
            <div className="flex flex-wrap gap-1.5">
              {team_grid.map(t => (
                <a
                  key={t.team_key}
                  href={`/chicago-${t.team_key === 'whitesox' ? 'white-sox' : t.team_key}`}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-[#1a1a1a] bg-white dark:bg-[#111111] px-2.5 py-1.5 text-[12px] font-medium text-[#0B0F14] dark:text-[#FAFAFB] hover:border-gray-300 dark:hover:border-[#333333] transition-colors"
                >
                  <img src={TEAM_LOGOS[t.team_key] || ''} alt="" className="w-4 h-4 object-contain" />
                  {tn(t.team_key)}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// COMPONENTS
// ============================================================

function LiveGameChip({ game }: { game: LiveGame }) {
  return (
    <a href={`/live/${game.game_id}`} className="flex-shrink-0 flex items-center gap-3 rounded-xl bg-white dark:bg-[#111111] border border-[#BC0000]/20 px-4 py-2.5 active:scale-[0.97] transition-transform">
      <div className="flex items-center gap-2">
        <img src={game.away_logo} alt="" className="w-7 h-7 object-contain" />
        <motion.span key={`a-${game.away_score}`} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-lg font-bold tabular-nums text-[#0B0F14] dark:text-[#FAFAFB]">{game.away_score}</motion.span>
      </div>
      <div className="flex flex-col items-center leading-none">
        {game.clock && <span className="text-[10px] font-bold tabular-nums" style={{ color: '#BC0000' }}>{game.clock}</span>}
        {game.period && <span className="text-[10px] text-gray-400">{game.period}</span>}
      </div>
      <div className="flex items-center gap-2">
        <motion.span key={`h-${game.home_score}`} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-lg font-bold tabular-nums text-[#0B0F14] dark:text-[#FAFAFB]">{game.home_score}</motion.span>
        <img src={game.home_logo} alt="" className="w-7 h-7 object-contain" />
      </div>
    </a>
  )
}

function CityComparison({ hottest, coldest, bestWatch, teams }: { hottest?: TeamCard; coldest?: TeamCard; bestWatch?: TeamCard; teams: TeamCard[] }) {
  const cards: { label: string; team: TeamCard; color: string; tagline: string }[] = []

  if (hottest) cards.push({
    label: 'Carrying the City',
    team: hottest,
    color: '#00ff88',
    tagline: hottest.streak_count >= 3 && hottest.streak_type === 'W'
      ? `${hottest.streak_count}-game win streak. The only good news.`
      : `${hottest.vibe_label} energy. Best vibe in town.`,
  })
  if (coldest && coldest.team_key !== hottest?.team_key) cards.push({
    label: 'Sinking the City',
    team: coldest,
    color: '#BC0000',
    tagline: coldest.streak_count >= 3 && coldest.streak_type === 'L'
      ? `${coldest.streak_count}-game losing streak. Somebody do something.`
      : `${coldest.vibe_label} vibe. The fans are over it.`,
  })
  if (bestWatch && bestWatch.team_key !== hottest?.team_key && bestWatch.team_key !== coldest?.team_key) cards.push({
    label: 'Best Watch Today',
    team: bestWatch,
    color: '#D6B05E',
    tagline: bestWatch.next_game
      ? `${bestWatch.next_game.home ? 'vs' : '@'} ${bestWatch.next_game.opponent}${bestWatch.next_game.time ? ` at ${bestWatch.next_game.time}` : ''}`
      : '',
  })

  if (cards.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {cards.map(c => (
        <a
          key={c.label}
          href={`/chicago-${c.team.team_key === 'whitesox' ? 'white-sox' : c.team.team_key}`}
          className="rounded-xl border border-gray-200/60 dark:border-[#1a1a1a] bg-white dark:bg-[#111111] p-4 hover:border-gray-300 dark:hover:border-[#333333] transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: c.color }}>{c.label}</span>
            <img src={TEAM_LOGOS[c.team.team_key] || ''} alt="" className="w-6 h-6 object-contain" />
          </div>
          <div className="text-[18px] font-bold text-[#0B0F14] dark:text-[#FAFAFB]">{tn(c.team.team_key)}</div>
          <div className="text-[13px] tabular-nums text-gray-500 dark:text-[#888888] mt-0.5">{c.team.record} · <span style={{ color: c.team.vibe_color }}>{c.team.vibe_label}</span></div>
          <p className="text-[12px] text-gray-500 dark:text-[#777777] mt-1.5 leading-snug">{c.tagline}</p>
        </a>
      ))}
    </div>
  )
}

function InsightCard({ insight }: { insight: NonNullable<ReturnType<typeof getFeaturedInsight>> }) {
  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-[#1a1a1a] bg-white dark:bg-[#111111] p-5">
      <div className="flex items-start gap-3">
        <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: insight.accentColor }} />
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: insight.accentColor }}>{insight.label}</span>
          <p className="mt-1 text-[16px] font-medium text-[#0B0F14] dark:text-[#FAFAFB] leading-snug">{insight.text}</p>
          {insight.subtext && <p className="mt-1.5 text-[13px] text-gray-500 dark:text-[#888888] leading-snug">{insight.subtext}</p>}
          {insight.cta && (
            <a href={insight.cta.href} className="mt-2 inline-flex text-[13px] font-medium" style={{ color: insight.accentColor }}>{insight.cta.label} &rsaquo;</a>
          )}
        </div>
      </div>
    </div>
  )
}

function TeamPanel({
  team, injuries, headlines, hasLive, liveTeamIds,
}: {
  team: TeamCard; injuries: Injury[]; headlines: { title: string; url: string }[]; hasLive: boolean; liveTeamIds: string[]
}) {
  const logoUrl = TEAM_LOGOS[team.team_key] || ''
  const urgency = getTeamUrgency(team, hasLive, liveTeamIds)
  const isLive = liveTeamIds.includes(team.team_key)
  const injuryCount = injuries.filter(i => i.starter).length
  const teamSlug = team.team_key === 'whitesox' ? 'white-sox' : team.team_key

  return (
    <a
      href={`/chicago-${teamSlug}`}
      className={`rounded-xl border bg-white dark:bg-[#111111] p-3.5 hover:border-gray-300 dark:hover:border-[#333333] transition-colors ${
        isLive ? 'border-[#BC0000]/30' : 'border-gray-200/60 dark:border-[#1a1a1a]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2">
        <VibeRing score={team.vibe_score} color={team.vibe_color} logoUrl={logoUrl} size={36} isLive={isLive} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-[#0B0F14] dark:text-[#FAFAFB]">{tn(team.team_key)}</span>
            {urgency && (
              <span className={`text-[9px] font-bold uppercase px-1.5 py-px rounded-full ${urgency.pulse ? 'animate-pulse' : ''}`} style={{ backgroundColor: `${urgency.color}18`, color: urgency.color }}>
                {urgency.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-gray-500 dark:text-[#888888]">
            <span className="tabular-nums font-medium">{team.record}</span>
            <span style={{ color: team.vibe_color }}>{team.vibe_label}</span>
            {team.streak_count > 1 && (
              <span className="font-bold" style={{ color: team.streak_type === 'W' ? '#16a34a' : '#BC0000' }}>{team.streak_type}{team.streak_count}</span>
            )}
          </div>
        </div>
      </div>

      {/* Momentum dots */}
      {team.streak_count >= 2 && (
        <div className="flex gap-[3px] mb-2">
          {Array.from({ length: Math.min(team.streak_count, 10) }).map((_, i) => (
            <div key={i} className="w-[6px] h-[6px] rounded-full" style={{
              backgroundColor: team.streak_type === 'W' ? '#16a34a' : '#BC0000',
              opacity: 0.4 + (i / Math.min(team.streak_count, 10)) * 0.6,
            }} />
          ))}
        </div>
      )}

      {/* Last result */}
      {team.last_game && (
        <div className="text-[12px] text-gray-500 dark:text-[#888888] mb-1">
          <span className="font-bold" style={{ color: team.last_game.result === 'W' ? '#16a34a' : '#BC0000' }}>{team.last_game.result}</span>{' '}
          {team.last_game.score} vs {team.last_game.opponent}
        </div>
      )}

      {/* Next game */}
      {team.next_game && (
        <div className="text-[12px] text-gray-500 dark:text-[#888888] mb-1">
          Next: {team.next_game.home ? 'vs' : '@'} {team.next_game.opponent}
          {team.next_game.time && <span className="font-medium" style={{ color: '#D6B05E' }}> {team.next_game.time}</span>}
        </div>
      )}

      {/* Top headline */}
      {headlines.length > 0 && (
        <p className="text-[12px] text-[#0B0F14] dark:text-[#FAFAFB] line-clamp-1 mb-1">{headlines[0].title}</p>
      )}

      {/* Injury count */}
      {injuryCount > 0 && (
        <span className="text-[11px] rounded px-1.5 py-0.5" style={{ backgroundColor: '#BC000010', color: '#BC0000' }}>
          {injuryCount} starter{injuryCount > 1 ? 's' : ''} out
        </span>
      )}
    </a>
  )
}

function TimelineSection({ teams, whatChanged }: { teams: TeamCard[]; whatChanged: ReturnType<typeof getWhatChanged> }) {
  if (whatChanged.items.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-gray-300 dark:text-[#333333]">Last 24 Hours</h2>
        <span className="text-[12px] font-medium" style={{ color: whatChanged.sentimentColor }}>{whatChanged.sentimentLabel}</span>
      </div>
      <div className="space-y-2">
        {whatChanged.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-100 dark:border-[#1a1a1a] bg-white dark:bg-[#111111] px-3.5 py-2.5">
            <img src={TEAM_LOGOS[item.team] || ''} alt="" className="w-5 h-5 object-contain" />
            <span className="text-[13px] font-bold tabular-nums" style={{ color: item.color }}>{item.prefix}</span>
            <span className="text-[13px] text-[#0B0F14] dark:text-[#FAFAFB]">{item.text}</span>
            <a href={`/chicago-${item.team === 'whitesox' ? 'white-sox' : item.team}`} className="ml-auto text-[12px] font-medium" style={{ color: '#00D4FF' }}>
              Why? &rsaquo;
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

function RailCard({ title, accentColor, children }: { title: string; accentColor: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-[#1a1a1a] bg-white dark:bg-[#111111] p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-[3px] h-4 rounded-full" style={{ backgroundColor: accentColor }} />
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-[#555555]">{title}</span>
      </div>
      {children}
    </div>
  )
}

function PanicMeter() {
  const [vote, setVote] = useState<number | null>(null)
  const labels = ['Fine', 'Uneasy', 'Nervous', 'Panicking', 'Meltdown'] as const
  const colors = ['#16a34a', '#84cc16', '#D6B05E', '#f97316', '#BC0000']

  return (
    <RailCard title="Panic Meter" accentColor="#BC0000">
      <p className="text-[12px] text-gray-500 dark:text-[#888888] mb-2">How worried are you about Chicago sports?</p>
      <div className="grid grid-cols-5 gap-1">
        {labels.map((label, i) => {
          const voted = vote === i
          return (
            <button
              key={label}
              onClick={() => setVote(i)}
              disabled={vote !== null}
              className={`py-2 rounded-lg text-[10px] font-medium transition-all ${
                vote === null
                  ? 'border border-gray-200 dark:border-[#222222] text-gray-600 dark:text-[#888888] active:scale-[0.93]'
                  : voted
                    ? 'border-2 text-white'
                    : 'border border-gray-100 dark:border-[#1a1a1a] text-gray-300 dark:text-[#444444]'
              }`}
              style={voted ? { borderColor: colors[i], backgroundColor: colors[i] } : undefined}
            >
              {label}
            </button>
          )
        })}
      </div>
      {vote !== null && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-[12px] text-gray-500 dark:text-[#777777] text-center">
          {vote <= 1 ? 'Brave. Scout agrees... for now.' : vote <= 2 ? 'Fair. Most of the city feels the same.' : 'Yeah. You and everyone else.'}
        </motion.p>
      )}
    </RailCard>
  )
}

function MostTalkedAboutRail({ feed, teams }: { feed: FeedItem[]; teams: TeamCard[] }) {
  const topTeam = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of feed) {
      const team = 'team' in item ? (item as any).team : ('team_key' in item ? (item as any).team_key : null)
      if (team && TEAM_LOGOS[team]) counts[team] = (counts[team] || 0) + 1
    }
    let best = '', bestCount = 0
    for (const [k, v] of Object.entries(counts)) {
      if (v > bestCount) { best = k; bestCount = v }
    }
    return best && bestCount >= 2 ? { team: best, count: bestCount } : null
  }, [feed])

  if (!topTeam) return null

  return (
    <RailCard title="Most Talked About" accentColor="#D6B05E">
      <div className="flex items-center gap-2">
        <img src={TEAM_LOGOS[topTeam.team] || ''} alt="" className="w-6 h-6 object-contain" />
        <span className="text-[14px] font-medium text-[#0B0F14] dark:text-[#FAFAFB]">{tn(topTeam.team)}</span>
        <span className="text-[12px] text-gray-500 dark:text-[#888888]">{topTeam.count} stories today</span>
      </div>
      <a
        href={`/chicago-${topTeam.team === 'whitesox' ? 'white-sox' : topTeam.team}`}
        className="mt-2 inline-flex text-[12px] font-medium"
        style={{ color: '#00D4FF' }}
      >
        See all {tn(topTeam.team)} coverage &rsaquo;
      </a>
    </RailCard>
  )
}

// ============================================================
// SKELETON
// ============================================================

function DashSkeleton() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6 animate-pulse">
      <div className="h-12 w-2/3 rounded-lg bg-gray-100 dark:bg-[#111111] mb-3" />
      <div className="h-6 w-1/3 rounded bg-gray-100 dark:bg-[#111111] mb-6" />
      <div className="border-t border-gray-200/60 dark:border-[#1a1a1a] mb-8" />
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-gray-100 dark:bg-[#111111]" />)}
          </div>
          <div className="h-24 rounded-xl bg-gray-100 dark:bg-[#111111]" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-36 rounded-xl bg-gray-100 dark:bg-[#111111]" />)}
          </div>
        </div>
        <div className="col-span-4 space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-gray-100 dark:bg-[#111111]" />)}
        </div>
      </div>
    </div>
  )
}
