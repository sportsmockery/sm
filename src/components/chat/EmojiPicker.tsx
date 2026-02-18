'use client'

import { useState } from 'react'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

const EMOJI_CATEGORIES = {
  'Sports': ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  'Reactions': ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  'Gestures': ['', '', '', '', '', '', '', '', '', '', '', ''],
  'Chicago': ['', '', '', '', '', '', '', '', '', ''],
  'Objects': ['', '', '', '', '', '', '', '', '', ''],
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState('Sports')

  return (
    <div className="emoji-picker">
      <div className="emoji-picker__header">
        <span className="emoji-picker__title">Emoji</span>
        <button className="emoji-picker__close" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="emoji-picker__categories">
        {Object.keys(EMOJI_CATEGORIES).map(category => (
          <button
            key={category}
            className={`emoji-picker__category ${activeCategory === category ? 'emoji-picker__category--active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="emoji-picker__grid">
        {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, i) => (
          <button
            key={`${emoji}-${i}`}
            className="emoji-picker__emoji"
            onClick={() => onSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>

      <style jsx>{`
        .emoji-picker {
          background: var(--sm-card, #1a1a2e);
          border: 1px solid var(--sm-border, #333);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          max-height: 320px;
          display: flex;
          flex-direction: column;
        }

        .emoji-picker__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-bottom: 1px solid var(--sm-border, #333);
        }

        .emoji-picker__title {
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--sm-text, #fff);
        }

        .emoji-picker__close {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          color: var(--sm-text-muted, #888);
          transition: background 0.15s;
        }

        .emoji-picker__close:hover {
          background: var(--sm-card-hover, #2a2a2a);
        }

        .emoji-picker__categories {
          display: flex;
          gap: 2px;
          padding: 8px;
          overflow-x: auto;
          border-bottom: 1px solid var(--sm-border, #333);
          -webkit-overflow-scrolling: touch;
        }

        .emoji-picker__category {
          padding: 4px 10px;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--sm-text-muted, #888);
          white-space: nowrap;
          transition: background 0.15s, color 0.15s;
        }

        .emoji-picker__category:hover,
        .emoji-picker__category--active {
          background: var(--sm-card-hover, #2a2a2a);
          color: var(--sm-text, #fff);
        }

        .emoji-picker__grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 2px;
          padding: 10px;
          overflow-y: auto;
          flex: 1;
        }

        .emoji-picker__emoji {
          width: 100%;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1.3rem;
          transition: transform 0.1s, background 0.15s;
        }

        .emoji-picker__emoji:hover {
          background: var(--sm-card-hover, #2a2a2a);
          transform: scale(1.15);
        }

        /* Light mode */
        :global(body.theme-light) .emoji-picker,
        :global(:root:not(.dark)) .emoji-picker {
          --bg-card: #fff;
          --border-subtle: #e5e7eb;
          --text-main: #111;
        }

        @media (max-width: 768px) {
          .emoji-picker__grid {
            grid-template-columns: repeat(6, 1fr);
          }

          .emoji-picker__emoji {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}
