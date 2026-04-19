import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
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

interface TradeProposalCardProps {
  team?: string
  teamA: { name: string; receives: string[] }
  teamB: { name: string; receives: string[] }
  fairnessScore: number
  onApprove?: () => void
  onReject?: () => void
  onPress?: () => void
}

function getScoreColor(score: number): string {
  if (score >= 70) return Colors.success
  if (score >= 40) return Colors.warning
  return Colors.error
}

export default function TradeProposalCard({
  team,
  teamA,
  teamB,
  fairnessScore,
  onApprove,
  onReject,
  onPress,
}: TradeProposalCardProps) {
  const { colors } = useTheme()
  const scoreColor = getScoreColor(fairnessScore)

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={!onPress}>
      <TeamAccentBorder team={team}>
        <View style={styles.header}>
          <Ionicons name="swap-horizontal" size={18} color={Colors.primary} />
          <Text style={[styles.headerLabel, { color: Colors.primary }]}>
            TRADE PROPOSAL
          </Text>
        </View>

        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={[styles.columnHeader, { color: colors.textMuted }]}>
              {teamA.name} receives
            </Text>
            {teamA.receives.map((player, i) => (
              <Text key={i} style={[styles.playerName, { color: colors.text }]}>
                {player}
              </Text>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.column}>
            <Text style={[styles.columnHeader, { color: colors.textMuted }]}>
              {teamB.name} receives
            </Text>
            {teamB.receives.map((player, i) => (
              <Text key={i} style={[styles.playerName, { color: colors.text }]}>
                {player}
              </Text>
            ))}
          </View>
        </View>

        {/* Fairness score bar */}
        <View style={styles.scoreSection}>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
            Fairness Score
          </Text>
          <View style={[styles.scoreTrack, { backgroundColor: colors.surfaceHighlight }]}>
            <View
              style={[
                styles.scoreFill,
                {
                  width: `${fairnessScore}%` as any,
                  backgroundColor: scoreColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>
            {fairnessScore}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: Colors.success + '15', borderColor: Colors.success },
            ]}
            onPress={onApprove}
            accessibilityLabel="Approve trade"
            accessibilityRole="button"
          >
            <Ionicons name="checkmark" size={18} color={Colors.success} />
            <Text style={[styles.actionText, { color: Colors.success }]}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: Colors.error + '15', borderColor: Colors.error },
            ]}
            onPress={onReject}
            accessibilityLabel="Reject trade"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={18} color={Colors.error} />
            <Text style={[styles.actionText, { color: Colors.error }]}>Reject</Text>
          </TouchableOpacity>
        </View>
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
  columns: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  column: {
    flex: 1,
    gap: Spacing.xs,
  },
  columnHeader: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  playerName: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
  },
  divider: {
    width: 1,
    marginHorizontal: Spacing.md,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  scoreLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.medium,
    width: 70,
  },
  scoreTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreValue: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.bold,
    width: 30,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: Interactive.minTapTarget,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionText: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.semibold,
  },
})
