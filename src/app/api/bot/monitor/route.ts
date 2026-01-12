/**
 * Bot Monitor API Route
 *
 * POST /api/bot/monitor
 * Triggers monitoring for X communities and queues responses
 */

import { NextRequest, NextResponse } from 'next/server'
import { monitorForEngagement } from '@/lib/bot/bot-service'
import type { TeamSlug, MonitorRequest, MonitorResponse } from '@/lib/bot/types'
import { TEAM_SLUGS } from '@/lib/bot/types'

// Validate API key for cron/webhook access
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  const expectedKey = process.env.BOT_API_KEY

  // Allow if no key is configured (development) or key matches
  return !expectedKey || apiKey === expectedKey
}

export async function POST(request: NextRequest) {
  // Validate API key
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json().catch(() => ({})) as MonitorRequest

    // Validate team_slug if provided
    if (body.team_slug && !TEAM_SLUGS.includes(body.team_slug)) {
      return NextResponse.json(
        { error: `Invalid team_slug. Must be one of: ${TEAM_SLUGS.join(', ')}` },
        { status: 400 }
      )
    }

    // Run monitoring
    const results = await monitorForEngagement(body.team_slug)

    const response: MonitorResponse = {
      success: true,
      results,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Bot monitor error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Monitor failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/bot/monitor',
    method: 'POST',
    description: 'Trigger bot monitoring for X communities',
  })
}
