/**
 * ProspectCard - MLB Prospect card for trade simulator
 */

import React, { memo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import type { MLBProspect } from '@/lib/gm-types'

interface ProspectCardProps {
  prospect: MLBProspect
  selected: boolean
  teamColor: string
  onPress: () => void
}

// Level colors for visual distinction
const LEVEL_COLORS: Record<string, string> = {
  'AAA': '#22c55e',
  'AA': '#3b82f6',
  'A+': '#8b5cf6',
  'A': '#a855f7',
  'R': '#f59e0b',
  'Rk': '#f59e0b',
}

// Grade colors for prospect badges
const GRADE_COLORS: Record<string, string> = {
  'A+': '#22c55e',
  'A': '#22c55e',
  'A-': '#22c55e',
  'B+': '#3b82f6',
  'B': '#3b82f6',
  'B-': '#3b82f6',
  'C+': '#f59e0b',
  'C': '#f59e0b',
  'C-': '#f59e0b',
  'D': '#ef4444',
}

function ProspectCardComponent({ prospect, selected, teamColor, onPress }: ProspectCardProps) {
  const { colors, isDark } = useTheme()

  // Support both field naming conventions
  const level = prospect.current_level || prospect.level || ''
  const rank = prospect.org_rank || prospect.team_rank || prospect.rank || 0
  const isTopProspect = rank <= 5

  const levelColor = LEVEL_COLORS[level] || '#6b7280'
  const gradeColor = GRADE_COLORS[prospect.prospect_grade] || '#6b7280'

  // Generate initials for avatar placeholder
  const initials = prospect.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: selected
            ? `${teamColor}15`
            : isDark ? '#1f2937' : '#ffffff',
          borderColor: selected ? teamColor : colors.border,
          borderWidth: selected ? 2 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Rank Badge */}
      {rank > 0 && (
        <View style={[
          styles.rankBadge,
          { backgroundColor: isTopProspect ? '#dc2626' : teamColor },
        ]}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
      )}

      {/* Avatar */}
      <View style={[styles.avatar, { borderColor: `${levelColor}40`, backgroundColor: `${levelColor}20` }]}>
        {prospect.headshot_url ? (
          <Image
            source={{ uri: prospect.headshot_url }}
            style={styles.avatarImage}
            contentFit="cover"
          />
        ) : (
          <Text style={[styles.avatarInitials, { color: levelColor }]}>{initials}</Text>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {prospect.name}
        </Text>
        <View style={styles.metaRow}>
          {/* Level badge */}
          <View style={[styles.levelBadge, { backgroundColor: `${levelColor}20` }]}>
            <Text style={[styles.levelText, { color: levelColor }]}>{level}</Text>
          </View>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {prospect.position}
          </Text>
          {prospect.age && (
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              Age {prospect.age}
            </Text>
          )}
        </View>

        {/* Valuation row */}
        {(prospect.prospect_fv_bucket || prospect.prospect_tier || prospect.prospect_surplus_value_millions) && (
          <View style={styles.valuationRow}>
            {prospect.prospect_fv_bucket && (
              <View style={[styles.fvBadge, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]}>
                <Text style={[styles.fvText, { color: colors.textMuted }]}>
                  FV {prospect.prospect_fv_bucket}
                </Text>
              </View>
            )}
            {prospect.prospect_tier && (
              <View style={[styles.tierBadge, { backgroundColor: `${getTierColor(prospect.prospect_tier)}20` }]}>
                <Text style={[styles.tierText, { color: getTierColor(prospect.prospect_tier) }]}>
                  {prospect.prospect_tier}
                </Text>
              </View>
            )}
            {prospect.prospect_surplus_value_millions && (
              <Text style={styles.surplusText}>
                ${prospect.prospect_surplus_value_millions.toFixed(1)}M
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Right side badges */}
      <View style={styles.badges}>
        {prospect.prospect_grade && (
          <View style={[styles.gradeBadge, { backgroundColor: `${gradeColor}20` }]}>
            <Text style={[styles.gradeText, { color: gradeColor }]}>
              {prospect.prospect_grade}
            </Text>
          </View>
        )}
        {prospect.trade_value && (
          <View style={[
            styles.tvBadge,
            {
              backgroundColor: prospect.trade_value >= 80 ? '#dc262620' : `${teamColor}20`,
            },
          ]}>
            <Text style={[
              styles.tvText,
              { color: prospect.trade_value >= 80 ? '#dc2626' : teamColor },
            ]}>
              TV: {prospect.trade_value}
            </Text>
          </View>
        )}
        {prospect.eta && (
          <Text style={[styles.etaText, { color: colors.textMuted }]}>
            ETA {prospect.eta}
          </Text>
        )}
      </View>

      {/* Selected checkmark */}
      {selected && (
        <View style={[styles.checkmark, { backgroundColor: teamColor }]}>
          <Ionicons name="checkmark" size={12} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  )
}

function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    'elite': '#dc2626',
    'plus': '#22c55e',
    'average': '#3b82f6',
    'organizational': '#9ca3af',
  }
  return colors[tier] || '#9ca3af'
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  rankBadge: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  rankText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levelText: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
  valuationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  fvBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  fvText: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
  },
  tierBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  tierText: {
    fontSize: 10,
    fontFamily: 'Montserrat-SemiBold',
    textTransform: 'capitalize',
  },
  surplusText: {
    fontSize: 10,
    fontFamily: 'Montserrat-SemiBold',
    color: '#22c55e',
  },
  badges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gradeText: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
  },
  tvBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tvText: {
    fontSize: 10,
    fontFamily: 'Montserrat-SemiBold',
  },
  etaText: {
    fontSize: 10,
    fontFamily: 'Montserrat-Medium',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default memo(ProspectCardComponent)
