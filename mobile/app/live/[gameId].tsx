import { useMemo, useState } from 'react'
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
import { useQuery } from '@tanstack/react-query'

import { useTheme } from '@/hooks/useTheme'
import { COLORS, TEAMS } from '@/lib/config'
import { api } from '@/lib/api'
import { queryKeys } from '@/lib/queryClient'
import { classifyPlay, getPlayBorderColor } from '@/lib/live-games-utils'

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

interface Play {
  play_id: string
  sequence: number
  game_clock: string
  period: number
  period_label: string
  description: string
  play_type?: string
  score_home: number
  score_away: number
  scoring_play?: boolean
}

type LiveTab = 'plays' | 'boxscore' | 'stats'

const LIVE_POLL_MS = 10_000
const IDLE_POLL_MS = 60_000

export default function LiveGameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>()
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const [activeTab, setActiveTab] = useState<LiveTab>('plays')

  // React Query owns the cache. The pill prefetches this same key on mount,
  // so navigating into a previously-rendered game shows scoreboard + plays
  // immediately rather than flashing an empty state.
  const {
    data: payload,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.liveGame(gameId || ''),
    queryFn: () => api.getLiveGame(gameId!),
    enabled: !!gameId,
    refetchInterval: (query) => {
      const status = (query.state.data as any)?.status
      return status === 'in_progress' || status === 'live'
        ? LIVE_POLL_MS
        : IDLE_POLL_MS
    },
    staleTime: 5_000,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
  })

  const game: GameData | null = useMemo(() => {
    if (!payload) return null
    return {
      game_id: payload.game_id,
      sport: payload.sport,
      status: payload.status,
      period: payload.period_label || payload.period,
      clock: payload.clock,
      home_team: payload.home_team?.abbr || payload.home_team?.name || '',
      away_team: payload.away_team?.abbr || payload.away_team?.name || '',
      home_score: payload.home_team?.score ?? 0,
      away_score: payload.away_team?.score ?? 0,
      home_logo: payload.home_team?.logo_url,
      away_logo: payload.away_team?.logo_url,
      venue: payload.venue?.name,
      broadcast: payload.broadcast?.network,
    }
  }, [payload])

  const leaders: StatLeader[] = Array.isArray(payload?.leaders) ? payload!.leaders : []

  const plays: Play[] = useMemo(() => {
    const raw = Array.isArray(payload?.play_by_play) ? payload!.play_by_play : []
    // Drop plays with no description — they render as blank cards. Some
    // upstream feeds (notably MLB pitch-by-pitch) emit headers/wrappers with
    // empty descriptions; we only want narrated plays in the stream.
    const withText = raw.filter((p: Play) => !!(p.description && p.description.trim()))
    // DataLab returns chronological — newer items higher sequence.
    return withText.sort((a: Play, b: Play) => b.sequence - a.sequence)
  }, [payload])

  const players: any[] = Array.isArray(payload?.players) ? payload!.players : []
  const teamStats = payload?.team_stats || null
  const linescore = payload?.linescore || null

  const handleRefresh = () => {
    refetch()
  }
  const isRefreshing = isRefetching

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

        {/* Tab bar — mirrors test.sportsmockery.com/live/[sport]/[gameId] */}
        {(game.status === 'in_progress' || game.status === 'live' || game.status === 'final') && (
          <View
            style={[
              styles.tabBar,
              { borderBottomColor: 'rgba(255,255,255,0.15)' },
            ]}
          >
            {(['plays', 'boxscore', 'stats'] as LiveTab[]).map((tab) => {
              const isActive = activeTab === tab
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    styles.tabButton,
                    { borderBottomColor: isActive ? '#BC0000' : 'transparent' },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      { color: isActive ? '#BC0000' : colors.textMuted },
                    ]}
                  >
                    {tab === 'plays' ? 'Plays' : tab === 'boxscore' ? 'Box Score' : 'Stats'}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* Play-by-play (newest first, period separators, scoring highlights) */}
        {activeTab === 'plays' && (
          plays.length === 0 ? (
            <View style={styles.emptyPlays}>
              <Text style={[styles.emptyPlaysText, { color: colors.textMuted }]}>
                No plays available yet
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {(() => {
                let lastPeriod: number | null = null
                return plays.map((p) => {
                  const playType = classifyPlay(p.play_type, p.description)
                  const borderColor = getPlayBorderColor(playType)
                  const isScoring = playType === 'scoring' || p.scoring_play === true
                  const showHeader = p.period !== lastPeriod
                  lastPeriod = p.period
                  return (
                    <View key={p.play_id}>
                      {showHeader && (
                        <View
                          style={[
                            styles.periodHeader,
                            {
                              backgroundColor: isDark
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(11,15,20,0.04)',
                              borderColor: isDark
                                ? 'rgba(255,255,255,0.15)'
                                : 'rgba(11,15,20,0.1)',
                            },
                          ]}
                        >
                          <Text style={[styles.periodHeaderLabel, { color: colors.text }]}>
                            {p.period_label}
                          </Text>
                          <Text style={[styles.periodHeaderScore, { color: colors.textMuted }]}>
                            {p.score_away} - {p.score_home}
                          </Text>
                        </View>
                      )}
                      <View
                        style={[
                          styles.playCard,
                          {
                            backgroundColor: isScoring
                              ? isDark
                                ? 'rgba(188,0,0,0.15)'
                                : 'rgba(188,0,0,0.05)'
                              : isDark
                              ? 'rgba(255,255,255,0.03)'
                              : colors.surface,
                            borderColor: isDark
                              ? 'rgba(255,255,255,0.15)'
                              : 'rgba(11,15,20,0.08)',
                          },
                        ]}
                      >
                        <View style={[styles.playLeftBar, { backgroundColor: borderColor }]} />
                        <View style={styles.playBody}>
                          <View style={styles.playRowHeader}>
                            <Text style={[styles.playMeta, { color: colors.textMuted }]}>
                              {[p.period_label, p.game_clock].filter(Boolean).join(' ')}
                            </Text>
                            <Text
                              style={[
                                styles.playScoreLarge,
                                {
                                  color: colors.text,
                                  fontSize: isScoring ? 17 : 14,
                                },
                              ]}
                            >
                              {p.score_away} - {p.score_home}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.playDescription,
                              {
                                color: colors.text,
                                fontFamily: isScoring
                                  ? 'Montserrat-SemiBold'
                                  : 'Montserrat-Regular',
                              },
                            ]}
                          >
                            {p.description}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )
                })
              })()}
            </View>
          )
        )}

        {activeTab === 'boxscore' && (
          <BoxScoreTab
            sport={game.sport}
            players={players}
            linescore={linescore}
            homeAbbr={game.home_team}
            awayAbbr={game.away_team}
            colors={colors}
            isDark={isDark}
          />
        )}

        {activeTab === 'stats' && (
          <TeamStatsTab
            teamStats={teamStats}
            homeAbbr={game.home_team}
            awayAbbr={game.away_team}
            colors={colors}
            isDark={isDark}
          />
        )}

        {/* Live indicator */}
        {(game.status === 'in_progress' || game.status === 'live') && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={[styles.liveText, { color: colors.textMuted }]}>
              Auto-refreshing every 10 seconds
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Box score (sport-aware mini player table + linescore) ────────────────

type BoxScoreColumn = { label: string; key: string; format?: (v: any) => string }

function getBoxScoreColumns(sport: string): BoxScoreColumn[] {
  switch ((sport || '').toLowerCase()) {
    case 'nba':
      return [
        { label: 'PTS', key: 'nba_points' },
        { label: 'REB', key: 'nba_reb_total' },
        { label: 'AST', key: 'nba_assists' },
        { label: 'STL', key: 'nba_steals' },
        { label: 'MIN', key: 'nba_minutes' },
      ]
    case 'nfl':
      return [
        { label: 'PASS YDS', key: 'nfl_passing_yards' },
        { label: 'RUSH YDS', key: 'nfl_rushing_yards' },
        { label: 'REC YDS', key: 'nfl_receiving_yards' },
        { label: 'TD', key: 'nfl_touchdowns' },
        { label: 'TKL', key: 'nfl_tackles' },
      ]
    case 'nhl':
      return [
        { label: 'G', key: 'nhl_goals' },
        { label: 'A', key: 'nhl_assists' },
        { label: 'PTS', key: 'nhl_points' },
        { label: 'SOG', key: 'nhl_shots' },
        { label: 'TOI', key: 'nhl_toi' },
      ]
    case 'mlb':
      return [
        { label: 'AB', key: 'mlb_ab' },
        { label: 'H', key: 'mlb_hits' },
        { label: 'HR', key: 'mlb_home_runs' },
        { label: 'RBI', key: 'mlb_rbi' },
        { label: 'AVG', key: 'mlb_avg' },
      ]
    default:
      return []
  }
}

function fmtCell(value: any): string {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

interface BoxScoreTabProps {
  sport: string
  players: any[]
  linescore: Record<string, { home: number; away: number }> | null
  homeAbbr: string
  awayAbbr: string
  colors: ReturnType<typeof useTheme>['colors']
  isDark: boolean
}

function BoxScoreTab({ sport, players, linescore, homeAbbr, awayAbbr, colors, isDark }: BoxScoreTabProps) {
  const columns = getBoxScoreColumns(sport)
  const home = players.filter((p) => p.is_home_team)
  const away = players.filter((p) => !p.is_home_team)

  if (players.length === 0 && !linescore) {
    return (
      <View style={styles.tabPlaceholder}>
        <Text style={[styles.tabPlaceholderText, { color: colors.textMuted }]}>
          Box score not available yet — pulling stats…
        </Text>
      </View>
    )
  }

  const renderTeamTable = (label: string, list: any[]) => {
    if (list.length === 0) return null
    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={[styles.boxTeamLabel, { color: colors.text }]}>{label}</Text>
        {/* Header row */}
        <View
          style={[
            styles.boxRow,
            styles.boxHeaderRow,
            { borderBottomColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(11,15,20,0.1)' },
          ]}
        >
          <Text style={[styles.boxPlayerCell, styles.boxHeaderCell, { color: colors.textMuted }]}>
            PLAYER
          </Text>
          {columns.map((c) => (
            <Text
              key={c.key}
              style={[styles.boxStatCell, styles.boxHeaderCell, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {c.label}
            </Text>
          ))}
        </View>
        {list.slice(0, 12).map((p, idx) => (
          <View
            key={p.player_id || idx}
            style={[
              styles.boxRow,
              {
                borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(11,15,20,0.06)',
              },
            ]}
          >
            <Text style={[styles.boxPlayerCell, { color: colors.text }]} numberOfLines={1}>
              {p.full_name || '—'}
              {p.position ? ` · ${p.position}` : ''}
            </Text>
            {columns.map((c) => (
              <Text
                key={c.key}
                style={[styles.boxStatCell, { color: colors.text }]}
                numberOfLines={1}
              >
                {fmtCell(p[c.key])}
              </Text>
            ))}
          </View>
        ))}
      </View>
    )
  }

  return (
    <View>
      {linescore && Object.keys(linescore).length > 0 && (
        <View
          style={[
            styles.linescoreCard,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface,
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(11,15,20,0.08)',
            },
          ]}
        >
          <View style={styles.linescoreRow}>
            <Text style={[styles.linescoreCorner, { color: colors.textMuted }]}>{' '}</Text>
            {Object.keys(linescore).map((p) => (
              <Text
                key={p}
                style={[styles.linescoreCell, styles.linescoreHeader, { color: colors.textMuted }]}
              >
                {p}
              </Text>
            ))}
          </View>
          <View style={styles.linescoreRow}>
            <Text style={[styles.linescoreCorner, { color: colors.text }]}>{awayAbbr}</Text>
            {Object.keys(linescore).map((p) => (
              <Text key={p} style={[styles.linescoreCell, { color: colors.text }]}>
                {linescore[p].away}
              </Text>
            ))}
          </View>
          <View style={styles.linescoreRow}>
            <Text style={[styles.linescoreCorner, { color: colors.text }]}>{homeAbbr}</Text>
            {Object.keys(linescore).map((p) => (
              <Text key={p} style={[styles.linescoreCell, { color: colors.text }]}>
                {linescore[p].home}
              </Text>
            ))}
          </View>
        </View>
      )}

      {renderTeamTable(awayAbbr || 'Away', away)}
      {renderTeamTable(homeAbbr || 'Home', home)}
    </View>
  )
}

// ─── Team stats (home vs away comparison) ───────────────────────────────

interface TeamStatsTabProps {
  teamStats: { home: Record<string, number | string>; away: Record<string, number | string> } | null
  homeAbbr: string
  awayAbbr: string
  colors: ReturnType<typeof useTheme>['colors']
  isDark: boolean
}

function TeamStatsTab({ teamStats, homeAbbr, awayAbbr, colors, isDark }: TeamStatsTabProps) {
  if (!teamStats || (Object.keys(teamStats.home || {}).length === 0 && Object.keys(teamStats.away || {}).length === 0)) {
    return (
      <View style={styles.tabPlaceholder}>
        <Text style={[styles.tabPlaceholderText, { color: colors.textMuted }]}>
          Team stats not available yet.
        </Text>
      </View>
    )
  }

  const keys = Array.from(
    new Set([
      ...Object.keys(teamStats.home || {}),
      ...Object.keys(teamStats.away || {}),
    ])
  )

  return (
    <View>
      <View
        style={[
          styles.statsHeaderRow,
          { borderBottomColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(11,15,20,0.1)' },
        ]}
      >
        <Text style={[styles.statsLabelHeader, { color: colors.textMuted }]}>{awayAbbr}</Text>
        <Text style={[styles.statsLabelHeader, { color: colors.textMuted }]}>STAT</Text>
        <Text style={[styles.statsLabelHeader, { color: colors.textMuted }]}>{homeAbbr}</Text>
      </View>
      {keys.map((k) => (
        <View
          key={k}
          style={[
            styles.statsRow,
            { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(11,15,20,0.06)' },
          ]}
        >
          <Text style={[styles.statsValue, { color: colors.text }]}>{fmtCell(teamStats.away?.[k])}</Text>
          <Text style={[styles.statsKey, { color: colors.textMuted }]} numberOfLines={1}>
            {k.replace(/_/g, ' ').toUpperCase()}
          </Text>
          <Text style={[styles.statsValue, { color: colors.text }]}>{fmtCell(teamStats.home?.[k])}</Text>
        </View>
      ))}
    </View>
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
  // Play-by-play (mirrors web's PlayByPlay/PlayByPlayItem layout)
  tabBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 3,
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: 0.3,
  },
  emptyPlays: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyPlaysText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 4,
  },
  periodHeaderLabel: {
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.3,
  },
  periodHeaderScore: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
  },
  playCard: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  playLeftBar: {
    width: 4,
  },
  playBody: {
    flex: 1,
    padding: 12,
  },
  playRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  playMeta: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
  },
  playScoreLarge: {
    fontFamily: 'Montserrat-Bold',
  },
  playDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  tabPlaceholder: {
    paddingVertical: 40,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  tabPlaceholderText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
  // Box score
  boxTeamLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 4,
  },
  boxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  boxHeaderRow: {
    paddingTop: 6,
    paddingBottom: 6,
  },
  boxHeaderCell: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  boxPlayerCell: {
    flex: 2,
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    paddingRight: 4,
  },
  boxStatCell: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
  },
  // Linescore
  linescoreCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  linescoreRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  linescoreCorner: {
    width: 56,
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
  },
  linescoreCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
  },
  linescoreHeader: {
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // Team stats
  statsHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  statsLabelHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statsValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  statsKey: {
    flex: 1.5,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
    letterSpacing: 0.3,
  },
})
