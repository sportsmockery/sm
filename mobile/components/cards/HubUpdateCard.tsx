import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import { Colors, FontSize, FontWeight, Spacing } from '@/lib/design-tokens'
import TeamAccentBorder from './TeamAccentBorder'

interface HubUpdateCardProps {
  team?: string
  status: 'LIVE' | 'NEW' | 'UPDATED'
  text: string
  takeaway?: string
  onPress?: () => void
}

const STATUS_CONFIG: Record<string, { color: string; icon: string }> = {
  LIVE: { color: '#22c55e', icon: 'ellipse' },
  NEW: { color: '#00D4FF', icon: 'sparkles' },
  UPDATED: { color: '#D6B05E', icon: 'refresh' },
}

export default function HubUpdateCard({
  team,
  status,
  text,
  takeaway,
  onPress,
}: HubUpdateCardProps) {
  const { colors } = useTheme()
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.NEW

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={!onPress}>
      <TeamAccentBorder team={team}>
        <View style={styles.header}>
          <View style={[styles.statusDot, { backgroundColor: config.color }]} />
          <Text style={[styles.statusLabel, { color: config.color }]}>{status}</Text>
        </View>

        <Text style={[styles.text, { color: colors.text }]}>{text}</Text>

        {takeaway && (
          <Text style={[styles.takeaway, { color: colors.textSecondary }]}>
            {takeaway}
          </Text>
        )}

        {onPress && (
          <View style={styles.linkRow}>
            <Text style={[styles.link, { color: Colors.edgeCyan }]}>
              View Full Update
            </Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.edgeCyan} />
          </View>
        )}
      </TeamAccentBorder>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: FontSize.badge,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  text: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.medium,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  takeaway: {
    fontSize: FontSize.label,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  link: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.medium,
  },
})
