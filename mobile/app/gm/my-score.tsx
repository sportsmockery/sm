/**
 * My GM Score Page
 * Shows user's combined GM score (trades + mock drafts)
 */

import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { gmApi, AuthRequiredError } from '@/lib/gm-api'
import type { UserScoreResponse, MockDraftSummary } from '@/lib/gm-types'

const TEAM_CONFIG: Record<string, { name: string; color: string }> = {
  bears: { name: 'Bears', color: '#0B162A' },
  bulls: { name: 'Bulls', color: '#CE1141' },
  blackhawks: { name: 'Blackhawks', color: '#CF0A2C' },
  cubs: { name: 'Cubs', color: '#0E3386' },
  whitesox: { name: 'White Sox', color: '#27251F' },
}

function getGradeColor(grade: number | null): string {
  if (grade === null) return '#6b7280'
  if (grade >= 80) return '#22c55e'
  if (grade >= 70) return '#84cc16'
  if (grade >= 60) return '#eab308'
  if (grade >= 50) return '#f97316'
  return '#ef4444'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function MyGMScorePage() {
  const router = useRouter()
  const { isDark } = useTheme()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<UserScoreResponse | null>(null)
  const [settingBest, setSettingBest] = useState<string | null>(null)

  const bgColor = isDark ? '#0f172a' : '#f8fafc'
  const cardBg = isDark ? '#1e293b' : '#ffffff'
  const textColor = isDark ? '#f1f5f9' : '#1e293b'
  const subText = isDark ? '#94a3b8' : '#64748b'
  const borderColor = isDark ? '#334155' : '#e2e8f0'

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const result = await gmApi.getUserScore()
      setData(result)
    } catch (err) {
      if (err instanceof AuthRequiredError) {
        setError('Please sign in to view your GM Score')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    fetchData()
  }, [fetchData])

  const handleSetBestMock = async (mockId: string) => {
    setSettingBest(mockId)
    try {
      await gmApi.setBestMockDraft(mockId)
      await fetchData()
    } catch (err) {
      console.error('Failed to set best mock:', err)
    } finally {
      setSettingBest(null)
    }
  }

  const userScore = data?.user_score
  const mockDrafts = data?.mock_drafts || []
  const tradeStats = data?.trade_stats

  const hasCombinedScore = userScore && userScore.combined_gm_score !== null
  const hasTradeScore = userScore && userScore.best_trade_score !== null
  const hasMockScore = userScore && userScore.best_mock_draft_score !== null

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: textColor, flex: 1 }}>
          My GM Score
        </Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={22} color={subText} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#bc0000" />
          <Text style={{ marginTop: 12, color: subText }}>Loading your GM Score...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={{ marginTop: 12, color: textColor, textAlign: 'center', fontSize: 16 }}>
            {error}
          </Text>
          {!user && (
            <TouchableOpacity
              onPress={() => router.push('/auth')}
              style={{
                marginTop: 16,
                paddingHorizontal: 24,
                paddingVertical: 12,
                backgroundColor: '#bc0000',
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Combined Score Card */}
          <View
            style={{
              backgroundColor: cardBg,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: borderColor,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: subText, marginBottom: 8 }}>
              COMBINED GM SCORE
            </Text>

            {hasCombinedScore ? (
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 64,
                    fontWeight: '900',
                    color: getGradeColor(userScore.combined_gm_score),
                  }}
                >
                  {userScore.combined_gm_score?.toFixed(1)}
                </Text>
                <Text style={{ fontSize: 14, color: subText }}>Out of 100</Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center', marginVertical: 20 }}>
                <Ionicons name="trophy-outline" size={48} color={subText} />
                <Text style={{ marginTop: 8, color: subText, textAlign: 'center' }}>
                  Complete trades and mock drafts to build your GM Score
                </Text>
              </View>
            )}

            {/* Score Breakdown */}
            <View style={{ gap: 12 }}>
              {/* Trade Score */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                  borderRadius: 10,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: '#bc000020',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="swap-horizontal" size={20} color="#bc0000" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: textColor }}>
                      Trade Score
                    </Text>
                    <Text style={{ fontSize: 12, color: subText }}>
                      {tradeStats?.total || 0} trades • 60% weight
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '800',
                    color: hasTradeScore ? getGradeColor(userScore.best_trade_score) : subText,
                  }}
                >
                  {hasTradeScore ? userScore.best_trade_score?.toFixed(1) : '—'}
                </Text>
              </View>

              {/* Mock Draft Score */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
                  borderRadius: 10,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: '#3b82f620',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="list" size={20} color="#3b82f6" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: textColor }}>
                      Mock Draft Score
                    </Text>
                    <Text style={{ fontSize: 12, color: subText }}>
                      {userScore?.mock_count || 0} drafts • 40% weight
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '800',
                    color: hasMockScore ? getGradeColor(userScore.best_mock_draft_score) : subText,
                  }}
                >
                  {hasMockScore ? userScore.best_mock_draft_score?.toFixed(1) : '—'}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => router.push('/gm')}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 14,
                backgroundColor: '#bc0000',
                borderRadius: 10,
              }}
            >
              <Ionicons name="swap-horizontal" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '600' }}>Make Trade</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/mock-draft')}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 14,
                backgroundColor: cardBg,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: borderColor,
              }}
            >
              <Ionicons name="list" size={18} color={textColor} />
              <Text style={{ color: textColor, fontWeight: '600' }}>Mock Draft</Text>
            </TouchableOpacity>
          </View>

          {/* Mock Draft History */}
          {mockDrafts.length > 0 && (
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: textColor,
                  marginBottom: 12,
                }}
              >
                Mock Draft History
              </Text>

              {mockDrafts.map((draft: MockDraftSummary) => {
                const teamConfig = TEAM_CONFIG[draft.chicago_team] || { name: draft.chicago_team, color: '#666' }
                const isBest = draft.is_best_of_three
                const isSettingThis = settingBest === draft.id

                return (
                  <View
                    key={draft.id}
                    style={{
                      backgroundColor: cardBg,
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 10,
                      borderWidth: isBest ? 2 : 1,
                      borderColor: isBest ? '#22c55e' : borderColor,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: teamConfig.color,
                            }}
                          />
                          <Text style={{ fontSize: 15, fontWeight: '600', color: textColor }}>
                            {teamConfig.name} {draft.draft_year}
                          </Text>
                          {isBest && (
                            <View
                              style={{
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                                backgroundColor: '#22c55e20',
                                borderRadius: 4,
                              }}
                            >
                              <Text style={{ fontSize: 10, fontWeight: '700', color: '#22c55e' }}>
                                BEST
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={{ fontSize: 12, color: subText, marginTop: 4 }}>
                          {draft.completed_at ? formatDate(draft.completed_at) : 'In Progress'}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        {draft.mock_score !== null ? (
                          <>
                            <Text
                              style={{
                                fontSize: 28,
                                fontWeight: '800',
                                color: getGradeColor(draft.mock_score),
                              }}
                            >
                              {draft.mock_score.toFixed(0)}
                            </Text>
                            {draft.mock_grade_letter && (
                              <Text style={{ fontSize: 12, color: subText }}>
                                Grade: {draft.mock_grade_letter}
                              </Text>
                            )}
                          </>
                        ) : (
                          <Text style={{ fontSize: 14, color: subText }}>Pending</Text>
                        )}
                      </View>
                    </View>

                    {/* Score Breakdown */}
                    {draft.completed && draft.value_score !== null && (
                      <View
                        style={{
                          flexDirection: 'row',
                          marginTop: 12,
                          paddingTop: 12,
                          borderTopWidth: 1,
                          borderTopColor: borderColor,
                          gap: 8,
                        }}
                      >
                        <View style={{ flex: 1, alignItems: 'center' }}>
                          <Text style={{ fontSize: 11, color: subText }}>Value</Text>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: textColor }}>
                            {draft.value_score?.toFixed(0) || '—'}
                          </Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                          <Text style={{ fontSize: 11, color: subText }}>Fit</Text>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: textColor }}>
                            {draft.need_fit_score?.toFixed(0) || '—'}
                          </Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                          <Text style={{ fontSize: 11, color: subText }}>Upside</Text>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: textColor }}>
                            {draft.upside_risk_score?.toFixed(0) || '—'}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Set as Best button */}
                    {draft.completed && draft.mock_score !== null && !isBest && (
                      <TouchableOpacity
                        onPress={() => handleSetBestMock(draft.id)}
                        disabled={isSettingThis}
                        style={{
                          marginTop: 12,
                          paddingVertical: 8,
                          alignItems: 'center',
                          backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                          borderRadius: 6,
                          opacity: isSettingThis ? 0.6 : 1,
                        }}
                      >
                        {isSettingThis ? (
                          <ActivityIndicator size="small" color={subText} />
                        ) : (
                          <Text style={{ fontSize: 12, fontWeight: '600', color: subText }}>
                            Set as Best Draft
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                )
              })}
            </View>
          )}

          {/* Empty state for mock drafts */}
          {mockDrafts.length === 0 && (
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 12,
                padding: 24,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: borderColor,
              }}
            >
              <Ionicons name="document-text-outline" size={40} color={subText} />
              <Text style={{ marginTop: 12, fontSize: 14, color: subText, textAlign: 'center' }}>
                No mock drafts yet. Start a mock draft to see your history here.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/mock-draft')}
                style={{
                  marginTop: 16,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  backgroundColor: '#3b82f6',
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Start Mock Draft</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
