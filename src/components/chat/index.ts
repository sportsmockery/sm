/**
 * Team Chat Components
 *
 * Real-time team chat system with auto-moderation for sports fan engagement.
 */

export { default as TeamChatWidget } from './TeamChatWidget'
export { default as FloatingChatButton } from './FloatingChatButton'
export { default as TeamChatPanel } from './TeamChatPanel'
export { default as ChatMessage } from './ChatMessage'
export { default as ChatInput } from './ChatInput'
export { default as EmojiPicker } from './EmojiPicker'
export { default as GifPicker } from './GifPicker'

// Re-export context
export { ChatProvider, useChatContext } from '@/contexts/ChatContext'
export type { ChatUser, ChatMessage as ChatMessageType, ChatRoom, DMConversation } from '@/contexts/ChatContext'
