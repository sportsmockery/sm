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
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { COLORS, TEAMS, API_BASE_URL } from '@/lib/config'
import { useGM } from '@/lib/gm-context'

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
})
