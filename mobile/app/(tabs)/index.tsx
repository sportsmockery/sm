import { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { Link, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useFeed } from '@/hooks/useFeed'
import { useTheme } from '@/hooks/useTheme'
import { useAds } from '@/hooks/useAds'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { Post, RiverItem } from '@/lib/api'
import { TEAMS, COLORS } from '@/lib/config'
import ArticleCard from '@/components/ArticleCard'
import AdBanner from '@/components/AdBanner'
import MiniPlayer from '@/components/MiniPlayer'
import RiverItemCard from '@/components/RiverItemCard'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function HomeScreen() {
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const { getCustomAdCode } = useAds()
  const { currentArticle: playingArticle } = useAudioPlayer()
  const {
    riverItems,
    isLoading,
    isRefetching,
    refresh,
    markAsViewed,
  } = useFeed()

  const handleArticlePress = useCallback(
    (post: Post) => {
      markAsViewed(post.id)
      router.push(`/article/${post.id}`)
    },
    [router, markAsViewed]
  )

  const handleRiverItemPress = useCallback(
    (postId: number) => {
      markAsViewed(postId)
      router.push(`/article/${postId}`)
    },
    [router, markAsViewed]
  )

  const renderRiverItem = useCallback(
    ({ item }: { item: RiverItem }) => (
      <RiverItemCard item={item} onPress={handleRiverItemPress} />
    ),
    [handleRiverItemPress]
  )

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Loading latest news...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {/* Empty spacer for balance */}
        <View style={styles.headerSpacer} />

        {/* Centered Logo */}
        <Image
          source={isDark ? require('@/assets/images/light_logo.png') : require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />

        {/* Search Icon */}
        <TouchableOpacity
          onPress={() => router.push('/search')}
          style={styles.searchButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Mini Player or Listen Now Banner */}
      {playingArticle ? (
        <MiniPlayer />
      ) : (
        <TouchableOpacity
          style={styles.listenBanner}
          onPress={() => router.push('/listen')}
          activeOpacity={0.8}
        >
          <Ionicons name="play" size={18} color="#fff" />
          <Text style={styles.listenBannerText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            Listen Now: Hands-free Chicago sports coverage
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
      )}

      <FlatList
        data={riverItems}
        keyExtractor={(item) => item.id}
        renderItem={renderRiverItem}
        contentContainerStyle={styles.riverContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListHeaderComponent={
          getCustomAdCode('feed_top') ? (
            <AdBanner code={getCustomAdCode('feed_top')!} placement="feed_top" />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No stories right now. Pull down to refresh.
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 24 }} />}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={11}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  riverContent: {
    padding: 12,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerSpacer: {
    width: 24,
  },
  logo: {
    width: 140,
    height: 32,
  },
  searchButton: {
    padding: 4,
  },
  listenBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#bc0000',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  listenBannerText: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  featuredContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 60,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  featuredBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 1,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    lineHeight: 26,
  },
  featuredMeta: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginTop: 8,
  },
  section: {
    marginTop: 12,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  teamsScroll: {
    paddingHorizontal: 12,
  },
  teamChip: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  teamLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogoImage: {
    width: 36,
    height: 36,
  },
  teamName: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
  },
  teamSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  teamSectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamSectionLogo: {
    width: 28,
    height: 28,
  },
  seeAllLink: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  horizontalScroll: {
    paddingHorizontal: 12,
  },
})
