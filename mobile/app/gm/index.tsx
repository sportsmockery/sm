import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { COLORS, TEAMS } from '@/lib/config'
import { useGM } from '@/lib/gm-context'
import { gmApi } from '@/lib/gm-api'

const CHICAGO_TEAMS = [
  { key: 'bears', ...TEAMS.bears },
  { key: 'bulls', ...TEAMS.bulls },
  { key: 'blackhawks', ...TEAMS.blackhawks },
  { key: 'cubs', ...TEAMS.cubs },
  { key: 'whitesox', ...TEAMS.whitesox },
]

export default function GMIndexScreen() {
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { state, dispatch } = useGM()
  const [loading, setLoading] = useState(false)

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>GM Trade Simulator</Text>
          </View>
        </View>
        <View style={styles.loginPrompt}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.loginTitle, { color: colors.text }]}>Sign In Required</Text>
          <Text style={[styles.loginDesc, { color: colors.textMuted }]}>
            Create an account or sign in to build trades and get AI grades.
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.loginBtnText}>Sign In or Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const handleSelectTeam = async (teamKey: string) => {
    dispatch({ type: 'SET_TEAM', team: teamKey as any })
    setLoading(true)
    try {
      const [rosterRes] = await Promise.all([
        gmApi.getRoster(teamKey),
        gmApi.createSession(teamKey).then(res => {
          dispatch({ type: 'SET_SESSION_ID', id: res.session.id })
        }).catch(() => {}),
      ])
      dispatch({ type: 'SET_ROSTER', players: rosterRes.players })
      router.push('/gm/roster')
    } catch (err: any) {
      console.error('Failed to load roster:', err)
      Alert.alert('Error', err.message || 'Failed to load roster. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>GM Trade Simulator</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Build trades. Get AI grades.
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/gm/history')} style={styles.iconBtn}>
            <Ionicons name="time-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/gm/leaderboard')} style={styles.iconBtn}>
            <Ionicons name="trophy-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading roster...</Text>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Step Indicator */}
        <View style={styles.stepRow}>
          <View style={[styles.stepBadge, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.stepBadgeText}>1</Text>
          </View>
          <Text style={[styles.stepLabel, { color: colors.text }]}>Select Your Chicago Team</Text>
        </View>

        {/* Team Cards */}
        {CHICAGO_TEAMS.map((team) => (
          <TouchableOpacity
            key={team.key}
            style={[styles.teamCard, { backgroundColor: colors.surface }]}
            activeOpacity={0.85}
            onPress={() => handleSelectTeam(team.key)}
            disabled={loading}
          >
            <View style={[styles.teamColorBar, { backgroundColor: team.color }]} />
            <View style={styles.teamRow}>
              <View style={[styles.teamLogo, { backgroundColor: team.color }]}>
                <Image
                  source={{ uri: team.logo }}
                  style={{ width: 40, height: 40 }}
                  contentFit="contain"
                />
              </View>
              <View style={styles.teamInfo}>
                <Text style={[styles.teamName, { color: colors.text }]}>{team.name}</Text>
                <Text style={[styles.teamSport, { color: colors.textMuted }]}>
                  {team.sport.toUpperCase()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { marginRight: 12 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 20, fontFamily: 'Montserrat-Bold' },
  headerSubtitle: { fontSize: 12, fontFamily: 'Montserrat-Regular', marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 4 },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: { marginTop: 12, fontSize: 14, fontFamily: 'Montserrat-Medium' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stepBadge: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  stepBadgeText: { color: '#fff', fontSize: 14, fontFamily: 'Montserrat-Bold' },
  stepLabel: { fontSize: 16, fontFamily: 'Montserrat-SemiBold' },
  teamCard: {
    borderRadius: 14, marginBottom: 10, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  teamColorBar: { height: 3, width: '100%' },
  teamRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  teamLogo: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
  },
  teamInfo: { flex: 1, marginLeft: 14 },
  teamName: { fontSize: 16, fontFamily: 'Montserrat-Bold' },
  teamSport: { fontSize: 12, fontFamily: 'Montserrat-Medium', marginTop: 2, letterSpacing: 0.5 },
  loginPrompt: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  loginTitle: {
    fontSize: 20, fontFamily: 'Montserrat-Bold', marginTop: 16, marginBottom: 8,
  },
  loginDesc: {
    fontSize: 14, fontFamily: 'Montserrat-Regular', textAlign: 'center', lineHeight: 22, marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12,
  },
  loginBtnText: {
    color: '#fff', fontSize: 16, fontFamily: 'Montserrat-Bold',
  },
})
