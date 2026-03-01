'use client'

import { useState, useEffect } from 'react'

interface ArticleActionsProps {
  articleId: number | string
  articleUrl: string
  articleTitle: string
  className?: string
}

export default function ArticleActions({
  articleId,
  articleUrl,
  articleTitle,
  className = '',
}: ArticleActionsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [reaction, setReaction] = useState<string | null>(null)
  const [showReactions, setShowReactions] = useState(false)
  const [copied, setCopied] = useState(false)

  // Show/hide based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsVisible(scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load bookmark state from localStorage
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('sm_bookmarks') || '[]')
    setIsBookmarked(bookmarks.includes(String(articleId)))

    const reactions = JSON.parse(localStorage.getItem('sm_reactions') || '{}')
    setReaction(reactions[String(articleId)] || null)
  }, [articleId])

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('sm_bookmarks') || '[]')
    let newBookmarks: string[]

    if (isBookmarked) {
      newBookmarks = bookmarks.filter((id: string) => id !== String(articleId))
    } else {
      newBookmarks = [...bookmarks, String(articleId)]
    }

    localStorage.setItem('sm_bookmarks', JSON.stringify(newBookmarks))
    setIsBookmarked(!isBookmarked)
  }

  const handleReaction = (emoji: string) => {
    const reactions = JSON.parse(localStorage.getItem('sm_reactions') || '{}')

    if (reaction === emoji) {
      delete reactions[String(articleId)]
      setReaction(null)
    } else {
      reactions[String(articleId)] = emoji
      setReaction(emoji)
    }

    localStorage.setItem('sm_reactions', JSON.stringify(reactions))
    setShowReactions(false)
  }

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(articleUrl)
    const encodedTitle = encodeURIComponent(articleTitle)

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      copy: articleUrl,
    }

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(articleUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Fallback
        const input = document.createElement('input')
        input.value = articleUrl
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
  }

  const reactions_list = [
    { emoji: '\uD83D\uDD25', label: 'Fire' },
    { emoji: '\uD83D\uDE02', label: 'Laugh' },
    { emoji: '\uD83D\uDE22', label: 'Sad' },
    { emoji: '\uD83D\uDE21', label: 'Angry' },
  ]

  const actionBtnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--sm-text-muted)',
    transition: 'color 0.2s ease',
    padding: '4px',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "Barlow, sans-serif",
    fontSize: '10px',
    lineHeight: 1,
  }

  return (
    <div
      className={`article-actions-bar ${className}`}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease',
      }}
    >
      <div
        className="glass-card glass-card-sm"
        style={{
          borderRadius: '0',
          borderTop: '1px solid var(--sm-border)',
          borderBottom: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          background: 'var(--sm-surface)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '12px 16px',
        }}
      >
        <div
          style={{
            maxWidth: '512px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          {/* Share / Tweet */}
          <button
            onClick={() => handleShare('twitter')}
            style={actionBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1DA1F2' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--sm-text-muted)' }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span style={labelStyle}>Tweet</span>
          </button>

          {/* Facebook */}
          <button
            onClick={() => handleShare('facebook')}
            style={actionBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1877F2' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--sm-text-muted)' }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span style={labelStyle}>Share</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={() => handleShare('copy')}
            style={{
              ...actionBtnStyle,
              color: copied ? '#10b981' : 'var(--sm-text-muted)',
            }}
            onMouseEnter={(e) => { if (!copied) e.currentTarget.style.color = 'var(--sm-red)' }}
            onMouseLeave={(e) => { if (!copied) e.currentTarget.style.color = 'var(--sm-text-muted)' }}
          >
            {copied ? (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            )}
            <span style={labelStyle}>{copied ? 'Copied!' : 'Link'}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            style={{
              ...actionBtnStyle,
              color: isBookmarked ? 'var(--sm-red)' : 'var(--sm-text-muted)',
            }}
            onMouseEnter={(e) => { if (!isBookmarked) e.currentTarget.style.color = 'var(--sm-red)' }}
            onMouseLeave={(e) => { if (!isBookmarked) e.currentTarget.style.color = isBookmarked ? 'var(--sm-red)' : 'var(--sm-text-muted)' }}
          >
            <svg
              width="20"
              height="20"
              fill={isBookmarked ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
              />
            </svg>
            <span style={labelStyle}>{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>

          {/* React */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowReactions(!showReactions)}
              style={{
                ...actionBtnStyle,
                color: reaction ? 'var(--sm-red)' : 'var(--sm-text-muted)',
              }}
              onMouseEnter={(e) => { if (!reaction) e.currentTarget.style.color = 'var(--sm-red)' }}
              onMouseLeave={(e) => { if (!reaction) e.currentTarget.style.color = 'var(--sm-text-muted)' }}
            >
              <span style={{ fontSize: '20px', lineHeight: 1 }}>{reaction || '\u2764\uFE0F'}</span>
              <span style={labelStyle}>React</span>
            </button>

            {/* Reactions popup */}
            {showReactions && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '56px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '8px',
                  padding: '8px',
                  borderRadius: 'var(--sm-radius-pill)',
                  background: 'var(--sm-card)',
                  border: '1px solid var(--sm-border)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                }}
              >
                {reactions_list.map((r) => (
                  <button
                    key={r.emoji}
                    onClick={() => handleReaction(r.emoji)}
                    style={{
                      background: reaction === r.emoji ? 'var(--sm-surface)' : 'transparent',
                      border: 'none',
                      borderRadius: '50%',
                      padding: '4px',
                      fontSize: '24px',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                      lineHeight: 1,
                    }}
                    title={r.label}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.25)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile-only visibility */}
      <style>{`
        .article-actions-bar {
          display: block;
        }
        @media (min-width: 768px) {
          .article-actions-bar {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
