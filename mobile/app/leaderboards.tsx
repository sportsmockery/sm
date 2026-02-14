import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { COLORS, API_BASE_URL } from '@/lib/config'

interface LeaderboardEntry {
  rank: number
  user_id: string
  display_name: string
  avatar_url?: string
  total_score: number
  trade_count: number
  draft_count: number
  sim_count: number
}

interface LeaderboardData {
  entries: LeaderboardEntry[]
  userRank?: number
  userScore?: number
  pointsToTop20?: number
}

const SPORTS = [
  { id: 'nfl', label: 'NFL', icon: 'american-football' },
  { id: 'nba', label: 'NBA', icon: 'basketball' },
  { id: 'mlb', label: 'MLB', icon: 'baseball' },
  { id: 'nhl', label: 'NHL', icon: 'snow' },
] as const

export default function LeaderboardsScreen() {
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const [selectedSport, setSelectedSport] = useState<string>('nfl')
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchLeaderboard = async (sport: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gm/leaderboard?sport=${sport}&limit=20`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchLeaderboard(selectedSport)
  }, [selectedSport])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchLeaderboard(selectedSport)
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return '#FFD700' // Gold
    if (rank === 2) return '#C0C0C0' // Silver
    if (rank === 3) return '#CD7F32' // Bronze
    return colors.surface
  }

  const getRankTextColor = (rank: number) => {
    if (rank <= 3) return '#000'
    return colors.text
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Leaderboards</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Monthly GM Rankings
          </Text>
        </View>
      </View>

      {/* Sport Tabs */}
      <View style={[styles.sportTabs, { backgroundColor: colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sportTabsContent}>
          {SPORTS.map((sport) => (
            <TouchableOpacity
              key={sport.id}
              style={[
                styles.sportTab,
                selectedSport === sport.id && { backgroundColor: COLORS.primary },
              ]}
              onPress={() => setSelectedSport(sport.id)}
            >
              <Ionicons
                name={sport.icon as any}
                size={18}
                color={selectedSport === sport.id ? '#fff' : colors.textMuted}
              />
              <Text
                style={[
                  styles.sportTabText,
                  { color: selectedSport === sport.id ? '#fff' : colors.textMuted },
                ]}
              >
                {sport.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* User Rank Card */}
      {data?.userRank && (
        <View style={[styles.userRankCard, { backgroundColor: COLORS.primary }]}>
          <View style={styles.userRankContent}>
            <Text style={styles.userRankLabel}>Your Rank</Text>
            <Text style={styles.userRankValue}>#{data.userRank}</Text>
          </View>
          <View style={styles.userRankDivider} />
          <View style={styles.userRankContent}>
            <Text style={styles.userRankLabel}>Your Score</Text>
            <Text style={styles.userRankValue}>{data.userScore?.toLocaleString()}</Text>
          </View>
          {data.pointsToTop20 && data.pointsToTop20 > 0 && (
            <>
              <View style={styles.userRankDivider} />
              <View style={styles.userRankContent}>
                <Text style={styles.userRankLabel}>To Top 20</Text>
                <Text style={styles.userRankValue}>+{data.pointsToTop20.toLocaleString()}</Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Leaderboard List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : data?.entries && data.entries.length > 0 ? (
          data.entries.map((entry, index) => (
            <View
              key={entry.user_id}
              style={[styles.entryCard, { backgroundColor: colors.surface }]}
            >
              {/* Rank Badge */}
              <View
                style={[
                  styles.rankBadge,
                  { backgroundColor: getRankBadgeColor(entry.rank) },
                ]}
              >
                <Text style={[styles.rankText, { color: getRankTextColor(entry.rank) }]}>
                  {entry.rank}
                </Text>
              </View>

              {/* User Info */}
              <View style={styles.userInfo}>
                {entry.avatar_url ? (
                  <Image source={{ uri: entry.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
                    <Ionicons name="person" size={20} color={colors.textMuted} />
                  </View>
                )}
                <View style={styles.userDetails}>
                  <Text style={[styles.userName, { color: colors.text }]}>
                    {entry.display_name}
                  </Text>
                  <Text style={[styles.userStats, { color: colors.textMuted }]}>
                    {entry.trade_count} trades · {entry.draft_count} drafts · {entry.sim_count} sims
                  </Text>
                </View>
              </View>

              {/* Score */}
              <View style={styles.scoreContainer}>
                <Text style={[styles.scoreValue, { color: COLORS.primary }]}>
                  {entry.total_score.toLocaleString()}
                </Text>
                <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>pts</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No leaderboard data yet
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  sportTabs: {
    paddingVertical: 12,
  },
  sportTabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sportTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginRight: 8,
  },
  sportTabText: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  userRankCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  userRankContent: {
    flex: 1,
    alignItems: 'center',
  },
  userRankLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    marginBottom: 4,
  },
  userRankValue: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  userRankDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
  },
  userStats: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  scoreLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    marginTop: 16,
    textAlign: 'center',
  },
})
