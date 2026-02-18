'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChatContext } from '@/contexts/ChatContext'
import EmojiPicker from './EmojiPicker'
import GifPicker from './GifPicker'
import MentionTypeahead, { MentionUser } from './MentionTypeahead'

interface ChatInputProps {
  onSend?: () => void
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const { sendMessage, isAuthenticated, error, currentRoom, roomParticipants } = useChatContext()
  const [content, setContent] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showGif, setShowGif] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Mention state
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [mentionIndex, setMentionIndex] = useState(0)
  const [mentionStartPos, setMentionStartPos] = useState<number | null>(null)

  const maxLength = 1000
  const showCharCount = content.length > 800

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [content])

  // Filter participants for mention suggestions
  const mentionUsers: MentionUser[] = (roomParticipants || [])
    .filter(p => p.display_name.toLowerCase().includes(mentionSearch.toLowerCase()))
    .slice(0, 8)

  // Reset mention index when search changes
  useEffect(() => {
    setMentionIndex(0)
  }, [mentionSearch])

  // Detect @ mentions while typing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value.slice(0, maxLength)
    setContent(newValue)

    const cursorPos = e.target.selectionStart || 0
    const textBeforeCursor = newValue.slice(0, cursorPos)

    // Find the last @ symbol that could be a mention trigger
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')

    if (lastAtIndex !== -1) {
      // Check if this @ is at start or after a space (valid mention trigger)
      const charBefore = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' '

      if (charBefore === ' ' || charBefore === '\n' || lastAtIndex === 0) {
        const searchText = textBeforeCursor.slice(lastAtIndex + 1)

        // Only show if no space after @ (still typing username)
        if (!searchText.includes(' ')) {
          setShowMentions(true)
          setMentionSearch(searchText)
          setMentionStartPos(lastAtIndex)
          return
        }
      }
    }

    // Hide mention typeahead if no valid @ trigger
    setShowMentions(false)
    setMentionSearch('')
    setMentionStartPos(null)
  }, [])

  // Handle mention selection
  const handleMentionSelect = useCallback((user: MentionUser) => {
    if (mentionStartPos === null) return

    // Replace @search with @username
    const before = content.slice(0, mentionStartPos)
    const after = content.slice(mentionStartPos + 1 + mentionSearch.length)
    const newContent = `${before}@${user.display_name} ${after}`

    setContent(newContent)
    setShowMentions(false)
    setMentionSearch('')
    setMentionStartPos(null)

    // Focus and move cursor after the mention
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const newPos = mentionStartPos + user.display_name.length + 2 // +2 for @ and space
        textareaRef.current.setSelectionRange(newPos, newPos)
      }
    }, 0)
  }, [content, mentionStartPos, mentionSearch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSending) return

    // Close mentions if open
    setShowMentions(false)

    setIsSending(true)
    setLocalError(null)

    try {
      await sendMessage(content.trim())
      setContent('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      onSend?.()
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle mention navigation
    if (showMentions && mentionUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMentionIndex(prev => (prev + 1) % mentionUsers.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setMentionIndex(prev => (prev - 1 + mentionUsers.length) % mentionUsers.length)
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        handleMentionSelect(mentionUsers[mentionIndex])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowMentions(false)
        return
      }
    }

    // Regular submit on Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setContent(prev => prev + emoji)
    setShowEmoji(false)
    textareaRef.current?.focus()
  }

  const handleGifSelect = async (gifUrl: string) => {
    setShowGif(false)
    setIsSending(true)
    try {
      await sendMessage(gifUrl, 'gif', gifUrl)
      onSend?.()
    } catch (err) {
      setLocalError('Failed to send GIF')
    } finally {
      setIsSending(false)
    }
  }

  const displayError = localError || error

  if (!isAuthenticated) {
    return (
      <div className="chat-input chat-input--auth">
        <p className="chat-input__auth-text">
          <a href="/login" className="chat-input__auth-link">Sign in</a> to join the conversation
        </p>

        <style jsx>{`
          .chat-input--auth {
            padding: 16px;
            text-align: center;
            border-top: 1px solid var(--sm-border, #333);
            background: var(--sm-card, #1a1a2e);
          }

          .chat-input__auth-text {
            margin: 0;
            font-size: 0.9rem;
            color: var(--sm-text-muted, #888);
          }

          .chat-input__auth-link {
            color: var(--accent, #3b82f6);
            text-decoration: none;
            font-weight: 600;
          }

          .chat-input__auth-link:hover {
            text-decoration: underline;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="chat-input">
      {displayError && (
        <div className="chat-input__error">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="chat-input__form">
        <div className="chat-input__actions">
          <button
            type="button"
            className={`chat-input__btn ${showEmoji ? 'chat-input__btn--active' : ''}`}
            onClick={() => { setShowEmoji(!showEmoji); setShowGif(false) }}
            title="Emoji"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>
          <button
            type="button"
            className={`chat-input__btn ${showGif ? 'chat-input__btn--active' : ''}`}
            onClick={() => { setShowGif(!showGif); setShowEmoji(false) }}
            title="GIF"
          >
            <span className="chat-input__gif-label">GIF</span>
          </button>
        </div>

        <div className="chat-input__field-wrap">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... Use @ to tag fans"
            className="chat-input__field"
            rows={1}
            disabled={isSending}
          />
          {showCharCount && (
            <span className={`chat-input__char-count ${content.length >= maxLength ? 'chat-input__char-count--limit' : ''}`}>
              {content.length}/{maxLength}
            </span>
          )}

          {/* Mention Typeahead */}
          {showMentions && mentionUsers.length > 0 && (
            <MentionTypeahead
              users={mentionUsers}
              searchTerm={mentionSearch}
              selectedIndex={mentionIndex}
              onSelect={handleMentionSelect}
              position={{ top: 0, left: 0 }}
            />
          )}
        </div>

        <button
          type="submit"
          className="chat-input__send"
          disabled={!content.trim() || isSending}
          title="Send"
        >
          {isSending ? (
            <span className="chat-input__spinner" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </form>

      {showEmoji && (
        <div className="chat-input__picker">
          <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />
        </div>
      )}

      {showGif && (
        <div className="chat-input__picker">
          <GifPicker onSelect={handleGifSelect} onClose={() => setShowGif(false)} />
        </div>
      )}

      <style jsx>{`
        .chat-input {
          padding: 12px;
          border-top: 1px solid var(--sm-border, #333);
          background: var(--sm-card, #1a1a2e);
          position: relative;
        }

        .chat-input__error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          margin-bottom: 10px;
        }

        .chat-input__form {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }

        .chat-input__actions {
          display: flex;
          gap: 2px;
        }

        .chat-input__btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: var(--sm-text-muted, #888);
          transition: background 0.15s, color 0.15s;
        }

        .chat-input__btn:hover,
        .chat-input__btn--active {
          background: var(--sm-card-hover, #2a2a2a);
          color: var(--sm-text, #fff);
        }

        .chat-input__gif-label {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 4px;
          border: 1px solid currentColor;
          border-radius: 3px;
        }

        .chat-input__field-wrap {
          flex: 1;
          position: relative;
        }

        .chat-input__field {
          width: 100%;
          padding: 10px 14px;
          background: var(--sm-surface, #111);
          border: 1px solid var(--sm-border, #333);
          border-radius: 20px;
          color: var(--sm-text, #fff);
          font-size: 0.9rem;
          line-height: 1.4;
          resize: none;
          outline: none;
          transition: border-color 0.15s;
        }

        .chat-input__field:focus {
          border-color: var(--accent, #3b82f6);
        }

        .chat-input__field::placeholder {
          color: var(--sm-text-muted, #888);
        }

        .chat-input__char-count {
          position: absolute;
          bottom: 8px;
          right: 12px;
          font-size: 0.7rem;
          color: var(--sm-text-muted, #888);
        }

        .chat-input__char-count--limit {
          color: #ef4444;
        }

        .chat-input__send {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent, #3b82f6);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          color: white;
          transition: background 0.15s, transform 0.15s;
        }

        .chat-input__send:hover:not(:disabled) {
          background: var(--accent-hover, #2563eb);
          transform: scale(1.05);
        }

        .chat-input__send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .chat-input__spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .chat-input__picker {
          position: absolute;
          bottom: 100%;
          left: 0;
          right: 0;
          margin-bottom: 8px;
          z-index: 100;
        }

        /* Light mode */
        :global(body.theme-light) .chat-input,
        :global(:root:not(.dark)) .chat-input {
          --bg-card: #fff;
          --border-subtle: #e5e7eb;
        }

        :global(body.theme-light) .chat-input__field,
        :global(:root:not(.dark)) .chat-input__field {
          --bg-subtle: #f9fafb;
          --text-main: #111;
        }

        @media (max-width: 768px) {
          .chat-input {
            padding: 10px;
          }

          .chat-input__btn {
            width: 32px;
            height: 32px;
          }

          .chat-input__field {
            padding: 8px 12px;
            font-size: 16px; /* Prevent iOS zoom */
          }

          .chat-input__send {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </div>
  )
}
