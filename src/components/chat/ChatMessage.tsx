'use client';

/**
 * CHAT MESSAGE COMPONENT
 * Individual message with reactions, replies, and actions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat, ChatMessage as ChatMessageType } from '@/contexts/ChatContext';

// Quick reaction emojis
const QUICK_REACTIONS = ['👍', '❤️', '🔥', '😂', '😮', '😢', '💯', '🏆'];

interface ChatMessageProps {
  message: ChatMessageType;
  showAvatar?: boolean;
  isConsecutive?: boolean;
}

export function ChatMessage({ message, showAvatar = true, isConsecutive = false }: ChatMessageProps) {
  const {
    chatUser,
    addReaction,
    removeReaction,
    setReplyingTo,
    deleteMessage,
    reportMessage,
    blockUser,
    openDM,
  } = useChat();

  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isOwnMessage = chatUser?.id === message.userId;
  const isStaffOrMod = message.user?.badge === 'staff' || message.user?.badge === 'moderator';
  const isAI = message.user?.badge === 'ai';

  // Badge display
  const getBadge = () => {
    switch (message.user?.badge) {
      case 'staff':
        return <span className="px-1.5 py-0.5 bg-purple-500 text-white text-[10px] rounded font-bold uppercase">Staff</span>;
      case 'moderator':
        return <span className="px-1.5 py-0.5 bg-green-500 text-white text-[10px] rounded font-bold uppercase">Mod</span>;
      case 'ai':
        return <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded font-bold uppercase">AI</span>;
      case 'verified':
        return <span className="text-blue-500">✓</span>;
      case 'og_fan':
        return <span className="text-amber-500">⭐</span>;
      default:
        return null;
    }
  };

  const handleReaction = (emoji: string) => {
    const hasReacted = message.userReactions?.includes(emoji);
    if (hasReacted) {
      removeReaction(message.id, emoji);
    } else {
      addReaction(message.id, emoji);
    }
    setShowReactionPicker(false);
  };

  const handleReport = async () => {
    const reason = prompt('Why are you reporting this message?');
    if (reason) {
      await reportMessage(message.id, reason);
      setShowMoreMenu(false);
    }
  };

  const handleBlock = async () => {
    if (confirm(`Block ${message.user?.displayName}? You won't see their messages.`)) {
      await blockUser(message.userId);
      setShowMoreMenu(false);
    }
  };

  // GIF message
  if (message.contentType === 'gif' && message.gifUrl) {
    return (
      <div
        className={`group relative flex gap-2 ${isConsecutive ? 'mt-0.5' : 'mt-2'}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => {
          setShowActions(false);
          setShowReactionPicker(false);
          setShowMoreMenu(false);
        }}
      >
        {/* Avatar */}
        {showAvatar && !isConsecutive ? (
          <Avatar user={message.user} onClick={() => message.user && openDM(message.userId)} />
        ) : (
          <div className="w-8 shrink-0" />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name and time */}
          {showAvatar && !isConsecutive && (
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-semibold text-sm ${isStaffOrMod ? 'text-purple-600 dark:text-purple-400' : isAI ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                {message.user?.displayName || 'Fan'}
              </span>
              {getBadge()}
              <span className="text-xs text-gray-400">
                {message.createdAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
          )}

          {/* GIF */}
          <div className="relative inline-block rounded-lg overflow-hidden max-w-[280px]">
            <img
              src={message.gifUrl}
              alt="GIF"
              className="max-w-full h-auto rounded-lg"
              loading="lazy"
            />
          </div>

          {/* Reactions */}
          <MessageReactions
            reactions={message.reactionCounts}
            userReactions={message.userReactions}
            onReaction={handleReaction}
          />
        </div>

        {/* Action buttons */}
        <MessageActions
          show={showActions}
          showReactionPicker={showReactionPicker}
          setShowReactionPicker={setShowReactionPicker}
          showMoreMenu={showMoreMenu}
          setShowMoreMenu={setShowMoreMenu}
          onReaction={handleReaction}
          onReply={() => setReplyingTo(message)}
          onDelete={isOwnMessage ? () => deleteMessage(message.id) : undefined}
          onReport={!isOwnMessage ? handleReport : undefined}
          onBlock={!isOwnMessage ? handleBlock : undefined}
        />
      </div>
    );
  }

  // Text message
  return (
    <div
      className={`group relative flex gap-2 ${isConsecutive ? 'mt-0.5' : 'mt-2'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactionPicker(false);
        setShowMoreMenu(false);
      }}
    >
      {/* Avatar */}
      {showAvatar && !isConsecutive ? (
        <Avatar user={message.user} onClick={() => message.user && openDM(message.userId)} />
      ) : (
        <div className="w-8 shrink-0" />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Name and time */}
        {showAvatar && !isConsecutive && (
          <div className="flex items-center gap-2 mb-0.5">
            <button
              onClick={() => message.user && openDM(message.userId)}
              className={`font-semibold text-sm hover:underline ${
                isStaffOrMod
                  ? 'text-purple-600 dark:text-purple-400'
                  : isAI
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {message.user?.displayName || 'Fan'}
            </button>
            {getBadge()}
            <span className="text-xs text-gray-400">
              {message.createdAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </span>
            {message.editedAt && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>
        )}

        {/* Reply preview */}
        {message.replyToId && message.replyTo && (
          <div className="flex items-center gap-1 mb-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="text-gray-400">↩️</span>
            <span className="font-medium">{message.replyTo.user?.displayName}</span>
            <span className="truncate max-w-[200px]">{message.replyTo.content}</span>
          </div>
        )}

        {/* Message text */}
        <div
          className={`
            inline-block text-sm leading-relaxed
            ${isOwnMessage
              ? 'bg-blue-500 text-white rounded-2xl rounded-bl-md px-3 py-1.5'
              : isStaffOrMod
              ? 'bg-purple-100 dark:bg-purple-900/30 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-md px-3 py-1.5'
              : isAI
              ? 'bg-blue-100 dark:bg-blue-900/30 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-md px-3 py-1.5'
              : 'text-gray-800 dark:text-gray-200'
            }
          `}
        >
          <MessageContent content={message.content} />
        </div>

        {/* Thread indicator */}
        {message.threadReplyCount > 0 && (
          <button className="flex items-center gap-1 mt-1 text-xs text-blue-500 hover:underline">
            <span>💬</span>
            <span>{message.threadReplyCount} {message.threadReplyCount === 1 ? 'reply' : 'replies'}</span>
          </button>
        )}

        {/* Reactions */}
        <MessageReactions
          reactions={message.reactionCounts}
          userReactions={message.userReactions}
          onReaction={handleReaction}
        />
      </div>

      {/* Action buttons */}
      <MessageActions
        show={showActions}
        showReactionPicker={showReactionPicker}
        setShowReactionPicker={setShowReactionPicker}
        showMoreMenu={showMoreMenu}
        setShowMoreMenu={setShowMoreMenu}
        onReaction={handleReaction}
        onReply={() => setReplyingTo(message)}
        onDelete={isOwnMessage ? () => deleteMessage(message.id) : undefined}
        onReport={!isOwnMessage ? handleReport : undefined}
        onBlock={!isOwnMessage ? handleBlock : undefined}
      />
    </div>
  );
}

// =====================================================
// SUB-COMPONENTS
// =====================================================

function Avatar({
  user,
  onClick,
}: {
  user: ChatMessageType['user'];
  onClick?: () => void;
}) {
  const isAI = user?.badge === 'ai';

  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-full shrink-0 overflow-hidden bg-gray-200 dark:bg-gray-700 hover:ring-2 hover:ring-blue-500 transition-all"
    >
      {user?.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
      ) : (
        <div className={`w-full h-full flex items-center justify-center text-sm font-bold ${
          isAI ? 'bg-blue-500 text-white' : 'text-gray-500 dark:text-gray-400'
        }`}>
          {isAI ? '🤖' : user?.displayName?.charAt(0).toUpperCase() || '?'}
        </div>
      )}
    </button>
  );
}

function MessageContent({ content }: { content: string }) {
  // Simple emoji-only detection
  const isEmojiOnly = /^[\p{Emoji}\s]{1,10}$/u.test(content);

  if (isEmojiOnly) {
    return <span className="text-3xl">{content}</span>;
  }

  // Parse mentions and links
  const parts = content.split(/(@\w+)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          return (
            <span key={i} className="text-blue-400 font-medium">
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
}

function MessageReactions({
  reactions,
  userReactions,
  onReaction,
}: {
  reactions: Record<string, number>;
  userReactions?: string[];
  onReaction: (emoji: string) => void;
}) {
  const reactionEntries = Object.entries(reactions).filter(([, count]) => count > 0);

  if (reactionEntries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {reactionEntries.map(([emoji, count]) => {
        const hasReacted = userReactions?.includes(emoji);
        return (
          <button
            key={emoji}
            onClick={() => onReaction(emoji)}
            className={`
              inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs
              transition-colors
              ${hasReacted
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 ring-1 ring-blue-300 dark:ring-blue-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            <span>{emoji}</span>
            <span>{count}</span>
          </button>
        );
      })}
    </div>
  );
}

function MessageActions({
  show,
  showReactionPicker,
  setShowReactionPicker,
  showMoreMenu,
  setShowMoreMenu,
  onReaction,
  onReply,
  onDelete,
  onReport,
  onBlock,
}: {
  show: boolean;
  showReactionPicker: boolean;
  setShowReactionPicker: (show: boolean) => void;
  showMoreMenu: boolean;
  setShowMoreMenu: (show: boolean) => void;
  onReaction: (emoji: string) => void;
  onReply: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  onBlock?: () => void;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute -top-2 right-0 flex items-center gap-0.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-0.5"
        >
          {/* Quick react */}
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            title="Add reaction"
          >
            😊
          </button>

          {/* Reply */}
          <button
            onClick={onReply}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            title="Reply"
          >
            ↩️
          </button>

          {/* More menu */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            title="More"
          >
            ⋯
          </button>

          {/* Reaction picker dropdown */}
          <AnimatePresence>
            {showReactionPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex gap-1"
              >
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onReaction(emoji)}
                    className="text-xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* More menu dropdown */}
          <AnimatePresence>
            {showMoreMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-1 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[120px]"
              >
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    🗑️ Delete
                  </button>
                )}
                {onReport && (
                  <button
                    onClick={onReport}
                    className="w-full px-3 py-1.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    🚩 Report
                  </button>
                )}
                {onBlock && (
                  <button
                    onClick={onBlock}
                    className="w-full px-3 py-1.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    🚫 Block user
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
