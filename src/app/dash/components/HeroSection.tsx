'use client'

import { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { HomepageData, LiveOverlayData, TeamCard, Injury, FeedItem } from '../types'
import { TEAM_LOGOS } from '../types'
import { VibeRing } from '../shared/VibeRing'
import { LiveBadge } from '../shared/LiveBadge'

// ============================================================
// Constants
// ============================================================

const TEAM_DISPLAY: Record<string, string> = {
  bears: 'Bears', bulls: 'Bulls', blackhawks: 'Blackhawks', cubs: 'Cubs', whitesox: 'White Sox',
}

function tn(key: string): string {
  return TEAM_DISPLAY[key] || key.charAt(0).toUpperCase() + key.slice(1)
}

// ============================================================
// City Mood system
// ============================================================

interface CityMood {
  emoji: string
  label: string
  color: string
}

function getCityMood(pulse: HomepageData['hero']['city_pulse'], teams: TeamCard[]): CityMood {
  const pct = pulse.win_pct
  const hotStreak = teams.some(t => t.streak_count >= 5 && t.streak_type === 'W')
  const coldStreak = teams.some(t => t.streak_count >= 5 && t.streak_type === 'L')
  const crisisCount = teams.filter(t => t.vibe_score < 30).length

  if (pct >= 0.6 && hotStreak) return { emoji: '\u{1F525}', label: 'On Fire', color: '#00ff88' }
  if (pct >= 0.6) return { emoji: '\u{1F4AA}', label: 'Flexing', color: '#00ff88' }
  if (pct >= 0.52) return { emoji: '\u{1F60F}', label: 'Confident', color: '#00ff88' }
  if (pct >= 0.48) return { emoji: '\u{1F914}', label: 'Cautious', color: '#D6B05E' }
  if (pct >= 0.42) return { emoji: '\u{1F612}', label: 'Frustrated', color: '#BC0000' }
  if (crisisCount >= 2) return { emoji: '\u{1F6A8}', label: 'Code Red', color: '#BC0000' }
  if (coldStreak) return { emoji: '\u{1F4A2}', label: 'Furious', color: '#BC0000' }
  if (pct >= 0.35) return { emoji: '\u{1F62C}', label: 'Angry', color: '#BC0000' }
  return { emoji: '\u{1F480}', label: 'Pain', color: '#BC0000' }
}

// ============================================================
// Surprise element (rotates every minute from available data)
// ============================================================

function getSurpriseElement(
  teams: TeamCard[],
  pulse: HomepageData['hero']['city_pulse'],
  pulseRow: HomepageData['pulse_row'],
): { text: string; color: string } | null {
  const pool: { text: string; color: string }[] = []

  // Extreme streaks
  for (const t of teams) {
    if (t.streak_count >= 5 && t.streak_type === 'W') pool.push({ text: `${tn(t.team_key)} have won ${t.streak_count} straight. When does the parade start?`, color: '#00ff88' })
    if (t.streak_count >= 5 && t.streak_type === 'L') pool.push({ text: `${tn(t.team_key)} have lost ${t.streak_count} straight. Sell everything.`, color: '#BC0000' })
    if (t.vibe_score >= 90) pool.push({ text: `${tn(t.team_key)} vibe check: ${t.vibe_score}/100. Elite energy.`, color: '#00ff88' })
    if (t.vibe_score <= 15) pool.push({ text: `${tn(t.team_key)} vibe check: ${t.vibe_score}/100. Send help.`, color: '#BC0000' })
  }

  // City-level
  if (pulse.win_pct >= 0.6) pool.push({ text: `Chicago is winning at a .${Math.round(pulse.win_pct * 1000)} clip. This doesn't happen often.`, color: '#00ff88' })
  if (pulse.win_pct < 0.35) pool.push({ text: `Combined .${Math.round(pulse.win_pct * 1000)} win rate. Let that sink in.`, color: '#BC0000' })

  if (pool.length === 0) return null
  const idx = Math.floor(Date.now() / 60000) % pool.length
  return pool[idx]
}

// ============================================================
// Urgency signals per team chip
// ============================================================

type UrgencySignal = { label: string; color: string; pulse?: boolean }

function getTeamUrgency(team: TeamCard, hasLive: boolean, liveTeamIds: string[]): UrgencySignal | null {
  if (hasLive && liveTeamIds.includes(team.team_key)) return { label: 'LIVE', color: '#BC0000', pulse: true }
  if (team.next_game && isGameToday(team.next_game.date)) {
    return team.next_game.time
      ? { label: team.next_game.time.replace(/ CT$/, ''), color: '#D6B05E' }
      : { label: 'TODAY', color: '#D6B05E' }
  }
  if (team.streak_count >= 4 && team.streak_type === 'W') return { label: 'HOT', color: '#00ff88' }
  if (team.streak_count >= 4 && team.streak_type === 'L') return { label: 'COLD', color: '#BC0000' }
  if (team.vibe_score >= 80) return { label: 'HOT', color: '#00ff88' }
  if (team.vibe_score < 30) return { label: 'COLD', color: '#BC0000' }
  return null
}

function isGameToday(dateStr: string): boolean {
  try {
    const ct = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }))
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return false
    return ct.getFullYear() === d.getFullYear() && ct.getMonth() === d.getMonth() && ct.getDate() === d.getDate()
  } catch { return false }
}

// ============================================================
// Streak dots
// ============================================================

function StreakDots({ type, count }: { type: string; count: number }) {
  if (!type || count < 2) return null
  const max = Math.min(count, 8)
  const color = type === 'W' ? '#16a34a' : '#BC0000'
  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: color, opacity: 0.5 + (i / max) * 0.5 }} />
      ))}
    </div>
  )
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
  const [panicVote, setPanicVote] = useState<number | null>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  const pulse = hero.city_pulse
  const liveGames = liveOverlay?.games ?? hero.live_games
  const hasLive = hero.mode === 'live' && liveGames.length > 0
  const liveTeamIds = liveGames.map(g => g.team_id)

  const mood = useMemo(() => getCityMood(pulse, team_grid), [pulse, team_grid])
  const headline = getHeadline(hero, pulse, team_grid)
  const subline = getSubline(hero, pulse, team_grid)
  const whatsNext = getWhatsNext(team_grid, hero)
  const pulseNarrative = getPulseNarrative(pulse, team_grid)
  const featuredInsight = getFeaturedInsight(hero, pulse_row, spotlight)
  const whatChanged = getWhatChanged(team_grid)
  const surprise = useMemo(() => getSurpriseElement(team_grid, pulse, pulse_row), [team_grid, pulse, pulse_row])

  // In live mode, sort live team first
  const sortedTeams = hasLive
    ? [...team_grid].sort((a, b) => {
        const aLive = liveTeamIds.includes(a.team_key) ? 0 : 1
        const bLive = liveTeamIds.includes(b.team_key) ? 0 : 1
        return aLive - bLive
      })
    : team_grid

  return (
    <div className="space-y-2">
      {/* ===== MODULE BRAND ===== */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300 dark:text-[#333333]">City Pulse</span>
        {hasLive && <LiveBadge />}
      </div>

      {/* ===== HEADLINE + MOOD ===== */}
      <div className="pb-0.5">
        <h1 className="text-[clamp(26px,7vw,40px)] font-bold leading-[1.05] text-[#0B0F14] dark:text-[#FAFAFB]">
          {headline}
        </h1>
        {/* City Mood */}
        <div className="mt-1.5 flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: mood.color }}>
            <span className="text-base">{mood.emoji}</span> {mood.label}
          </span>
          <span className="text-[13px] text-gray-500 dark:text-[#888888]">{subline}</span>
        </div>
        {/* What's Next */}
        {whatsNext && (
          <p className="mt-1 text-[13px] font-medium" style={{ color: '#D6B05E' }}>
            {whatsNext}
          </p>
        )}
      </div>

      {/* ===== LIVE SCOREBOARD ===== */}
      {hasLive && (
        <div className="flex gap-2.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {liveGames.map(game => (
            <a
              key={game.game_id}
              href={`/live/${game.game_id}`}
              className="flex-shrink-0 flex items-center gap-3 rounded-xl bg-white dark:bg-[#111111] border border-[#BC0000]/20 px-3 py-2 active:scale-[0.97] transition-transform"
            >
              <div className="flex items-center gap-1.5">
                <img src={game.away_logo} alt="" className="w-6 h-6 object-contain" />
                <motion.span key={`a-${game.away_score}`} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="text-base font-bold tabular-nums text-[#0B0F14] dark:text-[#FAFAFB]">{game.away_score}</motion.span>
              </div>
              <div className="flex flex-col items-center leading-none">
                {game.clock && <span className="text-[10px] font-bold tabular-nums" style={{ color: '#BC0000' }}>{game.clock}</span>}
                {game.period && <span className="text-[10px] text-gray-400">{game.period}</span>}
              </div>
              <div className="flex items-center gap-1.5">
                <motion.span key={`h-${game.home_score}`} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="text-base font-bold tabular-nums text-[#0B0F14] dark:text-[#FAFAFB]">{game.home_score}</motion.span>
                <img src={game.home_logo} alt="" className="w-6 h-6 object-contain" />
              </div>
            </a>
          ))}
        </div>
      )}

      {/* ===== CITY PULSE CARD ===== */}
      <div className="rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-[#111111] dark:to-[#0f0f0f] border border-gray-200/60 dark:border-[#1a1a1a] px-3.5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold tabular-nums text-[#0B0F14] dark:text-[#FAFAFB]">
              {pulse.aggregate_wins}-{pulse.aggregate_losses}{pulse.aggregate_otl > 0 ? `-${pulse.aggregate_otl}` : ''}
            </span>
            <span className="text-[13px] font-bold tabular-nums" style={{ color: pulse.win_pct >= 0.5 ? '#16a34a' : '#BC0000' }}>
              .{Math.round(pulse.win_pct * 1000).toString().padStart(3, '0')}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[12px]">
            <span><span className="text-gray-400 dark:text-[#555555]">Up: </span><span className="font-medium" style={{ color: '#00ff88' }}>{tn(pulse.hottest)}</span></span>
            <span><span className="text-gray-400 dark:text-[#555555]">Down: </span><span className="font-medium" style={{ color: '#BC0000' }}>{tn(pulse.coldest)}</span></span>
          </div>
        </div>
        <p className="mt-1.5 text-[12px] text-gray-500 dark:text-[#777777] leading-snug">{pulseNarrative}</p>
      </div>

      {/* ===== TEAM STRIP ===== */}
      <div className="-mx-4">
        <div ref={stripRef} className="flex gap-2 overflow-x-auto px-4 py-0.5 scrollbar-hide snap-x snap-mandatory">
          {sortedTeams.map(team => {
            const isActive = activeTeam === team.team_key
            const logoUrl = TEAM_LOGOS[team.team_key] || ''
            const isLive = liveTeamIds.includes(team.team_key)
            const urgency = getTeamUrgency(team, hasLive, liveTeamIds)
            // In live mode, dim non-live teams
            const dimmed = hasLive && !isLive && !isActive

            return (
              <button
                key={team.team_key}
                onClick={() => setActiveTeam(isActive ? null : team.team_key)}
                className={`flex-shrink-0 snap-start flex items-center gap-2 rounded-2xl px-3 py-2 border transition-all duration-200
                  ${isActive
                    ? 'border-[#00D4FF]/40 bg-[#00D4FF]/5 dark:bg-[#00D4FF]/8'
                    : 'border-gray-200 dark:border-[#222222] bg-white dark:bg-[#111111] active:scale-[0.97]'
                  }
                  ${dimmed ? 'opacity-50' : ''}`}
                style={{ minWidth: '156px' }}
              >
                <VibeRing score={team.vibe_score} color={team.vibe_color} logoUrl={logoUrl} size={38} isLive={isLive} />
                <div className="text-left min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[13px] font-medium text-[#0B0F14] dark:text-[#FAFAFB] truncate">{tn(team.team_key)}</span>
                    {urgency && (
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-px rounded-full flex-shrink-0 ${urgency.pulse ? 'animate-pulse' : ''}`}
                        style={{ backgroundColor: `${urgency.color}18`, color: urgency.color }}
                      >
                        {urgency.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-px">
                    <span className="text-[12px] tabular-nums text-gray-500 dark:text-[#888888]">{team.record}</span>
                    <StreakDots type={team.streak_type} count={team.streak_count} />
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

      {/* ===== FEATURED INSIGHT ===== */}
      {featuredInsight && (
        <div className="rounded-2xl border border-gray-200/60 dark:border-[#1a1a1a] bg-white dark:bg-[#111111] px-3.5 py-3">
          <div className="flex items-start gap-2.5">
            <div className="w-[3px] self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: featuredInsight.accentColor }} />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: featuredInsight.accentColor }}>
                {featuredInsight.label}
              </span>
              <p className="mt-0.5 text-[14px] font-medium text-[#0B0F14] dark:text-[#FAFAFB] leading-snug">{featuredInsight.text}</p>
              {featuredInsight.subtext && (
                <p className="mt-1 text-[12px] text-gray-500 dark:text-[#888888] leading-snug">{featuredInsight.subtext}</p>
              )}
              {featuredInsight.cta && (
                <a href={featuredInsight.cta.href} className="mt-1.5 inline-flex text-[12px] font-medium" style={{ color: featuredInsight.accentColor }}>
                  {featuredInsight.cta.label} &rsaquo;
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== SINCE YOU LEFT ===== */}
      {whatChanged.items.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-300 dark:text-[#333333]">Since You Left</span>
            <span className="text-[12px] font-medium" style={{ color: whatChanged.sentimentColor }}>{whatChanged.sentimentLabel}</span>
          </div>
          <p className="text-[13px] font-medium text-[#0B0F14] dark:text-[#FAFAFB] leading-snug">{whatChanged.summary}</p>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
            {whatChanged.items.map((c, i) => (
              <div key={i} className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-gray-50 dark:bg-[#0f0f0f] border border-gray-100 dark:border-[#1a1a1a] px-2.5 py-1.5">
                <img src={TEAM_LOGOS[c.team] || ''} alt="" className="w-4 h-4 object-contain" />
                <span className="text-[12px] font-bold tabular-nums" style={{ color: c.color }}>{c.prefix}</span>
                <span className="text-[12px] text-[#0B0F14] dark:text-[#FAFAFB] whitespace-nowrap">{c.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== PANIC METER (lightweight interaction) ===== */}
      <div className="rounded-2xl border border-gray-200/60 dark:border-[#1a1a1a] bg-white dark:bg-[#111111] px-3.5 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-300 dark:text-[#333333]">Panic Meter</span>
          <span className="text-[12px] text-gray-400 dark:text-[#555555]">How worried are you?</span>
        </div>
        <div className="flex gap-1.5">
          {(['Fine', 'Uneasy', 'Nervous', 'Panicking', 'Meltdown'] as const).map((label, i) => {
            const colors = ['#16a34a', '#84cc16', '#D6B05E', '#f97316', '#BC0000']
            const voted = panicVote === i
            return (
              <button
                key={label}
                onClick={() => setPanicVote(i)}
                disabled={panicVote !== null}
                className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                  panicVote === null
                    ? 'border border-gray-200 dark:border-[#222222] text-gray-600 dark:text-[#888888] active:scale-[0.95]'
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
        {panicVote !== null && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5 text-[12px] text-gray-500 dark:text-[#777777] text-center">
            {panicVote <= 1 ? 'Brave. Scout agrees... for now.' : panicVote <= 2 ? 'Fair. Most of the city feels the same.' : 'Yeah. You and everyone else.'}
          </motion.p>
        )}
      </div>

      {/* ===== SURPRISE ELEMENT ===== */}
      {surprise && (
        <div className="px-1 py-0.5">
          <p className="text-[12px] italic leading-snug" style={{ color: surprise.color }}>
            &ldquo;{surprise.text}&rdquo;
          </p>
        </div>
      )}

      {/* ===== CTA ROW ===== */}
      <div className="flex gap-1.5">
        <a href="/dash" className="flex-1 flex items-center justify-center rounded-xl py-2.5 text-[12px] font-medium border border-gray-200 dark:border-[#222222] text-[#0B0F14] dark:text-[#FAFAFB] bg-white dark:bg-[#111111] active:scale-[0.97] transition-transform">
          See Full Picture
        </a>
        <a href="/ask-ai" className="flex-1 flex items-center justify-center rounded-xl py-2.5 text-[12px] font-medium text-white active:scale-[0.97] transition-transform" style={{ backgroundColor: '#00D4FF' }}>
          What Should I Know?
        </a>
        {data.pulse_row.todays_debate ? (
          <a href="#debate" className="flex-1 flex items-center justify-center rounded-xl py-2.5 text-[12px] font-medium text-white active:scale-[0.97] transition-transform" style={{ backgroundColor: '#BC0000' }}>
            Cast Your Vote
          </a>
        ) : (
          <a href="/gm" className="flex-1 flex items-center justify-center rounded-xl py-2.5 text-[12px] font-medium text-white active:scale-[0.97] transition-transform" style={{ backgroundColor: '#D6B05E' }}>
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
  team, injuries, headlines, onClose,
}: {
  team: TeamCard; injuries: Injury[]; headlines: { title: string; url: string }[]; onClose: () => void
}) {
  const starters = injuries.filter(i => i.starter).slice(0, 3)
  const logoUrl = TEAM_LOGOS[team.team_key] || ''
  const short = team.team_name.split(' ').pop() || team.team_key

  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="overflow-hidden">
      <div className="rounded-2xl border border-gray-200/60 dark:border-[#1a1a1a] bg-white dark:bg-[#111111] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="" className="w-6 h-6 object-contain" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-[#0B0F14] dark:text-[#FAFAFB]">{team.team_name}</span>
                <span className="text-[12px] font-medium" style={{ color: team.vibe_color }}>{team.vibe_label}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-gray-500 dark:text-[#888888]">
                <span className="tabular-nums">{team.record}</span>
                <StreakDots type={team.streak_type} count={team.streak_count} />
                {team.streak_count > 1 && (
                  <span className="font-medium" style={{ color: team.streak_type === 'W' ? '#16a34a' : '#BC0000' }}>{team.streak_type}{team.streak_count}</span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex gap-2">
          {team.last_game && (
            <div className="flex-1 rounded-lg bg-gray-50 dark:bg-[#0B0F14] px-2.5 py-2">
              <span className="text-[10px] text-gray-400 dark:text-[#555555] uppercase tracking-wide">Last</span>
              <div className="mt-px text-[13px]">
                <span className="font-bold" style={{ color: team.last_game.result === 'W' ? '#16a34a' : '#BC0000' }}>{team.last_game.result}</span>
                <span className="text-[#0B0F14] dark:text-[#FAFAFB]"> {team.last_game.score}</span>
                <span className="text-gray-500 dark:text-[#888888]"> {team.last_game.opponent}</span>
              </div>
            </div>
          )}
          {team.next_game && (
            <div className="flex-1 rounded-lg bg-gray-50 dark:bg-[#0B0F14] px-2.5 py-2">
              <span className="text-[10px] text-gray-400 dark:text-[#555555] uppercase tracking-wide">
                {team.next_game.type === 'spring_training' ? 'ST' : 'Next'}
              </span>
              <div className="mt-px text-[13px] text-[#0B0F14] dark:text-[#FAFAFB]">
                {team.next_game.home ? 'vs' : '@'} {team.next_game.opponent}
                {team.next_game.time && <span className="font-medium" style={{ color: '#D6B05E' }}> {team.next_game.time}</span>}
              </div>
            </div>
          )}
        </div>

        {headlines.length > 0 && (
          <div className="space-y-1">
            {headlines.map((h, i) => (
              <a key={i} href={h.url} className="flex items-start gap-1.5 text-[13px] text-[#0B0F14] dark:text-[#FAFAFB] hover:underline" onClick={e => e.stopPropagation()}>
                <span className="text-gray-300 dark:text-[#333333]">&rsaquo;</span>
                <span className="line-clamp-1">{h.title}</span>
              </a>
            ))}
          </div>
        )}

        {starters.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {starters.map((inj, i) => (
              <span key={i} className="text-[11px] rounded px-1.5 py-0.5" style={{ backgroundColor: '#BC000010', color: '#BC0000' }}>
                <span className="font-bold">{inj.status}</span> {inj.player}
              </span>
            ))}
          </div>
        )}

        <a href={`/chicago-${team.team_key === 'whitesox' ? 'white-sox' : team.team_key}`} className="flex items-center justify-center text-[12px] font-medium py-2 rounded-xl text-white active:scale-[0.97] transition-transform" style={{ backgroundColor: '#00D4FF' }}>
          Go to {short} Hub
        </a>
      </div>
    </motion.div>
  )
}

// ============================================================
// HEADLINE — game-state reactive in live mode
// ============================================================

function getHeadline(hero: HomepageData['hero'], pulse: HomepageData['hero']['city_pulse'], teams: TeamCard[]): string {
  if (hero.mode === 'live' && hero.live_games.length > 0) {
    const g = hero.live_games[0]
    const name = tn(g.team_id)
    const isHome = !!TEAM_LOGOS[g.team_id]
    const us = isHome ? g.home_score : g.away_score
    const them = isHome ? g.away_score : g.home_score
    const diff = us - them

    // Period-aware intensity
    const late = g.period && (g.period.includes('4') || g.period.includes('3rd') || g.period.includes('9') || g.period.toLowerCase().includes('ot'))

    if (diff >= 14) return `${name} are destroying them.`
    if (diff >= 7 && late) return `${name} are about to close this out.`
    if (diff > 0 && late) return `${name} clinging to a lead. Don't breathe.`
    if (diff > 0) return `${name} up ${us}-${them}. Keep it going.`
    if (diff === 0 && late) return `Tied up late. This is why you watch.`
    if (diff === 0) return `${name} locked in a tie. Everything on the line.`
    if (diff > -7 && late) return `${name} running out of time. Down ${them}-${us}.`
    if (diff > -7) return `${name} down but not out. ${them}-${us}.`
    if (diff <= -14) return `${name} are getting destroyed. Turn it off.`
    return `${name} are getting buried. ${them}-${us}.`
  }

  if (hero.mode === 'breaking' && hero.breaking) return hero.breaking.headline

  const pct = pulse.win_pct
  const hot = tn(pulse.hottest), cold = tn(pulse.coldest)
  const hotT = teams.find(t => t.team_key === pulse.hottest)
  const coldT = teams.find(t => t.team_key === pulse.coldest)

  if (pct >= 0.65) return `Chicago is dominating. ${hot} leading the charge.`
  if (pct >= 0.55) return `The ${hot} are carrying this city.`
  if (pct >= 0.5) return `Above .500, but the ${cold} aren't helping.`
  if (pct >= 0.45) {
    if (hotT && hotT.streak_count >= 3 && hotT.streak_type === 'W') return `${hot} are on a run. Everyone else? Nah.`
    return `This city needs the ${hot}. Nobody else is stepping up.`
  }
  if (pct >= 0.38) {
    if (coldT && coldT.vibe_score < 25) return `The ${cold} are a disaster. Call the front office.`
    return `Chicago sports are in a dark place. ${cold} making it worse.`
  }
  return `This is as bad as it gets. ${cold} are unwatchable.`
}

// ============================================================
// SUBLINE
// ============================================================

function getSubline(hero: HomepageData['hero'], pulse: HomepageData['hero']['city_pulse'], teams: TeamCard[]): string {
  if (hero.mode === 'live' && hero.live_games.length > 0) {
    const g = hero.live_games[0]
    const extra = hero.live_games.length > 1 ? ` +${hero.live_games.length - 1}` : ''
    return `${g.away_team} @ ${g.home_team}${g.period ? ` · ${g.period}` : ''}${g.clock ? ` ${g.clock}` : ''}${extra}`
  }
  if (hero.mode === 'breaking' && hero.breaking) return hero.breaking.hook

  const hot = teams.find(t => t.team_key === pulse.hottest)
  const cold = teams.find(t => t.team_key === pulse.coldest)
  const parts: string[] = []
  if (hot) parts.push(`${tn(hot.team_key)} ${hot.record}`)
  if (cold && cold.team_key !== hot?.team_key) parts.push(`${tn(cold.team_key)} ${cold.record}`)
  return parts.join(' · ')
}

// ============================================================
// WHAT'S NEXT — most important event in next 24h
// ============================================================

function getWhatsNext(teams: TeamCard[], hero: HomepageData['hero']): string | null {
  if (hero.mode === 'live') return null // live mode already dominates

  const todayGames: { name: string; time: string | null; opp: string; home: boolean }[] = []
  for (const t of teams) {
    if (t.next_game && isGameToday(t.next_game.date)) {
      todayGames.push({ name: tn(t.team_key), time: t.next_game.time, opp: t.next_game.opponent, home: t.next_game.home })
    }
  }

  if (todayGames.length === 0) return null
  if (todayGames.length === 1) {
    const g = todayGames[0]
    return `Next up: ${g.name} ${g.home ? 'vs' : '@'} ${g.opp}${g.time ? ` at ${g.time}` : ' today'}. We go live.`
  }
  const names = todayGames.map(g => g.name)
  return `${names.join(' & ')} both play today. Come back for live.`
}

// ============================================================
// PULSE NARRATIVE
// ============================================================

function getPulseNarrative(pulse: HomepageData['hero']['city_pulse'], teams: TeamCard[]): string {
  const pct = pulse.win_pct
  const hot = tn(pulse.hottest), cold = tn(pulse.coldest)
  const above = teams.filter(t => t.win_pct >= 0.5).length
  const below = teams.filter(t => t.win_pct < 0.5 && t.wins + t.losses > 0).length

  if (pct >= 0.6) return `${above} of ${pulse.teams_active} above .500. This doesn't happen often.`
  if (pct >= 0.5) return `${hot} keeping the city above water. ${cold} pulling it down.`
  if (pct >= 0.4) return `Only ${above} team${above !== 1 ? 's' : ''} above .500. ${cold} are the biggest problem.`
  return `${below} teams below .500. No way to sugarcoat it.`
}

// ============================================================
// FEATURED INSIGHT
// ============================================================

interface InsightData { label: string; text: string; subtext?: string; accentColor: string; cta?: { label: string; href: string } }

function getFeaturedInsight(hero: HomepageData['hero'], pr: HomepageData['pulse_row'], sp: HomepageData['spotlight']): InsightData | null {
  if (hero.mode === 'breaking' && hero.breaking) {
    return { label: 'Breaking', text: hero.breaking.hook, subtext: `The city is feeling ${hero.breaking.emotion}.`, accentColor: '#BC0000', cta: { label: 'Get Scout\'s reaction', href: `/ask-ai?q=${encodeURIComponent(hero.breaking.headline)}` } }
  }
  if (pr.scout_says) {
    return { label: 'Scout\'s Take', text: pr.scout_says.headline, subtext: pr.scout_says.hook, accentColor: '#00D4FF', cta: { label: 'Ask Scout to explain', href: `/ask-ai?q=${encodeURIComponent(pr.scout_says.headline)}` } }
  }
  if (sp.trending_take) {
    return { label: 'Hot Take', text: sp.trending_take.headline, subtext: sp.trending_take.hook, accentColor: '#BC0000', cta: { label: 'Argue with Scout', href: `/ask-ai?q=${encodeURIComponent(sp.trending_take.headline)}` } }
  }
  return null
}

// ============================================================
// SINCE YOU LEFT — emotional framing
// ============================================================

interface WhatChangedData {
  summary: string
  sentimentLabel: string
  sentimentColor: string
  items: { team: string; prefix: string; text: string; color: string }[]
}

function getWhatChanged(teams: TeamCard[]): WhatChangedData {
  const items: WhatChangedData['items'] = []
  const winners: string[] = []
  const losers: string[] = []

  for (const t of teams) {
    if (!t.last_game) continue
    const name = tn(t.team_key)
    if (t.last_game.result === 'W') {
      winners.push(name)
      items.push({ team: t.team_key, prefix: 'W', text: `${t.last_game.score} ${t.last_game.opponent}`, color: '#16a34a' })
    } else {
      losers.push(name)
      items.push({ team: t.team_key, prefix: 'L', text: `${t.last_game.score} ${t.last_game.opponent}`, color: '#BC0000' })
    }
    if (t.streak_count >= 4) {
      items.push({ team: t.team_key, prefix: t.streak_type === 'W' ? '\u{1F525}' : '\u{1F4A9}', text: `${t.streak_count} straight`, color: t.streak_type === 'W' ? '#16a34a' : '#BC0000' })
    }
  }

  // Sentiment
  let sentimentLabel: string
  let sentimentColor: string
  if (losers.length === 0 && winners.length > 0) { sentimentLabel = 'Good day'; sentimentColor = '#16a34a' }
  else if (winners.length === 0 && losers.length > 0) { sentimentLabel = 'Bad day'; sentimentColor = '#BC0000' }
  else if (winners.length > 0 && losers.length > 0) { sentimentLabel = 'Mixed bag'; sentimentColor = '#D6B05E' }
  else { sentimentLabel = 'Off day'; sentimentColor = '#888888' }

  // Summary
  let summary: string
  if (winners.length > 0 && losers.length > 0) {
    summary = `${winners.join(', ')} won. ${losers.join(', ')} lost.`
  } else if (winners.length > 0) {
    summary = `${winners.join(' and ')} got it done. Clean day for the city.`
  } else if (losers.length > 0) {
    summary = `${losers.join(' and ')} lost. Nobody showed up.`
  } else {
    summary = 'No results yet. Games coming.'
  }

  return { summary, sentimentLabel, sentimentColor, items: items.slice(0, 6) }
}
