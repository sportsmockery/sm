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
import type { PlayerData, DraftPick } from '@/lib/gm-types'

interface TradeAssetPillProps {
  type: 'player' | 'pick'
  player?: PlayerData
  pick?: DraftPick
  teamColor: string
  onRemove: () => void
}

const SWIPE_THRESHOLD = -60

export const TradeAssetPill = memo(function TradeAssetPill({
  type,
  player,
  pick,
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
})

export default TradeAssetPill
