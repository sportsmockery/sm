import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { COLORS } from '@/lib/config'
import { gmApi, AuthRequiredError } from '@/lib/gm-api'
import type { AnalyticsResult } from '@/lib/gm-types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function GMAnalyticsScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAnalytics() {
      if (!isAuthenticated) {
        router.push('/auth')
        return
      }
      try {
        setLoading(true)
        setError(null)
        const data = await gmApi.getAnalytics()
        setAnalytics(data)
      } catch (err: any) {
        if (err instanceof AuthRequiredError) {
          router.push('/auth')
        } else {
          setError(err.message || 'Failed to load analytics')
        }
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [isAuthenticated])

  const StatCard = ({ label, value, color }: { label: string; value: string | number; color?: string }) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.statValue, { color: color || colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>GM Analytics</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Your trading performance
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading analytics...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorWrap}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.replace('/gm/analytics')}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : analytics && analytics.total_trades > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Overview Stats */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard label="Total Trades" value={analytics.total_trades} />
            <StatCard label="GM Score" value={analytics.total_gm_score} color={COLORS.primary} />
            <StatCard label="Avg Grade" value={analytics.average_grade.toFixed(1)} />
            <StatCard label="Best Grade" value={analytics.highest_grade} color="#22c55e" />
          </View>

          {/* Trade Results */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Trade Results</Text>
          <View style={styles.resultsRow}>
            <View style={[styles.resultCard, { backgroundColor: '#22c55e20' }]}>
              <Text style={[styles.resultValue, { color: '#22c55e' }]}>{analytics.accepted_trades}</Text>
              <Text style={[styles.resultLabel, { color: '#22c55e' }]}>Accepted</Text>
            </View>
            <View style={[styles.resultCard, { backgroundColor: '#ef444420' }]}>
              <Text style={[styles.resultValue, { color: '#ef4444' }]}>{analytics.rejected_trades}</Text>
              <Text style={[styles.resultLabel, { color: '#ef4444' }]}>Rejected</Text>
            </View>
            <View style={[styles.resultCard, { backgroundColor: '#f59e0b20' }]}>
              <Text style={[styles.resultValue, { color: '#f59e0b' }]}>{analytics.dangerous_trades}</Text>
              <Text style={[styles.resultLabel, { color: '#f59e0b' }]}>Dangerous</Text>
            </View>
          </View>

          {/* Grade Distribution */}
          {analytics.grade_distribution && analytics.grade_distribution.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Grade Distribution</Text>
              <View style={[styles.distributionCard, { backgroundColor: colors.surface }]}>
                {analytics.grade_distribution.map((bucket) => (
                  <View key={bucket.bucket} style={styles.bucketRow}>
                    <Text style={[styles.bucketLabel, { color: colors.textMuted }]}>{bucket.bucket}</Text>
                    <View style={styles.bucketBarWrap}>
                      <View
                        style={[
                          styles.bucketBar,
                          {
                            width: `${Math.max(bucket.percentage, 2)}%`,
                            backgroundColor: parseInt(bucket.bucket) >= 70 ? '#22c55e' : parseInt(bucket.bucket) >= 50 ? '#f59e0b' : '#ef4444',
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.bucketCount, { color: colors.text }]}>{bucket.count}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Trading Partners */}
          {analytics.trading_partners && analytics.trading_partners.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Trading Partners</Text>
              <View style={[styles.partnersCard, { backgroundColor: colors.surface }]}>
                {analytics.trading_partners.slice(0, 5).map((partner, idx) => (
                  <View key={partner.team_key || idx} style={[styles.partnerRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.partnerRank, { color: colors.textMuted }]}>{idx + 1}</Text>
                    <View style={styles.partnerInfo}>
                      <Text style={[styles.partnerName, { color: colors.text }]}>{partner.team_name}</Text>
                      <Text style={[styles.partnerStats, { color: colors.textMuted }]}>
                        {partner.trade_count} trades · Avg: {partner.avg_grade}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Chicago Teams Breakdown */}
          {analytics.chicago_teams && analytics.chicago_teams.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>By Chicago Team</Text>
              <View style={[styles.partnersCard, { backgroundColor: colors.surface }]}>
                {analytics.chicago_teams.map((team, idx) => (
                  <View key={team.team} style={[styles.partnerRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.partnerInfo}>
                      <Text style={[styles.partnerName, { color: colors.text }]}>
                        {team.team.charAt(0).toUpperCase() + team.team.slice(1)}
                      </Text>
                      <Text style={[styles.partnerStats, { color: colors.textMuted }]}>
                        {team.trade_count} trades · Avg: {team.avg_grade} · {team.accepted_rate}% accepted
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <View style={styles.emptyWrap}>
          <Ionicons name="bar-chart-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Trades Yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Complete some trades to see your analytics
          </Text>
          <TouchableOpacity style={styles.startBtn} onPress={() => router.replace('/gm')}>
            <Text style={styles.startBtnText}>Start Trading</Text>
          </TouchableOpacity>
        </View>
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
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, fontFamily: 'Montserrat-Regular' },
  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { marginTop: 12, fontSize: 14, fontFamily: 'Montserrat-Regular', textAlign: 'center' },
  retryBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Montserrat-Bold' },
  scrollContent: { padding: 16 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 28, fontFamily: 'Montserrat-Bold' },
  statLabel: { fontSize: 12, fontFamily: 'Montserrat-Regular', marginTop: 4 },
  resultsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  resultCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  resultValue: { fontSize: 24, fontFamily: 'Montserrat-Bold' },
  resultLabel: { fontSize: 11, fontFamily: 'Montserrat-SemiBold', marginTop: 2 },
  distributionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  bucketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bucketLabel: { width: 50, fontSize: 11, fontFamily: 'Montserrat-Medium' },
  bucketBarWrap: {
    flex: 1,
    height: 16,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  bucketBar: { height: 16, borderRadius: 4 },
  bucketCount: { width: 30, fontSize: 12, fontFamily: 'Montserrat-Bold', textAlign: 'right' },
  partnersCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  partnerRank: {
    width: 24,
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
  partnerInfo: { flex: 1, marginLeft: 8 },
  partnerName: { fontSize: 14, fontFamily: 'Montserrat-SemiBold' },
  partnerStats: { fontSize: 11, fontFamily: 'Montserrat-Regular', marginTop: 2 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyTitle: { fontSize: 20, fontFamily: 'Montserrat-Bold', marginTop: 16 },
  emptySubtitle: { fontSize: 14, fontFamily: 'Montserrat-Regular', marginTop: 8, textAlign: 'center' },
  startBtn: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Montserrat-Bold' },
})
