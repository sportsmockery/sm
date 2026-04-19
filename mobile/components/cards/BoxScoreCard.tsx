import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useTheme } from '@/hooks/useTheme'
import { Colors, FontSize, FontWeight, Spacing, Interactive } from '@/lib/design-tokens'
import TeamAccentBorder from './TeamAccentBorder'

interface TeamScore {
  name: string
  abbreviation?: string
  logoUrl?: string
  score: number
}

interface BoxScoreCardProps {
  team?: string
  homeTeam: TeamScore
  awayTeam: TeamScore
  period?: string
  clock?: string
  status: 'LIVE' | 'FINAL' | 'UPCOMING'
  keyPerformer?: string
  onPress?: () => void
}

const STATUS_COLORS: Record<string, string> = {
  LIVE: '#22c55e',
  FINAL: '#6B7280',
  UPCOMING: '#00D4FF',
}

export default function BoxScoreCard({
  team,
  homeTeam,
  awayTeam,
  period,
  clock,
  status,
  keyPerformer,
  onPress,
}: BoxScoreCardProps) {
  const { colors } = useTheme()
  const statusColor = STATUS_COLORS[status] ?? colors.textMuted

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={!onPress}>
      <TeamAccentBorder team={team}>
        <View style={styles.header}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
          {(period || clock) && (
            <Text style={[styles.periodClock, { color: colors.textSecondary }]}>
              {period}{clock ? ` · ${clock}` : ''}
            </Text>
          )}
        </View>

        <View style={styles.scoreBoard}>
          {/* Away team */}
          <View style={styles.teamRow}>
            {awayTeam.logoUrl ? (
              <Image
                source={{ uri: awayTeam.logoUrl }}
                style={styles.teamLogo}
                contentFit="contain"
              />
            ) : (
              <View style={[styles.logoPlaceholder, { backgroundColor: colors.surfaceHighlight }]} />
            )}
            <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
              {awayTeam.abbreviation ?? awayTeam.name}
            </Text>
            <Text style={[styles.score, { color: colors.text }]}>{awayTeam.score}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Home team */}
          <View style={styles.teamRow}>
            {homeTeam.logoUrl ? (
              <Image
                source={{ uri: homeTeam.logoUrl }}
                style={styles.teamLogo}
                contentFit="contain"
              />
            ) : (
              <View style={[styles.logoPlaceholder, { backgroundColor: colors.surfaceHighlight }]} />
            )}
            <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
              {homeTeam.abbreviation ?? homeTeam.name}
            </Text>
            <Text style={[styles.score, { color: colors.text }]}>{homeTeam.score}</Text>
          </View>
        </View>

        {keyPerformer && (
          <Text style={[styles.keyPerformer, { color: colors.textSecondary }]}>
            {keyPerformer}
          </Text>
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
  periodClock: {
    fontSize: FontSize.meta,
    fontWeight: FontWeight.medium,
  },
  scoreBoard: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Interactive.minTapTarget,
    gap: Spacing.md,
  },
  teamLogo: {
    width: 32,
    height: 32,
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  teamName: {
    flex: 1,
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.medium,
  },
  score: {
    fontSize: FontSize.sectionTitle,
    fontWeight: FontWeight.bold,
    minWidth: 40,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.xs,
  },
  keyPerformer: {
    fontSize: FontSize.meta,
    fontStyle: 'italic',
  },
})
