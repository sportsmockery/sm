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
    const refreshStatus = async () => {
      setIsRefreshing(true)
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
    <main className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="sm-grid-overlay" />
      <div className="glass-card glass-card-static" style={{ position: 'relative', maxWidth: '480px', width: '100%', padding: '40px 32px', textAlign: 'center' }}>
        {isRefreshing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{
              width: 64, height: 64, border: '4px solid var(--sm-border)', borderTopColor: '#bc0000',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }} />
            <h1 style={{
              fontSize: '24px', fontWeight: 700, color: 'var(--sm-text)',
              fontFamily: "'Space Grotesk', var(--font-heading), sans-serif",
            }}>
              Processing your subscription...
            </h1>
            <p style={{ color: 'var(--sm-text-muted)' }}>
              Please wait while we confirm your payment.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
            {/* Success Icon */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: '#22c55e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg style={{ width: 40, height: 40, color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h1 style={{
                fontSize: '28px', fontWeight: 900, color: 'var(--sm-text)', marginBottom: '8px',
                fontFamily: "'Space Grotesk', var(--font-heading), sans-serif",
              }}>
                Welcome to SM+!
              </h1>
              <p style={{ fontSize: '18px', color: 'var(--sm-text-muted)' }}>
                Your subscription is now active.
              </p>
            </div>

            {/* Features unlocked */}
            <div className="glass-card glass-card-static" style={{ width: '100%', padding: '24px', textAlign: 'left' }}>
              <h2 style={{ fontWeight: 700, color: 'var(--sm-text)', marginBottom: '16px' }}>
                You now have access to:
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  'AR Stadium Tours',
                  'Fan Chat',
                  'Ad-Free Experience',
                  'Unlimited AI Queries',
                  'Early Access to Features',
                ].map((feature) => (
                  <li key={feature} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--sm-text)' }}>
                    <svg style={{ width: 20, height: 20, color: '#22c55e', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              <Link href="/chicago-bears" className="btn-primary">
                Explore AR Tours
              </Link>
              <Link href="/chat" className="btn-secondary">
                Join Fan Chat
              </Link>
            </div>

            <Link href="/" style={{ fontSize: '14px', color: 'var(--sm-text-muted)', textDecoration: 'none' }}>
              Return to homepage
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
