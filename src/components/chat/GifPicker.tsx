'use client';

/**
 * GIF PICKER COMPONENT (Standalone modal version)
 * Uses Tenor/GIPHY API for GIF search
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '@/contexts/ChatContext';

interface GifPickerProps {
  onClose: () => void;
}

interface GifResult {
  id: string;
  url: string;
  preview: string;
  width: number;
  height: number;
}

// Sports-themed trending GIFs (fallback when no API key)
const FALLBACK_GIFS: GifResult[] = [
  { id: '1', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', preview: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/200w.gif', width: 200, height: 150 },
  { id: '2', url: 'https://media.giphy.com/media/3o7TKnO6Wve6502iJ2/giphy.gif', preview: 'https://media.giphy.com/media/3o7TKnO6Wve6502iJ2/200w.gif', width: 200, height: 150 },
  { id: '3', url: 'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/giphy.gif', preview: 'https://media.giphy.com/media/l0HlQ7LRalQqdWfao/200w.gif', width: 200, height: 150 },
  { id: '4', url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif', preview: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/200w.gif', width: 200, height: 150 },
  { id: '5', url: 'https://media.giphy.com/media/l3q2LH45XElELRzRm/giphy.gif', preview: 'https://media.giphy.com/media/l3q2LH45XElELRzRm/200w.gif', width: 200, height: 150 },
  { id: '6', url: 'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif', preview: 'https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/200w.gif', width: 200, height: 150 },
];

const QUICK_CATEGORIES = [
  { name: 'Sports', query: 'sports celebration' },
  { name: 'Bears', query: 'chicago bears nfl' },
  { name: 'Bulls', query: 'chicago bulls nba' },
  { name: 'Cubs', query: 'chicago cubs mlb' },
  { name: 'Victory', query: 'victory celebration' },
  { name: 'Reaction', query: 'reaction funny' },
];

export function GifPicker({ onClose }: GifPickerProps) {
  const { sendMessage } = useChat();
  const [search, setSearch] = useState('');
  const [gifs, setGifs] = useState<GifResult[]>(FALLBACK_GIFS);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Search GIFs
  const searchGifs = useCallback(async (query: string) => {
    if (!query.trim()) {
      setGifs(FALLBACK_GIFS);
      return;
    }

    setLoading(true);

    try {
      // In production, use your API route that calls GIPHY/Tenor
      const response = await fetch(`/api/gifs/search?q=${encodeURIComponent(query)}&limit=20`);

      if (response.ok) {
        const data = await response.json();
        setGifs(data.gifs || FALLBACK_GIFS);
      } else {
        // Fallback if API not configured
        setGifs(FALLBACK_GIFS);
      }
    } catch (error) {
      console.error('GIF search error:', error);
      setGifs(FALLBACK_GIFS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        searchGifs(search);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, searchGifs]);

  const handleCategoryClick = (category: typeof QUICK_CATEGORIES[0]) => {
    setActiveCategory(category.name);
    setSearch(category.query);
    searchGifs(category.query);
  };

  const handleGifSelect = (gif: GifResult) => {
    sendMessage(gif.url, 'gif', gif.url);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[400px] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GIFs</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setActiveCategory(null);
          }}
          placeholder="Search GIFs..."
          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Quick categories */}
      <div className="flex gap-1 p-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {QUICK_CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => handleCategoryClick(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.name
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* GIF grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        ) : gifs.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => handleGifSelect(gif)}
                className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 hover:ring-2 hover:ring-blue-500 transition-all group"
              >
                <img
                  src={gif.preview || gif.url}
                  alt="GIF"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <span className="text-4xl mb-2">🔍</span>
            <span className="text-sm">No GIFs found</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Powered by GIPHY</span>
          <img
            src="https://giphy.com/static/img/giphy_logo_square_social.png"
            alt="GIPHY"
            className="h-4 w-auto opacity-50"
          />
        </div>
      </div>
    </motion.div>
  );
}
