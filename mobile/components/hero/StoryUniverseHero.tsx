import React from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { useTheme } from '@/hooks/useTheme'
import { Colors, FontSize, FontWeight, Spacing, Card } from '@/lib/design-tokens'
import type { StoryUniverseHeroData } from './MobileHero'

interface StoryUniverseHeroProps {
  data: StoryUniverseHeroData
  onPressStory?: (articleId: string) => void
}

export function StoryUniverseHero({ data, onPressStory }: StoryUniverseHeroProps) {
  const { colors, isDark } = useTheme()

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.surfaceElevated : colors.surface },
      ]}
    >
      {/* Label */}
      <View style={styles.labelRow}>
        <View style={[styles.labelDot, { backgroundColor: Colors.edgeCyan }]} />
        <Text style={[styles.label, { color: colors.textMuted }]}>
          STORY UNIVERSE
        </Text>
      </View>

      {/* Main story card */}
      <Pressable
        onPress={() => onPressStory?.(data.mainStory.articleId)}
        style={({ pressed }) => [
          styles.mainCard,
          {
            backgroundColor: isDark ? colors.surfaceHighlight : colors.surfaceElevated,
            borderColor: colors.border,
          },
          pressed && styles.pressed,
        ]}
      >
        <Image
          source={{ uri: data.mainStory.imageUrl }}
          style={styles.mainImage}
          contentFit="cover"
          transition={200}
        />
        <Text
          style={[styles.mainHeadline, { color: colors.text }]}
          numberOfLines={2}
        >
          {data.mainStory.headline}
        </Text>
      </Pressable>

      {/* Related story chips */}
      {data.relatedStories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {data.relatedStories.slice(0, 2).map((story, index) => (
            <Pressable
              key={story.articleId}
              onPress={() => onPressStory?.(story.articleId)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: isDark
                    ? colors.surfaceHighlight
                    : colors.surfaceElevated,
                  borderColor: colors.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[styles.chipText, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {story.headline}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: 250,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  label: {
    fontSize: FontSize.badge,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  mainCard: {
    borderRadius: Card.borderRadius,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  mainImage: {
    width: '100%',
    height: 130,
  },
  mainHeadline: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.medium,
    lineHeight: 24,
    padding: Spacing.md,
  },
  pressed: {
    opacity: 0.9,
  },
  chipsContainer: {
    gap: Spacing.sm,
  },
  chip: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    width: 180,
  },
  chipText: {
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.regular,
    lineHeight: 20,
  },
})
