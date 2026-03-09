'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DebateBlockProps {
  proArgument: string;
  conArgument: string;
  reward?: number;
}

export function DebateBlock({ proArgument, conArgument, reward = 3 }: DebateBlockProps) {
  const [vote, setVote] = useState<'pro' | 'con' | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [proPercent, setProPercent] = useState(54);

  const handleVote = (side: 'pro' | 'con') => {
    if (vote) return;
    setVote(side);
    setProPercent(side === 'pro' ? 57 : 48);
    setShowReward(true);
    setTimeout(() => setShowReward(false), 2000);
  };

  return (
    <div className="my-8 space-y-4 relative">
      {/* PRO / CON cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: 'rgba(0,212,255,0.04)',
            border: '2px solid rgba(0,212,255,0.3)',
          }}
        >
          <span className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: '#00D4FF' }}>
            PRO
          </span>
          <p className="text-sm text-slate-300 leading-relaxed">{proArgument}</p>
        </div>

        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: 'rgba(255,106,0,0.04)',
            border: '2px solid rgba(255,106,0,0.3)',
          }}
        >
          <span className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: '#FF6A00' }}>
            CON
          </span>
          <p className="text-sm text-slate-300 leading-relaxed">{conArgument}</p>
        </div>
      </div>

      {/* Vote buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleVote('pro')}
          disabled={!!vote}
          className="flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-all min-h-[44px]"
          style={{
            backgroundColor: vote === 'pro' ? '#00D4FF' : 'rgba(0,212,255,0.1)',
            color: vote === 'pro' ? '#0B0F14' : '#00D4FF',
            border: '1px solid rgba(0,212,255,0.3)',
            opacity: vote === 'con' ? 0.4 : 1,
          }}
        >
          PRO
        </button>
        <button
          type="button"
          onClick={() => handleVote('con')}
          disabled={!!vote}
          className="flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-all min-h-[44px]"
          style={{
            backgroundColor: vote === 'con' ? '#FF6A00' : 'rgba(255,106,0,0.1)',
            color: vote === 'con' ? '#0B0F14' : '#FF6A00',
            border: '1px solid rgba(255,106,0,0.3)',
            opacity: vote === 'pro' ? 0.4 : 1,
          }}
        >
          CON
        </button>
      </div>

      {/* Live vote bar */}
      {vote && (
        <div className="rounded-lg overflow-hidden h-3" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <motion.div
            className="h-full rounded-lg"
            style={{ backgroundColor: '#00D4FF' }}
            initial={{ width: '50%' }}
            animate={{ width: `${proPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>PRO {proPercent}%</span>
            <span>CON {100 - proPercent}%</span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showReward && (
          <motion.span
            className="absolute -top-4 right-0 text-sm font-bold"
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
  );
}
