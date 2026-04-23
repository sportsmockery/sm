import { NextRequest, NextResponse } from 'next/server'
import {
  AI_PERSONALITIES,
  AI_RATE_LIMITS,
  getPersonalityForChannel,
  checkForMention,
  isQuestion,
  shouldAIRespond,
  type TriggerReason
} from '@/lib/ai-personalities'
import { checkRateLimitRedis, getClientIp } from '@/lib/rate-limit'

interface ChatMessage {
  id: string
  user: string
  content: string
  time: string
  isOwn: boolean
  isAI?: boolean
}

interface AIResponseRequest {
  channelId: string
  messages: ChatMessage[]
  currentUser: string | null
  authenticatedUsersOnline: number
  triggerReason?: TriggerReason
}

/**
 * Generate AI response for fan chat
 * POST /api/fan-chat/ai-response
 */
export async function POST(request: NextRequest) {
  try {
    const body: AIResponseRequest = await request.json()
    const { channelId, messages, currentUser, authenticatedUsersOnline, triggerReason } = body

    // Get personality for this channel
    const personality = getPersonalityForChannel(channelId)
    if (!personality) {
      return NextResponse.json(
        { error: 'No AI personality configured for this channel' },
        { status: 400 }
      )
    }

    // Rate limiting — persistent via Upstash Redis, keyed per personality + client IP
    const clientIp = getClientIp(request)

    // Hourly limit per personality per IP
    const hourlyCheck = await checkRateLimitRedis({
      prefix: 'fan-chat-ai-hour',
      key: `${personality.id}:${clientIp}`,
      maxRequests: AI_RATE_LIMITS.maxMessagesPerHour,
      windowSeconds: 3600,
    })
    if (!hourlyCheck.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', shouldRespond: false },
        { status: 429 }
      )
    }

    // Minimum delay between messages (burst protection)
    const burstCheck = await checkRateLimitRedis({
      prefix: 'fan-chat-ai-burst',
      key: `${personality.id}:${clientIp}`,
      maxRequests: 1,
      windowSeconds: AI_RATE_LIMITS.minSecondsBetweenMessages,
    })
    if (!burstCheck.success) {
      return NextResponse.json(
        { error: 'Too soon since last message', shouldRespond: false, retryAfter: burstCheck.reset },
        { status: 429 }
      )
    }

    // ALWAYS validate if AI should respond based on user count
    // This check runs regardless of triggerReason to enforce the rule:
    // AI only responds when user is alone OR directly mentioned
    const lastHumanMessage = messages.filter(m => !m.isAI).pop()
    const recentMessages = messages.filter(m => {
      // Count messages from different humans in last 3 minutes
      // This is simplified - in production, use actual timestamps
      return !m.isAI && !m.isOwn
    })

    const aiWasMentioned = lastHumanMessage ? checkForMention(lastHumanMessage.content, personality) : false

    const triggerCheck = shouldAIRespond({
      authenticatedUsersOnline,
      lastMessageTime: new Date(), // In production, use actual timestamp
      lastMessageWasFromHuman: lastHumanMessage ? !lastHumanMessage.isAI : false,
      aiWasMentioned,
      aiWasAskedQuestion: lastHumanMessage ? isQuestion(lastHumanMessage.content) : false,
      recentHumanMessageCount: recentMessages.length
    })

    // STRICT RULE: If ANY other user is online, do NOT respond - no exceptions
    if (!triggerCheck.shouldRespond) {
      return NextResponse.json({
        shouldRespond: false,
        reason: authenticatedUsersOnline > 1
          ? 'other_users_present'
          : 'conditions not met',
        hint: authenticatedUsersOnline > 1
          ? `AI only responds when you're alone in the chat. Currently ${authenticatedUsersOnline} users are online.`
          : undefined
      })
    }

    // Use the validated trigger reason, or fall back to provided reason
    const effectiveTriggerReason = triggerCheck.reason || triggerReason

    // Build conversation context for AI
    const conversationContext = messages
      .slice(-20) // Last 20 messages
      .map(m => `${m.user}: ${m.content}`)
      .join('\n')

    // Build the prompt based on trigger reason
    let contextPrompt = ''
    switch (effectiveTriggerReason) {
      case 'no_users_online':
        contextPrompt = 'The user is alone in the chat. Be welcoming and engaging. Always ask a follow-up question.'
        break
      case 'quiet_room':
        contextPrompt = 'The room has been quiet for a few minutes. Post an engaging question or interesting stat/take to restart conversation.'
        break
      case 'direct_mention':
        contextPrompt = 'You were directly mentioned/tagged. Respond directly to what was said.'
        break
      case 'direct_question':
        contextPrompt = 'The user asked a question. Answer it thoroughly with specific stats/examples.'
        break
      default:
        contextPrompt = 'Respond naturally to the conversation.'
    }

    // Call Perplexity API
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY
    if (!perplexityApiKey) {
      console.error('PERPLEXITY_API_KEY not configured')
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    // Use Perplexity's online model for real-time search and accuracy
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Use sonar-pro for best accuracy with online search
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: `${personality.systemPrompt}

CONTEXT FOR THIS RESPONSE:
${contextPrompt}

CRITICAL ACCURACY REQUIREMENTS:
- You MUST use your search capability to verify any stats, standings, scores, or roster information before responding
- Search the team's official sources and ESPN/league sites for current, accurate data
- If you cannot verify a fact, DO NOT include it in your response
- Every stat you mention must be current and accurate
- Reference your sources mentally but don't cite them in chat (fans don't cite sources in casual chat)

RESPONSE FORMAT:
- Keep responses conversational and under 280 characters when possible
- Sound like a real fan texting, not writing an essay
- Be specific with verified stats but natural in delivery`
          },
          {
            role: 'user',
            content: `Here is the recent chat conversation:\n\n${conversationContext}\n\nRespond as ${personality.username}. Remember: you are a real Chicago ${personality.teamFullName} fan, NOT an AI. Use search to verify any facts before responding.`
          }
        ],
        max_tokens: 400,
        temperature: 0.7, // Lower temperature for more accuracy
        top_p: 0.9,
        // Enable search for real-time data
        search_recency_filter: 'week' // Prefer recent data
      })
    })

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text()
      console.error('Perplexity API error:', errorText)
      return NextResponse.json(
        { error: 'AI service error' },
        { status: 500 }
      )
    }

    const perplexityData = await perplexityResponse.json()
    let aiMessage = perplexityData.choices?.[0]?.message?.content

    if (!aiMessage) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      )
    }

    // Clean up the AI response - remove citation markers like [1], [2], [3] etc.
    // Perplexity sometimes includes these when using search, but they don't belong in casual chat
    aiMessage = aiMessage
      .replace(/\[\d+\]/g, '') // Remove [1], [2], [3], etc.
      .replace(/\s{2,}/g, ' ') // Collapse multiple spaces left behind
      .trim()

    // Return the AI response (rate limiting is already tracked by Redis/memory on check)
    return NextResponse.json({
      shouldRespond: true,
      message: {
        id: `ai-${Date.now()}`,
        user: personality.username,
        content: aiMessage,
        time: 'Just now',
        isOwn: false,
        isAI: true,
        personality: personality.id
      }
    })

  } catch (error) {
    console.error('AI response error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get AI personality info for a channel
 * GET /api/fan-chat/ai-response?channel=bears
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const channelId = searchParams.get('channel')

  if (!channelId) {
    return NextResponse.json(
      { error: 'Channel ID required' },
      { status: 400 }
    )
  }

  const personality = getPersonalityForChannel(channelId)
  if (!personality) {
    return NextResponse.json(
      { error: 'No personality for this channel' },
      { status: 404 }
    )
  }

  // Return public personality info (not the system prompt)
  return NextResponse.json({
    id: personality.id,
    username: personality.username,
    team: personality.team,
    teamFullName: personality.teamFullName,
    traits: personality.traits,
    catchphrases: personality.catchphrases
  })
}
