import { useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { Image } from 'expo-image'

import { Post } from '@/lib/api'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const HERO_HEIGHT = Math.round(SCREEN_WIDTH * 0.62)

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `${Math.max(1, mins)}m ago`
  if (hrs < 24) return `${hrs}h ago`
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

interface TrendingHeroProps {
  post: Post
  onPress: (post: Post) => void
}

// Match the web hero: only treat as TRENDING if published within last 48h.
const TRENDING_FRESHNESS_MS = 48 * 60 * 60 * 1000

export default function TrendingHero({ post, onPress }: TrendingHeroProps) {
  const handlePress = useCallback(() => onPress(post), [onPress, post])

  if (!post.featured_image) return null

  const ageMs = Date.now() - new Date(post.published_at).getTime()
  if (!Number.isFinite(ageMs) || ageMs > TRENDING_FRESHNESS_MS) return null

  const team = post.category?.name || 'Chicago Sports'
  const meta = [team, timeAgo(post.published_at)]
    .filter(Boolean)
    .join('  ·  ')

  return (
    <TouchableOpacity activeOpacity={0.92} onPress={handlePress} style={styles.container}>
      <Image
        source={{ uri: post.featured_image }}
        style={styles.image}
        contentFit="cover"
        transition={250}
        cachePolicy="memory-disk"
      />
      <View style={styles.overlay} pointerEvents="none" />
      <View style={styles.content} pointerEvents="none">
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>TRENDING</Text>
        </View>
        <Text style={styles.title} numberOfLines={3}>
          {post.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: HERO_HEIGHT,
    position: 'relative',
    backgroundColor: '#0B0F14',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(11,15,20,0.55)',
  },
  content: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#BC0000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginBottom: 10,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FAFAFB',
  },
  badgeText: {
    color: '#FAFAFB',
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 1,
  },
  title: {
    color: '#FAFAFB',
    fontSize: 22,
    lineHeight: 28,
    fontFamily: 'Montserrat-Bold',
  },
  meta: {
    color: 'rgba(250,250,251,0.75)',
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    marginTop: 8,
    letterSpacing: 0.3,
  },
})
