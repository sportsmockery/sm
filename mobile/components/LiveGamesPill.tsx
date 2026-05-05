import { useEffect, useMemo, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { api, type LiveGame } from '@/lib/api'
import { queryKeys } from '@/lib/queryClient'

const POLL_LIVE_MS = 10_000
const POLL_IDLE_MS = 60_000

function isLive(g: LiveGame): boolean {
  const s = (g.status || '').toLowerCase()
  return s === 'in_progress' || s === 'live'
}

function isUpcoming(g: LiveGame): boolean {
  const s = (g.status || '').toLowerCase()
  return s === 'upcoming' || s === 'pre' || s === 'scheduled'
}

function periodText(g: LiveGame): string {
  if (g.period_label) return g.period_label
  if (g.period && g.clock) return `${g.period} · ${g.clock}`
  if (g.period) return String(g.period)
  if (g.clock) return g.clock
  return ''
}

export default function LiveGamesPill() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [pollMs, setPollMs] = useState(POLL_IDLE_MS)

  const { data } = useQuery({
    queryKey: queryKeys.liveGames,
    queryFn: () => api.getLiveGames(),
    refetchInterval: pollMs,
    staleTime: 5_000,
  })

  const games = useMemo(() => {
    const all = data?.games ?? []
    // Show live first, then upcoming within ~1 hour. Skip finals.
    return all.filter((g) => isLive(g) || isUpcoming(g))
  }, [data])

  // Tighten polling whenever any game is currently live.
  useEffect(() => {
    const anyLive = games.some(isLive)
    setPollMs(anyLive ? POLL_LIVE_MS : POLL_IDLE_MS)
  }, [games])

  // Pre-warm the live-game detail cache for each pill, so tapping into the
  // game shows scoreboard + plays + box score immediately instead of flashing
  // empty states. Refetches inherit React Query's staleTime.
  useEffect(() => {
    if (games.length === 0) return
    for (const g of games) {
      queryClient.prefetchQuery({
        queryKey: queryKeys.liveGame(g.game_id),
        queryFn: () => api.getLiveGame(g.game_id),
        staleTime: 5_000,
      })
    }
  }, [games, queryClient])

  if (games.length === 0) return null

  return (
    <View style={styles.bar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {games.map((g) => {
          const live = isLive(g)
          const upcoming = isUpcoming(g)
          const homeWins = (g.home_score ?? 0) > (g.away_score ?? 0)
          const awayWins = (g.away_score ?? 0) > (g.home_score ?? 0)
          return (
            <TouchableOpacity
              key={g.game_id}
              activeOpacity={0.85}
              onPress={() => router.push(`/live/${g.game_id}` as any)}
              style={styles.pill}
            >
              {/* Status badge */}
              {live ? (
                <View style={styles.statusRow}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              ) : upcoming ? (
                <View style={styles.statusRow}>
                  <View style={styles.upcomingDot} />
                  <Text style={styles.upcomingText}>SOON</Text>
                </View>
              ) : null}

              {/* Teams */}
              <View style={styles.teams}>
                {g.away_logo_url ? (
                  <Image source={{ uri: g.away_logo_url }} style={styles.logo} contentFit="contain" />
                ) : null}
                {g.home_logo_url ? (
                  <Image source={{ uri: g.home_logo_url }} style={styles.logoSmall} contentFit="contain" />
                ) : null}
              </View>

              {/* Score / time */}
              <View style={styles.score}>
                {live || (g.home_score ?? 0) + (g.away_score ?? 0) > 0 ? (
                  <Text style={styles.scoreText}>
                    <Text style={awayWins ? styles.winner : styles.scorePart}>
                      {g.away_team_abbr || g.away_team_name?.slice(0, 3).toUpperCase() || '—'} {g.away_score ?? 0}
                    </Text>
                    <Text style={styles.scoreDivider}>  –  </Text>
                    <Text style={homeWins ? styles.winner : styles.scorePart}>
                      {g.home_team_abbr || g.home_team_name?.slice(0, 3).toUpperCase() || '—'} {g.home_score ?? 0}
                    </Text>
                  </Text>
                ) : (
                  <Text style={styles.scoreText}>
                    {g.away_team_abbr || g.away_team_name?.slice(0, 3).toUpperCase() || '—'}{' '}
                    @ {g.home_team_abbr || g.home_team_name?.slice(0, 3).toUpperCase() || '—'}
                  </Text>
                )}
                {!!periodText(g) && live && (
                  <Text style={styles.periodText}>{periodText(g)}</Text>
                )}
                {!live && !!g.game_time_display && (
                  <Text style={styles.periodText}>{g.game_time_display}</Text>
                )}
              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#00D4FF',
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(11,15,20,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(11,15,20,0.6)',
    minHeight: 44,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  liveText: {
    color: '#FAFAFB',
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
  },
  upcomingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#facc15',
  },
  upcomingText: {
    color: '#facc15',
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
  },
  teams: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  logo: {
    width: 22,
    height: 22,
  },
  logoSmall: {
    width: 18,
    height: 18,
    opacity: 0.85,
  },
  score: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  scoreText: {
    color: '#FAFAFB',
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
  },
  scorePart: {
    color: 'rgba(250,250,251,0.7)',
  },
  winner: {
    color: '#FAFAFB',
  },
  scoreDivider: {
    color: 'rgba(250,250,251,0.4)',
  },
  periodText: {
    color: 'rgba(250,250,251,0.6)',
    fontSize: 10,
    fontFamily: 'Montserrat-Medium',
    marginTop: 1,
  },
})
