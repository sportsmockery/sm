'use client'

import { useState } from 'react'
import { Montserrat } from 'next/font/google'
import { motion, AnimatePresence } from 'framer-motion'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700'] })

interface NewsletterCTAProps {
  title?: string
  subtitle?: string
  className?: string
}

/**
 * Newsletter CTA
 *
 * Email signup form with:
 * - Bold headline
 * - Email input
 * - Red submit button
 * - Success/error states
 */
export default function NewsletterCTA({
  title = 'Get the Mockery',
  subtitle = 'Daily Chicago sports takes delivered to your inbox. No fluff, just fire.',
  className = '',
}: NewsletterCTAProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }

    setStatus('loading')

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setStatus('success')
        setMessage('You\'re in! Check your inbox for confirmation.')
        setEmail('')
      } else {
        throw new Error('Subscription failed')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Try again.')
    }
  }

  return (
    <section
      className={`bg-zinc-900 dark:bg-zinc-950 border-4 border-red-600 p-6 md:p-8 ${className}`}
      aria-labelledby="newsletter-title"
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* Title */}
        <h2
          id="newsletter-title"
          className={`text-2xl md:text-3xl text-white mb-3 ${montserrat.className}`}
        >
          {title}
        </h2>

        {/* Subtitle */}
        <p className="text-zinc-400 text-base mb-6 font-serif">{subtitle}</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={status === 'loading' || status === 'success'}
            className="flex-1 px-4 py-3 bg-white dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent disabled:opacity-50"
            aria-describedby="newsletter-status"
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className={`px-6 py-3 bg-red-600 text-white font-bold uppercase tracking-wide hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed ${montserrat.className}`}
          >
            {status === 'loading' ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Subscribing...
              </span>
            ) : status === 'success' ? (
              '✓ Subscribed'
            ) : (
              'Subscribe'
            )}
          </button>
        </form>

        {/* Status message */}
        <AnimatePresence>
          {message && (
            <motion.p
              id="newsletter-status"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 text-sm ${
                status === 'success' ? 'text-green-400' : 'text-red-400'
              }`}
              role="status"
              aria-live="polite"
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Privacy note */}
        <p className="mt-4 text-xs text-zinc-500">
          No spam. Unsubscribe anytime. We respect your inbox.
        </p>
      </div>
    </section>
  )
}
