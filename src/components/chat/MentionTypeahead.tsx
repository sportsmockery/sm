'use client'

import { useEffect, useRef } from 'react'

export interface MentionUser {
  user_id: string
  display_name: string
  avatar_url?: string
  badge?: string
}

interface MentionTypeaheadProps {
  users: MentionUser[]
  searchTerm: string
  selectedIndex: number
  onSelect: (user: MentionUser) => void
  position: { top: number; left: number }
}

export default function MentionTypeahead({
  users,
  searchTerm,
  selectedIndex,
  onSelect,
  position,
}: MentionTypeaheadProps) {
  const listRef = useRef<HTMLDivElement>(null)

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement
      if (selected) {
        selected.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  if (users.length === 0) return null

  // Filter users by search term
  const filteredUsers = users.filter(user =>
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 8) // Limit to 8 suggestions

  if (filteredUsers.length === 0) return null

  return (
    <div
      className="mention-typeahead"
      style={{
        bottom: `calc(100% + 4px)`,
        left: 0,
        right: 0,
      }}
    >
      <div className="mention-typeahead__header">
        Tag a fan
      </div>
      <div className="mention-typeahead__list" ref={listRef}>
        {filteredUsers.map((user, index) => (
          <button
            key={user.user_id}
            type="button"
            className={`mention-typeahead__item ${index === selectedIndex ? 'mention-typeahead__item--selected' : ''}`}
            onClick={() => onSelect(user)}
            onMouseEnter={(e) => e.currentTarget.focus()}
          >
            <div className="mention-typeahead__avatar">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" />
              ) : (
                <span>{user.display_name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="mention-typeahead__info">
              <span className="mention-typeahead__name">
                {highlightMatch(user.display_name, searchTerm)}
              </span>
              {user.badge && (
                <span className={`mention-typeahead__badge mention-typeahead__badge--${user.badge}`}>
                  {getBadgeLabel(user.badge)}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <style jsx>{`
        .mention-typeahead {
          position: absolute;
          background: var(--bg-card, #1a1a2e);
          border: 1px solid var(--border-subtle, #333);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          z-index: 200;
        }

        .mention-typeahead__header {
          padding: 8px 12px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-subtle, #888);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-subtle, #333);
          background: var(--bg-subtle, #111);
        }

        .mention-typeahead__list {
          max-height: 240px;
          overflow-y: auto;
        }

        .mention-typeahead__item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.1s;
        }

        .mention-typeahead__item:hover,
        .mention-typeahead__item--selected {
          background: var(--bg-hover, #2a2a3e);
        }

        .mention-typeahead__avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .mention-typeahead__avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mention-typeahead__avatar span {
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .mention-typeahead__info {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .mention-typeahead__name {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-main, #fff);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mention-typeahead__name :global(.highlight) {
          color: var(--accent, #3b82f6);
          font-weight: 700;
        }

        .mention-typeahead__badge {
          font-size: 0.65rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .mention-typeahead__badge--staff {
          background: #7c3aed;
          color: white;
        }

        .mention-typeahead__badge--moderator {
          background: #059669;
          color: white;
        }

        .mention-typeahead__badge--verified {
          background: #3b82f6;
          color: white;
        }

        .mention-typeahead__badge--og_fan {
          background: #f59e0b;
          color: #111;
        }

        .mention-typeahead__badge--contributor {
          background: #ec4899;
          color: white;
        }

        /* Light mode */
        :global(body.theme-light) .mention-typeahead,
        :global(:root:not(.dark)) .mention-typeahead {
          --bg-card: #fff;
          --bg-subtle: #f3f4f6;
          --bg-hover: #f3f4f6;
          --border-subtle: #e5e7eb;
          --text-main: #111;
          --text-subtle: #666;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  )
}

function highlightMatch(text: string, searchTerm: string): React.ReactNode {
  if (!searchTerm) return text

  const index = text.toLowerCase().indexOf(searchTerm.toLowerCase())
  if (index === -1) return text

  return (
    <>
      {text.slice(0, index)}
      <span className="highlight">{text.slice(index, index + searchTerm.length)}</span>
      {text.slice(index + searchTerm.length)}
    </>
  )
}

function getBadgeLabel(badge: string): string {
  const labels: Record<string, string> = {
    staff: 'Staff',
    moderator: 'Mod',
    verified: 'Verified',
    og_fan: 'OG',
    contributor: 'VIP',
    ai: 'AI',
  }
  return labels[badge] || badge
}
