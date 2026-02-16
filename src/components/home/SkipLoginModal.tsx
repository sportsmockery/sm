'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'

interface SkipLoginModalProps {
  open: boolean
  onClose: () => void
}

const features = [
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
    title: 'Scout AI Memory',
    desc: 'Your AI remembers past conversations, trade preferences, and hot takes — no repeating yourself',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M14 14l7 7M3 8V3h5M10 10L3 3" />
      </svg>
    ),
    title: 'Save Trade Scenarios',
    desc: 'Build complex trades, bookmark them, and share with your crew in Fan Hub',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Fan Hub Identity',
    desc: 'Build your reputation, track roast history, and earn badges in live team rooms',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    title: 'Personalized Data Feeds',
    desc: 'Get notifications on your favorite players, teams, and trade rumors — zero noise',
  },
]

export default function SkipLoginModal({ open, onClose }: SkipLoginModalProps) {
  const handleSkip = useCallback(() => {
    localStorage.setItem('sm_skipped_login', 'true')
    window.location.href = 'https://test.sportsmockery.com'
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="hm-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="hm-modal-container">
        {/* Top accent line */}
        <div className="hm-modal-accent" />

        {/* Close button → goes to test.sportsmockery.com */}
        <button
          className="hm-modal-close"
          onClick={() => {
            window.location.href = 'https://test.sportsmockery.com'
          }}
          aria-label="Close"
        >
          &times;
        </button>

        <div className="hm-modal-content">
          {/* Icon */}
          <div className="hm-modal-icon">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="hm-modal-title">
            You&apos;re Missing Out on the Full Experience
          </h2>

          {/* Subtitle */}
          <p className="hm-modal-subtitle">
            Sports Mockery is built for fans who want more than headlines. Creating a free account unlocks personalized features designed for serious Chicago sports enthusiasts.
          </p>

          {/* Features */}
          <ul className="hm-modal-features">
            {features.map((f) => (
              <li key={f.title} className="hm-modal-feature-item">
                <span className="hm-modal-feature-icon">{f.icon}</span>
                <div>
                  <strong>{f.title}</strong>
                  <span>{f.desc}</span>
                </div>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="hm-modal-actions">
            <Link href="/home/signup" className="hm-modal-btn-primary">
              Create Free Account
            </Link>
            <button className="hm-modal-btn-secondary" onClick={handleSkip}>
              Skip Anyway
            </button>
          </div>

          {/* Footer */}
          <div className="hm-modal-footer">
            <p>
              Takes 30 seconds. No credit card required.{' '}
              <Link href="/privacy">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
