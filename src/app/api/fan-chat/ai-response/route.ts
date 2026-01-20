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

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore: Map<string, { count: number; lastReset: number; lastMessage: number }> = new Map()

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

    // Check rate limits
    const rateLimitKey = `${personality.id}`
    const now = Date.now()
    const rateLimit = rateLimitStore.get(rateLimitKey) || { count: 0, lastReset: now, lastMessage: 0 }

    // Reset hourly count if needed
    if (now - rateLimit.lastReset > 60 * 60 * 1000) {
      rateLimit.count = 0
      rateLimit.lastReset = now
    }

    // Check if we've exceeded hourly limit
    if (rateLimit.count >= AI_RATE_LIMITS.maxMessagesPerHour) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', shouldRespond: false },
        { status: 429 }
      )
    }

    // Check minimum time between messages
    const timeSinceLastMessage = now - rateLimit.lastMessage
    const minDelay = AI_RATE_LIMITS.minSecondsBetweenMessages * 1000
    if (timeSinceLastMessage < minDelay) {
      return NextResponse.json(
        { error: 'Too soon since last message', shouldRespond: false, retryAfter: minDelay - timeSinceLastMessage },
        { status: 429 }
      )
    }

    // Determine if AI should respond (if not already determined by caller)
    if (!triggerReason) {
      const lastHumanMessage = messages.filter(m => !m.isAI).pop()
      const recentMessages = messages.filter(m => {
        // Count messages from different humans in last 3 minutes
        // This is simplified - in production, use actual timestamps
        return !m.isAI && !m.isOwn
      })

      const triggerCheck = shouldAIRespond({
        authenticatedUsersOnline,
        lastMessageTime: new Date(), // In production, use actual timestamp
        lastMessageWasFromHuman: lastHumanMessage ? !lastHumanMessage.isAI : false,
        aiWasMentioned: lastHumanMessage ? checkForMention(lastHumanMessage.content, personality) : false,
        aiWasAskedQuestion: lastHumanMessage ? isQuestion(lastHumanMessage.content) : false,
        recentHumanMessageCount: recentMessages.length
      })

      if (!triggerCheck.shouldRespond) {
        return NextResponse.json({ shouldRespond: false, reason: 'conditions not met' })
      }
    }

    // Build conversation context for AI
    const conversationContext = messages
      .slice(-20) // Last 20 messages
      .map(m => `${m.user}: ${m.content}`)
      .join('\n')

    // Build the prompt based on trigger reason
    let contextPrompt = ''
    switch (triggerReason) {
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

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online', // or your preferred model
        messages: [
          {
            role: 'system',
            content: `${personality.systemPrompt}\n\nCONTEXT FOR THIS RESPONSE:\n${contextPrompt}\n\nIMPORTANT: Keep responses conversational and under 280 characters when possible. Sound like a real fan texting, not writing an essay.`
          },
          {
            role: 'user',
            content: `Here is the recent chat conversation:\n\n${conversationContext}\n\nRespond as ${personality.username}. Remember: you are a real Chicago ${personality.teamFullName} fan, NOT an AI.`
          }
        ],
        max_tokens: 300,
        temperature: 0.8, // Slightly creative but not too random
        top_p: 0.9
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
    const aiMessage = perplexityData.choices?.[0]?.message?.content

    if (!aiMessage) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      )
    }

    // Update rate limiting
    rateLimit.count++
    rateLimit.lastMessage = now
    rateLimitStore.set(rateLimitKey, rateLimit)

    // Return the AI response
    return NextResponse.json({
      shouldRespond: true,
      message: {
        id: `ai-${Date.now()}`,
        user: personality.username,
        content: aiMessage.trim(),
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
