'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { useAuth } from './AuthContext'

// Feature keys that can be gated
export type FeatureKey = 'ar_tours' | 'fan_chat' | 'ad_free' | 'ask_ai'

export type SubscriptionTier = 'free' | 'sm_plus_monthly' | 'sm_plus_annual'

export interface SubscriptionFeatures {
  ar_tours: boolean
  fan_chat: boolean
  ad_free: boolean
  ask_ai: { enabled: boolean; limit: number | null }
}

export interface SubscriptionState {
  tier: SubscriptionTier
  status:
    | 'active'
    | 'inactive'
    | 'canceled'
    | 'past_due'
    | 'trialing'
    | 'unpaid'
  isPro: boolean
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  features: SubscriptionFeatures
}

interface SubscriptionContextType extends SubscriptionState {
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  canAccess: (feature: FeatureKey) => boolean
  openCheckout: (tier: 'sm_plus_monthly' | 'sm_plus_annual') => Promise<void>
  openPortal: () => Promise<void>
}

const defaultFeatures: SubscriptionFeatures = {
  ar_tours: false,
  fan_chat: false,
  ad_free: false,
  ask_ai: { enabled: true, limit: 5 },
}

const defaultState: SubscriptionState = {
  tier: 'free',
  status: 'inactive',
  isPro: false,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  features: defaultFeatures,
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [state, setState] = useState<SubscriptionState>(defaultState)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/subscription')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subscription')
      }

      setState({
        tier: data.tier,
        status: data.status,
        isPro: data.isPro,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
        features: data.features || defaultFeatures,
      })
    } catch (err) {
      console.error('Subscription fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load subscription')
      setState(defaultState)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch on mount and when auth changes
  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription, isAuthenticated])

  const canAccess = useCallback(
    (feature: FeatureKey): boolean => {
      if (feature === 'ask_ai') {
        return state.features.ask_ai.enabled
      }
      return state.features[feature]
    },
    [state.features]
  )

  const openCheckout = useCallback(
    async (tier: 'sm_plus_monthly' | 'sm_plus_annual') => {
      // Wait for auth to finish loading before checking
      if (authLoading) {
        // Auth still loading, wait a moment and retry
        setTimeout(() => openCheckout(tier), 100)
        return
      }

      if (!isAuthenticated) {
        // Redirect to login with return URL
        window.location.href = `/login?next=/pricing`
        return
      }

      try {
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier }),
        })

        const data = await response.json()

        if (!response.ok) {
          const errorMsg = data.error || 'Failed to create checkout'
          setError(errorMsg)
          alert(`Checkout error: ${errorMsg}`)
          return
        }

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url
        } else {
          const errorMsg = 'No checkout URL returned from Stripe'
          setError(errorMsg)
          alert(`Checkout error: ${errorMsg}`)
        }
      } catch (err) {
        console.error('Checkout error:', err)
        const errorMsg = err instanceof Error ? err.message : 'Checkout failed'
        setError(errorMsg)
        alert(`Checkout error: ${errorMsg}`)
      }
    },
    [isAuthenticated, authLoading]
  )

  const openPortal = useCallback(async () => {
    if (!isAuthenticated) {
      window.location.href = '/login?next=/account'
      return
    }

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open portal')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Portal error:', err)
      setError(err instanceof Error ? err.message : 'Portal access failed')
    }
  }, [isAuthenticated])

  return (
    <SubscriptionContext.Provider
      value={{
        ...state,
        isLoading,
        error,
        refresh: fetchSubscription,
        canAccess,
        openCheckout,
        openPortal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

// Convenience hook for feature access
export function useCanAccess(feature: FeatureKey): boolean {
  const { canAccess, isLoading } = useSubscription()
  // Return false while loading to prevent flash of premium content
  if (isLoading) return false
  return canAccess(feature)
}

// Hook for checking if user is pro
export function useIsPro(): boolean {
  const { isPro, isLoading } = useSubscription()
  if (isLoading) return false
  return isPro
}
