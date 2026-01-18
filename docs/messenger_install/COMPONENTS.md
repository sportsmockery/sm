# React Components

## Overview

All chat components are in `src/components/chat/`.

## Component Hierarchy

```
TeamChatWidget (wrapper for article pages)
├── ChatProvider (context)
│   ├── FloatingChatButton
│   └── TeamChatPanel
│       ├── Header (team info, online count)
│       ├── Tabs (Room / DMs / History)
│       ├── MessageList
│       │   └── ChatMessage (multiple)
│       │       └── MessageReactions
│       ├── ReplyIndicator
│       ├── ChatInput
│       │   ├── EmojiPickerInline
│       │   └── GifPickerInline
│       ├── EmojiPicker (modal)
│       └── GifPicker (modal)
│       └── DMList
│       │   └── DMConversationView
│       └── ChatHistory
```

---

## TeamChatWidget

**File:** `TeamChatWidget.tsx`

Wrapper component for article pages. Determines team from category.

```tsx
import { TeamChatWidget } from '@/components/chat';

<TeamChatWidget
  categorySlug="chicago-bears"  // Maps to team
  categoryName="Chicago Bears"
  articleId="uuid"
  compact={false}               // Use compact button
/>
```

**Category to Team Mapping:**
```typescript
const CATEGORY_TO_TEAM = {
  'bears': 'bears',
  'chicago-bears': 'bears',
  'nfl': 'bears',
  'cubs': 'cubs',
  'white-sox': 'white-sox',
  'bulls': 'bulls',
  'blackhawks': 'blackhawks',
  // ...
};
```

---

## FloatingChatButton

**File:** `FloatingChatButton.tsx`

The "Hang out with [Team] fans" button.

```tsx
import { FloatingChatButton, FloatingChatButtonCompact } from '@/components/chat';

// Full button with text
<FloatingChatButton
  teamSlug="bears"
  onlineCount={42}
  className="custom-class"
/>

// Compact icon-only button (for mobile)
<FloatingChatButtonCompact
  teamSlug="bears"
  className="custom-class"
/>
```

**Team Display Config:**
```typescript
const TEAM_DISPLAY = {
  bears: {
    name: 'Bears',
    emoji: '🐻',
    color: '#0B162A',
    gradient: 'from-[#0B162A] to-[#C83803]',
  },
  // ...
};
```

---

## TeamChatPanel

**File:** `TeamChatPanel.tsx`

Main chat panel with tabs and message list.

**Features:**
- Header with team info and online count
- Three tabs: Room Chat, DMs, History
- Auto-scroll with "New messages" indicator
- Guest prompt for unauthenticated users
- Emoji/GIF picker overlays

**State from Context:**
```typescript
const {
  isOpen,
  currentRoom,
  messages,
  isLoadingMessages,
  activeTab,
  showEmojiPicker,
  showGifPicker,
  isAuthenticated,
  onlineUsers,
  staffOnline,
  replyingTo,
} = useChat();
```

---

## ChatMessage

**File:** `ChatMessage.tsx`

Individual message with reactions and actions.

```tsx
<ChatMessage
  message={message}
  showAvatar={true}       // Show user avatar
  isConsecutive={false}   // Same user as previous
/>
```

**Message Actions (on hover):**
- Add reaction
- Reply
- More menu (delete, report, block)

**Badge Types:**
```typescript
type Badge = 'staff' | 'moderator' | 'ai' | 'verified' | 'og_fan' | 'contributor';
```

---

## ChatInput

**File:** `ChatInput.tsx`

Message input with moderation feedback.

**Features:**
- Auto-resize textarea
- Character count (shows at 800+)
- Emoji/GIF toggle buttons
- Send button with team color
- Moderation error display
- Cooldown indicator (slow mode)

**Moderation Feedback:**
```tsx
{moderationError && (
  <div className="bg-red-50 px-4 py-2">
    <p className="text-red-700">{moderationError}</p>
    {showTip && (
      <p className="text-red-600 text-xs">
        Tip: Keep it friendly! This is a family-friendly sports chat.
      </p>
    )}
  </div>
)}
```

---

## EmojiPicker

**File:** `EmojiPicker.tsx`

Standalone emoji picker modal.

**Categories:**
- Sports (⚽🏀🏈⚾🏒🏆)
- Reactions (👍❤️🔥😂💯)
- Faces (full range)
- Animals (🐻🐂🦁)
- Food (🍕🌭🍺)
- Chicago (🌆🏙️🎵)

**Recent Emojis:**
Stored in localStorage, shown as first category.

---

## GifPicker

**File:** `GifPicker.tsx`

GIF search and selection.

**Quick Categories:**
- Sports, Bears, Bulls, Cubs, Victory, Reaction

**Features:**
- Debounced search (300ms)
- Falls back to curated sports GIFs
- Content filtered by API

---

## DMList

**File:** `DMList.tsx`

Direct message conversation list and chat view.

**Components:**
- `DMList` - Conversation list
- `DMConversationItem` - List item with unread badge
- `DMConversationView` - Full DM chat

**Features:**
- Unread message count
- Last message preview
- Time ago formatting
- Read receipts

---

## ChatHistory

**File:** `ChatHistory.tsx`

User's message history with search.

**Filter Tabs:**
| Tab | Description |
|-----|-------------|
| My Messages | User's sent messages |
| Mentions | Messages mentioning the user |
| Reacted | Messages user reacted to |
| Threads | Thread conversations |

**Features:**
- Full-text search
- Room badges with team colors
- Message count stats

---

## ChatContext

**File:** `src/contexts/ChatContext.tsx`

React Context for chat state management.

### State Interface

```typescript
interface ChatState {
  // Connection
  isConnected: boolean;
  isConnecting: boolean;
  connectionError?: string;

  // User
  chatUser?: ChatUser;
  isAuthenticated: boolean;

  // Rooms
  rooms: ChatRoom[];
  currentRoom?: ChatRoom;
  currentTeam?: ChicagoTeam;

  // Messages
  messages: ChatMessage[];
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;

  // Threads
  activeThread?: ChatMessage;
  threadReplies: ChatMessage[];

  // DMs
  dmConversations: DMConversation[];
  currentDMConversation?: DMConversation;
  dmMessages: DMMessage[];
  totalUnreadDMs: number;

  // UI
  isOpen: boolean;
  activeTab: 'room' | 'dms' | 'history';
  showEmojiPicker: boolean;
  showGifPicker: boolean;
  replyingTo?: ChatMessage;

  // Rate limiting
  canSendMessage: boolean;
  cooldownSeconds: number;

  // Presence
  staffOnline: boolean;
  onlineUsers: ChatUser[];
  typingUsers: string[];
}
```

### Actions

```typescript
interface ChatContextValue extends ChatState {
  connect: () => Promise<void>;
  disconnect: () => void;
  joinRoom: (teamSlug: ChicagoTeam) => Promise<void>;
  leaveRoom: () => void;
  sendMessage: (content: string, type?: 'text' | 'gif', gifUrl?: string) => Promise<ModerationResult | null>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;
  openDM: (userId: string) => Promise<void>;
  sendDM: (content: string) => Promise<void>;
  toggleChat: (isOpen?: boolean) => void;
  setActiveTab: (tab: 'room' | 'dms' | 'history') => void;
  reportMessage: (messageId: string, reason: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
}
```

### Usage

```tsx
import { useChat } from '@/contexts/ChatContext';

function MyComponent() {
  const { messages, sendMessage, isAuthenticated } = useChat();

  const handleSend = async () => {
    const result = await sendMessage('Hello!');
    if (result && !result.approved) {
      console.log('Blocked:', result.blockedReason);
    }
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  );
}
```
