import { useState, useRef, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { api, AskAIResponse } from '@/lib/api'
import { COLORS } from '@/lib/config'

const scoutIcon = require('@/assets/images/scout-ai.png')

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
  relatedArticles?: any[]
}

const EXAMPLE_QUESTIONS = [
  "What's the Bears' record this season?",
  "Who leads the Bulls in scoring?",
  "When is the Cubs' next game?",
  "Compare Caleb Williams to other rookie QBs",
  "White Sox trade rumors",
]

interface QueryHistoryItem {
  query: string
  response: string
  timestamp: string
}

const HISTORY_STORAGE_KEY = 'scout_query_history'
const MAX_LOCAL_HISTORY = 100

async function saveQueryToHistory(
  userId: string | null,
  query: string,
  response: string
) {
  const item: QueryHistoryItem = { query, response, timestamp: new Date().toISOString() }

  if (userId) {
    try {
      await supabase.from('scout_query_history').insert({
        user_id: userId,
        query,
        response,
      })
    } catch (err) {
      console.error('Failed to save query to Supabase:', err)
    }
  } else {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_STORAGE_KEY)
      const history: QueryHistoryItem[] = stored ? JSON.parse(stored) : []
      history.unshift(item)
      await AsyncStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(history.slice(0, MAX_LOCAL_HISTORY))
      )
    } catch (err) {
      console.error('Failed to save query locally:', err)
    }
  }
}

async function loadQueryHistory(userId: string | null): Promise<QueryHistoryItem[]> {
  if (userId) {
    try {
      const { data } = await supabase
        .from('scout_query_history')
        .select('query, response, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      return (data || []).map((d: any) => ({
        query: d.query,
        response: d.response,
        timestamp: d.created_at,
      }))
    } catch {
      return []
    }
  } else {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_STORAGE_KEY)
      return stored ? JSON.parse(stored).slice(0, 20) : []
    } catch {
      return []
    }
  }
}

export default function AskAIScreen() {
  const { colors } = useTheme()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<QueryHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)

  // Load history on mount
  useEffect(() => {
    loadQueryHistory(user?.id || null).then(setHistory)
  }, [user?.id])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)

    try {
      // Call website API
      const response: AskAIResponse = await api.askAI(text)

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        suggestions: response.suggestions,
        relatedArticles: response.relatedArticles,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Save to history
      await saveQueryToHistory(user?.id || null, text, response.response)
      setHistory((prev) => [
        { query: text, response: response.response, timestamp: new Date().toISOString() },
        ...prev,
      ].slice(0, MAX_LOCAL_HISTORY))
    } catch (error) {
      const errorMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        suggestions: EXAMPLE_QUESTIONS.slice(0, 3),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [isLoading])

  const handleSuggestionPress = useCallback((suggestion: string) => {
    sendMessage(suggestion)
  }, [sendMessage])

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Image source={scoutIcon} style={styles.scoutIcon} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Scout AI</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              Your Chicago sports expert
            </Text>
          </View>
          {history.length > 0 && (
            <TouchableOpacity
              style={[styles.historyButton, { backgroundColor: showHistory ? COLORS.primary : colors.background }]}
              onPress={() => setShowHistory(!showHistory)}
            >
              <Ionicons name="time-outline" size={18} color={showHistory ? '#fff' : colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* History Panel */}
      {showHistory && (
        <View style={[styles.historyPanel, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.historyTitle, { color: colors.text }]}>Recent Queries</Text>
          <ScrollView style={styles.historyScroll} showsVerticalScrollIndicator={false}>
            {history.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.historyItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setShowHistory(false)
                  sendMessage(item.query)
                }}
              >
                <Text style={[styles.historyQuery, { color: colors.text }]} numberOfLines={1}>
                  {item.query}
                </Text>
                <Text style={[styles.historyTime, { color: colors.textMuted }]}>
                  {new Date(item.timestamp).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            messages.length > 0 && styles.messagesContentWithMessages
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome Message */}
          {messages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <Image source={scoutIcon} style={styles.welcomeScoutIcon} resizeMode="contain" />
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                Scout AI
              </Text>
              <Text style={[styles.welcomeText, { color: colors.textMuted }]}>
                Get instant answers about the Bears, Bulls, Cubs, White Sox, and Blackhawks with our AI-powered sports assistant.
              </Text>

              {/* Example Questions */}
              <View style={styles.examplesContainer}>
                <Text style={[styles.examplesLabel, { color: colors.textMuted }]}>
                  Try asking:
                </Text>
                {EXAMPLE_QUESTIONS.map((question, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.exampleButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => handleSuggestionPress(question)}
                  >
                    <Text style={[styles.exampleText, { color: colors.text }]}>{question}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              {message.role === 'assistant' && (
                <Image source={scoutIcon} style={styles.messageScoutIcon} resizeMode="contain" />
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.role === 'user'
                    ? { backgroundColor: COLORS.primary }
                    : { backgroundColor: colors.surface },
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: message.role === 'user' ? '#fff' : colors.text },
                  ]}
                >
                  {message.content}
                </Text>
              </View>

              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {message.suggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => handleSuggestionPress(suggestion)}
                    >
                      <Text style={[styles.suggestionText, { color: COLORS.primary }]}>
                        {suggestion}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <Image source={scoutIcon} style={styles.messageScoutIcon} resizeMode="contain" />
              <View style={[styles.loadingBubble, { backgroundColor: colors.surface }]}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>Scout is thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
            placeholder="Ask about Chicago sports..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: COLORS.primary, opacity: input.trim() && !isLoading ? 1 : 0.5 }]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="#fff" />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messagesContentWithMessages: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  welcomeScoutIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  examplesContainer: {
    width: '100%',
    marginTop: 16,
  },
  examplesLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exampleButton: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageScoutIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 22,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
  },
  loadingContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyPanel: {
    maxHeight: 250,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  historyTitle: {
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  historyScroll: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  historyQuery: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    marginRight: 12,
  },
  historyTime: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
  },
})
