'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { RealtimeChannel } from '@supabase/supabase-js'

function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Types
export interface ChatUser {
  id: string
  user_id: string
  display_name: string
  avatar_url?: string
  badge?: 'staff' | 'moderator' | 'ai' | 'verified' | 'og_fan' | 'contributor'
  reputation_score: number
  is_banned: boolean
  muted_until?: string
}

export interface ChatMessage {
  id: string
  room_id: string
  user_id: string
  content: string
  content_type: 'text' | 'gif' | 'emoji'
  gif_url?: string
  reply_to_id?: string
  reply_to?: ChatMessage
  moderation_status: string
  moderation_score: number
  reaction_counts: Record<string, number>
  is_edited: boolean
  is_deleted: boolean
  is_pinned: boolean
  created_at: string
  updated_at: string
  user?: ChatUser
}

export interface ChatRoom {
  id: string
  team_slug: string
  team_name: string
  team_color: string
  is_active: boolean
  slow_mode_seconds: number
}

export interface DMConversation {
  id: string
  participant_1: string
  participant_2: string
  other_user?: ChatUser
  last_message_at?: string
  last_message_preview?: string
  unread_count: number
}

export interface RoomParticipant {
  user_id: string
  display_name: string
  avatar_url?: string
  badge?: string
  last_message_at: string
}

export interface ChatContextType {
  // Connection state
  isConnected: boolean
  isAuthenticated: boolean
  currentUser: ChatUser | null

  // Room state
  currentRoom: ChatRoom | null
  rooms: ChatRoom[]
  messages: ChatMessage[]
  onlineUsers: ChatUser[]
  staffOnline: boolean
  roomParticipants: RoomParticipant[]

  // DM state
  dmConversations: DMConversation[]
  activeDM: DMConversation | null
  dmMessages: ChatMessage[]

  // UI state
  isOpen: boolean
  activeTab: 'room' | 'dms' | 'history'
  isLoading: boolean
  error: string | null
  highlightedMessageId: string | null

  // Notification count
  unreadNotifications: number

  // Actions
  connect: () => Promise<void>
  disconnect: () => void
  joinRoom: (teamSlug: string) => Promise<void>
  leaveRoom: () => void
  sendMessage: (content: string, contentType?: string, gifUrl?: string, replyToId?: string) => Promise<void>
  editMessage: (messageId: string, newContent: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  addReaction: (messageId: string, emoji: string) => Promise<void>
  removeReaction: (messageId: string, emoji: string) => Promise<void>

  // DM Actions
  openDM: (userId: string) => Promise<void>
  sendDM: (content: string) => Promise<void>
  closeDM: () => void

  // Moderation
  reportMessage: (messageId: string, reason: string) => Promise<void>
  blockUser: (userId: string) => Promise<void>

  // UI Actions
  setIsOpen: (open: boolean) => void
  setActiveTab: (tab: 'room' | 'dms' | 'history') => void
  scrollToMessage: (messageId: string) => void
  clearHighlight: () => void
  fetchUnreadNotifications: () => Promise<void>
}

const ChatContext = createContext<ChatContextType | null>(null)

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}

interface ChatProviderProps {
  children: React.ReactNode
  teamSlug?: string
}

export function ChatProvider({ children, teamSlug }: ChatProviderProps) {
  const [supabase] = useState(() => createSupabaseClient())
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Connection state
  const [isConnected, setIsConnected] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null)

  // Room state
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null)
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([])
  const [staffOnline, setStaffOnline] = useState(false)
  const [roomParticipants, setRoomParticipants] = useState<RoomParticipant[]>([])

  // DM state
  const [dmConversations, setDmConversations] = useState<DMConversation[]>([])
  const [activeDM, setActiveDM] = useState<DMConversation | null>(null)
  const [dmMessages, setDmMessages] = useState<ChatMessage[]>([])

  // UI state
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'room' | 'dms' | 'history'>('room')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.warn('Chat auth session check failed:', sessionError.message)
          return
        }

        setIsAuthenticated(!!session)

        if (session) {
          // Get or create chat user
          const { data: chatUser, error: userError } = await supabase
            .from('chat_users')
            .select('*')
            .eq('user_id', session.user.id)
            .single()

          if (userError && userError.code !== 'PGRST116') {
            // PGRST116 = not found, which is okay
            console.warn('Chat user lookup failed:', userError.message)
            return
          }

          if (chatUser) {
            setCurrentUser(chatUser)
          } else {
            // Create chat user - but don't fail if table doesn't exist
            const { data: newUser, error: createError } = await supabase
              .from('chat_users')
              .insert({
                user_id: session.user.id,
                display_name: session.user.email?.split('@')[0] || 'Anonymous',
                avatar_url: session.user.user_metadata?.avatar_url,
              })
              .select()
              .single()

            if (createError) {
              console.warn('Chat user creation failed:', createError.message)
              return
            }

            setCurrentUser(newUser)
          }
        }
      } catch (err) {
        console.warn('Chat auth check failed:', err)
        // Don't throw - chat is non-critical
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // Load rooms
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('is_active', true)

        if (error) {
          // Table might not exist - that's okay, chat is optional
          console.warn('Chat rooms not available:', error.message)
          return
        }

        if (data) setRooms(data)
      } catch (err) {
        console.warn('Failed to load chat rooms:', err)
        // Don't throw - chat is non-critical
      }
    }

    loadRooms()
  }, [supabase])

  // Auto-join room if teamSlug provided
  useEffect(() => {
    if (teamSlug && rooms.length > 0 && !currentRoom) {
      const room = rooms.find(r => r.team_slug === teamSlug)
      if (room) {
        joinRoom(teamSlug)
      }
    }
  }, [teamSlug, rooms])

  const connect = useCallback(async () => {
    setIsConnected(true)
  }, [])

  const disconnect = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    setIsConnected(false)
    setCurrentRoom(null)
    setMessages([])
  }, [supabase])

  const joinRoom = useCallback(async (slug: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Find room
      const room = rooms.find(r => r.team_slug === slug)
      if (!room) {
        throw new Error('Room not found')
      }

      setCurrentRoom(room)

      // Load room participants (users who have chatted in this room)
      const { data: participants } = await supabase
        .from('chat_room_participants')
        .select(`
          user_id,
          display_name,
          last_message_at,
          chat_users:user_id (
            avatar_url,
            badge
          )
        `)
        .eq('room_id', room.id)
        .order('last_message_at', { ascending: false })
        .limit(100)

      if (participants) {
        const formattedParticipants: RoomParticipant[] = participants.map((p: any) => ({
          user_id: p.user_id,
          display_name: p.display_name || 'Anonymous',
          avatar_url: p.chat_users?.avatar_url,
          badge: p.chat_users?.badge,
          last_message_at: p.last_message_at,
        }))
        setRoomParticipants(formattedParticipants)
      }

      // Load recent messages
      const { data: recentMessages, error: msgError } = await supabase
        .from('chat_messages')
        .select(`
          *,
          user:chat_users(*)
        `)
        .eq('room_id', room.id)
        .eq('moderation_status', 'approved')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(50)

      if (msgError) throw msgError
      setMessages((recentMessages || []).reverse())

      // Subscribe to realtime updates
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }

      const channel = supabase
        .channel(`chat:${room.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${room.id}`,
          },
          async (payload) => {
            // Fetch full message with user
            const { data: newMsg } = await supabase
              .from('chat_messages')
              .select('*, user:chat_users(*)')
              .eq('id', payload.new.id)
              .single()

            if (newMsg && newMsg.moderation_status === 'approved') {
              setMessages(prev => [...prev, newMsg])
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${room.id}`,
          },
          (payload) => {
            setMessages(prev =>
              prev.map(msg => msg.id === payload.new.id ? { ...msg, ...payload.new } : msg)
            )
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_reactions',
          },
          async () => {
            // Refresh reaction counts
            const { data } = await supabase
              .from('chat_messages')
              .select('id, reaction_counts')
              .eq('room_id', room.id)

            if (data) {
              setMessages(prev =>
                prev.map(msg => {
                  const updated = data.find(d => d.id === msg.id)
                  return updated ? { ...msg, reaction_counts: updated.reaction_counts } : msg
                })
              )
            }
          }
        )
        .subscribe()

      channelRef.current = channel

      // Update presence
      if (currentUser) {
        await supabase
          .from('chat_presence')
          .upsert({
            user_id: currentUser.user_id,
            room_id: room.id,
            is_online: true,
            last_seen: new Date().toISOString(),
          })
      }

      setIsConnected(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room')
    } finally {
      setIsLoading(false)
    }
  }, [rooms, supabase, currentUser])

  const leaveRoom = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    setCurrentRoom(null)
    setMessages([])
  }, [supabase])

  const sendMessage = useCallback(async (
    content: string,
    contentType = 'text',
    gifUrl?: string,
    replyToId?: string
  ) => {
    if (!currentRoom || !currentUser) {
      setError('Not connected to a room')
      return
    }

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: currentRoom.id,
          content,
          contentType,
          gifUrl,
          replyToId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send message')
        return
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    }
  }, [currentRoom, currentUser])

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!currentUser) return

    const { error: err } = await supabase
      .from('chat_messages')
      .update({ content: newContent, is_edited: true, updated_at: new Date().toISOString() })
      .eq('id', messageId)
      .eq('user_id', currentUser.user_id)

    if (err) setError(err.message)
  }, [supabase, currentUser])

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!currentUser) return

    const { error: err } = await supabase
      .from('chat_messages')
      .update({ is_deleted: true })
      .eq('id', messageId)
      .eq('user_id', currentUser.user_id)

    if (err) {
      setError(err.message)
    } else {
      setMessages(prev => prev.filter(m => m.id !== messageId))
    }
  }, [supabase, currentUser])

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!currentUser) return

    const { error: err } = await supabase
      .from('chat_reactions')
      .insert({
        message_id: messageId,
        user_id: currentUser.user_id,
        emoji,
      })

    if (err && !err.message.includes('duplicate')) {
      setError(err.message)
    }
  }, [supabase, currentUser])

  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!currentUser) return

    await supabase
      .from('chat_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', currentUser.user_id)
      .eq('emoji', emoji)
  }, [supabase, currentUser])

  const openDM = useCallback(async (userId: string) => {
    // TODO: Implement DM
    setActiveTab('dms')
  }, [])

  const sendDM = useCallback(async (content: string) => {
    // TODO: Implement DM send
  }, [])

  const closeDM = useCallback(() => {
    setActiveDM(null)
    setDmMessages([])
  }, [])

  const reportMessage = useCallback(async (messageId: string, reason: string) => {
    if (!currentUser) return

    const { error: err } = await supabase
      .from('chat_reports')
      .insert({
        reporter_id: currentUser.user_id,
        message_id: messageId,
        reason,
      })

    if (err) setError(err.message)
  }, [supabase, currentUser])

  const blockUser = useCallback(async (userId: string) => {
    if (!currentUser) return

    const { error: err } = await supabase
      .from('chat_user_blocks')
      .insert({
        blocker_id: currentUser.user_id,
        blocked_id: userId,
      })

    if (err) setError(err.message)
  }, [supabase, currentUser])

  // Scroll to and highlight a specific message
  const scrollToMessage = useCallback((messageId: string) => {
    setHighlightedMessageId(messageId)
    // The highlighting will be cleared after 5 seconds
    setTimeout(() => setHighlightedMessageId(null), 5000)
  }, [])

  const clearHighlight = useCallback(() => {
    setHighlightedMessageId(null)
  }, [])

  // Fetch unread notifications count
  const fetchUnreadNotifications = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const response = await fetch('/api/chat/notifications?unread=true&limit=1')
      const data = await response.json()
      if (data.unreadCount !== undefined) {
        setUnreadNotifications(data.unreadCount)
      }
    } catch (err) {
      console.warn('Failed to fetch notification count:', err)
    }
  }, [isAuthenticated])

  // Fetch notifications on auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadNotifications()
    }
  }, [isAuthenticated, fetchUnreadNotifications])

  const value: ChatContextType = {
    isConnected,
    isAuthenticated,
    currentUser,
    currentRoom,
    rooms,
    messages,
    onlineUsers,
    staffOnline,
    roomParticipants,
    dmConversations,
    activeDM,
    dmMessages,
    isOpen,
    activeTab,
    isLoading,
    error,
    highlightedMessageId,
    unreadNotifications,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    openDM,
    sendDM,
    closeDM,
    reportMessage,
    blockUser,
    setIsOpen,
    setActiveTab,
    scrollToMessage,
    clearHighlight,
    fetchUnreadNotifications,
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}
