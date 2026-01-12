/**
 * Bot Config API Route
 *
 * GET /api/bot/config - Get bot configurations
 * PUT /api/bot/config - Update bot configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import { getBotConfig, getAllBotConfigs, updateBotConfig } from '@/lib/bot/bot-service'
import type { TeamSlug, BotConfig } from '@/lib/bot/types'
import { TEAM_SLUGS } from '@/lib/bot/types'

// Validate API key for config changes
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  const expectedKey = process.env.BOT_API_KEY
  return !expectedKey || apiKey === expectedKey
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const team_slug = searchParams.get('team') as TeamSlug | null

    if (team_slug) {
      if (!TEAM_SLUGS.includes(team_slug)) {
        return NextResponse.json(
          { error: `Invalid team. Must be one of: ${TEAM_SLUGS.join(', ')}` },
          { status: 400 }
        )
      }

      const config = await getBotConfig(team_slug)
      if (!config) {
        return NextResponse.json(
          { error: 'Config not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        config,
      })
    }

    // Return all configs
    const configs = await getAllBotConfigs()

    return NextResponse.json({
      success: true,
      configs,
    })

  } catch (error) {
    console.error('Bot config get error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Config fetch failed',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()

    if (!body.team_slug) {
      return NextResponse.json(
        { error: 'team_slug is required' },
        { status: 400 }
      )
    }

    if (!TEAM_SLUGS.includes(body.team_slug)) {
      return NextResponse.json(
        { error: `Invalid team_slug. Must be one of: ${TEAM_SLUGS.join(', ')}` },
        { status: 400 }
      )
    }

    // Extract allowed update fields
    const updates: Partial<BotConfig> = {}

    if (typeof body.enabled === 'boolean') {
      updates.enabled = body.enabled
    }

    if (body.community_id !== undefined) {
      updates.community_id = body.community_id
    }

    if (typeof body.daily_reply_limit === 'number') {
      updates.daily_reply_limit = Math.max(0, Math.min(50, body.daily_reply_limit))
    }

    if (typeof body.daily_post_limit === 'number') {
      updates.daily_post_limit = Math.max(0, Math.min(10, body.daily_post_limit))
    }

    if (typeof body.min_delay_seconds === 'number') {
      updates.min_delay_seconds = Math.max(30, body.min_delay_seconds)
    }

    if (typeof body.max_delay_seconds === 'number') {
      updates.max_delay_seconds = Math.max(60, body.max_delay_seconds)
    }

    if (typeof body.system_prompt === 'string') {
      updates.system_prompt = body.system_prompt
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid update fields provided' },
        { status: 400 }
      )
    }

    const success = await updateBotConfig(body.team_slug, updates)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update config' },
        { status: 500 }
      )
    }

    // Return updated config
    const config = await getBotConfig(body.team_slug)

    return NextResponse.json({
      success: true,
      config,
    })

  } catch (error) {
    console.error('Bot config update error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Config update failed',
      },
      { status: 500 }
    )
  }
}
