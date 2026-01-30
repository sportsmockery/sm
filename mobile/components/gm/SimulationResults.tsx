/**
 * SimulationResults - Display season simulation results
 */

import React, { memo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import type { SeasonSimulationResult } from '@/lib/gm-types'

interface SimulationResultsProps {
  result: SeasonSimulationResult
  tradeCount: number
  teamName: string
  teamColor: string
  onSimulateAgain: () => void
  onClose: () => void
}

function SimulationResultsComponent({
  result,
  tradeCount,
  teamName,
  teamColor,
  onSimulateAgain,
  onClose,
}: SimulationResultsProps) {
  const { colors, isDark } = useTheme()

  const winImprovement = result.modified.wins - result.baseline.wins
  const isImproved = winImprovement > 0

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🏆</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Season Simulation</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* GM Score */}
        <View style={[styles.scoreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>GM Score</Text>
          <Text style={[styles.scoreValue, { color: teamColor }]}>{result.gmScore}</Text>
          <Text style={[styles.scoreSubtext, { color: colors.textMuted }]}>
            Based on {tradeCount} trade{tradeCount > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Record Comparison */}
        <View style={[styles.recordCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Record Projection</Text>

          <View style={styles.recordRow}>
            <View style={styles.recordItem}>
              <Text style={[styles.recordLabel, { color: colors.textMuted }]}>Before Trades</Text>
              <Text style={[styles.recordValue, { color: colors.text }]}>
                {result.baseline.wins}-{result.baseline.losses}
              </Text>
            </View>

            <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />

            <View style={styles.recordItem}>
              <Text style={[styles.recordLabel, { color: colors.textMuted }]}>After Trades</Text>
              <Text style={[styles.recordValue, { color: isImproved ? '#22c55e' : '#ef4444' }]}>
                {result.modified.wins}-{result.modified.losses}
              </Text>
            </View>
          </View>

          {winImprovement !== 0 && (
            <View style={[styles.improvementBadge, { backgroundColor: isImproved ? '#22c55e20' : '#ef444420' }]}>
              <Ionicons
                name={isImproved ? 'trending-up' : 'trending-down'}
                size={16}
                color={isImproved ? '#22c55e' : '#ef4444'}
              />
              <Text style={[styles.improvementText, { color: isImproved ? '#22c55e' : '#ef4444' }]}>
                {isImproved ? '+' : ''}{winImprovement} wins
              </Text>
            </View>
          )}
        </View>

        {/* Playoffs Status */}
        <View style={[styles.playoffCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.playoffRow}>
            <Text style={[styles.playoffLabel, { color: colors.textMuted }]}>Playoff Status</Text>
            <View style={[
              styles.playoffBadge,
              { backgroundColor: result.modified.madePlayoffs ? '#22c55e20' : '#ef444420' }
            ]}>
              <Ionicons
                name={result.modified.madePlayoffs ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={result.modified.madePlayoffs ? '#22c55e' : '#ef4444'}
              />
              <Text style={[
                styles.playoffText,
                { color: result.modified.madePlayoffs ? '#22c55e' : '#ef4444' }
              ]}>
                {result.modified.madePlayoffs ? 'Made Playoffs' : 'Missed Playoffs'}
              </Text>
            </View>
          </View>

          {result.modified.playoffSeed && (
            <Text style={[styles.seedText, { color: colors.text }]}>
              #{result.modified.playoffSeed} Seed
            </Text>
          )}
        </View>

        {/* Score Breakdown */}
        {result.scoreBreakdown && (
          <View style={[styles.breakdownCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Score Breakdown</Text>

            {[
              { label: 'Trade Quality', value: result.scoreBreakdown.tradeQualityScore },
              { label: 'Win Improvement', value: result.scoreBreakdown.winImprovementScore },
              { label: 'Playoff Bonus', value: result.scoreBreakdown.playoffBonusScore },
            ].map((item, idx) => (
              <View key={idx} style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: colors.textMuted }]}>{item.label}</Text>
                <Text style={[styles.breakdownValue, { color: colors.text }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: teamColor }]}
            onPress={onSimulateAgain}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Simulate Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtnSecondary, { borderColor: colors.border }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionBtnSecondaryText, { color: colors.text }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
  },
  closeBtn: {
    padding: 4,
  },
  scoreCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 56,
    fontFamily: 'Montserrat-Bold',
  },
  scoreSubtext: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginTop: 8,
  },
  recordCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 12,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordItem: {
    alignItems: 'center',
    flex: 1,
  },
  recordLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
    marginBottom: 4,
  },
  recordValue: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  improvementText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  playoffCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  playoffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playoffLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
  },
  playoffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  playoffText: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
  },
  seedText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    marginTop: 8,
    textAlign: 'center',
  },
  breakdownCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
  },
  breakdownValue: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  actions: {
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
  },
  actionBtnSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnSecondaryText: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
  },
})

export const SimulationResults = memo(SimulationResultsComponent)
export default SimulationResults
