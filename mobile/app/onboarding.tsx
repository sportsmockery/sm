import { useState, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Switch,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { useTheme } from '@/hooks/useTheme'
import { useFeed } from '@/hooks/useFeed'
import { TEAMS, COLORS } from '@/lib/config'
import { Colors, FontSize, FontWeight, Spacing, Card, Interactive } from '@/lib/design-tokens'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const ONBOARDING_KEY = 'has_completed_onboarding'

interface OnboardingStep {
  id: string
  title: string
  subtitle: string
  icon: keyof typeof Ionicons.glyphMap
  color: string
}

const STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to SM EDGE',
    subtitle: 'Chicago sports intelligence, fan debate, AI insights, and real-time analytics — all in one place.',
    icon: 'star',
    color: Colors.primary,
  },
  {
    id: 'teams',
    title: 'Pick Your Teams',
    subtitle: 'Follow your favorite Chicago teams to personalize your feed.',
    icon: 'heart',
    color: Colors.edgeCyan,
  },
  {
    id: 'notifications',
    title: 'Stay in the Game',
    subtitle: 'Get breaking news, game alerts, and Scout AI insights.',
    icon: 'notifications',
    color: Colors.gold,
  },
]

export default function OnboardingScreen() {
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const { teamPreferences, updateTeamPreferences } = useFeed()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTeams, setSelectedTeams] = useState<string[]>(teamPreferences)
  const [notifPrefs, setNotifPrefs] = useState({
    breakingNews: true,
    gameAlerts: true,
    scoutInsights: true,
  })
  const flatListRef = useRef<FlatList>(null)

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      const next = currentStep + 1
      setCurrentStep(next)
      flatListRef.current?.scrollToIndex({ index: next, animated: true })
    } else {
      // Complete onboarding
      updateTeamPreferences(selectedTeams)
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
      router.replace('/(tabs)')
    }
  }

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
    router.replace('/(tabs)')
  }

  const toggleTeam = (teamId: string) => {
    setSelectedTeams(prev =>
      prev.includes(teamId) ? prev.filter(t => t !== teamId) : [...prev, teamId]
    )
  }

  const renderStep = ({ item, index }: { item: OnboardingStep; index: number }) => {
    if (item.id === 'welcome') {
      return (
        <View style={[styles.stepContainer, { width: SCREEN_WIDTH }]}>
          <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon} size={48} color="#fff" />
          </View>
          <Image
            source={isDark ? require('@/assets/images/light_logo.png') : require('@/assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={[styles.stepTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>

          <View style={styles.featureList}>
            {[
              { icon: 'newspaper', label: 'Real-time Chicago sports news' },
              { icon: 'sparkles', label: 'Scout AI sports assistant' },
              { icon: 'swap-horizontal', label: 'GM Trade Simulator' },
              { icon: 'chatbubbles', label: 'Fan Chat with AI personalities' },
            ].map((f) => (
              <View key={f.label} style={styles.featureRow}>
                <Ionicons name={f.icon as any} size={20} color={Colors.edgeCyan} />
                <Text style={[styles.featureText, { color: colors.text }]}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )
    }

    if (item.id === 'teams') {
      return (
        <View style={[styles.stepContainer, { width: SCREEN_WIDTH }]}>
          <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon} size={48} color="#fff" />
          </View>
          <Text style={[styles.stepTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>

          <View style={styles.teamsGrid}>
            {Object.values(TEAMS).map((team) => {
              const isSelected = selectedTeams.includes(team.id)
              return (
                <TouchableOpacity
                  key={team.id}
                  style={[
                    styles.teamCard,
                    {
                      backgroundColor: isSelected ? `${team.color}15` : colors.surface,
                      borderColor: isSelected ? team.color : colors.border,
                    },
                  ]}
                  onPress={() => toggleTeam(team.id)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: team.logo }} style={styles.teamLogo} contentFit="contain" />
                  <Text style={[styles.teamName, { color: colors.text }]}>{team.shortName}</Text>
                  {isSelected && (
                    <View style={[styles.teamCheck, { backgroundColor: team.color }]}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      )
    }

    // Notifications step
    return (
      <View style={[styles.stepContainer, { width: SCREEN_WIDTH }]}>
        <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={48} color="#fff" />
        </View>
        <Text style={[styles.stepTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>

        <View style={styles.notifList}>
          {[
            { key: 'breakingNews' as const, label: 'Breaking News', desc: 'Major trades, injuries, signings' },
            { key: 'gameAlerts' as const, label: 'Game Alerts', desc: 'Scores, start times, highlights' },
            { key: 'scoutInsights' as const, label: 'Scout Insights', desc: 'AI analysis and predictions' },
          ].map((pref) => (
            <View key={pref.key} style={[styles.notifRow, { borderBottomColor: colors.border }]}>
              <View style={styles.notifInfo}>
                <Text style={[styles.notifLabel, { color: colors.text }]}>{pref.label}</Text>
                <Text style={[styles.notifDesc, { color: colors.textMuted }]}>{pref.desc}</Text>
              </View>
              <Switch
                value={notifPrefs[pref.key]}
                onValueChange={(v) => setNotifPrefs(prev => ({ ...prev, [pref.key]: v }))}
                trackColor={{ false: colors.border, true: `${Colors.primary}80` }}
                thumbColor={notifPrefs[pref.key] ? Colors.primary : '#f4f3f4'}
              />
            </View>
          ))}
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
      </TouchableOpacity>

      {/* Steps */}
      <FlatList
        ref={flatListRef}
        data={STEPS}
        renderItem={renderStep}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.flatList}
      />

      {/* Pagination + Next */}
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentStep ? Colors.primary : colors.border,
                  width: i === currentStep ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: Colors.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === STEPS.length - 1 ? "Let's Go" : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.medium,
  },
  flatList: { flex: 1 },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 180,
    height: 40,
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: FontSize.heroLarge - 6,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    marginBottom: 12,
  },
  stepSubtitle: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  featureList: { gap: 16, width: '100%' },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.medium,
  },
  teamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  teamCard: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: Card.borderRadius,
    borderWidth: 2,
    width: '28%',
  },
  teamLogo: {
    width: Interactive.teamLogoMedium,
    height: Interactive.teamLogoMedium,
    marginBottom: 8,
  },
  teamName: {
    fontSize: FontSize.meta,
    fontWeight: FontWeight.semibold,
  },
  teamCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifList: { width: '100%', gap: 4 },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  notifInfo: { flex: 1, marginRight: 16 },
  notifLabel: { fontSize: FontSize.bodySmall, fontWeight: FontWeight.semibold },
  notifDesc: { fontSize: FontSize.meta, fontWeight: FontWeight.regular, marginTop: 2 },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 16,
    gap: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },
})
