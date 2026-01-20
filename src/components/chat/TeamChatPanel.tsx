'use client'

import { useRef, useEffect, useState } from 'react'
import { useChatContext } from '@/contexts/ChatContext'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'

interface TeamChatPanelProps {
  teamName: string
  teamSlug: string
}

const TEAM_COLORS: Record<string, { primary: string; accent: string }> = {
  bears: { primary: '#0B162A', accent: '#C83803' },
  cubs: { primary: '#0E3386', accent: '#CC3433' },
  bulls: { primary: '#CE1141', accent: '#000000' },
  'white-sox': { primary: '#27251F', accent: '#C4CED4' },
  blackhawks: { primary: '#CF0A2C', accent: '#000000' },
  fire: { primary: '#7B1113', accent: '#A0D3E8' },
  sky: { primary: '#5091CD', accent: '#FFC72C' },
}

export default function TeamChatPanel({ teamName, teamSlug }: TeamChatPanelProps) {
  const {
    messages,
    currentUser,
    isOpen,
    setIsOpen,
    activeTab,
    setActiveTab,
    onlineUsers,
    isLoading,
    error,
  } = useChatContext()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  const colors = TEAM_COLORS[teamSlug] || TEAM_COLORS.bears

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, autoScroll])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100
    setAutoScroll(isAtBottom)
  }

  if (!isOpen) return null

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-panel__header" style={{ background: colors.primary }}>
        <div className="chat-panel__header-content">
          <h3 className="chat-panel__title">{teamName} Fan Chat</h3>
          <span className="chat-panel__online">
            <span className="chat-panel__online-dot" />
            {onlineUsers.length} online
          </span>
        </div>
        <button className="chat-panel__close" onClick={() => setIsOpen(false)} aria-label="Close chat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="chat-panel__tabs">
        <button
          className={`chat-panel__tab ${activeTab === 'room' ? 'chat-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('room')}
          style={{ '--accent': colors.accent } as React.CSSProperties}
        >
          Chat
        </button>
        <button
          className={`chat-panel__tab ${activeTab === 'dms' ? 'chat-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('dms')}
          style={{ '--accent': colors.accent } as React.CSSProperties}
        >
          DMs
        </button>
        <button
          className={`chat-panel__tab ${activeTab === 'history' ? 'chat-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('history')}
          style={{ '--accent': colors.accent } as React.CSSProperties}
        >
          History
        </button>
      </div>

      {/* Content */}
      <div className="chat-panel__content">
        {activeTab === 'room' && (
          <>
            {/* Messages */}
            <div className="chat-panel__messages" onScroll={handleScroll}>
              {isLoading ? (
                <div className="chat-panel__loading">
                  <span className="chat-panel__spinner" />
                  <span>Loading messages...</span>
                </div>
              ) : error ? (
                <div className="chat-panel__error">
                  <p>{error}</p>
                  <p className="chat-panel__error-sub">Chat is currently unavailable. Please try again later.</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="chat-panel__empty">
                  <p>Welcome to {teamName} Fan Chat!</p>
                  <p className="chat-panel__empty-sub">
                    {currentUser ? 'Be the first to start the conversation!' : 'Sign in to join the conversation.'}
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const isOwn = message.user_id === currentUser?.user_id
                    const prevMessage = messages[index - 1]
                    const showAvatar = !prevMessage || prevMessage.user_id !== message.user_id

                    return (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        isOwn={isOwn}
                        showAvatar={showAvatar}
                      />
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <ChatInput onSend={() => setAutoScroll(true)} />
          </>
        )}

        {activeTab === 'dms' && (
          <div className="chat-panel__placeholder">
            <p>Direct Messages</p>
            <p className="chat-panel__placeholder-sub">Coming soon!</p>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="chat-panel__placeholder">
            <p>Chat History</p>
            <p className="chat-panel__placeholder-sub">Coming soon!</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .chat-panel {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 380px;
          max-width: calc(100vw - 48px);
          height: 560px;
          max-height: calc(100vh - 120px);
          background: var(--bg-panel, #0f0f1a);
          border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          z-index: 1001;
          overflow: hidden;
        }

        .chat-panel__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          color: white;
        }

        .chat-panel__header-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .chat-panel__title {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
        }

        .chat-panel__online {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          opacity: 0.9;
        }

        .chat-panel__online-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
        }

        .chat-panel__close {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: white;
          transition: background 0.15s;
        }

        .chat-panel__close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .chat-panel__tabs {
          display: flex;
          border-bottom: 1px solid var(--border-subtle, #222);
          background: var(--bg-card, #151520);
        }

        .chat-panel__tab {
          flex: 1;
          padding: 10px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-subtle, #888);
          transition: color 0.15s, border-color 0.15s;
        }

        .chat-panel__tab:hover {
          color: var(--text-main, #fff);
        }

        .chat-panel__tab--active {
          color: var(--text-main, #fff);
          border-bottom-color: var(--accent, #3b82f6);
        }

        .chat-panel__content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-panel__messages {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }

        .chat-panel__loading,
        .chat-panel__error,
        .chat-panel__empty,
        .chat-panel__placeholder {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--text-subtle, #888);
          text-align: center;
          padding: 20px;
        }

        .chat-panel__spinner {
          width: 24px;
          height: 24px;
          border: 2px solid var(--border-subtle, #333);
          border-top-color: var(--accent, #3b82f6);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .chat-panel__empty-sub,
        .chat-panel__placeholder-sub,
        .chat-panel__error-sub {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        /* Light mode */
        :global(body.theme-light) .chat-panel,
        :global(:root:not(.dark)) .chat-panel {
          --bg-panel: #fff;
          --bg-card: #f9fafb;
          --border-subtle: #e5e7eb;
          --text-main: #111;
          --text-subtle: #666;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .chat-panel {
            bottom: 0;
            right: 0;
            left: 0;
            width: 100%;
            max-width: 100%;
            height: 100%;
            max-height: 100%;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  )
}
