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

interface Player {
  id: string
  name: string
  number?: string
  position: string
  headshot_url?: string
  height?: string
  weight?: string
  age?: number
  college?: string
}

export default function TeamRosterScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const { colors } = useTheme()
  const team = slug ? TEAMS[slug as TeamId] : null
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<string>('all')

  const fetchRoster = async () => {
    if (!slug) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/${slug}/roster`)
      if (response.ok) {
        const result = await response.json()
        setPlayers(result.players || [])
      }
    } catch (error) {
      console.error('Error fetching roster:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchRoster()
  }, [slug])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchRoster()
  }

  // Get unique positions
  const positions = ['all', ...new Set(players.map(p => p.position).filter(Boolean))]

  // Filter players by position
  const filteredPlayers = selectedPosition === 'all'
    ? players
    : players.filter(p => p.position === selectedPosition)

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
            <Text style={styles.teamName}>{team.shortName} Roster</Text>
            <Text style={styles.countText}>{players.length} Players</Text>
          </View>
        </View>
      </View>

      {/* Position Filter */}
      <View style={[styles.filterContainer, { backgroundColor: colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {positions.map((position) => (
            <TouchableOpacity
              key={position}
              style={[
                styles.filterChip,
                selectedPosition === position && { backgroundColor: team.color },
              ]}
              onPress={() => setSelectedPosition(position)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: selectedPosition === position ? '#fff' : colors.textMuted },
                ]}
              >
                {position === 'all' ? 'All' : position}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
        ) : filteredPlayers.length > 0 ? (
          filteredPlayers.map((player) => (
            <View
              key={player.id}
              style={[styles.playerCard, { backgroundColor: colors.surface }]}
            >
              {/* Player Photo */}
              {player.headshot_url ? (
                <Image
                  source={{ uri: player.headshot_url }}
                  style={styles.playerPhoto}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.playerPhotoPlaceholder, { backgroundColor: colors.border }]}>
                  <Ionicons name="person" size={24} color={colors.textMuted} />
                </View>
              )}

              {/* Player Info */}
              <View style={styles.playerInfo}>
                <View style={styles.playerNameRow}>
                  {player.number && (
                    <Text style={[styles.playerNumber, { color: team.color }]}>
                      #{player.number}
                    </Text>
                  )}
                  <Text style={[styles.playerName, { color: colors.text }]}>
                    {player.name}
                  </Text>
                </View>
                <Text style={[styles.playerPosition, { color: colors.textMuted }]}>
                  {player.position}
                </Text>
                <View style={styles.playerDetails}>
                  {player.height && (
                    <Text style={[styles.detailText, { color: colors.textMuted }]}>
                      {player.height}
                    </Text>
                  )}
                  {player.weight && (
                    <Text style={[styles.detailText, { color: colors.textMuted }]}>
                      {player.weight} lbs
                    </Text>
                  )}
                  {player.age && (
                    <Text style={[styles.detailText, { color: colors.textMuted }]}>
                      Age {player.age}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No players found
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
  countText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: 'rgba(255,255,255,0.8)',
  },
  filterContainer: {
    paddingVertical: 12,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
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
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  playerPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  playerPhotoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerNumber: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  playerName: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  playerPosition: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    marginTop: 2,
  },
  playerDetails: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
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
