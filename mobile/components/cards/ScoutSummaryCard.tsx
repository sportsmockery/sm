import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import { Colors, FontSize, FontWeight, Spacing, Interactive } from '@/lib/design-tokens'
import TeamAccentBorder from './TeamAccentBorder'

interface ScoutSummaryCardProps {
  team?: string
  topic: string
  summary: string
  insights: string[]
  onAskScout?: () => void
  onPress?: () => void
}

export default function ScoutSummaryCard({
  team,
  topic,
  summary,
  insights,
  onAskScout,
  onPress,
}: ScoutSummaryCardProps) {
  const { colors } = useTheme()

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={!onPress}>
      <TeamAccentBorder team={team}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/scout-mobile.png')}
            style={styles.avatar}
            contentFit="contain"
          />
          <View style={styles.headerText}>
            <Text style={[styles.scoutLabel, { color: Colors.edgeCyan }]}>
              SCOUT AI
            </Text>
            <Text style={[styles.topic, { color: colors.text }]}>{topic}</Text>
          </View>
        </View>

        <Text style={[styles.summary, { color: colors.textSecondary }]}>
          {summary}
        </Text>

        {insights.length > 0 && (
          <View style={styles.insights}>
            {insights.slice(0, 3).map((insight, index) => (
              <View key={index} style={styles.insightRow}>
                <View style={styles.cyanDot} />
                <Text style={[styles.insightText, { color: colors.text }]}>
                  {insight}
                </Text>
              </View>
            ))}
          </View>
        )}

        {onAskScout && (
          <TouchableOpacity
            style={styles.askScout}
            onPress={onAskScout}
            accessibilityLabel="Ask Scout"
            accessibilityRole="button"
          >
            <Ionicons name="chatbubble-ellipses" size={16} color={Colors.edgeCyan} />
            <Text style={[styles.askScoutText, { color: Colors.edgeCyan }]}>
              Ask Scout
            </Text>
          </TouchableOpacity>
        )}
      </TeamAccentBorder>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: Interactive.avatarMedium,
    height: Interactive.avatarMedium,
    borderRadius: Interactive.avatarMedium / 2,
  },
  headerText: {
    flex: 1,
  },
  scoutLabel: {
    fontSize: FontSize.badge,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  topic: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.bold,
    lineHeight: 24,
  },
  summary: {
    fontSize: FontSize.bodySmall,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  insights: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  cyanDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.edgeCyan,
    marginTop: 7,
  },
  insightText: {
    flex: 1,
    fontSize: FontSize.label,
    lineHeight: 20,
  },
  askScout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: Interactive.minTapTarget,
  },
  askScoutText: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.medium,
  },
})
