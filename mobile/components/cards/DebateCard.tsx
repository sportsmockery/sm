import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import { Colors, FontSize, FontWeight, Spacing, Interactive } from '@/lib/design-tokens'
import TeamAccentBorder from './TeamAccentBorder'

interface DebateCardProps {
  team?: string
  question: string
  sideA: { label: string; votes: number }
  sideB: { label: string; votes: number }
  totalParticipants: number
  onVote?: (side: 'A' | 'B') => void
  onPress?: () => void
}

export default function DebateCard({
  team,
  question,
  sideA,
  sideB,
  totalParticipants,
  onVote,
  onPress,
}: DebateCardProps) {
  const { colors } = useTheme()
  const [voted, setVoted] = useState<'A' | 'B' | null>(null)

  const total = sideA.votes + sideB.votes
  const pctA = total > 0 ? Math.round((sideA.votes / total) * 100) : 50
  const pctB = total > 0 ? 100 - pctA : 50

  const handleVote = (side: 'A' | 'B') => {
    if (voted) return
    setVoted(side)
    onVote?.(side)
  }

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={!onPress}>
      <TeamAccentBorder team={team}>
        <View style={styles.header}>
          <Ionicons name="people" size={18} color={Colors.edgeCyan} />
          <Text style={[styles.headerLabel, { color: Colors.edgeCyan }]}>DEBATE</Text>
        </View>

        <Text style={[styles.question, { color: colors.text }]}>{question}</Text>

        <View style={styles.sides}>
          <TouchableOpacity
            style={[
              styles.sideButton,
              {
                backgroundColor: voted === 'A' ? Colors.edgeCyan : Colors.edgeCyan + '15',
                borderColor: Colors.edgeCyan,
              },
            ]}
            onPress={() => handleVote('A')}
            disabled={voted !== null}
            accessibilityLabel={`${sideA.label}, ${pctA} percent`}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.sideLabel,
                { color: voted === 'A' ? Colors.white : Colors.edgeCyan },
              ]}
              numberOfLines={2}
            >
              {sideA.label}
            </Text>
            {voted && (
              <Text
                style={[
                  styles.sidePct,
                  { color: voted === 'A' ? Colors.white : Colors.edgeCyan },
                ]}
              >
                {pctA}%
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sideButton,
              {
                backgroundColor: voted === 'B' ? Colors.primary : Colors.primary + '15',
                borderColor: Colors.primary,
              },
            ]}
            onPress={() => handleVote('B')}
            disabled={voted !== null}
            accessibilityLabel={`${sideB.label}, ${pctB} percent`}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.sideLabel,
                { color: voted === 'B' ? Colors.white : Colors.primary },
              ]}
              numberOfLines={2}
            >
              {sideB.label}
            </Text>
            {voted && (
              <Text
                style={[
                  styles.sidePct,
                  { color: voted === 'B' ? Colors.white : Colors.primary },
                ]}
              >
                {pctB}%
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.participants, { color: colors.textMuted }]}>
          {totalParticipants.toLocaleString()} fans participating
        </Text>
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
  question: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.bold,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  sides: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sideButton: {
    flex: 1,
    minHeight: Interactive.minTapTarget,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  sideLabel: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  sidePct: {
    fontSize: FontSize.sectionSubtitle,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.xs,
  },
  participants: {
    fontSize: FontSize.meta,
    textAlign: 'center',
  },
})
