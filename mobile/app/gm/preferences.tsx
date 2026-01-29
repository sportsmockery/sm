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
  { value: 'contending', label: 'Contending', desc: 'Competitive with room to grow' },
  { value: 'win_now', label: 'Win Now', desc: 'All-in for a championship' },
  { value: 'auto', label: 'Auto', desc: 'Let AI determine based on roster' },
]

const STYLE_OPTIONS = [
  { value: 'balanced', label: 'Balanced', desc: 'Equal weight to all factors' },
  { value: 'star_hunting', label: 'Star Hunting', desc: 'Target elite talent' },
  { value: 'depth_building', label: 'Depth Building', desc: 'Build a deep roster' },
  { value: 'draft_focused', label: 'Draft Focused', desc: 'Prioritize draft capital' },
]

const CAP_OPTIONS = [
  { value: 'low', label: 'Low', desc: 'Less concerned about cap space' },
  { value: 'medium', label: 'Medium', desc: 'Balance value and cap impact' },
  { value: 'high', label: 'High', desc: 'Prioritize cap flexibility' },
]

const AGE_OPTIONS = [
  { value: 'young', label: 'Young', desc: 'Prefer players under 26' },
  { value: 'prime', label: 'Prime', desc: 'Prefer players 26-30' },
  { value: 'veteran', label: 'Veteran', desc: 'Open to experienced players' },
  { value: 'any', label: 'Any', desc: 'No age preference' },
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
    favorite_team: null,
    team_phase: 'auto',
    preferred_trade_style: 'balanced',
    cap_flexibility_priority: 'medium',
    age_preference: 'any',
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
            value={preferences.preferred_trade_style}
            onChange={(v) => setPreferences({ ...preferences, preferred_trade_style: v as any })}
          />

          <RadioGroup
            title="Cap Flexibility Priority"
            options={CAP_OPTIONS}
            value={preferences.cap_flexibility_priority}
            onChange={(v) => setPreferences({ ...preferences, cap_flexibility_priority: v as any })}
          />

          <RadioGroup
            title="Age Preference"
            options={AGE_OPTIONS}
            value={preferences.age_preference}
            onChange={(v) => setPreferences({ ...preferences, age_preference: v as any })}
          />

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
})
