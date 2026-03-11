'use client';

import React from 'react';
import Image from 'next/image';

interface ScoutInsightProps {
  insight: string;
  confidence?: 'low' | 'medium' | 'high';
}

export function ScoutInsight({ insight, confidence = 'high' }: ScoutInsightProps) {
  const confidenceColors = {
    low: '#BC0000',
    medium: '#D6B05E',
    high: '#00D4FF',
  };

  return (
    <div
      className="rounded-xl p-5 my-8"
      style={{
        backgroundColor: 'rgba(0,212,255,0.04)',
        border: '1px solid rgba(0,212,255,0.15)',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <Image
          src="/downloads/scout-v2.png"
          alt="Scout AI"
          width={28}
          height={28}
          className="rounded-full"
        />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#00D4FF' }}>
          Scout AI Insight
        </span>
        <span
          className="ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${confidenceColors[confidence]}15`,
            color: confidenceColors[confidence],
          }}
        >
          {confidence} confidence
        </span>
      </div>

      <p className="text-[15px] leading-relaxed text-slate-300 italic">
        &ldquo;{insight}&rdquo;
      </p>
    </div>
  );
}
