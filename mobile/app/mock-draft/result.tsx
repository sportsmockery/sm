import { useEffect, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { useMockDraft, getTeamColor, getUserPicks } from '@/lib/mock-draft-context'
import { CHICAGO_TEAM_INFO } from '@/lib/mock-draft-types'
import { COLORS } from '@/lib/config'

const { width } = Dimensions.get('window')

function getGradeColor(grade: number): string {
  if (grade >= 90) return '#10b981'
  if (grade >= 80) return '#22c55e'
  if (grade >= 70) return '#84cc16'
  if (grade >= 60) return '#f59e0b'
  if (grade >= 50) return '#f97316'
  return '#ef4444'
}

export default function MockDraftResult() {
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const { state, dispatch } = useMockDraft()

  const { gradeResult, activeDraft, selectedTeam } = state
  const teamColor = getTeamColor(selectedTeam)
  const teamInfo = selectedTeam ? CHICAGO_TEAM_INFO[selectedTeam] : null
  const userPicks = getUserPicks(activeDraft)

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const gradeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(gradeAnim, {
          toValue: gradeResult?.overall_grade || 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]),
    ]).start()
  }, [])

  const handleNewDraft = () => {
    dispatch({ type: 'RESET' })
    router.replace('/mock-draft')
  }

  const handleClose = () => {
    dispatch({ type: 'RESET' })
    router.dismissAll()
    router.replace('/(tabs)/teams')
  }

  if (!gradeResult) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>No grade result found</Text>
          <TouchableOpacity style={[styles.closeButton, { backgroundColor: teamColor }]} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const gradeColor = getGradeColor(gradeResult.overall_grade)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Draft Grade</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Grade Circle */}
        <Animated.View style={[styles.gradeContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.gradeCircle, { backgroundColor: gradeColor }]}>
            <Text style={styles.letterGrade}>{gradeResult.letter_grade}</Text>
            <Text style={styles.numericGrade}>{gradeResult.overall_grade}</Text>
          </View>
          <Text style={[styles.gradeLabel, { color: colors.textMuted }]}>
            {teamInfo?.name.replace('Chicago ', '')} {activeDraft?.draft_year} Draft
          </Text>
        </Animated.View>

        {/* Analysis */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Analysis</Text>
          <View style={[styles.analysisCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.analysisText, { color: colors.text }]}>
              {gradeResult.analysis}
            </Text>
          </View>
        </Animated.View>

        {/* Strengths */}
        {gradeResult.strengths.length > 0 && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: 8 }]}>
                Strengths
              </Text>
            </View>
            <View style={[styles.listCard, { backgroundColor: colors.surface }]}>
              {gradeResult.strengths.map((s, i) => (
                <View key={i} style={styles.listItem}>
                  <View style={[styles.listBullet, { backgroundColor: COLORS.success }]} />
                  <Text style={[styles.listText, { color: colors.text }]}>{s}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Weaknesses */}
        {gradeResult.weaknesses.length > 0 && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle" size={20} color="#f59e0b" />
              <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: 8 }]}>
                Areas to Improve
              </Text>
            </View>
            <View style={[styles.listCard, { backgroundColor: colors.surface }]}>
              {gradeResult.weaknesses.map((w, i) => (
                <View key={i} style={styles.listItem}>
                  <View style={[styles.listBullet, { backgroundColor: '#f59e0b' }]} />
                  <Text style={[styles.listText, { color: colors.text }]}>{w}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Pick Grades */}
        {gradeResult.pick_grades && gradeResult.pick_grades.length > 0 && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Pick Grades</Text>
            {gradeResult.pick_grades.map((pg, i) => (
              <View key={i} style={[styles.pickGradeCard, { backgroundColor: colors.surface }]}>
                <View style={styles.pickGradeHeader}>
                  <View style={[styles.pickBadge, { backgroundColor: teamColor }]}>
                    <Text style={styles.pickBadgeText}>#{pg.pick_number}</Text>
                  </View>
                  <Text style={[styles.pickName, { color: colors.text }]}>{pg.prospect_name}</Text>
                  <View style={[styles.pickGradeBadge, { backgroundColor: getGradeColor(pg.grade) }]}>
                    <Text style={styles.pickGradeText}>{pg.grade}</Text>
                  </View>
                </View>
                <Text style={[styles.pickAnalysis, { color: colors.textMuted }]}>
                  {pg.analysis}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Actions */}
        <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: teamColor }]}
            onPress={handleNewDraft}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>New Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={handleClose}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Done</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  scrollContent: {
    padding: 16,
  },
  gradeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  gradeCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  letterGrade: {
    color: '#fff',
    fontSize: 48,
    fontFamily: 'Montserrat-Bold',
  },
  numericGrade: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: -4,
  },
  gradeLabel: {
    fontSize: 15,
    fontFamily: 'Montserrat-Medium',
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 12,
  },
  analysisCard: {
    padding: 16,
    borderRadius: 12,
  },
  analysisText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 22,
  },
  listCard: {
    padding: 16,
    borderRadius: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  listBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 10,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 20,
  },
  pickGradeCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  pickGradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  pickBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
  },
  pickName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  pickGradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pickGradeText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
  },
  pickAnalysis: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 19,
  },
  actions: {
    marginTop: 8,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  closeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
})
