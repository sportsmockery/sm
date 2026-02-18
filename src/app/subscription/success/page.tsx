'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSubscription } from '@/contexts/SubscriptionContext'

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { refresh, tier, isPro } = useSubscription()
  const [isRefreshing, setIsRefreshing] = useState(true)

  useEffect(() => {
    // Refresh subscription status after successful checkout
    const refreshStatus = async () => {
      setIsRefreshing(true)
      // Give Stripe webhook time to process
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await refresh()
      setIsRefreshing(false)
    }

    if (sessionId) {
      refreshStatus()
    } else {
      setIsRefreshing(false)
    }
  }, [sessionId, refresh])

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--sm-bg)' }}
    >
      <div className="max-w-md w-full text-center">
        {isRefreshing ? (
          <div className="space-y-4">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h1
              className="text-2xl font-bold"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                color: 'var(--sm-text)',
              }}
            >
              Processing your subscription...
            </h1>
            <p style={{ color: 'var(--sm-text-muted)' }}>
              Please wait while we confirm your payment.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div>
              <h1
                className="text-3xl font-black mb-2"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'var(--sm-text)',
                }}
              >
                Welcome to SM+!
              </h1>
              <p
                className="text-lg"
                style={{ color: 'var(--sm-text-muted)' }}
              >
                Your subscription is now active.
              </p>
            </div>

            {/* Features unlocked */}
            <div
              className="rounded-xl p-6 text-left"
              style={{
                background: 'var(--sm-surface)',
                border: '1px solid var(--sm-border)',
              }}
            >
              <h2
                className="font-bold mb-4"
                style={{ color: 'var(--sm-text)' }}
              >
                You now have access to:
              </h2>
              <ul className="space-y-3">
                {[
                  'AR Stadium Tours',
                  'Fan Chat',
                  'Ad-Free Experience',
                  'Unlimited AI Queries',
                  'Early Access to Features',
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3"
                    style={{ color: 'var(--sm-text)' }}
                  >
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/chicago-bears"
                className="bg-orange-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Explore AR Tours
              </Link>
              <Link
                href="/chat"
                className="border border-orange-500 text-orange-500 font-bold px-6 py-3 rounded-lg hover:bg-orange-500/10 transition-colors"
              >
                Join Fan Chat
              </Link>
            </div>

            <Link
              href="/"
              className="inline-block text-sm hover:underline"
              style={{ color: 'var(--sm-text-muted)' }}
            >
              Return to homepage
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
