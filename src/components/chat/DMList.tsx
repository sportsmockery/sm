'use client';

/**
 * DM LIST COMPONENT
 * Direct message conversations list and chat view
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat, DMConversation, DMMessage, ChatUser } from '@/contexts/ChatContext';

export function DMList() {
  const {
    dmConversations,
    currentDMConversation,
    dmMessages,
    loadDMConversations,
    openDM,
    closeDM,
    sendDM,
    isAuthenticated,
    chatUser,
  } = useChat();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await loadDMConversations();
      setIsLoading(false);
    };
    load();
  }, [loadDMConversations]);

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <span className="text-5xl mb-4">🔒</span>
        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
          Login Required
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Sign in to send and receive direct messages
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

  if (currentDMConversation) {
    return <DMConversationView />;
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Messages</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {dmConversations.length} conversations
        </p>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingDots />
          </div>
        ) : dmConversations.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {dmConversations.map((conv) => (
              <DMConversationItem
                key={conv.id}
                conversation={conv}
                onClick={() => openDM(conv.participantId)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <span className="text-5xl mb-4">✉️</span>
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
              No messages yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start a conversation by clicking on a user's name in the chat!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// CONVERSATION ITEM
// =====================================================

function DMConversationItem({
  conversation,
  onClick,
}: {
  conversation: DMConversation;
  onClick: () => void;
}) {
  const hasUnread = conversation.unreadCount > 0;

  return (
    <button
      onClick={onClick}
      className={`
        w-full px-4 py-3 flex items-center gap-3 text-left
        hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
        ${hasUnread ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
      `}
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0">
        {conversation.participant?.avatarUrl ? (
          <img
            src={conversation.participant.avatarUrl}
            alt={conversation.participant.displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-500">
            {conversation.participant?.displayName?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`font-semibold text-sm ${hasUnread ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
            {conversation.participant?.displayName || 'Unknown User'}
          </span>
          <span className="text-xs text-gray-400">
            {formatTimeAgo(conversation.lastMessageAt)}
          </span>
        </div>
        <p className={`text-sm truncate ${hasUnread ? 'text-gray-700 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
          {conversation.lastMessagePreview || 'No messages yet'}
        </p>
      </div>

      {/* Unread badge */}
      {hasUnread && (
        <div className="w-5 h-5 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
        </div>
      )}
    </button>
  );
}

// =====================================================
// CONVERSATION VIEW
// =====================================================

function DMConversationView() {
  const {
    currentDMConversation,
    dmMessages,
    sendDM,
    closeDM,
    chatUser,
  } = useChat();

  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dmMessages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      await sendDM(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Error sending DM:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!currentDMConversation) return null;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
        <button
          onClick={closeDM}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          ←
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          {currentDMConversation.participant?.avatarUrl ? (
            <img
              src={currentDMConversation.participant.avatarUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">
              {currentDMConversation.participant?.displayName?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
            {currentDMConversation.participant?.displayName || 'Unknown User'}
          </h3>
          {currentDMConversation.participant?.badge && (
            <span className="text-xs text-blue-500">{currentDMConversation.participant.badge}</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {dmMessages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
            Start a conversation!
          </div>
        ) : (
          dmMessages.map((msg) => {
            const isOwn = msg.senderId === chatUser?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] px-3 py-2 rounded-2xl text-sm
                    ${isOwn
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
                    }
                  `}
                >
                  {msg.contentType === 'gif' && msg.gifUrl ? (
                    <img
                      src={msg.gifUrl}
                      alt="GIF"
                      className="max-w-full rounded-lg"
                    />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  <div className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                    {msg.createdAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    {isOwn && msg.isRead && ' ✓'}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!message.trim() || isSending}
            className={`
              p-2.5 rounded-full transition-colors
              ${message.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isSending ? (
              <LoadingDots />
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </div>
      </form>
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
          className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
