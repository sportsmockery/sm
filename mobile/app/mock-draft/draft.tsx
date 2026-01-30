import { useState, useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  FlatList,
  Alert,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { useMockDraft, getCurrentPick, isUserPick, getTeamColor, getUserPicks } from '@/lib/mock-draft-context'
import { mockDraftApi } from '@/lib/mock-draft-api'
import { CHICAGO_TEAM_INFO, Prospect } from '@/lib/mock-draft-types'
import { COLORS } from '@/lib/config'

export default function MockDraftScreen() {
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const { session } = useAuth()
  const { state, dispatch } = useMockDraft()
  const token = session?.access_token

  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState('')
  const [showDraftBoard, setShowDraftBoard] = useState(false)

  const { activeDraft, prospects, selectedTeam, autoAdvancing, submittingPick, grading } = state
  const teamColor = getTeamColor(selectedTeam)
  const teamInfo = selectedTeam ? CHICAGO_TEAM_INFO[selectedTeam] : null

  const currentPick = getCurrentPick(activeDraft)
  const isUsersTurn = isUserPick(activeDraft)
  const userPicks = getUserPicks(activeDraft)

  // Filter prospects
  const filteredProspects = useMemo(() => {
    if (!prospects) return []
    const pickedIds = new Set(
      activeDraft?.picks
        .filter(p => p.selected_prospect)
        .map(p => p.selected_prospect!.id) || []
    )
    return prospects.filter(p => {
      if (pickedIds.has(p.id)) return false
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (positionFilter && p.position !== positionFilter) return false
      return true
    })
  }, [prospects, activeDraft, searchQuery, positionFilter])

  // Get unique positions
  const positions = useMemo(() => {
    if (!prospects) return []
    return [...new Set(prospects.map(p => p.position))].sort()
  }, [prospects])

  // Submit a pick
  const submitPick = async (prospect: Prospect) => {
    if (!activeDraft || !currentPick || !isUsersTurn) return

    dispatch({ type: 'SET_SUBMITTING_PICK', submitting: true })
    dispatch({ type: 'SET_ERROR', error: null })

    try {
      const data = await mockDraftApi.submitPick(
        activeDraft.id,
        prospect.id,
        currentPick.pick_number,
        token
      )
      dispatch({ type: 'SET_ACTIVE_DRAFT', draft: data.draft })
    } catch (e: any) {
      dispatch({ type: 'SET_ERROR', error: e.message })
      Alert.alert('Error', e.message)
    }
    dispatch({ type: 'SET_SUBMITTING_PICK', submitting: false })
  }

  // Auto-advance
  const handleAutoAdvance = async () => {
    if (!activeDraft) return

    dispatch({ type: 'SET_AUTO_ADVANCING', advancing: true })
    dispatch({ type: 'SET_ERROR', error: null })

    try {
      const data = await mockDraftApi.autoAdvance(activeDraft.id, token)
      dispatch({ type: 'SET_ACTIVE_DRAFT', draft: data.draft })
    } catch (e: any) {
      dispatch({ type: 'SET_ERROR', error: e.message })
      Alert.alert('Error', e.message)
    }
    dispatch({ type: 'SET_AUTO_ADVANCING', advancing: false })
  }

  // Grade draft
  const handleGradeDraft = async () => {
    if (!activeDraft) return

    dispatch({ type: 'SET_GRADING', grading: true })

    try {
      const data = await mockDraftApi.gradeDraft(activeDraft.id, token)
      dispatch({ type: 'SET_GRADE_RESULT', grade: data.grade })
      dispatch({ type: 'SET_ACTIVE_DRAFT', draft: { ...activeDraft, status: 'graded' } })
      router.push('/mock-draft/result')
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to grade draft')
    }
    dispatch({ type: 'SET_GRADING', grading: false })
  }

  // New draft
  const handleNewDraft = () => {
    dispatch({ type: 'RESET' })
    router.replace('/mock-draft')
  }

  if (!activeDraft || !teamInfo) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    )
  }

  const isDraftComplete = activeDraft.status === 'completed' || activeDraft.status === 'graded'

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: teamColor }]}>
        <TouchableOpacity onPress={handleNewDraft} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Image source={{ uri: teamInfo.logo }} style={styles.headerLogo} contentFit="contain" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{teamInfo.name.replace('Chicago ', '')}</Text>
            <Text style={styles.headerSubtitle}>
              Pick {activeDraft.current_pick} of {activeDraft.total_picks}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.boardToggle}
          onPress={() => setShowDraftBoard(!showDraftBoard)}
        >
          <Ionicons name={showDraftBoard ? 'list' : 'grid'} size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Current Pick Status */}
      <View style={[styles.statusBar, { backgroundColor: colors.surface }]}>
        <View style={styles.statusContent}>
          <Text style={[styles.statusLabel, { color: colors.textMuted }]}>
            {isDraftComplete
              ? 'Draft Complete'
              : isUsersTurn
                ? 'YOUR PICK'
                : 'ON THE CLOCK'}
          </Text>
          <Text style={[styles.statusValue, { color: colors.text }]}>
            {isDraftComplete
              ? `${userPicks.length} picks made`
              : isUsersTurn
                ? `Pick #${currentPick?.pick_number}`
                : currentPick?.team_name}
          </Text>
        </View>
        {!isDraftComplete && !isUsersTurn && (
          <TouchableOpacity
            style={[styles.advanceButton, { backgroundColor: teamColor }]}
            onPress={handleAutoAdvance}
            disabled={autoAdvancing}
          >
            {autoAdvancing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.advanceButtonText}>Advance</Text>
            )}
          </TouchableOpacity>
        )}
        {isDraftComplete && !state.gradeResult && (
          <TouchableOpacity
            style={[styles.gradeButton, { backgroundColor: teamColor }]}
            onPress={handleGradeDraft}
            disabled={grading}
          >
            {grading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.gradeButtonText}>Get Grade</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content */}
      {showDraftBoard ? (
        // Draft Board View
        <FlatList
          data={activeDraft.picks}
          keyExtractor={(item) => item.pick_number.toString()}
          contentContainerStyle={styles.draftBoardList}
          renderItem={({ item: pick }) => (
            <View
              style={[
                styles.draftBoardItem,
                {
                  backgroundColor: pick.is_current
                    ? (pick.is_user_pick ? teamColor + '30' : colors.surfaceHighlight)
                    : colors.surface,
                  borderColor: pick.is_current ? teamColor : 'transparent',
                },
              ]}
            >
              <View style={[styles.pickNumber, { backgroundColor: pick.is_user_pick ? teamColor : '#6b7280' }]}>
                <Text style={styles.pickNumberText}>{pick.pick_number}</Text>
              </View>
              <View style={styles.pickInfo}>
                <Text style={[styles.pickTeam, { color: colors.text }]} numberOfLines={1}>
                  {pick.team_name}
                </Text>
                {pick.selected_prospect ? (
                  <Text style={[styles.pickProspect, { color: colors.textMuted }]} numberOfLines={1}>
                    {pick.selected_prospect.name} ({pick.selected_prospect.position})
                  </Text>
                ) : pick.is_current ? (
                  <Text style={[styles.pickStatus, { color: pick.is_user_pick ? teamColor : colors.textMuted }]}>
                    {pick.is_user_pick ? 'Your turn!' : 'On the clock'}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
        />
      ) : isUsersTurn && !isDraftComplete ? (
        // Prospect Selection View
        <View style={styles.prospectSection}>
          {/* Search & Filter */}
          <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search prospects..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                { backgroundColor: !positionFilter ? teamColor : colors.surface }
              ]}
              onPress={() => setPositionFilter('')}
            >
              <Text style={[styles.filterChipText, { color: !positionFilter ? '#fff' : colors.text }]}>
                All
              </Text>
            </TouchableOpacity>
            {positions.map(pos => (
              <TouchableOpacity
                key={pos}
                style={[
                  styles.filterChip,
                  { backgroundColor: positionFilter === pos ? teamColor : colors.surface }
                ]}
                onPress={() => setPositionFilter(pos)}
              >
                <Text style={[styles.filterChipText, { color: positionFilter === pos ? '#fff' : colors.text }]}>
                  {pos}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Prospect List */}
          <FlatList
            data={filteredProspects}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.prospectList}
            renderItem={({ item: prospect }) => (
              <TouchableOpacity
                style={[styles.prospectCard, { backgroundColor: colors.surface }]}
                onPress={() => submitPick(prospect)}
                disabled={submittingPick}
                activeOpacity={0.8}
              >
                <View style={styles.prospectMain}>
                  <View style={[styles.prospectAvatar, { backgroundColor: teamColor + '20' }]}>
                    {prospect.headshot_url ? (
                      <Image source={{ uri: prospect.headshot_url }} style={styles.prospectImage} contentFit="cover" />
                    ) : (
                      <Text style={[styles.prospectInitial, { color: teamColor }]}>
                        {prospect.name.charAt(0)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.prospectInfo}>
                    <Text style={[styles.prospectName, { color: colors.text }]}>{prospect.name}</Text>
                    <Text style={[styles.prospectMeta, { color: colors.textMuted }]}>
                      {prospect.position} • {prospect.school}
                    </Text>
                  </View>
                </View>
                <View style={styles.prospectActions}>
                  {prospect.grade && (
                    <View style={[
                      styles.prospectGrade,
                      { backgroundColor: prospect.grade >= 80 ? COLORS.success : prospect.grade >= 60 ? '#f59e0b' : '#6b7280' }
                    ]}>
                      <Text style={styles.prospectGradeText}>{prospect.grade}</Text>
                    </View>
                  )}
                  <View style={[styles.draftButton, { backgroundColor: teamColor }]}>
                    <Text style={styles.draftButtonText}>Draft</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  No prospects match your search
                </Text>
              </View>
            }
          />
        </View>
      ) : (
        // Summary View (after completion or waiting)
        <ScrollView contentContainerStyle={styles.summaryContainer}>
          {isDraftComplete && (
            <>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>Your Picks</Text>
              {userPicks.map(pick => (
                <View
                  key={pick.pick_number}
                  style={[styles.summaryPick, { backgroundColor: teamColor + '20', borderColor: teamColor + '40' }]}
                >
                  <View style={[styles.summaryPickNum, { backgroundColor: teamColor }]}>
                    <Text style={styles.summaryPickNumText}>#{pick.pick_number}</Text>
                  </View>
                  <View style={styles.summaryPickInfo}>
                    <Text style={[styles.summaryPickName, { color: colors.text }]}>
                      {pick.selected_prospect?.name}
                    </Text>
                    <Text style={[styles.summaryPickMeta, { color: colors.textMuted }]}>
                      {pick.selected_prospect?.position}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
          {!isDraftComplete && !isUsersTurn && (
            <View style={styles.waitingContainer}>
              <Ionicons name="time-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.waitingText, { color: colors.text }]}>
                {currentPick?.team_name} is on the clock
              </Text>
              <Text style={[styles.waitingSubtext, { color: colors.textMuted }]}>
                Tap "Advance" to simulate their pick
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerLogo: {
    width: 36,
    height: 36,
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
  },
  boardToggle: {
    padding: 8,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusContent: {},
  statusLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusValue: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    marginTop: 2,
  },
  advanceButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  advanceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  gradeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  gradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  draftBoardList: {
    padding: 16,
  },
  draftBoardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 2,
  },
  pickNumber: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickNumberText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
  },
  pickInfo: {
    flex: 1,
    marginLeft: 10,
  },
  pickTeam: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
  },
  pickProspect: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    marginTop: 1,
  },
  pickStatus: {
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
    marginTop: 1,
  },
  prospectSection: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  filterScroll: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
  },
  prospectList: {
    padding: 16,
    paddingTop: 8,
  },
  prospectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  prospectMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  prospectAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  prospectImage: {
    width: 44,
    height: 44,
  },
  prospectInitial: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  prospectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  prospectName: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  prospectMeta: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  prospectActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prospectGrade: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  prospectGradeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
  },
  draftButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  draftButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
  },
  emptyList: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  summaryContainer: {
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 12,
  },
  summaryPick: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  summaryPickNum: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  summaryPickNumText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
  },
  summaryPickInfo: {
    marginLeft: 12,
  },
  summaryPickName: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  summaryPickMeta: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  waitingText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 16,
  },
  waitingSubtext: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
})
