/**
 * ValidationBadge - Trade status indicator
 * Shows validation state with color-coded indicator
 */

import React, { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { COLORS } from '@/lib/config'

export type ValidationStatus = 'empty' | 'incomplete' | 'warning' | 'valid' | 'grading'

interface ValidationBadgeProps {
  status: ValidationStatus
  compact?: boolean
}

const STATUS_CONFIG = {
  empty: {
    color: '#9ca3af',
    icon: 'ellipse-outline' as const,
    label: 'Add players to start',
  },
  incomplete: {
    color: '#f59e0b',
    icon: 'alert-circle' as const,
    label: 'Select opponent',
  },
  warning: {
    color: '#f59e0b',
    icon: 'warning' as const,
    label: 'Trade has issues',
  },
  valid: {
    color: '#22c55e',
    icon: 'checkmark-circle' as const,
    label: 'Ready to grade',
  },
  grading: {
    color: COLORS.primary,
    icon: 'sync' as const,
    label: 'Grading...',
  },
}

export const ValidationBadge = memo(function ValidationBadge({
  status,
  compact = false,
}: ValidationBadgeProps) {
  const { colors } = useTheme()
  const config = STATUS_CONFIG[status]

  // Pulse animation for valid state
  const scale = useSharedValue(1)

  React.useEffect(() => {
    if (status === 'valid') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      )
    } else if (status === 'grading') {
      scale.value = withRepeat(
        withTiming(0.9, { duration: 300 }),
        -1,
        true
      )
    } else {
      scale.value = withTiming(1)
    }
  }, [status, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  if (compact) {
    return (
      <Animated.View style={[styles.dot, { backgroundColor: config.color }, animatedStyle]} />
    )
  }

  return (
    <View style={styles.badge}>
      <Animated.View style={animatedStyle}>
        <Ionicons name={config.icon} size={14} color={config.color} />
      </Animated.View>
      <Text style={[styles.label, { color: colors.textMuted }]}>{config.label}</Text>
    </View>
  )
})

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
})

export default ValidationBadge
