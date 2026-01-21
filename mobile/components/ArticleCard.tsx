import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import { Post } from '@/lib/api'
import { useTheme } from '@/hooks/useTheme'
import { COLORS } from '@/lib/config'

interface ArticleCardProps {
  post: Post
  onPress: () => void
  variant?: 'standard' | 'compact' | 'horizontal'
  width?: number
  showDivider?: boolean
}

export default function ArticleCard({
  post,
  onPress,
  variant = 'standard',
  width,
  showDivider = false,
}: ArticleCardProps) {
  const { colors } = useTheme()

  const category = Array.isArray(post.category) ? post.category[0] : post.category
  const categoryName = category?.name || 'News'

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffHours < 48) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Compact variant - horizontal layout, small
  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, showDivider && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.compactContent}>
          <Text style={[styles.compactCategory, { color: COLORS.primary }]} numberOfLines={1}>
            {categoryName}
          </Text>
          <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={2}>
            {post.title}
          </Text>
          <Text style={[styles.compactMeta, { color: colors.textMuted }]}>
            {formatDate(post.published_at)} • {post.views?.toLocaleString() || 0} views
          </Text>
        </View>
        {post.featured_image && (
          <Image
            source={{ uri: post.featured_image }}
            style={styles.compactImage}
            contentFit="cover"
            transition={200}
          />
        )}
      </TouchableOpacity>
    )
  }

  // Horizontal variant - for carousels
  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        style={[styles.horizontalContainer, { width: width || 260, backgroundColor: colors.surface }]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: post.featured_image || 'https://via.placeholder.com/300x180' }}
          style={styles.horizontalImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.horizontalContent}>
          <Text style={[styles.horizontalTitle, { color: colors.text }]} numberOfLines={2}>
            {post.title}
          </Text>
          <Text style={[styles.horizontalMeta, { color: colors.textMuted }]}>
            {formatDate(post.published_at)}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  // Standard variant - full width card
  return (
    <TouchableOpacity
      style={[styles.standardContainer, showDivider && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {post.featured_image && (
        <Image
          source={{ uri: post.featured_image }}
          style={styles.standardImage}
          contentFit="cover"
          transition={200}
        />
      )}
      <View style={styles.standardContent}>
        <View style={styles.standardHeader}>
          <Text style={[styles.standardCategory, { color: COLORS.primary }]}>{categoryName}</Text>
          {post.importance_score && post.importance_score >= 80 && (
            <View style={styles.hotBadge}>
              <Text style={styles.hotBadgeText}>HOT</Text>
            </View>
          )}
        </View>
        <Text style={[styles.standardTitle, { color: colors.text }]} numberOfLines={3}>
          {post.title}
        </Text>
        {post.excerpt && (
          <Text style={[styles.standardExcerpt, { color: colors.textMuted }]} numberOfLines={2}>
            {post.excerpt}
          </Text>
        )}
        <View style={styles.standardMeta}>
          {post.author && (
            <View style={styles.authorContainer}>
              {post.author.avatar_url && (
                <Image
                  source={{ uri: post.author.avatar_url }}
                  style={styles.authorAvatar}
                  contentFit="cover"
                />
              )}
              <Text style={[styles.authorName, { color: colors.textMuted }]}>
                {post.author.display_name}
              </Text>
            </View>
          )}
          <Text style={[styles.standardDate, { color: colors.textMuted }]}>
            {formatDate(post.published_at)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  compactContent: {
    flex: 1,
    paddingRight: 12,
  },
  compactCategory: {
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  compactTitle: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    lineHeight: 20,
    marginBottom: 4,
  },
  compactMeta: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
  },
  compactImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },

  // Horizontal variant
  horizontalContainer: {
    marginHorizontal: 6,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  horizontalImage: {
    width: '100%',
    height: 140,
  },
  horizontalContent: {
    padding: 12,
  },
  horizontalTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    lineHeight: 18,
    marginBottom: 4,
  },
  horizontalMeta: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
  },

  // Standard variant
  standardContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  standardImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  standardContent: {},
  standardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  standardCategory: {
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hotBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  hotBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Montserrat-Bold',
  },
  standardTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    lineHeight: 24,
    marginBottom: 6,
  },
  standardExcerpt: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 20,
    marginBottom: 8,
  },
  standardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorName: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
  },
  standardDate: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
})
