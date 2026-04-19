import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useTheme } from '@/hooks/useTheme'
import { Colors, FontSize, FontWeight, Spacing, Card } from '@/lib/design-tokens'
import TeamAccentBorder from './TeamAccentBorder'
import CardActions from './CardActions'

interface EditorialCardProps {
  team?: string
  category?: string
  headline: string
  summary?: string
  imageUrl?: string
  insight?: { text: string }
  author?: string
  timestamp?: string
  reactions?: { smartTake: number; hot: number }
  comments?: number
  onPress?: () => void
  onShare?: () => void
}

const CATEGORY_COLORS: Record<string, string> = {
  BREAKING: Colors.primary,
  RUMOR: Colors.primary,
  ANALYSIS: Colors.edgeCyan,
  REPORT: '#6B7280',
}

export default function EditorialCard({
  team,
  category,
  headline,
  summary,
  imageUrl,
  insight,
  author,
  timestamp,
  reactions,
  comments,
  onPress,
  onShare,
}: EditorialCardProps) {
  const { colors } = useTheme()

  const badgeColor = category
    ? CATEGORY_COLORS[category.toUpperCase()] ?? colors.textMuted
    : colors.textMuted

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={headline}
    >
      <TeamAccentBorder team={team}>
        {category && (
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{category.toUpperCase()}</Text>
          </View>
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

        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        )}

        {insight && (
          <View
            style={[
              styles.insight,
              {
                borderLeftColor: Colors.edgeCyan,
                backgroundColor: colors.surfaceHighlight,
              },
            ]}
          >
            <Text style={[styles.insightText, { color: colors.textSecondary }]}>
              {insight.text}
            </Text>
          </View>
        )}

        <View style={styles.meta}>
          {author && (
            <Text style={[styles.metaText, { color: colors.textMuted }]}>{author}</Text>
          )}
          {author && timestamp && (
            <Text style={[styles.metaText, { color: colors.textMuted }]}> · </Text>
          )}
          {timestamp && (
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {timestamp}
            </Text>
          )}
        </View>

        <CardActions reactions={reactions} comments={comments} onShare={onShare} />
      </TeamAccentBorder>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: Spacing.sm,
  },
  badgeText: {
    color: Colors.white,
    fontSize: FontSize.badge,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
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
    marginBottom: Spacing.md,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  insight: {
    borderLeftWidth: Card.accentBorderWidth,
    paddingLeft: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 4,
    marginBottom: Spacing.md,
  },
  insightText: {
    fontSize: FontSize.label,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: FontSize.meta,
  },
})
