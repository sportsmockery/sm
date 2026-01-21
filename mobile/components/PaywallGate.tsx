import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSubscription, FeatureKey } from '@/hooks/useSubscription'
import { COLORS } from '@/lib/config'

interface PaywallGateProps {
  feature: FeatureKey
  children: React.ReactNode
  fallback?: React.ReactNode
  title?: string
  description?: string
}

const FEATURE_LABELS: Record<FeatureKey, { title: string; description: string; icon: keyof typeof Ionicons.glyphMap }> = {
  ar_tours: {
    title: 'AR Stadium Tours',
    description: 'Experience immersive stadium tours in augmented reality',
    icon: 'cube-outline',
  },
  fan_chat: {
    title: 'Fan Chat',
    description: 'Join live discussions with fellow Chicago sports fans',
    icon: 'chatbubbles-outline',
  },
  ad_free: {
    title: 'Ad-Free Experience',
    description: 'Enjoy Sports Mockery without any ads',
    icon: 'shield-checkmark-outline',
  },
  ask_ai: {
    title: 'AI Sports Assistant',
    description: 'Get instant answers about Chicago sports',
    icon: 'sparkles-outline',
  },
}

/**
 * Gate premium features behind SM+ subscription
 * Shows an upgrade prompt when user doesn't have access
 */
export function PaywallGate({
  feature,
  children,
  fallback,
  title,
  description,
}: PaywallGateProps) {
  const { canAccess, isLoading, openPricing } = useSubscription()

  // Show nothing while loading to prevent flash
  if (isLoading) {
    return null
  }

  // User has access - show the content
  if (canAccess(feature)) {
    return <>{children}</>
  }

  // User doesn't have access - show fallback or upgrade prompt
  if (fallback) {
    return <>{fallback}</>
  }

  const featureInfo = FEATURE_LABELS[feature]

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={featureInfo.icon} size={48} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{title || featureInfo.title}</Text>
      <Text style={styles.description}>{description || featureInfo.description}</Text>
      <TouchableOpacity style={styles.button} onPress={openPricing}>
        <Ionicons name="star" size={20} color="#fff" />
        <Text style={styles.buttonText}>Upgrade to SM+</Text>
      </TouchableOpacity>
      <Text style={styles.priceText}>Starting at $4.99/month</Text>
    </View>
  )
}

/**
 * Inline paywall badge for locked features
 */
export function PaywallBadge({ onPress }: { onPress?: () => void }) {
  const { openPricing } = useSubscription()

  return (
    <TouchableOpacity
      style={styles.badge}
      onPress={onPress || openPricing}
    >
      <Ionicons name="lock-closed" size={12} color="#fff" />
      <Text style={styles.badgeText}>SM+</Text>
    </TouchableOpacity>
  )
}

/**
 * Upgrade banner component for free users
 */
export function UpgradeBanner() {
  const { isPro, isLoading, openPricing } = useSubscription()

  if (isLoading || isPro) {
    return null
  }

  return (
    <TouchableOpacity style={styles.banner} onPress={openPricing}>
      <View style={styles.bannerContent}>
        <Ionicons name="star" size={24} color="#fff" />
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>Upgrade to SM+</Text>
          <Text style={styles.bannerSubtitle}>Ad-free, Fan Chat, AR Tours & more</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#fff" />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  priceText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerText: {
    gap: 2,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
})
