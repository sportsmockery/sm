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
import { useRouter, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { COLORS, API_BASE_URL, TEAMS } from '@/lib/config'

interface PollOption {
  id: string
  option_text: string
  vote_count: number
}

interface Poll {
  id: string
  question: string
  options: PollOption[]
  total_votes: number
  team_theme?: string
  status: string
  created_at: string
}

export default function PollsScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set())
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})

  const fetchPolls = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/polls?status=active&limit=20`)
      if (response.ok) {
        const result = await response.json()
        setPolls(result.polls || [])
      }
    } catch (error) {
      console.error('Error fetching polls:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPolls()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchPolls()
  }

  const handleVote = async (pollId: string, optionId: string) => {
    if (votedPolls.has(pollId)) return

    setSelectedOptions(prev => ({ ...prev, [pollId]: optionId }))

    try {
      const response = await fetch(`${API_BASE_URL}/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      })

      if (response.ok) {
        setVotedPolls(prev => new Set([...prev, pollId]))
        // Refresh to get updated vote counts
        fetchPolls()
      }
    } catch (error) {
      console.error('Error voting:', error)
      setSelectedOptions(prev => {
        const updated = { ...prev }
        delete updated[pollId]
        return updated
      })
    }
  }

  const getTeamColor = (teamTheme?: string) => {
    if (!teamTheme) return COLORS.primary
    const team = TEAMS[teamTheme as keyof typeof TEAMS]
    return team?.color || COLORS.primary
  }

  const getPercentage = (voteCount: number, totalVotes: number) => {
    if (totalVotes === 0) return 0
    return Math.round((voteCount / totalVotes) * 100)
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Polls</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Vote on Chicago sports topics
          </Text>
        </View>
      </View>

      {/* Polls List */}
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
        ) : polls.length > 0 ? (
          polls.map((poll) => {
            const hasVoted = votedPolls.has(poll.id) || selectedOptions[poll.id]
            const teamColor = getTeamColor(poll.team_theme)

            return (
              <View
                key={poll.id}
                style={[styles.pollCard, { backgroundColor: colors.surface }]}
              >
                {/* Team Color Bar */}
                <View style={[styles.pollColorBar, { backgroundColor: teamColor }]} />

                {/* Question */}
                <Text style={[styles.pollQuestion, { color: colors.text }]}>
                  {poll.question}
                </Text>

                {/* Options */}
                <View style={styles.optionsContainer}>
                  {poll.options.map((option) => {
                    const percentage = getPercentage(option.vote_count, poll.total_votes)
                    const isSelected = selectedOptions[poll.id] === option.id

                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[
                          styles.optionButton,
                          { borderColor: colors.border },
                          isSelected && { borderColor: teamColor, borderWidth: 2 },
                        ]}
                        onPress={() => handleVote(poll.id, option.id)}
                        disabled={hasVoted}
                        activeOpacity={hasVoted ? 1 : 0.7}
                      >
                        {/* Progress bar background */}
                        {hasVoted && (
                          <View
                            style={[
                              styles.progressBar,
                              {
                                width: `${percentage}%`,
                                backgroundColor: isSelected ? teamColor : colors.border,
                                opacity: isSelected ? 0.2 : 0.1,
                              },
                            ]}
                          />
                        )}

                        <View style={styles.optionContent}>
                          <Text
                            style={[
                              styles.optionText,
                              { color: colors.text },
                              isSelected && { fontFamily: 'Montserrat-Bold' },
                            ]}
                          >
                            {option.option_text}
                          </Text>

                          {hasVoted && (
                            <Text
                              style={[
                                styles.percentageText,
                                { color: isSelected ? teamColor : colors.textMuted },
                              ]}
                            >
                              {percentage}%
                            </Text>
                          )}
                        </View>

                        {isSelected && (
                          <View style={[styles.checkmark, { backgroundColor: teamColor }]}>
                            <Ionicons name="checkmark" size={12} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    )
                  })}
                </View>

                {/* Vote count */}
                <Text style={[styles.voteCount, { color: colors.textMuted }]}>
                  {poll.total_votes.toLocaleString()} vote{poll.total_votes !== 1 ? 's' : ''}
                </Text>
              </View>
            )
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="bar-chart-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No active polls right now
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
  pollCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pollColorBar: {
    height: 4,
  },
  pollQuestion: {
    fontSize: 17,
    fontFamily: 'Montserrat-Bold',
    padding: 16,
    paddingBottom: 12,
  },
  optionsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  optionButton: {
    position: 'relative',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Montserrat-Medium',
  },
  percentageText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    marginLeft: 12,
  },
  checkmark: {
    position: 'absolute',
    right: 14,
    top: '50%',
    marginTop: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voteCount: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    padding: 16,
    paddingTop: 12,
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
