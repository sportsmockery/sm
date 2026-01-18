'use client';

/**
 * CHAT INPUT COMPONENT
 * Message composition with emoji, GIF, and moderation feedback
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/contexts/ChatContext';
import { ModerationResult } from '@/lib/chat/moderation';

interface ChatInputProps {
  teamColor?: string;
}

export function ChatInput({ teamColor }: ChatInputProps) {
  const {
    sendMessage,
    toggleEmojiPicker,
    toggleGifPicker,
    showEmojiPicker,
    showGifPicker,
    canSendMessage,
    cooldownSeconds,
    replyingTo,
  } = useChat();

  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [showTip, setShowTip] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Clear moderation error after 3 seconds
  useEffect(() => {
    if (moderationError) {
      const timer = setTimeout(() => setModerationError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [moderationError]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || !canSendMessage) return;

    setIsSending(true);
    setModerationError(null);

    try {
      const result = await sendMessage(trimmedMessage);

      if (result && !result.approved) {
        // Show moderation feedback
        setModerationError(result.blockedReason || 'Message not sent');

        // Show helpful tip for certain violations
        if (result.flags.some(f => f.category === 'profanity')) {
          setShowTip(true);
        }
      } else {
        // Message sent successfully
        setMessage('');
        setShowTip(false);
      }
    } catch (error) {
      setModerationError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleGifSelect = async (gifUrl: string) => {
    setIsSending(true);
    try {
      await sendMessage(gifUrl, 'gif', gifUrl);
      toggleGifPicker(false);
    } catch (error) {
      setModerationError('Failed to send GIF');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Moderation error */}
      <AnimatePresence>
        {moderationError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 py-2 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800"
          >
            <div className="flex items-start gap-2">
              <span className="text-red-500">⚠️</span>
              <div className="flex-1">
                <p className="text-sm text-red-700 dark:text-red-300">{moderationError}</p>
                {showTip && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Tip: Keep it friendly! This is a family-friendly sports chat.
                  </p>
                )}
              </div>
              <button
                onClick={() => setModerationError(null)}
                className="text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cooldown indicator */}
      <AnimatePresence>
        {!canSendMessage && cooldownSeconds > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-800"
          >
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              ⏳ Slow mode: Wait {cooldownSeconds}s before sending another message
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-3">
        <div className="flex items-end gap-2">
          {/* Media buttons */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => toggleEmojiPicker()}
              className={`p-2 rounded-full transition-colors ${
                showEmojiPicker
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title="Add emoji"
            >
              😊
            </button>
            <button
              type="button"
              onClick={() => toggleGifPicker()}
              className={`p-2 rounded-full transition-colors ${
                showGifPicker
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title="Add GIF"
            >
              GIF
            </button>
          </div>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={replyingTo ? 'Write a reply...' : 'Type a message...'}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-2xl resize-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-[120px]"
              rows={1}
              maxLength={1000}
              disabled={!canSendMessage}
            />

            {/* Character count */}
            {message.length > 800 && (
              <span className={`absolute bottom-2 right-3 text-xs ${
                message.length > 950 ? 'text-red-500' : 'text-gray-400'
              }`}>
                {message.length}/1000
              </span>
            )}
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!message.trim() || isSending || !canSendMessage}
            className={`
              p-2.5 rounded-full transition-all
              ${message.trim() && canSendMessage
                ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
            style={message.trim() && canSendMessage && teamColor ? { backgroundColor: teamColor } : {}}
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

      {/* Emoji picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <EmojiPickerInline onSelect={handleEmojiSelect} onClose={() => toggleEmojiPicker(false)} />
        )}
      </AnimatePresence>

      {/* GIF picker */}
      <AnimatePresence>
        {showGifPicker && (
          <GifPickerInline onSelect={handleGifSelect} onClose={() => toggleGifPicker(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// INLINE PICKERS
// =====================================================

function EmojiPickerInline({
  onSelect,
  onClose,
}: {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}) {
  const categories = [
    { name: 'Sports', emojis: ['⚽', '🏀', '🏈', '⚾', '🏒', '🎾', '🏐', '🏆', '🥇', '🥈', '🥉', '🏅', '🎯', '🎳'] },
    { name: 'Reactions', emojis: ['👍', '👎', '👏', '🙌', '💪', '🔥', '❤️', '💯', '😂', '🤣', '😭', '😮', '🤔', '😤'] },
    { name: 'Chicago', emojis: ['🐻', '🦁', '🐂', '🦅', '⭐', '🌆', '🌃', '🍕', '🌭', '🍺', '🎵', '🎸', '🎤', '🎪'] },
    { name: 'Celebration', emojis: ['🎉', '🎊', '🥳', '🎈', '🎁', '🍾', '🥂', '🌟', '✨', '💥', '💫', '⚡', '🌈', '🎆'] },
    { name: 'Faces', emojis: ['😀', '😃', '😄', '😁', '😅', '😎', '🤩', '😍', '🥰', '😘', '😋', '😜', '🤪', '😏'] },
  ];

  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
    >
      {/* Category tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 px-2">
        {categories.map((cat, idx) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(idx)}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              idx === activeCategory
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="p-3 grid grid-cols-7 gap-1 max-h-[200px] overflow-y-auto">
        {categories[activeCategory].emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="w-9 h-9 flex items-center justify-center text-2xl hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function GifPickerInline({
  onSelect,
  onClose,
}: {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [gifs, setGifs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Sports-themed trending GIFs (placeholder - would use GIPHY/Tenor API)
  const trendingGifs = [
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', // Celebration
    'https://media.giphy.com/media/3o7TKnO6Wve6502iJ2/giphy.gif', // Sports
    'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.gif', // Victory
    'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', // Dance
    'https://media.giphy.com/media/l3q2LH45XElELRzRm/giphy.gif', // Hype
    'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif', // Bears
  ];

  useEffect(() => {
    // In production, search GIPHY/Tenor API
    setGifs(trendingGifs);
  }, []);

  const searchGifs = async (query: string) => {
    if (!query.trim()) {
      setGifs(trendingGifs);
      return;
    }

    setLoading(true);
    // In production: fetch from GIPHY/Tenor API
    // const response = await fetch(`/api/gifs/search?q=${encodeURIComponent(query)}`);
    // const data = await response.json();
    // setGifs(data.gifs);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
    >
      {/* Search */}
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            searchGifs(e.target.value);
          }}
          placeholder="Search GIFs..."
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* GIF grid */}
      <div className="p-2 grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
        {loading ? (
          <div className="col-span-2 flex justify-center py-8">
            <LoadingDots />
          </div>
        ) : gifs.length > 0 ? (
          gifs.map((gif, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(gif)}
              className="relative aspect-video rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
            >
              <img
                src={gif}
                alt="GIF"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-500 text-sm">
            No GIFs found
          </div>
        )}
      </div>

      {/* Powered by */}
      <div className="px-3 py-2 text-xs text-gray-400 text-center border-t border-gray-200 dark:border-gray-700">
        Powered by GIPHY
      </div>
    </motion.div>
  );
}

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

export { EmojiPickerInline, GifPickerInline };
