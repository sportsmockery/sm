import React, { useState } from 'react'
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

interface PredictionTeam {
  name: string
  abbreviation?: string
  logoUrl?: string
  predictedScore: number
}

interface ScoutPredictionCardProps {
  team?: string
  homeTeam: PredictionTeam
  awayTeam: PredictionTeam
  winProbability: number // 0-100 for home team
  onVote?: (agree: boolean) => void
  onPress?: () => void
}

export default function ScoutPredictionCard({
  team,
  homeTeam,
  awayTeam,
  winProbability,
  onVote,
  onPress,
}: ScoutPredictionCardProps) {
  const { colors } = useTheme()
  const [voted, setVoted] = useState<boolean | null>(null)

  const handleVote = (agree: boolean) => {
    if (voted !== null) return
    setVoted(agree)
    onVote?.(agree)
  }

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={!onPress}>
      <TeamAccentBorder team={team}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/scout-mobile.png')}
            style={styles.avatar}
            contentFit="contain"
          />
          <Text style={[styles.headerLabel, { color: Colors.edgeCyan }]}>
            SCOUT PREDICTION
          </Text>
        </View>

        {/* Matchup */}
        <View style={styles.matchup}>
          <View style={styles.teamSide}>
            {awayTeam.logoUrl ? (
              <Image
                source={{ uri: awayTeam.logoUrl }}
                style={styles.teamLogo}
                contentFit="contain"
              />
            ) : (
              <View
                style={[
                  styles.logoPlaceholder,
                  { backgroundColor: colors.surfaceHighlight },
                ]}
              />
            )}
            <Text style={[styles.teamName, { color: colors.textSecondary }]}>
              {awayTeam.abbreviation ?? awayTeam.name}
            </Text>
            <Text style={[styles.predictedScore, { color: colors.text }]}>
              {awayTeam.predictedScore}
            </Text>
          </View>

          <Text style={[styles.vs, { color: colors.textMuted }]}>vs</Text>

          <View style={styles.teamSide}>
            {homeTeam.logoUrl ? (
              <Image
                source={{ uri: homeTeam.logoUrl }}
                style={styles.teamLogo}
                contentFit="contain"
              />
            ) : (
              <View
                style={[
                  styles.logoPlaceholder,
                  { backgroundColor: colors.surfaceHighlight },
                ]}
              />
            )}
            <Text style={[styles.teamName, { color: colors.textSecondary }]}>
              {homeTeam.abbreviation ?? homeTeam.name}
            </Text>
            <Text style={[styles.predictedScore, { color: colors.text }]}>
              {homeTeam.predictedScore}
            </Text>
          </View>
        </View>

        {/* Win probability bar */}
        <View style={styles.probSection}>
          <Text style={[styles.probLabel, { color: colors.textMuted }]}>
            Win Probability
          </Text>
          <View
            style={[styles.probTrack, { backgroundColor: colors.surfaceHighlight }]}
          >
            <View
              style={[
                styles.probFill,
                {
                  width: `${winProbability}%` as any,
                  backgroundColor: Colors.edgeCyan,
                },
              ]}
            />
          </View>
          <View style={styles.probLabels}>
            <Text style={[styles.probPct, { color: Colors.edgeCyan }]}>
              {100 - winProbability}%
            </Text>
            <Text style={[styles.probPct, { color: Colors.primary }]}>
              {winProbability}%
            </Text>
          </View>
        </View>

        {/* Vote buttons */}
        <View style={styles.voteRow}>
          <TouchableOpacity
            style={[
              styles.voteButton,
              {
                backgroundColor:
                  voted === true ? Colors.success + '20' : colors.surfaceHighlight,
                borderColor: voted === true ? Colors.success : colors.border,
              },
            ]}
            onPress={() => handleVote(true)}
            disabled={voted !== null}
            accessibilityLabel="Agree with prediction"
            accessibilityRole="button"
          >
            <Ionicons
              name="thumbs-up"
              size={18}
              color={voted === true ? Colors.success : colors.textMuted}
            />
            <Text
              style={[
                styles.voteText,
                { color: voted === true ? Colors.success : colors.textSecondary },
              ]}
            >
              Agree
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.voteButton,
              {
                backgroundColor:
                  voted === false ? Colors.error + '20' : colors.surfaceHighlight,
                borderColor: voted === false ? Colors.error : colors.border,
              },
            ]}
            onPress={() => handleVote(false)}
            disabled={voted !== null}
            accessibilityLabel="Disagree with prediction"
            accessibilityRole="button"
          >
            <Ionicons
              name="thumbs-down"
              size={18}
              color={voted === false ? Colors.error : colors.textMuted}
            />
            <Text
              style={[
                styles.voteText,
                { color: voted === false ? Colors.error : colors.textSecondary },
              ]}
            >
              Disagree
            </Text>
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
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: Interactive.avatarSmall,
    height: Interactive.avatarSmall,
    borderRadius: Interactive.avatarSmall / 2,
  },
  headerLabel: {
    fontSize: FontSize.badge,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  matchup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  teamSide: {
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  teamLogo: {
    width: Interactive.teamLogoMedium,
    height: Interactive.teamLogoMedium,
  },
  logoPlaceholder: {
    width: Interactive.teamLogoMedium,
    height: Interactive.teamLogoMedium,
    borderRadius: Interactive.teamLogoMedium / 2,
  },
  teamName: {
    fontSize: FontSize.meta,
    fontWeight: FontWeight.medium,
  },
  predictedScore: {
    fontSize: FontSize.sectionTitle,
    fontWeight: FontWeight.bold,
  },
  vs: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.medium,
    marginHorizontal: Spacing.sm,
  },
  probSection: {
    marginBottom: Spacing.lg,
  },
  probLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  probTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  probFill: {
    height: '100%',
    borderRadius: 4,
  },
  probLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  probPct: {
    fontSize: FontSize.meta,
    fontWeight: FontWeight.semibold,
  },
  voteRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  voteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: Interactive.minTapTarget,
    borderRadius: 8,
    borderWidth: 1,
  },
  voteText: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.semibold,
  },
})
