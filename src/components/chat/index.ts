/**
 * TEAM CHAT COMPONENTS
 * Export all chat-related components
 */

// Main components
export { TeamChatPanel } from './TeamChatPanel';
export { FloatingChatButton, FloatingChatButtonCompact, TEAM_DISPLAY } from './FloatingChatButton';
export { ChatMessage } from './ChatMessage';
export { ChatInput, EmojiPickerInline, GifPickerInline } from './ChatInput';

// Pickers
export { EmojiPicker } from './EmojiPicker';
export { GifPicker } from './GifPicker';

// DMs and History
export { DMList } from './DMList';
export { ChatHistory } from './ChatHistory';

// Re-export context hook
export { useChat, ChatProvider } from '@/contexts/ChatContext';
export type {
  ChatUser,
  ChatMessage as ChatMessageType,
  ChatRoom,
  DMConversation,
  DMMessage,
  ChatState,
} from '@/contexts/ChatContext';
