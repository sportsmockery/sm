import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { COLORS, API_BASE_URL } from '@/lib/config'
import { Colors, FontSize, FontWeight, Spacing, Card } from '@/lib/design-tokens'

type Segment = 'notifications' | 'polls' | 'badges'

interface Notification {
  id: string
  title: string
  body: string
  type: string
  created_at: string
  read: boolean
}

interface PollOption {
  id: string
  option_text: string
  vote_count: number
}

interface Poll {
  id: string
  question: string
  options: PollOption[]
  total_votes: number
  team_theme?: string
  status: string
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earned_at?: string
}

const PLACEHOLDER_BADGES: Badge[] = [
  { id: '1', name: 'First Take', description: 'Cast your first vote', icon: 'hand-left', earned: false },
  { id: '2', name: 'Daily Streak 3', description: 'Visit 3 days in a row', icon: 'flame', earned: false },
  { id: '3', name: 'Scout Explorer', description: 'Ask Scout 10 questions', icon: 'search', earned: false },
  { id: '4', name: 'War Room GM', description: 'Complete a trade in the simulator', icon: 'swap-horizontal', earned: false },
  { id: '5', name: 'All-Chicago Fan', description: 'Follow all 5 teams', icon: 'star', earned: false },
  { id: '6', name: 'Hot Take Artist', description: 'Get 50 reactions on a take', icon: 'flame', earned: false },
]

export default function ActivityScreen() {
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const { isAuthenticated } = useAuth()
  const [segment, setSegment] = useState<Segment>('notifications')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set())

  const fetchData = useCallback(async () => {
    try {
      if (segment === 'polls') {
        const res = await fetch(`${API_BASE_URL}/api/polls?status=active&limit=20`)
        if (res.ok) {
          const result = await res.json()
          setPolls(result.polls || [])
        }
      }
    } catch (error) {
      console.error('Error fetching activity data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [segment])

  useEffect(() => {
    setIsLoading(true)
    fetchData()
  }, [segment, fetchData])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchData()
  }

  const handleVote = async (pollId: string, optionId: string) => {
    if (votedPolls.has(pollId)) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      })
      if (res.ok) {
        setVotedPolls(prev => new Set([...prev, pollId]))
        fetchData()
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const getPercentage = (count: number, total: number) =>
    total === 0 ? 0 : Math.round((count / total) * 100)

  const renderSegmentControl = () => (
    <View style={[styles.segmentContainer, { backgroundColor: isDark ? '#141A22' : '#F3F4F6' }]}>
      {(['notifications', 'polls', 'badges'] as Segment[]).map((s) => (
        <TouchableOpacity
          key={s}
          style={[
            styles.segmentButton,
            segment === s && { backgroundColor: colors.surface },
          ]}
          onPress={() => setSegment(s)}
        >
          <Text
            style={[
              styles.segmentText,
              { color: segment === s ? colors.text : colors.textMuted },
              segment === s && { fontWeight: FontWeight.semibold },
            ]}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  const renderNotifications = () => {
    if (!isAuthenticated) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Sign in for notifications</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Get alerts for breaking news, game updates, and more.
          </Text>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: Colors.primary }]}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.ctaButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (notifications.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications yet</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            You'll see breaking news, game alerts, and community activity here.
          </Text>
        </View>
      )
    }

    return notifications.map((n) => (
      <View key={n.id} style={[styles.notificationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.notificationDot, !n.read && { backgroundColor: Colors.primary }]} />
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, { color: colors.text }]}>{n.title}</Text>
          <Text style={[styles.notificationBody, { color: colors.textMuted }]}>{n.body}</Text>
          <Text style={[styles.notificationTime, { color: colors.textMuted }]}>
            {new Date(n.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    ))
  }

  const renderPolls = () => {
    if (isLoading) {
      return <ActivityIndicator style={{ marginTop: 40 }} size="large" color={Colors.primary} />
    }

    if (polls.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="bar-chart-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No active polls</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Check back soon for new polls to vote on.
          </Text>
        </View>
      )
    }

    return polls.map((poll) => {
      const hasVoted = votedPolls.has(poll.id)
      return (
        <View key={poll.id} style={[styles.pollCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.pollQuestion, { color: colors.text }]}>{poll.question}</Text>
          {poll.options.map((option) => {
            const pct = getPercentage(option.vote_count, poll.total_votes)
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.pollOption, { borderColor: colors.border }]}
                onPress={() => handleVote(poll.id, option.id)}
                disabled={hasVoted}
              >
                {hasVoted && (
                  <View
                    style={[styles.pollBar, { width: `${pct}%`, backgroundColor: Colors.edgeCyan, opacity: 0.15 }]}
                  />
                )}
                <Text style={[styles.pollOptionText, { color: colors.text }]}>{option.option_text}</Text>
                {hasVoted && (
                  <Text style={[styles.pollPct, { color: Colors.edgeCyan }]}>{pct}%</Text>
                )}
              </TouchableOpacity>
            )
          })}
          <Text style={[styles.pollVoteCount, { color: colors.textMuted }]}>
            {poll.total_votes.toLocaleString()} votes
          </Text>
        </View>
      )
    })
  }

  const renderBadges = () => (
    <View style={styles.badgesGrid}>
      {PLACEHOLDER_BADGES.map((badge) => (
        <View
          key={badge.id}
          style={[
            styles.badgeCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: badge.earned ? 1 : 0.5,
            },
          ]}
        >
          <View
            style={[
              styles.badgeIcon,
              { backgroundColor: badge.earned ? Colors.gold : (isDark ? '#1C2430' : '#F3F4F6') },
            ]}
          >
            <Ionicons
              name={badge.icon as keyof typeof Ionicons.glyphMap}
              size={24}
              color={badge.earned ? '#fff' : colors.textMuted}
            />
          </View>
          <Text style={[styles.badgeName, { color: colors.text }]}>{badge.name}</Text>
          <Text style={[styles.badgeDesc, { color: colors.textMuted }]}>{badge.description}</Text>
          {badge.earned && badge.earned_at && (
            <Text style={[styles.badgeDate, { color: Colors.gold }]}>
              {new Date(badge.earned_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      ))}
    </View>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Activity</Text>
      </View>

      {renderSegmentControl()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {segment === 'notifications' && renderNotifications()}
        {segment === 'polls' && renderPolls()}
        {segment === 'badges' && renderBadges()}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: FontSize.sectionTitle,
    fontWeight: FontWeight.bold,
  },
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: 10,
    padding: 3,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.medium,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.lg },

  // Notifications
  notificationCard: {
    flexDirection: 'row',
    borderRadius: Card.borderRadius,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    backgroundColor: 'transparent',
  },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: FontSize.bodySmall, fontWeight: FontWeight.semibold },
  notificationBody: { fontSize: FontSize.meta, fontWeight: FontWeight.regular, marginTop: 4 },
  notificationTime: { fontSize: 12, fontWeight: FontWeight.regular, marginTop: 6 },

  // Polls
  pollCard: {
    borderRadius: Card.borderRadius,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.cardGap,
  },
  pollQuestion: { fontSize: FontSize.cardTitle, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  pollOption: {
    position: 'relative',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pollBar: { position: 'absolute', top: 0, left: 0, bottom: 0 },
  pollOptionText: { fontSize: FontSize.bodySmall, fontWeight: FontWeight.medium, flex: 1 },
  pollPct: { fontSize: FontSize.bodySmall, fontWeight: FontWeight.bold, marginLeft: 12 },
  pollVoteCount: { fontSize: FontSize.meta, fontWeight: FontWeight.regular, marginTop: Spacing.sm },

  // Badges
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  badgeCard: {
    width: '47%',
    borderRadius: Card.borderRadius,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  badgeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badgeName: { fontSize: FontSize.label, fontWeight: FontWeight.semibold, textAlign: 'center' },
  badgeDesc: { fontSize: FontSize.meta, fontWeight: FontWeight.regular, textAlign: 'center', marginTop: 4 },
  badgeDate: { fontSize: 12, fontWeight: FontWeight.medium, marginTop: 4 },

  // Empty states
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: FontSize.cardTitle, fontWeight: FontWeight.semibold, marginTop: Spacing.lg },
  emptyText: { fontSize: FontSize.label, fontWeight: FontWeight.regular, textAlign: 'center', marginTop: 8, paddingHorizontal: 32 },
  ctaButton: { marginTop: Spacing.lg, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  ctaButtonText: { color: '#fff', fontSize: FontSize.bodySmall, fontWeight: FontWeight.semibold },
})
