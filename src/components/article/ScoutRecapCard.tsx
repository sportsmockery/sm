'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface ScoutRecapCardProps {
  slug: string
  title: string
  excerpt?: string | null
}

const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export default function ScoutRecapCard({ slug, title, excerpt }: ScoutRecapCardProps) {
  const [recap, setRecap] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const cacheKey = `scout-recap-${slug}`

    // Check localStorage cache
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const { text, ts } = JSON.parse(cached)
        if (Date.now() - ts < CACHE_TTL) {
          setRecap(text)
          setLoading(false)
          return
        }
      }
    } catch {
      // Ignore cache errors
    }

    const controller = new AbortController()

    async function fetchRecap() {
      try {
        const res = await fetch('/api/ask-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `Give a 1-2 sentence TL;DR recap of this article: "${title}". ${excerpt ? `Context: ${excerpt}` : ''}. Be concise and direct.`,
          }),
          signal: controller.signal,
        })

        if (!res.ok) {
          setFailed(true)
          setLoading(false)
          return
        }

        const data = await res.json()
        const text = data.response || data.answer || ''

        if (text) {
          setRecap(text)
          try {
            localStorage.setItem(cacheKey, JSON.stringify({ text, ts: Date.now() }))
          } catch {
            // Ignore storage errors
          }
        } else {
          setFailed(true)
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setFailed(true)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRecap()
    return () => controller.abort()
  }, [slug, title, excerpt])

  // Don't render if failed
  if (failed && !recap) return null

  return (
    <div className="article-glass-card-sm">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Image
          src="/downloads/scout-v2.png"
          alt="Scout AI"
          width={24}
          height={24}
          style={{ borderRadius: '50%' }}
        />
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--sm-text)',
          fontFamily: "'Montserrat', sans-serif",
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Scout Recap
        </span>
      </div>

      {/* Body */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ height: 14, borderRadius: 8, background: 'var(--sm-surface)', width: '100%', animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: 14, borderRadius: 8, background: 'var(--sm-surface)', width: '70%', animation: 'pulse 1.5s infinite' }} />
        </div>
      ) : (
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--sm-text-muted)', margin: 0 }}>
          {recap}
        </p>
      )}

      {/* Ask Scout more */}
      <Link
        href="/scout-ai"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 12,
          fontSize: 12,
          fontWeight: 600,
          color: '#bc0000',
          textDecoration: 'none',
          transition: 'opacity 0.2s',
        }}
      >
        Ask Scout more
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}
