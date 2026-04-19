import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useTheme } from '@/hooks/useTheme'
import { Colors, FontSize, FontWeight, Spacing, Card, Interactive } from '@/lib/design-tokens'

interface ScoutAnalysisCardProps {
  text: string
  onPress?: () => void
}

export default function ScoutAnalysisCard({ text, onPress }: ScoutAnalysisCardProps) {
  const { colors } = useTheme()

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={!onPress}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.surfaceHighlight,
            borderLeftColor: Colors.edgeCyan,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/scout-mobile.png')}
            style={styles.avatar}
            contentFit="contain"
          />
          <Text style={[styles.label, { color: Colors.edgeCyan }]}>SCOUT ANALYSIS</Text>
        </View>

        <Text style={[styles.text, { color: colors.textSecondary }]}>{text}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Card.borderRadius,
    borderWidth: 1,
    borderLeftWidth: Card.accentBorderWidth,
    padding: Card.padding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: Interactive.avatarSmall,
    height: Interactive.avatarSmall,
    borderRadius: Interactive.avatarSmall / 2,
  },
  label: {
    fontSize: FontSize.badge,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  text: {
    fontSize: FontSize.bodySmall,
    lineHeight: 22,
  },
})
