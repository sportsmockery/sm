'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'

interface ScoutCommentaryProps {
  teamSlug?: string
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
  const [isSpeaking, setIsSpeaking] = useState(false)
  const animFrameRef = useRef<number | null>(null)
  const textRef = useRef<HTMLDivElement>(null)

  const fetchCommentary = useCallback(async (angle: number) => {
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

      sessionStorage.setItem(cacheKey, JSON.stringify(result))
      setData(result)
      setCurrentAngle(angle)
      animateText(result.commentary)
    } catch (err) {
      console.error('Scout commentary fetch failed:', err)
      setLoading(false)
      const fallback = 'Scout is warming up — commentary is loading. Hit "Another Take" to try again, or check back shortly.'
      setData({ commentary: fallback, angle, angle_name: '', team: teamSlug })
      setDisplayedText(fallback)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamSlug])

  const animateText = useCallback((fullText: string) => {
    setLoading(false)
    setIsTalking(true)
    setDisplayedText('')

    let charIndex = 0
    const charsPerFrame = 2
    const intervalMs = 22

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

    if (animFrameRef.current) clearTimeout(animFrameRef.current)
    animFrameRef.current = window.setTimeout(tick, 300)
  }, [])

  // Auto-open on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true)
      fetchCommentary(0)
    }, 1500)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      if (animFrameRef.current) clearTimeout(animFrameRef.current)
    }
  }, [])

  useEffect(() => {
    if (textRef.current && isTalking) {
      textRef.current.scrollTop = textRef.current.scrollHeight
    }
  }, [displayedText, isTalking])

  const handleAnotherTake = () => {
    const nextAngle = (currentAngle + 1) % 3
    if (animFrameRef.current) clearTimeout(animFrameRef.current)
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
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
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsTalking(false)
  }

  const handleSkip = () => {
    if (animFrameRef.current) clearTimeout(animFrameRef.current)
    if (data) {
      setDisplayedText(data.commentary)
      setIsTalking(false)
    }
  }

  const handleSpeak = () => {
    if (!data?.commentary) return
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(data.commentary)
    utterance.rate = 1.05
    utterance.pitch = 0.95
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const paragraphs = displayedText.split('\n\n').filter(Boolean)

  return (
    <>
      {/* Scout icon — always visible, 96px, fixed bottom right */}
      <button
        onClick={handleToggle}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 96,
          height: 96,
          borderRadius: '50%',
          border: '3px solid rgba(0,212,255,0.3)',
          backgroundColor: 'var(--sm-card)',
          cursor: 'pointer',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          animation: isTalking ? 'scout-bob 0.6s ease-in-out infinite' : 'none',
        }}
        aria-label="Scout Commentary"
      >
        <Image
          src="/downloads/scout-v2.png"
          alt="Scout AI"
          width={72}
          height={72}
          style={{
            borderRadius: '50%',
            objectFit: 'contain',
            animation: isTalking ? 'scout-talk 0.4s ease-in-out infinite alternate' : 'none',
          }}
        />
      </button>

      {/* Speech bubble — appears to the left of Scout's mouth */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 40,
            right: 126,
            width: 380,
            maxHeight: '50vh',
            borderRadius: '16px 16px 0 16px',
            backgroundColor: 'var(--sm-card)',
            border: '1px solid var(--sm-border)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
            zIndex: 9998,
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
            padding: '10px 14px',
            borderBottom: '1px solid var(--sm-border)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--sm-text)' }}>Scout</span>
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
                <span style={{ fontSize: 11, color: '#00D4FF', fontWeight: 500 }}>speaking...</span>
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
              padding: '14px',
              fontSize: 13,
              color: 'var(--sm-text)',
              lineHeight: 1.65,
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#00D4FF' }}>
                <span>Scout is reviewing the grades</span>
                <span className="scout-typing-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </div>
            ) : paragraphs.length > 0 ? (
              paragraphs.map((p, i) => (
                <p key={i} style={{ margin: i < paragraphs.length - 1 ? '0 0 10px' : 0 }}>
                  {p}
                </p>
              ))
            ) : null}
          </div>

          {/* Footer */}
          <div style={{
            padding: '8px 14px',
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
                opacity: loading ? 0.5 : 1,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" /></svg>
              Another Take
            </button>
            <button
              onClick={handleSpeak}
              disabled={loading || !data?.commentary}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: isSpeaking ? '#BC0000' : 'var(--sm-text-muted)',
                background: isSpeaking ? 'rgba(188,0,0,0.1)' : 'var(--sm-surface)',
                border: `1px solid ${isSpeaking ? 'rgba(188,0,0,0.2)' : 'var(--sm-border)'}`,
                borderRadius: 8,
                padding: '6px 14px',
                cursor: loading || !data?.commentary ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                lineHeight: 1,
                opacity: loading || !data?.commentary ? 0.5 : 1,
              }}
            >
              {isSpeaking ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                  Stop
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" /></svg>
                  Listen
                </>
              )}
            </button>
          </div>

          {/* Speech bubble tail pointing to Scout */}
          <div style={{
            position: 'absolute',
            bottom: 12,
            right: -8,
            width: 0,
            height: 0,
            borderLeft: '8px solid var(--sm-card)',
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
          }} />
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes scout-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes scout-talk {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.06) rotate(1deg); }
          100% { transform: scale(1) rotate(-1deg); }
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
            right: 12px !important;
            left: 12px !important;
            width: auto !important;
            bottom: 126px !important;
            border-radius: 16px !important;
            max-height: 45vh !important;
          }
        }
      `}</style>
    </>
  )
}
