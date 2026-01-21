import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { Linking } from 'react-native'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { API_BASE_URL } from '@/lib/config'

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
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing' | 'unpaid'
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
  openPricing: () => Promise<void>
  openManageSubscription: () => Promise<void>
}

const defaultFeatures: SubscriptionFeatures = {
  ar_tours: false,
  fan_chat: false,
  ad_free: false,
  ask_ai: { enabled: true, limit: 5 },
}

const proFeatures: SubscriptionFeatures = {
  ar_tours: true,
  fan_chat: true,
  ad_free: true,
  ask_ai: { enabled: true, limit: null },
}

const defaultState: SubscriptionState = {
  tier: 'free',
  status: 'inactive',
  isPro: false,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  features: defaultFeatures,
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [state, setState] = useState<SubscriptionState>(defaultState)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = useCallback(async () => {
    if (!user?.id) {
      setState(defaultState)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Fetch subscription from Supabase (same table as web)
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (subError && subError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (user has no subscription yet)
        throw subError
      }

      if (!subscription) {
        setState(defaultState)
        return
      }

      const isPro =
        (subscription.tier === 'sm_plus_monthly' || subscription.tier === 'sm_plus_annual') &&
        subscription.status === 'active'

      setState({
        tier: subscription.tier as SubscriptionTier,
        status: subscription.status,
        isPro,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        features: isPro ? proFeatures : defaultFeatures,
      })
    } catch (err) {
      console.error('Subscription fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load subscription')
      setState(defaultState)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // Fetch on mount and when auth changes
  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription, isAuthenticated])

  // Subscribe to real-time subscription changes
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`subscription:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch when subscription changes
          fetchSubscription()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, fetchSubscription])

  const canAccess = useCallback(
    (feature: FeatureKey): boolean => {
      if (feature === 'ask_ai') {
        return state.features.ask_ai.enabled
      }
      return state.features[feature]
    },
    [state.features]
  )

  // Open pricing page in browser (mobile uses web checkout)
  const openPricing = useCallback(async () => {
    const url = `${API_BASE_URL}/pricing`
    const canOpen = await Linking.canOpenURL(url)
    if (canOpen) {
      await Linking.openURL(url)
    }
  }, [])

  // Open subscription management in browser
  const openManageSubscription = useCallback(async () => {
    const url = `${API_BASE_URL}/account`
    const canOpen = await Linking.canOpenURL(url)
    if (canOpen) {
      await Linking.openURL(url)
    }
  }, [])

  return (
    <SubscriptionContext.Provider
      value={{
        ...state,
        isLoading,
        error,
        refresh: fetchSubscription,
        canAccess,
        openPricing,
        openManageSubscription,
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
