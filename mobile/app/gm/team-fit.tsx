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
import { Image } from 'expo-image'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg'

import { useTheme } from '@/hooks/useTheme'
import { COLORS } from '@/lib/config'
import { gmApi } from '@/lib/gm-api'
import type { TeamFitResult } from '@/lib/gm-types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const RADAR_SIZE = Math.min(SCREEN_WIDTH - 80, 280)
const RADAR_CENTER = RADAR_SIZE / 2
const RADAR_RADIUS = RADAR_SIZE / 2 - 30

function getFitColor(score: number) {
  if (score >= 70) return '#22c55e'
  if (score >= 50) return '#eab308'
  return '#ef4444'
}

function getFitLabel(score: number) {
  if (score >= 70) return 'Great Fit'
  if (score >= 50) return 'Decent Fit'
  return 'Poor Fit'
}

// Radar chart component
function RadarChart({
  breakdown,
  teamColor,
}: {
  breakdown: TeamFitResult['breakdown']
  teamColor: string
}) {
  const axes = [
    { key: 'positional_need', label: 'Position' },
    { key: 'age_fit', label: 'Age' },
    { key: 'cap_fit', label: 'Cap' },
    { key: 'scheme_fit', label: 'Scheme' },
  ]

  const angleStep = (2 * Math.PI) / 4
  const startAngle = -Math.PI / 2

  const getPoint = (value: number, index: number) => {
    const angle = startAngle + index * angleStep
    const r = (value / 100) * RADAR_RADIUS
    return {
      x: RADAR_CENTER + r * Math.cos(angle),
      y: RADAR_CENTER + r * Math.sin(angle),
    }
  }

  const points = axes.map((axis, i) => getPoint(breakdown[axis.key as keyof typeof breakdown], i))
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ')

  const gridLevels = [25, 50, 75, 100]

  return (
    <View style={styles.radarWrap}>
      <Svg width={RADAR_SIZE} height={RADAR_SIZE}>
        {/* Grid circles */}
        {gridLevels.map((level) => (
          <Circle
            key={level}
            cx={RADAR_CENTER}
            cy={RADAR_CENTER}
            r={(level / 100) * RADAR_RADIUS}
            fill="none"
            stroke="rgba(150,150,150,0.2)"
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {axes.map((_, i) => {
          const angle = startAngle + i * angleStep
          const endX = RADAR_CENTER + RADAR_RADIUS * Math.cos(angle)
          const endY = RADAR_CENTER + RADAR_RADIUS * Math.sin(angle)
          return (
            <Line
              key={i}
              x1={RADAR_CENTER}
              y1={RADAR_CENTER}
              x2={endX}
              y2={endY}
              stroke="rgba(150,150,150,0.3)"
              strokeWidth={1}
            />
          )
        })}

        {/* Data polygon */}
        <Polygon
          points={polygonPoints}
          fill={`${teamColor}40`}
          stroke={teamColor}
          strokeWidth={2}
        />

        {/* Data points */}
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={5} fill={teamColor} />
        ))}

        {/* Axis labels */}
        {axes.map((axis, i) => {
          const angle = startAngle + i * angleStep
          const labelR = RADAR_RADIUS + 20
          const x = RADAR_CENTER + labelR * Math.cos(angle)
          const y = RADAR_CENTER + labelR * Math.sin(angle)
          return (
            <SvgText
              key={axis.key}
              x={x}
              y={y}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize={11}
              fill="#9ca3af"
              fontFamily="Montserrat-Medium"
            >
              {axis.label}
            </SvgText>
          )
        })}
      </Svg>
    </View>
  )
}

export default function TeamFitScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    player_name: string
    player_espn_id?: string
    target_team: string
    team_name: string
    team_color: string
    sport: string
    headshot_url?: string
  }>()
  const { colors } = useTheme()
  const [loading, setLoading] = useState(true)
  const [fitData, setFitData] = useState<TeamFitResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const teamColor = params.team_color || COLORS.primary

  useEffect(() => {
    async function loadFit() {
      try {
        setLoading(true)
        setError(null)
        const data = await gmApi.getTeamFit({
          player_name: params.player_name,
          player_espn_id: params.player_espn_id,
          target_team: params.target_team,
          sport: params.sport,
        })
        setFitData(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load fit analysis')
      } finally {
        setLoading(false)
      }
    }
    loadFit()
  }, [params.player_name, params.target_team, params.sport])

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Team Fit Analysis</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {params.player_name} → {params.team_name}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={teamColor} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Analyzing fit...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorWrap}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        </View>
      ) : fitData ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Player Header */}
          <View style={[styles.playerHeader, { backgroundColor: colors.surface }]}>
            {params.headshot_url ? (
              <Image source={{ uri: params.headshot_url }} style={styles.playerPhoto} contentFit="cover" />
            ) : (
              <View style={[styles.playerPhoto, { backgroundColor: teamColor }]}>
                <Text style={styles.playerInitial}>{params.player_name.charAt(0)}</Text>
              </View>
            )}
            <Text style={[styles.playerName, { color: colors.text }]}>{params.player_name}</Text>
          </View>

          {/* Overall Score */}
          <View style={[styles.scoreCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.scoreCircle, { borderColor: getFitColor(fitData.overall_fit) }]}>
              <Text style={[styles.scoreNumber, { color: getFitColor(fitData.overall_fit) }]}>
                {fitData.overall_fit}
              </Text>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={[styles.scoreLabel, { color: colors.text }]}>Overall Fit Score</Text>
              <Text style={[styles.scoreStatus, { color: getFitColor(fitData.overall_fit) }]}>
                {getFitLabel(fitData.overall_fit)}
              </Text>
            </View>
          </View>

          {/* Radar Chart */}
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Fit Breakdown</Text>
            <RadarChart breakdown={fitData.breakdown} teamColor={teamColor} />
          </View>

          {/* Insights */}
          <View style={[styles.insightsCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.insightsTitle, { color: colors.text }]}>Analysis Breakdown</Text>
            {Object.entries(fitData.insights).map(([key, value]) => {
              const score = fitData.breakdown[key as keyof typeof fitData.breakdown]
              const labels: Record<string, string> = {
                positional_need: 'Positional Need',
                age_fit: 'Age Fit',
                cap_fit: 'Cap Fit',
                scheme_fit: 'Scheme Fit',
              }
              return (
                <View key={key} style={[styles.insightRow, { borderBottomColor: colors.border }]}>
                  <View style={styles.insightHeader}>
                    <Text style={[styles.insightLabel, { color: colors.text }]}>{labels[key] || key}</Text>
                    <Text style={[styles.insightScore, { color: getFitColor(score) }]}>{score}/100</Text>
                  </View>
                  <Text style={[styles.insightText, { color: colors.textMuted }]}>{value}</Text>
                </View>
              )
            })}
          </View>

          {/* Recommendation */}
          <View style={[styles.recommendCard, { backgroundColor: `${getFitColor(fitData.overall_fit)}15`, borderColor: `${getFitColor(fitData.overall_fit)}40` }]}>
            <Text style={[styles.recommendLabel, { color: getFitColor(fitData.overall_fit) }]}>RECOMMENDATION</Text>
            <Text style={[styles.recommendText, { color: colors.text }]}>{fitData.recommendation}</Text>
          </View>

          {/* Comparable Acquisitions */}
          {fitData.comparable_acquisitions && fitData.comparable_acquisitions.length > 0 && (
            <View style={[styles.comparablesCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.comparablesTitle, { color: colors.text }]}>Similar Acquisitions</Text>
              {fitData.comparable_acquisitions.map((comp, i) => (
                <View key={i} style={[styles.compRow, { borderBottomColor: colors.border }]}>
                  <View style={styles.compInfo}>
                    <Text style={[styles.compName, { color: colors.text }]}>{comp.player_name}</Text>
                    <Text style={[styles.compTeam, { color: colors.textMuted }]}>→ {comp.team}</Text>
                  </View>
                  <View style={styles.compRight}>
                    <Text style={[styles.compScore, { color: colors.textMuted }]}>{comp.fit_score}</Text>
                    <View
                      style={[
                        styles.outcomeBadge,
                        {
                          backgroundColor:
                            comp.outcome === 'success' ? '#22c55e20' :
                            comp.outcome === 'failure' ? '#ef444420' : '#6b728020',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.outcomeText,
                          {
                            color:
                              comp.outcome === 'success' ? '#22c55e' :
                              comp.outcome === 'failure' ? '#ef4444' : '#6b7280',
                          },
                        ]}
                      >
                        {comp.outcome}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      ) : null}
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
  headerTitle: { fontSize: 17, fontFamily: 'Montserrat-Bold' },
  headerSubtitle: { fontSize: 12, fontFamily: 'Montserrat-Regular', marginTop: 2 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, fontFamily: 'Montserrat-Regular' },
  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { marginTop: 12, fontSize: 14, fontFamily: 'Montserrat-Regular', textAlign: 'center' },
  scrollContent: { padding: 16 },
  playerHeader: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 14,
    marginBottom: 16,
  },
  playerPhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerInitial: { color: '#fff', fontSize: 28, fontFamily: 'Montserrat-Bold' },
  playerName: { fontSize: 18, fontFamily: 'Montserrat-Bold', marginTop: 12 },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 14,
    marginBottom: 16,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: { fontSize: 32, fontFamily: 'Montserrat-Bold' },
  scoreInfo: { flex: 1, marginLeft: 20 },
  scoreLabel: { fontSize: 14, fontFamily: 'Montserrat-SemiBold' },
  scoreStatus: { fontSize: 13, fontFamily: 'Montserrat-Bold', marginTop: 4 },
  chartCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  chartTitle: { fontSize: 15, fontFamily: 'Montserrat-Bold', marginBottom: 8 },
  radarWrap: { alignItems: 'center', marginVertical: 8 },
  insightsCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  insightsTitle: { fontSize: 15, fontFamily: 'Montserrat-Bold', marginBottom: 12 },
  insightRow: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  insightLabel: { fontSize: 13, fontFamily: 'Montserrat-SemiBold' },
  insightScore: { fontSize: 13, fontFamily: 'Montserrat-Bold' },
  insightText: { fontSize: 12, fontFamily: 'Montserrat-Regular', lineHeight: 18 },
  recommendCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  recommendLabel: { fontSize: 11, fontFamily: 'Montserrat-Bold', marginBottom: 6 },
  recommendText: { fontSize: 13, fontFamily: 'Montserrat-Regular', lineHeight: 20 },
  comparablesCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  comparablesTitle: { fontSize: 15, fontFamily: 'Montserrat-Bold', marginBottom: 12 },
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  compInfo: { flex: 1 },
  compName: { fontSize: 13, fontFamily: 'Montserrat-SemiBold' },
  compTeam: { fontSize: 11, fontFamily: 'Montserrat-Regular', marginTop: 2 },
  compRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  compScore: { fontSize: 12, fontFamily: 'Montserrat-Medium' },
  outcomeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  outcomeText: { fontSize: 10, fontFamily: 'Montserrat-SemiBold' },
})
