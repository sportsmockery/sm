import { useState, useEffect, useCallback } from 'react'
import { ChatMessage } from '@/lib/api'
import { TEAMS, TeamId } from '@/lib/config'

// Welcome messages for each team chat
const getWelcomeMessages = (roomId: string): ChatMessage[] => {
  const team = TEAMS[roomId as TeamId]
  if (!team) return []

  return [
    {
      id: 'welcome-1',
      room_id: roomId,
      user_id: 'ai',
      content: `Welcome to ${team.shortName} Fan Chat! I'm ${team.aiPersonality}, your AI companion. Ask me anything about the ${team.name}!`,
      content_type: 'text',
      created_at: new Date().toISOString(),
      user: {
        id: 'ai',
        username: team.aiPersonality,
        badge: 'ai',
      },
    },
  ]
}

/**
 * Hook for Fan Chat functionality
 * Currently uses local state with AI responses
 * Will connect to backend when real-time chat is ready
 */
export function useChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Load initial welcome messages
  useEffect(() => {
    if (!roomId) return

    setIsLoading(true)
    setIsError(false)

    // Simulate loading
    setTimeout(() => {
      setMessages(getWelcomeMessages(roomId))
      setIsLoading(false)
    }, 500)
  }, [roomId])

  // Send a message (local + AI response)
  const sendMessage = useCallback(
    async (content: string, options?: { contentType?: 'text' | 'gif'; gifUrl?: string }) => {
      if (!roomId || !content.trim()) return

      const team = TEAMS[roomId as TeamId]
      if (!team) return

      setIsSending(true)

      // Add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        room_id: roomId,
        user_id: 'user',
        content: content.trim(),
        content_type: options?.contentType || 'text',
        gif_url: options?.gifUrl,
        created_at: new Date().toISOString(),
        user: {
          id: 'user',
          username: 'You',
        },
      }

      setMessages((prev) => [userMessage, ...prev])

      // Get AI response
      try {
        const response = await fetch(
          `https://test.sportsmockery.com/api/fan-chat/ai-response`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomId,
              content: content.trim(),
            }),
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.response) {
            const aiMessage: ChatMessage = {
              id: `ai-${Date.now()}`,
              room_id: roomId,
              user_id: 'ai',
              content: data.response,
              content_type: 'text',
              created_at: new Date().toISOString(),
              user: {
                id: 'ai',
                username: team.aiPersonality,
                badge: 'ai',
              },
            }
            setMessages((prev) => [aiMessage, ...prev])
          }
        }
      } catch (err) {
        console.warn('AI response failed:', err)
        // Fallback response
        const fallbackMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          room_id: roomId,
          user_id: 'ai',
          content: `Good point! Let's keep the ${team.shortName} conversation going. What else is on your mind?`,
          content_type: 'text',
          created_at: new Date().toISOString(),
          user: {
            id: 'ai',
            username: team.aiPersonality,
            badge: 'ai',
          },
        }
        setMessages((prev) => [fallbackMessage, ...prev])
      } finally {
        setIsSending(false)
      }
    },
    [roomId]
  )

  // Refresh messages
  const refetch = useCallback(() => {
    setMessages(getWelcomeMessages(roomId))
  }, [roomId])

  // Load more (no-op for now)
  const loadMore = useCallback(() => {
    // No pagination for local messages
  }, [])

  return {
    messages,
    hasMore: false,
    isLoading,
    isError,
    error: null,
    refetch,
    sendMessage,
    isSending,
    loadMore,
  }
}
