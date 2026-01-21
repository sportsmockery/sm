import { useState, useRef, useCallback } from 'react'
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
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks/useTheme'
import { api, AskAIResponse } from '@/lib/api'
import { COLORS } from '@/lib/config'

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

export default function AskAIScreen() {
  const { colors } = useTheme()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)

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
          <View style={[styles.aiIcon, { backgroundColor: COLORS.primary }]}>
            <Ionicons name="sparkles" size={24} color="#fff" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Ask Mockery AI</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              Your Chicago sports expert
            </Text>
          </View>
        </View>
      </View>

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
              <View style={[styles.welcomeIcon, { backgroundColor: `${COLORS.primary}20` }]}>
                <Ionicons name="sparkles" size={48} color={COLORS.primary} />
              </View>
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                Ask me anything about Chicago sports
              </Text>
              <Text style={[styles.welcomeText, { color: colors.textMuted }]}>
                I can help with stats, schedules, player info, trade rumors, and more for all
                Chicago teams.
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
                <View style={[styles.messageIcon, { backgroundColor: COLORS.primary }]}>
                  <Ionicons name="sparkles" size={16} color="#fff" />
                </View>
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
              <View style={[styles.messageIcon, { backgroundColor: COLORS.primary }]}>
                <Ionicons name="sparkles" size={16} color="#fff" />
              </View>
              <View style={[styles.loadingBubble, { backgroundColor: colors.surface }]}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>Thinking...</Text>
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
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
  welcomeIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
  messageIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
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
})
