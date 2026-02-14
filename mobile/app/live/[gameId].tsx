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
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { COLORS, API_BASE_URL, TEAMS } from '@/lib/config'

interface GameData {
  game_id: string
  status: string
  period?: string
  clock?: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
  home_logo?: string
  away_logo?: string
  venue?: string
  broadcast?: string
  sport: string
}

interface StatLeader {
  player_name: string
  value: string | number
  stat_type: string
}

export default function LiveGameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>()
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const [game, setGame] = useState<GameData | null>(null)
  const [leaders, setLeaders] = useState<StatLeader[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchGameData = useCallback(async () => {
    if (!gameId) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/live-games/${gameId}`)
      if (response.ok) {
        const result = await response.json()
        setGame(result.game)
        setLeaders(result.leaders || [])
      }
    } catch (error) {
      console.error('Error fetching game data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [gameId])

  useEffect(() => {
    fetchGameData()

    // Auto-refresh every 30 seconds for live games
    const interval = setInterval(() => {
      if (game?.status === 'in_progress') {
        fetchGameData()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchGameData, game?.status])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchGameData()
  }

  const getStatusDisplay = () => {
    if (!game) return ''
    if (game.status === 'final') return 'FINAL'
    if (game.status === 'in_progress') {
      if (game.period && game.clock) {
        return `${game.period} - ${game.clock}`
      }
      return 'LIVE'
    }
    return game.status.toUpperCase()
  }

  const getStatusColor = () => {
    if (!game) return colors.textMuted
    if (game.status === 'in_progress') return COLORS.error
    return colors.textMuted
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    )
  }

  if (!game) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Game Not Found</Text>
          <TouchableOpacity
            style={[styles.errorButton, { backgroundColor: COLORS.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusDisplay()}</Text>
          </View>
        </View>
        <View style={{ width: 32 }} />
      </View>

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
      >
        {/* Scoreboard */}
        <View style={[styles.scoreboard, { backgroundColor: colors.surface }]}>
          {/* Away Team */}
          <View style={styles.teamSection}>
            <Image
              source={{ uri: game.away_logo || `https://a.espncdn.com/i/teamlogos/${game.sport}/500/${game.away_team.toLowerCase()}.png` }}
              style={styles.teamLogo}
              contentFit="contain"
            />
            <Text style={[styles.teamName, { color: colors.text }]}>{game.away_team}</Text>
            <Text style={[styles.teamScore, { color: colors.text }]}>{game.away_score}</Text>
          </View>

          {/* VS */}
          <View style={styles.vsContainer}>
            <Text style={[styles.vsText, { color: colors.textMuted }]}>@</Text>
          </View>

          {/* Home Team */}
          <View style={styles.teamSection}>
            <Image
              source={{ uri: game.home_logo || `https://a.espncdn.com/i/teamlogos/${game.sport}/500/${game.home_team.toLowerCase()}.png` }}
              style={styles.teamLogo}
              contentFit="contain"
            />
            <Text style={[styles.teamName, { color: colors.text }]}>{game.home_team}</Text>
            <Text style={[styles.teamScore, { color: colors.text }]}>{game.home_score}</Text>
          </View>
        </View>

        {/* Game Info */}
        {(game.venue || game.broadcast) && (
          <View style={[styles.gameInfo, { backgroundColor: colors.surface }]}>
            {game.venue && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.infoText, { color: colors.textMuted }]}>{game.venue}</Text>
              </View>
            )}
            {game.broadcast && (
              <View style={styles.infoRow}>
                <Ionicons name="tv-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.infoText, { color: colors.textMuted }]}>{game.broadcast}</Text>
              </View>
            )}
          </View>
        )}

        {/* Stat Leaders */}
        {leaders.length > 0 && (
          <View style={[styles.leadersSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Game Leaders</Text>
            {leaders.map((leader, index) => (
              <View key={index} style={[styles.leaderRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.leaderStat, { color: colors.textMuted }]}>
                  {leader.stat_type}
                </Text>
                <Text style={[styles.leaderName, { color: colors.text }]}>
                  {leader.player_name}
                </Text>
                <Text style={[styles.leaderValue, { color: COLORS.primary }]}>
                  {leader.value}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Live indicator */}
        {game.status === 'in_progress' && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={[styles.liveText, { color: colors.textMuted }]}>
              Auto-refreshing every 30 seconds
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    marginTop: 16,
    marginBottom: 24,
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  scoreboard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  teamSection: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  teamScore: {
    fontSize: 40,
    fontFamily: 'Montserrat-Bold',
  },
  vsContainer: {
    paddingHorizontal: 16,
  },
  vsText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
  gameInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  leadersSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 12,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  leaderStat: {
    width: 80,
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    textTransform: 'uppercase',
  },
  leaderName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  leaderValue: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  liveText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
})
