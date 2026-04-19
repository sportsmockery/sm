import { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { COLORS } from '@/lib/config'
import { Colors, FontSize, FontWeight, Spacing, Card, Interactive } from '@/lib/design-tokens'
import EdgeFeaturesCard from '@/components/EdgeFeaturesCard'

const scoutIcon = require('@/assets/images/scout-mobile.png')

const QUICK_CHIPS = [
  { label: 'Bears rumors', query: 'What are the latest Bears rumors?' },
  { label: 'Cubs outlook', query: "What's the Cubs outlook for this season?" },
  { label: 'Bulls debate', query: 'Should the Bulls trade Zach LaVine?' },
  { label: 'Sox rebuild', query: 'How is the White Sox rebuild going?' },
  { label: 'Hawks prospects', query: 'Who are the top Blackhawks prospects?' },
]


export default function DiscoverScreen() {
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return
    router.push({ pathname: '/search', params: { q: searchQuery.trim() } })
  }, [searchQuery, router])

  const handleChip = useCallback((query: string) => {
    router.push({ pathname: '/search', params: { q: query } })
  }, [router])

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Discover</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: isDark ? '#141A22' : '#F3F4F6' }]}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Ask Scout anything..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Scout Quick Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          <Image source={scoutIcon} style={styles.scoutChipIcon} contentFit="contain" />
          {QUICK_CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip.label}
              style={[styles.chip, { backgroundColor: isDark ? '#141A22' : '#F3F4F6', borderColor: colors.border }]}
              onPress={() => handleChip(chip.query)}
            >
              <Text style={[styles.chipText, { color: colors.text }]}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SM EDGE Features — matches test.sportsmockery.com sidebar */}
        <View style={styles.edgeFeaturesWrapper}>
          <EdgeFeaturesCard />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: FontSize.sectionTitle,
    fontWeight: FontWeight.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: Card.borderRadius,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.bodySmall,
    fontWeight: FontWeight.regular,
  },
  chipsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  scoutChipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: FontSize.meta,
    fontWeight: FontWeight.medium,
  },
  edgeFeaturesWrapper: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
})
