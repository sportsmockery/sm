'use client'

import { useState, useCallback } from 'react'

interface SocialShareBarProps {
  url: string
  title: string
}

export default function SocialShareBar({ url, title }: SocialShareBarProps) {
  const [copiedFrom, setCopiedFrom] = useState<'instagram' | 'tiktok' | null>(null)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const handleCopy = useCallback(async (platform: 'instagram' | 'tiktok') => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedFrom(platform)
      setTimeout(() => setCopiedFrom(null), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = url
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedFrom(platform)
      setTimeout(() => setCopiedFrom(null), 2000)
    }
  }, [url])

  const platforms = [
    {
      key: 'facebook' as const,
      label: 'Share on Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      brandColor: '#1877F2',
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      key: 'x' as const,
      label: 'Share on X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      brandColor: 'var(--sm-text)',
      icon: (
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      key: 'instagram' as const,
      label: 'Copy link for Instagram',
      brandColor: '#E4405F',
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
    {
      key: 'tiktok' as const,
      label: 'Copy link for TikTok',
      brandColor: '#00f2ea',
      icon: (
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.28 6.28 0 00-6.28 6.28 6.28 6.28 0 006.28 6.28 6.28 6.28 0 006.28-6.28V8.69a8.2 8.2 0 004.82 1.56V6.82a4.84 4.84 0 01-1-.13z" />
        </svg>
      ),
    },
  ]

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: -24,
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 24px',
          borderRadius: 9999,
          backgroundColor: 'color-mix(in srgb, var(--sm-surface) 85%, transparent)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          border: '1px solid color-mix(in srgb, var(--sm-border) 50%, transparent)',
        }}
      >
        {platforms.map((platform) => {
          const isLink = platform.key === 'facebook' || platform.key === 'x'
          const isCopied = copiedFrom === platform.key

          const buttonStyle: React.CSSProperties = {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: 'var(--sm-surface)',
            color: 'var(--sm-text-muted)',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, color 0.2s ease, background-color 0.2s ease',
            textDecoration: 'none',
          }

          const content = (
            <>
              {platform.icon}
              {isCopied && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: -28,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#fff',
                    backgroundColor: '#333',
                    padding: '3px 8px',
                    borderRadius: 6,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    animation: 'fadeInUp 0.2s ease',
                  }}
                >
                  Copied!
                </span>
              )}
              <style>{`
                .sm-share-btn:hover {
                  transform: scale(1.15) !important;
                  color: ${platform.brandColor} !important;
                }
                @keyframes fadeInUp {
                  from { opacity: 0; transform: translateX(-50%) translateY(4px); }
                  to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
              `}</style>
            </>
          )

          if (isLink) {
            return (
              <a
                key={platform.key}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform.label}
                className="sm-share-btn"
                style={buttonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.15)'
                  e.currentTarget.style.color = platform.brandColor
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.color = 'var(--sm-text-muted)'
                }}
              >
                {platform.icon}
              </a>
            )
          }

          return (
            <button
              key={platform.key}
              onClick={() => handleCopy(platform.key as 'instagram' | 'tiktok')}
              aria-label={platform.label}
              style={buttonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)'
                e.currentTarget.style.color = platform.brandColor
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.color = 'var(--sm-text-muted)'
              }}
            >
              {platform.icon}
              {isCopied && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: -28,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#fff',
                    backgroundColor: '#333',
                    padding: '3px 8px',
                    borderRadius: 6,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                  }}
                >
                  Copied!
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
