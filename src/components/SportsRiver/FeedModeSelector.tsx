'use client';

import React, { useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const FEED_MODES = [
  { key: 'for_you', label: 'For You', icon: '⚡' },
  { key: 'live', label: 'Live', icon: '🔴' },
  { key: 'trending', label: 'Trending', icon: '🔥' },
  { key: 'scout', label: 'Scout', icon: '🤖' },
  { key: 'community', label: 'Community', icon: '💬' },
  { key: 'watch', label: 'Watch', icon: '📺' },
  { key: 'listen', label: 'Listen', icon: '🎧' },
  { key: 'data', label: 'Data', icon: '📊' },
];

const LS_FEED_MODE = 'sm_feed_mode';

interface FeedModeSelectorProps {
  currentMode: string;
  onModeChange: (mode: string) => void;
}

export default function FeedModeSelector({ currentMode, onModeChange }: FeedModeSelectorProps) {
  const { isAuthenticated } = useAuth();

  // Restore persisted mode on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(LS_FEED_MODE);
    if (saved && saved !== currentMode && FEED_MODES.some(m => m.key === saved)) {
      onModeChange(saved);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = useCallback(
    (mode: string) => {
      onModeChange(mode);

      if (isAuthenticated) {
        fetch('/api/user/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedMode: mode }),
        }).catch(() => {});
      } else if (typeof window !== 'undefined') {
        localStorage.setItem(LS_FEED_MODE, mode);
      }
    },
    [onModeChange, isAuthenticated]
  );

  return (
    <nav aria-label="Feed modes" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {FEED_MODES.map(mode => {
        const isActive = currentMode === mode.key;
        return (
          <button
            key={mode.key}
            onClick={() => handleChange(mode.key)}
            aria-current={isActive ? 'true' : undefined}
            aria-label={`${mode.label} feed mode`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: 'none',
              borderLeft: isActive ? '2px solid #00D4FF' : '2px solid transparent',
              background: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
              color: isActive ? '#00D4FF' : 'rgba(230, 232, 236, 0.7)',
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
              outline: 'none',
              fontFamily: 'Barlow, sans-serif',
            }}
            onMouseEnter={e => {
              if (!isActive) e.currentTarget.style.color = '#FAFAFB';
            }}
            onMouseLeave={e => {
              if (!isActive) e.currentTarget.style.color = 'rgba(230, 232, 236, 0.7)';
            }}
            onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0, 212, 255, 0.4)'; }}
            onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{mode.icon}</span>
            <span>{mode.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
