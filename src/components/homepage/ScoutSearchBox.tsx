'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

// Fire-and-forget Scout event tracking
function trackScoutEvent(event: 'open' | 'summary_viewed' | 'close', extra?: { duration_ms?: number; query?: string }) {
  try {
    let anonId = localStorage.getItem('sm-anon-id')
    if (!anonId) {
      anonId = crypto.randomUUID()
      localStorage.setItem('sm-anon-id', anonId)
    }
    const sessionId = localStorage.getItem('sm_session_id') || null

    fetch('/api/track-scout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anon_id: anonId,
        session_id: sessionId,
        user_id: (window as any).__sm_user_id || null,
        event,
        path: window.location.pathname,
        ...extra,
      }),
    }).catch(() => {}) // fire-and-forget
  } catch {} // ignore localStorage errors
}

const TEAM_LABELS: Record<string, string> = {
  bears: 'Bears', bulls: 'Bulls', blackhawks: 'Blackhawks', cubs: 'Cubs',
  whitesox: 'White Sox', 'white-sox': 'White Sox',
}
const TEAM_ORDER = ['bears', 'cubs', 'bulls', 'blackhawks', 'whitesox']

interface Bullet { team: string; text: string; articleUrl?: string | null }

export function ScoutSearchBox() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const { user, isAuthenticated } = useAuth()
  const hasTrackedOpen = useRef(false)
  const openTime = useRef<number | null>(null)

  // "What'd I Miss?" state
  const [missOpen, setMissOpen] = useState(false)
  const [missLoading, setMissLoading] = useState(false)
  const [missError, setMissError] = useState<string | null>(null)
  const [missBullets, setMissBullets] = useState<Bullet[]>([])
  const missFetchedRef = useRef(false)
  const missOverlayRef = useRef<HTMLDivElement>(null)
  const missOpenTime = useRef<number | null>(null)

  // Stash user_id on window for the tracking helper
  useEffect(() => {
    if (user?.id) (window as any).__sm_user_id = user.id
  }, [user?.id])

  // Track "close" on unmount with duration
  const handleClose = useCallback(() => {
    if (openTime.current) {
      trackScoutEvent('close', { duration_ms: Date.now() - openTime.current })
      openTime.current = null
    }
  }, [])

  useEffect(() => {
    return () => { handleClose() }
  }, [handleClose])

  const handleFocus = () => {
    if (!hasTrackedOpen.current) {
      hasTrackedOpen.current = true
      openTime.current = Date.now()
      trackScoutEvent('open')
    }
  }

  const handleBlur = () => {
    // Only fire close if there's no result showing (user left without querying)
    if (!result && openTime.current) {
      trackScoutEvent('close', { duration_ms: Date.now() - openTime.current })
      openTime.current = null
    }
  }

  const handleSearch = async () => {
    if (!query.trim() || loading) return

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      })
      const data = await res.json()
      setResult(data.response || 'No results found.')
      // Track successful summary view
      trackScoutEvent('summary_viewed', { query: query.trim() })
    } catch {
      setResult('Connection error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // "What'd I Miss?" handlers
  const handleMissOpen = useCallback(async () => {
    setMissOpen(true)
    missOpenTime.current = Date.now()
    trackScoutEvent('open')
    if (missFetchedRef.current) return
    setMissLoading(true)
    setMissError(null)
    try {
      const res = await fetch('/api/scout/since-last-visit', { method: 'POST' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.bullets?.length) {
        setMissBullets(data.bullets)
        trackScoutEvent('summary_viewed')
      } else {
        setMissBullets([])
        setMissError(data.message || 'No updates since your last visit.')
      }
      missFetchedRef.current = true
    } catch {
      setMissError("Scout couldn't load your catch-up. Try again in a bit.")
    } finally {
      setMissLoading(false)
    }
  }, [])

  const handleMissClose = useCallback(() => {
    setMissOpen(false)
    if (missOpenTime.current) {
      trackScoutEvent('close', { duration_ms: Date.now() - missOpenTime.current })
      missOpenTime.current = null
    }
  }, [])

  useEffect(() => {
    if (!missOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleMissClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [missOpen, handleMissClose])

  useEffect(() => {
    if (!missOpen) return
    const onClick = (e: MouseEvent) => {
      if (missOverlayRef.current && !missOverlayRef.current.contains(e.target as Node)) handleMissClose()
    }
    const timeout = setTimeout(() => document.addEventListener('mousedown', onClick), 100)
    return () => { clearTimeout(timeout); document.removeEventListener('mousedown', onClick) }
  }, [missOpen, handleMissClose])

  const groupedBullets = TEAM_ORDER
    .map(team => ({ team, label: TEAM_LABELS[team] || team, items: missBullets.filter(b => b.team === team || b.team === team.replace('whitesox', 'white-sox')) }))
    .filter(g => g.items.length > 0)
  const knownTeams = new Set(TEAM_ORDER.flatMap(t => [t, t.replace('whitesox', 'white-sox')]))
  const otherBullets = missBullets.filter(b => !knownTeams.has(b.team))
  if (otherBullets.length) groupedBullets.push({ team: 'sports', label: 'Chicago Sports', items: otherBullets })

  return (
    <div style={{ width: '100%', maxWidth: 700, margin: '0 auto' }}>
      {/* Search bar */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 20px',
          background: isDark ? 'rgba(10,10,10,0.8)' : 'rgba(245,245,245,0.9)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isDark ? 'rgba(188,0,0,0.3)' : 'rgba(188,0,0,0.15)'}`,
          borderRadius: 16,
          boxShadow: isDark ? '0 0 30px rgba(188,0,0,0.1)' : '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Progress bar overlay when loading */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 16,
              overflow: 'hidden',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(188,0,0,0.15) 40%, rgba(188,0,0,0.25) 60%, transparent 100%)',
                animation: 'scoutProgressSweep 1.5s ease-in-out infinite',
              }}
            />
          </div>
        )}

        {/* Scout icon with head wobble when loading */}
        <div style={{ flexShrink: 0, position: 'relative', zIndex: 2 }}>
          <Image
            src="/downloads/scout-v2.png"
            alt="Scout"
            width={24}
            height={24}
            style={{
              borderRadius: '50%',
              filter: 'drop-shadow(0 0 6px rgba(188,0,0,0.5)) drop-shadow(0 0 14px rgba(188,0,0,0.25))',
              animation: loading ? 'scoutHeadThink 0.6s ease-in-out infinite' : 'none',
            }}
          />
        </div>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Scout AI is a high-IQ Chicago sports engine, ask me anything..."
          style={{
            flex: 1,
            fontSize: 15,
            fontWeight: 500,
            color: isDark ? '#fff' : '#111',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            letterSpacing: '-0.01em',
            position: 'relative',
            zIndex: 2,
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="scout-search-btn"
          style={{
            padding: '9px 22px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            backgroundColor: '#bc0000',
            color: '#ffffff',
            border: 'none',
            borderRadius: 20,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
            fontFamily: 'inherit',
            flexShrink: 0,
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 0 0 0 rgba(188,0,0,0)',
            position: 'relative',
            zIndex: 2,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#e00000'
              e.currentTarget.style.transform = 'scale(1.06)'
              e.currentTarget.style.boxShadow = '0 0 16px rgba(188,0,0,0.4)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#bc0000'
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 0 0 0 rgba(188,0,0,0)'
          }}
          onMouseDown={(e) => {
            if (!loading) e.currentTarget.style.transform = 'scale(0.95)'
          }}
          onMouseUp={(e) => {
            if (!loading) e.currentTarget.style.transform = 'scale(1.06)'
          }}
        >
          {loading ? '...' : 'ASK SCOUT'}
        </button>
        {isAuthenticated && (
          <button
            onClick={handleMissOpen}
            type="button"
            style={{
              padding: '9px 18px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              backgroundColor: '#ffffff',
              color: '#bc0000',
              border: 'none',
              borderRadius: 20,
              cursor: 'pointer',
              fontFamily: 'inherit',
              flexShrink: 0,
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              zIndex: 2,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.06)'
              e.currentTarget.style.boxShadow = '0 0 16px rgba(188,0,0,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            WHAT&apos;D I MISS?
          </button>
        )}
      </div>

      {/* Search result */}
      {result && (
        <div
          style={{
            marginTop: 16,
            padding: 20,
            background: isDark ? 'rgba(10,10,10,0.6)' : 'rgba(245,245,245,0.8)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            borderRadius: 16,
            fontSize: 14,
            lineHeight: 1.6,
            color: isDark ? '#ddd' : '#333',
            maxHeight: 200,
            overflowY: 'auto' as const,
          }}
        >
          {result}
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <button
              onClick={() => router.push(`/scout-ai?q=${encodeURIComponent(query)}`)}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#bc0000',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
              }}
            >
              Continue in Scout AI &rarr;
            </button>
          </div>
        </div>
      )}

      {/* "What'd I Miss?" overlay */}
      {missOpen && (
        <div className="scout-since-backdrop">
          <div className="scout-concierge-overlay scout-since-overlay" ref={missOverlayRef}>
            <button className="scout-concierge-close" onClick={handleMissClose} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="scout-concierge-header">
              <Image src="/downloads/scout-v2.png" alt="Scout AI" width={28} height={28} unoptimized />
              <span className="scout-concierge-title">Since you were last here</span>
            </div>
            {missLoading && (
              <div className="scout-concierge-loading">
                <div className="scout-concierge-skeleton" />
                <div className="scout-concierge-skeleton scout-concierge-skeleton--short" />
                <div className="scout-concierge-skeleton scout-concierge-skeleton--mid" />
                <div className="scout-concierge-skeleton" />
                <div className="scout-concierge-skeleton scout-concierge-skeleton--short" />
              </div>
            )}
            {missError && !missLoading && (
              <p className="scout-concierge-error">{missError}</p>
            )}
            {!missLoading && !missError && groupedBullets.length > 0 && (
              <div className="scout-since-body">
                {groupedBullets.map(group => (
                  <div key={group.team} className="scout-since-team-group">
                    <span className="scout-since-team-label">{group.label}</span>
                    <ul className="scout-since-bullets">
                      {group.items.map((bullet, i) => (
                        <li key={i} className="scout-since-bullet">
                          {bullet.articleUrl ? (
                            <Link href={bullet.articleUrl} className="scout-since-bullet-link" onClick={handleMissClose}>
                              {bullet.text}
                            </Link>
                          ) : (
                            <span>{bullet.text}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
