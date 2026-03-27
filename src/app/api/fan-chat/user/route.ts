import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

/**
 * GET /api/fan-chat/user/lookup?userId=<uuid>
 * Looks up a chat_user by their UUID.
 * Returns: { id, displayName, badge }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('chat_users')
      .select('id, display_name, badge')
      .eq('id', userId)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: data.id,
      displayName: data.display_name,
      badge: data.badge,
    })
  } catch (err) {
    console.error('[fan-chat/user GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/**
 * POST /api/fan-chat/user
 * Looks up or creates a chat_user by display_name.
 * Body: { displayName: string, isAI?: boolean }
 * Returns: { id: string, displayName: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { displayName, isAI } = body

    if (!displayName) {
      return NextResponse.json({ error: 'displayName is required' }, { status: 400 })
    }

    // Try to find an existing chat_user with this display_name
    const { data: existing, error: lookupError } = await supabaseAdmin
      .from('chat_users')
      .select('id, display_name')
      .eq('display_name', displayName)
      .limit(1)
      .maybeSingle()

    if (lookupError) {
      console.error('[fan-chat/user POST] lookup error:', lookupError)
      return NextResponse.json({ error: 'Failed to look up user' }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({ id: existing.id, displayName: existing.display_name })
    }

    // Create a new chat_user
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('chat_users')
      .insert({
        display_name: displayName,
        badge: isAI ? 'ai' : 'fan',
      })
      .select('id, display_name')
      .single()

    if (insertError) {
      console.error('[fan-chat/user POST] insert error:', insertError)
      // Race condition: another request may have created the user. Try lookup again.
      const { data: retry } = await supabaseAdmin
        .from('chat_users')
        .select('id, display_name')
        .eq('display_name', displayName)
        .limit(1)
        .maybeSingle()

      if (retry) {
        return NextResponse.json({ id: retry.id, displayName: retry.display_name })
      }

      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    return NextResponse.json({ id: newUser.id, displayName: newUser.display_name })
  } catch (err) {
    console.error('[fan-chat/user POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
