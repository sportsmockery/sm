import React, { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useTheme } from '@/hooks/useTheme'
import { Colors, FontSize, FontWeight, Spacing } from '@/lib/design-tokens'
import type { GameDayHeroData } from './MobileHero'

interface GameDayHeroProps {
  data: GameDayHeroData
}

export function GameDayHero({ data }: GameDayHeroProps) {
  const { colors, isDark } = useTheme()
  const livePulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!data.isLive) return
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(livePulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [data.isLive, livePulse])

  const hasScore = data.homeTeam.score != null && data.awayTeam.score != null

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.surfaceElevated : colors.surface },
      ]}
    >
      {/* LIVE badge or game time */}
      <View style={styles.statusRow}>
        {data.isLive ? (
          <View style={styles.liveBadge}>
            <Animated.View
              style={[styles.liveDot, { opacity: livePulse }]}
            />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        ) : data.gameTime ? (
          <Text style={[styles.gameTime, { color: colors.textMuted }]}>
            {data.gameTime}
          </Text>
        ) : null}
      </View>

      {/* Matchup: logo vs logo */}
      <View style={styles.matchup}>
        {/* Away team */}
        <View style={styles.teamSide}>
          <Image
            source={{ uri: data.awayTeam.logo }}
            style={styles.teamLogo}
            contentFit="contain"
          />
          <Text
            style={[styles.teamName, { color: colors.text }]}
            numberOfLines={1}
          >
            {data.awayTeam.name}
          </Text>
        </View>

        {/* Score or VS */}
        <View style={styles.centerBlock}>
          {hasScore ? (
            <Text style={[styles.score, { color: colors.text }]}>
              {data.awayTeam.score} - {data.homeTeam.score}
            </Text>
          ) : (
            <Text style={[styles.vs, { color: colors.textMuted }]}>VS</Text>
          )}
        </View>

        {/* Home team */}
        <View style={styles.teamSide}>
          <Image
            source={{ uri: data.homeTeam.logo }}
            style={styles.teamLogo}
            contentFit="contain"
          />
          <Text
            style={[styles.teamName, { color: colors.text }]}
            numberOfLines={1}
          >
            {data.homeTeam.name}
          </Text>
        </View>
      </View>

      {/* Storyline */}
      {data.storyline ? (
        <Text
          style={[styles.storyline, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {data.storyline}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: 250,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusRow: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.12)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: Spacing.sm,
  },
  liveText: {
    color: '#22c55e',
    fontSize: FontSize.badge,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  gameTime: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.5,
  },
  matchup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: Spacing.lg,
  },
  teamSide: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogo: {
    width: 64,
    height: 64,
    marginBottom: Spacing.sm,
  },
  teamName: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  centerBlock: {
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  score: {
    fontSize: FontSize.heroLarge,
    fontWeight: FontWeight.bold,
  },
  vs: {
    fontSize: FontSize.sectionTitle,
    fontWeight: FontWeight.bold,
    letterSpacing: 2,
  },
  storyline: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.regular,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
})
