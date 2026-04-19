import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Interactive,
} from '@/lib/design-tokens'
import type { DebateHeroData } from './MobileHero'

interface DebateHeroProps {
  data: DebateHeroData
  onPressSide?: (side: 'a' | 'b', debateId: string) => void
}

export function DebateHero({ data, onPressSide }: DebateHeroProps) {
  const { colors, isDark } = useTheme()

  const totalPct = data.sideA.percentage + data.sideB.percentage
  const aPct = totalPct > 0 ? Math.round((data.sideA.percentage / totalPct) * 100) : 50
  const bPct = totalPct > 0 ? 100 - aPct : 50

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.surfaceElevated : colors.surface },
      ]}
    >
      {/* Debate label */}
      <View style={styles.labelRow}>
        <Ionicons name="chatbubbles" size={16} color={Colors.primary} />
        <Text style={[styles.label, { color: colors.textMuted }]}>DEBATE</Text>
      </View>

      {/* Question */}
      <Text style={[styles.question, { color: colors.text }]} numberOfLines={3}>
        {data.question}
      </Text>

      {/* Side buttons */}
      <View style={styles.sidesRow}>
        <Pressable
          onPress={() => onPressSide?.('a', data.debateId)}
          style={({ pressed }) => [
            styles.sideButton,
            { backgroundColor: Colors.edgeCyan },
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.sideButtonText} numberOfLines={1}>
            {data.sideA.label}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onPressSide?.('b', data.debateId)}
          style={({ pressed }) => [
            styles.sideButton,
            { backgroundColor: Colors.primary },
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.sideButtonText} numberOfLines={1}>
            {data.sideB.label}
          </Text>
        </Pressable>
      </View>

      {/* Percentage bars */}
      <View style={styles.barsContainer}>
        <View style={styles.barRow}>
          <View
            style={[
              styles.barFill,
              {
                width: `${aPct}%`,
                backgroundColor: Colors.edgeCyan,
              },
            ]}
          />
          <View
            style={[
              styles.barFill,
              {
                width: `${bPct}%`,
                backgroundColor: Colors.primary,
              },
            ]}
          />
        </View>
        <View style={styles.pctLabels}>
          <Text style={[styles.pctText, { color: Colors.edgeCyan }]}>{aPct}%</Text>
          <Text style={[styles.pctText, { color: Colors.primary }]}>{bPct}%</Text>
        </View>
      </View>

      {/* Participation count */}
      <Text style={[styles.participantCount, { color: colors.textMuted }]}>
        {data.participantCount.toLocaleString()} votes
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: 250,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.badge,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.5,
  },
  question: {
    fontSize: FontSize.sectionTitle,
    fontWeight: FontWeight.bold,
    lineHeight: 28,
    marginBottom: Spacing.lg,
  },
  sidesRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sideButton: {
    flex: 1,
    minHeight: Interactive.minTapTarget,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  sideButtonText: {
    color: Colors.white,
    fontSize: FontSize.label,
    fontWeight: FontWeight.bold,
  },
  pressed: {
    opacity: 0.85,
  },
  barsContainer: {
    marginBottom: Spacing.sm,
  },
  barRow: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    gap: 2,
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  pctLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  pctText: {
    fontSize: FontSize.badge,
    fontWeight: FontWeight.bold,
  },
  participantCount: {
    fontSize: FontSize.meta,
    fontWeight: FontWeight.regular,
    textAlign: 'center',
  },
})
