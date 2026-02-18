'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChatProvider, useChatContext } from '@/contexts/ChatContext'
import ChatMessage from '@/components/chat/ChatMessage'
import ChatInput from '@/components/chat/ChatInput'

function ChatContent() {
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight')

  const {
    messages,
    currentUser,
    isAuthenticated,
    isLoading,
    error,
    currentRoom,
    joinRoom,
    scrollToMessage,
    highlightedMessageId,
    unreadNotifications,
  } = useChatContext()

  // Join the Bears room on mount
  useEffect(() => {
    joinRoom('bears')
  }, [joinRoom])

  // Handle highlight parameter from URL
  useEffect(() => {
    if (highlightId && messages.length > 0) {
      // Small delay to ensure messages are rendered
      setTimeout(() => {
        scrollToMessage(highlightId)
      }, 500)
    }
  }, [highlightId, messages.length, scrollToMessage])

  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="sm-grid-overlay" />
      {/* Header */}
      <header style={{ background: 'var(--sm-surface)', borderBottom: '1px solid var(--sm-border)', position: 'relative', zIndex: 2 }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-white.png"
              alt="Sports Mockery"
              width={140}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-4">
            {/* Notifications link */}
            <Link
              href="/notifications"
              className="relative p-2 transition-colors"
              title="Notifications"
              style={{ color: 'var(--sm-text-muted)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotifications > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, backgroundColor: 'var(--sm-red)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-3">
              <Image
                src="https://a.espncdn.com/i/teamlogos/nfl/500/chi.png"
                alt="Chicago Bears"
                width={32}
                height={32}
                className="w-8 h-8"
                unoptimized
              />
              <span style={{ color: 'var(--sm-text)', fontWeight: 600 }}>Bears Fan Chat</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container - Full Page */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px', position: 'relative', zIndex: 1 }}>
        <div className="glass-card glass-card-static" style={{ padding: 0, overflow: 'hidden', height: 'calc(100vh - 140px)' }}>
          {/* Chat Header */}
          <div className="px-6 py-4" style={{ backgroundColor: '#C83803' }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Chicago Bears Fan Chat</h1>
                <p className="text-white/80 text-sm">Connect with fellow Bears fans</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Chat Content Area */}
          <div className="flex flex-col h-[calc(100%-72px)]">
            {!isAuthenticated ? (
              /* Not logged in - show welcome message */
              <>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(188,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <svg className="w-10 h-10" style={{ color: 'var(--sm-red)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--sm-text)', marginBottom: 8, fontFamily: 'var(--sm-font-heading)' }}>Welcome to Bears Fan Chat!</h2>
                    <p style={{ color: 'var(--sm-text-muted)', maxWidth: 400, marginBottom: 24 }}>
                      Join the conversation with fellow Chicago Bears fans. Discuss games, trades, rumors, and everything Bears football.
                    </p>
                    <div className="flex flex-col gap-3 w-full max-w-sm">
                      <Link
                        href="/login"
                        className="btn btn-primary btn-md"
                        style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
                      >
                        Sign In to Chat
                      </Link>
                      <Link
                        href="/signup"
                        className="btn btn-secondary btn-md"
                        style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
                      >
                        Create Account
                      </Link>
                    </div>
                    <p style={{ color: 'var(--sm-text-dim)', fontSize: 13, marginTop: 24 }}>
                      Chat is moderated. Be respectful and follow our community guidelines.
                    </p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--sm-border)', padding: 16 }}>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Sign in to send messages..."
                      disabled
                      className="sm-input flex-1"
                      style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    />
                    <button
                      disabled
                      className="btn btn-primary btn-md"
                      style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Logged in - show real chat */
              <>
                <div className="flex-1 overflow-y-auto" id="chat-messages-container">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div style={{ width: 32, height: 32, border: '3px solid var(--sm-red)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-2030 1s linear infinite' }} />
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <p style={{ color: 'var(--sm-error)', marginBottom: 16 }}>{error}</p>
                      <button
                        onClick={() => joinRoom('bears')}
                        className="btn btn-primary btn-md"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(188,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <svg className="w-8 h-8" style={{ color: 'var(--sm-red)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p style={{ color: 'var(--sm-text)', fontWeight: 600, marginBottom: 4 }}>No messages yet</p>
                      <p style={{ color: 'var(--sm-text-muted)', fontSize: 14 }}>Be the first to start the conversation!</p>
                    </div>
                  ) : (
                    <div className="p-4">
                      {messages.map((message, index) => {
                        const isOwn = message.user_id === currentUser?.user_id
                        const prevMessage = messages[index - 1]
                        const showAvatar = !prevMessage || prevMessage.user_id !== message.user_id
                        const isHighlighted = message.id === highlightedMessageId

                        return (
                          <ChatMessage
                            key={message.id}
                            message={message}
                            isOwn={isOwn}
                            showAvatar={showAvatar}
                            isHighlighted={isHighlighted}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>

                <ChatInput />
              </>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(200, 56, 3, 0.2)' }}>
              <svg className="w-5 h-5" style={{ color: '#C83803' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">Live Discussion</h3>
            <p className="text-white/60 text-sm">Chat in real-time during games and breaking news</p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(200, 56, 3, 0.2)' }}>
              <svg className="w-5 h-5" style={{ color: '#C83803' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">Moderated</h3>
            <p className="text-white/60 text-sm">Safe, friendly environment for all Bears fans</p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(200, 56, 3, 0.2)' }}>
              <svg className="w-5 h-5" style={{ color: '#C83803' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-1">@Mentions</h3>
            <p className="text-white/60 text-sm">Tag other fans with @ and get notified when mentioned</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatPageContent() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0B162A' }}>
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: '#C83803' }} />
    </div>}>
      <ChatContent />
    </Suspense>
  )
}

export default function ChatPage() {
  return (
    <ChatProvider teamSlug="bears">
      <ChatPageContent />
    </ChatProvider>
  )
}
