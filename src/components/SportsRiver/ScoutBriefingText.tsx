'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const BRIEFING_PROMPT = `Summarize the biggest Chicago sports news from the last 24 hours for a fan. Use Markdown formatting:
- Use ## for section headings (e.g. ## Bears, ## Bulls).
- Use bullet lists (- or *) for key points under each team or topic.
- Use numbered lists (1. 2. 3.) when order matters (e.g. top story, then next).
- Keep paragraphs short. Cover Bears, Bulls, Blackhawks, Cubs, and White Sox if there is news. If you don't have specific recent news, give a brief league-wide or team outlook.`;

const FALLBACK_BRIEFING = `## Bears\nOffseason focus remains on supporting Caleb Williams and the offense; OTA dates and minicamp are ahead.\n\n## Bulls\nFront office and fans are weighing roster direction as the offseason approaches.\n\n## Blackhawks\nConnor Bedard and the young core continue to draw attention; schedule highlights and matchup talk.\n\n## Cubs\nPitching depth and deadline moves are in the rumor mill.\n\n## White Sox\nRebuild timeline and farm system progress stay in the conversation.`;

const CACHE_KEY = 'scout_briefing_24h';
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

function getCached(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { text, fetchedAt } = JSON.parse(raw);
    if (typeof text !== 'string' || !fetchedAt) return null;
    if (Date.now() - Number(fetchedAt) > CACHE_TTL_MS) return null;
    return text;
  } catch {
    return null;
  }
}

function setCached(text: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ text, fetchedAt: Date.now() }));
  } catch {}
}

interface ScoutBriefingTextProps {
  setRefreshFn?: (fn: () => void) => void;
}

export default function ScoutBriefingText({ setRefreshFn }: ScoutBriefingTextProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const mountedRef = useRef(true);

  const fetchBriefing = useCallback((bypassCache: boolean) => {
    if (!bypassCache) {
      const cached = getCached();
      if (cached) {
        setSummary(cached);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(false);

    fetch('/api/edge/scout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: BRIEFING_PROMPT }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!mountedRef.current) return;
        const text = data?.answer?.trim();
        const result = text && text.length > 80 ? text : FALLBACK_BRIEFING;
        setSummary(result);
        setCached(result);
      })
      .catch(() => {
        if (mountedRef.current) {
          setError(true);
          setSummary(FALLBACK_BRIEFING);
        }
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchBriefing(false);

    return () => {
      mountedRef.current = false;
    };
  }, [fetchBriefing]);

  useEffect(() => {
    setRefreshFn?.(() => fetchBriefing(true));
    return () => setRefreshFn?.(() => {});
  }, [setRefreshFn, fetchBriefing]);

  if (loading && !summary) {
    return (
      <div
        className="mt-4 rounded-xl border border-[var(--sm-border)] p-4"
        style={{ background: 'var(--sm-surface)' }}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-full rounded" style={{ background: 'var(--sm-border)' }} />
          <div className="h-3 w-full rounded" style={{ background: 'var(--sm-border)' }} />
          <div className="h-3 w-full max-w-[85%] rounded" style={{ background: 'var(--sm-border)' }} />
        </div>
      </div>
    );
  }

  const content = summary || FALLBACK_BRIEFING;

  return (
    <div
      className="mt-4 rounded-xl border border-[var(--sm-border)] p-5"
      style={{
        background: 'var(--sm-surface)',
      }}
    >
      <h4
        className="mb-3 text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--sm-text-meta)' }}
      >
        Last 24 hours
      </h4>
      <div
        className="scout-briefing-prose text-[15px] leading-[1.6]"
        style={{ color: 'var(--sm-text-secondary)' }}
      >
        <ReactMarkdown
          components={{
            h2: ({ children }) => (
              <h3 className="text-base font-semibold mt-4 mb-1 first:mt-0" style={{ color: 'var(--sm-text)' }}>
                {children}
              </h3>
            ),
            h3: ({ children }) => (
              <h4 className="text-[15px] font-semibold mt-3 mb-1" style={{ color: 'var(--sm-text)' }}>
                {children}
              </h4>
            ),
            p: ({ children }) => <p className="m-0 mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-0.5">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-0.5">{children}</ol>,
            li: ({ children }) => <li className="m-0">{children}</li>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      {error && (
        <p className="mt-3 text-xs" style={{ color: 'var(--sm-text-meta)' }}>
          Showing a quick overview. Live summary may be temporarily unavailable.
        </p>
      )}
    </div>
  );
}
