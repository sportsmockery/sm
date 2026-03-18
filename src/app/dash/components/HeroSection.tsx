'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { HomepageData, LiveOverlayData, TeamCard, Injury, FeedItem } from '../types'
import { TEAM_LOGOS } from '../types'
import { VibeRing } from '../shared/VibeRing'
import { LiveBadge } from '../shared/LiveBadge'

// ============================================================
// Team display names (never show raw keys to users)
// ============================================================
const TEAM_DISPLAY: Record<string, string> = {
  bears: 'Bears',
  bulls: 'Bulls',
  blackhawks: 'Blackhawks',
  cubs: 'Cubs',
  whitesox: 'White Sox',
}

function teamName(key: string): string {
  return TEAM_DISPLAY[key] || key.charAt(0).toUpperCase() + key.slice(1)
}

// ============================================================
// Urgency signal per team chip
// ============================================================
type UrgencySignal = { label: string; color: string; pulse?: boolean }

function getTeamUrgency(
  team: TeamCard,
  hasLive: boolean,
  liveTeamIds: string[]
): UrgencySignal | null {
  // LIVE trumps everything
  if (hasLive && liveTeamIds.includes(team.team_key)) {
    return { label: 'LIVE', color: '#BC0000', pulse: true }
  }

  // Playing today
  if (team.next_game) {
    const gameDate = team.next_game.date
    const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    const isToday = gameDate === today || isGameToday(gameDate)
    if (isToday) {
      return team.next_game.time
        ? { label: team.next_game.time.replace(/ CT$/, ''), color: '#D6B05E' }
        : { label: 'TODAY', color: '#D6B05E' }
    }
  }

  // Hot/cold streaks
  if (team.streak_count >= 4 && team.streak_type === 'W') {
    return { label: 'HOT', color: '#00ff88' }
  }
  if (team.streak_count >= 4 && team.streak_type === 'L') {
    return { label: 'COLD', color: '#BC0000' }
  }

  // Vibe-based
  if (team.vibe_score >= 80) return { label: 'HOT', color: '#00ff88' }
  if (team.vibe_score < 30) return { label: 'COLD', color: '#BC0000' }

  return null
}

function isGameToday(dateStr: string): boolean {
  try {
    const now = new Date()
    const ct = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }))
    const todayStr = `${ct.getMonth() + 1}/${ct.getDate()}/${ct.getFullYear()}`
    // Try multiple date formats
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return false
    const dStr = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
    return todayStr === dStr
  } catch {
    return false
  }
}

// ============================================================
// MAIN COMPONENT
// ============================================================

interface HeroSectionProps {
  data: HomepageData
  liveOverlay?: LiveOverlayData | null
}

export function HeroSection({ data, liveOverlay }: HeroSectionProps) {
  const { hero, team_grid, injuries, feed, pulse_row, spotlight } = data
  const [activeTeam, setActiveTeam] = useState<string | null>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  const pulse = hero.city_pulse
  const liveGames = liveOverlay?.games ?? hero.live_games
  const hasLive = hero.mode === 'live' && liveGames.length > 0
  const liveTeamIds = liveGames.map(g => g.team_id)

  const headline = getHeadline(hero, pulse, team_grid)
  const subline = getSubline(hero, pulse, team_grid)
  const pulseNarrative = getPulseNarrative(pulse, team_grid)
  const featuredInsight = getFeaturedInsight(hero, pulse_row, spotlight)
  const whatChanged = getWhatChanged(team_grid, feed)
  const urgencyLine = getUrgencyLine(team_grid)

  return (
    <div className="space-y-2.5">
      {/* ===== DOMINANT HEADLINE ===== */}
      <div className="pt-2 pb-1">
        {hasLive && (
          <div className="mb-2.5">
            <LiveBadge />
          </div>
        )}
        <h1 className="text-[clamp(28px,7vw,42px)] font-bold leading-[1.05] text-[#0B0F14] dark:text-[#FAFAFB]">
          {headline}
        </h1>
        <p className="mt-2 text-[15px] text-gray-600 dark:text-[#999999] leading-snug">
          {subline}
        </p>
        {urgencyLine && (
          <p className="mt-1.5 text-[13px] font-medium" style={{ color: '#D6B05E' }}>
            {urgencyLine}
          </p>
        )}
      </div>

      {/* ===== LIVE SCOREBOARD (only when live) ===== */}
      {hasLive && (
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {liveGames.map(game => (
            <a
              key={game.game_id}
              href={`/live/${game.game_id}`}
              className="flex-shrink-0 flex items-center gap-3 rounded-xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] px-3.5 py-2.5"
            >
              <div className="flex items-center gap-2">
                <img src={game.away_logo} alt="" className="w-7 h-7 object-contain" />
                <motion.span key={`a-${game.away_score}`} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="text-lg font-bold tabular-nums text-[#0B0F14] dark:text-[#FAFAFB]">{game.away_score}</motion.span>
              </div>
              <div className="flex flex-col items-center">
                {game.clock && <span className="text-[11px] font-bold tabular-nums" style={{ color: '#BC0000' }}>{game.clock}</span>}
                {game.period && <span className="text-[11px] text-gray-400">{game.period}</span>}
              </div>
              <div className="flex items-center gap-2">
                <motion.span key={`h-${game.home_score}`} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="text-lg font-bold tabular-nums text-[#0B0F14] dark:text-[#FAFAFB]">{game.home_score}</motion.span>
                <img src={game.home_logo} alt="" className="w-7 h-7 object-contain" />
              </div>
            </a>
          ))}
        </div>
      )}

      {/* ===== CITY PULSE (compact + narrative) ===== */}
      <div className="rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-[#111111] dark:to-[#0f0f0f] border border-gray-200/60 dark:border-[#1a1a1a] px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 dark:text-[#555555]">City Pulse</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tabular-nums text-[#0B0F14] dark:text-[#FAFAFB]">
                {pulse.aggregate_wins}-{pulse.aggregate_losses}{pulse.aggregate_otl > 0 ? `-${pulse.aggregate_otl}` : ''}
              </span>
              <span className="text-sm font-medium tabular-nums" style={{ color: pulse.win_pct >= 0.5 ? '#16a34a' : '#BC0000' }}>
                .{Math.round(pulse.win_pct * 1000).toString().padStart(3, '0')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[13px]">
            <div className="text-right">
              <span className="block text-[11px] text-gray-400 dark:text-[#555555]">Carrying</span>
              <span className="font-medium" style={{ color: '#00ff88' }}>{teamName(pulse.hottest)}</span>
            </div>
            <div className="w-px h-6 bg-gray-200 dark:bg-[#222222]" />
            <div className="text-right">
              <span className="block text-[11px] text-gray-400 dark:text-[#555555]">Sinking</span>
              <span className="font-medium" style={{ color: '#BC0000' }}>{teamName(pulse.coldest)}</span>
            </div>
          </div>
        </div>
        {/* Narrative line */}
        <p className="mt-2 text-[13px] text-gray-500 dark:text-[#777777] leading-snug border-t border-gray-200/60 dark:border-[#1a1a1a] pt-2">
          {pulseNarrative}
        </p>
      </div>

      {/* ===== TEAM STRIP (swipeable with urgency signals) ===== */}
      <div className="-mx-4">
        <div ref={stripRef} className="flex gap-2.5 overflow-x-auto px-4 py-1 scrollbar-hide snap-x snap-mandatory">
          {team_grid.map(team => {
            const isActive = activeTeam === team.team_key
            const logoUrl = TEAM_LOGOS[team.team_key] || ''
            const isLive = hasLive && liveTeamIds.includes(team.team_key)
            const urgency = getTeamUrgency(team, hasLive, liveTeamIds)

            return (
              <button
                key={team.team_key}
                onClick={() => setActiveTeam(isActive ? null : team.team_key)}
                className={`flex-shrink-0 snap-start flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 border transition-all duration-200
                  ${isActive
                    ? 'border-[#00D4FF]/40 bg-[#00D4FF]/5 dark:bg-[#00D4FF]/8 shadow-sm'
                    : 'border-gray-200 dark:border-[#222222] bg-white dark:bg-[#111111] active:scale-[0.97]'
                  }`}
                style={{ minWidth: '168px' }}
              >
                <VibeRing score={team.vibe_score} color={team.vibe_color} logoUrl={logoUrl} size={40} isLive={isLive} />
                <div className="text-left min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-medium text-[#0B0F14] dark:text-[#FAFAFB] truncate">{teamName(team.team_key)}</span>
                    {urgency && (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-px rounded-full flex-shrink-0 ${urgency.pulse ? 'animate-pulse' : ''}`}
                        style={{ backgroundColor: `${urgency.color}18`, color: urgency.color }}
                      >
                        {urgency.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[13px] tabular-nums text-gray-500 dark:text-[#888888]">{team.record}</span>
                    {team.streak_type && team.streak_count > 1 && (
                      <span className="text-[11px] font-bold px-1 py-px rounded" style={{
                        backgroundColor: team.streak_type === 'W' ? '#16a34a20' : '#BC000020',
                        color: team.streak_type === 'W' ? '#16a34a' : '#BC0000'
                      }}>
                        {team.streak_type}{team.streak_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ===== TEAM DRAWER ===== */}
      <AnimatePresence>
        {activeTeam && (
          <TeamDrawer
            team={team_grid.find(t => t.team_key === activeTeam)!}
            injuries={injuries.filter(i => i.team_key === activeTeam)}
            headlines={feed.filter(f => f.type === 'article' && (f as any).team === activeTeam).slice(0, 2) as any[]}
            onClose={() => setActiveTeam(null)}
          />
        )}
      </AnimatePresence>

      {/* ===== FEATURED INSIGHT (narrative-led) ===== */}
      {featuredInsight && (
        <div className="rounded-2xl border border-gray-200/60 dark:border-[#1a1a1a] bg-white dark:bg-[#111111] p-4">
          <div className="flex items-start gap-3">
            <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: featuredInsight.accentColor }} />
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-medium uppercase tracking-widest" style={{ color: featuredInsight.accentColor }}>
                {featuredInsight.label}
              </span>
              <p className="mt-1 text-[15px] font-medium text-[#0B0F14] dark:text-[#FAFAFB] leading-snug">
                {featuredInsight.text}
              </p>
              {featuredInsight.subtext && (
                <p className="mt-1.5 text-[13px] text-gray-500 dark:text-[#888888] leading-snug">{featuredInsight.subtext}</p>
              )}
              {featuredInsight.cta && (
                <a
                  href={featuredInsight.cta.href}
                  className="mt-2 inline-flex text-[13px] font-medium"
                  style={{ color: featuredInsight.accentColor }}
                >
                  {featuredInsight.cta.label}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== WHAT CHANGED (with summary + chips) ===== */}
      {whatChanged.items.length > 0 && (
        <div className="space-y-2">
          <div className="px-0.5">
            <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 dark:text-[#555555]">Since You Left</span>
            <p className="mt-0.5 text-[14px] font-medium text-[#0B0F14] dark:text-[#FAFAFB] leading-snug">
              {whatChanged.summary}
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {whatChanged.items.map((change, i) => (
              <div
                key={i}
                className="flex-shrink-0 flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-[#111111] border border-gray-100 dark:border-[#1a1a1a] px-3 py-2"
              >
                <img src={TEAM_LOGOS[change.team] || ''} alt="" className="w-5 h-5 object-contain" />
                <span className="text-[13px] whitespace-nowrap">
                  <span className="font-medium" style={{ color: change.color }}>{change.prefix}</span>
                  <span className="text-[#0B0F14] dark:text-[#FAFAFB]"> {change.text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== CTA ROW (curiosity-driven) ===== */}
      <div className="flex gap-2 pt-0.5">
        <a
          href="/dash"
          className="flex-1 flex items-center justify-center rounded-xl py-3 text-[13px] font-medium border border-gray-200 dark:border-[#222222] text-[#0B0F14] dark:text-[#FAFAFB] bg-white dark:bg-[#111111] active:scale-[0.97] transition-transform"
        >
          See Full Picture
        </a>
        <a
          href="/ask-ai"
          className="flex-1 flex items-center justify-center rounded-xl py-3 text-[13px] font-medium text-white active:scale-[0.97] transition-transform"
          style={{ backgroundColor: '#00D4FF' }}
        >
          What Should I Know?
        </a>
        {data.pulse_row.todays_debate ? (
          <a
            href="#debate"
            className="flex-1 flex items-center justify-center rounded-xl py-3 text-[13px] font-medium text-white active:scale-[0.97] transition-transform"
            style={{ backgroundColor: '#BC0000' }}
          >
            Cast Your Vote
          </a>
        ) : (
          <a
            href="/gm"
            className="flex-1 flex items-center justify-center rounded-xl py-3 text-[13px] font-medium text-white active:scale-[0.97] transition-transform"
            style={{ backgroundColor: '#D6B05E' }}
          >
            Make a Trade
          </a>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Team Drawer
// ============================================================

function TeamDrawer({
  team,
  injuries,
  headlines,
  onClose,
}: {
  team: TeamCard
  injuries: Injury[]
  headlines: { title: string; url: string }[]
  onClose: () => void
}) {
  const starterInjuries = injuries.filter(i => i.starter).slice(0, 3)
  const logoUrl = TEAM_LOGOS[team.team_key] || ''
  const shortName = team.team_name.split(' ').pop() || team.team_key

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="overflow-hidden"
    >
      <div className="rounded-2xl border border-gray-200/60 dark:border-[#1a1a1a] bg-white dark:bg-[#111111] p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoUrl} alt="" className="w-7 h-7 object-contain" />
            <div>
              <span className="text-[15px] font-medium text-[#0B0F14] dark:text-[#FAFAFB]">{team.team_name}</span>
              <div className="flex items-center gap-2 text-[13px]">
                <span className="tabular-nums text-gray-500 dark:text-[#888888]">{team.record}</span>
                <span className="font-medium" style={{ color: team.vibe_color }}>{team.vibe_label}</span>
                {team.streak_count > 1 && (
                  <span className="font-medium" style={{ color: team.streak_type === 'W' ? '#16a34a' : '#BC0000' }}>
                    {team.streak_type}{team.streak_count}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Last / Next game */}
        <div className="flex gap-2.5">
          {team.last_game && (
            <div className="flex-1 rounded-xl bg-gray-50 dark:bg-[#0B0F14] px-3 py-2.5">
              <span className="text-[11px] text-gray-400 dark:text-[#555555] uppercase tracking-wide">Last Result</span>
              <div className="mt-0.5 text-sm">
                <span className="font-bold" style={{ color: team.last_game.result === 'W' ? '#16a34a' : '#BC0000' }}>
                  {team.last_game.result === 'W' ? 'W' : 'L'}
                </span>
                <span className="text-[#0B0F14] dark:text-[#FAFAFB]"> {team.last_game.score}</span>
                <span className="text-gray-500 dark:text-[#888888]"> vs {team.last_game.opponent}</span>
              </div>
            </div>
          )}
          {team.next_game && (
            <div className="flex-1 rounded-xl bg-gray-50 dark:bg-[#0B0F14] px-3 py-2.5">
              <span className="text-[11px] text-gray-400 dark:text-[#555555] uppercase tracking-wide">
                {team.next_game.type === 'spring_training' ? 'Spring Training' : 'Up Next'}
              </span>
              <div className="mt-0.5 text-sm text-[#0B0F14] dark:text-[#FAFAFB]">
                {team.next_game.home ? 'vs' : '@'} {team.next_game.opponent}
                {team.next_game.time && (
                  <span className="font-medium" style={{ color: '#D6B05E' }}> {team.next_game.time}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Headlines */}
        {headlines.length > 0 && (
          <div className="space-y-1.5">
            {headlines.map((h, i) => (
              <a key={i} href={h.url} className="flex items-start gap-2 text-sm text-[#0B0F14] dark:text-[#FAFAFB] hover:underline" onClick={e => e.stopPropagation()}>
                <span className="text-gray-300 dark:text-[#333333] mt-0.5">{'>'}</span>
                <span className="line-clamp-1">{h.title}</span>
              </a>
            ))}
          </div>
        )}

        {/* Starter injuries */}
        {starterInjuries.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {starterInjuries.map((inj, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-[12px] rounded-lg px-2 py-1" style={{ backgroundColor: '#BC000010', color: '#BC0000' }}>
                <span className="font-bold">{inj.status}</span> {inj.player}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <a
          href={`/chicago-${team.team_key === 'whitesox' ? 'white-sox' : team.team_key}`}
          className="flex items-center justify-center text-[13px] font-medium py-2.5 rounded-xl text-white active:scale-[0.97] transition-transform"
          style={{ backgroundColor: '#00D4FF' }}
        >
          Go to {shortName} Hub
        </a>
      </div>
    </motion.div>
  )
}

// ============================================================
// HEADLINE SYSTEM — opinionated, SM voice, emotionally charged
// ============================================================

function getHeadline(
  hero: HomepageData['hero'],
  pulse: HomepageData['hero']['city_pulse'],
  teams: TeamCard[]
): string {
  // Live game — name the team, create tension
  if (hero.mode === 'live' && hero.live_games.length > 0) {
    const game = hero.live_games[0]
    const name = teamName(game.team_id)
    const diff = game.home_score - game.away_score
    const isChicagoHome = TEAM_LOGOS[game.team_id] ? true : false

    // Compute if Chicago team is winning/losing
    const chicagoScore = isChicagoHome ? game.home_score : game.away_score
    const oppScore = isChicagoHome ? game.away_score : game.home_score

    if (chicagoScore > oppScore && (chicagoScore - oppScore) >= 10) return `The ${name} are blowing the doors off.`
    if (chicagoScore > oppScore) return `${name} have the lead. Don't jinx it.`
    if (chicagoScore < oppScore && (oppScore - chicagoScore) >= 10) return `${name} are getting embarrassed right now.`
    if (chicagoScore < oppScore) return `${name} are down. This could go either way.`
    return `${name} game is tied. Every possession matters.`
  }

  // Breaking story — pass through the SM editorial headline
  if (hero.mode === 'breaking' && hero.breaking) {
    return hero.breaking.headline
  }

  // Pulse-based — specific, opinionated, never generic
  const pct = pulse.win_pct
  const hottest = teams.find(t => t.team_key === pulse.hottest)
  const coldest = teams.find(t => t.team_key === pulse.coldest)
  const hotName = hottest ? teamName(hottest.team_key) : ''
  const coldName = coldest ? teamName(coldest.team_key) : ''

  // Dynasty mode
  if (pct >= 0.65) return `Chicago is dominating. The ${hotName} are leading the charge.`
  if (pct >= 0.55) return `The ${hotName} are carrying this city right now.`
  if (pct >= 0.5) return `Chicago is above .500, but the ${coldName} aren't helping.`

  // Below .500 — the good stuff
  if (pct >= 0.45) {
    if (hottest && hottest.streak_count >= 3 && hottest.streak_type === 'W') {
      return `The ${hotName} are on a run. Everyone else? Not so much.`
    }
    return `This city needs the ${hotName} to keep winning. Nobody else is stepping up.`
  }

  if (pct >= 0.38) {
    if (coldest && coldest.vibe_score < 25) {
      return `The ${coldName} are an absolute disaster. Someone call the front office.`
    }
    return `Chicago sports are in a dark place. The ${coldName} are making it worse.`
  }

  // Rock bottom
  return `This is as bad as it gets. The ${coldName} are unwatchable.`
}

// ============================================================
// SUBLINE — insight-driven, not descriptive
// ============================================================

function getSubline(
  hero: HomepageData['hero'],
  pulse: HomepageData['hero']['city_pulse'],
  teams: TeamCard[]
): string {
  if (hero.mode === 'live' && hero.live_games.length > 0) {
    const g = hero.live_games[0]
    const otherCount = hero.live_games.length - 1
    const extra = otherCount > 0 ? ` + ${otherCount} more game${otherCount > 1 ? 's' : ''} live` : ''
    return `${g.away_team} at ${g.home_team}${g.period ? ` · ${g.period}` : ''}${g.clock ? ` ${g.clock}` : ''}${extra}`
  }

  if (hero.mode === 'breaking' && hero.breaking) {
    return hero.breaking.hook
  }

  // Build a narrative subline from team data
  const active = pulse.teams_active
  const hottest = teams.find(t => t.team_key === pulse.hottest)
  const coldest = teams.find(t => t.team_key === pulse.coldest)
  const parts: string[] = []

  if (hottest) {
    parts.push(`${teamName(hottest.team_key)} ${hottest.record} (${hottest.vibe_label})`)
  }
  if (coldest && coldest.team_key !== hottest?.team_key) {
    parts.push(`${teamName(coldest.team_key)} ${coldest.record}`)
  }

  const teamSummary = parts.join(' · ')
  return `${active} teams in season · ${teamSummary}`
}

// ============================================================
// CITY PULSE NARRATIVE — "why this matters"
// ============================================================

function getPulseNarrative(pulse: HomepageData['hero']['city_pulse'], teams: TeamCard[]): string {
  const pct = pulse.win_pct
  const hotName = teamName(pulse.hottest)
  const coldName = teamName(pulse.coldest)
  const hotTeam = teams.find(t => t.team_key === pulse.hottest)
  const coldTeam = teams.find(t => t.team_key === pulse.coldest)

  // Winning teams
  const teamsAbove500 = teams.filter(t => t.win_pct >= 0.5).length
  const teamsBelow = teams.filter(t => t.win_pct < 0.5 && t.wins + t.losses > 0).length

  if (pct >= 0.6) {
    return `${teamsAbove500} of ${pulse.teams_active} teams above .500. This is a top-5 stretch for the city.`
  }
  if (pct >= 0.5) {
    if (coldTeam && coldTeam.vibe_score < 40) {
      return `The ${hotName} are holding it together, but the ${coldName} are pulling the average down. Mixed bag.`
    }
    return `The city is above water. The ${hotName} are the reason. Everyone else is treading.`
  }
  if (pct >= 0.4) {
    return `Only ${teamsAbove500} team${teamsAbove500 !== 1 ? 's' : ''} above .500. The ${coldName} are making this hard to watch.`
  }
  return `${teamsBelow} teams below .500. There's no way to sugarcoat this. The ${coldName} are the worst of it.`
}

// ============================================================
// FEATURED INSIGHT — narrative-led, stat supports the take
// ============================================================

interface InsightData {
  label: string
  text: string
  subtext?: string
  accentColor: string
  cta?: { label: string; href: string }
}

function getFeaturedInsight(
  hero: HomepageData['hero'],
  pulseRow: HomepageData['pulse_row'],
  spotlight: HomepageData['spotlight']
): InsightData | null {
  // Breaking — the take IS the insight
  if (hero.mode === 'breaking' && hero.breaking) {
    return {
      label: 'Breaking',
      text: hero.breaking.hook,
      subtext: `This is a ${hero.breaking.article_type} story. The city is feeling ${hero.breaking.emotion}.`,
      accentColor: '#BC0000',
      cta: { label: 'Get Scout\'s reaction', href: `/ask-ai?q=${encodeURIComponent(hero.breaking.headline)}` },
    }
  }

  // Scout says — reframe as opinion, not stat
  if (pulseRow.scout_says) {
    const s = pulseRow.scout_says
    return {
      label: 'Scout\'s Take',
      text: s.headline,
      subtext: s.hook,
      accentColor: '#00D4FF',
      cta: { label: 'Ask Scout to explain', href: `/ask-ai?q=${encodeURIComponent(s.headline)}` },
    }
  }

  // Trending take
  if (spotlight.trending_take) {
    const t = spotlight.trending_take
    return {
      label: 'Hot Take',
      text: t.headline,
      subtext: t.hook,
      accentColor: '#BC0000',
      cta: { label: 'Argue with Scout', href: `/ask-ai?q=${encodeURIComponent(t.headline)}` },
    }
  }

  return null
}

// ============================================================
// WHAT CHANGED — summary + detailed chips
// ============================================================

interface WhatChangedData {
  summary: string
  items: { team: string; prefix: string; text: string; color: string }[]
}

function getWhatChanged(teams: TeamCard[], feed: FeedItem[]): WhatChangedData {
  const items: WhatChangedData['items'] = []
  let biggestWin = ''
  let biggestLoss = ''

  for (const team of teams) {
    if (team.last_game) {
      const name = teamName(team.team_key)
      if (team.last_game.result === 'W') {
        items.push({
          team: team.team_key,
          prefix: 'W',
          text: `${team.last_game.score} vs ${team.last_game.opponent}`,
          color: '#16a34a',
        })
        if (!biggestWin) biggestWin = name
      } else {
        items.push({
          team: team.team_key,
          prefix: 'L',
          text: `${team.last_game.score} vs ${team.last_game.opponent}`,
          color: '#BC0000',
        })
        if (!biggestLoss) biggestLoss = name
      }
    }

    // Notable streaks
    if (team.streak_count >= 4) {
      const name = teamName(team.team_key)
      items.push({
        team: team.team_key,
        prefix: team.streak_type === 'W' ? 'STREAK' : 'SKID',
        text: `${team.streak_count} straight ${team.streak_type === 'W' ? 'wins' : 'losses'}`,
        color: team.streak_type === 'W' ? '#16a34a' : '#BC0000',
      })
    }
  }

  // Build summary sentence
  const wins = teams.filter(t => t.last_game?.result === 'W').length
  const losses = teams.filter(t => t.last_game?.result === 'L').length
  let summary = ''

  if (wins > 0 && losses > 0) {
    summary = `${wins} win${wins > 1 ? 's' : ''}, ${losses} loss${losses > 1 ? 'es' : ''} across Chicago.`
    if (biggestWin) summary += ` ${biggestWin} came through.`
    if (biggestLoss) summary += ` ${biggestLoss} didn't.`
  } else if (wins > 0) {
    summary = `Clean sweep. ${wins} win${wins > 1 ? 's' : ''}, zero losses.`
  } else if (losses > 0) {
    summary = `Ugly day. ${losses} loss${losses > 1 ? 'es' : ''} across the board.`
  } else {
    summary = 'No games yesterday. Check back after today.'
  }

  return { summary, items: items.slice(0, 6) }
}

// ============================================================
// URGENCY LINE — time-based, drives return visits
// ============================================================

function getUrgencyLine(teams: TeamCard[]): string | null {
  const todayGames: string[] = []

  for (const team of teams) {
    if (team.next_game) {
      const isToday = isGameToday(team.next_game.date)
      if (isToday) {
        const name = teamName(team.team_key)
        const time = team.next_game.time ? ` at ${team.next_game.time}` : ''
        todayGames.push(`${name}${time}`)
      }
    }
  }

  if (todayGames.length === 0) return null
  if (todayGames.length === 1) return `${todayGames[0]} — come back for live updates.`
  return `${todayGames.join(' and ')} play today. Come back for live.`
}
