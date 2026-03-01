'use client'

import { useState, useEffect } from 'react'

interface CommentSectionProps {
  articleId: number | string
  articleUrl: string
  articleTitle: string
  disqusShortname?: string
  className?: string
}

/**
 * Disqus Comment Section
 *
 * Embeds Disqus comments on article pages.
 * Free tier placeholder - will migrate to paid plan when going live.
 *
 * Setup:
 * 1. Create a Disqus site at https://disqus.com/admin/create/
 * 2. Use shortname: "sportsmockery" (or your chosen name)
 * 3. Add NEXT_PUBLIC_DISQUS_SHORTNAME to .env
 */
export default function CommentSection({
  articleId,
  articleUrl,
  articleTitle,
  disqusShortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME || 'sportsmockery',
  className = '',
}: CommentSectionProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Skip if no shortname configured
    if (!disqusShortname) return

    // Reset Disqus if page/article changes
    const disqusConfig = function(this: { page: { url: string; identifier: string; title: string } }) {
      this.page.url = articleUrl
      this.page.identifier = String(articleId)
      this.page.title = articleTitle
    }

    // If DISQUS is already loaded, reset it
    if (window.DISQUS) {
      window.DISQUS.reset({
        reload: true,
        config: disqusConfig,
      })
      setIsLoaded(true)
      return
    }

    // Set config before loading script
    window.disqus_config = disqusConfig

    // Load Disqus script
    const script = document.createElement('script')
    script.src = `https://${disqusShortname}.disqus.com/embed.js`
    script.setAttribute('data-timestamp', String(+new Date()))
    script.async = true

    script.onload = () => {
      setIsLoaded(true)
    }

    document.body.appendChild(script)

    return () => {
      // Cleanup on unmount (optional)
    }
  }, [articleId, articleUrl, articleTitle, disqusShortname])

  return (
    <section
      className={`glass-card glass-card-static ${className}`}
      style={{
        padding: '28px',
        marginTop: '32px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: "Barlow, sans-serif",
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--sm-text)',
            margin: 0,
          }}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="var(--sm-red)"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
          Comments
        </h2>
        <p
          style={{
            fontFamily: "Barlow, sans-serif",
            fontSize: '14px',
            color: 'var(--sm-text-muted)',
            marginTop: '6px',
          }}
        >
          Join the discussion below. Keep it civil and focused on the content.
        </p>
      </div>

      {/* Disqus Thread Container */}
      <div
        id="disqus_thread"
        style={{
          minHeight: '200px',
          borderRadius: 'var(--sm-radius-md)',
          padding: '16px',
          background: 'var(--sm-surface)',
          border: '1px solid var(--sm-border)',
        }}
      >
        {!isLoaded && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 0',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '2px solid var(--sm-red)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                marginBottom: '16px',
                animation: 'spin 1s linear infinite',
              }}
            />
            <p style={{ fontFamily: "Barlow, sans-serif", fontSize: '14px', color: 'var(--sm-text-muted)' }}>
              Loading comments...
            </p>
          </div>
        )}
      </div>

      {/* Disqus noscript fallback */}
      <noscript>
        <p style={{ color: 'var(--sm-text-muted)', textAlign: 'center', marginTop: '16px', fontFamily: "Barlow, sans-serif", fontSize: '14px' }}>
          Please enable JavaScript to view the{' '}
          <a href="https://disqus.com/?ref_noscript" style={{ color: 'var(--sm-red)' }}>
            comments powered by Disqus.
          </a>
        </p>
      </noscript>

      {/* Spinner keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  )
}

// TypeScript declarations for Disqus globals
declare global {
  interface Window {
    DISQUS?: {
      reset: (config: { reload: boolean; config: () => void }) => void
    }
    disqus_config?: () => void
  }
}
