// src/components/homepage/ScoutSinceLastVisit.tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

const TEAM_LABELS: Record<string, string> = {
  bears: 'Bears',
  bulls: 'Bulls',
  blackhawks: 'Blackhawks',
  cubs: 'Cubs',
  whitesox: 'White Sox',
  'white-sox': 'White Sox',
}

const TEAM_ORDER = ['bears', 'cubs', 'bulls', 'blackhawks', 'whitesox']

interface Bullet {
  team: string
  text: string
  articleUrl?: string | null
}

// Fire-and-forget tracking (reuses existing /api/track-scout endpoint)
function trackEvent(event: 'open' | 'summary_viewed' | 'close', extra?: Record<string, unknown>) {
  try {
    const anonId = localStorage.getItem('sm-anon-id') || ''
    const sessionId = localStorage.getItem('sm_session_id') || null
    fetch('/api/track-scout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anon_id: anonId,
        session_id: sessionId,
        user_id: (window as any).__sm_user_id || null,
        event,
        path: '/',
        team_slug: 'homepage_since_last_visit',
        ...extra,
      }),
    }).catch(() => {})
  } catch {}
}

export function ScoutSinceLastVisit() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bullets, setBullets] = useState<Bullet[]>([])
  const openTimeRef = useRef<number | null>(null)
  const fetchedRef = useRef(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleOpen = useCallback(async () => {
    setIsOpen(true)
    openTimeRef.current = Date.now()
    trackEvent('open')

    // Don't refetch if we already have data
    if (fetchedRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/scout/since-last-visit', { method: 'POST' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      if (data.bullets?.length) {
        setBullets(data.bullets)
        trackEvent('summary_viewed')
      } else {
        setBullets([])
        setError(data.message || 'No updates since your last visit.')
      }
      fetchedRef.current = true
    } catch {
      setError("Scout couldn't load your catch-up. Try again in a bit.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    if (openTimeRef.current) {
      trackEvent('close', { duration_ms: Date.now() - openTimeRef.current })
      openTimeRef.current = null
    }
  }, [])

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, handleClose])

  // Close on click outside overlay
  useEffect(() => {
    if (!isOpen) return
    const onClick = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }
    // Delay to avoid closing on the same click that opened
    const timeout = setTimeout(() => document.addEventListener('mousedown', onClick), 100)
    return () => {
      clearTimeout(timeout)
      document.removeEventListener('mousedown', onClick)
    }
  }, [isOpen, handleClose])

  // Group bullets by team in display order
  const groupedBullets = TEAM_ORDER
    .map(team => ({
      team,
      label: TEAM_LABELS[team] || team,
      items: bullets.filter(b => b.team === team || b.team === team.replace('whitesox', 'white-sox')),
    }))
    .filter(g => g.items.length > 0)

  // Also capture any bullets with unknown/other team
  const knownTeams = new Set(TEAM_ORDER.flatMap(t => [t, t.replace('whitesox', 'white-sox')]))
  const otherBullets = bullets.filter(b => !knownTeams.has(b.team))
  if (otherBullets.length) {
    groupedBullets.push({ team: 'sports', label: 'Chicago Sports', items: otherBullets })
  }

  if (!user) return null

  return (
    <>
      {/* CTA Button */}
      <button
        className="scout-since-cta"
        onClick={handleOpen}
        type="button"
      >
        Scout my Chicago since I was last here
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="scout-since-backdrop">
          <div className="scout-concierge-overlay scout-since-overlay" ref={overlayRef}>
            {/* Close button */}
            <button className="scout-concierge-close" onClick={handleClose} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="scout-concierge-header">
              <Image src="/downloads/scout-v2.png" alt="Scout AI" width={28} height={28} unoptimized />
              <span className="scout-concierge-title">Since you were last here</span>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="scout-concierge-loading">
                <div className="scout-concierge-skeleton" />
                <div className="scout-concierge-skeleton scout-concierge-skeleton--short" />
                <div className="scout-concierge-skeleton scout-concierge-skeleton--mid" />
                <div className="scout-concierge-skeleton" />
                <div className="scout-concierge-skeleton scout-concierge-skeleton--short" />
              </div>
            )}

            {/* Error */}
            {error && !isLoading && (
              <p className="scout-concierge-error">{error}</p>
            )}

            {/* Bullets grouped by team */}
            {!isLoading && !error && groupedBullets.length > 0 && (
              <div className="scout-since-body">
                {groupedBullets.map(group => (
                  <div key={group.team} className="scout-since-team-group">
                    <span className="scout-since-team-label">{group.label}</span>
                    <ul className="scout-since-bullets">
                      {group.items.map((bullet, i) => (
                        <li key={i} className="scout-since-bullet">
                          {bullet.articleUrl ? (
                            <Link href={bullet.articleUrl} className="scout-since-bullet-link" onClick={handleClose}>
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
    </>
  )
}
