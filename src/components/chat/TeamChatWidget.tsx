'use client';

/**
 * TEAM CHAT WIDGET
 * Wrapper component that adds chat to article pages
 * Determines team from article category
 */

import React, { useEffect, useState } from 'react';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import { FloatingChatButton, FloatingChatButtonCompact } from './FloatingChatButton';
import { TeamChatPanel } from './TeamChatPanel';
import { ChicagoTeam } from '@/lib/chat/ai-responder';

// Map category slugs to team slugs
const CATEGORY_TO_TEAM: Record<string, ChicagoTeam> = {
  // Bears
  'bears': 'bears',
  'chicago-bears': 'bears',
  'nfl': 'bears',
  'football': 'bears',
  // Cubs
  'cubs': 'cubs',
  'chicago-cubs': 'cubs',
  // White Sox
  'white-sox': 'white-sox',
  'whitesox': 'white-sox',
  'chicago-white-sox': 'white-sox',
  // Bulls
  'bulls': 'bulls',
  'chicago-bulls': 'bulls',
  'nba': 'bulls',
  'basketball': 'bulls',
  // Blackhawks
  'blackhawks': 'blackhawks',
  'chicago-blackhawks': 'blackhawks',
  'nhl': 'blackhawks',
  'hockey': 'blackhawks',
  // MLB general
  'mlb': 'cubs',
  'baseball': 'cubs',
};

interface TeamChatWidgetProps {
  categorySlug?: string;
  categoryName?: string;
  articleId?: string;
  compact?: boolean;
}

function TeamChatWidgetInner({
  categorySlug,
  categoryName,
  articleId,
  compact = false,
}: TeamChatWidgetProps) {
  const { isOpen, currentRoom, joinRoom } = useChat();
  const [teamSlug, setTeamSlug] = useState<ChicagoTeam>('bears');

  // Determine team from category
  useEffect(() => {
    if (categorySlug) {
      const normalizedSlug = categorySlug.toLowerCase().replace(/\s+/g, '-');
      const team = CATEGORY_TO_TEAM[normalizedSlug] || 'bears';
      setTeamSlug(team);
    }
  }, [categorySlug]);

  // Auto-join room when widget opens
  useEffect(() => {
    if (isOpen && !currentRoom) {
      joinRoom(teamSlug);
    }
  }, [isOpen, currentRoom, teamSlug, joinRoom]);

  return (
    <>
      {/* Floating button */}
      {compact ? (
        <FloatingChatButtonCompact teamSlug={teamSlug} />
      ) : (
        <FloatingChatButton teamSlug={teamSlug} />
      )}

      {/* Chat panel */}
      <TeamChatPanel />
    </>
  );
}

export function TeamChatWidget(props: TeamChatWidgetProps) {
  return (
    <ChatProvider>
      <TeamChatWidgetInner {...props} />
    </ChatProvider>
  );
}

/**
 * Hook to get team slug from window location or category
 */
export function useTeamFromUrl(): ChicagoTeam {
  const [team, setTeam] = useState<ChicagoTeam>('bears');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const path = window.location.pathname;

    // Check URL path for team indicators
    for (const [pattern, teamSlug] of Object.entries(CATEGORY_TO_TEAM)) {
      if (path.toLowerCase().includes(pattern)) {
        setTeam(teamSlug);
        return;
      }
    }

    // Default to Bears
    setTeam('bears');
  }, []);

  return team;
}

export { CATEGORY_TO_TEAM };
