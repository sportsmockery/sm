import { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTeamArticles } from '@/hooks/useFeed'
import { useTheme } from '@/hooks/useTheme'
import { TEAMS, COLORS, TeamId } from '@/lib/config'
import { Post } from '@/lib/api'
import ArticleCard from '@/components/ArticleCard'

export default function TeamScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const { colors, isDark } = useTheme()

  const team = slug ? TEAMS[slug as TeamId] : null
  const { data, isLoading, isError, refetch, isRefetching } = useTeamArticles(slug || '')

  const handleArticlePress = useCallback(
    (post: Post) => {
      router.push(`/article/${post.id}`)
    },
    [router]
  )

  if (!team) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Team Not Found</Text>
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
      <View style={[styles.header, { backgroundColor: team.color }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Image
            source={{ uri: team.logo }}
            style={styles.teamLogo}
            contentFit="contain"
          />
          <View style={styles.headerText}>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.teamSport}>
              {team.sport.charAt(0).toUpperCase() + team.sport.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: team.color }]}
          onPress={() => router.push(`/team/${slug}/schedule`)}
        >
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: team.color }]}
          onPress={() => router.push(`/team/${slug}/roster`)}
        >
          <Ionicons name="people-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Roster</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: team.color }]}
          onPress={() => router.push(`/team/${slug}/stats`)}
        >
          <Ionicons name="stats-chart-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Stats</Text>
        </TouchableOpacity>
      </View>

      {/* Chat prompt */}
      <TouchableOpacity
        style={[styles.chatPrompt, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => router.push(`/chat/${slug}`)}
      >
        <View style={[styles.chatAvatar, { backgroundColor: team.color }]}>
          <Ionicons name="chatbubbles" size={20} color="#fff" />
        </View>
        <View style={styles.chatPromptText}>
          <Text style={[styles.chatPromptTitle, { color: colors.text }]}>
            Join the {team.chatRoomName} Chat
          </Text>
          <Text style={[styles.chatPromptSubtitle, { color: colors.textMuted }]}>
            Talk {team.shortName} with other fans
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      {/* Articles */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={team.color}
            colors={[team.color]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest News</Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={team.color} />
          </View>
        ) : isError ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Unable to load articles. Pull to refresh.
            </Text>
          </View>
        ) : data?.posts && data.posts.length > 0 ? (
          data.posts.map((post, index) => (
            <ArticleCard
              key={post.id}
              post={post}
              onPress={() => handleArticlePress(post)}
              variant="standard"
              showDivider={index < data.posts.length - 1}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No articles yet. Check back soon!
            </Text>
          </View>
        )}

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
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 60,
    height: 60,
  },
  headerText: {
    marginLeft: 16,
  },
  teamName: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    color: '#fff',
  },
  teamSport: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
  },
  chatPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  chatAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatPromptText: {
    flex: 1,
    marginLeft: 12,
  },
  chatPromptTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  chatPromptSubtitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
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
})
