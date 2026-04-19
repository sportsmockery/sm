import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import { useHaptics } from '@/hooks/useHaptics'
import { FontSize, FontWeight, Spacing, Interactive } from '@/lib/design-tokens'

interface CardActionsProps {
  reactions?: { smartTake: number; hot: number }
  comments?: number
  onShare?: () => void
}

export default function CardActions({ reactions, comments, onShare }: CardActionsProps) {
  const { colors } = useTheme()
  const { trigger } = useHaptics()

  const formatCount = (n?: number) => {
    if (!n) return '0'
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
    return String(n)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.action}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={() => trigger('impact_light')}
        accessibilityLabel={`Smart take, ${reactions?.smartTake ?? 0}`}
        accessibilityRole="button"
      >
        <Ionicons name="thumbs-up-outline" size={20} color={colors.textMuted} />
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {formatCount(reactions?.smartTake)}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.action}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={() => trigger('impact_light')}
        accessibilityLabel={`Hot, ${reactions?.hot ?? 0}`}
        accessibilityRole="button"
      >
        <Ionicons name="flame-outline" size={20} color={colors.textMuted} />
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {formatCount(reactions?.hot)}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.action}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={`Comments, ${comments ?? 0}`}
        accessibilityRole="button"
      >
        <Ionicons name="chatbubble-outline" size={20} color={colors.textMuted} />
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {formatCount(comments)}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.action}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={() => { trigger('selection'); onShare?.() }}
        accessibilityLabel="Share"
        accessibilityRole="button"
      >
        <Ionicons name="share-outline" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingTop: Spacing.md,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: Interactive.minTapTarget,
    minWidth: Interactive.minTapTarget,
    justifyContent: 'center',
  },
  count: {
    fontSize: FontSize.meta,
    fontWeight: FontWeight.regular,
  },
})
