'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAIChatPersonality } from '@/hooks/useAIChatPersonality'
import { AI_PERSONALITIES } from '@/lib/ai-personalities'

// Message type
interface ChatMessage {
  id: string
  user: string
  content: string
  time: string
  isOwn: boolean
  isAI?: boolean
  personality?: string
}

// Team channels with AI personality info
const channels = [
  {
    id: 'global',
    name: 'Chicago Lounge',
    description: 'All Chicago sports talk',
    icon: '🏙️',
    color: '#bc0000',
    unread: 5,
    aiPersonality: 'BearDownBenny', // Default to Bears in global
  },
  {
    id: 'bears',
    name: 'Bears Den',
    description: 'Bears fans only',
    icon: null,
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
    color: '#0B162A',
    unread: 12,
    isLive: true,
    aiPersonality: 'BearDownBenny',
  },
  {
    id: 'bulls',
    name: 'Bulls Nation',
    description: 'Bulls discussion',
    icon: null,
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    color: '#CE1141',
    unread: 3,
    aiPersonality: 'WindyCityHoops',
  },
  {
    id: 'cubs',
    name: 'Cubs Corner',
    description: 'Cubs fan chat',
    icon: null,
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    color: '#0E3386',
    unread: 0,
    aiPersonality: 'WrigleyWill',
  },
  {
    id: 'whitesox',
    name: 'Sox Side',
    description: 'White Sox talk',
    icon: null,
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
    color: '#27251F',
    unread: 2,
    aiPersonality: 'SouthSideSoxSarah',
  },
  {
    id: 'blackhawks',
    name: 'Hawks Nest',
    description: 'Blackhawks chat',
    icon: null,
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png',
    color: '#CF0A2C',
    unread: 0,
    aiPersonality: 'MadhouseMike',
  },
]

// Get initial welcome messages for a channel
function getWelcomeMessages(channelId: string): ChatMessage[] {
  const personality = AI_PERSONALITIES[channelId] || AI_PERSONALITIES.bears

  const welcomeMessages: Record<string, ChatMessage[]> = {
    bears: [
      {
        id: 'welcome-1',
        user: 'BearDownBenny',
        content: "What's up Bears fans! Ready to talk some football? What did youse think of the last game?",
        time: '5 min ago',
        isOwn: false,
        isAI: true,
        personality: 'bears-benny'
      }
    ],
    bulls: [
      {
        id: 'welcome-1',
        user: 'WindyCityHoops',
        content: "Bulls Nation! Good to see you. Who's your pick for most improved player this season?",
        time: '5 min ago',
        isOwn: false,
        isAI: true,
        personality: 'bulls-hoops'
      }
    ],
    cubs: [
      {
        id: 'welcome-1',
        user: 'WrigleyWill',
        content: "Hey Cubbies fans! Beautiful day for baseball talk. What's your favorite Wrigley memory?",
        time: '5 min ago',
        isOwn: false,
        isAI: true,
        personality: 'cubs-will'
      }
    ],
    whitesox: [
      {
        id: 'welcome-1',
        user: 'SouthSideSoxSarah',
        content: "South Side represent! Who do you think is the most underrated player on the Sox right now?",
        time: '5 min ago',
        isOwn: false,
        isAI: true,
        personality: 'sox-sarah'
      }
    ],
    blackhawks: [
      {
        id: 'welcome-1',
        user: 'MadhouseMike',
        content: "Hawks fans! Ready to talk some hockey? Who's looking sharp in the rebuild so far?",
        time: '5 min ago',
        isOwn: false,
        isAI: true,
        personality: 'hawks-mike'
      }
    ],
    global: [
      {
        id: 'welcome-1',
        user: 'BearDownBenny',
        content: "Welcome to the Chicago Lounge! All Chicago sports talk welcome. What's on your mind?",
        time: '5 min ago',
        isOwn: false,
        isAI: true,
        personality: 'bears-benny'
      }
    ]
  }

  return welcomeMessages[channelId] || welcomeMessages.bears
}

export default function FanChatPage() {
  const searchParams = useSearchParams()
  const initialChannel = searchParams.get('channel') || 'bears'

  const [activeChannel, setActiveChannel] = useState(initialChannel)
  const [message, setMessage] = useState('')
  const [showChannels, setShowChannels] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => getWelcomeMessages(initialChannel))
  const [isTyping, setIsTyping] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const currentChannel = channels.find(c => c.id === activeChannel) || channels[1]

  // AI Personality hook
  const {
    personality,
    isLoading: aiLoading,
    requestAIResponse
  } = useAIChatPersonality({
    channelId: activeChannel,
    enabled: true,
    onAIMessage: (aiMessage) => {
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }
  })

  // Scroll to bottom within container only (not the whole page)
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [])

  // Prevent browser scroll restoration on page load
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    // Scroll to top on mount
    window.scrollTo(0, 0)
  }, [])

  // Scroll to bottom when messages change (only after user has interacted)
  useEffect(() => {
    if (messages.length > 0 && hasUserInteracted) {
      scrollToBottom()
    }
  }, [messages, hasUserInteracted, scrollToBottom])

  // Reset messages when channel changes
  useEffect(() => {
    setMessages(getWelcomeMessages(activeChannel))
  }, [activeChannel])

  // Track number of authenticated users online
  // In demo mode, this is 1 (just the current user)
  // In production with ChatContext/presence tracking, this would be the real count
  const [authenticatedUsersOnline, setAuthenticatedUsersOnline] = useState(1)

  // Handle sending a message
  const handleSendMessage = useCallback(async () => {
    if (!message.trim()) return

    const newMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      user: 'You',
      content: message.trim(),
      time: 'Just now',
      isOwn: true,
      isAI: false
    }

    setMessages(prev => [...prev, newMessage])
    setMessage('')
    setHasUserInteracted(true) // Enable scrolling after first user interaction

    // Trigger AI response after a small delay (simulates typing)
    // AI will only respond if:
    // 1. User is alone (authenticatedUsersOnline <= 1), OR
    // 2. User directly mentions the AI (@BearDownBenny, etc.)
    setIsTyping(true)
    setTimeout(async () => {
      const updatedMessages = [...messages, newMessage]
      await requestAIResponse(updatedMessages, authenticatedUsersOnline, 'no_users_online')
    }, 1500 + Math.random() * 2000) // 1.5-3.5 second delay
  }, [message, messages, requestAIResponse, authenticatedUsersOnline])

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-dark)' }}>
      <div className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
          {/* Channel List - Sidebar */}
          <div className={`lg:col-span-1 ${showChannels ? 'block' : 'hidden lg:block'}`}>
            <div
              className="overflow-hidden sticky top-24"
              style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)', borderRadius: 'var(--sm-radius-xl)' }}
            >
              {/* Header */}
              <div
                className="px-5 py-4"
                style={{ borderBottom: '1px solid var(--sm-border)' }}
              >
                <h2
                  className="font-bold"
                  style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--sm-text)' }}
                >
                  Chat Channels
                </h2>
                <p className="text-xs mt-1" style={{ color: 'var(--sm-text-muted)' }}>
                  Join a conversation
                </p>
              </div>

              {/* Channel List */}
              <div className="p-2">
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
                      <div className="flex items-center gap-2">
                        <span
                          className="font-semibold text-sm truncate"
                          style={{ color: activeChannel === channel.id ? 'var(--sm-red)' : 'var(--sm-text)' }}
                        >
                          {channel.name}
                        </span>
                        {channel.isLive && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/20 rounded text-[10px] text-green-600 font-medium">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            LIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--sm-text-muted)' }}>
                        {channel.aiPersonality} is here
                      </p>
                    </div>

                    {/* Online indicator for AI */}
                    <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" title={`${channel.aiPersonality} is online`} />
                  </button>
                ))}
              </div>

              {/* AI Info */}
              <div className="px-5 py-4" style={{ borderTop: '1px solid var(--sm-border)' }}>
                <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                  Our superfans are always online and ready to chat about Chicago sports
                </p>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div
              className="overflow-hidden flex flex-col h-full"
              style={{
                backgroundColor: 'var(--sm-card)',
                border: '1px solid var(--sm-border)',
                borderRadius: 'var(--sm-radius-xl)',
                minHeight: 'calc(100vh - 200px)',
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
                    className="lg:hidden p-2 -ml-2 text-white/80 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
                  <div>
                    <h2 className="font-bold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {currentChannel.name}
                    </h2>
                    <p className="text-xs text-white/70">
                      {currentChannel.aiPersonality} is online
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentChannel.isLive && (
                    <span className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Live
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-white/70 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    {personality?.username || currentChannel.aiPersonality} online
                  </span>
                </div>
              </div>

              {/* Messages Area */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-5">
                {/* Welcome Message */}
                <div className="text-center py-8 mb-6" style={{ borderBottom: '1px solid var(--sm-border)' }}>
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: currentChannel.color }}
                  >
                    {currentChannel.logo ? (
                      <Image
                        src={currentChannel.logo}
                        alt={currentChannel.name}
                        width={40}
                        height={40}
                        unoptimized
                      />
                    ) : (
                      <span className="text-3xl">{currentChannel.icon}</span>
                    )}
                  </div>
                  <h3
                    className="font-bold text-lg mb-1"
                    style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--sm-text)' }}
                  >
                    Welcome to {currentChannel.name}
                  </h3>
                  <p className="text-sm mb-2" style={{ color: 'var(--sm-text-muted)' }}>
                    Chat with {currentChannel.aiPersonality} and other fans. Be respectful and have fun!
                  </p>
                  {personality && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ backgroundColor: 'var(--sm-surface)' }}>
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span style={{ color: 'var(--sm-text-muted)' }}>
                        {personality.username} is here to talk {personality.teamFullName}
                      </span>
                    </div>
                  )}
                </div>

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
                        {/* Online indicator for AI personalities */}
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
                          style={msg.isOwn ? { backgroundColor: '#bc0000', color: '#ffffff' } : { backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text)' }}
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
                        {currentChannel.aiPersonality?.charAt(0) || 'A'}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full" style={{ border: '2px solid var(--sm-card)' }} />
                      </div>
                      <div className="max-w-[75%]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold" style={{ color: currentChannel.color }}>
                            {currentChannel.aiPersonality}
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
                    placeholder={`Message ${currentChannel.aiPersonality}...`}
                    className="flex-1 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#bc0000]"
                    style={{
                      backgroundColor: 'var(--sm-surface)',
                      color: 'var(--sm-text)',
                      border: '1px solid var(--sm-border)',
                      borderRadius: 'var(--sm-radius-lg)',
                    }}
                  />

                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || aiLoading}
                    className="px-5 py-3 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                    style={{
                      backgroundColor: '#bc0000',
                      borderRadius: '100px',
                    }}
                    onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#a00000' }}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#bc0000'}
                  >
                    Send
                  </button>
                </div>

                {/* Sign in prompt for non-logged-in users */}
                <div className="mt-3 text-center">
                  <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                    <Link href="/login" className="hover:underline" style={{ color: '#bc0000' }}>Sign in</Link> to save your chat history
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
