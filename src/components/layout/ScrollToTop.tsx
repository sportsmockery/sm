'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const GREETINGS = [
  "Yo! What's good, Chicago? What can Scout dig up for you?",
  "Da Scout is here! What do you need to know about our teams?",
  "Hey fellow fan! Ask me anything about the Bears, Bulls, Hawks, Cubs, or Sox.",
  "What's up! Ready to talk Chicago sports — what's on your mind?",
  "Scout's on the clock! What Chicago sports intel do you need?",
]

export default function ScrollToTop() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [animating, setAnimating] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [hasHeroScoutBox, setHasHeroScoutBox] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Detect hero Scout box presence & control visibility
  useEffect(() => {
    const scoutBox = document.querySelector('.animate-entrance.entrance-delay-5')
    const heroPresent = !!scoutBox

    setHasHeroScoutBox(heroPresent)

    if (!heroPresent) {
      // No hero Scout box — visible immediately
      setVisible(true)
      return
    }

    // Hero Scout box exists — show only after scrolling past it
    const check = () => {
      if (scoutBox) {
        const rect = scoutBox.getBoundingClientRect()
        setVisible(rect.bottom < 0)
      }
    }
    window.addEventListener('scroll', check, { passive: true })
    check()
    return () => window.removeEventListener('scroll', check)
  }, [])

  // Focus input when expanded
  useEffect(() => {
    if (expanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 350)
    }
  }, [expanded])

  // Close on outside click
  useEffect(() => {
    if (!expanded) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [expanded])

  // Close on Escape
  useEffect(() => {
    if (!expanded) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [expanded])

  const handleOrbClick = () => {
    if (animating) return
    if (!expanded) {
      // Pick a random greeting
      setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)])
      setExpanded(true)
    } else {
      setExpanded(false)
    }
  }

  const handleSubmit = () => {
    if (!query.trim() || animating) return
    setAnimating(true)
    setTimeout(() => {
      router.push(`/scout-ai?q=${encodeURIComponent(query.trim())}`)
    }, 2000)
  }

  if (!visible) return null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1050,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 10,
      }}
    >
      {/* Expanded panel: greeting + input */}
      {expanded && (
        <div
          style={{
            width: 300,
            background: 'rgba(10,10,10,0.94)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(188,0,0,0.3)',
            borderRadius: 12,
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(188,0,0,0.1)',
            overflow: 'hidden',
            animation: 'scoutPanelReveal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Greeting bubble */}
          <div style={{ padding: '14px 16px 10px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Image
              src="/downloads/scout-v2.png"
              alt="Scout"
              width={22}
              height={22}
              style={{ borderRadius: '50%', flexShrink: 0, marginTop: 1 }}
            />
            <div style={{
              fontSize: 13,
              lineHeight: 1.45,
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 500,
            }}>
              {greeting}
            </div>
          </div>

          {/* Input area */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px 12px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Ask Scout anything..."
              disabled={animating}
              style={{
                flex: 1,
                fontSize: 13,
                fontWeight: 500,
                color: '#fff',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 6,
                padding: '8px 10px',
                outline: 'none',
                fontFamily: 'inherit',
                opacity: animating ? 0.4 : 1,
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!query.trim() || animating}
              style={{
                padding: '8px 14px',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                backgroundColor: '#bc0000',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: !query.trim() || animating ? 'not-allowed' : 'pointer',
                opacity: !query.trim() || animating ? 0.4 : 1,
                flexShrink: 0,
              }}
            >
              GO
            </button>
          </div>

          {/* Animating state */}
          {animating && (
            <div style={{
              padding: '0 16px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'rgba(255,255,255,0.5)',
            }}>
              <span style={{
                display: 'inline-block',
                animation: 'scoutSpin 0.8s linear infinite',
              }}>
                <Image src="/downloads/scout-v2.png" alt="" width={16} height={16} style={{ borderRadius: '50%' }} />
              </span>
              Scout is thinking...
            </div>
          )}
        </div>
      )}

      {/* Scout orb button */}
      <button
        onClick={handleOrbClick}
        aria-label="Ask Scout AI"
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'rgba(10,10,10,0.9)',
          border: '2px solid rgba(188,0,0,0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 20px rgba(188,0,0,0.15)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          if (!animating) e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.5), 0 0 30px rgba(188,0,0,0.3)'
        }}
        onMouseLeave={(e) => {
          if (!animating) e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4), 0 0 20px rgba(188,0,0,0.15)'
        }}
      >
        <Image
          src="/downloads/scout-v2.png"
          alt="Scout AI"
          width={28}
          height={28}
          style={{
            borderRadius: '50%',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            animation: animating ? 'scoutSpin 0.8s linear infinite' : 'none',
          }}
        />
      </button>
    </div>
  )
}
