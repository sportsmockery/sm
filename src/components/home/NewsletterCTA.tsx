'use client'

import { useState } from 'react'

interface NewsletterCTAProps {
  variant?: 'full' | 'compact'
  className?: string
}

export default function NewsletterCTA({ variant = 'compact', className = '' }: NewsletterCTAProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setStatus('success')
    setEmail('')
  }

  // Compact version for sidebar
  if (variant === 'compact') {
    return (
      <div className={`rounded-xl p-5 ${className}`} style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text)' }}>
          Newsletter
        </h3>
        <p className="mb-4 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
          Get Chicago sports news delivered to your inbox.
        </p>

        {status === 'success' ? (
          <div className="flex items-center gap-2 rounded-lg p-3 text-sm" style={{ backgroundColor: 'var(--sm-surface)', color: '#059669' }}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Subscribed!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
              className="w-full rounded-lg px-3 py-2 text-sm focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000]"
              style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text)' }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded-lg bg-[#8B0000] py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-70"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    )
  }

  // Full version for main content areas
  return (
    <section className={className}>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#8B0000] via-red-600 to-[#8B0000] p-8 text-center lg:p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative">
          <h2 className="mb-2 text-3xl font-black text-white lg:text-4xl">
            Get the Mockery Delivered
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/80">
            Hot takes, breaking news, and insider analysis on Chicago sports. Delivered to your inbox every morning.
          </p>

          {status === 'success' ? (
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-6 py-3 text-white backdrop-blur">
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Thanks for subscribing! Check your inbox.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 rounded-xl border-2 border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 backdrop-blur focus:border-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition-colors disabled:opacity-70"
                style={{ backgroundColor: 'var(--sm-card)', color: '#8B0000' }}
              >
                {status === 'loading' ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          <p className="mt-4 text-xs text-white/60">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  )
}
