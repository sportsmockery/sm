/**
 * GM Trade Hub - Single-screen trade building experience
 * Features: Trade Dock, bottom sheet rosters, team selection
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import BottomSheet from '@gorhom/bottom-sheet'

import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { triggerHaptic } from '@/hooks/useHaptics'
import { COLORS, TEAMS } from '@/lib/config'
import { useGM } from '@/lib/gm-context'
import { gmApi, AuthRequiredError } from '@/lib/gm-api'
import type { ChicagoTeam, OpponentTeam, PlayerData } from '@/lib/gm-types'

import {
  TradeDock,
  RosterBottomSheet,
  OpponentSelectorSheet,
  DraftPicksSheet,
} from '@/components/gm'

const CHICAGO_TEAMS = [
  { key: 'bears' as ChicagoTeam, ...TEAMS.bears },
  { key: 'bulls' as ChicagoTeam, ...TEAMS.bulls },
  { key: 'blackhawks' as ChicagoTeam, ...TEAMS.blackhawks },
  { key: 'cubs' as ChicagoTeam, ...TEAMS.cubs },
  { key: 'whitesox' as ChicagoTeam, ...TEAMS.whitesox },
]

export default function GMTradeHub() {
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const { user, isLoading: authLoading } = useAuth()
  const { state, dispatch } = useGM()

  // Sheet refs
  const rosterSheetRef = useRef<BottomSheet>(null)
  const opponentSheetRef = useRef<BottomSheet>(null)
  const draftPicksSheetRef = useRef<BottomSheet>(null)

  // Local state
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState<OpponentTeam[]>([])
  const [teamsLoading, setTeamsLoading] = useState(false)

  // Derived state
  const teamConfig = state.chicagoTeam ? TEAMS[state.chicagoTeam] : null
  const selectedPlayerIds = useMemo(
    () => new Set(state.selectedPlayers.map((p) => p.player_id)),
    [state.selectedPlayers]
  )
  const selectedOpponentPlayerIds = useMemo(
    () => new Set(state.selectedOpponentPlayers.map((p) => p.player_id)),
    [state.selectedOpponentPlayers]
  )

  // Can grade if we have assets on both sides
  const canGrade = useMemo(() => {
    const hasSentAssets = state.selectedPlayers.length > 0 || state.draftPicksSent.length > 0
    const hasReceivedAssets =
      state.selectedOpponentPlayers.length > 0 || state.draftPicksReceived.length > 0
    return hasSentAssets && hasReceivedAssets && state.opponent !== null
  }, [
    state.selectedPlayers,
    state.selectedOpponentPlayers,
    state.draftPicksSent,
    state.draftPicksReceived,
    state.opponent,
  ])

  // Load opponent teams when sport changes
  useEffect(() => {
    if (state.sport && user) {
      loadTeams()
    }
  }, [state.sport, user])

  const loadTeams = async () => {
    if (!state.sport || !state.chicagoTeam) return
    setTeamsLoading(true)
    try {
      const res = await gmApi.getTeams(state.sport, undefined, state.chicagoTeam)
      setTeams(res.teams)
    } catch (err) {
      console.error('Failed to load teams:', err)
    } finally {
      setTeamsLoading(false)
    }
  }

  // Handle team selection
  const handleSelectTeam = async (teamKey: ChicagoTeam) => {
    if (!user) {
      setShowAuthPrompt(true)
      return
    }

    triggerHaptic('selection')
    dispatch({ type: 'SET_TEAM', team: teamKey })
    setLoading(true)

    try {
      const [rosterRes] = await Promise.all([
        gmApi.getRoster(teamKey),
        gmApi
          .createSession(teamKey)
          .then((res) => {
            dispatch({ type: 'SET_SESSION_ID', id: res.session.id })
          })
          .catch(() => {}),
      ])
      dispatch({ type: 'SET_ROSTER', players: rosterRes.players })
    } catch (err: any) {
      console.error('Failed to load roster:', err)
      if (err instanceof AuthRequiredError) {
        setShowAuthPrompt(true)
      } else {
        Alert.alert('Error', err.message || 'Failed to load roster. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle opponent selection
  const handleSelectOpponent = async (opponent: OpponentTeam) => {
    dispatch({ type: 'SET_OPPONENT', opponent })
    dispatch({ type: 'SET_OPPONENT_ROSTER_LOADING', loading: true })

    try {
      const res = await gmApi.getRoster(opponent.team_key, opponent.sport)
      dispatch({ type: 'SET_OPPONENT_ROSTER', players: res.players })
    } catch (err) {
      console.error('Failed to load opponent roster:', err)
      dispatch({ type: 'SET_OPPONENT_ROSTER', players: [] })
    }
  }

  // Handle player toggle
  const handleTogglePlayer = useCallback(
    (player: PlayerData) => {
      triggerHaptic('selection')
      dispatch({ type: 'TOGGLE_PLAYER', player })
    },
    [dispatch]
  )

  const handleToggleOpponentPlayer = useCallback(
    (player: PlayerData) => {
      triggerHaptic('selection')
      dispatch({ type: 'TOGGLE_OPPONENT_PLAYER', player })
    },
    [dispatch]
  )

  // Handle dock interactions
  const handleTapChicagoSide = useCallback(() => {
    if (!state.chicagoTeam) return
    dispatch({ type: 'SET_ACTIVE_SHEET', sheet: 'roster' })
    rosterSheetRef.current?.snapToIndex(1)
  }, [state.chicagoTeam, dispatch])

  const handleTapOpponentSide = useCallback(() => {
    if (!state.chicagoTeam) return
    dispatch({ type: 'SET_ACTIVE_SHEET', sheet: 'opponent' })
    opponentSheetRef.current?.snapToIndex(1)
  }, [state.chicagoTeam, dispatch])

  const handleOpenDraftPicks = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_SHEET', sheet: 'picks' })
    draftPicksSheetRef.current?.snapToIndex(0)
  }, [dispatch])

  const handleCloseSheet = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_SHEET', sheet: 'none' })
  }, [dispatch])

  // Handle grade
  const handleGrade = async () => {
    if (!canGrade || state.grading || !state.chicagoTeam || !state.opponent) return

    triggerHaptic('impact_medium')
    dispatch({ type: 'SET_GRADING', grading: true })

    try {
      const result = await gmApi.gradeTrade({
        chicago_team: state.chicagoTeam,
        trade_partner: state.opponent.team_name,
        partner_team_key: state.opponent.team_key,
        players_sent: state.selectedPlayers,
        players_received: state.selectedOpponentPlayers,
        draft_picks_sent: state.draftPicksSent,
        draft_picks_received: state.draftPicksReceived,
        session_id: state.sessionId || undefined,
      })

      dispatch({ type: 'SET_GRADE_RESULT', result })
      triggerHaptic('success')
      router.push('/gm/result')
    } catch (err: any) {
      console.error('Failed to grade trade:', err)
      triggerHaptic('error')
      Alert.alert('Error', err.message || 'Failed to grade trade. Please try again.')
      dispatch({ type: 'SET_GRADING', grading: false })
    }
  }

  // Handle remove assets
  const handleRemovePlayer = useCallback(
    (playerId: string) => {
      dispatch({ type: 'REMOVE_PLAYER', playerId })
    },
    [dispatch]
  )

  const handleRemoveOpponentPlayer = useCallback(
    (playerId: string) => {
      dispatch({ type: 'REMOVE_OPPONENT_PLAYER', playerId })
    },
    [dispatch]
  )

  const handleRemoveDraftPickSent = useCallback(
    (index: number) => {
      dispatch({ type: 'REMOVE_DRAFT_PICK_SENT', index })
    },
    [dispatch]
  )

  const handleRemoveDraftPickReceived = useCallback(
    (index: number) => {
      dispatch({ type: 'REMOVE_DRAFT_PICK_RECEIVED', index })
    },
    [dispatch]
  )

  // Auth handlers
  const handleSignIn = () => {
    setShowAuthPrompt(false)
    router.push('/auth')
  }

  // Reset trade
  const handleNewTrade = () => {
    dispatch({ type: 'RESET' })
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>GM Trade Simulator</Text>
            {state.chicagoTeam && (
              <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
                {teamConfig?.name}
              </Text>
            )}
          </View>
          <View style={styles.headerRight}>
            {state.chicagoTeam && (
              <TouchableOpacity onPress={handleNewTrade} style={styles.iconBtn}>
                <Ionicons name="refresh" size={20} color={colors.text} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => router.push('/gm/history')} style={styles.iconBtn}>
              <Ionicons name="time-outline" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/gm/leaderboard')} style={styles.iconBtn}>
              <Ionicons name="trophy-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading Overlay */}
        {(loading || authLoading) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              {authLoading ? 'Checking authentication...' : 'Loading roster...'}
            </Text>
          </View>
        )}

        {/* Main Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 180 }]}
        >
          {/* Team Selection (if no team selected) */}
          {!state.chicagoTeam ? (
            <>
              <View style={styles.stepRow}>
                <View style={[styles.stepBadge, { backgroundColor: COLORS.primary }]}>
                  <Text style={styles.stepBadgeText}>1</Text>
                </View>
                <Text style={[styles.stepLabel, { color: colors.text }]}>
                  Select Your Chicago Team
                </Text>
              </View>

              {CHICAGO_TEAMS.map((team) => (
                <TouchableOpacity
                  key={team.key}
                  style={[styles.teamCard, { backgroundColor: colors.surface }]}
                  activeOpacity={0.85}
                  onPress={() => handleSelectTeam(team.key)}
                  disabled={loading || authLoading}
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
            </>
          ) : (
            /* Trade Building UI */
            <>
              {/* Instructions */}
              <View style={[styles.instructionCard, { backgroundColor: colors.surface }]}>
                <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                <Text style={[styles.instructionText, { color: colors.textMuted }]}>
                  Tap the team panels below to add players and draft picks. Swipe up the dock to see full trade details.
                </Text>
              </View>

              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.statValue, { color: COLORS.primary }]}>
                    {state.selectedPlayers.length + state.draftPicksSent.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Sending</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.statValue, { color: COLORS.primary }]}>
                    {state.selectedOpponentPlayers.length + state.draftPicksReceived.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Receiving</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                  <Text
                    style={[
                      styles.statValue,
                      { color: canGrade ? COLORS.success : colors.textMuted },
                    ]}
                  >
                    {canGrade ? 'Ready' : 'Pending'}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Status</Text>
                </View>
              </View>

              {/* Tips */}
              <View style={[styles.tipCard, { backgroundColor: isDark ? '#1f2937' : '#f0f9ff' }]}>
                <Text style={[styles.tipTitle, { color: colors.text }]}>Pro Tips</Text>
                <View style={styles.tipList}>
                  <View style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={[styles.tipText, { color: colors.textMuted }]}>
                      Add at least one asset from each team
                    </Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="bulb" size={16} color={COLORS.warning} />
                    <Text style={[styles.tipText, { color: colors.textMuted }]}>
                      Draft picks can balance value differences
                    </Text>
                  </View>
                  <View style={styles.tipItem}>
                    <Ionicons name="flash" size={16} color={COLORS.primary} />
                    <Text style={[styles.tipText, { color: colors.textMuted }]}>
                      Grade 75+ means the trade would be accepted
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Trade Dock (only show when team selected) */}
        {state.chicagoTeam && (
          <TradeDock
            chicagoTeam={state.chicagoTeam}
            opponent={state.opponent}
            sentAssets={{
              players: state.selectedPlayers,
              picks: state.draftPicksSent,
            }}
            receivedAssets={{
              players: state.selectedOpponentPlayers,
              picks: state.draftPicksReceived,
            }}
            expanded={state.dockExpanded}
            onExpandToggle={() =>
              dispatch({ type: 'SET_DOCK_EXPANDED', expanded: !state.dockExpanded })
            }
            onTapChicagoSide={handleTapChicagoSide}
            onTapOpponentSide={handleTapOpponentSide}
            onGrade={handleGrade}
            onRemovePlayer={handleRemovePlayer}
            onRemoveOpponentPlayer={handleRemoveOpponentPlayer}
            onRemoveDraftPickSent={handleRemoveDraftPickSent}
            onRemoveDraftPickReceived={handleRemoveDraftPickReceived}
            canGrade={canGrade}
            isGrading={state.grading}
          />
        )}

        {/* Bottom Sheets */}
        {state.chicagoTeam && teamConfig && (
          <>
            <RosterBottomSheet
              ref={rosterSheetRef}
              visible={state.activeSheet === 'roster'}
              onClose={handleCloseSheet}
              team={{
                name: teamConfig.name,
                color: teamConfig.color,
                logo: teamConfig.logo,
              }}
              players={state.roster}
              selectedPlayerIds={selectedPlayerIds}
              onTogglePlayer={handleTogglePlayer}
              loading={state.rosterLoading}
              sport={state.sport!}
              title={`${teamConfig.shortName} - Select Players`}
              showDraftPicksButton
              onOpenDraftPicks={handleOpenDraftPicks}
            />

            <OpponentSelectorSheet
              ref={opponentSheetRef}
              visible={state.activeSheet === 'opponent'}
              onClose={handleCloseSheet}
              sport={state.sport!}
              teams={teams}
              teamsLoading={teamsLoading}
              selectedOpponent={state.opponent}
              onSelectOpponent={handleSelectOpponent}
              opponentRoster={state.opponentRoster}
              rosterLoading={state.opponentRosterLoading}
              selectedPlayerIds={selectedOpponentPlayerIds}
              onTogglePlayer={handleToggleOpponentPlayer}
              showDraftPicksButton
              onOpenDraftPicks={handleOpenDraftPicks}
            />

            <DraftPicksSheet
              ref={draftPicksSheetRef}
              visible={state.activeSheet === 'picks'}
              onClose={handleCloseSheet}
              sport={state.sport!}
              picksSent={state.draftPicksSent}
              picksReceived={state.draftPicksReceived}
              onAddPickSent={(pick) => dispatch({ type: 'ADD_DRAFT_PICK_SENT', pick })}
              onRemovePickSent={(index) => dispatch({ type: 'REMOVE_DRAFT_PICK_SENT', index })}
              onAddPickReceived={(pick) => dispatch({ type: 'ADD_DRAFT_PICK_RECEIVED', pick })}
              onRemovePickReceived={(index) =>
                dispatch({ type: 'REMOVE_DRAFT_PICK_RECEIVED', index })
              }
            />
          </>
        )}

        {/* Auth Required Modal */}
        <Modal
          visible={showAuthPrompt}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAuthPrompt(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <View style={styles.modalIcon}>
                <Ionicons name="lock-closed" size={40} color={COLORS.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Sign In Required</Text>
              <Text style={[styles.modalMessage, { color: colors.textMuted }]}>
                Please sign in to use the GM Trade Simulator. Your trades will be saved and you can
                compete on the leaderboard!
              </Text>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.primary }]}
                onPress={handleSignIn}
              >
                <Text style={styles.modalBtnText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowAuthPrompt(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
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
  backBtn: {
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  stepLabel: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  teamCard: {
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  teamColorBar: {
    height: 3,
    width: '100%',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  teamLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInfo: {
    flex: 1,
    marginLeft: 14,
  },
  teamName: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  teamSport: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 18,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipCard: {
    padding: 16,
    borderRadius: 12,
  },
  tipTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 12,
  },
  tipList: {
    gap: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(188,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalBtnText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#fff',
  },
  modalCancel: {
    marginTop: 8,
    padding: 8,
  },
  modalCancelText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
  },
})
