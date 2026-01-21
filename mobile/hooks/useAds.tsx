import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { Platform } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { api, MobileConfig } from '@/lib/api'
import { queryKeys } from '@/lib/queryClient'
import { useSubscription } from './useSubscription'

interface AdsContextType {
  config: MobileConfig['ads'] | null
  isLoading: boolean
  // AdMob helpers
  shouldShowInterstitial: (articleCount: number) => boolean
  showInterstitial: () => Promise<void>
  // Custom ad helpers
  getCustomAdCode: (placement: keyof MobileConfig['ads']['custom']['placements']) => string | null
  shouldShowInlineAd: (index: number) => boolean
  // Track articles viewed for interstitial frequency
  incrementArticleCount: () => void
  articleCount: number
}

const AdsContext = createContext<AdsContextType | null>(null)

export function AdsProvider({ children }: { children: ReactNode }) {
  const [articleCount, setArticleCount] = useState(0)
  const { isPro } = useSubscription()

  // Fetch mobile config from website
  const { data: config, isLoading } = useQuery({
    queryKey: queryKeys.mobileConfig,
    queryFn: () => api.getMobileConfig(),
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  })

  // No ads for pro subscribers
  const adsConfig = isPro ? null : (config?.ads ?? null)

  // Check if we should show an interstitial based on article count
  const shouldShowInterstitial = useCallback(
    (count: number) => {
      if (!adsConfig?.enabled || !adsConfig?.admob?.enabled) return false
      const frequency = adsConfig.admob.interstitial_frequency || 5
      return count > 0 && count % frequency === 0
    },
    [adsConfig]
  )

  // Show interstitial ad
  const showInterstitial = useCallback(async () => {
    if (!adsConfig?.enabled || !adsConfig?.admob?.enabled) return

    const adUnitId =
      Platform.OS === 'ios'
        ? adsConfig.admob.ios_interstitial_id
        : adsConfig.admob.android_interstitial_id

    if (!adUnitId) return

    try {
      // Import AdMob dynamically to avoid issues if not configured
      const { InterstitialAd, AdEventType, TestIds } = await import(
        'react-native-google-mobile-ads'
      )

      // Use test ID in development
      const unitId = __DEV__ ? TestIds.INTERSTITIAL : adUnitId

      const interstitial = InterstitialAd.createForAdRequest(unitId, {
        requestNonPersonalizedAdsOnly: true,
      })

      // Load and show ad
      interstitial.addAdEventListener(AdEventType.LOADED, () => {
        interstitial.show()
      })

      interstitial.load()
    } catch (error) {
      console.warn('Failed to show interstitial ad:', error)
    }
  }, [adsConfig])

  // Get custom ad code for a placement
  const getCustomAdCode = useCallback(
    (placement: keyof MobileConfig['ads']['custom']['placements']) => {
      if (!adsConfig?.enabled || !adsConfig?.custom?.enabled) return null
      return adsConfig.custom.placements[placement] ?? null
    },
    [adsConfig]
  )

  // Check if we should show an inline ad at this index
  const shouldShowInlineAd = useCallback(
    (index: number) => {
      if (!adsConfig?.enabled) return false

      // Check custom ads
      if (adsConfig.custom?.enabled && adsConfig.custom.placements.feed_inline) {
        const frequency = 5 // Default frequency
        return index > 0 && (index + 1) % frequency === 0
      }

      // Check AdMob
      if (adsConfig.admob?.enabled) {
        const frequency = adsConfig.admob.interstitial_frequency || 5
        return index > 0 && (index + 1) % frequency === 0
      }

      return false
    },
    [adsConfig]
  )

  // Increment article count for interstitial tracking
  const incrementArticleCount = useCallback(() => {
    setArticleCount((prev) => prev + 1)
  }, [])

  return (
    <AdsContext.Provider
      value={{
        config: adsConfig,
        isLoading,
        shouldShowInterstitial,
        showInterstitial,
        getCustomAdCode,
        shouldShowInlineAd,
        incrementArticleCount,
        articleCount,
      }}
    >
      {children}
    </AdsContext.Provider>
  )
}

export function useAds() {
  const context = useContext(AdsContext)
  if (!context) {
    throw new Error('useAds must be used within AdsProvider')
  }
  return context
}
