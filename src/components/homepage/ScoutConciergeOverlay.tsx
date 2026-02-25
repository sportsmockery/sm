// src/components/homepage/ScoutConciergeOverlay.tsx
'use client';

import Image from 'next/image';

interface ScoutData {
  summary: string;
  tl_dr: string;
  next_watch: string[];
}

interface ScoutConciergeOverlayProps {
  isLoading: boolean;
  error: string | null;
  data: ScoutData | null;
  onClose: () => void;
}

export function ScoutConciergeOverlay({
  isLoading,
  error,
  data,
  onClose,
}: ScoutConciergeOverlayProps) {
  return (
    <div className="scout-concierge-overlay" onClick={(e) => e.stopPropagation()}>
      {/* Close button */}
      <button className="scout-concierge-close" onClick={onClose} aria-label="Close Scout summary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Header */}
      <div className="scout-concierge-header">
        <Image src="/downloads/scout-v2.png" alt="Scout AI" width={28} height={28} unoptimized />
        <span className="scout-concierge-title">Scout on this story</span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="scout-concierge-loading">
          <div className="scout-concierge-skeleton" />
          <div className="scout-concierge-skeleton scout-concierge-skeleton--short" />
          <div className="scout-concierge-skeleton scout-concierge-skeleton--mid" />
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <p className="scout-concierge-error">{error}</p>
      )}

      {/* Data state */}
      {data && !isLoading && (
        <div className="scout-concierge-body">
          {/* TL;DR */}
          {data.tl_dr && (
            <p className="scout-concierge-tldr">
              <strong>TL;DR:</strong> {data.tl_dr}
            </p>
          )}

          {/* Summary */}
          <p className="scout-concierge-summary">{data.summary}</p>

          {/* Next Watch */}
          {data.next_watch.length > 0 && (
            <div className="scout-concierge-next">
              <span className="scout-concierge-next-label">Watch next</span>
              <ul>
                {data.next_watch.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
