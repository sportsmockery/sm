'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

// DataLab Supabase for realtime on fan_chat_messages
const DATALAB_URL = 'https://siwoqfzzcxmngnseyzpv.supabase.co'
const DATALAB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpd29xZnp6Y3htbmduc2V5enB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NDk0ODAsImV4cCI6MjA4MzIyNTQ4MH0.PzeJ6OG2ofjLWSpJ2UmI-1aXVrHnh3ar6eTgph4uJgc'

// Message type for display
interface ChatMessage {
  id: string
  user: string
  content: string
  time: string
  isOwn: boolean
  isAI?: boolean
}

// Normalized message shape from our API
interface APIMessage {
  id: string
  user_id: string
  content: string
  created_at: string
  display_name: string
  badge: string
}

// Team channels (no global — DataLab only has 5 team rooms)
const channels = [
  {
    id: 'bears',
    name: 'Bears Den',
    description: 'Bears fans only',
    icon: null,
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
    color: '#0B162A',
  },
  {
    id: 'bulls',
    name: 'Bulls Nation',
    description: 'Bulls discussion',
    icon: null,
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    color: '#CE1141',
  },
  {
    id: 'cubs',
    name: 'Cubs Corner',
    description: 'Cubs fan chat',
    icon: null,
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    color: '#0E3386',
  },
  {
    id: 'whitesox',
    name: 'Sox Side',
    description: 'White Sox talk',
    icon: null,
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
    color: '#27251F',
  },
  {
    id: 'blackhawks',
    name: 'Hawks Nest',
    description: 'Blackhawks chat',
    icon: null,
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png',
    color: '#CF0A2C',
  },
]

const CHANNEL_FAN_LABEL: Record<string, string> = {
  bears: 'Bears',
  bulls: 'Bulls',
  cubs: 'Cubs',
  whitesox: 'White Sox',
  blackhawks: 'Blackhawks',
}

// Format a timestamp to a relative time string
function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin} min ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

// Convert API message to display ChatMessage
function apiMessageToChatMessage(msg: APIMessage, currentUserId: string | null): ChatMessage {
  const isAI = msg.badge === 'ai'
  const isOwn = !isAI && !!currentUserId && msg.user_id === currentUserId

  return {
    id: msg.id,
    user: isOwn ? 'You' : msg.display_name,
    content: msg.content,
    time: formatRelativeTime(msg.created_at),
    isOwn,
    isAI,
  }
}

// Welcome messages shown only when a room has zero history
function getWelcomeMessages(channelId: string): ChatMessage[] {
  const map: Record<string, { user: string; content: string }> = {
    bears: { user: 'Da Coach', content: "What's up Bears fans! Ready to talk some football? What did youse think of the last game?" },
    bulls: { user: 'AI Bot', content: "Bulls Nation! Good to see you. Who's your pick for most improved player this season?" },
    cubs: { user: 'AI Bot', content: "Hey Cubbies fans! Beautiful day for baseball talk. What's your favorite Wrigley memory?" },
    whitesox: { user: 'AI Bot', content: "South Side represent! Who do you think is the most underrated player on the Sox right now?" },
    blackhawks: { user: 'AI Bot', content: "Hawks fans! Ready to talk some hockey? Who's looking sharp in the rebuild so far?" },
  }

  const entry = map[channelId] || map.bears
  return [{
    id: 'welcome-1',
    user: entry.user,
    content: entry.content,
    time: '',
    isOwn: false,
    isAI: true,
  }]
}

export default function FanChatPage() {
  const searchParams = useSearchParams()
  const initialChannel = searchParams.get('channel') || 'bears'
  // Ensure initial channel is valid (no global)
  const validInitial = channels.some(c => c.id === initialChannel) ? initialChannel : 'bears'

  const [activeChannel, setActiveChannel] = useState(validInitial)
  const [message, setMessage] = useState('')
  const [showChannels, setShowChannels] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)

  // Stable user ID for the session
  const userIdRef = useRef<string>('')
  const displayNameRef = useRef<string>('')
  useEffect(() => {
    const storedId = sessionStorage.getItem('fan-chat-user-uuid')
    const storedName = sessionStorage.getItem('fan-chat-display-name')
    if (storedId && storedName) {
      userIdRef.current = storedId
      displayNameRef.current = storedName
      return
    }

    // Generate a guest identity
    const guestName = `Fan${Math.floor(Math.random() * 9000) + 1000}`
    const guestId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    userIdRef.current = guestId
    displayNameRef.current = guestName
    sessionStorage.setItem('fan-chat-user-uuid', guestId)
    sessionStorage.setItem('fan-chat-display-name', guestName)
  }, [])

  // Cache of per-channel messages so switching rooms preserves history
  const channelCacheRef = useRef<Record<string, ChatMessage[]>>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const currentChannel = channels.find(c => c.id === activeChannel) || channels[0]

  // DataLab Supabase client for realtime on fan_chat_messages
  const datalabClientRef = useRef(
    createClient(DATALAB_URL, DATALAB_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  )
  const realtimeChannelRef = useRef<ReturnType<typeof datalabClientRef.current.channel> | null>(null)

  // Scroll to bottom within container only
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      })
    }
  }, [])

  // Prevent browser scroll restoration on page load
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom])

  // Fetch messages for the active channel
  useEffect(() => {
    let cancelled = false

    const loadMessages = async () => {
      setIsLoadingMessages(true)

      // Show cache immediately while refreshing
      const cached = channelCacheRef.current[activeChannel]
      if (cached && cached.length > 0) {
        setMessages(cached)
        setIsLoadingMessages(false)
      }

      try {
        // Add timeout to prevent infinite loading state
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000)

        const res = await fetch(`/api/fan-chat/messages?channel=${activeChannel}&limit=200`, {
          signal: controller.signal,
        })
        clearTimeout(timeout)

        if (!res.ok) throw new Error('Failed to fetch messages')
        const data = await res.json()

        if (cancelled) return

        if (data.messages && data.messages.length > 0) {
          const converted = data.messages.map((m: APIMessage) =>
            apiMessageToChatMessage(m, userIdRef.current)
          )
          setMessages(converted)
          channelCacheRef.current[activeChannel] = converted
        } else if (!cached || cached.length === 0) {
          // No messages at all — show welcome
          const welcome = getWelcomeMessages(activeChannel)
          setMessages(welcome)
          channelCacheRef.current[activeChannel] = welcome
        }
      } catch (err) {
        console.error('Failed to load messages:', err)
        if (!cancelled) {
          // Always show welcome messages on error so the UI is never stuck
          if (messages.length === 0) {
            setMessages(getWelcomeMessages(activeChannel))
          }
        }
      } finally {
        if (!cancelled) setIsLoadingMessages(false)
      }
    }

    loadMessages()
    return () => { cancelled = true }
  }, [activeChannel])

  // Set up DataLab Supabase realtime subscription for fan_chat_messages
  useEffect(() => {
    // Clean up previous subscription
    if (realtimeChannelRef.current) {
      datalabClientRef.current.removeChannel(realtimeChannelRef.current)
      realtimeChannelRef.current = null
    }

    const channel = datalabClientRef.current
      .channel(`fan-chat-${activeChannel}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fan_chat_messages',
          filter: `team_key=eq.${activeChannel}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const raw = payload.new as Record<string, unknown>

          const isOwnMessage = raw.sender_id === userIdRef.current
          const isAI = raw.sender_type === 'ai'

          const newMsg: ChatMessage = {
            id: String(raw.id),
            user: isOwnMessage ? 'You' : (raw.sender_name as string) || 'Fan',
            content: (raw.message as string) || '',
            time: formatRelativeTime(raw.created_at as string),
            isOwn: isOwnMessage,
            isAI,
          }

          setMessages(prev => {
            // Already have this DB row (POST response landed first) — skip
            if (prev.some(m => m.id === newMsg.id)) return prev

            // For own messages, swap the matching optimistic in place rather
            // than appending — otherwise a realtime event arriving before the
            // POST response duplicates the message.
            if (isOwnMessage) {
              const optIdx = prev.findIndex(
                m => m.isOwn && m.id.startsWith('optimistic-') && m.content === newMsg.content
              )
              if (optIdx !== -1) {
                const updated = [...prev]
                updated[optIdx] = newMsg
                channelCacheRef.current[activeChannel] = updated
                return updated
              }
            }

            const updated = [...prev, newMsg]
            channelCacheRef.current[activeChannel] = updated
            return updated
          })
        }
      )
      .subscribe()

    realtimeChannelRef.current = channel
    const client = datalabClientRef.current

    return () => {
      client.removeChannel(channel)
      realtimeChannelRef.current = null
    }
  }, [activeChannel])

  // Per-channel online counts for sidebar
  const [onlineCounts, setOnlineCounts] = useState<Record<string, number>>(() => ({
    bears: 1, bulls: 1, cubs: 1, whitesox: 1, blackhawks: 1,
  }))
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/fan-chat/online-counts')
        if (res.ok) {
          const data = await res.json()
          setOnlineCounts(data)
        }
      } catch {
        // Keep existing
      }
    }
    fetchCounts()
    const interval = setInterval(fetchCounts, 30_000)
    return () => clearInterval(interval)
  }, [])

  // Presence heartbeat
  useEffect(() => {
    if (!userIdRef.current) return

    const sendHeartbeat = () => {
      fetch('/api/fan-chat/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: activeChannel,
          userId: userIdRef.current,
          displayName: displayNameRef.current,
        }),
      }).catch(() => {})
    }

    sendHeartbeat()
    const interval = setInterval(sendHeartbeat, 30_000)

    const leaveRoom = () => {
      const body = JSON.stringify({
        channel: activeChannel,
        userId: userIdRef.current,
      })
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/fan-chat/presence?_method=DELETE', body)
      } else {
        fetch('/api/fan-chat/presence', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => {})
      }
    }

    window.addEventListener('beforeunload', leaveRoom)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', leaveRoom)
      leaveRoom()
    }
  }, [activeChannel])

  // Handle sending a message
  const handleSendMessage = useCallback(async () => {
    if (!message.trim()) return

    const content = message.trim()
    setMessage('')

    // Optimistic update
    const optimisticMsg: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      user: 'You',
      content,
      time: 'Just now',
      isOwn: true,
      isAI: false,
    }
    setMessages(prev => [...prev, optimisticMsg])

    // Show typing indicator while waiting for AI response
    setIsTyping(true)

    try {
      const res = await fetch('/api/fan-chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: activeChannel,
          content,
          userId: userIdRef.current,
          displayName: displayNameRef.current,
        }),
      })

      if (res.ok) {
        const data = await res.json()

        // Replace optimistic message with real one from server
        if (data.userMessage) {
          const realMsg = apiMessageToChatMessage(data.userMessage as APIMessage, userIdRef.current)
          setMessages(prev =>
            prev.map(m => m.id === optimisticMsg.id ? realMsg : m)
          )
        }

        // Add AI auto-response if DataLab sent one
        if (data.aiResponse) {
          const aiMsg = apiMessageToChatMessage(data.aiResponse as APIMessage, userIdRef.current)
          setMessages(prev => {
            if (prev.some(m => m.id === aiMsg.id)) return prev
            return [...prev, aiMsg]
          })
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setIsTyping(false)
    }
  }, [message, activeChannel])

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // AI suggested replies
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  useEffect(() => {
    const channelSuggestions: Record<string, string[]> = {
      bears: ["What about the draft?", "Caleb looks solid!", "Defense needs work"],
      bulls: ["Trade rumors?", "Rebuild is working", "Need a center badly"],
      cubs: ["Pitching looks good", "Wrigley is beautiful", "Who's the closer?"],
      whitesox: ["Rebuild takes time", "Any prospects?", "South side pride"],
      blackhawks: ["Bedard is special", "When do we compete?", "Hockey town!"],
    }
    setAiSuggestions(channelSuggestions[activeChannel] || channelSuggestions.bears)
  }, [activeChannel])

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion)
  }

  // Echo Chamber digest (shown every 10 messages)
  const showEchoDigest = messages.length > 0 && messages.length % 10 === 0 && messages.length > 5

  return (
    <div className="sm-hero-bg fan-chat-page" style={{ minHeight: '100vh', marginTop: 0, paddingTop: 0 }}>
      <div className="sm-grid-overlay" />
      <div className="fan-chat-content" style={{ maxWidth: 'min(1600px, 100vw - 32px)', margin: '0 auto', padding: '0 16px 24px', position: 'relative', zIndex: 1, marginTop: 0, paddingTop: 0 }}>

        <div
          className="grid grid-cols-1 gap-x-6 gap-y-0 fan-chat-grid"
          style={{ alignItems: 'start', alignContent: 'start', minHeight: 'calc(100vh - 48px)', marginTop: 0, paddingTop: 0 }}
        >
          {/* Channel List - Sidebar */}
          <div className={`${showChannels ? 'block' : 'hidden lg:block'}`} style={{ alignSelf: 'start', marginTop: 0, paddingTop: 0 }}>
            <div
              className="glass-card glass-card-static overflow-hidden sticky lg:h-[calc(100vh-48px)] lg:min-h-[calc(100vh-48px)]"
              style={{
                top: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                marginTop: 0,
              }}
            >
              {/* Header */}
              <div
                className="px-5 py-4 flex-shrink-0"
                style={{ borderBottom: '1px solid var(--sm-border)' }}
              >
                <h2
                  className="font-bold"
                  style={{ fontFamily: 'var(--sm-font-heading)', color: 'var(--sm-text)' }}
                >
                  Chat Channels
                </h2>
                <p className="text-xs mt-1" style={{ color: 'var(--sm-text-muted)' }}>
                  Join a conversation
                </p>
              </div>

              {/* Channel List */}
              <div className="p-2 flex-1 overflow-y-auto min-h-0">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setActiveChannel(channel.id)
                      setShowChannels(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
                    style={{
                      borderRadius: 'var(--sm-radius-lg)',
                      backgroundColor: activeChannel === channel.id ? 'rgba(188, 0, 0, 0.1)' : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (activeChannel !== channel.id) e.currentTarget.style.backgroundColor = 'var(--sm-card-hover)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = activeChannel === channel.id ? 'rgba(188, 0, 0, 0.1)' : ''
                    }}
                  >
                    {/* Icon/Logo */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: channel.color }}
                    >
                      {channel.logo ? (
                        <Image
                          src={channel.logo}
                          alt={channel.name}
                          width={28}
                          height={28}
                          className="rounded-full"
                          unoptimized
                        />
                      ) : (
                        <span className="text-lg">{channel.icon}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-left min-w-0">
                      <span
                        className="font-semibold text-sm truncate block"
                        style={{ color: activeChannel === channel.id ? 'var(--sm-red)' : 'var(--sm-text)' }}
                      >
                        {channel.name}
                      </span>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--sm-text-muted)' }}>
                        {Math.max(1, (onlineCounts[channel.id] ?? 1) + (activeChannel === channel.id ? 1 : 0))} {CHANNEL_FAN_LABEL[channel.id] ?? channel.id} Fans Online
                      </p>
                    </div>

                    {/* Green dot + LIVE */}
                    <span className="flex items-center gap-1.5 flex-shrink-0" style={{ color: 'var(--sm-success)', fontSize: 11, fontWeight: 500 }}>
                      <span className="w-2 h-2 bg-green-500 rounded-full" title="Live" />
                      LIVE
                    </span>
                  </button>
                ))}
              </div>

              {/* AI Info */}
              <div className="px-5 py-4 flex-shrink-0 mt-auto" style={{ borderTop: '1px solid var(--sm-border)' }}>
                <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                  Our superfans are always online and ready to chat about Chicago sports
                </p>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div>
            <div
              className="glass-card glass-card-static overflow-hidden flex flex-col"
              style={{
                padding: 0,
                minHeight: 'calc(100vh - 48px)',
                maxHeight: 'calc(100vh - 48px)',
              }}
            >
              {/* Chat Header */}
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--sm-border)', backgroundColor: currentChannel.color }}
              >
                <div className="flex items-center gap-3">
                  {/* Mobile channel toggle */}
                  <button
                    onClick={() => setShowChannels(!showChannels)}
                    className="lg:hidden -ml-2 text-white/90 hover:text-white min-h-[44px] flex items-center gap-1.5 px-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.12)' }}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span className="text-xs font-semibold whitespace-nowrap">Rooms</span>
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: showChannels ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {currentChannel.logo ? (
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <Image
                        src={currentChannel.logo}
                        alt={currentChannel.name}
                        width={28}
                        height={28}
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-2xl">{currentChannel.icon}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2
                      className="font-bold"
                      style={{
                        fontFamily: 'var(--sm-font-heading)',
                        color: currentChannel.id === 'bears' ? '#CC5500' : 'white',
                        fontSize: '1.25rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {currentChannel.name}
                    </h2>
                  </div>
                </div>

                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium flex-shrink-0" style={{ background: 'rgba(34,197,94,0.2)', color: 'var(--sm-success)' }}>
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  LIVE
                </span>
              </div>

              {/* Messages Area */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-5">
                {/* Compact welcome at top */}
                <div className="pb-4 mb-4" style={{ borderBottom: '1px solid var(--sm-border)' }}>
                  <h3
                    className="font-bold text-base"
                    style={{ fontFamily: 'var(--sm-font-heading)', color: 'var(--sm-text)' }}
                  >
                    Welcome to {currentChannel.name}
                  </h3>
                </div>

                {/* Loading indicator */}
                {isLoadingMessages && messages.length === 0 && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center gap-2" style={{ color: 'var(--sm-text-muted)' }}>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-sm ml-2">Loading messages...</span>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold relative"
                        style={{ backgroundColor: msg.isOwn ? '#bc0000' : currentChannel.color }}
                      >
                        {msg.user.charAt(0)}
                        {msg.isAI && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full" style={{ border: '2px solid var(--sm-card)' }} />
                        )}
                      </div>

                      {/* Message */}
                      <div className={`max-w-[75%] ${msg.isOwn ? 'text-right' : ''}`}>
                        <div className={`flex items-center gap-2 mb-1 ${msg.isOwn ? 'justify-end' : ''}`}>
                          {!msg.isOwn && (
                            <span
                              className="text-sm font-semibold"
                              style={{ color: msg.isAI ? currentChannel.color : 'var(--sm-text)' }}
                            >
                              {msg.user}
                            </span>
                          )}
                          <span className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                            {msg.time}
                          </span>
                        </div>
                        <div
                          className={`inline-block px-4 py-2 rounded-2xl text-sm ${
                            msg.isOwn
                              ? 'rounded-tr-sm'
                              : 'rounded-tl-sm'
                          }`}
                          style={msg.isOwn ? { backgroundColor: '#bc0000', color: '#FAFAFB' } : { backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text)' }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold relative"
                        style={{ backgroundColor: currentChannel.color }}
                      >
                        A
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full" style={{ border: '2px solid var(--sm-card)' }} />
                      </div>
                      <div className="max-w-[75%]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold" style={{ color: currentChannel.color }}>
                            AI
                          </span>
                        </div>
                        <div
                          className="inline-flex items-center gap-1 px-4 py-3 rounded-2xl rounded-tl-sm"
                          style={{ backgroundColor: 'var(--sm-surface)' }}
                        >
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Echo Chamber Digest */}
              {showEchoDigest && (
                <div className="echo-digest" style={{ margin: '0 20px 8px' }}>
                  <div className="echo-header">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="7" cy="7" r="6"/>
                      <path d="M4 7h6M7 4v6" strokeLinecap="round"/>
                    </svg>
                    <span>Fan Consensus</span>
                  </div>
                  <p className="echo-text">
                    The chat is buzzing about {currentChannel.name}! Fans are engaging about the latest developments.
                  </p>
                  <span className="echo-meta">AI summary based on {messages.length} messages</span>
                </div>
              )}

              {/* AI Suggested Replies */}
              {aiSuggestions.length > 0 && (
                <div className="ai-suggestions" style={{ borderTop: '1px solid var(--sm-border)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--sm-text-dim)', fontWeight: 500, whiteSpace: 'nowrap' }}>AI suggests:</span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {aiSuggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(s)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 100,
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: 'var(--sm-text-muted)',
                          fontSize: 12,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--sm-gradient-subtle)'
                          e.currentTarget.style.borderColor = 'rgba(188, 0, 0, 0.2)'
                          e.currentTarget.style.color = 'var(--sm-red-light)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                          e.currentTarget.style.color = 'var(--sm-text-muted)'
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4" style={{ borderTop: '1px solid var(--sm-border)' }}>
                <div className="flex items-center gap-3">
                  {/* Emoji Button */}
                  <button
                    className="p-2 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    style={{ color: 'var(--sm-text-muted)', borderRadius: 'var(--sm-radius-lg)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--sm-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  {/* GIF Button */}
                  <button
                    className="p-2 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    style={{ color: 'var(--sm-text-muted)', borderRadius: 'var(--sm-radius-lg)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--sm-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                  >
                    <span className="text-xs font-bold">GIF</span>
                  </button>

                  {/* Input */}
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${currentChannel.name}...`}
                    className="sm-input flex-1"
                  />

                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="btn btn-primary btn-md"
                    style={{ borderRadius: 'var(--sm-radius-pill)', minHeight: 44, paddingLeft: 20, paddingRight: 20, color: '#FAFAFB' }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
