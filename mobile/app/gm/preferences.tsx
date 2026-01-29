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
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Slider from '@react-native-community/slider'

import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { COLORS } from '@/lib/config'
import { gmApi, AuthRequiredError } from '@/lib/gm-api'
import { useGM } from '@/lib/gm-context'
import type { UserPreferences } from '@/lib/gm-types'

const RISK_OPTIONS = [
  { value: 'conservative', label: 'Conservative', desc: 'Prefer safe, proven trades' },
  { value: 'moderate', label: 'Moderate', desc: 'Balanced risk/reward approach' },
  { value: 'aggressive', label: 'Aggressive', desc: 'High upside, accept more risk' },
]

const PHASE_OPTIONS = [
  { value: 'rebuilding', label: 'Rebuilding', desc: 'Focus on young talent and picks' },
  { value: 'competing', label: 'Competing', desc: 'Mix of now and future' },
  { value: 'contending', label: 'Contending', desc: 'Win now at all costs' },
]

const STYLE_OPTIONS = [
  { value: 'balanced', label: 'Balanced', desc: 'Equal weight to all factors' },
  { value: 'win_now', label: 'Win Now', desc: 'Prioritize immediate impact' },
  { value: 'future_focused', label: 'Future Focused', desc: 'Prioritize long-term value' },
]

export default function GMPreferencesScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { isAuthenticated } = useAuth()
  const { dispatch } = useGM()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    risk_tolerance: 'moderate',
    team_phase: 'competing',
    trade_style: 'balanced',
    favorite_positions: [],
    avoid_positions: [],
    max_age_preference: null,
    min_contract_years: null,
  })

  useEffect(() => {
    async function loadPreferences() {
      if (!isAuthenticated) {
        router.push('/auth')
        return
      }
      try {
        setLoading(true)
        const data = await gmApi.getPreferences()
        if (data.preferences) {
          setPreferences(data.preferences)
          dispatch({ type: 'SET_PREFERENCES', preferences: data.preferences })
        }
      } catch (err: any) {
        if (err instanceof AuthRequiredError) {
          router.push('/auth')
        }
        // Use defaults if no preferences exist
      } finally {
        setLoading(false)
      }
    }
    loadPreferences()
  }, [isAuthenticated])

  const handleSave = async () => {
    try {
      setSaving(true)
      const data = await gmApi.updatePreferences(preferences)
      dispatch({ type: 'SET_PREFERENCES', preferences: data.preferences })
      Alert.alert('Success', 'Preferences saved successfully')
      router.back()
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const RadioGroup = ({
    options,
    value,
    onChange,
    title,
  }: {
    options: { value: string; label: string; desc: string }[]
    value: string
    onChange: (v: string) => void
    title: string
  }) => (
    <View style={styles.radioGroup}>
      <Text style={[styles.radioTitle, { color: colors.text }]}>{title}</Text>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.radioOption,
            { backgroundColor: colors.surface, borderColor: value === opt.value ? COLORS.primary : colors.border },
          ]}
          onPress={() => onChange(opt.value)}
        >
          <View style={styles.radioRow}>
            <View style={[styles.radioCircle, { borderColor: value === opt.value ? COLORS.primary : colors.border }]}>
              {value === opt.value && <View style={[styles.radioFill, { backgroundColor: COLORS.primary }]} />}
            </View>
            <View style={styles.radioText}>
              <Text style={[styles.radioLabel, { color: colors.text }]}>{opt.label}</Text>
              <Text style={[styles.radioDesc, { color: colors.textMuted }]}>{opt.desc}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>GM Preferences</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Customize your trading style
          </Text>
        </View>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={[styles.saveBtnText, { color: COLORS.primary }]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <RadioGroup
            title="Risk Tolerance"
            options={RISK_OPTIONS}
            value={preferences.risk_tolerance}
            onChange={(v) => setPreferences({ ...preferences, risk_tolerance: v as any })}
          />

          <RadioGroup
            title="Team Phase"
            options={PHASE_OPTIONS}
            value={preferences.team_phase}
            onChange={(v) => setPreferences({ ...preferences, team_phase: v as any })}
          />

          <RadioGroup
            title="Trade Style"
            options={STYLE_OPTIONS}
            value={preferences.trade_style}
            onChange={(v) => setPreferences({ ...preferences, trade_style: v as any })}
          />

          {/* Max Age Slider */}
          <View style={styles.sliderSection}>
            <Text style={[styles.radioTitle, { color: colors.text }]}>Max Player Age</Text>
            <View style={[styles.sliderCard, { backgroundColor: colors.surface }]}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.sliderLabel, { color: colors.textMuted }]}>
                  {preferences.max_age_preference ? `${preferences.max_age_preference} years` : 'No preference'}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={20}
                maximumValue={40}
                step={1}
                value={preferences.max_age_preference || 35}
                onValueChange={(v: number) => setPreferences({ ...preferences, max_age_preference: Math.round(v) })}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={COLORS.primary}
              />
              <TouchableOpacity
                onPress={() => setPreferences({ ...preferences, max_age_preference: null })}
                style={styles.clearBtn}
              >
                <Text style={[styles.clearBtnText, { color: colors.textMuted }]}>Clear preference</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Min Contract Years Slider */}
          <View style={styles.sliderSection}>
            <Text style={[styles.radioTitle, { color: colors.text }]}>Min Contract Years</Text>
            <View style={[styles.sliderCard, { backgroundColor: colors.surface }]}>
              <View style={styles.sliderHeader}>
                <Text style={[styles.sliderLabel, { color: colors.textMuted }]}>
                  {preferences.min_contract_years ? `${preferences.min_contract_years} years` : 'No preference'}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={6}
                step={1}
                value={preferences.min_contract_years || 2}
                onValueChange={(v: number) => setPreferences({ ...preferences, min_contract_years: Math.round(v) })}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={COLORS.primary}
              />
              <TouchableOpacity
                onPress={() => setPreferences({ ...preferences, min_contract_years: null })}
                style={styles.clearBtn}
              >
                <Text style={[styles.clearBtnText, { color: colors.textMuted }]}>Clear preference</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
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
  headerTitle: { fontSize: 18, fontFamily: 'Montserrat-Bold' },
  headerSubtitle: { fontSize: 12, fontFamily: 'Montserrat-Regular', marginTop: 2 },
  saveBtn: { paddingHorizontal: 8 },
  saveBtnText: { fontSize: 16, fontFamily: 'Montserrat-Bold' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16 },
  radioGroup: { marginBottom: 24 },
  radioTitle: { fontSize: 16, fontFamily: 'Montserrat-Bold', marginBottom: 12 },
  radioOption: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 14,
    marginBottom: 10,
  },
  radioRow: { flexDirection: 'row', alignItems: 'center' },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioFill: { width: 12, height: 12, borderRadius: 6 },
  radioText: { flex: 1, marginLeft: 12 },
  radioLabel: { fontSize: 15, fontFamily: 'Montserrat-SemiBold' },
  radioDesc: { fontSize: 12, fontFamily: 'Montserrat-Regular', marginTop: 2 },
  sliderSection: { marginBottom: 24 },
  sliderCard: { borderRadius: 12, padding: 16 },
  sliderHeader: { marginBottom: 8 },
  sliderLabel: { fontSize: 14, fontFamily: 'Montserrat-Medium' },
  slider: { width: '100%', height: 40 },
  clearBtn: { marginTop: 8, alignSelf: 'flex-end' },
  clearBtnText: { fontSize: 12, fontFamily: 'Montserrat-Medium' },
})
