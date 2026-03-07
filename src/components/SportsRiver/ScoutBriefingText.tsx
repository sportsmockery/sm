'use client';

import React, { useEffect, useState } from 'react';

const BRIEFING_PROMPT = `Summarize the biggest Chicago sports news from the last 24 hours for a fan. Write 3 to 5 short paragraphs. Cover Bears, Bulls, Blackhawks, Cubs, and White Sox if there is news. Use clear paragraphs and simple language. No bullet points—just flowing summary. If you don't have specific recent news, give a brief league-wide or team outlook.`;

const FALLBACK_BRIEFING = `Bears: Offseason focus remains on supporting Caleb Williams and the offense; OTA dates and minicamp are ahead. Bulls: Front office and fans are weighing roster direction as the offseason approaches. Blackhawks: Connor Bedard and the young core continue to draw attention; schedule highlights and matchup talk. Cubs: Pitching depth and deadline moves are in the rumor mill. White Sox: Rebuild timeline and farm system progress stay in the conversation.`;

export default function ScoutBriefingText() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/edge/scout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: BRIEFING_PROMPT }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const text = data?.answer?.trim();
        if (text && text.length > 80) {
          setSummary(text);
        } else {
          setSummary(FALLBACK_BRIEFING);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setSummary(FALLBACK_BRIEFING);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

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

  const paragraphs = summary
    ? summary
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

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
        className="scout-briefing-prose space-y-4 text-[15px] leading-[1.6]"
        style={{ color: 'var(--sm-text-secondary)' }}
      >
        {paragraphs.length > 0 ? (
          paragraphs.map((para, i) => (
            <p key={i} className="m-0">
              {para}
            </p>
          ))
        ) : (
          <p className="m-0">{summary || FALLBACK_BRIEFING}</p>
        )}
      </div>
      {error && (
        <p className="mt-3 text-xs" style={{ color: 'var(--sm-text-meta)' }}>
          Showing a quick overview. Live summary may be temporarily unavailable.
        </p>
      )}
    </div>
  );
}
