import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import { Colors, FontSize, FontWeight, Spacing, Card } from '@/lib/design-tokens'
import TeamAccentBorder from './TeamAccentBorder'
import CardActions from './CardActions'

interface TrendingArticleCardProps {
  team?: string
  headline: string
  summary?: string
  viewVelocity?: string
  reactions?: { smartTake: number; hot: number }
  comments?: number
  onPress?: () => void
  onShare?: () => void
}

export default function TrendingArticleCard({
  team,
  headline,
  summary,
  viewVelocity,
  reactions,
  comments,
  onPress,
  onShare,
}: TrendingArticleCardProps) {
  const { colors } = useTheme()

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={!onPress}>
      <TeamAccentBorder team={team}>
        <View style={styles.trendingBadge}>
          <Ionicons name="flame" size={14} color={Colors.primary} />
          <Text style={[styles.trendingText, { color: Colors.primary }]}>TRENDING</Text>
        </View>

        {viewVelocity && (
          <Text style={[styles.velocity, { color: colors.textMuted }]}>
            {viewVelocity}
          </Text>
        )}

        <Text style={[styles.headline, { color: colors.text }]}>{headline}</Text>

        {summary && (
          <Text
            style={[styles.summary, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {summary}
          </Text>
        )}

        <CardActions reactions={reactions} comments={comments} onShare={onShare} />
      </TeamAccentBorder>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  trendingText: {
    fontSize: FontSize.badge,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  velocity: {
    fontSize: FontSize.caption,
    marginBottom: Spacing.sm,
  },
  headline: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.bold,
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  summary: {
    fontSize: FontSize.bodySmall,
    lineHeight: 22,
  },
})
