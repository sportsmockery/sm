import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Card,
  Interactive,
  Motion,
} from '@/lib/design-tokens'
import TeamAccentBorder from './TeamAccentBorder'

interface PollOption {
  id: string
  text: string
  votes: number
}

interface PollCardProps {
  team?: string
  question: string
  options: PollOption[]
  totalVotes: number
  status?: 'LIVE' | 'CLOSED'
  onVote?: (optionId: string) => void
  onPress?: () => void
}

export default function PollCard({
  team,
  question,
  options,
  totalVotes,
  status = 'LIVE',
  onVote,
  onPress,
}: PollCardProps) {
  const { colors } = useTheme()
  const [votedId, setVotedId] = useState<string | null>(null)

  const handleVote = (optionId: string) => {
    if (votedId || status === 'CLOSED') return
    setVotedId(optionId)
    onVote?.(optionId)
  }

  const showResults = votedId !== null || status === 'CLOSED'
  const optionColors = [Colors.edgeCyan, Colors.primary, Colors.gold, '#6B7280']

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={!onPress}>
      <TeamAccentBorder team={team}>
        <View style={styles.header}>
          <Ionicons name="stats-chart" size={18} color={Colors.edgeCyan} />
          <Text style={[styles.pollLabel, { color: Colors.edgeCyan }]}>POLL</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  status === 'LIVE' ? Colors.success : colors.textMuted,
              },
            ]}
          >
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <Text style={[styles.question, { color: colors.text }]}>{question}</Text>

        {options.map((option, index) => {
          const pct = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0
          const barColor = optionColors[index % optionColors.length]

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                {
                  borderColor: votedId === option.id ? barColor : colors.border,
                  backgroundColor: colors.surfaceHighlight,
                },
              ]}
              onPress={() => handleVote(option.id)}
              disabled={showResults}
              accessibilityLabel={`${option.text}, ${Math.round(pct)} percent`}
              accessibilityRole="button"
            >
              {showResults && (
                <View
                  style={[
                    styles.voteBar,
                    {
                      width: `${pct}%` as any,
                      backgroundColor: barColor,
                      opacity: 0.15,
                    },
                  ]}
                />
              )}
              <Text style={[styles.optionText, { color: colors.text }]}>
                {option.text}
              </Text>
              {showResults && (
                <Text style={[styles.pctText, { color: colors.textSecondary }]}>
                  {Math.round(pct)}%
                </Text>
              )}
            </TouchableOpacity>
          )
        })}

        <Text style={[styles.totalVotes, { color: colors.textMuted }]}>
          {totalVotes.toLocaleString()} votes
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
  pollLabel: {
    fontSize: FontSize.badge,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: Colors.white,
    fontSize: FontSize.badge,
    fontWeight: FontWeight.bold,
  },
  question: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.bold,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: Interactive.minTapTarget,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  voteBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
  },
  optionText: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  pctText: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.semibold,
    marginLeft: Spacing.sm,
  },
  totalVotes: {
    fontSize: FontSize.meta,
    marginTop: Spacing.xs,
  },
})
