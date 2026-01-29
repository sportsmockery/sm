import { useState, useEffect } from 'react'
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
import { COLORS, TEAMS } from '@/lib/config'
import { useGM } from '@/lib/gm-context'
import { gmApi } from '@/lib/gm-api'
import type { ValidationResult } from '@/lib/gm-types'

export default function GMReviewScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { state, dispatch } = useGM()
  const [grading, setGrading] = useState(false)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [validating, setValidating] = useState(false)

  const teamConfig = state.chicagoTeam ? TEAMS[state.chicagoTeam] : null

  // Validate trade on mount
  useEffect(() => {
    async function validateTrade() {
      if (!state.chicagoTeam || !state.opponent) return
      setValidating(true)
      try {
        const result = await gmApi.validateTrade({
          chicago_team: state.chicagoTeam,
          trade_partner: state.opponent.team_name,
          partner_team_key: state.opponent.team_key,
          players_sent: state.selectedPlayers,
          players_received: state.selectedOpponentPlayers,
          draft_picks_sent: state.draftPicksSent.length > 0 ? state.draftPicksSent : undefined,
          draft_picks_received: state.draftPicksReceived.length > 0 ? state.draftPicksReceived : undefined,
        })
        setValidation(result)
        dispatch({ type: 'SET_VALIDATION', validation: result })
      } catch (err) {
        // Silently fail validation - don't block grading
        setValidation(null)
      } finally {
        setValidating(false)
      }
    }
    validateTrade()
  }, [])

  const handleGrade = async () => {
    if (!state.chicagoTeam || !state.opponent) return
    setGrading(true)
    dispatch({ type: 'SET_GRADING', grading: true })
    try {
      const result = await gmApi.gradeTrade({
        chicago_team: state.chicagoTeam,
        trade_partner: state.opponent.team_name,
        partner_team_key: state.opponent.team_key,
        players_sent: state.selectedPlayers,
        players_received: state.selectedOpponentPlayers,
        draft_picks_sent: state.draftPicksSent.length > 0 ? state.draftPicksSent : undefined,
        draft_picks_received: state.draftPicksReceived.length > 0 ? state.draftPicksReceived : undefined,
        session_id: state.sessionId || undefined,
      })
      dispatch({ type: 'SET_GRADE_RESULT', result })
      router.replace('/gm/result')
    } catch (err: any) {
      dispatch({ type: 'SET_GRADING', grading: false })
      Alert.alert('Grading Failed', err.message || 'Please try again')
    } finally {
      setGrading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.stepRow}>
            <View style={[styles.stepBadge, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.stepBadgeText}>6</Text>
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Review Trade</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Trade Board */}
        <View style={[styles.tradeBoard, { backgroundColor: colors.surface }]}>
          {/* Sending */}
          <View style={styles.tradeSide}>
            <View style={[styles.sideHeader, { backgroundColor: teamConfig?.color || COLORS.primary }]}>
              <Text style={styles.sideHeaderText}>{teamConfig?.shortName || 'Your Team'} Send</Text>
            </View>
            {state.selectedPlayers.map((p) => (
              <View key={p.player_id} style={[styles.playerRow, { borderBottomColor: colors.border }]}>
                {p.headshot_url ? (
                  <Image source={{ uri: p.headshot_url }} style={styles.miniHead} contentFit="cover" />
                ) : (
                  <View style={[styles.miniHead, { backgroundColor: teamConfig?.color, justifyContent: 'center', alignItems: 'center', borderRadius: 16 }]}>
                    <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'Montserrat-Bold' }}>{p.full_name.charAt(0)}</Text>
                  </View>
                )}
                <View style={styles.playerInfo}>
                  <Text style={[styles.playerName, { color: colors.text }]}>{p.full_name}</Text>
                  <Text style={[styles.playerPos, { color: colors.textMuted }]}>{p.position}</Text>
                </View>
              </View>
            ))}
            {state.draftPicksSent.map((pick, i) => (
              <View key={`ds-${i}`} style={[styles.playerRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.miniHead, { backgroundColor: '#555', justifyContent: 'center', alignItems: 'center', borderRadius: 16 }]}>
                  <Ionicons name="document-text" size={14} color="#fff" />
                </View>
                <View style={styles.playerInfo}>
                  <Text style={[styles.playerName, { color: colors.text }]}>
                    {pick.year} Round {pick.round} Pick
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Arrow */}
          <View style={styles.arrowRow}>
            <Ionicons name="swap-horizontal" size={28} color={COLORS.primary} />
          </View>

          {/* Receiving */}
          <View style={styles.tradeSide}>
            <View style={[styles.sideHeader, { backgroundColor: state.opponent?.primary_color || '#555' }]}>
              <Text style={styles.sideHeaderText}>{state.opponent?.team_name || 'Opponent'} Send</Text>
            </View>
            {state.selectedOpponentPlayers.map((p) => (
              <View key={p.player_id} style={[styles.playerRow, { borderBottomColor: colors.border }]}>
                {p.headshot_url ? (
                  <Image source={{ uri: p.headshot_url }} style={styles.miniHead} contentFit="cover" />
                ) : (
                  <View style={[styles.miniHead, { backgroundColor: state.opponent?.primary_color || '#ccc', justifyContent: 'center', alignItems: 'center', borderRadius: 16 }]}>
                    <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'Montserrat-Bold' }}>{p.full_name.charAt(0)}</Text>
                  </View>
                )}
                <View style={styles.playerInfo}>
                  <Text style={[styles.playerName, { color: colors.text }]}>{p.full_name}</Text>
                  <Text style={[styles.playerPos, { color: colors.textMuted }]}>{p.position}</Text>
                </View>
              </View>
            ))}
            {state.draftPicksReceived.map((pick, i) => (
              <View key={`dr-${i}`} style={[styles.playerRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.miniHead, { backgroundColor: '#555', justifyContent: 'center', alignItems: 'center', borderRadius: 16 }]}>
                  <Ionicons name="document-text" size={14} color="#fff" />
                </View>
                <View style={styles.playerInfo}>
                  <Text style={[styles.playerName, { color: colors.text }]}>
                    {pick.year} Round {pick.round} Pick
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {/* Validation Indicator */}
        {validating ? (
          <View style={styles.validationBar}>
            <ActivityIndicator size="small" color={colors.textMuted} />
            <Text style={[styles.validationText, { color: colors.textMuted }]}>Validating trade...</Text>
          </View>
        ) : validation ? (
          <View style={[
            styles.validationBar,
            {
              backgroundColor:
                validation.status === 'green' ? '#22c55e15' :
                validation.status === 'yellow' ? '#eab30815' : '#ef444415',
            },
          ]}>
            <View style={[
              styles.validationDot,
              {
                backgroundColor:
                  validation.status === 'green' ? '#22c55e' :
                  validation.status === 'yellow' ? '#eab308' : '#ef4444',
              },
            ]} />
            <View style={styles.validationContent}>
              <Text style={[
                styles.validationStatus,
                {
                  color:
                    validation.status === 'green' ? '#22c55e' :
                    validation.status === 'yellow' ? '#eab308' : '#ef4444',
                },
              ]}>
                {validation.status === 'green' ? 'Ready to Grade' :
                 validation.status === 'yellow' ? 'Warnings' : 'Issues Found'}
              </Text>
              {validation.issues.length > 0 && (
                <Text style={[styles.validationIssue, { color: colors.textMuted }]} numberOfLines={1}>
                  {validation.issues[0].message}
                </Text>
              )}
            </View>
            {validation.issues.length > 1 && (
              <Text style={[styles.validationMore, { color: colors.textMuted }]}>
                +{validation.issues.length - 1} more
              </Text>
            )}
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.gradeBtn,
            (grading || (validation && !validation.can_proceed)) && { opacity: 0.6 },
          ]}
          onPress={handleGrade}
          disabled={grading || (validation ? !validation.can_proceed : false)}
        >
          {grading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="flash" size={20} color="#fff" />
              <Text style={styles.gradeBtnText}>Submit for AI Grading</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  backBtn: { marginRight: 12 },
  headerCenter: { flex: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepBadge: {
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  stepBadgeText: { color: '#fff', fontSize: 12, fontFamily: 'Montserrat-Bold' },
  headerTitle: { fontSize: 17, fontFamily: 'Montserrat-Bold' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  tradeBoard: { borderRadius: 16, overflow: 'hidden' },
  tradeSide: { },
  sideHeader: { paddingVertical: 10, paddingHorizontal: 14 },
  sideHeaderText: { color: '#fff', fontSize: 14, fontFamily: 'Montserrat-Bold' },
  playerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 0.5,
  },
  miniHead: { width: 32, height: 32, borderRadius: 16 },
  playerInfo: { flex: 1, marginLeft: 10 },
  playerName: { fontSize: 14, fontFamily: 'Montserrat-SemiBold' },
  playerPos: { fontSize: 11, fontFamily: 'Montserrat-Regular', marginTop: 1 },
  arrowRow: { alignItems: 'center', paddingVertical: 12 },
  footer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  validationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    gap: 10,
  },
  validationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  validationContent: { flex: 1 },
  validationStatus: { fontSize: 13, fontFamily: 'Montserrat-SemiBold' },
  validationIssue: { fontSize: 11, fontFamily: 'Montserrat-Regular', marginTop: 2 },
  validationMore: { fontSize: 11, fontFamily: 'Montserrat-Medium' },
  validationText: { fontSize: 13, fontFamily: 'Montserrat-Regular', marginLeft: 8 },
  gradeBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 16, borderRadius: 12, gap: 8,
  },
  gradeBtnText: { color: '#fff', fontSize: 17, fontFamily: 'Montserrat-Bold' },
})
