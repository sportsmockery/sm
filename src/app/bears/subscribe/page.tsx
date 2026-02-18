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
      <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-dark)' }}>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: bearsInfo.secondaryColor }}
          >
            <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mb-4 text-4xl font-black" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--sm-text)' }}>
            You're Subscribed!
          </h1>
          <p className="mb-8 text-lg" style={{ color: 'var(--sm-text-muted)' }}>
            You'll receive Bears news, game updates, and breaking alerts directly to your inbox.
          </p>
          <Link
            href="/chicago-bears"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white transition-all hover:scale-105"
            style={{ backgroundColor: bearsInfo.secondaryColor }}
          >
            Browse Bears News
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-dark)' }}>
      {/* Hero Section */}
      <div
        className="py-16"
        style={{
          background: `linear-gradient(to right, ${bearsInfo.primaryColor}, #1a2940)`,
        }}
      >
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-black text-white"
            style={{ backgroundColor: bearsInfo.secondaryColor }}
          >
            B
          </div>
          <h1 className="mb-4 text-4xl font-black text-white md:text-5xl" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Get Bears Alerts
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/80">
            Never miss a moment. Get breaking news, game-day updates, trade rumors, and exclusive analysis delivered straight to your inbox.
          </p>
        </div>
      </div>

      {/* Subscribe Form */}
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="rounded-2xl p-8" style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium" style={{ color: 'var(--sm-text)' }}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 focus:outline-none"
                style={{
                  backgroundColor: 'var(--sm-surface)',
                  border: '1px solid var(--sm-border)',
                  color: 'var(--sm-text)',
                  borderRadius: '12px',
                }}
              />
            </div>

            <div className="space-y-3">
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--sm-text)' }}>
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
                  className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors"
                  style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-surface)' }}
                >
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-1 h-4 w-4 rounded"
                    style={{ accentColor: '#C83200' }}
                  />
                  <div>
                    <div className="font-medium" style={{ color: 'var(--sm-text)' }}>{pref.label}</div>
                    <div className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>{pref.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl py-4 font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: bearsInfo.secondaryColor }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Subscribing...
                </span>
              ) : (
                'Subscribe to Bears Alerts'
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-xs" style={{ color: 'var(--sm-text-dim)' }}>
            By subscribing, you agree to receive email updates from Sports Mockery. You can unsubscribe at any time.
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: 'Breaking News First',
              desc: 'Be the first to know about major Bears news and roster moves.',
            },
            {
              icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: 'Real-Time Updates',
              desc: 'Game day scores, play-by-play highlights, and instant recaps.',
            },
            {
              icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ),
              title: 'Exclusive Analysis',
              desc: 'Hot takes and in-depth coverage you won\'t find anywhere else.',
            },
          ].map((feature, index) => (
            <div key={index} className="rounded-xl p-6 text-center" style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: bearsInfo.primaryColor }}
              >
                {feature.icon}
              </div>
              <h3 className="mb-2 font-bold" style={{ color: 'var(--sm-text)' }}>{feature.title}</h3>
              <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
