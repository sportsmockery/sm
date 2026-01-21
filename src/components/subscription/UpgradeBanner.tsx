'use client'

import { useSubscription } from '@/contexts/SubscriptionContext'
import Link from 'next/link'

interface UpgradeBannerProps {
  className?: string
  variant?: 'inline' | 'floating'
}

export default function UpgradeBanner({
  className = '',
  variant = 'inline',
}: UpgradeBannerProps) {
  const { isPro, isLoading } = useSubscription()

  // Don't show if already pro or loading
  if (isLoading || isPro) return null

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Link
          href="/pricing"
          className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <span className="text-sm font-bold">Go Ad-Free with SM+</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    )
  }

  return (
    <div
      className={`bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-white">
          <p className="font-bold">Upgrade to SM+</p>
          <p className="text-sm text-white/80">
            Ad-free + AR Tours + Fan Chat + Unlimited AI
          </p>
        </div>
        <Link
          href="/pricing"
          className="bg-white text-orange-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-orange-50 transition-colors whitespace-nowrap"
        >
          See Plans
        </Link>
      </div>
    </div>
  )
}
