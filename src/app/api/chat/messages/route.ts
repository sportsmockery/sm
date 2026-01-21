import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { moderateMessage, checkRateLimit } from '@/lib/chat/moderation'

async function getSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore - called from Server Component
          }
        },
      },
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { roomId, content, contentType = 'text', gifUrl, replyToId } = body

    if (!roomId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get chat user
    const { data: chatUser } = await supabase
      .from('chat_users')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (!chatUser) {
      return NextResponse.json({ error: 'Chat user not found' }, { status: 404 })
    }

    // Check if banned
    if (chatUser.is_banned) {
      return NextResponse.json({ error: 'You are banned from chat' }, { status: 403 })
    }

    // Check if muted
    if (chatUser.muted_until && new Date(chatUser.muted_until) > new Date()) {
      const muteEnd = new Date(chatUser.muted_until)
      const minutes = Math.ceil((muteEnd.getTime() - Date.now()) / 60000)
      return NextResponse.json({
        error: `You are muted for ${minutes} more minute${minutes > 1 ? 's' : ''}`
      }, { status: 403 })
    }

    // Rate limiting
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString()

    const { count: minuteCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .gte('created_at', oneMinuteAgo)

    const { count: hourCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .gte('created_at', oneHourAgo)

    // Get last message for duplicate check
    const { data: lastMessages } = await supabase
      .from('chat_messages')
      .select('content')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    const lastContent = lastMessages?.[0]?.content
    const isNewUser = chatUser.message_count < 10

    const rateLimitResult = checkRateLimit(
      minuteCount || 0,
      hourCount || 0,
      lastContent,
      content,
      isNewUser
    )

    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        error: rateLimitResult.reason,
        cooldown: rateLimitResult.cooldownSeconds
      }, { status: 429 })
    }

    // Extract @mentions from content
    const mentionRegex = /@(\w+(?:\s\w+)*?)(?=\s|$|[.,!?])/g
    const mentionMatches = content.match(mentionRegex) || []
    const mentionedNames = mentionMatches.map((m: string) => m.slice(1).trim()) // Remove @ prefix

    // Look up user IDs for mentioned display names
    let mentionedUserIds: string[] = []
    if (mentionedNames.length > 0) {
      const { data: mentionedUsers } = await supabase
        .from('chat_room_participants')
        .select('user_id, display_name')
        .eq('room_id', roomId)
        .in('display_name', mentionedNames)

      if (mentionedUsers) {
        mentionedUserIds = mentionedUsers.map(u => u.user_id)
      }
    }

    // Content moderation
    const moderationResult = moderateMessage(content)

    if (!moderationResult.approved) {
      // Log moderation action
      await supabase
        .from('chat_moderation_log')
        .insert({
          user_id: session.user.id,
          action: moderationResult.action,
          reason: moderationResult.message,
          flags: moderationResult.flags,
          score: moderationResult.score,
        })

      // Handle ban
      if (moderationResult.action === 'ban' && moderationResult.banDuration) {
        const banUntil = new Date(Date.now() + moderationResult.banDuration * 3600000)
        await supabase
          .from('chat_users')
          .update({ is_banned: true, muted_until: banUntil.toISOString() })
          .eq('user_id', session.user.id)
      }

      // Handle mute (progressive)
      if (moderationResult.action === 'block') {
        const muteMinutes = Math.min(5 * Math.pow(2, chatUser.mute_count), 1440) // Max 24h
        const muteUntil = new Date(Date.now() + muteMinutes * 60000)

        await supabase
          .from('chat_users')
          .update({
            muted_until: muteUntil.toISOString(),
            mute_count: chatUser.mute_count + 1,
            warning_count: chatUser.warning_count + 1,
          })
          .eq('user_id', session.user.id)
      }

      return NextResponse.json({
        error: moderationResult.message,
        moderation: {
          action: moderationResult.action,
          flags: moderationResult.flags,
          score: moderationResult.score,
        }
      }, { status: 400 })
    }

    // Insert message
    const { data: message, error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        user_id: session.user.id,
        content,
        content_type: contentType,
        gif_url: gifUrl,
        reply_to_id: replyToId,
        moderation_status: moderationResult.action === 'warn' ? 'pending' : 'approved',
        moderation_score: moderationResult.score,
        moderation_flags: moderationResult.flags,
        mentions: mentionedUserIds.length > 0 ? mentionedUserIds : null,
      })
      .select(`
        *,
        user:chat_users(*)
      `)
      .single()

    if (insertError) {
      console.error('Failed to insert message:', insertError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message,
      moderation: { score: moderationResult.score }
    })
  } catch (error) {
    console.error('Chat message error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()
    const { searchParams } = new URL(request.url)

    const roomId = searchParams.get('roomId')
    const before = searchParams.get('before')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 })
    }

    let query = supabase
      .from('chat_messages')
      .select(`
        *,
        user:chat_users(*)
      `)
      .eq('room_id', roomId)
      .eq('moderation_status', 'approved')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt('created_at', before)
    }

    const { data: messages, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      messages: (messages || []).reverse(),
      hasMore: messages?.length === limit,
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
