import { useEffect, useCallback } from 'react'
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
import { useMockDraft, getTeamColor } from '@/lib/mock-draft-context'
import { mockDraftApi } from '@/lib/mock-draft-api'
import { CHICAGO_TEAM_INFO, ChicagoTeam } from '@/lib/mock-draft-types'
import { COLORS } from '@/lib/config'

const TEAMS = Object.entries(CHICAGO_TEAM_INFO) as [ChicagoTeam, typeof CHICAGO_TEAM_INFO[ChicagoTeam]][]

export default function MockDraftIndex() {
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const { session, isAuthenticated } = useAuth()
  const { state, dispatch } = useMockDraft()
  const token = session?.access_token

  // Fetch eligibility on mount
  useEffect(() => {
    fetchEligibility()
    fetchHistory()
  }, [token])

  const fetchEligibility = useCallback(async () => {
    dispatch({ type: 'SET_ELIGIBILITY_LOADING', loading: true })
    try {
      const data = await mockDraftApi.getEligibility(token)
      const eligMap: Record<string, any> = {}
      for (const team of data.teams || []) {
        if (team.sport === 'nfl') eligMap['bears'] = team
        else if (team.sport === 'nba') eligMap['bulls'] = team
        else if (team.sport === 'nhl') eligMap['blackhawks'] = team
        else if (team.sport === 'mlb' && team.team_key === 'chc') eligMap['cubs'] = team
        else if (team.sport === 'mlb' && team.team_key === 'chw') eligMap['whitesox'] = team
      }
      dispatch({ type: 'SET_ELIGIBILITY', eligibility: eligMap })
    } catch (e) {
      console.error('Failed to fetch eligibility:', e)
    }
    dispatch({ type: 'SET_ELIGIBILITY_LOADING', loading: false })
  }, [token])

  const fetchHistory = useCallback(async () => {
    dispatch({ type: 'SET_HISTORY_LOADING', loading: true })
    try {
      const data = await mockDraftApi.getHistory(token)
      dispatch({ type: 'SET_HISTORY', history: data.drafts || [] })
    } catch (e) {
      console.error('Failed to fetch history:', e)
    }
    dispatch({ type: 'SET_HISTORY_LOADING', loading: false })
  }, [token])

  const startDraft = async (teamKey: ChicagoTeam) => {
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }

    const eligibility = state.eligibility[teamKey]
    if (eligibility && !eligibility.eligible) {
      Alert.alert('Not Available', eligibility.reason || 'Mock Draft is not available for this team')
      return
    }

    dispatch({ type: 'SET_TEAM', team: teamKey })

    try {
      const data = await mockDraftApi.startDraft(teamKey, token)
      dispatch({ type: 'SET_ACTIVE_DRAFT', draft: data.draft })

      // Fetch prospects
      const teamInfo = CHICAGO_TEAM_INFO[teamKey]
      const prospectsData = await mockDraftApi.getProspects(teamInfo.sport, data.draft.draft_year, token)
      dispatch({ type: 'SET_PROSPECTS', prospects: prospectsData.prospects || [] })

      // Navigate to draft screen
      router.push('/mock-draft/draft')
    } catch (e: any) {
      dispatch({ type: 'SET_ERROR', error: e.message })
      Alert.alert('Error', e.message || 'Failed to start draft')
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Mock Draft</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Draft prospects for your team
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroGradient}>
            <Ionicons name="trophy" size={40} color="#fff" style={styles.heroIcon} />
            <Text style={styles.heroTitle}>Build Your Dream Draft</Text>
            <Text style={styles.heroSubtitle}>
              Select a team, draft the best prospects, and get AI grades on your picks
            </Text>
          </View>
        </View>

        {/* Team Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Your Team</Text>

          {state.eligibilityLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                Loading team status...
              </Text>
            </View>
          ) : (
            <View style={styles.teamGrid}>
              {TEAMS.map(([teamKey, teamInfo]) => {
                const eligibility = state.eligibility[teamKey]
                const isEligible = eligibility?.eligible ?? false
                const daysUntilDraft = eligibility?.days_until_draft

                return (
                  <TouchableOpacity
                    key={teamKey}
                    style={[
                      styles.teamCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isEligible ? teamInfo.color : colors.border,
                        opacity: isEligible ? 1 : 0.5,
                      }
                    ]}
                    onPress={() => startDraft(teamKey)}
                    disabled={!isEligible}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.teamLogoContainer, { backgroundColor: teamInfo.color + '20' }]}>
                      <Image
                        source={{ uri: teamInfo.logo }}
                        style={styles.teamLogo}
                        contentFit="contain"
                      />
                    </View>
                    <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
                      {teamInfo.name.replace('Chicago ', '')}
                    </Text>
                    <Text style={[styles.teamStatus, { color: isEligible ? COLORS.success : colors.textMuted }]} numberOfLines={1}>
                      {isEligible ? 'Ready' : (eligibility?.reason?.split(' ')[0] || 'N/A')}
                    </Text>
                    {isEligible && daysUntilDraft && daysUntilDraft > 0 && (
                      <Text style={[styles.draftDays, { color: colors.textMuted }]}>
                        {daysUntilDraft}d to draft
                      </Text>
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </View>

        {/* History Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Draft History</Text>

          {state.historyLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : state.history.length === 0 ? (
            <View style={[styles.emptyHistory, { backgroundColor: colors.surface }]}>
              <Ionicons name="document-text-outline" size={32} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No drafts yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                Complete a mock draft to see your history
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {state.history.slice(0, 5).map((draft) => {
                const teamInfo = CHICAGO_TEAM_INFO[draft.chicago_team as ChicagoTeam]
                return (
                  <View
                    key={draft.id}
                    style={[styles.historyItem, { backgroundColor: colors.surface }]}
                  >
                    <Image
                      source={{ uri: teamInfo?.logo }}
                      style={styles.historyLogo}
                      contentFit="contain"
                    />
                    <View style={styles.historyInfo}>
                      <Text style={[styles.historyTeam, { color: colors.text }]}>
                        {teamInfo?.name.replace('Chicago ', '')} {draft.draft_year}
                      </Text>
                      <Text style={[styles.historyMeta, { color: colors.textMuted }]}>
                        {draft.picks_made} picks • {new Date(draft.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    {draft.grade && (
                      <View style={[
                        styles.historyGrade,
                        { backgroundColor: draft.grade >= 80 ? COLORS.success : draft.grade >= 60 ? '#f59e0b' : COLORS.error }
                      ]}>
                        <Text style={styles.historyGradeText}>
                          {draft.letter_grade || draft.grade}
                        </Text>
                      </View>
                    )}
                  </View>
                )
              })}
            </View>
          )}
        </View>

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  heroSection: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroGradient: {
    backgroundColor: '#1e40af',
    padding: 24,
    alignItems: 'center',
  },
  heroIcon: {
    marginBottom: 12,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  teamCard: {
    width: '50%',
    padding: 6,
  },
  teamCardInner: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  teamLogoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamLogo: {
    width: 40,
    height: 40,
  },
  teamName: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  teamStatus: {
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
  draftDays: {
    fontSize: 10,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  emptyHistory: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    marginTop: 4,
    textAlign: 'center',
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  historyLogo: {
    width: 32,
    height: 32,
  },
  historyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  historyTeam: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  historyMeta: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  historyGrade: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  historyGradeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
  },
})
