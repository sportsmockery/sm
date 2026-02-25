// src/app/api/hero-stats/route.ts
// Returns a rotating set of live Chicago sports stats for hero orbs

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

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

    // Fetch data in parallel
    const [
      bearsCap,
      bearsRecord,
      bullsRecord,
      hawksRecord,
      cubsRecord,
      soxRecord,
      postViews,
      postCount,
    ] = await Promise.all([
      // Bears cap space
      supabaseAdmin.from('bears_salary_cap').select('cap_space').eq('season', 2026).single(),
      // Team records
      supabaseAdmin.from('bears_season_record').select('wins, losses').eq('season', 2025).single(),
      supabaseAdmin.from('bulls_seasons').select('wins, losses').eq('season', 2026).single(),
      supabaseAdmin.from('blackhawks_seasons').select('wins, losses, otl').eq('season', 2026).single(),
      supabaseAdmin.from('cubs_seasons').select('wins, losses').eq('season', 2025).single(),
      supabaseAdmin.from('whitesox_seasons').select('wins, losses').eq('season', 2025).single(),
      // Recent post views (last 7 days)
      supabaseAdmin
        .from('sm_posts')
        .select('views')
        .eq('status', 'published')
        .gte('published_at', new Date(Date.now() - 7 * 86400000).toISOString())
        .limit(100),
      // Total published posts
      supabaseAdmin.from('sm_posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    ])

    // --- LARGE ORBS (3) ---

    // Bears cap remaining
    if (bearsCap.data?.cap_space) {
      const cap = bearsCap.data.cap_space
      const formatted = cap >= 1_000_000 ? `$${(cap / 1_000_000).toFixed(1)}M` : `$${Math.round(cap / 1000)}K`
      stats.push({ label: 'Bears Cap', value: formatted, team: 'bears', size: 'large' })
    }

    // Total Chicago wins (all teams combined)
    const totalWins = (bearsRecord.data?.wins || 0) + (bullsRecord.data?.wins || 0) +
      (hawksRecord.data?.wins || 0) + (cubsRecord.data?.wins || 0) + (soxRecord.data?.wins || 0)
    stats.push({ label: 'CHI Wins', value: String(totalWins), size: 'large' })

    // Total weekly views
    const weeklyViews = postViews.data?.reduce((sum: number, p: any) => sum + (p.views || 0), 0) || 0
    const viewsFormatted = weeklyViews >= 1000 ? `${(weeklyViews / 1000).toFixed(1)}K` : String(weeklyViews)
    stats.push({ label: 'Weekly Views', value: viewsFormatted, size: 'large' })

    // --- MEDIUM ORBS (6) ---

    // Team records
    if (bearsRecord.data) {
      stats.push({ label: 'Bears', value: `${bearsRecord.data.wins}-${bearsRecord.data.losses}`, team: 'bears', size: 'medium' })
    }
    if (bullsRecord.data) {
      stats.push({ label: 'Bulls', value: `${bullsRecord.data.wins}-${bullsRecord.data.losses}`, team: 'bulls', size: 'medium' })
    }
    if (hawksRecord.data) {
      const otl = hawksRecord.data.otl ? `-${hawksRecord.data.otl}` : ''
      stats.push({ label: 'Hawks', value: `${hawksRecord.data.wins}-${hawksRecord.data.losses}${otl}`, team: 'blackhawks', size: 'medium' })
    }
    if (cubsRecord.data) {
      stats.push({ label: 'Cubs', value: `${cubsRecord.data.wins}-${cubsRecord.data.losses}`, team: 'cubs', size: 'medium' })
    }
    if (soxRecord.data) {
      stats.push({ label: 'Sox', value: `${soxRecord.data.wins}-${soxRecord.data.losses}`, team: 'whitesox', size: 'medium' })
    }

    // Articles this week
    stats.push({ label: 'Articles', value: String(postViews.data?.length || 0), size: 'medium' })

    // --- SMALL ORBS (5) ---
    stats.push({ label: 'Teams', value: '5', size: 'small' })
    stats.push({ label: 'Total Posts', value: postCount.count ? `${Math.round(postCount.count / 100) * 100}+` : '500+', size: 'small' })
    stats.push({ label: 'Sports', value: '4', size: 'small' })
    stats.push({ label: 'City', value: 'CHI', size: 'small' })
    stats.push({ label: 'Live', value: '24/7', size: 'small' })

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('[hero-stats] Error:', error)
    // Fallback static stats
    return NextResponse.json({
      stats: [
        { label: 'CHI Wins', value: '207', size: 'large' },
        { label: 'Weekly Views', value: '30K', size: 'large' },
        { label: 'Bears Cap', value: '$12M', team: 'bears', size: 'large' },
        { label: 'Bears', value: '11-6', team: 'bears', size: 'medium' },
        { label: 'Bulls', value: '23-22', team: 'bulls', size: 'medium' },
        { label: 'Hawks', value: '21-22-8', team: 'blackhawks', size: 'medium' },
        { label: 'Cubs', value: '92-70', team: 'cubs', size: 'medium' },
        { label: 'Sox', value: '60-102', team: 'whitesox', size: 'medium' },
        { label: 'Articles', value: '42', size: 'medium' },
        { label: 'Teams', value: '5', size: 'small' },
        { label: 'Posts', value: '500+', size: 'small' },
        { label: 'Sports', value: '4', size: 'small' },
        { label: 'City', value: 'CHI', size: 'small' },
        { label: 'Live', value: '24/7', size: 'small' },
      ],
    })
  }
}
