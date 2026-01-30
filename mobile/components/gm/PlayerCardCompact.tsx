/**
 * PlayerCardCompact - Optimized player card for bottom sheets
 * Smaller and more efficient than the full player card
 */

import React, { memo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { triggerHaptic } from '@/hooks/useHaptics'
import { COLORS } from '@/lib/config'
import type { PlayerData } from '@/lib/gm-types'

interface PlayerCardCompactProps {
  player: PlayerData
  selected: boolean
  teamColor: string
  onPress: () => void
  onLongPress?: () => void
}

export const PlayerCardCompact = memo(function PlayerCardCompact({
  player,
  selected,
  teamColor,
  onPress,
  onLongPress,
}: PlayerCardCompactProps) {
  const { colors } = useTheme()

  const handlePress = () => {
    triggerHaptic('selection')
    onPress()
  }

  const handleLongPress = () => {
    if (onLongPress) {
      triggerHaptic('impact_medium')
      onLongPress()
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface },
        selected && styles.cardSelected,
        selected && { borderColor: COLORS.primary },
      ]}
      activeOpacity={0.7}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={400}
    >
      <View style={styles.row}>
        {/* Headshot */}
        {player.headshot_url ? (
          <Image
            source={{ uri: player.headshot_url }}
            style={styles.headshot}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.headshot, styles.headshotPlaceholder, { backgroundColor: teamColor }]}>
            <Text style={styles.headshotInitial}>{player.full_name.charAt(0)}</Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {player.full_name}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
            {player.position}
            {player.jersey_number ? ` #${player.jersey_number}` : ''}
            {player.age ? ` · ${player.age}y` : ''}
          </Text>
          {player.stat_line ? (
            <Text style={[styles.stat, { color: colors.textMuted }]} numberOfLines={1}>
              {player.stat_line}
            </Text>
          ) : null}
        </View>

        {/* Selection Indicator */}
        {selected && (
          <View style={[styles.checkBadge, { backgroundColor: COLORS.primary }]}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderWidth: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  headshot: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headshotPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headshotInitial: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  meta: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    marginTop: 1,
  },
  stat: {
    fontSize: 10,
    fontFamily: 'Montserrat-Regular',
    marginTop: 1,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default PlayerCardCompact
