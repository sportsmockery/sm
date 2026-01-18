'use client';

/**
 * TEAM CHAT PANEL
 * Main chat interface with tabs, messages, and input
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/contexts/ChatContext';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { EmojiPicker } from './EmojiPicker';
import { GifPicker } from './GifPicker';
import { DMList } from './DMList';
import { ChatHistory } from './ChatHistory';
import { TEAM_DISPLAY } from './FloatingChatButton';

export function TeamChatPanel() {
  const {
    isOpen,
    toggleChat,
    currentRoom,
    currentTeam,
    messages,
    isLoadingMessages,
    hasMoreMessages,
    loadMoreMessages,
    activeTab,
    setActiveTab,
    showEmojiPicker,
    showGifPicker,
    toggleEmojiPicker,
    toggleGifPicker,
    isAuthenticated,
    onlineUsers,
    staffOnline,
    replyingTo,
    setReplyingTo,
    totalUnreadDMs,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  // Detect if user has scrolled up
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isAtBottom);

    // Load more when scrolling to top
    if (scrollTop < 50 && hasMoreMessages && !isLoadingMessages) {
      loadMoreMessages();
    }
  };

  const team = currentTeam ? TEAM_DISPLAY[currentTeam] : null;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 400, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 400, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-[420px] h-[100dvh] md:h-[600px] md:max-h-[80vh] flex flex-col bg-white dark:bg-gray-900 md:rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        <div
          className={`relative flex items-center justify-between px-4 py-3 bg-gradient-to-r ${team?.gradient || 'from-gray-700 to-gray-800'} text-white`}
        >
          {/* Team info */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">{team?.emoji || '💬'}</span>
            <div>
              <h2 className="font-bold text-lg leading-tight">
                {currentRoom?.teamName || 'Team'} Chat
              </h2>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {onlineUsers.length} online
                </span>
                {staffOnline && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    Staff here
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => toggleChat(false)}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <TabButton
            active={activeTab === 'room'}
            onClick={() => setActiveTab('room')}
            icon="💬"
            label="Chat"
          />
          <TabButton
            active={activeTab === 'dms'}
            onClick={() => setActiveTab('dms')}
            icon="✉️"
            label="DMs"
            badge={totalUnreadDMs > 0 ? totalUnreadDMs : undefined}
          />
          <TabButton
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            icon="📜"
            label="History"
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {activeTab === 'room' && (
            <>
              {/* Messages */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-3 space-y-1 scroll-smooth"
              >
                {/* Load more indicator */}
                {isLoadingMessages && (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner />
                  </div>
                )}

                {/* Welcome message for empty chat */}
                {messages.length === 0 && !isLoadingMessages && (
                  <WelcomeMessage teamName={currentRoom?.teamName || 'this team'} />
                )}

                {/* Messages grouped by time */}
                <MessageList messages={messages} />

                <div ref={messagesEndRef} />
              </div>

              {/* Replying indicator */}
              <AnimatePresence>
                {replyingTo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>↩️ Replying to</span>
                      <span className="font-medium">{replyingTo.user?.displayName}</span>
                      <span className="truncate max-w-[150px]">{replyingTo.content}</span>
                    </div>
                    <button
                      onClick={() => setReplyingTo(undefined)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      ✕
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input area */}
              {isAuthenticated ? (
                <ChatInput teamColor={team?.color} />
              ) : (
                <GuestPrompt />
              )}

              {/* Emoji/GIF pickers */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-16 left-4 right-4 z-10"
                  >
                    <EmojiPicker onClose={() => toggleEmojiPicker(false)} />
                  </motion.div>
                )}
                {showGifPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-16 left-4 right-4 z-10"
                  >
                    <GifPicker onClose={() => toggleGifPicker(false)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {activeTab === 'dms' && <DMList />}
          {activeTab === 'history' && <ChatHistory />}
        </div>

        {/* New message indicator when scrolled up */}
        <AnimatePresence>
          {!shouldAutoScroll && messages.length > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                setShouldAutoScroll(true);
              }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-500 text-white rounded-full shadow-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              ↓ New messages
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

// =====================================================
// SUB-COMPONENTS
// =====================================================

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium
        transition-colors relative
        ${active
          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-white dark:bg-gray-900'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }
      `}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-1 right-4 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}

function MessageList({ messages }: { messages: ReturnType<typeof useChat>['messages'] }) {
  // Group messages by time (within 5 minutes)
  const groupedMessages: Array<{ timestamp: Date; messages: typeof messages }> = [];
  let currentGroup: typeof messages = [];
  let lastTime: Date | null = null;

  messages.forEach((msg) => {
    if (!lastTime || msg.createdAt.getTime() - lastTime.getTime() > 5 * 60 * 1000) {
      if (currentGroup.length > 0) {
        groupedMessages.push({ timestamp: currentGroup[0].createdAt, messages: currentGroup });
      }
      currentGroup = [msg];
    } else {
      currentGroup.push(msg);
    }
    lastTime = msg.createdAt;
  });

  if (currentGroup.length > 0) {
    groupedMessages.push({ timestamp: currentGroup[0].createdAt, messages: currentGroup });
  }

  return (
    <>
      {groupedMessages.map((group, groupIdx) => (
        <div key={groupIdx}>
          {/* Time divider */}
          <div className="flex items-center gap-2 my-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatMessageTime(group.timestamp)}
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Messages in group */}
          {group.messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              showAvatar={idx === 0 || msg.userId !== group.messages[idx - 1]?.userId}
              isConsecutive={idx > 0 && msg.userId === group.messages[idx - 1]?.userId}
            />
          ))}
        </div>
      ))}
    </>
  );
}

function WelcomeMessage({ teamName }: { teamName: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
      <div className="text-5xl mb-4">👋</div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
        Welcome to {teamName} Chat!
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[280px]">
        Connect with fellow fans, share your takes, and enjoy the game together.
        Be respectful and have fun!
      </p>
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {['🏆', '🔥', '💪', '👏', '🎉'].map((emoji) => (
          <span
            key={emoji}
            className="text-2xl animate-bounce"
            style={{ animationDelay: `${Math.random() * 0.5}s` }}
          >
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
}

function GuestPrompt() {
  return (
    <div className="px-4 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          👀 You're watching the chat. Login to join the conversation!
        </p>
        <div className="flex gap-2 justify-center">
          <a
            href="/login"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors"
          >
            Login
          </a>
          <a
            href="/signup"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

function formatMessageTime(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();

  if (isToday) {
    return `Today at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }
  if (isYesterday) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ` at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}
