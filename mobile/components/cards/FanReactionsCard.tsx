import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import { Colors, FontSize, FontWeight, Spacing, Card, Interactive } from '@/lib/design-tokens'
import TeamAccentBorder from './TeamAccentBorder'

interface FanQuote {
  id: string
  name: string
  quote: string
}

interface FanReactionsCardProps {
  team?: string
  quotes: FanQuote[]
  isLive?: boolean
  onJoinChat?: () => void
  onPress?: () => void
}

export default function FanReactionsCard({
  team,
  quotes,
  isLive = true,
  onJoinChat,
  onPress,
}: FanReactionsCardProps) {
  const { colors } = useTheme()

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={!onPress}>
      <TeamAccentBorder team={team}>
        <View style={styles.header}>
          <Ionicons name="chatbubbles" size={18} color={colors.text} />
          <Text style={[styles.headerText, { color: colors.text }]}>
            What Fans Are Saying
          </Text>
          {isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        <View style={styles.quotes}>
          {quotes.slice(0, 3).map((fan) => (
            <View
              key={fan.id}
              style={[styles.quoteCard, { backgroundColor: colors.surfaceHighlight }]}
            >
              <View style={styles.quoteHeader}>
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: colors.textMuted + '30' },
                  ]}
                >
                  <Ionicons
                    name="person"
                    size={14}
                    color={colors.textMuted}
                  />
                </View>
                <Text style={[styles.fanName, { color: colors.text }]}>
                  {fan.name}
                </Text>
              </View>
              <Text
                style={[styles.quoteText, { color: colors.textSecondary }]}
                numberOfLines={3}
              >
                {fan.quote}
              </Text>
            </View>
          ))}
        </View>

        {onJoinChat && (
          <TouchableOpacity
            style={styles.joinChat}
            onPress={onJoinChat}
            accessibilityLabel="Join Fan Chat"
            accessibilityRole="button"
          >
            <Ionicons name="chatbubble-ellipses" size={16} color={Colors.edgeCyan} />
            <Text style={[styles.joinChatText, { color: Colors.edgeCyan }]}>
              Join Fan Chat
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
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  headerText: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.bold,
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  liveText: {
    color: Colors.white,
    fontSize: FontSize.badge,
    fontWeight: FontWeight.bold,
  },
  quotes: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  quoteCard: {
    borderRadius: 8,
    padding: Spacing.md,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fanName: {
    fontSize: FontSize.meta,
    fontWeight: FontWeight.semibold,
  },
  quoteText: {
    fontSize: FontSize.label,
    lineHeight: 20,
  },
  joinChat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: Interactive.minTapTarget,
  },
  joinChatText: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.medium,
  },
})
