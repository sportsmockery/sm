/**
 * TradeAssetPill - Compact trade asset display for the Trade Dock
 * Shows player, pick, or prospect with swipe-to-remove gesture
 */

import React, { memo } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

import { useTheme } from '@/hooks/useTheme'
import { triggerHaptic } from '@/hooks/useHaptics'
import { COLORS } from '@/lib/config'
import type { PlayerData, DraftPick, MLBProspect } from '@/lib/gm-types'

interface TradeAssetPillProps {
  type: 'player' | 'pick' | 'prospect'
  player?: PlayerData
  pick?: DraftPick
  prospect?: MLBProspect
  teamColor: string
  onRemove: () => void
}

const SWIPE_THRESHOLD = -60

// Level colors for prospects
const LEVEL_COLORS: Record<string, string> = {
  'AAA': '#22c55e',
  'AA': '#3b82f6',
  'A+': '#8b5cf6',
  'A': '#a855f7',
  'R': '#f59e0b',
  'Rk': '#f59e0b',
}

export const TradeAssetPill = memo(function TradeAssetPill({
  type,
  player,
  pick,
  prospect,
  teamColor,
  onRemove,
}: TradeAssetPillProps) {
  const { colors } = useTheme()
  const translateX = useSharedValue(0)

  const handleRemove = () => {
    triggerHaptic('impact_light')
    onRemove()
  }

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = Math.min(0, Math.max(-80, event.translationX))
    })
    .onEnd((event) => {
      if (event.translationX < SWIPE_THRESHOLD) {
        translateX.value = withSpring(-80)
        runOnJS(handleRemove)()
      } else {
        translateX.value = withSpring(0)
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const removeButtonStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.abs(translateX.value) / 40),
  }))

  if (type === 'player' && player) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.removeButton, removeButtonStyle]}>
          <Ionicons name="trash-outline" size={16} color="#fff" />
        </Animated.View>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.pill, { backgroundColor: colors.surface }, animatedStyle]}>
            {player.headshot_url ? (
              <Image source={{ uri: player.headshot_url }} style={styles.headshot} contentFit="cover" />
            ) : (
              <View style={[styles.headshot, styles.headshotPlaceholder, { backgroundColor: teamColor }]}>
                <Text style={styles.headshotInitial}>{player.full_name.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {player.full_name}
              </Text>
              <Text style={[styles.position, { color: colors.textMuted }]}>
                {player.position}
              </Text>
            </View>
            <Pressable onPress={handleRemove} hitSlop={8} style={styles.removeIcon}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>
    )
  }

  if (type === 'pick' && pick) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.removeButton, removeButtonStyle]}>
          <Ionicons name="trash-outline" size={16} color="#fff" />
        </Animated.View>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.pill, { backgroundColor: colors.surface }, animatedStyle]}>
            <View style={[styles.pickBadge, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.pickRound}>R{pick.round}</Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {pick.year} Round {pick.round}
              </Text>
              {pick.condition && (
                <Text style={[styles.position, { color: colors.textMuted }]} numberOfLines={1}>
                  {pick.condition}
                </Text>
              )}
            </View>
            <Pressable onPress={handleRemove} hitSlop={8} style={styles.removeIcon}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>
    )
  }

  if (type === 'prospect' && prospect) {
    const rank = prospect.org_rank || prospect.team_rank || prospect.rank || 0
    const level = prospect.current_level || prospect.level || ''
    const levelColor = LEVEL_COLORS[level] || '#22c55e'
    const initials = prospect.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

    return (
      <View style={styles.container}>
        <Animated.View style={[styles.removeButton, removeButtonStyle]}>
          <Ionicons name="trash-outline" size={16} color="#fff" />
        </Animated.View>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.pill, styles.prospectPill, { backgroundColor: colors.surface }, animatedStyle]}>
            {/* Rank badge */}
            <View style={[styles.prospectRankBadge, { backgroundColor: rank <= 5 ? '#dc2626' : levelColor }]}>
              <Text style={styles.prospectRankText}>#{rank}</Text>
            </View>
            {/* Avatar */}
            {prospect.headshot_url ? (
              <Image source={{ uri: prospect.headshot_url }} style={styles.headshot} contentFit="cover" />
            ) : (
              <View style={[styles.headshot, styles.headshotPlaceholder, { backgroundColor: `${levelColor}40` }]}>
                <Text style={[styles.headshotInitial, { color: levelColor }]}>{initials}</Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {prospect.name}
              </Text>
              <View style={styles.prospectMeta}>
                {level && (
                  <View style={[styles.levelBadge, { backgroundColor: `${levelColor}20` }]}>
                    <Text style={[styles.levelText, { color: levelColor }]}>{level}</Text>
                  </View>
                )}
                <Text style={[styles.position, { color: colors.textMuted }]}>
                  {prospect.position}
                </Text>
              </View>
            </View>
            <Pressable onPress={handleRemove} hitSlop={8} style={styles.removeIcon}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>
    )
  }

  return null
})

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 6,
  },
  removeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  prospectPill: {
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
  },
  headshot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headshotPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headshotInitial: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  info: {
    flex: 1,
    marginLeft: 8,
  },
  name: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
  },
  position: {
    fontSize: 10,
    fontFamily: 'Montserrat-Regular',
    marginTop: 1,
  },
  removeIcon: {
    padding: 4,
  },
  pickBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickRound: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
  },
  // Prospect-specific styles
  prospectRankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  prospectRankText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Montserrat-Bold',
  },
  prospectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  levelBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  levelText: {
    fontSize: 9,
    fontFamily: 'Montserrat-Bold',
  },
})

export default TradeAssetPill
