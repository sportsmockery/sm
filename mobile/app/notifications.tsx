import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { COLORS, API_BASE_URL } from '@/lib/config'

interface Article {
  id: number
  title: string
  slug: string
  featured_image: string | null
  category: {
    id: number
    name: string
    slug: string
  } | null
  published_at: string
}

interface NotificationHistory {
  id: number
  title: string
  body: string
  article_id: number | null
  article_title: string | null
  sent_at: string
}

export default function NotificationsScreen() {
  const router = useRouter()
  const { colors } = useTheme()
  const { isAdmin, isEditor, isAuthenticated } = useAuth()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [showArticlePicker, setShowArticlePicker] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
  const [history, setHistory] = useState<NotificationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // For now, skip redirect check - will enable when role system is working
  // useEffect(() => {
  //   if (!isAuthenticated || (!isAdmin && !isEditor)) {
  //     Alert.alert('Access Denied', 'You need admin or editor access to use this feature.', [
  //       { text: 'OK', onPress: () => router.back() },
  //     ])
  //   }
  // }, [isAuthenticated, isAdmin, isEditor, router])

  useEffect(() => {
    fetchArticles()
    fetchHistory()
  }, [])

  const fetchArticles = async (search = '') => {
    try {
      const params = new URLSearchParams({
        status: 'published',
        limit: '20',
      })
      if (search) params.set('search', search)

      const res = await fetch(`${API_BASE_URL}/api/admin/posts?${params}`)
      const data = await res.json()
      setArticles(data.posts || [])
    } catch (err) {
      console.error('Error fetching articles:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/notifications/history`)
      if (res.ok) {
        const data = await res.json()
        setHistory(data.notifications || [])
      }
    } catch (err) {
      console.error('Error fetching history:', err)
    }
  }

  const handleSearchArticles = useCallback((query: string) => {
    setSearchQuery(query)
    if (query.length >= 2) {
      fetchArticles(query)
    } else if (query.length === 0) {
      fetchArticles()
    }
  }, [])

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Error', 'Title and message are required')
      return
    }

    Alert.alert(
      'Send Notification',
      'Are you sure you want to send this notification to all app users?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          style: 'destructive',
          onPress: async () => {
            setSending(true)
            try {
              const res = await fetch(`${API_BASE_URL}/api/admin/notifications/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: title.trim(),
                  body: body.trim(),
                  articleId: selectedArticle?.id || null,
                  articleSlug: selectedArticle?.slug || null,
                  categorySlug: selectedArticle?.category?.slug || null,
                }),
              })

              const data = await res.json()

              if (!res.ok) {
                throw new Error(data.error || 'Failed to send')
              }

              Alert.alert('Success', 'Notification sent successfully!')
              setTitle('')
              setBody('')
              setSelectedArticle(null)
              fetchHistory()
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to send notification')
            } finally {
              setSending(false)
            }
          },
        },
      ]
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // Temporarily allow all authenticated users for testing
  // if (!isAuthenticated || (!isAdmin && !isEditor)) {
  //   return null
  // }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Push Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Compose Form */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Compose Notification</Text>

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Title *</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Breaking News: ..."
              placeholderTextColor={colors.textMuted}
              maxLength={65}
            />
            <Text style={[styles.charCount, { color: colors.textMuted }]}>{title.length}/65</Text>
          </View>

          {/* Body */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Message *</Text>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              value={body}
              onChangeText={setBody}
              placeholder="Tap to read the full story..."
              placeholderTextColor={colors.textMuted}
              maxLength={240}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={[styles.charCount, { color: colors.textMuted }]}>{body.length}/240</Text>
          </View>

          {/* Link to Article */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Link to Article (optional)</Text>
            {selectedArticle ? (
              <View style={[styles.selectedArticle, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {selectedArticle.featured_image && (
                  <Image
                    source={{ uri: selectedArticle.featured_image }}
                    style={styles.articleImage}
                    contentFit="cover"
                  />
                )}
                <View style={styles.articleInfo}>
                  <Text style={[styles.articleTitle, { color: colors.text }]} numberOfLines={2}>
                    {selectedArticle.title}
                  </Text>
                  <Text style={[styles.articleCategory, { color: colors.textMuted }]}>
                    {selectedArticle.category?.name || 'Uncategorized'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedArticle(null)} style={styles.removeButton}>
                  <Ionicons name="close-circle" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.selectArticleButton, { borderColor: colors.border }]}
                onPress={() => setShowArticlePicker(true)}
              >
                <Ionicons name="link-outline" size={24} color={colors.textMuted} />
                <Text style={[styles.selectArticleText, { color: colors.textMuted }]}>
                  Select an article
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendButton, { opacity: sending || !title.trim() || !body.trim() ? 0.5 : 1 }]}
            onPress={handleSend}
            disabled={sending || !title.trim() || !body.trim()}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.sendButtonText}>Send Notification</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Preview */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preview</Text>
          <View style={styles.preview}>
            <View style={styles.previewNotification}>
              <View style={styles.previewIcon}>
                <Text style={styles.previewIconText}>SM</Text>
              </View>
              <View style={styles.previewContent}>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewApp}>SPORTS MOCKERY</Text>
                  <Text style={styles.previewTime}>now</Text>
                </View>
                <Text style={styles.previewTitle} numberOfLines={1}>
                  {title || 'Notification Title'}
                </Text>
                <Text style={styles.previewBody} numberOfLines={2}>
                  {body || 'Your notification message will appear here...'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Notifications */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Notifications</Text>
          {history.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No notifications sent yet</Text>
          ) : (
            history.map((notification) => (
              <View
                key={notification.id}
                style={[styles.historyItem, { borderBottomColor: colors.border }]}
              >
                <Text style={[styles.historyTitle, { color: colors.text }]} numberOfLines={1}>
                  {notification.title}
                </Text>
                <Text style={[styles.historyBody, { color: colors.textMuted }]} numberOfLines={2}>
                  {notification.body}
                </Text>
                <Text style={[styles.historyDate, { color: colors.textMuted }]}>
                  {formatDate(notification.sent_at)}
                  {notification.article_title && ` - Linked: ${notification.article_title}`}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Article Picker Modal */}
      <Modal
        visible={showArticlePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowArticlePicker(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowArticlePicker(false)}>
              <Text style={[styles.modalCancel, { color: COLORS.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Article</Text>
            <View style={{ width: 50 }} />
          </View>

          <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search articles..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={handleSearchArticles}
            />
          </View>

          {loading ? (
            <ActivityIndicator style={styles.loadingIndicator} color={COLORS.primary} />
          ) : (
            <FlatList
              data={articles}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.articleList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.articleListItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setSelectedArticle(item)
                    setShowArticlePicker(false)
                  }}
                >
                  {item.featured_image ? (
                    <Image
                      source={{ uri: item.featured_image }}
                      style={styles.articleListImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.articleListPlaceholder, { backgroundColor: colors.border }]}>
                      <Ionicons name="image-outline" size={24} color={colors.textMuted} />
                    </View>
                  )}
                  <View style={styles.articleListInfo}>
                    <Text style={[styles.articleListTitle, { color: colors.text }]} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={[styles.articleListMeta, { color: colors.textMuted }]}>
                      {item.category?.name || 'Uncategorized'} - {formatDate(item.published_at)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No articles found</Text>
              }
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    minHeight: 80,
  },
  charCount: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'right',
    marginTop: 4,
  },
  selectedArticle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  articleImage: {
    width: 60,
    height: 45,
    borderRadius: 8,
  },
  articleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  articleTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  articleCategory: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  selectArticleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    gap: 8,
  },
  selectArticleText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  preview: {
    alignItems: 'center',
  },
  previewNotification: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewIconText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  previewContent: {
    flex: 1,
    marginLeft: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewApp: {
    fontSize: 10,
    fontWeight: '600',
    color: '#888',
  },
  previewTime: {
    fontSize: 10,
    color: '#aaa',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 2,
  },
  previewBody: {
    fontSize: 13,
    color: '#444',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    paddingVertical: 20,
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  historyBody: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    marginTop: 4,
  },
  historyDate: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    marginTop: 6,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalCancel: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: 'Montserrat-Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
  },
  loadingIndicator: {
    marginTop: 40,
  },
  articleList: {
    paddingHorizontal: 16,
  },
  articleListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  articleListImage: {
    width: 70,
    height: 50,
    borderRadius: 8,
  },
  articleListPlaceholder: {
    width: 70,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleListInfo: {
    flex: 1,
    marginLeft: 12,
  },
  articleListTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
  },
  articleListMeta: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    marginTop: 4,
  },
})
