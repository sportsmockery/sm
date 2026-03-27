'use client';

import React, { useCallback, useRef, useState } from 'react';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from '../BaseGlassCard';
import { CardActionButtons } from '../CardActionButtons';
import { CARD_TYPE_LABELS, formatTimestamp } from './utils';

interface PollCardProps {
  card: RiverCard;
}

interface PollOption {
  id: string;
  label: string;
  votes: number;
}

function getOrCreateAnonymousId(): string {
  const key = 'sm_anonymous_id';
  if (typeof window === 'undefined') return crypto.randomUUID();
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export const PollCard = React.memo(function PollCard({ card }: PollCardProps) {
  const c = card.content as Record<string, unknown>;
  const question = (c.question as string | undefined) ?? 'What do you think?';
  const pollId = c.poll_id as string | undefined;
  const rawOptions = c.options as PollOption[] | undefined;

  const defaultOptions: PollOption[] = [
    { id: 'yes', label: 'Yes', votes: 0 },
    { id: 'no', label: 'No', votes: 0 },
  ];

  const [options, setOptions] = useState<PollOption[]>(rawOptions ?? defaultOptions);
  const [votedId, setVotedId] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const prevOptionsRef = useRef<PollOption[]>(rawOptions ?? defaultOptions);

  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

  const handleVote = useCallback(
    async (optionId: string) => {
      if (votedId) return;
      setVoteError(null);

      // Save previous state for rollback
      prevOptionsRef.current = options;

      // Optimistic update
      setVotedId(optionId);
      setOptions((prev) =>
        prev.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o))
      );

      if (pollId) {
        try {
          const res = await fetch(`/api/polls/${pollId}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              option_ids: [optionId],
              anonymous_id: getOrCreateAnonymousId(),
            }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Vote failed');
          }
        } catch (err) {
          // Revert optimistic state
          setVotedId(null);
          setOptions(prevOptionsRef.current);
          setVoteError(err instanceof Error ? err.message : 'Vote failed. Try again.');
        }
      }
    },
    [votedId, pollId, options]
  );

  const getPercent = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <BaseGlassCard trackingToken={card.tracking_token} accentColor={card.ui_directives.accent}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold uppercase tracking-widest" style={{ color: '#BC0000', fontSize: 16 }}>
          {CARD_TYPE_LABELS[card.card_type]}
        </span>
        <span className="text-[#E6E8EC]/60" style={{ fontSize: 16 }}>{formatTimestamp(card.timestamp)}</span>
      </div>

      {/* Question */}
      <h3 className="font-bold text-[#FAFAFB] mb-4" style={{ fontSize: 22 }}>{question}</h3>

      {/* Options */}
      <div className="space-y-2">
        {options.map((option) => {
          const pct = getPercent(option.votes);
          const isVoted = votedId === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={!!votedId}
              className={`relative w-full text-left rounded-lg overflow-hidden min-h-[44px] transition-all duration-300 ${
                votedId
                  ? 'cursor-default'
                  : 'cursor-pointer hover:border-[#BC0000]'
              } border border-[#2B3442] bg-[#121821]`}
              aria-label={`Vote for ${option.label}`}
            >
              {/* Progress bar background */}
              {votedId && (
                <div
                  className="absolute inset-y-0 left-0 bg-[#BC0000]/20 transition-all duration-500 ease-out"
                  style={{ width: `${pct}%` }}
                />
              )}
              <div className="relative flex items-center justify-between px-4 py-3">
                <span className={`font-bold ${isVoted ? 'text-[#BC0000]' : 'text-[#FAFAFB]'}`} style={{ fontFamily: 'Inter, sans-serif', fontSize: 18 }}>
                  {option.label}
                </span>
                {votedId && (
                  <span className="font-bold text-[#E6E8EC]/60" style={{ fontSize: 16 }}>{pct}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Post-vote message */}
      {votedId && (
        <p className="text-[#E6E8EC]/40 mt-2" style={{ fontFamily: 'Inter, sans-serif', fontSize: 16 }}>
          See how fans voted
        </p>
      )}

      {/* Vote error */}
      {voteError && (
        <p className="text-[#BC0000] mt-2" style={{ fontFamily: 'Inter, sans-serif', fontSize: 16 }}>
          {voteError}
        </p>
      )}

      {/* Footer */}
      <CardActionButtons commentsCount={(c.comments_count as number) ?? 0} />
    </BaseGlassCard>
  );
});
