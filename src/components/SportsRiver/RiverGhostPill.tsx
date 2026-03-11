'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '@/context/WebSocketProvider';
import type { RiverCard } from '@/lib/river-types';

const CARD_TYPE_LABELS: Record<string, string> = {
  scout_summary: 'Scout Summary',
  hub_update: 'Hub Update',
  trade_proposal: 'Trade Proposal',
  vision_theater: 'Vision Theater',
  trending_article: 'Article',
  box_score: 'Box Score',
  trending_player: 'Trending Player',
  fan_chat: 'Fan Chat',
  mock_draft: 'Mock Draft',
  sm_plus: 'SM+ Content',
  infographic: 'Infographic',
  chart: 'Chart',
  poll: 'Poll',
  comment_spotlight: 'Comment',
  listen_now: 'Audio',
  join_newsletter: 'Newsletter',
  download_app: 'App',
};

interface RiverGhostPillProps {
  onScrollToTop: () => void;
}

const AUTO_DISMISS_MS = 8000;

export default function RiverGhostPill({ onScrollToTop }: RiverGhostPillProps) {
  const { onInjection } = useWebSocket();
  const [pendingCard, setPendingCard] = useState<RiverCard | null>(null);
  const [visible, setVisible] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAtTop = useCallback(() => {
    return window.scrollY < 100;
  }, []);

  useEffect(() => {
    const unsub = onInjection((card: RiverCard) => {
      if (isAtTop()) {
        // User is at top — card slides in directly, no pill needed
        return;
      }

      setPendingCard(card);
      setVisible(true);

      // Auto-dismiss after 8 seconds
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => {
        setVisible(false);
      }, AUTO_DISMISS_MS);
    });

    return () => {
      unsub();
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [onInjection, isAtTop]);

  const handleTap = useCallback(() => {
    setVisible(false);
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    onScrollToTop();
  }, [onScrollToTop]);

  const label = pendingCard
    ? CARD_TYPE_LABELS[pendingCard.card_type] || 'Post'
    : 'Post';

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={handleTap}
          style={{
            position: 'fixed',
            top: 64,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            background: 'rgba(27,36,48,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid #BC0000',
            borderRadius: 9999,
            padding: '8px 20px',
            color: '#FAFAFB',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          New {label} &middot; Tap to see &uarr;
        </motion.button>
      )}
    </AnimatePresence>
  );
}
