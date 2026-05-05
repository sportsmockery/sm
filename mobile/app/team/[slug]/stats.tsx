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

interface LeaderboardEntry {
  player: {
    playerId: string
    fullName: string
    jerseyNumber: number | null
    position: string
    headshotUrl: string | null
  }
  primaryStat: number
  primaryLabel: string
  secondaryStat: number | null
  secondaryLabel: string | null
  tertiaryStat: number | null
  tertiaryLabel: string | null
  gamesPlayed?: number
}

interface TeamStatsPayload {
  team?: Record<string, any>
  leaderboards?: Record<string, LeaderboardEntry[]>
}

// Per-sport order + display labels for the leaderboard sections.
const LEADERBOARD_LABELS: Record<string, [string, string][]> = {
  bears: [
    ['passing', 'Passing'],
    ['rushing', 'Rushing'],
    ['receiving', 'Receiving'],
    ['defense', 'Defense'],
    ['sacks', 'Sacks'],
    ['interceptions', 'Interceptions'],
  ],
  bulls: [
    ['scoring', 'Scoring'],
    ['rebounding', 'Rebounding'],
    ['assists', 'Assists'],
    ['steals', 'Steals'],
    ['blocks', 'Blocks'],
    ['defense', 'Defense'],
  ],
  blackhawks: [
    ['points', 'Points'],
    ['goals', 'Goals'],
    ['assists', 'Assists'],
    ['goaltending', 'Goaltending'],
  ],
  cubs: [
    ['batting', 'Batting Avg'],
    ['homeRuns', 'Home Runs'],
    ['obp', 'On-Base %'],
    ['rbiLeaders', 'RBI'],
    ['atBats', 'At Bats'],
    ['pitching', 'Pitching'],
    ['saves', 'Saves'],
  ],
  whitesox: [
    ['batting', 'Batting Avg'],
    ['homeRuns', 'Home Runs'],
    ['obp', 'On-Base %'],
    ['rbiLeaders', 'RBI'],
    ['atBats', 'At Bats'],
    ['pitching', 'Pitching'],
    ['saves', 'Saves'],
  ],
}

// Per-sport "team metric" tiles to surface. Keys reference team stats fields
// returned by src/lib/{team}Data.ts.
const TEAM_METRIC_TILES: Record<string, Array<{ key: string; label: string; format?: (v: any) => string }>> = {
  bears: [
    { key: 'ppg', label: 'PPG' },
    { key: 'papg', label: 'OPP PPG' },
    { key: 'pointDifferential', label: 'POINT DIFF', format: (v) => (v > 0 ? `+${v}` : String(v ?? 0)) },
    { key: 'offensiveRank', label: 'OFF RANK', format: (v) => (v ? `#${v}` : '—') },
  ],
  bulls: [
    { key: 'ppg', label: 'PPG' },
    { key: 'oppg', label: 'OPP PPG' },
    { key: 'rpg', label: 'RPG' },
    { key: 'apg', label: 'APG' },
  ],
  blackhawks: [
    { key: 'goalsFor', label: 'GF/GP' },
    { key: 'goalsAgainst', label: 'GA/GP' },
    { key: 'ppPct', label: 'PP%' },
    { key: 'pkPct', label: 'PK%' },
  ],
  cubs: [
    { key: 'battingAverage', label: 'AVG' },
    { key: 'era', label: 'ERA' },
    { key: 'runsScored', label: 'RUNS' },
    { key: 'homeRuns', label: 'HR' },
  ],
  whitesox: [
    { key: 'battingAverage', label: 'AVG' },
    { key: 'era', label: 'ERA' },
    { key: 'runsScored', label: 'RUNS' },
    { key: 'homeRuns', label: 'HR' },
  ],
}

function formatStatValue(value: any): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return String(value)
    if (value < 1 && value >= 0) return value.toFixed(3).replace(/^0/, '')
    return value.toFixed(1)
  }
  return String(value)
}

function rankBadgeColor(rank: number): string {
  if (rank === 0) return '#D6B05E'
  if (rank === 1) return '#C0C0C0'
  if (rank === 2) return '#CD7F32'
  return '#6B7280'
}

export default function TeamStatsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const team = slug ? TEAMS[slug as TeamId] : null

  const [payload, setPayload] = useState<TeamStatsPayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchStats = async () => {
    if (!slug) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/team/${slug}/stats`)
      if (response.ok) {
        const result = await response.json()
        setPayload(result)
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

  const teamStats = payload?.team || null
  const leaderboards = payload?.leaderboards || null
  const tiles = TEAM_METRIC_TILES[String(slug)] || []
  const lbOrder = LEADERBOARD_LABELS[String(slug)] || []

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
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
            <Text style={styles.teamName}>{team.shortName} Stats</Text>
            {teamStats?.season ? (
              <Text style={styles.countText}>{teamStats.season} Season</Text>
            ) : null}
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
        ) : !teamStats && !leaderboards ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bar-chart-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Stats unavailable</Text>
          </View>
        ) : (
          <>
            {teamStats?.record ? (
              <View style={[styles.recordCard, { backgroundColor: team.color }]}>
                <Text style={styles.recordLabel}>RECORD</Text>
                <Text style={styles.recordValue}>{teamStats.record}</Text>
              </View>
            ) : null}

            {tiles.length > 0 && teamStats ? (
              <View style={styles.tilesGrid}>
                {tiles.map(({ key, label, format }) => {
                  const raw = teamStats[key]
                  const value = format ? format(raw) : formatStatValue(raw)
                  return (
                    <View
                      key={key}
                      style={[
                        styles.tile,
                        {
                          backgroundColor: colors.surface,
                          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(11,15,20,0.08)',
                        },
                      ]}
                    >
                      <Text style={[styles.tileLabel, { color: colors.textMuted }]}>{label}</Text>
                      <Text style={[styles.tileValue, { color: colors.text }]}>{value}</Text>
                    </View>
                  )
                })}
              </View>
            ) : null}

            {lbOrder.map(([key, label]) => {
              const entries = leaderboards?.[key]
              if (!entries || entries.length === 0) return null
              return (
                <View
                  key={key}
                  style={[
                    styles.leaderboardCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(11,15,20,0.08)',
                    },
                  ]}
                >
                  <Text style={[styles.leaderboardTitle, { color: colors.text }]}>{label}</Text>
                  {entries.slice(0, 5).map((entry, idx) => {
                    const rankColor = rankBadgeColor(idx)
                    return (
                      <View
                        key={entry.player.playerId}
                        style={[
                          styles.leaderRow,
                          {
                            borderTopColor: isDark
                              ? 'rgba(255,255,255,0.06)'
                              : 'rgba(11,15,20,0.06)',
                          },
                        ]}
                      >
                        <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
                          <Text style={styles.rankBadgeText}>{idx + 1}</Text>
                        </View>
                        {entry.player.headshotUrl ? (
                          <Image
                            source={{ uri: entry.player.headshotUrl }}
                            style={styles.leaderPhoto}
                            contentFit="cover"
                          />
                        ) : (
                          <View
                            style={[
                              styles.leaderPhotoPlaceholder,
                              { backgroundColor: colors.border },
                            ]}
                          >
                            <Ionicons name="person" size={18} color={colors.textMuted} />
                          </View>
                        )}
                        <View style={styles.leaderInfo}>
                          <Text
                            style={[styles.leaderName, { color: colors.text }]}
                            numberOfLines={1}
                          >
                            {entry.player.fullName}
                          </Text>
                          <Text
                            style={[styles.leaderMeta, { color: colors.textMuted }]}
                            numberOfLines={1}
                          >
                            {entry.player.position}
                            {entry.player.jerseyNumber != null
                              ? ` · #${entry.player.jerseyNumber}`
                              : ''}
                            {entry.gamesPlayed != null ? ` · ${entry.gamesPlayed} GP` : ''}
                          </Text>
                        </View>
                        <View style={styles.leaderStat}>
                          <Text
                            style={[styles.leaderPrimary, { color: colors.text }]}
                            numberOfLines={1}
                          >
                            {formatStatValue(entry.primaryStat)}
                          </Text>
                          <Text
                            style={[styles.leaderPrimaryLabel, { color: colors.textMuted }]}
                            numberOfLines={1}
                          >
                            {entry.primaryLabel}
                          </Text>
                          {entry.secondaryStat != null && entry.secondaryLabel ? (
                            <Text
                              style={[styles.leaderSecondary, { color: colors.textMuted }]}
                              numberOfLines={1}
                            >
                              {formatStatValue(entry.secondaryStat)} {entry.secondaryLabel}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    )
                  })}
                </View>
              )
            })}
          </>
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
  emptyContainer: { padding: 60, alignItems: 'center' },
  emptyText: { fontSize: 14, fontFamily: 'Montserrat-Regular', marginTop: 16, textAlign: 'center' },
  recordCard: {
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  recordLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.85)',
  },
  recordValue: {
    fontSize: 32,
    fontFamily: 'Montserrat-Bold',
    color: '#fff',
    marginTop: 4,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 8,
    marginBottom: 16,
  },
  tile: {
    flexBasis: '48%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  tileLabel: { fontSize: 11, fontFamily: 'Montserrat-Bold', letterSpacing: 0.5 },
  tileValue: { fontSize: 22, fontFamily: 'Montserrat-Bold', marginTop: 4 },
  leaderboardCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  leaderboardTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rankBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankBadgeText: { color: '#fff', fontSize: 11, fontFamily: 'Montserrat-Bold' },
  leaderPhoto: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  leaderPhotoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderInfo: { flex: 1, paddingRight: 10 },
  leaderName: { fontSize: 14, fontFamily: 'Montserrat-SemiBold' },
  leaderMeta: { fontSize: 11, fontFamily: 'Montserrat-Regular', marginTop: 2 },
  leaderStat: { alignItems: 'flex-end', minWidth: 70 },
  leaderPrimary: { fontSize: 17, fontFamily: 'Montserrat-Bold' },
  leaderPrimaryLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  leaderSecondary: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorTitle: { fontSize: 18, fontFamily: 'Montserrat-Bold' },
})
