/**
 * CHAT MESSAGES API
 * POST - Send a new message
 * GET - Get messages for a room
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { moderateMessage, ModerationResult } from '@/lib/chat/moderation';
import { generateAIResponse, getTimeOfDay, ChicagoTeam } from '@/lib/chat/ai-responder';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Rate limiting map (in production, use Redis)
const rateLimits = new Map<string, { count: number; resetAt: number; lastMessage: string }>();

export async function POST(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { roomId, content, contentType = 'text', gifUrl, replyToId } = body;

    if (!roomId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get chat user
    const { data: chatUser, error: userError } = await supabase
      .from('chat_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (userError || !chatUser) {
      return NextResponse.json({ error: 'Chat user not found' }, { status: 404 });
    }

    // Check if user is banned
    if (chatUser.is_banned) {
      const banExpiry = chatUser.ban_expires_at ? new Date(chatUser.ban_expires_at) : null;
      if (!banExpiry || banExpiry > new Date()) {
        return NextResponse.json({
          error: 'You are banned from chat',
          banReason: chatUser.ban_reason,
          banExpiresAt: chatUser.ban_expires_at,
        }, { status: 403 });
      }
    }

    // Check if user is muted
    if (chatUser.muted_until && new Date(chatUser.muted_until) > new Date()) {
      return NextResponse.json({
        error: 'You are temporarily muted',
        mutedUntil: chatUser.muted_until,
      }, { status: 403 });
    }

    // Rate limiting
    const rateKey = `${user.id}:${roomId}`;
    const now = Date.now();
    const rateData = rateLimits.get(rateKey) || { count: 0, resetAt: now + 60000, lastMessage: '' };

    if (now > rateData.resetAt) {
      rateData.count = 0;
      rateData.resetAt = now + 60000;
    }

    if (rateData.count >= 10) {
      return NextResponse.json({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((rateData.resetAt - now) / 1000),
      }, { status: 429 });
    }

    // Duplicate message check
    if (content === rateData.lastMessage) {
      return NextResponse.json({
        error: 'Duplicate message',
      }, { status: 400 });
    }

    // Moderate the message
    const moderationResult = moderateMessage(content, {
      userId: chatUser.id,
      messageHistory: [],
      lastMessageTime: 0,
      messageCountLastMinute: rateData.count,
      messageCountLastHour: 0,
      isNewUser: false,
      warningCount: chatUser.warnings_count || 0,
    });

    if (!moderationResult.approved) {
      // Log moderation action
      await supabase.from('chat_moderation_log').insert({
        user_id: chatUser.id,
        action: moderationResult.action,
        reason: moderationResult.blockedReason,
        triggered_rules: moderationResult.flags,
        original_content: content,
      });

      // Apply consequences based on action
      if (moderationResult.action === 'ban') {
        await supabase
          .from('chat_users')
          .update({
            is_banned: true,
            ban_reason: 'Auto-moderation: ' + moderationResult.flags[0]?.category,
            ban_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hour ban
          })
          .eq('id', chatUser.id);
      } else if (moderationResult.action === 'mute') {
        await supabase
          .from('chat_users')
          .update({
            muted_until: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minute mute
            warnings_count: (chatUser.warnings_count || 0) + 1,
          })
          .eq('id', chatUser.id);
      }

      return NextResponse.json({
        error: moderationResult.blockedReason,
        moderation: {
          action: moderationResult.action,
          flags: moderationResult.flags.map(f => f.category),
          score: moderationResult.score,
        },
      }, { status: 400 });
    }

    // Insert message
    const { data: message, error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        user_id: chatUser.id,
        content,
        content_type: contentType,
        gif_url: gifUrl,
        reply_to_id: replyToId,
        moderation_status: 'approved',
        moderation_flags: moderationResult.flags,
        moderation_score: moderationResult.score,
      })
      .select(`
        *,
        user:chat_users(*)
      `)
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Update rate limit
    rateData.count++;
    rateData.lastMessage = content;
    rateLimits.set(rateKey, rateData);

    // Check if AI should respond
    const room = await supabase
      .from('chat_rooms')
      .select('team_slug')
      .eq('id', roomId)
      .single();

    if (room.data) {
      // Check if staff is online
      const { data: onlineStaff } = await supabase
        .from('chat_presence')
        .select('user:chat_users(badge)')
        .eq('room_id', roomId)
        .gte('last_ping_at', new Date(Date.now() - 2 * 60 * 1000).toISOString());

      const staffOnline = onlineStaff?.some(
        (p: { user: { badge: string } | null }) => p.user?.badge === 'staff' || p.user?.badge === 'moderator'
      );

      if (!staffOnline) {
        // Get recent messages for context
        const { data: recentMessages } = await supabase
          .from('chat_messages')
          .select('*, user:chat_users(*)')
          .eq('room_id', roomId)
          .order('created_at', { ascending: false })
          .limit(10);

        // Generate AI response
        const aiResponse = await generateAIResponse({
          team: room.data.team_slug as ChicagoTeam,
          recentMessages: (recentMessages || []).reverse().map((m: Record<string, unknown>) => ({
            id: m.id as string,
            content: m.content as string,
            userName: (m.user as { display_name: string })?.display_name || 'Fan',
            isStaff: (m.user as { badge: string })?.badge === 'staff',
            isAI: (m.user as { badge: string })?.badge === 'ai',
            timestamp: new Date(m.created_at as string),
          })),
          userQuestion: content,
          userName: chatUser.display_name,
          staffOnline: false,
          timeOfDay: getTimeOfDay(),
        });

        if (aiResponse.shouldRespond && aiResponse.content) {
          // Get or create AI user
          let aiUser = await supabase
            .from('chat_users')
            .select('id')
            .eq('display_name', 'SM Bot')
            .single();

          if (!aiUser.data) {
            const { data: newAiUser } = await supabase
              .from('chat_users')
              .insert({
                user_id: '00000000-0000-0000-0000-000000000001', // Special AI user ID
                display_name: 'SM Bot',
                badge: 'ai',
                avatar_url: '/images/sm-bot-avatar.png',
              })
              .select('id')
              .single();
            aiUser = { data: newAiUser, error: null };
          }

          // Insert AI response after a short delay
          setTimeout(async () => {
            await supabase.from('chat_messages').insert({
              room_id: roomId,
              user_id: aiUser.data?.id,
              content: aiResponse.content,
              content_type: 'text',
              moderation_status: 'approved',
            });
          }, 1500 + Math.random() * 2000);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message,
      moderation: {
        score: moderationResult.score,
      },
    });
  } catch (error) {
    console.error('Chat message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const before = searchParams.get('before');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (!roomId) {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
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
      .limit(Math.min(limit, 100));

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({
      messages: (messages || []).reverse(),
      hasMore: (messages || []).length === limit,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
