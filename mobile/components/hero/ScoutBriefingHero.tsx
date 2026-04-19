import React from 'react'
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  Interactive,
} from '@/lib/design-tokens'
import type { ScoutBriefingHeroData } from './MobileHero'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning, Chicago'
  if (hour < 17) return 'Good afternoon, Chicago'
  return 'Good evening, Chicago'
}

const DEFAULT_QUICK_ACTIONS = ['Bears rumors', 'Cubs lineup', 'Bulls trade buzz']

// ─── Component ───────────────────────────────────────────────────────────────

interface ScoutBriefingHeroProps {
  data: ScoutBriefingHeroData
  onSearch?: (query: string) => void
  onQuickAction?: (action: string) => void
}

export function ScoutBriefingHero({
  data,
  onSearch,
  onQuickAction,
}: ScoutBriefingHeroProps) {
  const { colors, isDark } = useTheme()
  const quickActions = data.quickActions?.length
    ? data.quickActions.slice(0, 3)
    : DEFAULT_QUICK_ACTIONS

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.surfaceElevated : colors.surface },
      ]}
    >
      {/* Scout avatar + greeting */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/scout-mobile.png')}
          style={styles.scoutAvatar}
          contentFit="contain"
        />
        <Text style={[styles.greeting, { color: colors.text }]}>
          {getGreeting()}
        </Text>
      </View>

      {/* Search input */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(11,15,20,0.04)',
            borderColor: isDark
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(11,15,20,0.08)',
          },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Ask Scout anything..."
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          onSubmitEditing={(e) => onSearch?.(e.nativeEvent.text)}
        />
      </View>

      {/* Quick action chips */}
      <View style={styles.quickActions}>
        {quickActions.map((action, index) => (
          <Pressable
            key={index}
            onPress={() => onQuickAction?.(action)}
            style={({ pressed }) => [
              styles.actionChip,
              {
                backgroundColor: isDark
                  ? 'rgba(0,212,255,0.1)'
                  : 'rgba(0,212,255,0.06)',
                borderColor: isDark
                  ? 'rgba(0,212,255,0.2)'
                  : 'rgba(0,212,255,0.15)',
              },
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={[styles.actionChipText, { color: Colors.edgeCyan }]}>
              {action}
            </Text>
          </Pressable>
        ))}
      </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  scoutAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.md,
  },
  greeting: {
    fontSize: FontSize.sectionTitle,
    fontWeight: FontWeight.bold,
    lineHeight: 28,
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    minHeight: Interactive.buttonHeight,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: FontWeight.regular,
    paddingVertical: Spacing.sm,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: Interactive.chipHeight,
    justifyContent: 'center',
  },
  chipPressed: {
    opacity: 0.8,
  },
  actionChipText: {
    fontSize: FontSize.label,
    fontWeight: FontWeight.medium,
  },
})
