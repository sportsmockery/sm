import { memo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import type { RiverItem } from '@/lib/api'

interface RiverItemCardProps {
  item: RiverItem
  onPress?: (postId: number) => void
}

function getEditorialPostId(data: Record<string, unknown>): number | null {
  const raw = data.postId
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string' && /^\d+$/.test(raw)) return parseInt(raw, 10)
  return null
}

function RiverItemCardComponent({ item, onPress }: RiverItemCardProps) {
  const { colors } = useTheme()

  const isEditorial = item.type === 'editorial' || item.type === 'trending_article'
  const data = item.data
  const headline = (data.headline as string) || (data.title as string) || ''
  const summary = (data.summary as string) || (data.excerpt as string) || ''
  const insight = (data.insight as string) || ''
  const featuredImage = (data.featuredImage as string) || (data.image as string) || ''
  const authorName =
    (data.author_name as string) || ((data.author as any)?.name as string) || 'Sports Mockery'
  const breakingIndicator = (data.breakingIndicator as string) || ''
  const postId = getEditorialPostId(data)

  const handlePress = () => {
    if (isEditorial && postId && onPress) onPress(postId)
  }

  return (
    <TouchableOpacity
      activeOpacity={isEditorial && postId ? 0.85 : 1}
      onPress={handlePress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderLeftColor: item.teamColor || colors.border,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Top row: team + timestamp */}
      <View style={styles.topRow}>
        <View style={[styles.teamPill, { backgroundColor: item.teamColor || colors.border }]}>
          <Text style={styles.teamPillText}>{item.team}</Text>
        </View>
        <Text style={[styles.timestamp, { color: colors.textMuted }]}>{item.timestamp}</Text>
      </View>

      {/* Editorial / trending_article */}
      {isEditorial && (
        <>
          {breakingIndicator ? (
            <Text style={[styles.breakingBadge, { color: '#BC0000' }]}>{breakingIndicator}</Text>
          ) : null}
          {!!headline && (
            <Text style={[styles.headline, { color: colors.text }]} numberOfLines={3}>
              {headline}
            </Text>
          )}
          {!!featuredImage && (
            <Image
              source={{ uri: featuredImage }}
              style={styles.featuredImage}
              contentFit="cover"
              transition={200}
            />
          )}
          {!!summary && (
            <Text style={[styles.summary, { color: colors.textMuted }]} numberOfLines={4}>
              {summary}
            </Text>
          )}
          {!!insight && (
            <View style={[styles.insightBox, { borderLeftColor: '#00D4FF' }]}>
              <Text style={styles.insightLabel}>SCOUT INSIGHT</Text>
              <Text style={[styles.insightText, { color: colors.text }]}>{insight}</Text>
            </View>
          )}
          <Text style={[styles.author, { color: colors.textMuted }]}>By {authorName}</Text>
        </>
      )}

      {/* Fallback for non-editorial types — just a labeled headline if available */}
      {!isEditorial && (
        <View style={styles.fallback}>
          <View style={styles.fallbackHeader}>
            <Ionicons
              name={iconForType(item.type)}
              size={16}
              color={colors.textMuted}
            />
            <Text style={[styles.fallbackType, { color: colors.textMuted }]}>
              {labelForType(item.type)}
            </Text>
          </View>
          {!!headline && (
            <Text style={[styles.headline, { color: colors.text }]} numberOfLines={3}>
              {headline}
            </Text>
          )}
          {!!summary && (
            <Text style={[styles.summary, { color: colors.textMuted }]} numberOfLines={3}>
              {summary}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  )
}

function iconForType(type: RiverItem['type']): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'poll':
      return 'bar-chart-outline'
    case 'chart':
      return 'analytics-outline'
    case 'hub_update':
      return 'newspaper-outline'
    case 'box_score':
      return 'football-outline'
    case 'trade_proposal':
      return 'swap-horizontal-outline'
    case 'scout_summary':
      return 'sparkles-outline'
    case 'debate':
      return 'chatbubbles-outline'
    case 'video':
      return 'play-circle-outline'
    default:
      return 'ellipse-outline'
  }
}

function labelForType(type: RiverItem['type']): string {
  switch (type) {
    case 'poll':
      return 'POLL'
    case 'chart':
      return 'CHART'
    case 'hub_update':
      return 'HUB UPDATE'
    case 'box_score':
      return 'BOX SCORE'
    case 'trade_proposal':
      return 'TRADE PROPOSAL'
    case 'scout_summary':
      return 'SCOUT SUMMARY'
    case 'debate':
      return 'DEBATE'
    case 'video':
      return 'VIDEO'
    default:
      return type.toUpperCase()
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  teamPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  teamPillText: {
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: 0.3,
    color: '#FAFAFB',
  },
  timestamp: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
  breakingBadge: {
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  headline: {
    fontSize: 17,
    fontFamily: 'Montserrat-Bold',
    lineHeight: 22,
    marginBottom: 10,
  },
  featuredImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#0B0F1422',
  },
  summary: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 20,
    marginBottom: 10,
  },
  insightBox: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  insightLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: '#00D4FF',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 18,
  },
  author: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
  },
  fallback: {
    gap: 6,
  },
  fallbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  fallbackType: {
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
  },
})

export default memo(RiverItemCardComponent)
