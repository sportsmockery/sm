'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface ScoutRecapCardProps {
  postId: number
  slug: string
  title: string
  content?: string | null
  excerpt?: string | null
  team?: string | null
}

const CACHE_TTL = 60 * 60 * 1000 // 1 hour

/** Strip URLs (markdown links keep their label, bare URLs removed) */
function stripUrls(s: string): string {
  // Convert markdown links [text](url) to just text
  let out = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  // Remove bare URLs
  out = out.replace(/https?:\/\/[^\s),]+/g, '')
  // Clean up leftover artifacts (double spaces, trailing punctuation oddities)
  return out.replace(/\s{2,}/g, ' ').trim()
}

/** Parse AI response into exactly 3 bullet points. Handles bullet markers, numbered lists, or plain paragraph. */
function parseBullets(text: string): string {
  if (!text) return ''

  // First try: split on bullet/number markers or newlines
  const lines = text
    .split(/\n/)
    .map(l => l.replace(/^[\s]*[-•*]\s*/, '').replace(/^\d+[.)]\s*/, '').trim())
    .map(l => stripUrls(l))
    .filter(l => l.length > 0)

  if (lines.length >= 3) return lines.slice(0, 3).join('\n')

  // Fallback: split a single paragraph into sentences and take 3
  const sentences = text
    .replace(/([.!?])\s+/g, '$1\n')
    .split('\n')
    .map(s => stripUrls(s.trim()))
    .filter(s => s.length > 10)

  if (sentences.length >= 3) return sentences.slice(0, 3).join('\n')

  // Last resort: split long text into ~3 roughly equal chunks by sentence boundaries
  const allSentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  const chunkSize = Math.ceil(allSentences.length / 3)
  const chunks: string[] = []
  for (let i = 0; i < allSentences.length && chunks.length < 3; i += chunkSize) {
    chunks.push(stripUrls(allSentences.slice(i, i + chunkSize).join(' ').trim()))
  }
  return chunks.join('\n')
}

export default function ScoutRecapCard({ postId, slug, title, content, excerpt, team }: ScoutRecapCardProps) {
  const [recap, setRecap] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const { user } = useAuth()

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
        const payload: Record<string, unknown> = {
          postId,
          postTitle: title,
          content: content || undefined,
          excerpt: excerpt || undefined,
          team: team || undefined,
        }
        if (user?.name) {
          payload.username = user.name
        }

        const res = await fetch('/api/scout/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })

        if (!res.ok) {
          setFailed(true)
          setLoading(false)
          return
        }

        const data = await res.json()
        const raw = data.summary || data.response || data.answer || ''

        // Extract up to 3 bullet points from the response
        const text = parseBullets(raw)

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
  }, [slug, title, content, excerpt, team, postId, user?.name])

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
         
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Scout Recap
        </span>
      </div>

      {/* Body — 3 bullet points */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ height: 14, borderRadius: 8, background: 'var(--sm-surface)', width: '100%', animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: 14, borderRadius: 8, background: 'var(--sm-surface)', width: '85%', animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: 14, borderRadius: 8, background: 'var(--sm-surface)', width: '70%', animation: 'pulse 1.5s infinite' }} />
        </div>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 18, listStyleType: 'disc' }}>
          {recap?.split('\n').map((point, i) => (
            <li key={i} style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--sm-text-muted)', marginBottom: i < 2 ? 4 : 0 }}>
              {point}
            </li>
          ))}
        </ul>
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
