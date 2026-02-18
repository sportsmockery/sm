'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TEAM_INFO } from '@/lib/types'

export default function BearsSubscribePage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bearsInfo = TEAM_INFO.bears

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // In production, this would call an API to subscribe the user
      // For now, we'll simulate a successful subscription
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch (err) {
      setError('Failed to subscribe. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--sm-dark)' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '80px 16px', textAlign: 'center' }}>
          <div style={{
            width: '96px',
            height: '96px',
            margin: '0 auto 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: bearsInfo.secondaryColor,
          }}>
            <svg style={{ width: '48px', height: '48px', color: '#fff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 style={{ marginBottom: '16px', fontSize: 'var(--text-4xl)', fontWeight: 900, fontFamily: 'var(--sm-font-heading)', color: 'var(--sm-text)' }}>
            You&apos;re Subscribed!
          </h1>
          <p style={{ marginBottom: '32px', fontSize: 'var(--text-lg)', color: 'var(--sm-text-muted)' }}>
            You&apos;ll receive Bears news, game updates, and breaking alerts directly to your inbox.
          </p>
          <Link
            href="/chicago-bears"
            className="btn btn-md"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: 'var(--sm-radius-md)',
              padding: '12px 24px',
              fontWeight: 700,
              color: '#fff',
              backgroundColor: bearsInfo.secondaryColor,
              textDecoration: 'none',
            }}
          >
            Browse Bears News
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sm-dark)' }}>
      {/* Hero Section */}
      <div
        className="sm-hero-bg"
        style={{
          position: 'relative',
          padding: '64px 0',
          background: `linear-gradient(to right, ${bearsInfo.primaryColor}, #1a2940)`,
        }}
      >
        <div className="sm-grid-overlay" />
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            fontSize: 'var(--text-3xl)',
            fontWeight: 900,
            color: '#fff',
            backgroundColor: bearsInfo.secondaryColor,
          }}>
            B
          </div>
          <h1 style={{ marginBottom: '16px', fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 900, color: '#fff', fontFamily: 'var(--sm-font-heading)' }}>
            Get Bears Alerts
          </h1>
          <p style={{ maxWidth: '640px', margin: '0 auto', fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.8)' }}>
            Never miss a moment. Get breaking news, game-day updates, trade rumors, and exclusive analysis delivered straight to your inbox.
          </p>
        </div>
      </div>

      {/* Subscribe Form */}
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 16px' }}>
        <div className="glass-card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--sm-text)' }}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="input"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--sm-text)' }}>
                Alert Preferences
              </label>
              {[
                { id: 'breaking', label: 'Breaking News', desc: 'Major trades, injuries, signings' },
                { id: 'gameday', label: 'Game Day Updates', desc: 'Scores, highlights, recaps' },
                { id: 'rumors', label: 'Trade Rumors', desc: 'Latest speculation and reports' },
                { id: 'analysis', label: 'Analysis & Takes', desc: 'In-depth coverage and hot takes' },
              ].map((pref) => (
                <label
                  key={pref.id}
                  className="glass-card-static"
                  style={{
                    display: 'flex',
                    cursor: 'pointer',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                  }}
                >
                  <input
                    type="checkbox"
                    defaultChecked
                    style={{ marginTop: '4px', width: '16px', height: '16px', accentColor: '#C83200' }}
                  />
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--sm-text)' }}>{pref.label}</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--sm-text-muted)' }}>{pref.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {error && (
              <div style={{
                borderRadius: 'var(--sm-radius-md)',
                padding: '12px 16px',
                fontSize: 'var(--text-sm)',
                background: 'var(--error-muted)',
                border: '1px solid var(--error)',
                color: 'var(--error)',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-lg"
              style={{
                width: '100%',
                borderRadius: 'var(--sm-radius-md)',
                fontWeight: 700,
                color: '#fff',
                backgroundColor: bearsInfo.secondaryColor,
                border: 'none',
                opacity: isSubmitting ? 0.5 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Subscribing...
                </span>
              ) : (
                'Subscribe to Bears Alerts'
              )}
            </button>
          </form>

          <p style={{ marginTop: '16px', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--sm-text-dim)' }}>
            By subscribing, you agree to receive email updates from Sports Mockery. You can unsubscribe at any time.
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px 64px' }}>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: (
                <svg style={{ width: '32px', height: '32px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: 'Breaking News First',
              desc: 'Be the first to know about major Bears news and roster moves.',
            },
            {
              icon: (
                <svg style={{ width: '32px', height: '32px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: 'Real-Time Updates',
              desc: 'Game day scores, play-by-play highlights, and instant recaps.',
            },
            {
              icon: (
                <svg style={{ width: '32px', height: '32px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ),
              title: 'Exclusive Analysis',
              desc: 'Hot takes and in-depth coverage you won\'t find anywhere else.',
            },
          ].map((feature, index) => (
            <div key={index} className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                color: '#fff',
                backgroundColor: bearsInfo.primaryColor,
              }}>
                {feature.icon}
              </div>
              <h3 style={{ marginBottom: '8px', fontWeight: 700, color: 'var(--sm-text)' }}>{feature.title}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--sm-text-muted)' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
