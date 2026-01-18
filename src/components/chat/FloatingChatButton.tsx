'use client';

/**
 * FLOATING CHAT BUTTON
 * Displays on article pages, shows team-specific prompt
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/contexts/ChatContext';
import { ChicagoTeam } from '@/lib/chat/ai-responder';

// Team display info
const TEAM_DISPLAY: Record<ChicagoTeam, { name: string; emoji: string; color: string; gradient: string }> = {
  bears: {
    name: 'Bears',
    emoji: '🐻',
    color: '#0B162A',
    gradient: 'from-[#0B162A] to-[#C83803]',
  },
  cubs: {
    name: 'Cubs',
    emoji: '⚾',
    color: '#0E3386',
    gradient: 'from-[#0E3386] to-[#CC3433]',
  },
  bulls: {
    name: 'Bulls',
    emoji: '🏀',
    color: '#CE1141',
    gradient: 'from-[#CE1141] to-[#000000]',
  },
  'white-sox': {
    name: 'White Sox',
    emoji: '⚾',
    color: '#27251F',
    gradient: 'from-[#27251F] to-[#C4CED4]',
  },
  blackhawks: {
    name: 'Blackhawks',
    emoji: '🏒',
    color: '#CF0A2C',
    gradient: 'from-[#CF0A2C] to-[#000000]',
  },
};

interface FloatingChatButtonProps {
  teamSlug: ChicagoTeam;
  onlineCount?: number;
  className?: string;
}

export function FloatingChatButton({
  teamSlug,
  onlineCount = 0,
  className = '',
}: FloatingChatButtonProps) {
  const { isOpen, toggleChat, joinRoom, isAuthenticated, onlineUsers } = useChat();
  const team = TEAM_DISPLAY[teamSlug];

  const handleClick = () => {
    if (!isOpen) {
      joinRoom(teamSlug);
    }
    toggleChat();
  };

  const actualOnlineCount = onlineUsers.length || onlineCount;

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`fixed bottom-6 right-6 z-50 ${className}`}
        >
          <button
            onClick={handleClick}
            className={`
              group relative flex items-center gap-3
              px-5 py-3 rounded-full
              bg-gradient-to-r ${team.gradient}
              text-white font-semibold
              shadow-lg shadow-black/25
              hover:shadow-xl hover:shadow-black/30
              hover:scale-105
              active:scale-95
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent
            `}
          >
            {/* Animated ring */}
            <span className="absolute inset-0 rounded-full animate-ping bg-white/20 opacity-75" />

            {/* Team emoji */}
            <span className="text-2xl relative z-10">{team.emoji}</span>

            {/* Text */}
            <span className="relative z-10 whitespace-nowrap">
              Hang out with <span className="font-bold">{team.name}</span> fans
            </span>

            {/* Online indicator */}
            {actualOnlineCount > 0 && (
              <span className="relative z-10 flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>{actualOnlineCount}</span>
              </span>
            )}

            {/* Hover effect */}
            <motion.span
              className="absolute inset-0 rounded-full bg-white/10"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          </button>

          {/* Guest prompt */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap"
            >
              <span className="text-xs">👀 Watch the chat • Login to join!</span>
              {/* Arrow */}
              <span className="absolute -bottom-1 right-8 w-2 h-2 bg-white dark:bg-gray-800 rotate-45" />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Compact version for mobile or smaller spaces
 */
export function FloatingChatButtonCompact({
  teamSlug,
  className = '',
}: {
  teamSlug: ChicagoTeam;
  className?: string;
}) {
  const { isOpen, toggleChat, joinRoom, onlineUsers } = useChat();
  const team = TEAM_DISPLAY[teamSlug];

  const handleClick = () => {
    if (!isOpen) {
      joinRoom(teamSlug);
    }
    toggleChat();
  };

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={handleClick}
          className={`
            fixed bottom-4 right-4 z-50
            w-14 h-14 rounded-full
            bg-gradient-to-r ${team.gradient}
            text-white text-2xl
            shadow-lg shadow-black/25
            hover:scale-110 active:scale-95
            transition-transform duration-200
            flex items-center justify-center
            focus:outline-none focus:ring-2 focus:ring-white/50
            ${className}
          `}
        >
          {team.emoji}

          {/* Online badge */}
          {onlineUsers.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full text-xs flex items-center justify-center font-bold">
              {onlineUsers.length > 9 ? '9+' : onlineUsers.length}
            </span>
          )}

          {/* Ping animation */}
          <span className="absolute inset-0 rounded-full animate-ping bg-white/30" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export { TEAM_DISPLAY };
