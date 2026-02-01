'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { AI_RATE_LIMITS, type TriggerReason } from '@/lib/ai-personalities'

interface ChatMessage {
  id: string
  user: string
  content: string
  time: string
  isOwn: boolean
  isAI?: boolean
  personality?: string
}

interface AIPersonalityInfo {
  id: string
  username: string
  team: string
  teamFullName: string
  traits: string[]
  catchphrases: string[]
}

interface UseAIChatPersonalityOptions {
  channelId: string
  enabled?: boolean
  onAIMessage?: (message: ChatMessage) => void
}

interface UseAIChatPersonalityReturn {
  personality: AIPersonalityInfo | null
  isLoading: boolean
  error: string | null
  requestAIResponse: (
    messages: ChatMessage[],
    authenticatedUsersOnline: number,
    triggerReason?: TriggerReason
  ) => Promise<ChatMessage | null>
  checkAndTriggerAI: (
    messages: ChatMessage[],
    authenticatedUsersOnline: number
  ) => Promise<void>
}

/**
 * Hook for managing AI chat personality interactions
 */
export function useAIChatPersonality({
  channelId,
  enabled = true,
  onAIMessage
}: UseAIChatPersonalityOptions): UseAIChatPersonalityReturn {
  const [personality, setPersonality] = useState<AIPersonalityInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lastAIResponseTime = useRef<number>(0)
  const quietRoomTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch personality info on mount
  useEffect(() => {
    if (!enabled || !channelId) return

    const fetchPersonality = async () => {
      try {
        const response = await fetch(`/api/fan-chat/ai-response?channel=${channelId}`)
        if (response.ok) {
          const data = await response.json()
          setPersonality(data)
        }
      } catch (err) {
        console.error('Failed to fetch AI personality:', err)
      }
    }

    fetchPersonality()
  }, [channelId, enabled])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (quietRoomTimerRef.current) {
        clearTimeout(quietRoomTimerRef.current)
      }
    }
  }, [])

  /**
   * Request an AI response for the current conversation
   *
   * @param messages - Recent chat messages
   * @param authenticatedUsersOnline - Number of authenticated users currently in the room
   * @param triggerReason - Optional reason for triggering the response
   *
   * IMPORTANT: AI will only respond if:
   * - User is completely alone (authenticatedUsersOnline <= 1), OR
   * - AI was directly mentioned/tagged (@PersonalityName)
   */
  const requestAIResponse = useCallback(async (
    messages: ChatMessage[],
    authenticatedUsersOnline: number,
    triggerReason?: TriggerReason
  ): Promise<ChatMessage | null> => {
    if (!enabled || !channelId) return null

    // Check local rate limiting
    const now = Date.now()
    const timeSinceLastResponse = now - lastAIResponseTime.current
    const minDelay = AI_RATE_LIMITS.minSecondsBetweenMessages * 1000

    if (timeSinceLastResponse < minDelay) {
      console.log('AI response rate limited locally')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/fan-chat/ai-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channelId,
          messages,
          currentUser: null, // In production, get from auth context
          authenticatedUsersOnline, // Pass actual user count for validation
          triggerReason
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited, not an error to display
          return null
        }
        throw new Error(data.error || 'Failed to get AI response')
      }

      if (data.shouldRespond && data.message) {
        lastAIResponseTime.current = now
        onAIMessage?.(data.message)
        return data.message
      }

      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('AI response error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [channelId, enabled, onAIMessage])

  /**
   * Check conditions and potentially trigger an AI response
   *
   * STRICT RULES:
   * - ONLY respond if user is completely alone (no other users online)
   * - ONLY respond if directly mentioned/tagged
   * - NEVER respond if multiple users are chatting
   * - NEVER spam or interrupt conversations
   */
  const checkAndTriggerAI = useCallback(async (
    messages: ChatMessage[],
    authenticatedUsersOnline: number
  ): Promise<void> => {
    if (!enabled || !channelId || messages.length === 0) return

    const lastMessage = messages[messages.length - 1]

    // Don't respond to AI messages
    if (lastMessage.isAI) return

    // STRICT: If multiple users are online, ONLY respond if directly mentioned
    if (authenticatedUsersOnline > 1) {
      // Check if AI was directly mentioned/tagged
      if (personality) {
        const mentionPattern = new RegExp(`@${personality.username}`, 'i')
        if (mentionPattern.test(lastMessage.content)) {
          await requestAIResponse(messages, authenticatedUsersOnline, 'direct_mention')
        }
      }
      // Otherwise, do NOT respond - don't interrupt conversations
      return
    }

    // Check if AI was mentioned (works even when alone)
    if (personality) {
      const mentionPattern = new RegExp(`@?${personality.username}`, 'i')
      if (mentionPattern.test(lastMessage.content)) {
        await requestAIResponse(messages, authenticatedUsersOnline, 'direct_mention')
        return
      }
    }

    // User is COMPLETELY alone - respond to keep them engaged
    if (authenticatedUsersOnline <= 1) {
      await requestAIResponse(messages, authenticatedUsersOnline, 'no_users_online')
      return
    }

    // Default: Do NOT respond

  }, [channelId, enabled, personality, requestAIResponse])

  return {
    personality,
    isLoading,
    error,
    requestAIResponse,
    checkAndTriggerAI
  }
}

export default useAIChatPersonality
