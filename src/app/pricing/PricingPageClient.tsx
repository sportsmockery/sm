'use client'

import { useState } from 'react'
import { useSubscription, SubscriptionTier } from '@/contexts/SubscriptionContext'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface PlanFeature {
  text: string
  included: boolean
  highlight?: boolean
}

interface Plan {
  id: SubscriptionTier | 'free'
  name: string
  price: string
  period: string
  description: string
  features: PlanFeature[]
  cta: string
  popular: boolean
  badge?: string
}

const PLANS: Plan[] = [
  {
    id: 'free', name: 'Free', price: '$0', period: 'forever',
    description: 'Basic access to Sports Mockery content',
    features: [
      { text: 'All articles and news', included: true },
      { text: 'Basic game scores', included: true },
      { text: '5 AI queries per day', included: true },
      { text: 'AR Stadium Tours', included: false },
      { text: 'Fan Chat Access', included: false },
      { text: 'Ad-Free Experience', included: false },
      { text: 'Unlimited AI Queries', included: false },
    ],
    cta: 'Current Plan', popular: false,
  },
  {
    id: 'sm_plus_monthly', name: 'SM+ Monthly', price: '$4.99', period: '/month',
    description: 'Full access to all premium features',
    features: [
      { text: 'All articles and news', included: true },
      { text: 'All game scores & stats', included: true },
      { text: 'Unlimited AI Queries', included: true },
      { text: 'AR Stadium Tours', included: true },
      { text: 'Fan Chat Access', included: true },
      { text: 'Ad-Free Experience', included: true },
      { text: 'Early access to features', included: true },
    ],
    cta: 'Get SM+ Monthly', popular: true,
  },
  {
    id: 'sm_plus_annual', name: 'SM+ Annual', price: '$39.99', period: '/year',
    description: 'Save 33% with annual billing',
    features: [
      { text: 'All articles and news', included: true },
      { text: 'All game scores & stats', included: true },
      { text: 'Unlimited AI Queries', included: true },
      { text: 'AR Stadium Tours', included: true },
      { text: 'Fan Chat Access', included: true },
      { text: 'Ad-Free Experience', included: true },
      { text: 'Early access to features', included: true },
      { text: '2 months FREE', included: true, highlight: true },
    ],
    cta: 'Get SM+ Annual', popular: false, badge: 'Best Value',
  },
]

export default function PricingPageClient() {
  const { tier, isPro, openCheckout, openPortal, isLoading } = useSubscription()
  const { isAuthenticated } = useAuth()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') return
    setLoadingPlan(planId)
    try {
      await openCheckout(planId as 'sm_plus_monthly' | 'sm_plus_annual')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <main className="sm-hero-bg" style={{ minHeight: '100vh', padding: '64px 16px' }}>
      <div className="sm-grid-overlay" />
      <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--sm-text)', marginBottom: '16px',
            fontFamily: "Barlow, var(--font-heading), sans-serif",
          }}>
            Upgrade to SM+
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--sm-text-muted)' }}>
            Get the full Sports Mockery experience with premium features
          </p>
        </div>

        {/* Pricing Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {PLANS.map((plan) => {
            const isCurrentPlan = tier === plan.id
            const isPopular = plan.popular

            return (
              <div
                key={plan.id}
                className={isPopular ? '' : 'glass-card glass-card-static'}
                style={{
                  position: 'relative', padding: '28px', borderRadius: 'var(--sm-radius-lg)',
                  ...(isPopular ? {
                    background: 'linear-gradient(135deg, #bc0000, #ff4444)',
                    color: '#fff',
                    border: '2px solid rgba(255,255,255,0.2)',
                  } : {}),
                }}
              >
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: '#22c55e', color: '#fff', fontSize: '12px', fontWeight: 700,
                    padding: '4px 12px', borderRadius: '9999px', whiteSpace: 'nowrap',
                  }}>
                    {plan.badge}
                  </div>
                )}

                {isPopular && (
                  <div style={{
                    position: 'absolute', top: -12, right: 16,
                    background: '#fff', color: '#bc0000', fontSize: '12px', fontWeight: 700,
                    padding: '4px 12px', borderRadius: '9999px',
                  }}>
                    Most Popular
                  </div>
                )}

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{
                    fontSize: '20px', fontWeight: 700, marginBottom: '4px',
                    fontFamily: "Barlow, var(--font-heading), sans-serif",
                    color: isPopular ? '#fff' : 'var(--sm-text)',
                  }}>
                    {plan.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '36px', fontWeight: 900, fontFamily: "Barlow, var(--font-heading), sans-serif" }}>
                      {plan.price}
                    </span>
                    <span style={{ color: isPopular ? 'rgba(255,255,255,0.7)' : 'var(--sm-text-muted)' }}>
                      {plan.period}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', marginTop: '8px', color: isPopular ? 'rgba(255,255,255,0.8)' : 'var(--sm-text-muted)' }}>
                    {plan.description}
                  </p>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      {feature.included ? (
                        <svg style={{ width: 20, height: 20, flexShrink: 0, color: isPopular ? '#fff' : '#22c55e' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg style={{ width: 20, height: 20, flexShrink: 0, color: 'var(--sm-text-muted)' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span style={{
                        fontSize: '14px', color: isPopular ? '#fff' : 'var(--sm-text)',
                        fontWeight: feature.highlight ? 700 : 400,
                      }}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <button disabled style={{
                    width: '100%', padding: '14px', borderRadius: 'var(--sm-radius-md)', fontWeight: 700, textAlign: 'center',
                    background: 'var(--sm-surface)', color: 'var(--sm-text-muted)', border: 'none', cursor: 'not-allowed',
                  }}>
                    Current Plan
                  </button>
                ) : isPro && plan.id === 'free' ? (
                  <button onClick={openPortal} className="btn-secondary btn-full">
                    Manage Subscription
                  </button>
                ) : plan.id === 'free' ? (
                  <div style={{
                    width: '100%', padding: '14px', borderRadius: 'var(--sm-radius-md)', fontWeight: 700, textAlign: 'center',
                    background: 'var(--sm-surface)', color: 'var(--sm-text-muted)',
                  }}>
                    Free Forever
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isLoading || loadingPlan === plan.id}
                    className={isPopular ? 'btn-full' : 'btn-primary btn-full'}
                    style={isPopular ? {
                      width: '100%', padding: '14px', borderRadius: 'var(--sm-radius-md)', fontWeight: 700, textAlign: 'center',
                      background: '#fff', color: '#bc0000', border: 'none', cursor: 'pointer', fontSize: '15px',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      ...(loadingPlan === plan.id ? { opacity: 0.5, cursor: 'wait' } : {}),
                    } : (loadingPlan === plan.id ? { opacity: 0.5, cursor: 'wait' } : undefined)}
                  >
                    {loadingPlan === plan.id ? 'Loading...' : plan.cta}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Trust section */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>
            Secure payments powered by Stripe. Cancel anytime.
          </p>
          {!isAuthenticated && (
            <p style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>
              Already have an account?{' '}
              <Link href="/login?next=/pricing" style={{ color: '#bc0000', fontWeight: 500, textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          )}
          {isPro && (
            <p style={{ fontSize: '14px', color: 'var(--sm-text-muted)' }}>
              Need to manage your subscription?{' '}
              <button onClick={openPortal} style={{ color: '#bc0000', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Open billing portal
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
