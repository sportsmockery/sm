import React, { ReactNode } from 'react'
import { View, StyleSheet } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { Card, Spacing, getTeamAccent, Colors } from '@/lib/design-tokens'

interface TeamAccentBorderProps {
  team?: string
  children: ReactNode
}

export default function TeamAccentBorder({ team, children }: TeamAccentBorderProps) {
  const { colors, isDark } = useTheme()
  const accentColor = team ? getTeamAccent(team) : undefined

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: accentColor ?? colors.border,
          borderLeftWidth: accentColor ? Card.accentBorderWidth : 1,
        },
      ]}
    >
      {team && (
        <View
          style={[
            styles.teamBadge,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(11,15,20,0.04)',
            },
          ]}
        >
          <View
            style={[
              styles.teamDot,
              { backgroundColor: accentColor ?? Colors.primary },
            ]}
          />
        </View>
      )}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Card.borderRadius,
    borderWidth: 1,
    padding: Card.padding,
    overflow: 'hidden',
  },
  teamBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
})
