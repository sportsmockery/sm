/**
 * Haptic feedback utility hook for GM Trade Simulator
 * Provides consistent haptic feedback across the app
 */

import { Platform } from 'react-native'
import * as Haptics from 'expo-haptics'

export type HapticFeedbackType =
  | 'selection'    // Light tap for selections
  | 'success'      // Success notification
  | 'warning'      // Warning notification
  | 'error'        // Error notification
  | 'impact_light' // Light impact
  | 'impact_medium'// Medium impact
  | 'impact_heavy' // Heavy impact

/**
 * Hook for triggering haptic feedback
 * Only works on iOS - Android haptics are handled differently
 */
export function useHaptics() {
  const trigger = async (type: HapticFeedbackType = 'selection') => {
    // Haptics only work on iOS
    if (Platform.OS !== 'ios') return

    try {
      switch (type) {
        case 'selection':
          await Haptics.selectionAsync()
          break
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          break
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
          break
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
          break
        case 'impact_light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          break
        case 'impact_medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          break
        case 'impact_heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
          break
      }
    } catch (e) {
      // Silently fail if haptics not available
    }
  }

  return { trigger }
}

// Standalone function for use outside of React components
export async function triggerHaptic(type: HapticFeedbackType = 'selection') {
  if (Platform.OS !== 'ios') return

  try {
    switch (type) {
      case 'selection':
        await Haptics.selectionAsync()
        break
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        break
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        break
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        break
      case 'impact_light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        break
      case 'impact_medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        break
      case 'impact_heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        break
    }
  } catch (e) {
    // Silently fail
  }
}
