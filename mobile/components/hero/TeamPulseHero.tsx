import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Card,
  Interactive,
  getTeamAccent,
} from '@/lib/design-tokens'
import type { TeamPulseHeroData } from './MobileHero'

interface TeamPulseHeroProps {
  data: TeamPulseHeroData
  onPressTopic?: (topic: string) => void
}

export function TeamPulseHero({ data, onPressTopic }: TeamPulseHeroProps) {
  const { colors, isDark } = useTheme()
  const accentColor = getTeamAccent(data.teamKey)

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surfaceElevated : colors.surface,
          borderLeftColor: accentColor,
        },
      ]}
    >
      {/* "Your Team" label */}
      <Text style={[styles.label, { color: colors.textMuted }]}>YOUR TEAM</Text>

      {/* Team name */}
      <Text style={[styles.teamName, { color: colors.text }]}>
        {data.teamName}
      </Text>

      {/* Trending topic chips */}
      <View style={styles.chipsContainer}>
        {data.topics.slice(0, 3).map((topic, index) => (
          <Pressable
            key={index}
            onPress={() => onPressTopic?.(topic)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(11,15,20,0.04)',
                borderColor: isDark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(11,15,20,0.08)',
              },
              pressed && styles.chipPressed,
            ]}
          >
            <View style={[styles.chipDot, { backgroundColor: accentColor }]} />
            <Text
              style={[styles.chipText, { color: colors.text }]}
              numberOfLines={1}
            >
              {topic}
            </Text>
          </Pressable>
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
  label: {
    fontSize: FontSize.badge,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  teamName: {
    fontSize: FontSize.heroLarge,
    fontWeight: FontWeight.bold,
    lineHeight: 42,
    marginBottom: Spacing.xl,
  },
  chipsContainer: {
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: Interactive.minTapTarget,
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.md,
  },
  chipText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.regular,
    flex: 1,
  },
})
