'use client';

/**
 * EMOJI PICKER COMPONENT (Standalone modal version)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '@/contexts/ChatContext';

interface EmojiPickerProps {
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Sports',
    icon: '⚽',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🏒', '🎾', '🏐', '🎱', '🏓', '🏸',
      '🥊', '🥋', '⛳', '🏌️', '🏇', '🏂', '🛷', '⛷️', '🏋️', '🤼',
      '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🎯', '🎳', '🎮', '🎲',
    ],
  },
  {
    name: 'Reactions',
    icon: '👍',
    emojis: [
      '👍', '👎', '👏', '🙌', '🤝', '💪', '🤞', '✌️', '🤟', '🤘',
      '🔥', '💥', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
      '💯', '💢', '💫', '⭐', '🌟', '✨', '⚡', '🎉', '🎊', '🎁',
    ],
  },
  {
    name: 'Faces',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
      '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
      '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
      '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔',
      '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵',
      '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕',
      '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧',
      '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓',
      '😤', '😡', '😠', '🤬', '👿', '💀', '☠️', '💩', '🤡', '👻',
    ],
  },
  {
    name: 'Animals',
    icon: '🐻',
    emojis: [
      '🐻', '🐻‍❄️', '🦁', '🐯', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉',
      '🙊', '🐔', '🐧', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴',
      '🦄', '🐝', '🦋', '🐌', '🐛', '🦂', '🐍', '🦎', '🐢', '🦖',
      '🦕', '🐙', '🦑', '🦐', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳',
      '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛',
    ],
  },
  {
    name: 'Food',
    icon: '🍕',
    emojis: [
      '🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🥙', '🥚', '🍳',
      '🥘', '🍲', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘',
      '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥',
      '🥮', '🍡', '🥟', '🥠', '🥡', '🦀', '🦞', '🦐', '🦑', '🦪',
      '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫',
    ],
  },
  {
    name: 'Chicago',
    icon: '🌆',
    emojis: [
      '🌆', '🌃', '🏙️', '🌇', '🌄', '🌅', '🌉', '🗽', '🏟️', '🎡',
      '🎢', '🎠', '⛲', '🚇', '🚌', '🚕', '🏛️', '🏢', '🏬', '🏪',
      '🏨', '🏥', '🏦', '🏫', '⛪', '🕌', '🛕', '🕍', '⛩️', '🏯',
      '🏰', '🗼', '🗿', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎵',
      '🎶', '🎸', '🎹', '🎺', '🎻', '🥁', '🎷', '🪕', '🎲', '🎯',
    ],
  },
];

export function EmojiPicker({ onClose }: EmojiPickerProps) {
  const { sendMessage } = useChat();
  const [activeCategory, setActiveCategory] = useState(0);
  const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentEmojis');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const handleEmojiSelect = (emoji: string) => {
    // Add to recent
    const newRecent = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 16);
    setRecentEmojis(newRecent);
    if (typeof window !== 'undefined') {
      localStorage.setItem('recentEmojis', JSON.stringify(newRecent));
    }

    // Send as message
    sendMessage(emoji);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[350px] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Emoji</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 px-1 overflow-x-auto">
        {recentEmojis.length > 0 && (
          <button
            onClick={() => setActiveCategory(-1)}
            className={`p-2 text-lg transition-colors ${
              activeCategory === -1
                ? 'bg-gray-100 dark:bg-gray-700 rounded-t'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
            title="Recent"
          >
            🕐
          </button>
        )}
        {EMOJI_CATEGORIES.map((cat, idx) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(idx)}
            className={`p-2 text-lg transition-colors ${
              idx === activeCategory
                ? 'bg-gray-100 dark:bg-gray-700 rounded-t'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
            title={cat.name}
          >
            {cat.icon}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-8 gap-0.5">
          {activeCategory === -1
            ? recentEmojis.map((emoji, idx) => (
                <button
                  key={`recent-${idx}`}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="w-9 h-9 flex items-center justify-center text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  {emoji}
                </button>
              ))
            : EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, idx) => (
                <button
                  key={`${EMOJI_CATEGORIES[activeCategory].name}-${idx}`}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="w-9 h-9 flex items-center justify-center text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
        </div>
      </div>

      {/* Category name */}
      <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {activeCategory === -1 ? 'Recent' : EMOJI_CATEGORIES[activeCategory].name}
        </span>
      </div>
    </motion.div>
  );
}
