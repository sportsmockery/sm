'use client'

import { ReactNode } from 'react'
import { useSubscription, FeatureKey } from '@/contexts/SubscriptionContext'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface PaywallGateProps {
  feature: FeatureKey
  children: ReactNode
  fallback?: ReactNode
  showUpgradePrompt?: boolean
  blurContent?: boolean
}

const featureNames: Record<FeatureKey, string> = {
  ar_tours: 'AR Stadium Tours',
  fan_chat: 'Fan Chat',
  ad_free: 'Ad-Free Experience',
  ask_ai: 'Unlimited AI Queries',
}

const featureDescriptions: Record<FeatureKey, string> = {
  ar_tours: 'Explore Chicago stadiums in augmented reality',
  fan_chat: 'Join the conversation with fellow fans',
  ad_free: 'Enjoy content without interruptions',
  ask_ai: 'Get unlimited answers to your sports questions',
}

export default function PaywallGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  blurContent = false,
}: PaywallGateProps) {
  const { canAccess, isLoading, openCheckout } = useSubscription()
  const { isAuthenticated } = useAuth()

  // Show loading skeleton while checking subscription
  if (isLoading) {
    return (
      <div className="animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-lg h-32" />
    )
  }

  // If user has access, show content
  if (canAccess(feature)) {
    return <>{children}</>
  }

  // User doesn't have access - show fallback if provided
  if (fallback) {
    return <>{fallback}</>
  }

  // Don't show anything if upgrade prompt is disabled
  if (!showUpgradePrompt) {
    return null
  }

  return (
    <div className="relative">
      {/* Blurred content preview */}
      {blurContent && (
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="blur-md opacity-50 pointer-events-none">{children}</div>
        </div>
      )}

      {/* Upgrade prompt overlay */}
      <div
        className={`${blurContent ? 'absolute inset-0 flex items-center justify-center' : ''}`}
      >
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white text-center max-w-md mx-auto shadow-xl">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h3
            className="text-xl font-bold mb-2"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Unlock {featureNames[feature]}
          </h3>
          <p className="text-white/80 text-sm mb-4">
            {featureDescriptions[feature]}. Upgrade to SM+ for full access.
          </p>

          {isAuthenticated ? (
            <button
              onClick={() => openCheckout('sm_plus_monthly')}
              className="bg-white text-orange-600 font-bold px-6 py-3 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Upgrade to SM+
            </button>
          ) : (
            <Link
              href="/login?next=/pricing"
              className="inline-block bg-white text-orange-600 font-bold px-6 py-3 rounded-lg hover:bg-orange-50 transition-colors"
            >
              Sign In to Upgrade
            </Link>
          )}

          <p className="text-white/60 text-xs mt-3">Starting at $4.99/month</p>
        </div>
      </div>
    </div>
  )
}

// Simpler inline paywall prompt
export function PaywallPrompt({
  feature,
  className = '',
}: {
  feature: FeatureKey
  className?: string
}) {
  const { openCheckout } = useSubscription()
  const { isAuthenticated } = useAuth()

  return (
    <div
      className={`bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-white">
          <p className="font-bold">{featureNames[feature]}</p>
          <p className="text-sm text-white/80">{featureDescriptions[feature]}</p>
        </div>
        {isAuthenticated ? (
          <button
            onClick={() => openCheckout('sm_plus_monthly')}
            className="bg-white text-orange-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-orange-50 transition-colors whitespace-nowrap"
          >
            Upgrade to SM+
          </button>
        ) : (
          <Link
            href="/login?next=/pricing"
            className="bg-white text-orange-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-orange-50 transition-colors whitespace-nowrap"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  )
}
