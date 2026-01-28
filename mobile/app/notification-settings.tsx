import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { setUserTags } from '@/lib/pushNotifications'
import { COLORS, TEAMS } from '@/lib/config'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface NotificationPreferences {
  notifications_enabled: boolean
  frequency_mode: 'all' | 'important' | 'minimal' | 'off'
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  only_favorite_teams: boolean
  favorite_teams: string[]
  alert_game_start: boolean
  alert_game_end: boolean
  alert_score_change: boolean
  alert_close_game: boolean
  alert_overtime: boolean
  alert_injuries: boolean
  alert_trades: boolean
  alert_roster_moves: boolean
  alert_breaking_news: boolean
  alert_playoffs: boolean
  alert_draft: boolean
  alert_preseason: boolean
  max_alerts_per_game: number
  min_alert_gap_seconds: number
  batch_alerts: boolean
  spoiler_delay_seconds: number
  sound_enabled: boolean
  vibration_enabled: boolean
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  notifications_enabled: true,
  frequency_mode: 'important',
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
  only_favorite_teams: true,
  favorite_teams: ['bears', 'bulls', 'cubs'],
  alert_game_start: true,
  alert_game_end: true,
  alert_score_change: true,
  alert_close_game: true,
  alert_overtime: true,
  alert_injuries: true,
  alert_trades: true,
  alert_roster_moves: true,
  alert_breaking_news: true,
  alert_playoffs: true,
  alert_draft: false,
  alert_preseason: false,
  max_alerts_per_game: 8,
  min_alert_gap_seconds: 60,
  batch_alerts: true,
  spoiler_delay_seconds: 0,
  sound_enabled: true,
  vibration_enabled: true,
}

const CHICAGO_TEAMS = [
  { id: 'bears', name: 'Bears', sport: 'NFL', color: TEAMS.bears.color },
  { id: 'bulls', name: 'Bulls', sport: 'NBA', color: TEAMS.bulls.color },
  { id: 'cubs', name: 'Cubs', sport: 'MLB', color: TEAMS.cubs.color },
  { id: 'whitesox', name: 'White Sox', sport: 'MLB', color: TEAMS.whitesox.color },
  { id: 'blackhawks', name: 'Blackhawks', sport: 'NHL', color: TEAMS.blackhawks.color },
]

const FREQUENCY_MODES = [
  { value: 'all' as const, label: 'All Updates', description: 'Every score change, every news item', estimate: '~15-20/game' },
  { value: 'important' as const, label: 'Important Only', description: 'Touchdowns, endings, breaking news', estimate: '~5-8/game' },
  { value: 'minimal' as const, label: 'Minimal', description: 'Game start/end, major news only', estimate: '~2-4/game' },
  { value: 'off' as const, label: 'Off', description: 'No push notifications', estimate: '0' },
]

const SPOILER_OPTIONS = [
  { value: 0, label: 'Off' },
  { value: 300, label: '5 min' },
  { value: 600, label: '10 min' },
  { value: 900, label: '15 min' },
  { value: 1800, label: '30 min' },
]

const QUIET_HOURS = [
  '20:00', '21:00', '22:00', '23:00', '00:00',
]

const WAKE_HOURS = [
  '05:00', '06:00', '07:00', '08:00', '09:00',
]

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function NotificationSettingsScreen() {
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [user?.id])

  async function loadPreferences() {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading notification preferences:', error)
      }

      if (data) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...data })
      }
    } catch (err) {
      console.error('Error loading preferences:', err)
    } finally {
      setLoading(false)
    }
  }

  async function savePreferences() {
    if (!user?.id) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      setHasChanges(false)

      // Sync OneSignal tags
      await setUserTags({
        notifications_enabled: preferences.notifications_enabled.toString(),
        frequency_mode: preferences.frequency_mode,
        follows_bears: preferences.favorite_teams.includes('bears').toString(),
        follows_bulls: preferences.favorite_teams.includes('bulls').toString(),
        follows_cubs: preferences.favorite_teams.includes('cubs').toString(),
        follows_whitesox: preferences.favorite_teams.includes('whitesox').toString(),
        follows_blackhawks: preferences.favorite_teams.includes('blackhawks').toString(),
        alert_scores: preferences.alert_score_change.toString(),
        alert_injuries: preferences.alert_injuries.toString(),
        alert_trades: preferences.alert_trades.toString(),
        alert_breaking: preferences.alert_breaking_news.toString(),
      })

      Alert.alert('Saved', 'Your notification preferences have been updated.')
    } catch (err) {
      console.error('Error saving preferences:', err)
      Alert.alert('Error', 'Failed to save preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function update<K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) {
    setPreferences(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const toggleTeam = useCallback((teamId: string) => {
    const newTeams = preferences.favorite_teams.includes(teamId)
      ? preferences.favorite_teams.filter(t => t !== teamId)
      : [...preferences.favorite_teams, teamId]
    update('favorite_teams', newTeams)
  }, [preferences.favorite_teams])

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.textMuted }}>Loading...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Master Toggle */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Push Notifications</Text>
              <Text style={[styles.caption, { color: colors.textMuted }]}>
                {preferences.notifications_enabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={preferences.notifications_enabled}
              onValueChange={(v) => update('notifications_enabled', v)}
              trackColor={{ false: colors.border, true: `${COLORS.success}80` }}
              thumbColor={preferences.notifications_enabled ? COLORS.success : '#f4f3f4'}
            />
          </View>
        </View>

        {preferences.notifications_enabled && (
          <>
            {/* Frequency Mode */}
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Alert Frequency</Text>
              {FREQUENCY_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode.value}
                  style={[
                    styles.modeOption,
                    {
                      backgroundColor: preferences.frequency_mode === mode.value
                        ? `${COLORS.primary}15`
                        : colors.background,
                      borderColor: preferences.frequency_mode === mode.value
                        ? COLORS.primary
                        : colors.border,
                    },
                  ]}
                  onPress={() => update('frequency_mode', mode.value)}
                >
                  <View style={styles.modeContent}>
                    <Text style={[styles.modeLabel, { color: colors.text }]}>{mode.label}</Text>
                    <Text style={[styles.modeDesc, { color: colors.textMuted }]}>{mode.description}</Text>
                  </View>
                  <Text style={[styles.modeEstimate, { color: colors.textMuted }]}>{mode.estimate}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Favorite Teams */}
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>My Teams</Text>
              <Text style={[styles.caption, { color: colors.textMuted }]}>
                Select which teams you want alerts for
              </Text>

              <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
                <View style={styles.toggleInfo}>
                  <Text style={[styles.toggleLabel, { color: colors.text }]}>All Chicago Teams</Text>
                  <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>
                    {preferences.only_favorite_teams ? 'Off — only selected teams below' : 'On — alerts for all Chicago teams'}
                  </Text>
                </View>
                <Switch
                  value={!preferences.only_favorite_teams}
                  onValueChange={(v) => update('only_favorite_teams', !v)}
                  trackColor={{ false: colors.border, true: `${COLORS.success}80` }}
                  thumbColor={!preferences.only_favorite_teams ? COLORS.success : '#f4f3f4'}
                />
              </View>

              <View style={styles.teamsGrid}>
                {CHICAGO_TEAMS.map((team) => {
                  const isSelected = preferences.favorite_teams.includes(team.id)
                  return (
                    <TouchableOpacity
                      key={team.id}
                      style={[
                        styles.teamChip,
                        {
                          backgroundColor: isSelected ? `${team.color}15` : colors.background,
                          borderColor: isSelected ? team.color : colors.border,
                        },
                      ]}
                      onPress={() => toggleTeam(team.id)}
                    >
                      <Text style={[styles.teamName, { color: colors.text }]}>{team.name}</Text>
                      <Text style={[styles.teamSport, { color: colors.textMuted }]}>{team.sport}</Text>
                      {isSelected && (
                        <View style={[styles.checkCircle, { backgroundColor: team.color }]}>
                          <Ionicons name="checkmark" size={12} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            {/* Game Alerts */}
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Game Alerts</Text>
              <ToggleRow label="Game Starting" desc="When your team's game begins" value={preferences.alert_game_start} onToggle={(v) => update('alert_game_start', v)} colors={colors} />
              <ToggleRow label="Final Scores" desc="When games end" value={preferences.alert_game_end} onToggle={(v) => update('alert_game_end', v)} colors={colors} />
              <ToggleRow label="Score Changes" desc="Touchdowns, goals, runs scored" value={preferences.alert_score_change} onToggle={(v) => update('alert_score_change', v)} colors={colors} />
              <ToggleRow label="Close Games" desc="Tight games in final minutes" value={preferences.alert_close_game} onToggle={(v) => update('alert_close_game', v)} colors={colors} />
              <ToggleRow label="Overtime" desc="When games go to OT" value={preferences.alert_overtime} onToggle={(v) => update('alert_overtime', v)} colors={colors} isLast />
            </View>

            {/* News Alerts */}
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>News Alerts</Text>
              <ToggleRow label="Injuries" desc="Player injury updates" value={preferences.alert_injuries} onToggle={(v) => update('alert_injuries', v)} colors={colors} />
              <ToggleRow label="Trades & Signings" desc="Player acquisitions and trades" value={preferences.alert_trades} onToggle={(v) => update('alert_trades', v)} colors={colors} />
              <ToggleRow label="Roster Moves" desc="Callups, releases, assignments" value={preferences.alert_roster_moves} onToggle={(v) => update('alert_roster_moves', v)} colors={colors} />
              <ToggleRow label="Breaking News" desc="Major team announcements" value={preferences.alert_breaking_news} onToggle={(v) => update('alert_breaking_news', v)} colors={colors} isLast />
            </View>

            {/* Special Events */}
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Special Events</Text>
              <ToggleRow label="Playoff Updates" desc="Enhanced playoff coverage" value={preferences.alert_playoffs} onToggle={(v) => update('alert_playoffs', v)} colors={colors} />
              <ToggleRow label="Draft Alerts" desc="Draft picks and trades" value={preferences.alert_draft} onToggle={(v) => update('alert_draft', v)} colors={colors} />
              <ToggleRow label="Preseason Games" desc="Exhibition game updates" value={preferences.alert_preseason} onToggle={(v) => update('alert_preseason', v)} colors={colors} isLast />
            </View>

            {/* Anti-Spam */}
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Anti-Spam</Text>

              <View style={[styles.sliderRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>
                  Max alerts per game: {preferences.max_alerts_per_game}
                </Text>
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    style={[styles.stepperButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => update('max_alerts_per_game', Math.max(1, preferences.max_alerts_per_game - 1))}
                  >
                    <Ionicons name="remove" size={18} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={[styles.stepperValue, { color: colors.text }]}>{preferences.max_alerts_per_game}</Text>
                  <TouchableOpacity
                    style={[styles.stepperButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => update('max_alerts_per_game', Math.min(20, preferences.max_alerts_per_game + 1))}
                  >
                    <Ionicons name="add" size={18} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              <ToggleRow label="Batch Similar Alerts" desc="Combine rapid scores into one notification" value={preferences.batch_alerts} onToggle={(v) => update('batch_alerts', v)} colors={colors} isLast />
            </View>

            {/* Quiet Hours */}
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quiet Hours</Text>
              <ToggleRow label="Enable Quiet Hours" desc="No notifications during set times" value={preferences.quiet_hours_enabled} onToggle={(v) => update('quiet_hours_enabled', v)} colors={colors} isLast={!preferences.quiet_hours_enabled} />

              {preferences.quiet_hours_enabled && (
                <View style={styles.quietHoursRow}>
                  <View style={styles.quietHoursCol}>
                    <Text style={[styles.caption, { color: colors.textMuted }]}>Start</Text>
                    <View style={styles.timeOptions}>
                      {QUIET_HOURS.map(time => (
                        <TouchableOpacity
                          key={time}
                          style={[
                            styles.timeChip,
                            {
                              backgroundColor: preferences.quiet_hours_start === time ? `${COLORS.primary}15` : colors.background,
                              borderColor: preferences.quiet_hours_start === time ? COLORS.primary : colors.border,
                            },
                          ]}
                          onPress={() => update('quiet_hours_start', time)}
                        >
                          <Text style={[styles.timeChipText, { color: colors.text }]}>{formatTime(time)}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.quietHoursCol}>
                    <Text style={[styles.caption, { color: colors.textMuted }]}>End</Text>
                    <View style={styles.timeOptions}>
                      {WAKE_HOURS.map(time => (
                        <TouchableOpacity
                          key={time}
                          style={[
                            styles.timeChip,
                            {
                              backgroundColor: preferences.quiet_hours_end === time ? `${COLORS.primary}15` : colors.background,
                              borderColor: preferences.quiet_hours_end === time ? COLORS.primary : colors.border,
                            },
                          ]}
                          onPress={() => update('quiet_hours_end', time)}
                        >
                          <Text style={[styles.timeChipText, { color: colors.text }]}>{formatTime(time)}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Spoiler Protection */}
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Spoiler Protection</Text>
              <Text style={[styles.caption, { color: colors.textMuted, marginBottom: 12 }]}>
                Delay alerts if you're recording a game
              </Text>
              <View style={styles.spoilerOptions}>
                {SPOILER_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.spoilerChip,
                      {
                        backgroundColor: preferences.spoiler_delay_seconds === opt.value ? `${COLORS.primary}15` : colors.background,
                        borderColor: preferences.spoiler_delay_seconds === opt.value ? COLORS.primary : colors.border,
                      },
                    ]}
                    onPress={() => update('spoiler_delay_seconds', opt.value)}
                  >
                    <Text style={[styles.spoilerChipText, { color: colors.text }]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sound & Vibration */}
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Sound & Vibration</Text>
              <ToggleRow label="Sound" desc="Play sound for notifications" value={preferences.sound_enabled} onToggle={(v) => update('sound_enabled', v)} colors={colors} />
              <ToggleRow label="Vibration" desc="Vibrate for notifications" value={preferences.vibration_enabled} onToggle={(v) => update('vibration_enabled', v)} colors={colors} isLast />
            </View>
          </>
        )}

        {/* Save Button */}
        {hasChanges && (
          <TouchableOpacity
            onPress={savePreferences}
            disabled={saving}
            style={[styles.saveButton, { backgroundColor: saving ? colors.border : COLORS.primary }]}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

// ═══════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════

function ToggleRow({ label, desc, value, onToggle, colors, isLast }: {
  label: string
  desc: string
  value: boolean
  onToggle: (v: boolean) => void
  colors: any
  isLast?: boolean
}) {
  return (
    <View style={[styles.toggleRow, !isLast && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
      <View style={styles.toggleInfo}>
        <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: `${COLORS.success}80` }}
        thumbColor={value ? COLORS.success : '#f4f3f4'}
      />
    </View>
  )
}

function formatTime(time: string): string {
  const [hours] = time.split(':')
  const h = parseInt(hours)
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Montserrat-Bold' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  section: { borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontFamily: 'Montserrat-Bold', marginBottom: 4 },
  caption: { fontSize: 13, fontFamily: 'Montserrat-Regular', marginBottom: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  modeContent: { flex: 1 },
  modeLabel: { fontSize: 15, fontFamily: 'Montserrat-SemiBold' },
  modeDesc: { fontSize: 12, fontFamily: 'Montserrat-Regular', marginTop: 2 },
  modeEstimate: { fontSize: 11, fontFamily: 'Montserrat-Regular', marginLeft: 8 },
  teamsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  teamChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  teamName: { fontSize: 13, fontFamily: 'Montserrat-Medium' },
  teamSport: { fontSize: 11, fontFamily: 'Montserrat-Regular' },
  checkCircle: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  toggleInfo: { flex: 1, marginRight: 12 },
  toggleLabel: { fontSize: 15, fontFamily: 'Montserrat-Medium' },
  toggleDesc: { fontSize: 12, fontFamily: 'Montserrat-Regular', marginTop: 2 },
  sliderRow: { paddingVertical: 12, borderBottomWidth: 1 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  stepperButton: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  stepperValue: { fontSize: 18, fontFamily: 'Montserrat-Bold', minWidth: 24, textAlign: 'center' },
  quietHoursRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  quietHoursCol: { flex: 1 },
  timeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  timeChip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1 },
  timeChipText: { fontSize: 12, fontFamily: 'Montserrat-Medium' },
  spoilerOptions: { flexDirection: 'row', gap: 8 },
  spoilerChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1 },
  spoilerChipText: { fontSize: 13, fontFamily: 'Montserrat-Medium' },
  saveButton: { padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Montserrat-Bold' },
})
