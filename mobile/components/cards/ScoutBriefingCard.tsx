import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Interactive,
} from '@/lib/design-tokens'
import TeamAccentBorder from './TeamAccentBorder'

interface ScoutBriefingCardProps {
  team?: string
  items: string[]
  onPlayAudio?: () => void
  onAskScout?: () => void
  onPress?: () => void
}

export default function ScoutBriefingCard({
  team,
  items,
  onPlayAudio,
  onAskScout,
  onPress,
}: ScoutBriefingCardProps) {
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
          <View>
            <Text style={[styles.scoutLabel, { color: Colors.edgeCyan }]}>
              SCOUT AI
            </Text>
            <Text style={[styles.heading, { color: colors.text }]}>
              Daily Briefing
            </Text>
          </View>
        </View>

        <View style={styles.items}>
          {items.slice(0, 4).map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.bullet} />
              <Text style={[styles.itemText, { color: colors.text }]}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          {onPlayAudio && (
            <TouchableOpacity
              style={[
                styles.audioButton,
                { backgroundColor: Colors.edgeCyan + '15', borderColor: Colors.edgeCyan },
              ]}
              onPress={onPlayAudio}
              accessibilityLabel="Play audio briefing"
              accessibilityRole="button"
            >
              <Ionicons name="play-circle" size={20} color={Colors.edgeCyan} />
              <Text style={[styles.audioText, { color: Colors.edgeCyan }]}>
                Play Audio
              </Text>
            </TouchableOpacity>
          )}

          {onAskScout && (
            <TouchableOpacity
              style={styles.askScout}
              onPress={onAskScout}
              accessibilityLabel="Ask Scout"
              accessibilityRole="button"
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={16}
                color={Colors.edgeCyan}
              />
              <Text style={[styles.askScoutText, { color: Colors.edgeCyan }]}>
                Ask Scout
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TeamAccentBorder>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: Interactive.avatarMedium,
    height: Interactive.avatarMedium,
    borderRadius: Interactive.avatarMedium / 2,
  },
  scoutLabel: {
    fontSize: FontSize.badge,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  heading: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.bold,
  },
  items: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.edgeCyan,
    marginTop: 7,
  },
  itemText: {
    flex: 1,
    fontSize: FontSize.bodySmall,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: Interactive.minTapTarget,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  audioText: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.semibold,
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
