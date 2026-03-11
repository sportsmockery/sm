'use client';

import React from 'react';

interface UpdateBlockProps {
  timestamp: string;
  text: string;
}

export function UpdateBlock({ timestamp, text }: UpdateBlockProps) {
  return (
    <div
      className="rounded-xl p-4 my-8 border-l-4"
      style={{
        backgroundColor: 'rgba(255,106,0,0.04)',
        borderLeftColor: '#BC0000',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
          style={{ backgroundColor: 'rgba(255,106,0,0.15)', color: '#BC0000' }}
        >
          UPDATE
        </span>
        <span className="text-xs text-slate-400">{timestamp}</span>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
    </div>
  );
}
