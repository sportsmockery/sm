import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Slider from '@react-native-community/slider'

import { useTheme } from '@/hooks/useTheme'
import { COLORS } from '@/lib/config'
import { gmApi } from '@/lib/gm-api'
import type { ScenarioType, ScenarioResult, SimulationResult } from '@/lib/gm-types'

const SCENARIO_TYPES: { type: ScenarioType; label: string; icon: string; desc: string }[] = [
  { type: 'player_improvement', label: 'Player Improves', icon: 'trending-up', desc: 'What if a player exceeds expectations?' },
  { type: 'player_decline', label: 'Player Declines', icon: 'trending-down', desc: 'What if a player underperforms?' },
  { type: 'injury_impact', label: 'Injury Impact', icon: 'medical', desc: 'What if a player gets injured?' },
  { type: 'age_progression', label: 'Age Progression', icon: 'time', desc: 'How does the trade age over time?' },
]

export default function WhatIfScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ trade_id: string }>()
  const { colors } = useTheme()
  const [activeTab, setActiveTab] = useState<'scenarios' | 'simulation'>('scenarios')
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('player_improvement')
  const [scenarioValue, setScenarioValue] = useState(20)
  const [loading, setLoading] = useState(false)
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null)
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)

  const handleRunScenario = async () => {
    if (!params.trade_id) return
    setLoading(true)
    setScenarioResult(null)
    try {
      const result = await gmApi.runScenario({
        trade_id: params.trade_id,
        scenario_type: selectedScenario,
        parameters: {
          change_percent: selectedScenario === 'player_decline' ? -scenarioValue : scenarioValue,
          years: selectedScenario === 'age_progression' ? Math.ceil(scenarioValue / 33) : undefined,
        },
      })
      setScenarioResult(result)
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to run scenario')
    } finally {
      setLoading(false)
    }
  }

  const handleRunSimulation = async () => {
    if (!params.trade_id) return
    setLoading(true)
    setSimulationResult(null)
    try {
      const result = await gmApi.runSimulation({
        trade_id: params.trade_id,
        simulations: 1000,
      })
      setSimulationResult(result)
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to run simulation')
    } finally {
      setLoading(false)
    }
  }

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return '#22c55e'
    if (delta < 0) return '#ef4444'
    return colors.textMuted
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>What-If Analysis</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Explore alternative outcomes
          </Text>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'scenarios' && { backgroundColor: COLORS.primary }]}
          onPress={() => setActiveTab('scenarios')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'scenarios' ? '#fff' : colors.text }]}>
            Scenarios
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'simulation' && { backgroundColor: COLORS.primary }]}
          onPress={() => setActiveTab('simulation')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'simulation' ? '#fff' : colors.text }]}>
            Simulation
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'scenarios' ? (
          <>
            {/* Scenario Selector */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Scenario</Text>
            <View style={styles.scenarioGrid}>
              {SCENARIO_TYPES.map((s) => (
                <TouchableOpacity
                  key={s.type}
                  style={[
                    styles.scenarioCard,
                    { backgroundColor: colors.surface, borderColor: selectedScenario === s.type ? COLORS.primary : colors.border },
                  ]}
                  onPress={() => setSelectedScenario(s.type)}
                >
                  <Ionicons
                    name={s.icon as any}
                    size={24}
                    color={selectedScenario === s.type ? COLORS.primary : colors.textMuted}
                  />
                  <Text style={[styles.scenarioLabel, { color: colors.text }]}>{s.label}</Text>
                  <Text style={[styles.scenarioDesc, { color: colors.textMuted }]}>{s.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Slider */}
            <View style={[styles.sliderCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sliderLabel, { color: colors.text }]}>
                {selectedScenario === 'age_progression' ? 'Years Forward' : 'Change Magnitude'}
              </Text>
              <Text style={[styles.sliderValue, { color: COLORS.primary }]}>
                {selectedScenario === 'age_progression'
                  ? `${Math.ceil(scenarioValue / 33)} year${Math.ceil(scenarioValue / 33) > 1 ? 's' : ''}`
                  : `${selectedScenario === 'player_decline' ? '-' : '+'}${scenarioValue}%`}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={50}
                step={5}
                value={scenarioValue}
                onValueChange={setScenarioValue}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={COLORS.primary}
              />
            </View>

            {/* Run Button */}
            <TouchableOpacity
              style={[styles.runBtn, loading && { opacity: 0.6 }]}
              onPress={handleRunScenario}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text style={styles.runBtnText}>Run Scenario</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Scenario Result */}
            {scenarioResult && (
              <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.resultTitle, { color: colors.text }]}>Scenario Result</Text>

                <View style={styles.gradeComparison}>
                  <View style={styles.gradeBox}>
                    <Text style={[styles.gradeLabel, { color: colors.textMuted }]}>Original</Text>
                    <Text style={[styles.gradeValue, { color: colors.text }]}>{scenarioResult.original_grade}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={24} color={colors.textMuted} />
                  <View style={styles.gradeBox}>
                    <Text style={[styles.gradeLabel, { color: colors.textMuted }]}>Modified</Text>
                    <Text style={[styles.gradeValue, { color: colors.text }]}>{scenarioResult.modified_grade}</Text>
                  </View>
                  <View style={[styles.deltaBox, { backgroundColor: `${getDeltaColor(scenarioResult.grade_delta)}20` }]}>
                    <Text style={[styles.deltaValue, { color: getDeltaColor(scenarioResult.grade_delta) }]}>
                      {scenarioResult.grade_delta > 0 ? '+' : ''}{scenarioResult.grade_delta}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.resultReasoning, { color: colors.textMuted }]}>
                  {scenarioResult.modified_reasoning}
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Monte Carlo Simulation */}
            <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
              <Ionicons name="analytics" size={32} color={COLORS.primary} />
              <Text style={[styles.infoTitle, { color: colors.text }]}>Monte Carlo Simulation</Text>
              <Text style={[styles.infoDesc, { color: colors.textMuted }]}>
                Run 1,000 simulations to analyze potential trade outcomes based on player variance,
                market volatility, and injury risk factors.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.runBtn, loading && { opacity: 0.6 }]}
              onPress={handleRunSimulation}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="pulse" size={20} color="#fff" />
                  <Text style={styles.runBtnText}>Run Simulation</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Simulation Result */}
            {simulationResult && (
              <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.resultTitle, { color: colors.text }]}>Simulation Results</Text>
                <Text style={[styles.simSubtitle, { color: colors.textMuted }]}>
                  Based on {simulationResult.simulations_run.toLocaleString()} simulations
                </Text>

                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>Mean</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>{simulationResult.mean_outcome.toFixed(1)}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>Median</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>{simulationResult.median_outcome.toFixed(1)}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>Std Dev</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>{simulationResult.std_deviation.toFixed(1)}</Text>
                  </View>
                </View>

                <Text style={[styles.percentilesTitle, { color: colors.text }]}>Percentiles</Text>
                <View style={styles.percentilesRow}>
                  {['p10', 'p25', 'p50', 'p75', 'p90'].map((key) => (
                    <View key={key} style={styles.percentileBox}>
                      <Text style={[styles.percentileLabel, { color: colors.textMuted }]}>{key.toUpperCase()}</Text>
                      <Text style={[styles.percentileValue, { color: colors.text }]}>
                        {simulationResult.percentiles[key as keyof typeof simulationResult.percentiles]}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.riskRow}>
                  <View style={[styles.riskBox, { backgroundColor: '#ef444420' }]}>
                    <Text style={[styles.riskLabel, { color: '#ef4444' }]}>Bust Risk</Text>
                    <Text style={[styles.riskValue, { color: '#ef4444' }]}>
                      {(simulationResult.risk_analysis.bust_probability * 100).toFixed(0)}%
                    </Text>
                  </View>
                  <View style={[styles.riskBox, { backgroundColor: '#22c55e20' }]}>
                    <Text style={[styles.riskLabel, { color: '#22c55e' }]}>Success Prob</Text>
                    <Text style={[styles.riskValue, { color: '#22c55e' }]}>
                      {(simulationResult.risk_analysis.success_probability * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    margin: 16,
    borderRadius: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: { fontSize: 14, fontFamily: 'Montserrat-SemiBold' },
  scrollContent: { padding: 16, paddingTop: 0 },
  sectionTitle: { fontSize: 16, fontFamily: 'Montserrat-Bold', marginBottom: 12 },
  scenarioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  scenarioCard: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  scenarioLabel: { fontSize: 13, fontFamily: 'Montserrat-SemiBold', marginTop: 8, textAlign: 'center' },
  scenarioDesc: { fontSize: 10, fontFamily: 'Montserrat-Regular', marginTop: 4, textAlign: 'center' },
  sliderCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sliderLabel: { fontSize: 14, fontFamily: 'Montserrat-SemiBold' },
  sliderValue: { fontSize: 24, fontFamily: 'Montserrat-Bold', marginTop: 8 },
  slider: { width: '100%', height: 40, marginTop: 8 },
  runBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  runBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Montserrat-Bold' },
  resultCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  resultTitle: { fontSize: 16, fontFamily: 'Montserrat-Bold', marginBottom: 12 },
  gradeComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  gradeBox: { alignItems: 'center' },
  gradeLabel: { fontSize: 11, fontFamily: 'Montserrat-Medium' },
  gradeValue: { fontSize: 32, fontFamily: 'Montserrat-Bold' },
  deltaBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deltaValue: { fontSize: 18, fontFamily: 'Montserrat-Bold' },
  resultReasoning: { fontSize: 13, fontFamily: 'Montserrat-Regular', lineHeight: 20 },
  infoCard: {
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: { fontSize: 18, fontFamily: 'Montserrat-Bold', marginTop: 12 },
  infoDesc: { fontSize: 13, fontFamily: 'Montserrat-Regular', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  simSubtitle: { fontSize: 12, fontFamily: 'Montserrat-Regular', marginBottom: 16 },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, fontFamily: 'Montserrat-Medium' },
  statValue: { fontSize: 20, fontFamily: 'Montserrat-Bold', marginTop: 4 },
  percentilesTitle: { fontSize: 14, fontFamily: 'Montserrat-SemiBold', marginBottom: 8 },
  percentilesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  percentileBox: { alignItems: 'center' },
  percentileLabel: { fontSize: 10, fontFamily: 'Montserrat-Medium' },
  percentileValue: { fontSize: 14, fontFamily: 'Montserrat-Bold', marginTop: 2 },
  riskRow: {
    flexDirection: 'row',
    gap: 10,
  },
  riskBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  riskLabel: { fontSize: 11, fontFamily: 'Montserrat-SemiBold' },
  riskValue: { fontSize: 24, fontFamily: 'Montserrat-Bold', marginTop: 4 },
})
