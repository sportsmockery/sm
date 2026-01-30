import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Share,
  Linking,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'

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

  // Share state
  const [copied, setCopied] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)

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

  // Share functionality
  const shareUrl = activeDraft?.id
    ? `https://sportsmockery.com/mock-draft/share/${activeDraft.id}`
    : 'https://sportsmockery.com/mock-draft'

  const shareText = gradeResult
    ? `I got a ${gradeResult.letter_grade} (${gradeResult.overall_grade}) on my ${teamInfo?.name || ''} Mock Draft! Think you can do better? Try the Mock Draft Simulator on Sports Mockery!`
    : 'Check out the Mock Draft Simulator on Sports Mockery!'

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${shareText}\n\n${shareUrl}`,
        url: shareUrl,
        title: 'My Mock Draft Grade',
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(shareUrl)
      setCopied(true)
      setShowShareOptions(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      console.error('Error copying:', error)
      Alert.alert('Error', 'Failed to copy link')
    }
  }

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'reddit') => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(shareText)

    let url = ''
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case 'reddit':
        url = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`
        break
    }

    Linking.openURL(url)
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
        <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </TouchableOpacity>
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

        {/* Share Section */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Share Your Grade</Text>
          <View style={[styles.shareCard, { backgroundColor: colors.surface }]}>
            <View style={styles.shareButtons}>
              <TouchableOpacity
                style={[styles.shareButton, { borderColor: copied ? '#22c55e' : colors.border }]}
                onPress={handleCopyLink}
              >
                <Ionicons
                  name={copied ? "checkmark-circle" : "link"}
                  size={20}
                  color={copied ? '#22c55e' : colors.text}
                />
                <Text style={[styles.shareButtonText, { color: copied ? '#22c55e' : colors.text }]}>
                  {copied ? 'Copied!' : 'Copy Link'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareButton, { borderColor: colors.border }]}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={20} color={colors.text} />
                <Text style={[styles.shareButtonText, { color: colors.text }]}>Share</Text>
              </TouchableOpacity>
            </View>

            {/* Social Icons */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: '#000' }]}
                onPress={() => handleSocialShare('twitter')}
              >
                <Ionicons name="logo-twitter" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: '#1877f2' }]}
                onPress={() => handleSocialShare('facebook')}
              >
                <Ionicons name="logo-facebook" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: '#ff4500' }]}
                onPress={() => handleSocialShare('reddit')}
              >
                <Ionicons name="logo-reddit" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Marketing CTA */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <View style={styles.ctaCard}>
            <Text style={styles.ctaEmoji}>🏈</Text>
            <Text style={styles.ctaTitle}>Think You Can Draft Better?</Text>
            <Text style={styles.ctaText}>
              Challenge your friends to beat your grade! The Mock Draft Simulator and Trade Simulator
              are free tools on Sports Mockery that let you test your GM skills.
            </Text>
            <View style={styles.ctaButtons}>
              <TouchableOpacity
                style={styles.ctaPrimaryButton}
                onPress={() => {
                  dispatch({ type: 'RESET' })
                  router.replace('/mock-draft')
                }}
              >
                <Text style={styles.ctaPrimaryButtonText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ctaSecondaryButton}
                onPress={() => {
                  dispatch({ type: 'RESET' })
                  router.replace('/gm')
                }}
              >
                <Text style={styles.ctaSecondaryButtonText}>Trade Simulator</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.ctaFooter}>
              Join Sports Mockery free at <Text style={styles.ctaLink}>sportsmockery.com</Text>
            </Text>
          </View>
        </Animated.View>

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
  shareCard: {
    padding: 16,
    borderRadius: 12,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(188, 0, 0, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(188, 0, 0, 0.3)',
    alignItems: 'center',
  },
  ctaEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  ctaTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#bc0000',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  ctaPrimaryButton: {
    backgroundColor: '#bc0000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ctaPrimaryButtonText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
  },
  ctaSecondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#bc0000',
  },
  ctaSecondaryButtonText: {
    color: '#bc0000',
    fontSize: 13,
    fontFamily: 'Montserrat-Bold',
  },
  ctaFooter: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    color: '#6b7280',
  },
  ctaLink: {
    color: '#bc0000',
    fontFamily: 'Montserrat-SemiBold',
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
