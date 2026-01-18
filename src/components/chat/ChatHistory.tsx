'use client';

/**
 * CHAT HISTORY COMPONENT
 * View user's past messages and interactions
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat, ChatMessage } from '@/contexts/ChatContext';

type HistoryFilter = 'all' | 'mentions' | 'reactions' | 'replies';

export function ChatHistory() {
  const { messages, chatUser, isAuthenticated, rooms } = useChat();
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter messages based on criteria
  useEffect(() => {
    if (!chatUser) {
      setFilteredMessages([]);
      return;
    }

    let filtered = [...messages];

    switch (filter) {
      case 'mentions':
        // Messages that mention the current user
        filtered = filtered.filter(
          (m) => m.content.toLowerCase().includes(`@${chatUser.displayName.toLowerCase()}`)
        );
        break;
      case 'reactions':
        // Messages with reactions from the current user
        filtered = filtered.filter(
          (m) => m.userReactions && m.userReactions.length > 0
        );
        break;
      case 'replies':
        // Replies to the current user or user's replies
        filtered = filtered.filter(
          (m) => m.userId === chatUser.id || m.replyTo?.userId === chatUser.id
        );
        break;
      default:
        // User's own messages
        filtered = filtered.filter((m) => m.userId === chatUser.id);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.content.toLowerCase().includes(query) ||
          m.user?.displayName.toLowerCase().includes(query)
      );
    }

    // Sort by date, newest first
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    setFilteredMessages(filtered);
  }, [messages, chatUser, filter, searchQuery]);

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <span className="text-5xl mb-4">🔒</span>
        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
          Login Required
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Sign in to view your chat history
        </p>
        <a
          href="/login"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors"
        >
          Login
        </a>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Chat History
        </h3>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full px-3 py-2 pl-9 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 px-2">
        {[
          { id: 'all', label: 'My Messages', icon: '💬' },
          { id: 'mentions', label: 'Mentions', icon: '@' },
          { id: 'reactions', label: 'Reacted', icon: '❤️' },
          { id: 'replies', label: 'Threads', icon: '↩️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as HistoryFilter)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              filter === tab.id
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingDots />
          </div>
        ) : filteredMessages.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredMessages.map((msg) => (
              <HistoryMessageItem key={msg.id} message={msg} rooms={rooms} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <span className="text-5xl mb-4">
              {filter === 'mentions' ? '@' : filter === 'reactions' ? '❤️' : filter === 'replies' ? '↩️' : '📜'}
            </span>
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
              {filter === 'all'
                ? 'No messages yet'
                : filter === 'mentions'
                ? 'No mentions yet'
                : filter === 'reactions'
                ? 'No reactions yet'
                : 'No threads yet'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filter === 'all'
                ? 'Start chatting with other fans!'
                : filter === 'mentions'
                ? "When someone mentions you, you'll see it here"
                : filter === 'reactions'
                ? "Messages you've reacted to will appear here"
                : 'Your thread conversations will show up here'}
            </p>
          </div>
        )}
      </div>

      {/* Stats footer */}
      {filteredMessages.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {filteredMessages.length} {filteredMessages.length === 1 ? 'message' : 'messages'}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      )}
    </div>
  );
}

// =====================================================
// HISTORY MESSAGE ITEM
// =====================================================

function HistoryMessageItem({
  message,
  rooms,
}: {
  message: ChatMessage;
  rooms: ReturnType<typeof useChat>['rooms'];
}) {
  const room = rooms.find((r) => r.id === message.roomId);

  return (
    <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      {/* Room badge */}
      {room && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: room.teamColor }}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {room.teamName}
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-400">
            {formatDate(message.createdAt)}
          </span>
        </div>
      )}

      {/* Message content */}
      <div className="flex items-start gap-2">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0">
          {message.user?.avatarUrl ? (
            <img
              src={message.user.avatarUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">
              {message.user?.displayName?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
              {message.user?.displayName || 'Unknown'}
            </span>
            <span className="text-xs text-gray-400">
              {message.createdAt.toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Reply context */}
          {message.replyTo && (
            <div className="flex items-center gap-1 mb-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">
              <span>↩️</span>
              <span className="font-medium">{message.replyTo.user?.displayName}</span>
              <span className="truncate">{message.replyTo.content}</span>
            </div>
          )}

          {/* Message text */}
          {message.contentType === 'gif' && message.gifUrl ? (
            <img
              src={message.gifUrl}
              alt="GIF"
              className="max-w-[150px] rounded-lg"
            />
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {message.content}
            </p>
          )}

          {/* Reactions */}
          {Object.keys(message.reactionCounts).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {Object.entries(message.reactionCounts).map(([emoji, count]) => (
                <span
                  key={emoji}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
                >
                  {emoji} {count}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// HELPERS
// =====================================================

function LoadingDots() {
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

function formatDate(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
