/**
 * Bot Status API Route
 *
 * GET /api/bot/status
 * Returns current bot status for all teams or a specific team
 */

import { NextRequest, NextResponse } from 'next/server'
import { getBotStatus } from '@/lib/bot/bot-service'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { TeamSlug, StatusResponse } from '@/lib/bot/types'
import { TEAM_SLUGS } from '@/lib/bot/types'

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const supabase = supabaseAdmin
    const { searchParams } = new URL(request.url)
    const team_slug = searchParams.get('team') as TeamSlug | null

    // Validate team_slug if provided
    if (team_slug && !TEAM_SLUGS.includes(team_slug)) {
      return NextResponse.json(
        { error: `Invalid team. Must be one of: ${TEAM_SLUGS.join(', ')}` },
        { status: 400 }
      )
    }

    const statuses = await getBotStatus(team_slug || undefined)

    // Get recent logs summary
    const { data: recentLogs } = await supabase
      .from('sm_bot_logs')
      .select('id, team_slug, log_level, action, message, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    // Get pending response counts by team
    const { data: pendingByTeam } = await supabase
      .from('sm_bot_responses')
      .select('team_slug')
      .eq('status', 'pending')

    const pendingCounts: Record<string, number> = {}
    for (const response of pendingByTeam || []) {
      pendingCounts[response.team_slug] = (pendingCounts[response.team_slug] || 0) + 1
    }

    const response: StatusResponse & {
      recent_logs: typeof recentLogs
      pending_by_team: typeof pendingCounts
    } = {
      success: true,
      statuses,
      recent_logs: recentLogs,
      pending_by_team: pendingCounts,
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Bot status error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Status check failed',
      },
      { status: 500 }
    )
  }
}
