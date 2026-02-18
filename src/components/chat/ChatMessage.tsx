'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { useChatContext, ChatMessage as ChatMessageType, ChatUser } from '@/contexts/ChatContext'

interface ChatMessageProps {
  message: ChatMessageType
  isOwn: boolean
  showAvatar?: boolean
  isHighlighted?: boolean
}

const BADGE_LABELS: Record<string, { label: string; color: string }> = {
  staff: { label: 'STAFF', color: '#22c55e' },
  moderator: { label: 'MOD', color: '#3b82f6' },
  ai: { label: 'AI', color: '#a855f7' },
  verified: { label: 'VERIFIED', color: '#f59e0b' },
  og_fan: { label: 'OG', color: '#ef4444' },
  contributor: { label: 'CONTRIB', color: '#06b6d4' },
}

const QUICK_REACTIONS = ['', '', '', '', '', '']

export default function ChatMessage({ message, isOwn, showAvatar = true, isHighlighted = false }: ChatMessageProps) {
  const { addReaction, removeReaction, deleteMessage, reportMessage, blockUser, currentUser } = useChatContext()
  const [showActions, setShowActions] = useState(false)
  const [showReactions, setShowReactions] = useState(false)

  const user = message.user
  const badge = user?.badge ? BADGE_LABELS[user.badge] : null
  const reactions = message.reaction_counts || {}
  const hasReactions = Object.keys(reactions).length > 0

  const handleReaction = (emoji: string) => {
    addReaction(message.id, emoji)
    setShowReactions(false)
  }

  const handleDelete = () => {
    if (confirm('Delete this message?')) {
      deleteMessage(message.id)
    }
  }

  const handleReport = () => {
    const reason = prompt('Why are you reporting this message?')
    if (reason) {
      reportMessage(message.id, reason)
    }
  }

  const handleBlock = () => {
    if (user && confirm(`Block ${user.display_name}?`)) {
      blockUser(user.user_id)
    }
  }

  return (
    <div
      className={`chat-message ${isOwn ? 'chat-message--own' : ''} ${isHighlighted ? 'chat-message--highlighted' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowReactions(false) }}
    >
      {showAvatar && !isOwn && (
        <div className="chat-message__avatar">
          {user?.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.display_name}
              width={36}
              height={36}
              className="chat-message__avatar-img"
            />
          ) : (
            <div className="chat-message__avatar-placeholder">
              {user?.display_name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
      )}

      <div className="chat-message__content">
        {!isOwn && (
          <div className="chat-message__header">
            <span className="chat-message__name">{user?.display_name || 'Anonymous'}</span>
            {badge && (
              <span className="chat-message__badge" style={{ background: badge.color }}>
                {badge.label}
              </span>
            )}
            <span className="chat-message__time">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
          </div>
        )}

        <div className="chat-message__bubble">
          {message.content_type === 'gif' && message.gif_url ? (
            <img src={message.gif_url} alt="GIF" className="chat-message__gif" />
          ) : (
            <p className="chat-message__text">{message.content}</p>
          )}
          {message.is_edited && <span className="chat-message__edited">(edited)</span>}
        </div>

        {hasReactions && (
          <div className="chat-message__reactions">
            {Object.entries(reactions).map(([emoji, count]) => (
              <button
                key={emoji}
                className="chat-message__reaction"
                onClick={() => removeReaction(message.id, emoji)}
              >
                {emoji} {count}
              </button>
            ))}
          </div>
        )}
      </div>

      {showActions && (
        <div className="chat-message__actions">
          <button
            className="chat-message__action"
            onClick={() => setShowReactions(!showReactions)}
            title="Add reaction"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>

          {isOwn && (
            <button className="chat-message__action chat-message__action--delete" onClick={handleDelete} title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}

          {!isOwn && (
            <>
              <button className="chat-message__action" onClick={handleReport} title="Report">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
              </button>
              <button className="chat-message__action" onClick={handleBlock} title="Block user">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      {showReactions && (
        <div className="chat-message__reaction-picker">
          {QUICK_REACTIONS.map(emoji => (
            <button key={emoji} className="chat-message__reaction-btn" onClick={() => handleReaction(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .chat-message {
          display: flex;
          gap: 10px;
          padding: 8px 12px;
          position: relative;
          transition: background 0.15s;
        }

        .chat-message:hover {
          background: var(--sm-card-hover, rgba(255, 255, 255, 0.03));
        }

        .chat-message--highlighted {
          background: rgba(59, 130, 246, 0.15);
          animation: highlight-pulse 2s ease-in-out;
        }

        @keyframes highlight-pulse {
          0% {
            background: rgba(59, 130, 246, 0.3);
          }
          50% {
            background: rgba(59, 130, 246, 0.15);
          }
          100% {
            background: rgba(59, 130, 246, 0.15);
          }
        }

        .chat-message--own {
          flex-direction: row-reverse;
        }

        .chat-message__avatar {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
        }

        .chat-message__avatar-img {
          border-radius: 50%;
          object-fit: cover;
        }

        .chat-message__avatar-placeholder {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--sm-surface, #2a2a2a);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--sm-text-muted, #888);
        }

        .chat-message__content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .chat-message--own .chat-message__content {
          align-items: flex-end;
        }

        .chat-message__header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
        }

        .chat-message__name {
          font-weight: 600;
          color: var(--sm-text, #fff);
        }

        .chat-message__badge {
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
        }

        .chat-message__time {
          color: var(--sm-text-muted, #888);
          font-size: 0.7rem;
        }

        .chat-message__bubble {
          background: var(--sm-surface, #1a1a2e);
          padding: 10px 14px;
          border-radius: 16px;
          border-top-left-radius: 4px;
          max-width: 85%;
          word-wrap: break-word;
        }

        .chat-message--own .chat-message__bubble {
          background: var(--sm-surface-own, #0B162A);
          border-top-left-radius: 16px;
          border-top-right-radius: 4px;
        }

        .chat-message__text {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.4;
          color: var(--sm-text, #fff);
        }

        .chat-message__gif {
          max-width: 200px;
          border-radius: 8px;
        }

        .chat-message__edited {
          font-size: 0.7rem;
          color: var(--sm-text-muted, #888);
          margin-left: 6px;
        }

        .chat-message__reactions {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          margin-top: 4px;
        }

        .chat-message__reaction {
          background: var(--sm-surface, #2a2a2a);
          border: 1px solid var(--sm-border, #333);
          border-radius: 12px;
          padding: 2px 8px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: background 0.15s;
        }

        .chat-message__reaction:hover {
          background: var(--sm-card-hover, #3a3a3a);
        }

        .chat-message__actions {
          position: absolute;
          top: 4px;
          right: 12px;
          display: flex;
          gap: 2px;
          background: var(--sm-card, #1a1a2e);
          border: 1px solid var(--sm-border, #333);
          border-radius: 6px;
          padding: 2px;
        }

        .chat-message--own .chat-message__actions {
          right: auto;
          left: 12px;
        }

        .chat-message__action {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          color: var(--sm-text-muted, #888);
          transition: background 0.15s, color 0.15s;
        }

        .chat-message__action:hover {
          background: var(--sm-card-hover, #2a2a2a);
          color: var(--sm-text, #fff);
        }

        .chat-message__action--delete:hover {
          color: #ef4444;
        }

        .chat-message__reaction-picker {
          position: absolute;
          top: -40px;
          right: 12px;
          display: flex;
          gap: 4px;
          background: var(--sm-card, #1a1a2e);
          border: 1px solid var(--sm-border, #333);
          border-radius: 20px;
          padding: 6px 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .chat-message__reaction-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.1rem;
          transition: transform 0.15s, background 0.15s;
        }

        .chat-message__reaction-btn:hover {
          transform: scale(1.2);
          background: var(--sm-card-hover, #2a2a2a);
        }

        /* Light mode */
        :global(body.theme-light) .chat-message:hover,
        :global(:root:not(.dark)) .chat-message:hover {
          --bg-hover: rgba(0, 0, 0, 0.03);
        }

        :global(body.theme-light) .chat-message__bubble,
        :global(:root:not(.dark)) .chat-message__bubble {
          --bg-bubble: #f1f3f5;
        }

        :global(body.theme-light) .chat-message--own .chat-message__bubble,
        :global(:root:not(.dark)) .chat-message--own .chat-message__bubble {
          --bg-bubble-own: #e8f4fd;
        }

        :global(body.theme-light) .chat-message__text,
        :global(:root:not(.dark)) .chat-message__text {
          --text-main: #111;
        }

        @media (max-width: 768px) {
          .chat-message {
            padding: 6px 10px;
          }

          .chat-message__avatar {
            width: 32px;
            height: 32px;
          }

          .chat-message__avatar-placeholder {
            width: 32px;
            height: 32px;
            font-size: 0.8rem;
          }

          .chat-message__bubble {
            padding: 8px 12px;
            max-width: 90%;
          }

          .chat-message__text {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  )
}
