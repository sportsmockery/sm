import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import { Colors, FontSize, FontWeight, Spacing, Card } from '@/lib/design-tokens'
import TeamAccentBorder from './TeamAccentBorder'

interface ChartBar {
  label: string
  value: number
  color?: string
}

interface ChartCardProps {
  team?: string
  headline: string
  bars: ChartBar[]
  takeaway?: string
  source?: string
  onPress?: () => void
}

export default function ChartCard({
  team,
  headline,
  bars,
  takeaway,
  source,
  onPress,
}: ChartCardProps) {
  const { colors } = useTheme()

  const maxValue = Math.max(...bars.map((b) => b.value), 1)

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={!onPress}>
      <TeamAccentBorder team={team}>
        <View style={styles.header}>
          <Ionicons name="bar-chart-outline" size={18} color={Colors.edgeCyan} />
          <Text style={[styles.headerLabel, { color: Colors.edgeCyan }]}>
            ANALYTICS
          </Text>
        </View>

        <Text style={[styles.headline, { color: colors.text }]}>{headline}</Text>

        <View style={styles.chart}>
          {bars.map((bar, index) => {
            const widthPct = (bar.value / maxValue) * 100
            const barColor = bar.color ?? Colors.edgeCyan

            return (
              <View key={index} style={styles.barRow}>
                <Text
                  style={[styles.barLabel, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {bar.label}
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${widthPct}%` as any,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barValue, { color: colors.text }]}>
                  {bar.value}
                </Text>
              </View>
            )
          })}
        </View>

        {takeaway && (
          <Text style={[styles.takeaway, { color: colors.textSecondary }]}>
            {takeaway}
          </Text>
        )}

        {source && (
          <Text style={[styles.source, { color: colors.textMuted }]}>
            Source: {source}
          </Text>
        )}
      </TeamAccentBorder>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  headerLabel: {
    fontSize: FontSize.badge,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  headline: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.bold,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  chart: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  barLabel: {
    width: 72,
    fontSize: FontSize.meta,
    fontWeight: FontWeight.medium,
  },
  barTrack: {
    flex: 1,
    height: 20,
    borderRadius: 4,
    backgroundColor: 'rgba(0,212,255,0.08)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    opacity: 0.85,
  },
  barValue: {
    width: 40,
    textAlign: 'right',
    fontSize: FontSize.meta,
    fontWeight: FontWeight.semibold,
  },
  takeaway: {
    fontSize: FontSize.label,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  source: {
    fontSize: FontSize.caption,
  },
})
