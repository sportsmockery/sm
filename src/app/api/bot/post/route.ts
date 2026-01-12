/**
 * Bot Post API Route
 *
 * POST /api/bot/post
 * Posts pending bot responses to X
 */

import { NextRequest, NextResponse } from 'next/server'
import { postResponse, postPendingResponses } from '@/lib/bot/bot-service'
import type { TeamSlug, PostRequest, PostResponse } from '@/lib/bot/types'
import { TEAM_SLUGS } from '@/lib/bot/types'

// Validate API key for cron/webhook access
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  const expectedKey = process.env.BOT_API_KEY
  return !expectedKey || apiKey === expectedKey
}

export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json().catch(() => ({}))

    // If response_id provided, post that specific response
    if (body.response_id) {
      const result = await postResponse(body.response_id)

      return NextResponse.json({
        success: result.success,
        tweet_id: result.tweet_id,
        error: result.error,
        timestamp: new Date().toISOString(),
      })
    }

    // Otherwise, post pending responses for team or all teams
    const team_slug = body.team_slug as TeamSlug | undefined
    const limit = Math.min(body.limit || 5, 10) // Max 10 at a time

    if (team_slug && !TEAM_SLUGS.includes(team_slug)) {
      return NextResponse.json(
        { error: `Invalid team_slug. Must be one of: ${TEAM_SLUGS.join(', ')}` },
        { status: 400 }
      )
    }

    const results = await postPendingResponses(team_slug, limit)

    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      posted: successful,
      failed,
      results,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Bot post error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Post failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// GET endpoint for documentation
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/bot/post',
    method: 'POST',
    description: 'Post pending bot responses to X',
    body: {
      response_id: 'number (optional) - Post specific response',
      team_slug: 'string (optional) - Filter by team',
      limit: 'number (optional, max 10) - Number of responses to post',
    },
  })
}
