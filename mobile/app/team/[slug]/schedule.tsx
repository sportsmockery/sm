import { useEffect, useState, useMemo } from 'react'
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

// Mirrors src/lib/{team}Data.ts game interfaces. Field set is the union — not
// every sport populates every field (e.g. NFL has week/isPlayoff, MLB doesn't).
interface ScheduleGame {
  gameId: string
  season?: number
  week?: number
  date: string
  time?: string | null
  dayOfWeek?: string
  opponent: string
  opponentFullName?: string | null
  opponentLogo?: string | null
  homeAway: 'home' | 'away'
  status: 'scheduled' | 'in_progress' | 'final'
  // Per-sport score field (e.g. bearsScore / bullsScore / cubsScore).
  // Mobile pulls whichever team-score key the API returns + the matching opp.
  bearsScore?: number | null
  bullsScore?: number | null
  blackhawksScore?: number | null
  cubsScore?: number | null
  whitesoxScore?: number | null
  oppScore?: number | null
  result?: 'W' | 'L' | 'T' | 'OTL' | null
  venue?: string | null
  tv?: string | null
  isPlayoff?: boolean
  isOvertime?: boolean
  isPreseason?: boolean
  gameType?: 'preseason' | 'regular' | 'postseason'
  articleSlug?: string | null
}

const SECTION_LABEL: Record<NonNullable<ScheduleGame['gameType']>, string> = {
  preseason: 'Preseason',
  regular: 'Regular Season',
  postseason: 'Postseason',
}

function teamScore(game: ScheduleGame, slug: string): number | null | undefined {
  switch (slug) {
    case 'bears':
      return game.bearsScore
    case 'bulls':
      return game.bullsScore
    case 'blackhawks':
      return game.blackhawksScore
    case 'cubs':
      return game.cubsScore
    case 'whitesox':
      return game.whitesoxScore
    default:
      return undefined
  }
}

function formatDate(date: string, dayOfWeek?: string): string {
  if (!date) return ''
  try {
    const d = new Date(`${date}T00:00:00`)
    const day = dayOfWeek || d.toLocaleDateString('en-US', { weekday: 'short' })
    const month = d.toLocaleDateString('en-US', { month: 'short' })
    const dayNum = d.getDate()
    return `${day.toUpperCase()} ${month.toUpperCase()} ${dayNum}`
  } catch {
    return date
  }
}

function resultBadgeColor(result: ScheduleGame['result']): string {
  switch (result) {
    case 'W':
      return '#16A34A'
    case 'L':
      return '#BC0000'
    case 'OTL':
      return '#D97706'
    case 'T':
      return '#6B7280'
    default:
      return '#6B7280'
  }
}

export default function TeamScheduleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const team = slug ? TEAMS[slug as TeamId] : null

  const [games, setGames] = useState<ScheduleGame[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchSchedule = async () => {
    if (!slug) return
    try {
      const response = await fetch(`${API_BASE_URL}/api/team/${slug}/schedule`)
      if (response.ok) {
        const result = await response.json()
        setGames(Array.isArray(result.games) ? result.games : [])
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

  // Group by season type, maintaining preseason → regular → postseason order.
  const sections = useMemo(() => {
    const out: Array<{ key: string; label: string; games: ScheduleGame[] }> = []
    const buckets: Record<string, ScheduleGame[]> = {}
    for (const g of games) {
      const t = g.gameType || (g.isPlayoff ? 'postseason' : g.isPreseason ? 'preseason' : 'regular')
      if (!buckets[t]) buckets[t] = []
      buckets[t].push(g)
    }
    for (const key of ['preseason', 'regular', 'postseason'] as const) {
      if (buckets[key]?.length) out.push({ key, label: SECTION_LABEL[key], games: buckets[key] })
    }
    return out
  }, [games])

  // Next upcoming game for the highlight card.
  const nextGame = useMemo(() => {
    return games.find((g) => g.status === 'scheduled' || g.status === 'in_progress') || null
  }, [games])

  // Progressive record below each completed regular-season game.
  const progressiveRecord = useMemo(() => {
    const rec: Record<string, string> = {}
    let w = 0
    let l = 0
    let t = 0
    let otl = 0
    for (const g of games) {
      if (g.gameType === 'postseason' || g.isPlayoff) continue
      if (g.status !== 'final' || !g.result) continue
      if (g.result === 'W') w++
      else if (g.result === 'L') l++
      else if (g.result === 'T') t++
      else if (g.result === 'OTL') otl++
      const tail = otl > 0 ? `-${otl}` : t > 0 ? `-${t}` : ''
      rec[g.gameId] = `${w}-${l}${tail}`
    }
    return rec
  }, [games])

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

  const renderGame = (game: ScheduleGame, showWeekLabel: boolean, sectionType: string) => {
    const ts = teamScore(game, String(slug))
    const op = game.oppScore
    const isHome = game.homeAway === 'home'
    const isFinal = game.status === 'final'
    const isLive = game.status === 'in_progress'
    const isPlayoff = !!game.isPlayoff || sectionType === 'postseason'
    const accent = isLive
      ? '#BC0000'
      : isFinal
      ? game.result === 'W'
        ? '#00D4FF'
        : game.result === 'L' || game.result === 'OTL'
        ? '#BC0000'
        : '#6B7280'
      : team.color

    return (
      <TouchableOpacity
        key={game.gameId}
        activeOpacity={isLive ? 0.85 : 1}
        onPress={() => {
          if (isLive) {
            router.push(`/live/${game.gameId}`)
          } else if (game.articleSlug) {
            // Recap link — open article. Slug/category not known here, so best
            // effort: navigate to the live screen which will fall through.
            router.push(`/live/${game.gameId}`)
          }
        }}
        style={[
          styles.gameCard,
          {
            backgroundColor: colors.surface,
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(11,15,20,0.08)',
            borderLeftColor: accent,
          },
        ]}
      >
        <View style={styles.gameTopRow}>
          <View style={styles.gameTopLeft}>
            {showWeekLabel && game.week != null ? (
              <Text style={[styles.weekLabel, { color: colors.textMuted }]}>
                {isPlayoff ? `Round ${game.week}` : `Week ${game.week}`}
              </Text>
            ) : null}
            <Text style={[styles.dateLabel, { color: colors.text }]}>
              {formatDate(game.date, game.dayOfWeek)}
            </Text>
          </View>
          {isLive ? (
            <View style={[styles.liveBadge, { backgroundColor: '#BC0000' }]}>
              <Text style={styles.liveBadgeText}>LIVE</Text>
            </View>
          ) : isFinal && game.result ? (
            <View
              style={[
                styles.resultBadge,
                { backgroundColor: resultBadgeColor(game.result) },
              ]}
            >
              <Text style={styles.resultBadgeText}>{game.result}</Text>
            </View>
          ) : (
            <Text style={[styles.timeLabel, { color: colors.textMuted }]}>
              {game.time || 'TBD'}
            </Text>
          )}
        </View>

        <View style={styles.gameMidRow}>
          <Text style={[styles.homeAwayPrefix, { color: colors.textMuted }]}>
            {isHome ? 'vs' : '@'}
          </Text>
          {game.opponentLogo ? (
            <Image source={{ uri: game.opponentLogo }} style={styles.opponentLogo} contentFit="contain" />
          ) : null}
          <View style={styles.opponentMeta}>
            <Text style={[styles.opponentName, { color: colors.text }]} numberOfLines={1}>
              {game.opponentFullName || game.opponent}
            </Text>
            {game.venue ? (
              <Text style={[styles.venueLabel, { color: colors.textMuted }]} numberOfLines={1}>
                {game.venue}
              </Text>
            ) : null}
          </View>
          {isFinal && ts != null && op != null ? (
            <View style={styles.scoreBlock}>
              <Text style={[styles.scoreText, { color: colors.text }]}>
                {ts} - {op}
              </Text>
              {game.isOvertime ? (
                <Text style={[styles.scoreOT, { color: colors.textMuted }]}>OT</Text>
              ) : null}
            </View>
          ) : null}
        </View>

        {isFinal && progressiveRecord[game.gameId] ? (
          <Text style={[styles.recordLabel, { color: colors.textMuted }]}>
            Record: {progressiveRecord[game.gameId]}
          </Text>
        ) : null}

        {game.tv && !isFinal ? (
          <View style={styles.tvRow}>
            <Ionicons name="tv-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.tvLabel, { color: colors.textMuted }]}>{game.tv}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    )
  }

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
            <Text style={styles.teamName}>{team.shortName} Schedule</Text>
            <Text style={styles.countText}>{games.length} Games</Text>
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
        ) : games.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No games scheduled
            </Text>
          </View>
        ) : (
          <>
            {nextGame ? (
              <View
                style={[
                  styles.nextGameCard,
                  {
                    backgroundColor: team.color,
                  },
                ]}
              >
                <Text style={styles.nextGameLabel}>NEXT GAME</Text>
                <View style={styles.nextGameRow}>
                  {nextGame.opponentLogo ? (
                    <Image
                      source={{ uri: nextGame.opponentLogo }}
                      style={styles.nextGameLogo}
                      contentFit="contain"
                    />
                  ) : null}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nextGameOpp} numberOfLines={1}>
                      {nextGame.homeAway === 'home' ? 'vs ' : '@ '}
                      {nextGame.opponentFullName || nextGame.opponent}
                    </Text>
                    <Text style={styles.nextGameMeta}>
                      {formatDate(nextGame.date, nextGame.dayOfWeek)}
                      {nextGame.time ? ` · ${nextGame.time}` : ''}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

            {sections.map((section) => (
              <View key={section.key} style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.text }]}>
                  {section.label}
                </Text>
                {section.games.map((game) =>
                  renderGame(game, section.key === 'regular', section.key)
                )}
              </View>
            ))}
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
  nextGameCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  nextGameLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 1,
  },
  nextGameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  nextGameLogo: { width: 48, height: 48 },
  nextGameOpp: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  nextGameMeta: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    marginTop: 2,
  },
  section: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  gameCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 8,
  },
  gameTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  gameTopLeft: { flex: 1 },
  weekLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  dateLabel: {
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
    marginTop: 2,
  },
  timeLabel: { fontSize: 13, fontFamily: 'Montserrat-Medium' },
  liveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
  },
  resultBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
  },
  gameMidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  homeAwayPrefix: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
  },
  opponentLogo: { width: 32, height: 32 },
  opponentMeta: { flex: 1 },
  opponentName: { fontSize: 14, fontFamily: 'Montserrat-SemiBold' },
  venueLabel: { fontSize: 11, fontFamily: 'Montserrat-Regular', marginTop: 2 },
  scoreBlock: { alignItems: 'flex-end' },
  scoreText: { fontSize: 16, fontFamily: 'Montserrat-Bold' },
  scoreOT: {
    fontSize: 10,
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  recordLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    marginTop: 6,
  },
  tvRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  tvLabel: { fontSize: 11, fontFamily: 'Montserrat-Regular' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorTitle: { fontSize: 18, fontFamily: 'Montserrat-Bold' },
})
