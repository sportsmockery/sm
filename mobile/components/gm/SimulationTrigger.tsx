/**
 * SimulationTrigger - Trigger season simulation after trades
 */

import React, { memo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { COLORS } from '@/lib/config'

interface SimulationTriggerProps {
  tradeCount: number
  sport: string
  onSimulate: () => void
  isSimulating: boolean
  teamColor: string
}

function SimulationTriggerComponent({
  tradeCount,
  sport,
  onSimulate,
  isSimulating,
  teamColor,
}: SimulationTriggerProps) {
  const { colors, isDark } = useTheme()

  // Only show if user has made at least 1 trade
  if (tradeCount === 0) return null

  // Game counts by sport
  const gameCount = sport === 'nfl' ? '17' : sport === 'mlb' ? '162' : sport === 'nba' ? '82' : '82'

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>🎮</Text>
        <Text style={[styles.title, { color: colors.text }]}>Simulate Season</Text>
        <View style={[styles.badge, { backgroundColor: teamColor }]}>
          <Text style={styles.badgeText}>
            {tradeCount} trade{tradeCount > 1 ? 's' : ''} made
          </Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.textMuted }]}>
        See how your trades impact the season. We'll simulate all {gameCount} games
        and show your improved record and GM Score.
      </Text>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isSimulating ? colors.border : teamColor },
        ]}
        onPress={onSimulate}
        disabled={isSimulating}
        activeOpacity={0.8}
      >
        {isSimulating ? (
          <>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.buttonText}>Simulating Season...</Text>
          </>
        ) : (
          <>
            <Text style={styles.buttonEmoji}>🏆</Text>
            <Text style={styles.buttonText}>Simulate 2026 Season</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  emoji: {
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 22,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonEmoji: {
    fontSize: 18,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
  },
})

export const SimulationTrigger = memo(SimulationTriggerComponent)
export default SimulationTrigger
