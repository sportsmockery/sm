import React, { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import { Colors, FontSize, FontWeight, Spacing, Card, Motion } from '@/lib/design-tokens'
import type { ScoutLiveHeroData } from './MobileHero'

// ─── Signal icon mapping ─────────────────────────────────────────────────────

const SIGNAL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  trending: 'trending-up',
  alert: 'alert-circle',
  stats: 'stats-chart',
  trade: 'swap-horizontal',
  injury: 'medkit',
  default: 'radio',
}

function getSignalIcon(iconKey: string): keyof typeof Ionicons.glyphMap {
  return SIGNAL_ICONS[iconKey] ?? SIGNAL_ICONS.default
}

// ─── Component ───────────────────────────────────────────────────────────────

interface ScoutLiveHeroProps {
  data: ScoutLiveHeroData
}

export function ScoutLiveHero({ data }: ScoutLiveHeroProps) {
  const { colors, isDark } = useTheme()
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: Motion.slow / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: Motion.slow / 2,
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [pulseAnim])

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surfaceElevated : colors.surface,
          borderLeftColor: Colors.edgeCyan,
        },
      ]}
    >
      {/* SCOUT LIVE badge with pulse */}
      <View style={styles.badgeRow}>
        <Animated.View
          style={[
            styles.pulseDot,
            { backgroundColor: Colors.edgeCyan, transform: [{ scale: pulseAnim }] },
          ]}
        />
        <Text style={[styles.badgeText, { color: Colors.edgeCyan }]}>SCOUT LIVE</Text>
      </View>

      {/* Intelligence signals */}
      <View style={styles.signalList}>
        {data.signals.slice(0, 3).map((signal, index) => (
          <View key={index} style={styles.signalRow}>
            <View
              style={[
                styles.signalIconBg,
                { backgroundColor: isDark ? 'rgba(0,212,255,0.12)' : 'rgba(0,212,255,0.08)' },
              ]}
            >
              <Ionicons
                name={getSignalIcon(signal.icon)}
                size={18}
                color={Colors.edgeCyan}
              />
            </View>
            <Text
              style={[styles.signalText, { color: colors.text }]}
              numberOfLines={2}
            >
              {signal.text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: 250,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderLeftWidth: Card.accentBorderWidth,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  badgeText: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.5,
  },
  signalList: {
    gap: Spacing.md,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  signalIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalText: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: FontWeight.regular,
    lineHeight: 22,
  },
})
