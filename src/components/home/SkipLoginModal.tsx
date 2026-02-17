'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getIntendedDestination, clearIntendedDestination } from '@/lib/redirects'

interface SkipLoginModalProps {
  open: boolean
  onClose: () => void
}

const features = [
  {
    icon: <Image src="/downloads/scout-v2.png" alt="Scout AI" width={22} height={22} style={{ borderRadius: '50%' }} />,
    title: 'Scout AI Memory',
    desc: 'Your AI remembers past conversations, trade preferences, and hot takes — no repeating yourself',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M14 14l7 7M3 8V3h5M10 10L3 3" />
      </svg>
    ),
    title: 'Trade Simulator / Mock Draft',
    desc: 'Build complex trades and draft like a GM, your GM score is saved on our leaderboard',
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
    desc: 'Your content, the way you want it. Customization features based on your history',
  },
]

export default function SkipLoginModal({ open, onClose }: SkipLoginModalProps) {
  const handleSkip = useCallback(() => {
    localStorage.setItem('sm_skipped_login', 'true')
    const destination = getIntendedDestination() || '/'
    clearIntendedDestination()
    window.location.href = destination
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

        {/* Close button → goes to intended destination or home */}
        <button
          className="hm-modal-close"
          onClick={() => {
            const destination = getIntendedDestination() || '/'
            clearIntendedDestination()
            localStorage.setItem('sm_skipped_login', 'true')
            window.location.href = destination
          }}
          aria-label="Close"
        >
          &times;
        </button>

        <div className="hm-modal-content">
          {/* SM Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <Image
              src="/logos/SM_v2_White.png"
              alt="Sports Mockery"
              width={72}
              height={72}
              style={{ objectFit: 'contain' }}
            />
          </div>

          {/* Title */}
          <h2 className="hm-modal-title">
            Create an Account to Get the Full Experience
          </h2>

          {/* Subtitle */}
          <p className="hm-modal-subtitle">
            AI-Driven. Fan-Owned. Made For Chicago. Sports Mockery 2.0 is a new kind of sports platform.
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
              Takes 30 seconds.{' '}
              <Link href="/privacy">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
