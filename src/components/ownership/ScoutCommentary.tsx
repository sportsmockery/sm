'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'

interface ScoutCommentaryProps {
  teamSlug?: string // omit for all-teams overview
}

interface CommentaryData {
  commentary: string
  angle: number
  angle_name: string
  team?: string
}

const DATALAB_URL = 'https://datalab.sportsmockery.com'

function getCacheKey(teamSlug: string | undefined, angle: number) {
  return `scout_owner_${teamSlug || 'all'}_${angle}`
}

export default function ScoutCommentary({ teamSlug }: ScoutCommentaryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<CommentaryData | null>(null)
  const [displayedText, setDisplayedText] = useState('')
  const [isTalking, setIsTalking] = useState(false)
  const [currentAngle, setCurrentAngle] = useState(0)
  const animFrameRef = useRef<number | null>(null)
  const textRef = useRef<HTMLDivElement>(null)

  const fetchCommentary = useCallback(async (angle: number) => {
    // Check cache first
    const cacheKey = getCacheKey(teamSlug, angle)
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as CommentaryData
        setData(parsed)
        setCurrentAngle(angle)
        animateText(parsed.commentary)
        return
      } catch { /* cache miss */ }
    }

    setLoading(true)
    setDisplayedText('')
    setData(null)

    try {
      const params = new URLSearchParams()
      if (teamSlug) params.set('team', teamSlug)
      params.set('angle', String(angle))

      const res = await fetch(`${DATALAB_URL}/api/scout/owner-commentary?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')

      const json = await res.json()
      const result: CommentaryData = {
        commentary: json.commentary || json.data?.commentary || '',
        angle: json.angle ?? angle,
        angle_name: json.angle_name || json.data?.angle_name || '',
        team: json.team || teamSlug,
      }

      // Cache it
      sessionStorage.setItem(cacheKey, JSON.stringify(result))

      setData(result)
      setCurrentAngle(angle)
      animateText(result.commentary)
    } catch (err) {
      console.error('Scout commentary fetch failed:', err)
      setLoading(false)
      setData({
        commentary: 'Scout is warming up — commentary is loading. Hit "Another Take" to try again, or check back shortly.',
        angle,
        angle_name: '',
        team: teamSlug,
      })
      setDisplayedText('Scout is warming up — commentary is loading. Hit "Another Take" to try again, or check back shortly.')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamSlug])

  const animateText = useCallback((fullText: string) => {
    setLoading(false)
    setIsTalking(true)
    setDisplayedText('')

    let charIndex = 0
    const charsPerFrame = 3 // fast talking speed
    const intervalMs = 16 // ~60fps

    const tick = () => {
      charIndex += charsPerFrame
      if (charIndex >= fullText.length) {
        setDisplayedText(fullText)
        setIsTalking(false)
        return
      }
      setDisplayedText(fullText.slice(0, charIndex))
      animFrameRef.current = window.setTimeout(tick, intervalMs)
    }

    // Clear any existing animation
    if (animFrameRef.current) clearTimeout(animFrameRef.current)
    animFrameRef.current = window.setTimeout(tick, 300)
  }, [])

  // Auto-open on page load (runs once)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true)
      fetchCommentary(0)
    }, 1500)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) clearTimeout(animFrameRef.current)
    }
  }, [])

  // Auto-scroll as text appears
  useEffect(() => {
    if (textRef.current && isTalking) {
      textRef.current.scrollTop = textRef.current.scrollHeight
    }
  }, [displayedText, isTalking])

  const handleAnotherTake = () => {
    const nextAngle = (currentAngle + 1) % 3
    if (animFrameRef.current) clearTimeout(animFrameRef.current)
    setDisplayedText('')
    setIsTalking(false)
    fetchCommentary(nextAngle)
  }

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false)
      if (animFrameRef.current) clearTimeout(animFrameRef.current)
      setIsTalking(false)
    } else {
      setIsOpen(true)
      if (!data && !loading) {
        fetchCommentary(currentAngle)
      }
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    if (animFrameRef.current) clearTimeout(animFrameRef.current)
    setIsTalking(false)
  }

  // Skip to end
  const handleSkip = () => {
    if (animFrameRef.current) clearTimeout(animFrameRef.current)
    if (data) {
      setDisplayedText(data.commentary)
      setIsTalking(false)
    }
  }

  const paragraphs = displayedText.split('\n\n').filter(Boolean)

  return (
    <>
      {/* Scout Icon — fixed bottom right, hidden when bubble is open */}
      {!isOpen && (
      <button
        onClick={handleToggle}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 68,
          height: 68,
          borderRadius: '50%',
          border: '2px solid rgba(0,212,255,0.3)',
          backgroundColor: 'var(--sm-card)',
          cursor: 'pointer',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          animation: isTalking ? 'scout-bob 0.6s ease-in-out infinite' : 'none',
        }}
        aria-label="Scout Commentary"
      >
        <Image
          src="/downloads/scout-v2.png"
          alt="Scout AI"
          width={48}
          height={48}
          style={{
            borderRadius: '50%',
            objectFit: 'contain',
            animation: isTalking ? 'scout-talk 0.3s ease-in-out infinite alternate' : 'none',
          }}
        />
      </button>
      )}

      {/* Comment Bubble */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 102,
            right: 24,
            left: 24,
            maxWidth: 900,
            marginLeft: 'auto',
            marginRight: 'auto',
            maxHeight: '40vh',
            borderRadius: 16,
            backgroundColor: 'var(--sm-card)',
            border: '1px solid var(--sm-border)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
            zIndex: 9997,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          className="scout-commentary-bubble"
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--sm-border)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Image src="/downloads/scout-v2.png" alt="Scout" width={24} height={24} style={{ borderRadius: '50%' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sm-text)' }}>Scout</span>
              {data?.angle_name && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: 4,
                  backgroundColor: 'rgba(0,212,255,0.12)',
                  color: '#00D4FF',
                  lineHeight: 1,
                }}>
                  {data.angle_name}
                </span>
              )}
              {isTalking && (
                <span style={{ fontSize: 11, color: 'rgba(0,212,255,0.7)' }}>speaking...</span>
              )}
            </div>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--sm-text-muted)',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Body */}
          <div
            ref={textRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              fontSize: 13,
              color: 'var(--sm-text)',
              lineHeight: 1.65,
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(0,212,255,0.7)' }}>
                <span>Scout is reviewing the grades</span>
                <span className="scout-typing-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </div>
            ) : paragraphs.length > 0 ? (
              paragraphs.map((p, i) => (
                <p key={i} style={{ margin: i < paragraphs.length - 1 ? '0 0 12px' : 0 }}>
                  {p}
                </p>
              ))
            ) : null}
          </div>

          {/* Footer */}
          <div style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--sm-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            {isTalking ? (
              <button
                onClick={handleSkip}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--sm-text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                Skip to end
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleAnotherTake}
              disabled={loading}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#00D4FF',
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: 8,
                padding: '6px 14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                lineHeight: 1,
                transition: 'opacity 0.2s',
                opacity: loading ? 0.5 : 1,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" /></svg>
              Another Take
            </button>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes scout-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes scout-talk {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }
        .scout-typing-dots span {
          animation: scout-dot-blink 1.4s infinite;
          opacity: 0;
        }
        .scout-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .scout-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes scout-dot-blink {
          0%, 20% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        @media (max-width: 640px) {
          .scout-commentary-bubble {
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            max-width: 100% !important;
            border-radius: 16px 16px 0 0 !important;
            max-height: 50vh !important;
          }
        }
      `}</style>
    </>
  )
}
