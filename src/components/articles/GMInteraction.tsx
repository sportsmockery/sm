'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GMInteractionProps {
  question: string;
  options: string[];
  reward?: number;
  /** When false, hides the internal "GM Pulse" header (e.g. when an outer wrapper already labels it). */
  showHeader?: boolean;
  /** Override the header label. */
  headerLabel?: string;
}

export function GMInteraction({ question, options, reward = 3, showHeader = true, headerLabel = 'GM Pulse' }: GMInteractionProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    setShowReward(true);
    setTimeout(() => setShowReward(false), 2000);
  };

  return (
    <div
      className="rounded-xl p-5 my-8 bg-[rgba(11,15,20,0.03)] dark:bg-[rgba(255,255,255,0.04)] border border-[rgba(11,15,20,0.08)] dark:border-[rgba(255,255,255,0.08)]"
    >
      {showHeader && (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00D4FF' }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#00D4FF' }}>
            {headerLabel}
          </span>
        </div>
      )}

      <p className="text-[16px] font-medium mb-4" style={{ color: 'var(--sm-text, #0B0F14)' }}>{question}</p>

      <div className="flex items-center gap-3 relative">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleSelect(option)}
            disabled={!!selected}
            className="px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-all min-h-[44px]"
            style={{
              backgroundColor: selected === option ? '#00D4FF' : 'rgba(0,212,255,0.1)',
              color: selected === option ? '#0B0F14' : '#00D4FF',
              border: `1px solid ${selected === option ? '#00D4FF' : 'rgba(0,212,255,0.3)'}`,
              opacity: selected && selected !== option ? 0.4 : 1,
            }}
          >
            {option}
          </button>
        ))}

        <AnimatePresence>
          {showReward && (
            <motion.span
              className="absolute -top-6 right-0 text-sm font-bold"
              style={{ color: '#00D4FF' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              +{reward} GM Score
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
