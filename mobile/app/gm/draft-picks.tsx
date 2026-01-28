import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { COLORS, TEAMS } from '@/lib/config'
import { useGM } from '@/lib/gm-context'
import type { DraftPick } from '@/lib/gm-types'

const YEARS = [2025, 2026, 2027, 2028, 2029]
const ROUNDS = [1, 2, 3, 4, 5, 6, 7]

function DraftPickSelector({
  label,
  picks,
  onAdd,
  onRemove,
  colors,
}: {
  label: string
  picks: DraftPick[]
  onAdd: (pick: DraftPick) => void
  onRemove: (index: number) => void
  colors: any
}) {
  const [year, setYear] = useState(2026)
  const [round, setRound] = useState(1)

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.text }]}>{label}</Text>

      {/* Current picks */}
      {picks.map((pick, i) => (
        <View key={i} style={[styles.pickRow, { backgroundColor: colors.surface }]}>
          <Text style={[styles.pickText, { color: colors.text }]}>
            {pick.year} Round {pick.round}
          </Text>
          <TouchableOpacity onPress={() => onRemove(i)}>
            <Ionicons name="close-circle" size={22} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      ))}

      {/* Add picker */}
      <View style={[styles.pickerRow, { backgroundColor: colors.surface }]}>
        <View style={styles.pickerGroup}>
          <Text style={[styles.pickerLabel, { color: colors.textMuted }]}>Year</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {YEARS.map(y => (
              <TouchableOpacity
                key={y}
                style={[styles.chip, y === year && { backgroundColor: COLORS.primary }]}
                onPress={() => setYear(y)}
              >
                <Text style={[styles.chipText, y === year && { color: '#fff' }, { color: y === year ? '#fff' : colors.text }]}>
                  {y}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={[styles.pickerGroup, { marginTop: 8 }]}>
          <Text style={[styles.pickerLabel, { color: colors.textMuted }]}>Round</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ROUNDS.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.chip, r === round && { backgroundColor: COLORS.primary }]}
                onPress={() => setRound(r)}
              >
                <Text style={[styles.chipText, { color: r === round ? '#fff' : colors.text }]}>
                  R{r}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => onAdd({ year, round })}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add Pick</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function GMDraftPicksScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { state, dispatch } = useGM()

  const teamConfig = state.chicagoTeam ? TEAMS[state.chicagoTeam] : null

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.stepRow}>
            <View style={[styles.stepBadge, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.stepBadgeText}>5</Text>
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Draft Picks (Optional)</Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Add draft picks to sweeten the deal
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <DraftPickSelector
          label={`${teamConfig?.shortName || 'Your'} Picks Sent`}
          picks={state.draftPicksSent}
          onAdd={(pick) => dispatch({ type: 'ADD_DRAFT_PICK_SENT', pick })}
          onRemove={(index) => dispatch({ type: 'REMOVE_DRAFT_PICK_SENT', index })}
          colors={colors}
        />

        <DraftPickSelector
          label={`${state.opponent?.team_name || 'Opponent'} Picks Received`}
          picks={state.draftPicksReceived}
          onAdd={(pick) => dispatch({ type: 'ADD_DRAFT_PICK_RECEIVED', pick })}
          onRemove={(index) => dispatch({ type: 'REMOVE_DRAFT_PICK_RECEIVED', index })}
          colors={colors}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => router.push('/gm/review')}
        >
          <Text style={styles.continueBtnText}>Review Trade</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.push('/gm/review')}
        >
          <Text style={[styles.skipBtnText, { color: colors.textMuted }]}>Skip Draft Picks</Text>
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
  headerSubtitle: { fontSize: 12, fontFamily: 'Montserrat-Regular', marginTop: 2, marginLeft: 32 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 15, fontFamily: 'Montserrat-Bold', marginBottom: 10 },
  pickRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, borderRadius: 10, marginBottom: 6,
  },
  pickText: { fontSize: 14, fontFamily: 'Montserrat-Medium' },
  pickerRow: { padding: 14, borderRadius: 12 },
  pickerGroup: { marginBottom: 4 },
  pickerLabel: { fontSize: 11, fontFamily: 'Montserrat-Medium', marginBottom: 6 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginRight: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  chipText: { fontSize: 13, fontFamily: 'Montserrat-Medium' },
  addBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 10, marginTop: 10, gap: 6,
  },
  addBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Montserrat-Bold' },
  footer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  continueBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 14, borderRadius: 12, gap: 8,
  },
  continueBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Montserrat-Bold' },
  skipBtn: { alignItems: 'center', marginTop: 10 },
  skipBtnText: { fontSize: 14, fontFamily: 'Montserrat-Medium' },
})
