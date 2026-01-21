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
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
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
    cta: 'Current Plan',
    popular: false,
  },
  {
    id: 'sm_plus_monthly',
    name: 'SM+ Monthly',
    price: '$4.99',
    period: '/month',
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
    cta: 'Get SM+ Monthly',
    popular: true,
  },
  {
    id: 'sm_plus_annual',
    name: 'SM+ Annual',
    price: '$39.99',
    period: '/year',
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
    cta: 'Get SM+ Annual',
    popular: false,
    badge: 'Best Value',
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
    <main
      className="min-h-screen py-16 px-4"
      style={{ background: 'var(--bg-primary, #0a0a0a)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-black mb-4"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              color: 'var(--text-primary, #fff)',
            }}
          >
            Upgrade to SM+
          </h1>
          <p
            className="text-lg"
            style={{ color: 'var(--text-muted, #888)' }}
          >
            Get the full Sports Mockery experience with premium features
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan) => {
            const isCurrentPlan = tier === plan.id
            const isUpgrade = !isPro && plan.id !== 'free'

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white ring-4 ring-orange-300'
                    : 'bg-[var(--bg-surface,#1a1a1a)] border border-[var(--border-primary,#333)]'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}

                {plan.popular && (
                  <div className="absolute -top-3 right-4 bg-white text-orange-600 text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3
                    className={`text-xl font-bold mb-1`}
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      color: plan.popular
                        ? 'white'
                        : 'var(--text-primary, #fff)',
                    }}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-4xl font-black"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={
                        plan.popular
                          ? 'text-white/70'
                          : 'text-[var(--text-muted,#888)]'
                      }
                    >
                      {plan.period}
                    </span>
                  </div>
                  <p
                    className={`text-sm mt-2 ${plan.popular ? 'text-white/80' : 'text-[var(--text-muted,#888)]'}`}
                  >
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      {feature.included ? (
                        <svg
                          className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-white' : 'text-green-500'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 flex-shrink-0 text-zinc-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <span
                        className={`text-sm ${feature.highlight ? 'font-bold' : ''} ${plan.popular ? 'text-white' : 'text-[var(--text-primary,#fff)]'}`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-lg font-bold text-center bg-zinc-300 text-zinc-500 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : isPro && plan.id === 'free' ? (
                  <button
                    onClick={openPortal}
                    className="w-full py-3 rounded-lg font-bold text-center border border-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    style={{ color: 'var(--text-primary, #fff)' }}
                  >
                    Manage Subscription
                  </button>
                ) : plan.id === 'free' ? (
                  <div className="w-full py-3 rounded-lg font-bold text-center bg-zinc-700 text-zinc-400">
                    Free Forever
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isLoading || loadingPlan === plan.id}
                    className={`w-full py-3 rounded-lg font-bold text-center transition-all ${
                      plan.popular
                        ? 'bg-white text-orange-600 hover:bg-orange-50'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    } ${loadingPlan === plan.id ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {loadingPlan === plan.id ? 'Loading...' : plan.cta}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Trust section */}
        <div className="text-center space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-muted, #888)' }}>
            Secure payments powered by Stripe. Cancel anytime.
          </p>

          {!isAuthenticated && (
            <p className="text-sm" style={{ color: 'var(--text-muted, #888)' }}>
              Already have an account?{' '}
              <Link
                href="/login?next=/pricing"
                className="text-orange-500 hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          )}

          {isPro && (
            <p className="text-sm" style={{ color: 'var(--text-muted, #888)' }}>
              Need to manage your subscription?{' '}
              <button
                onClick={openPortal}
                className="text-orange-500 hover:underline font-medium"
              >
                Open billing portal
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
