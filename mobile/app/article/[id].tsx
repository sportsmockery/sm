import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { WebView } from 'react-native-webview'

import { useArticle } from '@/hooks/useFeed'
import { useTheme } from '@/hooks/useTheme'
import { useAds } from '@/hooks/useAds'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { api } from '@/lib/api'
import { COLORS, API_BASE_URL } from '@/lib/config'
import AdBanner from '@/components/AdBanner'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const { incrementArticleCount, shouldShowInterstitial, showInterstitial, getCustomAdCode, articleCount } = useAds()
  const [webViewHeight, setWebViewHeight] = useState(300)

  // Global audio player
  const {
    currentArticle,
    isPlaying,
    isLoading: audioLoading,
    playArticle,
    togglePlayPause,
    stop,
  } = useAudioPlayer()

  // Parse article ID
  const articleId = id ? parseInt(id, 10) : null

  // Check if this article is currently playing
  const isThisArticlePlaying = currentArticle?.id === articleId

  // Fetch article from website by ID
  const { data: article, isLoading, isError } = useArticle(articleId)

  // Track article view and potentially show interstitial
  useEffect(() => {
    if (article?.id) {
      // Record view on website
      api.recordView(article.id)

      // Increment article count for interstitial tracking
      incrementArticleCount()
    }
  }, [article?.id, incrementArticleCount])

  // Check if we should show interstitial when leaving
  useEffect(() => {
    return () => {
      if (shouldShowInterstitial(articleCount)) {
        showInterstitial()
      }
    }
  }, [articleCount, shouldShowInterstitial, showInterstitial])

  // Handle play button
  const handlePlayPress = useCallback(async () => {
    if (!article) return

    if (isThisArticlePlaying) {
      // Toggle play/pause for this article
      await togglePlayPause()
    } else {
      // Start playing this article
      await playArticle({
        id: article.id,
        title: article.title,
        slug: article.slug,
      })
    }
  }, [article, isThisArticlePlaying, togglePlayPause, playArticle])

  // Share article
  const handleShare = useCallback(async () => {
    if (!article) return

    const categorySlug = article.category?.slug || 'news'
    const articleUrl = `${API_BASE_URL}/${categorySlug}/${article.slug}`

    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\n\n${articleUrl}`,
        url: articleUrl,
      })
    } catch (error) {
      console.warn('Share failed:', error)
    }
  }, [article])

  // HTML wrapper for article content
  const getContentHtml = (contentHtml: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 17px;
          line-height: 1.7;
          color: ${isDark ? '#ffffff' : '#1a1a1a'};
          background: ${isDark ? '#1e1e1e' : '#ffffff'};
          padding: 0 16px;
        }
        p {
          margin-bottom: 16px;
        }
        h1, h2, h3, h4, h5, h6 {
          margin: 24px 0 12px;
          font-weight: 700;
          line-height: 1.3;
        }
        h2 { font-size: 22px; }
        h3 { font-size: 20px; }
        h4 { font-size: 18px; }
        img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
        }
        a {
          color: ${COLORS.primary};
          text-decoration: none;
        }
        blockquote {
          border-left: 4px solid ${COLORS.primary};
          margin: 16px 0;
          padding-left: 16px;
          font-style: italic;
          color: ${isDark ? '#999' : '#666'};
        }
        ul, ol {
          margin: 16px 0;
          padding-left: 24px;
        }
        li {
          margin-bottom: 8px;
        }
        .twitter-tweet, .instagram-media {
          margin: 16px auto !important;
        }
      </style>
    </head>
    <body>
      ${contentHtml}
      <script>
        // Notify React Native of content height
        function sendHeight() {
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'height',
            value: document.body.scrollHeight
          }));
        }
        window.onload = sendHeight;
        setTimeout(sendHeight, 500);
        setTimeout(sendHeight, 1500);
        setTimeout(sendHeight, 3000);

        // Handle link clicks
        document.addEventListener('click', function(e) {
          const link = e.target.closest('a');
          if (link) {
            e.preventDefault();
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              type: 'link',
              url: link.href
            }));
          }
        });
      </script>
    </body>
    </html>
  `

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    )
  }

  if (isError || !article) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Article Not Found</Text>
          <Text style={[styles.errorText, { color: colors.textMuted }]}>
            This article may have been removed or is temporarily unavailable.
          </Text>
          <TouchableOpacity
            style={[styles.errorButton, { backgroundColor: COLORS.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.headerButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Image */}
        {article.featured_image && (
          <Image
            source={{ uri: article.featured_image }}
            style={styles.featuredImage}
            contentFit="cover"
            transition={300}
          />
        )}

        {/* Article Header */}
        <View style={[styles.articleHeader, { backgroundColor: colors.surface }]}>
          {/* Category */}
          <Text style={[styles.category, { color: COLORS.primary }]}>
            {article.category?.name || 'News'}
          </Text>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>{article.title}</Text>

          {/* Meta */}
          <View style={styles.meta}>
            {article.author && (
              <View style={styles.author}>
                {article.author.avatar_url && (
                  <Image
                    source={{ uri: article.author.avatar_url }}
                    style={styles.authorAvatar}
                    contentFit="cover"
                  />
                )}
                <Text style={[styles.authorName, { color: colors.textMuted }]}>
                  {article.author.display_name}
                </Text>
              </View>
            )}
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {new Date(article.published_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Audio Player Controls */}
        <View style={styles.audioSection}>
          <TouchableOpacity
            style={[styles.audioButton, { backgroundColor: COLORS.primary }]}
            onPress={handlePlayPress}
            disabled={audioLoading}
          >
            {audioLoading && isThisArticlePlaying ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons
                  name={isThisArticlePlaying && isPlaying ? 'pause' : 'play'}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.audioButtonText}>
                  {isThisArticlePlaying && isPlaying
                    ? 'Pause'
                    : isThisArticlePlaying
                    ? 'Resume'
                    : 'Listen to Article'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Stop button - only show when this article is playing */}
          {isThisArticlePlaying && (
            <TouchableOpacity
              style={[styles.stopButton, { borderColor: colors.border }]}
              onPress={stop}
            >
              <Ionicons name="stop" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Ad - Article Top */}
        {getCustomAdCode('article_top') && (
          <AdBanner code={getCustomAdCode('article_top')!} placement="article_top" />
        )}

        {/* Article Content */}
        <View style={[styles.contentContainer, { backgroundColor: colors.surface }]}>
          <WebView
            source={{ html: getContentHtml(article.content_html || '') }}
            style={[styles.contentWebView, { height: webViewHeight }]}
            scrollEnabled={false}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data)
                if (data.type === 'height' && data.value) {
                  // Update WebView height based on content
                  setWebViewHeight(Math.max(300, data.value + 50))
                } else if (data.type === 'link' && data.url) {
                  // Handle internal links
                  if (data.url.includes('sportsmockery.com')) {
                    // Parse and navigate internally
                    const path = new URL(data.url).pathname
                    router.push(path as any)
                  } else {
                    // Open external links in browser
                    // Could use Linking.openURL here
                  }
                }
              } catch (e) {
                // Ignore
              }
            }}
          />
        </View>

        {/* Ad - Article Bottom */}
        {getCustomAdCode('article_bottom') && (
          <AdBanner code={getCustomAdCode('article_bottom')!} placement="article_bottom" />
        )}

        {/* Related Articles */}
        {article.related_posts && article.related_posts.length > 0 && (
          <View style={[styles.relatedSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.relatedTitle, { color: colors.text }]}>Related Articles</Text>
            {article.related_posts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={[styles.relatedItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  router.push(`/article/${post.id}`)
                }}
              >
                {post.featured_image && (
                  <Image
                    source={{ uri: post.featured_image }}
                    style={styles.relatedImage}
                    contentFit="cover"
                  />
                )}
                <View style={styles.relatedContent}>
                  <Text style={[styles.relatedItemTitle, { color: colors.text }]} numberOfLines={2}>
                    {post.title}
                  </Text>
                  <Text style={[styles.relatedDate, { color: colors.textMuted }]}>
                    {new Date(post.published_at).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {},
  featuredImage: {
    width: '100%',
    height: 240,
  },
  articleHeader: {
    padding: 16,
  },
  category: {
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    lineHeight: 32,
    marginBottom: 16,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  authorName: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
  },
  date: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
  audioSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  audioButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  audioButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  stopButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    overflow: 'hidden',
  },
  contentWebView: {
    width: SCREEN_WIDTH,
    backgroundColor: 'transparent',
  },
  relatedSection: {
    marginTop: 16,
    padding: 16,
  },
  relatedTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 16,
  },
  relatedItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  relatedImage: {
    width: 80,
    height: 60,
    borderRadius: 6,
    marginRight: 12,
  },
  relatedContent: {
    flex: 1,
    justifyContent: 'center',
  },
  relatedItemTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    lineHeight: 18,
    marginBottom: 4,
  },
  relatedDate: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
  },
})
