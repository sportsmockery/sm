import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { COLORS, API_BASE_URL, TEAMS } from '@/lib/config'

interface Prediction {
  id: string
  title: string
  prediction: string
  confidence: number
  team?: string
  status: 'active' | 'correct' | 'incorrect' | 'pending'
  created_at: string
  resolved_at?: string
}

export default function PredictionsScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filter, setFilter] = useState<'active' | 'resolved'>('active')

  const fetchPredictions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/predictions?status=${filter}`)
      if (response.ok) {
        const result = await response.json()
        setPredictions(result.predictions || [])
      }
    } catch (error) {
      console.error('Error fetching predictions:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchPredictions()
  }, [filter])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchPredictions()
  }

  const getTeamColor = (teamId?: string) => {
    if (!teamId) return COLORS.primary
    const team = TEAMS[teamId as keyof typeof TEAMS]
    return team?.color || COLORS.primary
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return { name: 'checkmark-circle', color: COLORS.success }
      case 'incorrect':
        return { name: 'close-circle', color: COLORS.error }
      default:
        return { name: 'time', color: COLORS.warning }
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return COLORS.success
    if (confidence >= 60) return COLORS.warning
    return COLORS.error
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>SM Prophecy</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            AI-Powered Predictions
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterTabs, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'active' && { backgroundColor: COLORS.primary },
          ]}
          onPress={() => setFilter('active')}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: filter === 'active' ? '#fff' : colors.textMuted },
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'resolved' && { backgroundColor: COLORS.primary },
          ]}
          onPress={() => setFilter('resolved')}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: filter === 'resolved' ? '#fff' : colors.textMuted },
            ]}
          >
            Resolved
          </Text>
        </TouchableOpacity>
      </View>

      {/* Predictions List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : predictions.length > 0 ? (
          predictions.map((prediction) => {
            const teamColor = getTeamColor(prediction.team)
            const statusIcon = getStatusIcon(prediction.status)

            return (
              <View
                key={prediction.id}
                style={[styles.predictionCard, { backgroundColor: colors.surface }]}
              >
                {/* Team Color Bar */}
                <View style={[styles.colorBar, { backgroundColor: teamColor }]} />

                {/* Header Row */}
                <View style={styles.cardHeader}>
                  {prediction.team && (
                    <View style={styles.teamBadge}>
                      <Image
                        source={{ uri: TEAMS[prediction.team as keyof typeof TEAMS]?.logo }}
                        style={styles.teamLogo}
                        contentFit="contain"
                      />
                    </View>
                  )}
                  <View style={styles.cardHeaderText}>
                    <Text style={[styles.predictionTitle, { color: colors.text }]}>
                      {prediction.title}
                    </Text>
                    <Text style={[styles.dateText, { color: colors.textMuted }]}>
                      {formatDate(prediction.created_at)}
                    </Text>
                  </View>
                  {filter === 'resolved' && (
                    <Ionicons
                      name={statusIcon.name as any}
                      size={24}
                      color={statusIcon.color}
                    />
                  )}
                </View>

                {/* Prediction Text */}
                <Text style={[styles.predictionText, { color: colors.text }]}>
                  {prediction.prediction}
                </Text>

                {/* Confidence Bar */}
                <View style={styles.confidenceContainer}>
                  <View style={styles.confidenceHeader}>
                    <Text style={[styles.confidenceLabel, { color: colors.textMuted }]}>
                      AI Confidence
                    </Text>
                    <Text
                      style={[
                        styles.confidenceValue,
                        { color: getConfidenceColor(prediction.confidence) },
                      ]}
                    >
                      {prediction.confidence}%
                    </Text>
                  </View>
                  <View style={[styles.confidenceBarBg, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.confidenceBarFill,
                        {
                          width: `${prediction.confidence}%`,
                          backgroundColor: getConfidenceColor(prediction.confidence),
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            )
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="crystal-ball" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No {filter} predictions
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
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
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  filterTabs: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  predictionCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorBar: {
    height: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  teamBadge: {
    marginRight: 12,
  },
  teamLogo: {
    width: 32,
    height: 32,
  },
  cardHeaderText: {
    flex: 1,
  },
  predictionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  predictionText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  confidenceContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  confidenceLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
  },
  confidenceValue: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  confidenceBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    marginTop: 16,
    textAlign: 'center',
  },
})
