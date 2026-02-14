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
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { COLORS, API_BASE_URL, TEAMS, TeamId } from '@/lib/config'

interface TeamStats {
  record?: { wins: number; losses: number; otLosses?: number }
  pointsPerGame?: number
  pointsAllowedPerGame?: number
  offensiveRank?: number
  defensiveRank?: number
  [key: string]: any
}

interface StatLeader {
  player_name: string
  player_headshot?: string
  stat_name: string
  value: number | string
  rank?: number
}

export default function TeamStatsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const { colors } = useTheme()
  const team = slug ? TEAMS[slug as TeamId] : null
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
  const [leaders, setLeaders] = useState<StatLeader[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchStats = async () => {
    if (!slug) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/${slug}/stats`)
      if (response.ok) {
        const result = await response.json()
        setTeamStats(result.teamStats || null)
        setLeaders(result.leaders || [])
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [slug])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchStats()
  }

  const formatRecord = (record?: { wins: number; losses: number; otLosses?: number }) => {
    if (!record) return '--'
    if (record.otLosses !== undefined) {
      return `${record.wins}-${record.losses}-${record.otLosses}`
    }
    return `${record.wins}-${record.losses}`
  }

  if (!team) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: colors.text }]}>Team Not Found</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: team.color }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Image
            source={{ uri: team.logo }}
            style={styles.teamLogo}
            contentFit="contain"
          />
          <View style={styles.headerText}>
            <Text style={styles.teamName}>{team.shortName} Stats</Text>
            <Text style={styles.seasonText}>2025-26 Season</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={team.color}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={team.color} />
          </View>
        ) : (
          <>
            {/* Team Record Card */}
            {teamStats?.record && (
              <View style={[styles.recordCard, { backgroundColor: team.color }]}>
                <Text style={styles.recordLabel}>Season Record</Text>
                <Text style={styles.recordValue}>{formatRecord(teamStats.record)}</Text>
              </View>
            )}

            {/* Team Stats Grid */}
            <View style={[styles.statsGrid, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Team Averages</Text>
              <View style={styles.statsRow}>
                {teamStats?.pointsPerGame && (
                  <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: team.color }]}>
                      {teamStats.pointsPerGame.toFixed(1)}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>PPG</Text>
                  </View>
                )}
                {teamStats?.pointsAllowedPerGame && (
                  <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: team.color }]}>
                      {teamStats.pointsAllowedPerGame.toFixed(1)}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>OPP PPG</Text>
                  </View>
                )}
                {teamStats?.offensiveRank && (
                  <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: team.color }]}>
                      #{teamStats.offensiveRank}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>OFF RANK</Text>
                  </View>
                )}
                {teamStats?.defensiveRank && (
                  <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: team.color }]}>
                      #{teamStats.defensiveRank}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>DEF RANK</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Stat Leaders */}
            {leaders.length > 0 && (
              <View style={[styles.leadersSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Team Leaders</Text>
                {leaders.map((leader, index) => (
                  <View
                    key={index}
                    style={[styles.leaderCard, { borderBottomColor: colors.border }]}
                  >
                    {leader.player_headshot ? (
                      <Image
                        source={{ uri: leader.player_headshot }}
                        style={styles.leaderPhoto}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.leaderPhotoPlaceholder, { backgroundColor: colors.border }]}>
                        <Ionicons name="person" size={20} color={colors.textMuted} />
                      </View>
                    )}
                    <View style={styles.leaderInfo}>
                      <Text style={[styles.leaderName, { color: colors.text }]}>
                        {leader.player_name}
                      </Text>
                      <Text style={[styles.leaderStat, { color: colors.textMuted }]}>
                        {leader.stat_name}
                      </Text>
                    </View>
                    <View style={styles.leaderValueContainer}>
                      <Text style={[styles.leaderValue, { color: team.color }]}>
                        {leader.value}
                      </Text>
                      {leader.rank && (
                        <Text style={[styles.leaderRank, { color: colors.textMuted }]}>
                          #{leader.rank} in league
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* No stats fallback */}
            {!teamStats && leaders.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="stats-chart-outline" size={64} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  No stats available yet
                </Text>
              </View>
            )}
          </>
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
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 48,
    height: 48,
  },
  headerText: {
    marginLeft: 12,
  },
  teamName: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: '#fff',
  },
  seasonText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: 'rgba(255,255,255,0.8)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  recordCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  recordLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    marginBottom: 4,
  },
  recordValue: {
    color: '#fff',
    fontSize: 36,
    fontFamily: 'Montserrat-Bold',
  },
  statsGrid: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    padding: 12,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  leadersSection: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  leaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leaderPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  leaderPhotoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  leaderName: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
  },
  leaderStat: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  leaderValueContainer: {
    alignItems: 'flex-end',
  },
  leaderValue: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
  },
  leaderRank: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
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
