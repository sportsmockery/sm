/**
 * SM ★ EDGE Features card — matches test.sportsmockery.com sidebar exactly.
 * Vertical list layout with icon, title, description, and optional LIVE badge.
 * Used in Discover tab and embedded in Home feed scroll.
 */
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { useHaptics } from '@/hooks/useHaptics'
import { Colors, FontSize, FontWeight, Spacing, Card } from '@/lib/design-tokens'

interface EdgeFeature {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  desc: string
  route: string
  isLive?: boolean
}

const EDGE_FEATURES: EdgeFeature[] = [
  {
    icon: 'chatbubbles-outline',
    label: 'Fan Chat',
    desc: 'Skip the comments and argue it out live.',
    route: '/chat/global',
    isLive: true,
  },
  {
    icon: 'swap-horizontal-outline',
    label: 'War Room',
    desc: 'Play GM — simulate trades, run mock drafts, and compete against other SM users.',
    route: '/gm',
  },
  {
    icon: 'stats-chart-outline',
    label: 'Team Stats',
    desc: 'The numbers that explain the wins… and the excuses.',
    route: '/team/bears',
  },
  {
    icon: 'videocam-outline',
    label: 'Vision Theater',
    desc: 'All videos, no digging. Just press play.',
    route: '/listen',
  },
  {
    icon: 'volume-high-outline',
    label: 'Hands-Free Audio',
    desc: 'Sit back, choose a voice, and press play.',
    route: '/listen',
  },
  {
    icon: 'school-outline',
    label: 'GM Report Cards',
    desc: 'Transparent, data-backed grades on every Chicago ownership group.',
    route: '/leaderboards',
  },
]

export default function EdgeFeaturesCard() {
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const { trigger } = useHaptics()

  const handlePress = (route: string) => {
    trigger('selection')
    router.push(route as any)
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#0D1318' : '#FAFAFB',
          borderColor: 'rgba(0, 212, 255, 0.4)',
          shadowColor: '#00D4FF',
        },
      ]}
    >
      {/* Header: SM ★ EDGE Features */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          <Text style={{ color: Colors.edgeCyan }}>SM</Text>
          <Text style={{ color: Colors.primary }}> ✦ </Text>
          <Text style={{ color: Colors.edgeCyan }}>EDGE Features</Text>
        </Text>
      </View>

      {/* Feature rows */}
      {EDGE_FEATURES.map((feature, index) => (
        <TouchableOpacity
          key={feature.label}
          style={[
            styles.featureRow,
            index < EDGE_FEATURES.length - 1 && {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(11,15,20,0.06)',
            },
          ]}
          onPress={() => handlePress(feature.route)}
          activeOpacity={0.65}
        >
          {/* Icon */}
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(11,15,20,0.04)',
                borderColor: 'rgba(0, 212, 255, 0.5)',
              },
            ]}
          >
            <Ionicons name={feature.icon} size={20} color={Colors.edgeCyan} />
          </View>

          {/* Label + description */}
          <View style={styles.textContainer}>
            <Text style={[styles.featureLabel, { color: colors.text }]}>{feature.label}</Text>
            <Text style={[styles.featureDesc, { color: colors.textMuted }]} numberOfLines={2}>
              {feature.desc}
            </Text>
          </View>

          {/* LIVE badge */}
          {feature.isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Card.borderRadius,
    borderWidth: 1,
    overflow: 'hidden',
    // Cyan glow shadow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.2,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    gap: 12,
    minHeight: 52,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: FontWeight.medium,
    lineHeight: 18,
  },
  featureDesc: {
    fontSize: 11,
    fontWeight: FontWeight.regular,
    lineHeight: 14,
    marginTop: 2,
  },
  liveBadge: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#22c55e',
  },
  liveText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
    color: '#22c55e',
  },
})
