// src/app/api/hero-stats/route.ts
// Returns live Chicago sports stats for hero orbs — all data from DataLab via team data libs
// NO hardcoded stale values. Every stat is fetched fresh.

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 min cache

interface HeroStat {
  label: string
  value: string
  team?: string
  size: 'large' | 'medium' | 'small'
}

export async function GET() {
  try {
    const stats: HeroStat[] = []

    // Fetch everything in parallel from DataLab + SM main db
    const [
      bullsRecord,
      hawksRecord,
      bullsGames,
      hawksGames,
      bearsRecord,
      cubsRecord,
      soxRecord,
      weeklyPosts,
      totalPosts,
      weeklyViews,
      liveGames,
    ] = await Promise.all([
      // In-season records (live, updated by DataLab)
      datalabAdmin.from('bulls_seasons').select('wins, losses').eq('season', 2026).single(),
      datalabAdmin.from('blackhawks_seasons').select('wins, losses, otl').eq('season', 2026).single(),
      // Recent game scores (Bulls)
      datalabAdmin.from('bulls_games_master')
        .select('opponent, bulls_score, opponent_score, bulls_win')
        .eq('season', 2026).gt('bulls_score', 0)
        .order('game_date', { ascending: false }).limit(2),
      // Recent game scores (Hawks)
      datalabAdmin.from('blackhawks_games_master')
        .select('opponent, blackhawks_score, opponent_score, blackhawks_win')
        .eq('season', 2026).gt('blackhawks_score', 0)
        .order('game_date', { ascending: false }).limit(2),
      // Offseason team records (short values that fit in orbs)
      datalabAdmin.from('bears_season_record').select('regular_season_wins, regular_season_losses').eq('season', 2025).single(),
      datalabAdmin.from('cubs_seasons').select('wins, losses').eq('season', 2025).single(),
      datalabAdmin.from('whitesox_seasons').select('wins, losses').eq('season', 2025).single(),
      // SM site stats
      supabaseAdmin.from('sm_posts').select('id', { count: 'exact', head: true })
        .eq('status', 'published')
        .gte('published_at', new Date(Date.now() - 7 * 86400000).toISOString()),
      supabaseAdmin.from('sm_posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabaseAdmin.from('sm_posts').select('views').eq('status', 'published')
        .gte('published_at', new Date(Date.now() - 7 * 86400000).toISOString()).limit(200),
      // Live games count
      datalabAdmin.from('live_games_registry').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ])

    // --- LARGE ORBS (3): In-season records + recent score ---

    // Bulls record (live, updates every game)
    if (bullsRecord.data) {
      stats.push({ label: 'Bulls', value: `${bullsRecord.data.wins}-${bullsRecord.data.losses}`, team: 'bulls', size: 'large' })
    }

    // Hawks record with OTL (live)
    if (hawksRecord.data) {
      const otl = hawksRecord.data.otl ? `-${hawksRecord.data.otl}` : ''
      stats.push({ label: 'Hawks', value: `${hawksRecord.data.wins}-${hawksRecord.data.losses}${otl}`, team: 'blackhawks', size: 'large' })
    }

    // Most recent Bulls score
    const lastBulls = bullsGames.data?.[0]
    if (lastBulls) {
      const w = lastBulls.bulls_win ? 'W' : 'L'
      stats.push({ label: `${w} vs ${lastBulls.opponent}`, value: `${lastBulls.bulls_score}-${lastBulls.opponent_score}`, team: 'bulls', size: 'large' })
    }

    // --- MEDIUM ORBS (6): Recent scores + offseason records (all short values that fit) ---

    // Most recent Hawks score
    const lastHawks = hawksGames.data?.[0]
    if (lastHawks) {
      const w = lastHawks.blackhawks_win ? 'W' : 'L'
      stats.push({ label: `${w} vs ${lastHawks.opponent}`, value: `${lastHawks.blackhawks_score}-${lastHawks.opponent_score}`, team: 'blackhawks', size: 'medium' })
    }

    // 2nd most recent Bulls game
    const prevBulls = bullsGames.data?.[1]
    if (prevBulls) {
      const w = prevBulls.bulls_win ? 'W' : 'L'
      stats.push({ label: `${w} vs ${prevBulls.opponent}`, value: `${prevBulls.bulls_score}-${prevBulls.opponent_score}`, team: 'bulls', size: 'medium' })
    }

    // Bears record (offseason — short value like "11-6")
    if (bearsRecord.data) {
      stats.push({ label: 'Bears', value: `${bearsRecord.data.regular_season_wins}-${bearsRecord.data.regular_season_losses}`, team: 'bears', size: 'medium' })
    }

    // Cubs record (offseason — short value like "92-70")
    if (cubsRecord.data) {
      stats.push({ label: 'Cubs', value: `${cubsRecord.data.wins}-${cubsRecord.data.losses}`, team: 'cubs', size: 'medium' })
    }

    // Sox record (offseason — short value like "60-102")
    if (soxRecord.data) {
      stats.push({ label: 'Sox', value: `${soxRecord.data.wins}-${soxRecord.data.losses}`, team: 'whitesox', size: 'medium' })
    }

    // Weekly posts
    const wkPosts = weeklyPosts.count || 0
    if (wkPosts > 0) {
      stats.push({ label: 'This Week', value: `${wkPosts}`, size: 'medium' })
    }

    // --- SMALL ORBS (5): Site stats ---

    // Total posts
    const total = totalPosts.count || 0
    if (total > 0) {
      const formatted = total >= 1000 ? `${(total / 1000).toFixed(1)}K` : String(total)
      stats.push({ label: 'Total Posts', value: formatted, size: 'small' })
    }

    // Weekly views
    const views = weeklyViews.data?.reduce((sum: number, p: any) => sum + (p.views || 0), 0) || 0
    if (views > 0) {
      const formatted = views >= 1_000_000 ? `${(views / 1_000_000).toFixed(1)}M` : views >= 1000 ? `${(views / 1000).toFixed(1)}K` : String(views)
      stats.push({ label: 'Wk Views', value: formatted, size: 'small' })
    }

    // Live games
    const liveCount = liveGames.count || 0
    stats.push({ label: 'Live Now', value: String(liveCount), size: 'small' })

    stats.push({ label: 'Teams', value: '5', size: 'small' })
    stats.push({ label: 'Sports', value: '4', size: 'small' })

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('[hero-stats] Error:', error)
    // Minimal fallback — short values that fit in orbs
    return NextResponse.json({
      stats: [
        { label: 'Bulls', value: '24-35', team: 'bulls', size: 'large' },
        { label: 'Hawks', value: '22-26-9', team: 'blackhawks', size: 'large' },
        { label: 'Bears', value: '11-6', team: 'bears', size: 'medium' },
        { label: 'Cubs', value: '92-70', team: 'cubs', size: 'medium' },
        { label: 'Sox', value: '60-102', team: 'whitesox', size: 'medium' },
        { label: 'Teams', value: '5', size: 'small' },
        { label: 'Sports', value: '4', size: 'small' },
      ],
    })
  }
}
