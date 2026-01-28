import { useEffect, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Share,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { COLORS, TEAMS, API_BASE_URL } from '@/lib/config'
import { useGM } from '@/lib/gm-context'
import type { PlayerData, DraftPick } from '@/lib/gm-types'

function formatMoney(value: number | null | undefined): string {
  if (!value) return '—'
  return `$${(value / 1_000_000).toFixed(1)}M`
}

function getGradeColor(grade: number) {
  if (grade >= 85) return '#22c55e'
  if (grade >= 75) return '#f59e0b'
  if (grade >= 50) return '#f97316'
  return '#ef4444'
}

export default function GMResultScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { state, dispatch } = useGM()
  const result = state.gradeResult

  const scaleAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const gradeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(gradeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ]).start()
  }, [])

  if (!result) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No grade result available</Text>
          <TouchableOpacity onPress={() => router.replace('/gm')} style={styles.linkBtn}>
            <Text style={[styles.linkBtnText, { color: COLORS.primary }]}>Start New Trade</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const gradeColor = getGradeColor(result.grade)
  const teamConfig = state.chicagoTeam ? TEAMS[state.chicagoTeam] : null

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I got a ${result.grade}/100 on my ${teamConfig?.shortName || ''} trade in the GM Trade Simulator! ${API_BASE_URL}/gm/share/${result.shared_code}`,
      })
    } catch {}
  }

  const handleNewTrade = () => {
    dispatch({ type: 'RESET' })
    router.replace('/gm')
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Grade Circle */}
        <Animated.View style={[styles.gradeCircleWrap, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.gradeCircle, { borderColor: gradeColor }]}>
            <Text style={[styles.gradeNumber, { color: gradeColor }]}>{result.grade}</Text>
            <Text style={[styles.gradeOutOf, { color: colors.textMuted }]}>/100</Text>
          </View>
        </Animated.View>

        {/* Status Badge */}
        <Animated.View style={[styles.statusBadge, {
          backgroundColor: result.status === 'accepted' ? '#22c55e' : '#ef4444',
          opacity: fadeAnim,
        }]}>
          <Ionicons
            name={result.status === 'accepted' ? 'checkmark-circle' : 'close-circle'}
            size={18}
            color="#fff"
          />
          <Text style={styles.statusText}>
            {result.status === 'accepted' ? 'TRADE ACCEPTED' : 'TRADE REJECTED'}
          </Text>
        </Animated.View>

        {result.is_dangerous && (
          <View style={styles.dangerBadge}>
            <Ionicons name="warning" size={16} color="#f59e0b" />
            <Text style={styles.dangerText}>Dangerous Trade</Text>
          </View>
        )}

        {/* Trade Details */}
        <View style={[styles.tradeDetailsCard, { backgroundColor: colors.surface }]}>
          {/* Players Sent */}
          <View style={styles.tradeSide}>
            <View style={[styles.tradeSideHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.tradeSideBadge, { backgroundColor: teamConfig?.color || COLORS.primary }]}>
                {teamConfig?.logo && (
                  <Image source={{ uri: teamConfig.logo }} style={{ width: 20, height: 20 }} contentFit="contain" />
                )}
              </View>
              <Text style={[styles.tradeSideTitle, { color: colors.text }]}>
                {teamConfig?.shortName || 'Chicago'} Sends
              </Text>
            </View>
            {state.selectedPlayers.map((player, idx) => (
              <View key={`sent-${player.player_id}-${idx}`} style={styles.playerRow}>
                {player.headshot_url ? (
                  <Image source={{ uri: player.headshot_url }} style={styles.playerThumb} contentFit="cover" />
                ) : (
                  <View style={[styles.playerThumb, styles.playerThumbPlaceholder, { backgroundColor: teamConfig?.color || '#666' }]}>
                    <Text style={styles.playerThumbInitial}>{player.full_name.charAt(0)}</Text>
                  </View>
                )}
                <View style={styles.playerInfo}>
                  <Text style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
                    {player.full_name}
                  </Text>
                  <Text style={[styles.playerMeta, { color: colors.textMuted }]}>
                    {player.position} {player.age ? `· ${player.age}y` : ''}
                  </Text>
                  {(player.cap_hit || player.contract_years) && (
                    <Text style={[styles.playerContract, { color: colors.textMuted }]}>
                      {formatMoney(player.cap_hit)}
                      {player.contract_years ? ` · ${player.contract_years}yr` : ''}
                      {player.is_rookie_deal ? ' (Rookie)' : ''}
                    </Text>
                  )}
                </View>
              </View>
            ))}
            {state.draftPicksSent.map((pick, idx) => (
              <View key={`pick-sent-${idx}`} style={styles.draftPickRow}>
                <Ionicons name="document-text-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.draftPickText, { color: colors.text }]}>
                  {pick.year} Round {pick.round} Pick
                  {pick.condition ? ` (${pick.condition})` : ''}
                </Text>
              </View>
            ))}
          </View>

          {/* Arrow Separator */}
          <View style={styles.tradeArrow}>
            <Ionicons name="swap-horizontal" size={24} color={colors.textMuted} />
          </View>

          {/* Players Received */}
          <View style={styles.tradeSide}>
            <View style={[styles.tradeSideHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.tradeSideBadge, { backgroundColor: state.opponent?.primary_color || '#666' }]}>
                {state.opponent?.logo_url && (
                  <Image source={{ uri: state.opponent.logo_url }} style={{ width: 20, height: 20 }} contentFit="contain" />
                )}
              </View>
              <Text style={[styles.tradeSideTitle, { color: colors.text }]}>
                {state.opponent?.abbreviation || 'Opponent'} Sends
              </Text>
            </View>
            {state.selectedOpponentPlayers.map((player, idx) => (
              <View key={`recv-${player.player_id}-${idx}`} style={styles.playerRow}>
                {player.headshot_url ? (
                  <Image source={{ uri: player.headshot_url }} style={styles.playerThumb} contentFit="cover" />
                ) : (
                  <View style={[styles.playerThumb, styles.playerThumbPlaceholder, { backgroundColor: state.opponent?.primary_color || '#666' }]}>
                    <Text style={styles.playerThumbInitial}>{player.full_name.charAt(0)}</Text>
                  </View>
                )}
                <View style={styles.playerInfo}>
                  <Text style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
                    {player.full_name}
                  </Text>
                  <Text style={[styles.playerMeta, { color: colors.textMuted }]}>
                    {player.position} {player.age ? `· ${player.age}y` : ''}
                  </Text>
                  {(player.cap_hit || player.contract_years) && (
                    <Text style={[styles.playerContract, { color: colors.textMuted }]}>
                      {formatMoney(player.cap_hit)}
                      {player.contract_years ? ` · ${player.contract_years}yr` : ''}
                      {player.is_rookie_deal ? ' (Rookie)' : ''}
                    </Text>
                  )}
                </View>
              </View>
            ))}
            {state.draftPicksReceived.map((pick, idx) => (
              <View key={`pick-recv-${idx}`} style={styles.draftPickRow}>
                <Ionicons name="document-text-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.draftPickText, { color: colors.text }]}>
                  {pick.year} Round {pick.round} Pick
                  {pick.condition ? ` (${pick.condition})` : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Breakdown */}
        {result.breakdown && (
          <Animated.View style={[styles.breakdownCard, { backgroundColor: colors.surface, opacity: gradeAnim }]}>
            <Text style={[styles.breakdownTitle, { color: colors.text }]}>Trade Breakdown</Text>
            {Object.entries(result.breakdown).map(([key, val]) => (
              <View key={key} style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
                <View style={styles.barWrap}>
                  <View style={[styles.barFill, { width: `${val * 100}%`, backgroundColor: gradeColor }]} />
                </View>
                <Text style={[styles.breakdownVal, { color: colors.text }]}>
                  {Math.round(val * 100)}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Reasoning */}
        <Animated.View style={[styles.reasoningCard, { backgroundColor: colors.surface, opacity: gradeAnim }]}>
          <Text style={[styles.reasoningTitle, { color: colors.text }]}>GM Analysis</Text>
          <Text style={[styles.reasoningText, { color: colors.textMuted }]}>{result.reasoning}</Text>
        </Animated.View>

        {/* Cap Analysis */}
        {result.cap_analysis && (
          <View style={[styles.reasoningCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.reasoningTitle, { color: colors.text }]}>Cap Impact</Text>
            <Text style={[styles.reasoningText, { color: colors.textMuted }]}>{result.cap_analysis}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleNewTrade}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>New Trade</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, { borderColor: colors.border }]} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={colors.text} />
            <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navLinks}>
          <TouchableOpacity onPress={() => router.push('/gm/history')}>
            <Text style={[styles.linkBtnText, { color: COLORS.primary }]}>View History</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/gm/leaderboard')}>
            <Text style={[styles.linkBtnText, { color: COLORS.primary }]}>Leaderboard</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, fontFamily: 'Montserrat-Regular' },
  scrollContent: { padding: 20, alignItems: 'center' },
  gradeCircleWrap: { marginTop: 20, marginBottom: 16 },
  gradeCircle: {
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 6, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'transparent',
  },
  gradeNumber: { fontSize: 52, fontFamily: 'Montserrat-Bold' },
  gradeOutOf: { fontSize: 16, fontFamily: 'Montserrat-Regular', marginTop: -4 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6,
    marginBottom: 8,
  },
  statusText: { color: '#fff', fontSize: 14, fontFamily: 'Montserrat-Bold', letterSpacing: 0.5 },
  dangerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginBottom: 16,
  },
  dangerText: { color: '#f59e0b', fontSize: 13, fontFamily: 'Montserrat-SemiBold' },
  breakdownCard: {
    width: '100%', borderRadius: 14, padding: 16, marginBottom: 12,
  },
  breakdownTitle: { fontSize: 15, fontFamily: 'Montserrat-Bold', marginBottom: 12 },
  breakdownRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 10,
  },
  breakdownLabel: { width: 100, fontSize: 12, fontFamily: 'Montserrat-Medium' },
  barWrap: {
    flex: 1, height: 8, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 4, marginHorizontal: 8,
  },
  barFill: { height: 8, borderRadius: 4 },
  breakdownVal: { width: 30, textAlign: 'right', fontSize: 13, fontFamily: 'Montserrat-Bold' },
  reasoningCard: {
    width: '100%', borderRadius: 14, padding: 16, marginBottom: 12,
  },
  reasoningTitle: { fontSize: 15, fontFamily: 'Montserrat-Bold', marginBottom: 8 },
  reasoningText: { fontSize: 14, fontFamily: 'Montserrat-Regular', lineHeight: 22 },
  actions: {
    flexDirection: 'row', gap: 12, marginTop: 8, width: '100%',
  },
  primaryBtn: {
    flex: 1, backgroundColor: COLORS.primary,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 14, borderRadius: 12, gap: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Montserrat-Bold' },
  secondaryBtn: {
    flex: 1, borderWidth: 1,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 14, borderRadius: 12, gap: 8,
  },
  secondaryBtnText: { fontSize: 15, fontFamily: 'Montserrat-Bold' },
  navLinks: {
    flexDirection: 'row', gap: 24, marginTop: 20,
  },
  linkBtn: { marginTop: 16 },
  linkBtnText: { fontSize: 14, fontFamily: 'Montserrat-SemiBold' },
  // Trade details styles
  tradeDetailsCard: {
    width: '100%',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  tradeSide: {
    marginBottom: 8,
  },
  tradeSideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
  },
  tradeSideBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  tradeSideTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  playerThumb: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  playerThumbPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerThumbInitial: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  playerMeta: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    marginTop: 1,
  },
  playerContract: {
    fontSize: 10,
    fontFamily: 'Montserrat-Medium',
    marginTop: 2,
  },
  draftPickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  draftPickText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
  },
  tradeArrow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
})
