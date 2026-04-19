import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import { useLoyalty } from '@/hooks/useLoyalty'
import { Colors, FontSize, FontWeight, Spacing, Card } from '@/lib/design-tokens'
import BadgeCard from './BadgeCard'

export default function LoyaltyDashboard() {
  const { colors, isDark } = useTheme()
  const {
    streak,
    mvpLevel,
    mvpProgress,
    mvpNextLevel,
    badges,
    earnedCount,
    totalBadges,
  } = useLoyalty()

  return (
    <View style={styles.container}>
      {/* Streak + Level Row */}
      <View style={[styles.topRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Streak */}
        <View style={styles.streakSection}>
          <Ionicons name="flame" size={28} color={streak >= 3 ? Colors.primary : colors.textMuted} />
          <Text style={[styles.streakCount, { color: colors.text }]}>{streak}</Text>
          <Text style={[styles.streakLabel, { color: colors.textMuted }]}>day streak</Text>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* MVP Level */}
        <View style={styles.levelSection}>
          <Text style={[styles.levelLabel, { color: colors.textMuted }]}>EDGE Level</Text>
          <Text style={[styles.levelName, { color: Colors.gold }]}>{mvpLevel}</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#1C2430' : '#F3F4F6' }]}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(mvpProgress * 100, 100)}%`, backgroundColor: Colors.gold },
                ]}
              />
            </View>
            {mvpLevel !== 'MVP' && (
              <Text style={[styles.nextLevel, { color: colors.textMuted }]}>Next: {mvpNextLevel}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Badges */}
      <View style={styles.badgesSection}>
        <View style={styles.badgesHeader}>
          <Text style={[styles.badgesTitle, { color: colors.text }]}>Badges</Text>
          <Text style={[styles.badgesCount, { color: colors.textMuted }]}>
            {earnedCount}/{totalBadges}
          </Text>
        </View>
        <View style={styles.badgesGrid}>
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Card.borderRadius,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  streakSection: {
    alignItems: 'center',
    flex: 1,
  },
  streakCount: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    marginTop: 4,
  },
  streakLabel: {
    fontSize: FontSize.meta,
    fontWeight: FontWeight.regular,
  },
  divider: {
    width: 1,
    height: 60,
    marginHorizontal: Spacing.lg,
  },
  levelSection: {
    flex: 1.5,
  },
  levelLabel: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  levelName: {
    fontSize: FontSize.sectionTitle,
    fontWeight: FontWeight.bold,
    marginTop: 2,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  nextLevel: {
    fontSize: 11,
    fontWeight: FontWeight.regular,
    marginTop: 4,
  },
  badgesSection: {},
  badgesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badgesTitle: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.bold,
  },
  badgesCount: {
    fontSize: FontSize.meta,
    fontWeight: FontWeight.medium,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
})
