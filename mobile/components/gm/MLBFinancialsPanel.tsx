/**
 * MLBFinancialsPanel - Salary retention sliders and cash considerations for MLB trades
 */

import React, { memo } from 'react'
import { View, Text, StyleSheet, TextInput } from 'react-native'
import Slider from '@react-native-community/slider'

import { useTheme } from '@/hooks/useTheme'
import { COLORS } from '@/lib/config'
import type { PlayerData } from '@/lib/gm-types'

interface MLBFinancialsPanelProps {
  receivedPlayers: PlayerData[]
  salaryRetentions: Record<string, number>
  onSalaryRetentionChange?: (playerId: string, pct: number) => void
  cashSent: number
  cashReceived: number
  onCashSentChange?: (amount: number) => void
  onCashReceivedChange?: (amount: number) => void
}

function formatMoney(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`
  }
  return `$${amount}`
}

function MLBFinancialsPanelComponent({
  receivedPlayers,
  salaryRetentions,
  onSalaryRetentionChange,
  cashSent,
  cashReceived,
  onCashSentChange,
  onCashReceivedChange,
}: MLBFinancialsPanelProps) {
  const { colors, isDark } = useTheme()

  // Only show players with salary data
  const playersWithSalary = receivedPlayers.filter(p => p.cap_hit && p.cap_hit > 0)

  return (
    <View style={styles.container}>
      {/* Salary Retention Section */}
      {playersWithSalary.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            Salary Retention (0-50%)
          </Text>
          {playersWithSalary.map(player => {
            const retentionPct = salaryRetentions[player.player_id] || 0
            const retainedAmount = (player.cap_hit || 0) * (retentionPct / 100)

            return (
              <View key={player.player_id} style={styles.retentionRow}>
                <View style={styles.retentionInfo}>
                  <Text style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
                    {player.full_name}
                  </Text>
                  <Text style={[styles.salaryText, { color: colors.textMuted }]}>
                    {formatMoney(player.cap_hit || 0)} / yr
                  </Text>
                </View>
                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={50}
                    step={5}
                    value={retentionPct}
                    onValueChange={(val) => onSalaryRetentionChange?.(player.player_id, val)}
                    minimumTrackTintColor={COLORS.primary}
                    maximumTrackTintColor={isDark ? '#444' : '#ddd'}
                    thumbTintColor={COLORS.primary}
                  />
                  <View style={styles.retentionValue}>
                    <Text style={[styles.pctText, { color: colors.text }]}>
                      {retentionPct}%
                    </Text>
                    {retentionPct > 0 && (
                      <Text style={[styles.retainedText, { color: '#22c55e' }]}>
                        {formatMoney(retainedAmount)} retained
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      )}

      {/* Cash Considerations Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          Cash Considerations (max $100K)
        </Text>
        <View style={styles.cashRow}>
          <View style={styles.cashInput}>
            <Text style={[styles.cashLabel, { color: colors.textMuted }]}>Sent</Text>
            <TextInput
              style={[
                styles.cashField,
                {
                  backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              keyboardType="numeric"
              value={cashSent > 0 ? String(cashSent) : ''}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              onChangeText={(text) => {
                const num = parseInt(text, 10) || 0
                onCashSentChange?.(Math.min(100000, num))
              }}
            />
          </View>
          <View style={styles.cashInput}>
            <Text style={[styles.cashLabel, { color: colors.textMuted }]}>Received</Text>
            <TextInput
              style={[
                styles.cashField,
                {
                  backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              keyboardType="numeric"
              value={cashReceived > 0 ? String(cashReceived) : ''}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              onChangeText={(text) => {
                const num = parseInt(text, 10) || 0
                onCashReceivedChange?.(Math.min(100000, num))
              }}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 12,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  retentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retentionInfo: {
    flex: 1,
    minWidth: 80,
  },
  playerName: {
    fontSize: 12,
    fontWeight: '600',
  },
  salaryText: {
    fontSize: 10,
  },
  sliderContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slider: {
    flex: 1,
    height: 30,
  },
  retentionValue: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  pctText: {
    fontSize: 12,
    fontWeight: '700',
  },
  retainedText: {
    fontSize: 9,
  },
  cashRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cashInput: {
    flex: 1,
    gap: 4,
  },
  cashLabel: {
    fontSize: 11,
  },
  cashField: {
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
  },
})

export default memo(MLBFinancialsPanelComponent)
