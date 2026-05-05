import { useEffect, useState } from 'react'
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

interface RosterPlayer {
  playerId: string
  fullName: string
  jerseyNumber: number | null
  position: string
  positionGroup: string | null
  height: string | null
  weight: number | null
  age: number | null
  experience: string | null
  college: string | null
  headshotUrl: string | null
  status: string | null
  side?: 'offense' | 'defense' | 'special_teams' | string | null
}

interface PositionGroup {
  group: string
  players: RosterPlayer[]
}

// Position group display labels — keeps the order the web hub pages use.
const NFL_GROUP_ORDER = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'CB', 'S', 'ST', 'K', 'P', 'LS']
const NBA_GROUP_ORDER = ['G', 'F', 'C', 'PG', 'SG', 'SF', 'PF']
const NHL_GROUP_ORDER = ['F', 'D', 'G']
const MLB_GROUP_ORDER = ['Pitcher', 'Catcher', 'Infield', 'Outfield', 'IF', 'OF', 'P', 'C', 'DH']

function orderForSlug(slug: string): string[] {
  switch (slug) {
    case 'bears':
      return NFL_GROUP_ORDER
    case 'bulls':
      return NBA_GROUP_ORDER
    case 'blackhawks':
      return NHL_GROUP_ORDER
    case 'cubs':
    case 'whitesox':
      return MLB_GROUP_ORDER
    default:
      return []
  }
}

// Status pill colors — IR/PUP/SUS are red, PS amber, default cyan.
function statusColor(status: string | null | undefined): string | null {
  if (!status) return null
  const s = status.toUpperCase()
  if (['IR', 'PUP', 'SUS', 'NFI', 'IL', 'DTD'].includes(s)) return '#BC0000'
  if (['PS', 'TC', 'GTD'].includes(s)) return '#D97706'
  if (['ACT', 'ACTIVE'].includes(s)) return null // hide the implicit default
  return '#00D4FF'
}

function formatHeight(h: string | null): string {
  return h || ''
}

export default function TeamRosterScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const team = slug ? TEAMS[slug as TeamId] : null

  const [groups, setGroups] = useState<PositionGroup[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchRoster = async () => {
    if (!slug) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/team/${slug}/roster`)
      if (response.ok) {
        const result = await response.json()
        const apiGroups: PositionGroup[] = Array.isArray(result.positionGroups)
          ? result.positionGroups
          : []
        const order = orderForSlug(String(slug))
        const sorted = [...apiGroups].sort((a, b) => {
          const ai = order.indexOf(a.group)
          const bi = order.indexOf(b.group)
          if (ai === -1 && bi === -1) return a.group.localeCompare(b.group)
          if (ai === -1) return 1
          if (bi === -1) return -1
          return ai - bi
        })
        setGroups(sorted)
        setTotal(typeof result.total === 'number' ? result.total : sorted.reduce((n, g) => n + g.players.length, 0))
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
          <Image source={{ uri: team.logo }} style={styles.teamLogo} contentFit="contain" />
          <View style={styles.headerText}>
            <Text style={styles.teamName}>{team.shortName} Roster</Text>
            <Text style={styles.countText}>{total} Players</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={team.color} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={team.color} />
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No players found</Text>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.group} style={styles.groupBlock}>
              <View style={styles.groupHeader}>
                <Text style={[styles.groupTitle, { color: colors.text }]}>{group.group}</Text>
                <Text style={[styles.groupCount, { color: colors.textMuted }]}>
                  {group.players.length}
                </Text>
              </View>
              {group.players.map((player) => {
                const sc = statusColor(player.status)
                return (
                  <View
                    key={player.playerId}
                    style={[
                      styles.playerCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(11,15,20,0.08)',
                      },
                    ]}
                  >
                    {player.headshotUrl ? (
                      <Image
                        source={{ uri: player.headshotUrl }}
                        style={styles.playerPhoto}
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        style={[styles.playerPhotoPlaceholder, { backgroundColor: colors.border }]}
                      >
                        <Ionicons name="person" size={24} color={colors.textMuted} />
                      </View>
                    )}
                    <View style={styles.playerInfo}>
                      <View style={styles.playerNameRow}>
                        {player.jerseyNumber != null && (
                          <Text style={[styles.playerNumber, { color: team.color }]}>
                            #{player.jerseyNumber}
                          </Text>
                        )}
                        <Text
                          style={[styles.playerName, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          {player.fullName}
                        </Text>
                        {sc && (
                          <View style={[styles.statusPill, { backgroundColor: `${sc}22`, borderColor: sc }]}>
                            <Text style={[styles.statusPillText, { color: sc }]}>
                              {(player.status || '').toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.playerPosition, { color: colors.textMuted }]} numberOfLines={1}>
                        {player.position}
                        {player.positionGroup && player.positionGroup !== player.position
                          ? ` · ${player.positionGroup}`
                          : ''}
                      </Text>
                      <View style={styles.detailRow}>
                        {player.height && (
                          <Text style={[styles.detailText, { color: colors.textMuted }]}>
                            {formatHeight(player.height)}
                          </Text>
                        )}
                        {player.weight != null && (
                          <Text style={[styles.detailText, { color: colors.textMuted }]}>
                            {player.weight} lbs
                          </Text>
                        )}
                        {player.age != null && (
                          <Text style={[styles.detailText, { color: colors.textMuted }]}>
                            Age {player.age}
                          </Text>
                        )}
                        {player.experience && (
                          <Text style={[styles.detailText, { color: colors.textMuted }]}>
                            Exp {player.experience}
                          </Text>
                        )}
                      </View>
                      {player.college && (
                        <Text style={[styles.collegeText, { color: colors.textMuted }]} numberOfLines={1}>
                          {player.college}
                        </Text>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 8, paddingBottom: 16, paddingHorizontal: 16 },
  backButton: { padding: 4, marginBottom: 12 },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  teamLogo: { width: 48, height: 48 },
  headerText: { marginLeft: 12 },
  teamName: { fontSize: 20, fontFamily: 'Montserrat-Bold', color: '#fff' },
  countText: { fontSize: 14, fontFamily: 'Montserrat-Medium', color: 'rgba(255,255,255,0.8)' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  loadingContainer: { padding: 60, alignItems: 'center' },
  groupBlock: { marginBottom: 20 },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  groupTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  groupCount: { fontSize: 13, fontFamily: 'Montserrat-SemiBold' },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  playerPhoto: { width: 56, height: 56, borderRadius: 28 },
  playerPhotoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerInfo: { flex: 1, marginLeft: 12 },
  playerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  playerNumber: { fontSize: 14, fontFamily: 'Montserrat-Bold' },
  playerName: { flexShrink: 1, fontSize: 16, fontFamily: 'Montserrat-SemiBold' },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
  },
  playerPosition: { fontSize: 13, fontFamily: 'Montserrat-Medium', marginTop: 2 },
  detailRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, marginTop: 4 },
  detailText: { fontSize: 12, fontFamily: 'Montserrat-Regular' },
  collegeText: { marginTop: 2, fontSize: 12, fontFamily: 'Montserrat-Regular', fontStyle: 'italic' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorTitle: { fontSize: 18, fontFamily: 'Montserrat-Bold' },
  emptyContainer: { padding: 60, alignItems: 'center' },
  emptyText: { fontSize: 14, fontFamily: 'Montserrat-Regular', marginTop: 16, textAlign: 'center' },
})
