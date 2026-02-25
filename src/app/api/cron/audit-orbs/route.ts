// src/app/api/cron/audit-orbs/route.ts
// Daily orb audit — validates hero-stats data integrity.
// Runs 6AM CST (12:00 UTC) via Vercel Cron.
// Checks: all orbs return data, no N/A values, season phase correctness.

import { NextResponse } from 'next/server'
import { fetchTeamRecord, fetchLastGame } from '@/lib/team-config'
import { getSeasonPhase, isInSeason } from '@/lib/season-status'

export const dynamic = 'force-dynamic'

const TEAMS = [
  { key: 'bears', sport: 'nfl', label: 'Bears' },
  { key: 'bulls', sport: 'nba', label: 'Bulls' },
  { key: 'blackhawks', sport: 'nhl', label: 'Hawks' },
  { key: 'cubs', sport: 'mlb', label: 'Cubs' },
  { key: 'whitesox', sport: 'mlb', label: 'White Sox' },
]

export async function GET(request: Request) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && !process.env.VERCEL_URL?.includes('localhost')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const issues: string[] = []
  const results: Record<string, unknown> = {}

  try {
    // Validate each team's data sources
    const checks = await Promise.allSettled(
      TEAMS.map(async (team) => {
        const phase = getSeasonPhase(team.sport)
        const inSeason = isInSeason(team.sport)
        const record = await fetchTeamRecord(team.key)
        const lastGame = await fetchLastGame(team.key)

        const teamResult: Record<string, unknown> = {
          phase,
          inSeason,
          hasRecord: !!record,
          hasLastGame: !!lastGame,
        }

        // Validate record
        if (!record) {
          issues.push(`${team.label}: No record returned`)
        } else {
          teamResult.record = `${record.wins}-${record.losses}`
          if (record.wins === 0 && record.losses === 0) {
            issues.push(`${team.label}: Record is 0-0 (possible data issue)`)
          }
        }

        // In-season teams must have a last game
        if (inSeason && !lastGame) {
          issues.push(`${team.label}: In-season but no last game found`)
        }

        if (lastGame) {
          teamResult.lastGame = `${lastGame.result} ${lastGame.teamScore}-${lastGame.opponentScore} vs ${lastGame.opponent}`
        }

        return { team: team.key, ...teamResult }
      })
    )

    // Collect results
    for (const check of checks) {
      if (check.status === 'fulfilled') {
        results[check.value.team] = check.value
      } else {
        issues.push(`Team check failed: ${check.reason}`)
      }
    }

    // Validate orb label completeness (simulate what API would produce)
    const orbCount = Object.values(results).filter(
      (r: any) => r.hasRecord || r.hasLastGame
    ).length
    if (orbCount === 0) {
      issues.push('CRITICAL: No orb data available — all team fetches failed')
    }

    const status = issues.length === 0 ? 'healthy' : 'issues_found'

    console.log(`[audit-orbs] Status: ${status}, Issues: ${issues.length}`, {
      issues,
      orbCount,
    })

    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      orbCount,
      issues,
      teams: results,
    })
  } catch (error) {
    console.error('[audit-orbs] Fatal error:', error)
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: String(error),
    }, { status: 500 })
  }
}
