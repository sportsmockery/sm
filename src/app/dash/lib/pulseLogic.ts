import type { HomepageData, TeamCard, FeedItem } from '../types'
import { TEAM_LOGOS } from '../types'

// ============================================================
// Constants
// ============================================================

export const TEAM_DISPLAY: Record<string, string> = {
  bears: 'Bears', bulls: 'Bulls', blackhawks: 'Blackhawks', cubs: 'Cubs', whitesox: 'White Sox',
}

export function tn(key: string): string {
  return TEAM_DISPLAY[key] || key.charAt(0).toUpperCase() + key.slice(1)
}

// ============================================================
// City Mood
// ============================================================

export interface CityMood {
  emoji: string
  label: string
  color: string
}

export function getCityMood(pulse: HomepageData['hero']['city_pulse'], teams: TeamCard[]): CityMood {
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
// Urgency signals
// ============================================================

export type UrgencySignal = { label: string; color: string; pulse?: boolean }

export function getTeamUrgency(team: TeamCard, hasLive: boolean, liveTeamIds: string[]): UrgencySignal | null {
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

export function isGameToday(dateStr: string): boolean {
  try {
    const ct = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }))
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return false
    return ct.getFullYear() === d.getFullYear() && ct.getMonth() === d.getMonth() && ct.getDate() === d.getDate()
  } catch { return false }
}

// ============================================================
// Headline
// ============================================================

export function getHeadline(hero: HomepageData['hero'], pulse: HomepageData['hero']['city_pulse'], teams: TeamCard[]): string {
  if (hero.mode === 'live' && hero.live_games.length > 0) {
    const g = hero.live_games[0]
    const name = tn(g.team_id)
    const isHome = !!TEAM_LOGOS[g.team_id]
    const us = isHome ? g.home_score : g.away_score
    const them = isHome ? g.away_score : g.home_score
    const diff = us - them
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
// Subline
// ============================================================

export function getSubline(hero: HomepageData['hero'], pulse: HomepageData['hero']['city_pulse'], teams: TeamCard[]): string {
  if (hero.mode === 'live' && hero.live_games.length > 0) {
    const g = hero.live_games[0]
    const extra = hero.live_games.length > 1 ? ` +${hero.live_games.length - 1}` : ''
    return `${g.away_team} @ ${g.home_team}${g.period ? ` \u00B7 ${g.period}` : ''}${g.clock ? ` ${g.clock}` : ''}${extra}`
  }
  if (hero.mode === 'breaking' && hero.breaking) return hero.breaking.hook
  const hot = teams.find(t => t.team_key === pulse.hottest)
  const cold = teams.find(t => t.team_key === pulse.coldest)
  const parts: string[] = []
  if (hot) parts.push(`${tn(hot.team_key)} ${hot.record}`)
  if (cold && cold.team_key !== hot?.team_key) parts.push(`${tn(cold.team_key)} ${cold.record}`)
  return parts.join(' \u00B7 ')
}

// ============================================================
// What's Next
// ============================================================

export function getWhatsNext(teams: TeamCard[], hero: HomepageData['hero']): string | null {
  if (hero.mode === 'live') return null
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
  return `${todayGames.map(g => g.name).join(' & ')} both play today. Come back for live.`
}

// ============================================================
// Pulse Narrative
// ============================================================

export function getPulseNarrative(pulse: HomepageData['hero']['city_pulse'], teams: TeamCard[]): string {
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
// Featured Insight
// ============================================================

export interface InsightData { label: string; text: string; subtext?: string; accentColor: string; cta?: { label: string; href: string } }

export function getFeaturedInsight(hero: HomepageData['hero'], pr: HomepageData['pulse_row'], sp: HomepageData['spotlight']): InsightData | null {
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
// Since You Left
// ============================================================

export interface WhatChangedData {
  summary: string
  sentimentLabel: string
  sentimentColor: string
  items: { team: string; prefix: string; text: string; color: string }[]
}

export function getWhatChanged(teams: TeamCard[]): WhatChangedData {
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
  let sentimentLabel: string, sentimentColor: string
  if (losers.length === 0 && winners.length > 0) { sentimentLabel = 'Good day'; sentimentColor = '#16a34a' }
  else if (winners.length === 0 && losers.length > 0) { sentimentLabel = 'Bad day'; sentimentColor = '#BC0000' }
  else if (winners.length > 0 && losers.length > 0) { sentimentLabel = 'Mixed bag'; sentimentColor = '#D6B05E' }
  else { sentimentLabel = 'Off day'; sentimentColor = '#888888' }
  let summary: string
  if (winners.length > 0 && losers.length > 0) { summary = `${winners.join(', ')} won. ${losers.join(', ')} lost.` }
  else if (winners.length > 0) { summary = `${winners.join(' and ')} got it done. Clean day for the city.` }
  else if (losers.length > 0) { summary = `${losers.join(' and ')} lost. Nobody showed up.` }
  else { summary = 'No results yet. Games coming.' }
  return { summary, sentimentLabel, sentimentColor, items: items.slice(0, 6) }
}

// ============================================================
// Surprise Element
// ============================================================

export function getSurpriseElement(
  teams: TeamCard[],
  pulse: HomepageData['hero']['city_pulse'],
  pulseRow: HomepageData['pulse_row'],
): { text: string; color: string } | null {
  const pool: { text: string; color: string }[] = []
  for (const t of teams) {
    if (t.streak_count >= 5 && t.streak_type === 'W') pool.push({ text: `${tn(t.team_key)} have won ${t.streak_count} straight. When does the parade start?`, color: '#00ff88' })
    if (t.streak_count >= 5 && t.streak_type === 'L') pool.push({ text: `${tn(t.team_key)} have lost ${t.streak_count} straight. Sell everything.`, color: '#BC0000' })
    if (t.vibe_score >= 90) pool.push({ text: `${tn(t.team_key)} vibe check: ${t.vibe_score}/100. Elite energy.`, color: '#00ff88' })
    if (t.vibe_score <= 15) pool.push({ text: `${tn(t.team_key)} vibe check: ${t.vibe_score}/100. Send help.`, color: '#BC0000' })
  }
  if (pulse.win_pct >= 0.6) pool.push({ text: `Chicago is winning at a .${Math.round(pulse.win_pct * 1000)} clip. This doesn't happen often.`, color: '#00ff88' })
  if (pulse.win_pct < 0.35) pool.push({ text: `Combined .${Math.round(pulse.win_pct * 1000)} win rate. Let that sink in.`, color: '#BC0000' })
  if (pool.length === 0) return null
  const idx = Math.floor(Date.now() / 60000) % pool.length
  return pool[idx]
}

// ============================================================
// Helpers
// ============================================================

export function formatCacheAge(ms: number): string {
  if (!ms || ms < 0) return '0s'
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s`
  return `${Math.floor(sec / 60)}m`
}
