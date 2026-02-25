// src/app/api/hero-stats/route.ts
// Hero orb stats — uses the SAME team-config functions as team pages.
// One source of truth: if team pages are correct, hero orbs are correct.

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { fetchTeamRecord, fetchLastGame } from '@/lib/team-config'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 min cache

interface HeroStat {
  label: string
  value: string
  team?: string
  size: 'large' | 'medium' | 'small'
}

function formatRecord(r: { wins: number; losses: number; otLosses?: number; ties?: number }): string {
  let s = `${r.wins}-${r.losses}`
  if (r.otLosses) s += `-${r.otLosses}`
  if (r.ties) s += `-${r.ties}`
  return s
}

const TEAMS = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox'] as const

export async function GET() {
  try {
    const stats: HeroStat[] = []

    // Fetch all 5 records + last games in parallel — same functions as team pages
    const [records, lastGames, weeklyPosts, totalPosts, weeklyViews, liveGames] = await Promise.all([
      Promise.all(TEAMS.map(t => fetchTeamRecord(t))),
      Promise.all(TEAMS.map(t => fetchLastGame(t))),
      supabaseAdmin.from('sm_posts').select('id', { count: 'exact', head: true })
        .eq('status', 'published')
        .gte('published_at', new Date(Date.now() - 7 * 86400000).toISOString()),
      supabaseAdmin.from('sm_posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabaseAdmin.from('sm_posts').select('views').eq('status', 'published')
        .gte('published_at', new Date(Date.now() - 7 * 86400000).toISOString()).limit(200),
      supabaseAdmin.from('sm_posts').select('id', { count: 'exact', head: true })
        .eq('status', 'published'), // placeholder for live_games if needed
    ])

    const labels: Record<string, string> = {
      bears: 'Bears', bulls: 'Bulls', blackhawks: 'Hawks', cubs: 'Cubs', whitesox: 'Sox',
    }

    // --- LARGE ORBS: In-season team records (Bulls, Blackhawks) ---
    const inSeason = ['bulls', 'blackhawks'] as const
    for (const key of inSeason) {
      const idx = TEAMS.indexOf(key)
      const rec = records[idx]
      if (rec) {
        stats.push({ label: labels[key], value: formatRecord(rec), team: key, size: 'large' })
      }
    }

    // Last game for first in-season team as a large orb
    for (const key of inSeason) {
      const idx = TEAMS.indexOf(key)
      const game = lastGames[idx]
      if (game && stats.length < 3) {
        stats.push({
          label: `${game.result} vs ${game.opponent.slice(0, 3).toUpperCase()}`,
          value: `${game.teamScore}-${game.opponentScore}`,
          team: key,
          size: 'large',
        })
      }
    }

    // --- MEDIUM ORBS: Remaining last games + offseason records ---

    // Last games for remaining teams (skip ones already used as large)
    const usedLargeGameKeys = new Set<string>()
    for (const s of stats) {
      if (s.size === 'large' && (s.label.startsWith('W ') || s.label.startsWith('L '))) {
        usedLargeGameKeys.add(s.team || '')
      }
    }

    for (const key of inSeason) {
      const idx = TEAMS.indexOf(key)
      const game = lastGames[idx]
      if (game && !usedLargeGameKeys.has(key)) {
        stats.push({
          label: `${game.result} vs ${game.opponent.slice(0, 3).toUpperCase()}`,
          value: `${game.teamScore}-${game.opponentScore}`,
          team: key,
          size: 'medium',
        })
      }
    }

    // Offseason team records (Bears, Cubs, Sox)
    const offSeason = ['bears', 'cubs', 'whitesox'] as const
    for (const key of offSeason) {
      const idx = TEAMS.indexOf(key)
      const rec = records[idx]
      if (rec) {
        stats.push({ label: labels[key], value: formatRecord(rec), team: key, size: 'medium' })
      }
    }

    // Weekly posts count
    const wkPosts = weeklyPosts.count || 0
    if (wkPosts > 0) {
      stats.push({ label: 'This Week', value: `${wkPosts}`, size: 'medium' })
    }

    // --- SMALL ORBS: Site stats ---
    const total = totalPosts.count || 0
    if (total > 0) {
      const formatted = total >= 1000 ? `${(total / 1000).toFixed(1)}K` : String(total)
      stats.push({ label: 'Total Posts', value: formatted, size: 'small' })
    }

    const views = weeklyViews.data?.reduce((sum: number, p: any) => sum + (p.views || 0), 0) || 0
    if (views > 0) {
      const formatted = views >= 1_000_000 ? `${(views / 1_000_000).toFixed(1)}M` : views >= 1000 ? `${(views / 1000).toFixed(1)}K` : String(views)
      stats.push({ label: 'Wk Views', value: formatted, size: 'small' })
    }

    stats.push({ label: 'Teams', value: '5', size: 'small' })
    stats.push({ label: 'Sports', value: '4', size: 'small' })

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('[hero-stats] Error:', error)
    return NextResponse.json({
      stats: [
        { label: 'Teams', value: '5', size: 'small' },
        { label: 'Sports', value: '4', size: 'small' },
      ],
    })
  }
}
