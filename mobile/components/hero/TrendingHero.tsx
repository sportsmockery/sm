import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useTheme } from '@/hooks/useTheme'
import { Colors, FontSize, FontWeight, Spacing, Card } from '@/lib/design-tokens'
import type { TrendingHeroData } from './MobileHero'

// ─── Category badge colors ───────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  BREAKING: Colors.primary,
  RUMOR: Colors.primary,
  ANALYSIS: Colors.edgeCyan,
}

// ─── Component ───────────────────────────────────────────────────────────────

interface TrendingHeroProps {
  data: TrendingHeroData
  onPress?: (articleId: string) => void
}

export function TrendingHero({ data, onPress }: TrendingHeroProps) {
  const { colors } = useTheme()

  const badgeColor = CATEGORY_COLORS[data.category] ?? Colors.primary

  return (
    <Pressable
      onPress={() => onPress?.(data.articleId)}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.surfaceElevated },
        pressed && styles.pressed,
      ]}
    >
      {/* Full-bleed background image */}
      <Image
        source={{ uri: data.imageUrl }}
        style={styles.backgroundImage}
        contentFit="cover"
        transition={200}
      />

      {/* Dark gradient overlay at bottom */}
      <View style={styles.gradientOverlay} />

      {/* Category badge — top left */}
      <View style={[styles.categoryBadge, { backgroundColor: badgeColor }]}>
        <Text style={styles.categoryText}>{data.category}</Text>
      </View>

      {/* Team logo — top right */}
      {data.teamLogo ? (
        <Image
          source={{ uri: data.teamLogo }}
          style={styles.teamLogo}
          contentFit="contain"
        />
      ) : null}

      {/* Headline — bottom */}
      <View style={styles.headlineContainer}>
        <Text style={styles.headline} numberOfLines={3}>
          {data.headline}
        </Text>
      </View>
    </Pressable>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    minHeight: 250,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  pressed: {
    opacity: 0.95,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,15,20,0.55)',
    // Heavier at bottom via a layered approach
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
    zIndex: 2,
  },
  categoryText: {
    color: Colors.white,
    fontSize: FontSize.badge,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  teamLogo: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    width: 36,
    height: 36,
    zIndex: 2,
  },
  headlineContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.section,
    zIndex: 2,
  },
  headline: {
    color: Colors.white,
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    lineHeight: 36,
  },
})
