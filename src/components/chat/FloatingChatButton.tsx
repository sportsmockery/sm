'use client'

import { useState } from 'react'
import { useChatContext } from '@/contexts/ChatContext'

interface FloatingChatButtonProps {
  teamSlug: string
  teamName: string
}

const TEAM_COLORS: Record<string, { from: string; to: string }> = {
  bears: { from: '#0B162A', to: '#C83803' },
  cubs: { from: '#0E3386', to: '#CC3433' },
  bulls: { from: '#CE1141', to: '#000000' },
  'white-sox': { from: '#27251F', to: '#C4CED4' },
  blackhawks: { from: '#CF0A2C', to: '#000000' },
  fire: { from: '#7B1113', to: '#A0D3E8' },
  sky: { from: '#5091CD', to: '#FFC72C' },
}

export default function FloatingChatButton({ teamSlug, teamName }: FloatingChatButtonProps) {
  const { isOpen, setIsOpen, onlineUsers, isAuthenticated } = useChatContext()
  const [isHovered, setIsHovered] = useState(false)

  const colors = TEAM_COLORS[teamSlug] || TEAM_COLORS.bears
  const onlineCount = onlineUsers.length

  if (isOpen) return null

  return (
    <button
      onClick={() => setIsOpen(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="chat-floating-btn"
      style={{
        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      }}
      aria-label={`Open ${teamName} fan chat`}
    >
      <span className="chat-floating-btn__icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </span>
      <span className="chat-floating-btn__text">
        Hang out with {teamName} fans
      </span>
      {onlineCount > 0 && (
        <span className="chat-floating-btn__badge">
          {onlineCount} online
        </span>
      )}

      <style jsx>{`
        .chat-floating-btn {
          position: fixed;
          bottom: 90px;
          right: 24px;
          z-index: 999;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          border: none;
          border-radius: 50px;
          color: white;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .chat-floating-btn:hover {
          box-shadow: 0 6px 28px rgba(0, 0, 0, 0.4);
        }

        .chat-floating-btn__icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-floating-btn__text {
          white-space: nowrap;
        }

        .chat-floating-btn__badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .chat-floating-btn {
            bottom: 80px;
            right: 16px;
            padding: 12px 16px;
            font-size: 0.85rem;
          }

          .chat-floating-btn__text {
            display: none;
          }

          .chat-floating-btn__badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background: #22c55e;
            min-width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.65rem;
            padding: 0 4px;
          }
        }

        @media (prefers-color-scheme: light) {
          .chat-floating-btn {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          }
        }
      `}</style>
    </button>
  )
}
