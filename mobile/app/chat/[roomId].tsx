import { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { useChat } from '@/hooks/useChat'
import { useCanAccess } from '@/hooks/useSubscription'
import { PaywallGate } from '@/components/PaywallGate'
import { TEAMS, COLORS, TeamId } from '@/lib/config'
import { ChatMessage } from '@/lib/api'

export default function ChatRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>()
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const [messageText, setMessageText] = useState('')
  const flatListRef = useRef<FlatList>(null)
  const canAccessChat = useCanAccess('fan_chat')

  const team = roomId ? TEAMS[roomId as TeamId] : null
  const {
    messages,
    isLoading,
    isError,
    sendMessage,
    isSending,
  } = useChat(roomId || '')

  const handleSend = useCallback(async () => {
    if (!messageText.trim() || isSending) return

    const text = messageText.trim()
    setMessageText('')
    await sendMessage(text)
  }, [messageText, isSending, sendMessage])

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => {
      return (
        <View style={styles.messageContainer}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: team?.color || COLORS.primary }]}>
            {item.user?.avatar_url ? (
              <Image source={{ uri: item.user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {item.user?.username?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            )}
          </View>

          {/* Content */}
          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <Text style={[styles.username, { color: colors.text }]}>
                {item.user?.username || 'Anonymous'}
              </Text>
              <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                {new Date(item.created_at).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <Text style={[styles.messageText, { color: colors.text }]}>{item.content}</Text>
            {item.gif_url && (
              <Image source={{ uri: item.gif_url }} style={styles.gifImage} contentFit="cover" />
            )}
          </View>
        </View>
      )
    },
    [colors, team]
  )

  if (!team) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Chat Room Not Found</Text>
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

  // Gate chat behind subscription
  if (!canAccessChat) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
            <Image source={{ uri: team.logo }} style={styles.teamLogo} contentFit="contain" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{team.chatRoomName}</Text>
              <Text style={styles.headerSubtitle}>{team.shortName} Fan Chat</Text>
            </View>
          </View>
        </View>
        <PaywallGate
          feature="fan_chat"
          title="Unlock Fan Chat"
          description={`Join the ${team.chatRoomName} and chat with fellow ${team.shortName} fans!`}
        >
          <View />
        </PaywallGate>
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
          <Image source={{ uri: team.logo }} style={styles.teamLogo} contentFit="contain" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{team.chatRoomName}</Text>
            <Text style={styles.headerSubtitle}>{team.shortName} Fan Chat</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={team.color} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Loading messages...
            </Text>
          </View>
        ) : isError ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Unable to load chat. Check your connection.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            inverted
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  No messages yet. Start the conversation!
                </Text>
              </View>
            }
          />
        )}

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: messageText.trim() ? team.color : colors.border },
            ]}
            onPress={handleSend}
            disabled={!messageText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 44,
    height: 44,
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    padding: 8,
    borderRadius: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 36,
    height: 36,
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
  },
  messageContent: {
    flex: 1,
    marginLeft: 10,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  timestamp: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    marginLeft: 8,
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 20,
  },
  gifImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    transform: [{ scaleY: -1 }],
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
