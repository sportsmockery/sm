import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import { Colors, FontSize, FontWeight, Spacing, Card } from '@/lib/design-tokens'
import type { Badge } from '@/hooks/useLoyalty'

interface BadgeCardProps {
  badge: Badge
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  const { colors, isDark } = useTheme()
  const earned = !!badge.earnedAt

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: earned ? Colors.gold : colors.border,
          opacity: earned ? 1 : 0.5,
        },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: earned ? Colors.gold : (isDark ? '#1C2430' : '#F3F4F6') },
        ]}
      >
        <Ionicons
          name={badge.icon as keyof typeof Ionicons.glyphMap}
          size={20}
          color={earned ? '#fff' : colors.textMuted}
        />
      </View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{badge.name}</Text>
      <Text style={[styles.desc, { color: colors.textMuted }]} numberOfLines={2}>{badge.description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: '23%',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 4,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  desc: {
    fontSize: 9,
    fontWeight: FontWeight.regular,
    textAlign: 'center',
    marginTop: 2,
  },
})
