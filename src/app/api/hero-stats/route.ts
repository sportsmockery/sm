// src/app/api/hero-stats/route.ts
// Hero orb stats — ALL data from the SAME team-config functions as team pages.
// Season-aware: uses season-status.ts to detect phase per sport dynamically.
// Zero hardcoded stats — everything fetched live.

import { NextResponse } from 'next/server'
import { fetchTeamRecord, fetchLastGame } from '@/lib/team-config'
import { getSeasonPhase, isInSeason } from '@/lib/season-status'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 min cache

interface HeroStat {
  label: string
  value: string
  team?: string
  size: 'large' | 'medium' | 'small'
  phase?: string
}

const TEAM_CONFIG: { key: string; label: string; sport: string }[] = [
  { key: 'bears', label: 'Bears', sport: 'nfl' },
  { key: 'bulls', label: 'Bulls', sport: 'nba' },
  { key: 'blackhawks', label: 'Hawks', sport: 'nhl' },
  { key: 'cubs', label: 'Cubs', sport: 'mlb' },
  { key: 'whitesox', label: 'White Sox', sport: 'mlb' },
]

function formatRecord(r: { wins: number; losses: number; otLosses?: number; ties?: number }): string {
  let s = `${r.wins}-${r.losses}`
  if (r.otLosses) s += `-${r.otLosses}`
  if (r.ties) s += `-${r.ties}`
  return s
}

function phaseLabel(phase: string): string {
  switch (phase) {
    case 'regular': return ''
    case 'postseason': return 'Playoffs'
    case 'preseason': return 'Preseason'
    case 'offseason': return 'Offseason'
    default: return ''
  }
}

export async function GET() {
  try {
    const stats: HeroStat[] = []

    // Fetch all 5 records + last games in parallel — same functions as team pages
    const [records, lastGames] = await Promise.all([
      Promise.all(TEAM_CONFIG.map(t => fetchTeamRecord(t.key))),
      Promise.all(TEAM_CONFIG.map(t => fetchLastGame(t.key))),
    ])

    // Determine season phase per sport dynamically
    const teamPhases = TEAM_CONFIG.map(t => ({
      ...t,
      phase: getSeasonPhase(t.sport),
      inSeason: isInSeason(t.sport),
    }))

    // Separate in-season from offseason/preseason teams
    const inSeasonTeams = teamPhases.filter(t => t.inSeason)
    const otherTeams = teamPhases.filter(t => !t.inSeason)

    // --- LARGE ORBS: In-season team records ---
    for (const team of inSeasonTeams) {
      const idx = TEAM_CONFIG.findIndex(t => t.key === team.key)
      const rec = records[idx]
      if (rec) {
        stats.push({
          label: `${team.label} Record`,
          value: formatRecord(rec),
          team: team.key,
          size: 'large',
          phase: team.phase,
        })
      }
    }

    // --- LARGE/MEDIUM ORBS: In-season last games ---
    for (const team of inSeasonTeams) {
      const idx = TEAM_CONFIG.findIndex(t => t.key === team.key)
      const game = lastGames[idx]
      if (game) {
        const oppAbbrev = game.opponent.length > 3
          ? game.opponent.slice(0, 3).toUpperCase()
          : game.opponent.toUpperCase()
        stats.push({
          label: `${team.label} ${game.result} vs ${oppAbbrev}`,
          value: `${game.teamScore}-${game.opponentScore}`,
          team: team.key,
          size: stats.length < 3 ? 'large' : 'medium',
          phase: team.phase,
        })
      }
    }

    // --- MEDIUM ORBS: Offseason/preseason team records ---
    for (const team of otherTeams) {
      const idx = TEAM_CONFIG.findIndex(t => t.key === team.key)
      const rec = records[idx]
      if (rec) {
        const pLabel = phaseLabel(team.phase)
        stats.push({
          label: pLabel ? `${team.label} ${pLabel}` : `${team.label} Record`,
          value: formatRecord(rec),
          team: team.key,
          size: 'medium',
          phase: team.phase,
        })
      }
    }

    // --- MEDIUM ORBS: Offseason/preseason last games (if available) ---
    for (const team of otherTeams) {
      const idx = TEAM_CONFIG.findIndex(t => t.key === team.key)
      const game = lastGames[idx]
      if (game) {
        const oppAbbrev = game.opponent.length > 3
          ? game.opponent.slice(0, 3).toUpperCase()
          : game.opponent.toUpperCase()
        stats.push({
          label: `${team.label} Last Game`,
          value: `${game.result} ${game.teamScore}-${game.opponentScore}`,
          team: team.key,
          size: 'small',
          phase: team.phase,
        })
      }
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('[hero-stats] Error:', error)
    // Error fallback — still no hardcoded stats, just empty
    return NextResponse.json({ stats: [] })
  }
}
