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

interface Game {
  game_id: string
  game_date: string
  opponent: string
  opponent_logo?: string
  is_home: boolean
  team_score?: number
  opponent_score?: number
  result?: 'W' | 'L' | 'T'
  status: 'scheduled' | 'completed' | 'in_progress'
}

export default function TeamScheduleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const { colors } = useTheme()
  const team = slug ? TEAMS[slug as TeamId] : null
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchSchedule = async () => {
    if (!slug) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/${slug}/schedule`)
      if (response.ok) {
        const result = await response.json()
        setGames(result.games || [])
      }
    } catch (error) {
      console.error('Error fetching schedule:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSchedule()
  }, [slug])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchSchedule()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getResultColor = (result?: string) => {
    if (result === 'W') return COLORS.success
    if (result === 'L') return COLORS.error
    return colors.textMuted
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
            <Text style={styles.teamName}>{team.shortName} Schedule</Text>
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
        ) : games.length > 0 ? (
          games.map((game, index) => (
            <TouchableOpacity
              key={game.game_id}
              style={[styles.gameCard, { backgroundColor: colors.surface }]}
              onPress={() => {
                if (game.status === 'in_progress') {
                  router.push(`/live/${game.game_id}`)
                }
              }}
              activeOpacity={game.status === 'in_progress' ? 0.7 : 1}
            >
              {/* Date */}
              <View style={styles.dateSection}>
                <Text style={[styles.dateText, { color: colors.textMuted }]}>
                  {formatDate(game.game_date)}
                </Text>
                {game.status === 'scheduled' && (
                  <Text style={[styles.timeText, { color: colors.textMuted }]}>
                    {formatTime(game.game_date)}
                  </Text>
                )}
                {game.status === 'in_progress' && (
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                )}
              </View>

              {/* Opponent */}
              <View style={styles.opponentSection}>
                <Text style={[styles.vsText, { color: colors.textMuted }]}>
                  {game.is_home ? 'vs' : '@'}
                </Text>
                <Image
                  source={{ uri: game.opponent_logo }}
                  style={styles.opponentLogo}
                  contentFit="contain"
                />
                <Text style={[styles.opponentName, { color: colors.text }]}>
                  {game.opponent}
                </Text>
              </View>

              {/* Score/Result */}
              <View style={styles.resultSection}>
                {game.status === 'completed' ? (
                  <>
                    <Text style={[styles.resultBadge, { color: getResultColor(game.result) }]}>
                      {game.result}
                    </Text>
                    <Text style={[styles.scoreText, { color: colors.text }]}>
                      {game.team_score}-{game.opponent_score}
                    </Text>
                  </>
                ) : game.status === 'in_progress' ? (
                  <Text style={[styles.scoreText, { color: colors.text }]}>
                    {game.team_score}-{game.opponent_score}
                  </Text>
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No schedule available
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
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  dateSection: {
    width: 70,
  },
  dateText: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
  },
  timeText: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  liveBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
  },
  opponentSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vsText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    width: 20,
  },
  opponentLogo: {
    width: 32,
    height: 32,
  },
  opponentName: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    flex: 1,
  },
  resultSection: {
    alignItems: 'flex-end',
    minWidth: 50,
  },
  resultBadge: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  scoreText: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
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
