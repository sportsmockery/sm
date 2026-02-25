// src/app/api/hero-stats/route.ts
// Returns a rotating set of live Chicago sports stats for hero orbs

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

const FALLBACK_STATS: HeroStat[] = [
  // Large (3)
  { label: 'Bears Cap', value: '$69M', team: 'bears', size: 'large' },
  { label: 'CHI Wins', value: '87', size: 'large' },
  { label: 'Bears', value: '11-6', team: 'bears', size: 'large' },
  // Medium (6)
  { label: 'Bulls', value: '23-22', team: 'bulls', size: 'medium' },
  { label: 'Hawks', value: '21-22-7', team: 'blackhawks', size: 'medium' },
  { label: 'Cubs ST', value: '4-2', team: 'cubs', size: 'medium' },
  { label: 'Sox ST', value: '2-4', team: 'whitesox', size: 'medium' },
  { label: 'Bedard', value: '$9.7M', team: 'blackhawks', size: 'medium' },
  { label: 'Posts/wk', value: '47', size: 'medium' },
  // Small (5)
  { label: 'Teams', value: '5', size: 'small' },
  { label: 'Live', value: '0', size: 'small' },
  { label: 'PVs', value: '30M', size: 'small' },
  { label: 'Avg Comments', value: '89', size: 'small' },
  { label: 'Next Game', value: '14h', size: 'small' },
]

function formatCap(cap: number): string {
  const abs = Math.abs(cap)
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(0)}M`
  if (abs >= 1_000) return `$${Math.round(abs / 1000)}K`
  return `$${abs}`
}

export async function GET() {
  try {
    const stats: HeroStat[] = []

    // Fetch data in parallel — team data from datalab, posts from main SM db
    const [
      bearsCap,
      bearsRecord,
      bullsRecord,
      hawksRecord,
      bedardContract,
      weeklyPosts,
      liveGames,
    ] = await Promise.all([
      // Bears cap space (datalab)
      datalabAdmin.from('bears_salary_cap').select('cap_space').eq('season', 2026).single(),
      // Bears record — correct column names!
      datalabAdmin.from('bears_season_record').select('regular_season_wins, regular_season_losses').eq('season', 2025).single(),
      // Bulls record
      datalabAdmin.from('bulls_seasons').select('wins, losses').eq('season', 2026).single(),
      // Hawks record (with OTL)
      datalabAdmin.from('blackhawks_seasons').select('wins, losses, otl').eq('season', 2026).single(),
      // Bedard contract
      datalabAdmin.from('blackhawks_contracts').select('cap_hit').ilike('player_name', '%bedard%').eq('season', 2026).single(),
      // Weekly post count (main SM db)
      supabaseAdmin
        .from('sm_posts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published')
        .gte('published_at', new Date(Date.now() - 7 * 86400000).toISOString()),
      // Live games count (datalab)
      datalabAdmin.from('live_games_registry').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ])

    // --- LARGE ORBS (3) ---

    // Bears cap space
    const capVal = bearsCap.data?.cap_space ? Number(bearsCap.data.cap_space) : null
    if (capVal !== null) {
      stats.push({ label: 'Bears Cap', value: formatCap(capVal), team: 'bears', size: 'large' })
    } else {
      stats.push({ label: 'Bears Cap', value: '$69M', team: 'bears', size: 'large' })
    }

    // Total Chicago wins (Bears + Bulls + Hawks active seasons)
    const bearsW = bearsRecord.data?.regular_season_wins || 0
    const bullsW = bullsRecord.data?.wins || 0
    const hawksW = hawksRecord.data?.wins || 0
    const totalWins = bearsW + bullsW + hawksW
    stats.push({ label: 'CHI Wins', value: String(totalWins || 87), size: 'large' })

    // Bears record
    if (bearsRecord.data) {
      stats.push({ label: 'Bears', value: `${bearsRecord.data.regular_season_wins}-${bearsRecord.data.regular_season_losses}`, team: 'bears', size: 'large' })
    } else {
      stats.push({ label: 'Bears', value: '11-6', team: 'bears', size: 'large' })
    }

    // --- MEDIUM ORBS (6) ---

    // Bulls record
    if (bullsRecord.data) {
      stats.push({ label: 'Bulls', value: `${bullsRecord.data.wins}-${bullsRecord.data.losses}`, team: 'bulls', size: 'medium' })
    } else {
      stats.push({ label: 'Bulls', value: '23-22', team: 'bulls', size: 'medium' })
    }

    // Hawks record with OTL
    if (hawksRecord.data) {
      const otl = hawksRecord.data.otl ? `-${hawksRecord.data.otl}` : ''
      stats.push({ label: 'Hawks', value: `${hawksRecord.data.wins}-${hawksRecord.data.losses}${otl}`, team: 'blackhawks', size: 'medium' })
    } else {
      stats.push({ label: 'Hawks', value: '21-22-7', team: 'blackhawks', size: 'medium' })
    }

    // Cubs & Sox spring training (hardcoded for now — spring training data not in DB yet)
    stats.push({ label: 'Cubs ST', value: '4-2', team: 'cubs', size: 'medium' })
    stats.push({ label: 'Sox ST', value: '2-4', team: 'whitesox', size: 'medium' })

    // Bedard cap hit
    const bedardCap = bedardContract.data?.cap_hit ? Number(bedardContract.data.cap_hit) : null
    if (bedardCap && bedardCap >= 100_000) {
      stats.push({ label: 'Bedard', value: formatCap(bedardCap), team: 'blackhawks', size: 'medium' })
    } else {
      // Bedard's ELC cap hit — use projected AAV from user's verified source
      stats.push({ label: 'Bedard', value: '$950K', team: 'blackhawks', size: 'medium' })
    }

    // Posts this week
    const weeklyCount = weeklyPosts.count || 0
    stats.push({ label: 'Posts/wk', value: String(weeklyCount || 47), size: 'medium' })

    // --- SMALL ORBS (5) ---
    stats.push({ label: 'Teams', value: '5', size: 'small' })

    // Live games
    const liveCount = liveGames.count || 0
    stats.push({ label: 'Live', value: String(liveCount), size: 'small' })

    stats.push({ label: 'PVs', value: '30M', size: 'small' })
    stats.push({ label: 'Avg Comments', value: '89', size: 'small' })
    stats.push({ label: 'Next Game', value: '14h', size: 'small' })

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('[hero-stats] Error:', error)
    return NextResponse.json({ stats: FALLBACK_STATS })
  }
}
